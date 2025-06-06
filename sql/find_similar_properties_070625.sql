-- /Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/sql/find_similar_properties_070625.sql
-- Last Modified: 07-06-2025 18:30 IST
-- Purpose: Similar properties functions with coordinate extraction support
-- Updated: Added latitude and longitude extraction for all property types

-- =============================================================================
-- EXTRACTED FUNCTION DEFINITIONS WITH COORDINATE SUPPORT
-- =============================================================================

-- Function 1: find_similar_properties (UPDATED WITH COORDINATES)
-- -----------------------------------------------------------------------------

-- Drop existing function to update return type
DROP FUNCTION IF EXISTS public.find_similar_properties(uuid,integer,numeric);

CREATE OR REPLACE FUNCTION public.find_similar_properties(p_property_id uuid, p_limit integer DEFAULT 10, p_min_similarity_score numeric DEFAULT 0.3)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, similarity_score numeric, similarity_factors jsonb, latitude numeric, longitude numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_target_property RECORD;
    v_target_flow_type TEXT;
    v_target_property_type TEXT;
BEGIN
    -- Validate limit parameter
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 50 THEN
        p_limit := 10;
    END IF;
    
    IF p_min_similarity_score IS NULL OR p_min_similarity_score < 0 THEN
        p_min_similarity_score := 0.3;
    END IF;

    -- Get target property details
    SELECT 
        p.id,
        p.property_details,
        -- Determine property type
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'residential_%' THEN 'residential'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'commercial_%' THEN 'commercial'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'land_%' THEN 'land'
            ELSE 'residential'
        END as target_property_type,
        COALESCE(
            p.property_details->'flow'->>'flowType',
            p.property_details->>'flowType',
            'residential_rent'
        ) as target_flow_type
    INTO v_target_property
    FROM properties_v2 p
    WHERE p.id = p_property_id AND p.status IS DISTINCT FROM 'deleted';

    -- If target property not found, return empty result
    IF v_target_property.id IS NULL THEN
        RETURN;
    END IF;

    v_target_flow_type := v_target_property.target_flow_type;
    v_target_property_type := v_target_property.target_property_type;

    -- Return similar properties based on property type
    IF v_target_property_type = 'residential' THEN
        RETURN QUERY
        SELECT * FROM find_similar_residential_properties(p_property_id, v_target_property.property_details, p_limit, p_min_similarity_score);
    ELSIF v_target_property_type = 'commercial' THEN
        RETURN QUERY
        SELECT * FROM find_similar_commercial_properties(p_property_id, v_target_property.property_details, p_limit, p_min_similarity_score);
    ELSIF v_target_property_type = 'land' THEN
        RETURN QUERY
        SELECT * FROM find_similar_land_properties(p_property_id, v_target_property.property_details, p_limit, p_min_similarity_score);
    END IF;
END;
$function$
;

-- Function 2: find_similar_residential_properties (UPDATED WITH COORDINATES)
-- -----------------------------------------------------------------------------

-- Drop existing function to update return type
DROP FUNCTION IF EXISTS public.find_similar_residential_properties(uuid,jsonb,integer,numeric);

CREATE OR REPLACE FUNCTION public.find_similar_residential_properties(p_property_id uuid, p_target_details jsonb, p_limit integer, p_min_similarity_score numeric)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, similarity_score numeric, similarity_factors jsonb, latitude numeric, longitude numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_target_flow_type TEXT;
    v_target_city TEXT;
    v_target_state TEXT;
    v_target_price NUMERIC;
    v_target_bedrooms INTEGER;
    v_target_bathrooms NUMERIC;
    v_target_area NUMERIC;
BEGIN
    -- Extract target property attributes using existing helper functions
    v_target_flow_type := extract_residential_flow_type(p_target_details);
    v_target_city := extract_residential_city(p_target_details);
    v_target_state := extract_residential_state(p_target_details);
    v_target_price := extract_residential_price(p_target_details);
    v_target_bedrooms := extract_residential_bedrooms(p_target_details);
    v_target_bathrooms := extract_residential_bathrooms(p_target_details);
    v_target_area := extract_residential_area(p_target_details);

    RETURN QUERY
    WITH similarity_calc AS (
        SELECT 
            p.*,
            prof.email as owner_email,
            -- Calculate similarity score (0-1 scale)
            (
                -- Flow type match (weight: 25%)
                CASE WHEN extract_residential_flow_type(p.property_details) = v_target_flow_type THEN 0.25 ELSE 0 END +
                
                -- Location match (weight: 20%)
                CASE 
                    WHEN extract_residential_city(p.property_details) = v_target_city THEN 0.20
                    WHEN extract_residential_state(p.property_details) = v_target_state THEN 0.10
                    ELSE 0 
                END +
                
                -- Price similarity (weight: 20%)
                CASE 
                    WHEN v_target_price IS NOT NULL AND extract_residential_price(p.property_details) IS NOT NULL THEN
                        GREATEST(0, 0.20 - (0.20 * ABS(extract_residential_price(p.property_details) - v_target_price) / GREATEST(v_target_price, 1)))
                    ELSE 0.10 -- Small bonus if both prices are null
                END +
                
                -- Bedrooms match (weight: 15%)
                CASE 
                    WHEN v_target_bedrooms IS NOT NULL AND extract_residential_bedrooms(p.property_details) IS NOT NULL THEN
                        CASE 
                            WHEN extract_residential_bedrooms(p.property_details) = v_target_bedrooms THEN 0.15
                            WHEN ABS(extract_residential_bedrooms(p.property_details) - v_target_bedrooms) = 1 THEN 0.10
                            WHEN ABS(extract_residential_bedrooms(p.property_details) - v_target_bedrooms) = 2 THEN 0.05
                            ELSE 0
                        END
                    ELSE 0.05 -- Small bonus if both bedrooms are null
                END +
                
                -- Area similarity (weight: 10%)
                CASE 
                    WHEN v_target_area IS NOT NULL AND extract_residential_area(p.property_details) IS NOT NULL THEN
                        GREATEST(0, 0.10 - (0.10 * ABS(extract_residential_area(p.property_details) - v_target_area) / GREATEST(v_target_area, 1)))
                    ELSE 0.05 -- Small bonus if both areas are null
                END +
                
                -- Bathrooms similarity (weight: 10%)
                CASE 
                    WHEN v_target_bathrooms IS NOT NULL AND extract_residential_bathrooms(p.property_details) IS NOT NULL THEN
                        CASE 
                            WHEN extract_residential_bathrooms(p.property_details) = v_target_bathrooms THEN 0.10
                            WHEN ABS(extract_residential_bathrooms(p.property_details) - v_target_bathrooms) <= 1 THEN 0.05
                            ELSE 0
                        END
                    ELSE 0.05 -- Small bonus if both bathrooms are null
                END
            ) as calculated_similarity_score,
            
            -- Store similarity factors for debugging
            jsonb_build_object(
                'flow_type_match', extract_residential_flow_type(p.property_details) = v_target_flow_type,
                'city_match', extract_residential_city(p.property_details) = v_target_city,
                'state_match', extract_residential_state(p.property_details) = v_target_state,
                'price_diff_percent', 
                    CASE 
                        WHEN v_target_price IS NOT NULL AND extract_residential_price(p.property_details) IS NOT NULL THEN
                            ROUND((ABS(extract_residential_price(p.property_details) - v_target_price) / GREATEST(v_target_price, 1) * 100)::NUMERIC, 2)
                        ELSE NULL 
                    END,
                'bedrooms_diff', 
                    CASE 
                        WHEN v_target_bedrooms IS NOT NULL AND extract_residential_bedrooms(p.property_details) IS NOT NULL THEN
                            extract_residential_bedrooms(p.property_details) - v_target_bedrooms
                        ELSE NULL 
                    END,
                'area_diff_percent',
                    CASE 
                        WHEN v_target_area IS NOT NULL AND extract_residential_area(p.property_details) IS NOT NULL THEN
                            ROUND((ABS(extract_residential_area(p.property_details) - v_target_area) / GREATEST(v_target_area, 1) * 100)::NUMERIC, 2)
                        ELSE NULL 
                    END
            ) as similarity_factors
        FROM properties_v2 p
        LEFT JOIN profiles prof ON p.owner_id = prof.id
        WHERE p.status IS DISTINCT FROM 'deleted'
          AND p.id != p_property_id  -- Exclude the target property itself
          AND extract_residential_flow_type(p.property_details) LIKE 'residential_%'
          -- Basic filters for performance
          AND (v_target_state IS NULL OR extract_residential_state(p.property_details) = v_target_state)
          AND (v_target_price IS NULL OR extract_residential_price(p.property_details) BETWEEN v_target_price * 0.5 AND v_target_price * 2.0)
    )
    SELECT 
        sc.id,
        sc.owner_id,
        sc.created_at,
        sc.updated_at,
        'residential'::TEXT as property_type,
        extract_residential_flow_type(sc.property_details)::TEXT as flow_type,
        flow_type_to_subtype(extract_residential_flow_type(sc.property_details))::TEXT as subtype,
        extract_residential_title(sc.property_details)::TEXT as title,
        extract_residential_price(sc.property_details) as price,
        extract_residential_city(sc.property_details)::TEXT as city,
        extract_residential_state(sc.property_details)::TEXT as state,
        extract_residential_area(sc.property_details) as area,
        sc.owner_email::TEXT,
        COALESCE(sc.status, 'active')::TEXT as status,
        extract_residential_bedrooms(sc.property_details) as bedrooms,
        extract_residential_bathrooms(sc.property_details) as bathrooms,
        'sq_ft'::TEXT as area_unit,
        NULL::TEXT as land_type,
        extract_residential_primary_image(sc.property_details)::TEXT as primary_image,
        ROUND(sc.calculated_similarity_score::NUMERIC, 3) as similarity_score,
        sc.similarity_factors,
        -- COORDINATE FIELDS (NEW)
        extract_residential_latitude(sc.property_details) as latitude,
        extract_residential_longitude(sc.property_details) as longitude
    FROM similarity_calc sc
    WHERE sc.calculated_similarity_score >= p_min_similarity_score
    ORDER BY sc.calculated_similarity_score DESC, sc.created_at DESC
    LIMIT p_limit;
END;
$function$
;

-- Function 3: find_similar_commercial_properties (UPDATED WITH COORDINATES)
-- -----------------------------------------------------------------------------

-- Drop existing function to update return type
DROP FUNCTION IF EXISTS public.find_similar_commercial_properties(uuid,jsonb,integer,numeric);

CREATE OR REPLACE FUNCTION public.find_similar_commercial_properties(p_property_id uuid, p_target_details jsonb, p_limit integer, p_min_similarity_score numeric)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, similarity_score numeric, similarity_factors jsonb, latitude numeric, longitude numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_target_flow_type TEXT;
    v_target_city TEXT;
    v_target_state TEXT;
    v_target_price NUMERIC;
    v_target_area NUMERIC;
    v_target_property_type TEXT;
BEGIN
    -- Extract target property attributes using existing helper functions
    v_target_flow_type := extract_commercial_flow_type(p_target_details);
    v_target_city := extract_commercial_city(p_target_details);
    v_target_state := extract_commercial_state(p_target_details);
    v_target_price := extract_commercial_price(p_target_details);
    v_target_area := extract_commercial_area(p_target_details);
    v_target_property_type := extract_commercial_property_type(p_target_details);

    RETURN QUERY
    WITH similarity_calc AS (
        SELECT 
            p.*,
            prof.email as owner_email,
            -- Calculate similarity score (0-1 scale)
            (
                -- Flow type match (weight: 30%)
                CASE WHEN extract_commercial_flow_type(p.property_details) = v_target_flow_type THEN 0.30 ELSE 0 END +
                
                -- Location match (weight: 25%)
                CASE 
                    WHEN extract_commercial_city(p.property_details) = v_target_city THEN 0.25
                    WHEN extract_commercial_state(p.property_details) = v_target_state THEN 0.15
                    ELSE 0 
                END +
                
                -- Price similarity (weight: 25%)
                CASE 
                    WHEN v_target_price IS NOT NULL AND extract_commercial_price(p.property_details) IS NOT NULL THEN
                        GREATEST(0, 0.25 - (0.25 * ABS(extract_commercial_price(p.property_details) - v_target_price) / GREATEST(v_target_price, 1)))
                    ELSE 0.10 -- Small bonus if both prices are null
                END +
                
                -- Area similarity (weight: 15%)
                CASE 
                    WHEN v_target_area IS NOT NULL AND extract_commercial_area(p.property_details) IS NOT NULL THEN
                        GREATEST(0, 0.15 - (0.15 * ABS(extract_commercial_area(p.property_details) - v_target_area) / GREATEST(v_target_area, 1)))
                    ELSE 0.05 -- Small bonus if both areas are null
                END +
                
                -- Property type match (weight: 5%)
                CASE WHEN extract_commercial_property_type(p.property_details) = v_target_property_type THEN 0.05 ELSE 0 END
            ) as calculated_similarity_score,
            
            -- Store similarity factors for debugging
            jsonb_build_object(
                'flow_type_match', extract_commercial_flow_type(p.property_details) = v_target_flow_type,
                'city_match', extract_commercial_city(p.property_details) = v_target_city,
                'state_match', extract_commercial_state(p.property_details) = v_target_state,
                'property_type_match', extract_commercial_property_type(p.property_details) = v_target_property_type,
                'price_diff_percent', 
                    CASE 
                        WHEN v_target_price IS NOT NULL AND extract_commercial_price(p.property_details) IS NOT NULL THEN
                            ROUND((ABS(extract_commercial_price(p.property_details) - v_target_price) / GREATEST(v_target_price, 1) * 100)::NUMERIC, 2)
                        ELSE NULL 
                    END,
                'area_diff_percent',
                    CASE 
                        WHEN v_target_area IS NOT NULL AND extract_commercial_area(p.property_details) IS NOT NULL THEN
                            ROUND((ABS(extract_commercial_area(p.property_details) - v_target_area) / GREATEST(v_target_area, 1) * 100)::NUMERIC, 2)
                        ELSE NULL 
                    END
            ) as similarity_factors
        FROM properties_v2 p
        LEFT JOIN profiles prof ON p.owner_id = prof.id
        WHERE p.status IS DISTINCT FROM 'deleted'
          AND p.id != p_property_id  -- Exclude the target property itself
          AND extract_commercial_flow_type(p.property_details) IN ('commercial_rent', 'commercial_sale', 'commercial_coworking')
          -- Basic filters for performance
          AND (v_target_state IS NULL OR extract_commercial_state(p.property_details) = v_target_state)
          AND (v_target_price IS NULL OR extract_commercial_price(p.property_details) BETWEEN v_target_price * 0.5 AND v_target_price * 2.0)
    )
    SELECT 
        sc.id,
        sc.owner_id,
        sc.created_at,
        sc.updated_at,
        'commercial'::TEXT as property_type,
        extract_commercial_flow_type(sc.property_details)::TEXT as flow_type,
        commercial_flow_type_to_subtype(extract_commercial_flow_type(sc.property_details))::TEXT as subtype,
        extract_commercial_title(sc.property_details)::TEXT as title,
        extract_commercial_price(sc.property_details) as price,
        extract_commercial_city(sc.property_details)::TEXT as city,
        extract_commercial_state(sc.property_details)::TEXT as state,
        extract_commercial_area(sc.property_details) as area,
        sc.owner_email::TEXT,
        COALESCE(sc.status, 'active')::TEXT as status,
        NULL::INTEGER as bedrooms,
        NULL::NUMERIC as bathrooms,
        'sq_ft'::TEXT as area_unit,
        NULL::TEXT as land_type,
        extract_commercial_primary_image(sc.property_details)::TEXT as primary_image,
        ROUND(sc.calculated_similarity_score::NUMERIC, 3) as similarity_score,
        sc.similarity_factors,
        -- COORDINATE FIELDS (NEW)
        extract_commercial_latitude(sc.property_details) as latitude,
        extract_commercial_longitude(sc.property_details) as longitude
    FROM similarity_calc sc
    WHERE sc.calculated_similarity_score >= p_min_similarity_score
    ORDER BY sc.calculated_similarity_score DESC, sc.created_at DESC
    LIMIT p_limit;
END;
$function$
;

-- Function 4: find_similar_land_properties (UPDATED WITH COORDINATES)
-- -----------------------------------------------------------------------------

-- Drop existing function to update return type
DROP FUNCTION IF EXISTS public.find_similar_land_properties(uuid,jsonb,integer,numeric);

CREATE OR REPLACE FUNCTION public.find_similar_land_properties(p_property_id uuid, p_target_details jsonb, p_limit integer, p_min_similarity_score numeric)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, similarity_score numeric, similarity_factors jsonb, latitude numeric, longitude numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_target_flow_type TEXT;
    v_target_city TEXT;
    v_target_state TEXT;
    v_target_price NUMERIC;
    v_target_area NUMERIC;
    v_target_land_type TEXT;
    v_target_area_unit TEXT;
BEGIN
    -- Extract target property attributes using existing helper functions
    v_target_flow_type := extract_land_flow_type(p_target_details);
    v_target_city := extract_land_city(p_target_details);
    v_target_state := extract_land_state(p_target_details);
    v_target_price := extract_land_price(p_target_details);
    v_target_area := extract_land_area(p_target_details);
    v_target_land_type := extract_land_type(p_target_details);
    v_target_area_unit := extract_land_area_unit(p_target_details);

    RETURN QUERY
    WITH similarity_calc AS (
        SELECT 
            p.*,
            prof.email as owner_email,
            -- Calculate similarity score (0-1 scale)
            (
                -- Flow type match (weight: 25%)
                CASE WHEN extract_land_flow_type(p.property_details) = v_target_flow_type THEN 0.25 ELSE 0 END +
                
                -- Location match (weight: 25%)
                CASE 
                    WHEN extract_land_city(p.property_details) = v_target_city THEN 0.25
                    WHEN extract_land_state(p.property_details) = v_target_state THEN 0.15
                    ELSE 0 
                END +
                
                -- Price similarity (weight: 25%)
                CASE 
                    WHEN v_target_price IS NOT NULL AND extract_land_price(p.property_details) IS NOT NULL THEN
                        GREATEST(0, 0.25 - (0.25 * ABS(extract_land_price(p.property_details) - v_target_price) / GREATEST(v_target_price, 1)))
                    ELSE 0.10 -- Small bonus if both prices are null
                END +
                
                -- Area similarity (weight: 15%)
                CASE 
                    WHEN v_target_area IS NOT NULL AND extract_land_area(p.property_details) IS NOT NULL THEN
                        GREATEST(0, 0.15 - (0.15 * ABS(extract_land_area(p.property_details) - v_target_area) / GREATEST(v_target_area, 1)))
                    ELSE 0.05 -- Small bonus if both areas are null
                END +
                
                -- Land type match (weight: 10%)
                CASE WHEN extract_land_type(p.property_details) = v_target_land_type THEN 0.10 ELSE 0 END
            ) as calculated_similarity_score,
            
            -- Store similarity factors for debugging
            jsonb_build_object(
                'flow_type_match', extract_land_flow_type(p.property_details) = v_target_flow_type,
                'city_match', extract_land_city(p.property_details) = v_target_city,
                'state_match', extract_land_state(p.property_details) = v_target_state,
                'land_type_match', extract_land_type(p.property_details) = v_target_land_type,
                'price_diff_percent', 
                    CASE 
                        WHEN v_target_price IS NOT NULL AND extract_land_price(p.property_details) IS NOT NULL THEN
                            ROUND((ABS(extract_land_price(p.property_details) - v_target_price) / GREATEST(v_target_price, 1) * 100)::NUMERIC, 2)
                        ELSE NULL 
                    END,
                'area_diff_percent',
                    CASE 
                        WHEN v_target_area IS NOT NULL AND extract_land_area(p.property_details) IS NOT NULL THEN
                            ROUND((ABS(extract_land_area(p.property_details) - v_target_area) / GREATEST(v_target_area, 1) * 100)::NUMERIC, 2)
                        ELSE NULL 
                    END
            ) as similarity_factors
        FROM properties_v2 p
        LEFT JOIN profiles prof ON p.owner_id = prof.id
        WHERE p.status IS DISTINCT FROM 'deleted'
          AND p.id != p_property_id  -- Exclude the target property itself
          AND (extract_land_flow_type(p.property_details) = 'land_sale' OR extract_land_flow_type(p.property_details) LIKE '%land%')
          -- Basic filters for performance
          AND (v_target_state IS NULL OR extract_land_state(p.property_details) = v_target_state)
          AND (v_target_price IS NULL OR extract_land_price(p.property_details) BETWEEN v_target_price * 0.5 AND v_target_price * 2.0)
    )
    SELECT 
        sc.id,
        sc.owner_id,
        sc.created_at,
        sc.updated_at,
        'land'::TEXT as property_type,
        extract_land_flow_type(sc.property_details)::TEXT as flow_type,
        land_flow_type_to_subtype(extract_land_flow_type(sc.property_details))::TEXT as subtype,
        extract_land_title(sc.property_details)::TEXT as title,
        extract_land_price(sc.property_details) as price,
        extract_land_city(sc.property_details)::TEXT as city,
        extract_land_state(sc.property_details)::TEXT as state,
        extract_land_area(sc.property_details) as area,
        sc.owner_email::TEXT,
        COALESCE(sc.status, 'active')::TEXT as status,
        NULL::INTEGER as bedrooms,
        NULL::NUMERIC as bathrooms,
        extract_land_area_unit(sc.property_details)::TEXT as area_unit,
        extract_land_type(sc.property_details)::TEXT as land_type,
        extract_land_primary_image(sc.property_details)::TEXT as primary_image,
        ROUND(sc.calculated_similarity_score::NUMERIC, 3) as similarity_score,
        sc.similarity_factors,
        -- COORDINATE FIELDS (NEW)
        extract_land_latitude(sc.property_details) as latitude,
        extract_land_longitude(sc.property_details) as longitude
    FROM similarity_calc sc
    WHERE sc.calculated_similarity_score >= p_min_similarity_score
    ORDER BY sc.calculated_similarity_score DESC, sc.created_at DESC
    LIMIT p_limit;
END;
$function$
;

-- =============================================================================
-- END OF FILE - 4 functions updated with coordinate support
-- =============================================================================