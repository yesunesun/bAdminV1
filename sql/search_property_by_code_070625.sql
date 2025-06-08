-- /Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/sql/search_property_by_code_070625.sql
-- Last Modified: 07-06-2025 01:00 IST
-- Purpose: Latest function definitions extracted from database
-- Generated from: /Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/sql/search_property_by_code.sql

-- =============================================================================
-- EXTRACTED FUNCTION DEFINITIONS
-- =============================================================================

-- Function 1: search_property_by_code
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_property_by_code(p_code text)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, total_count bigint, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_total_count BIGINT;
BEGIN
    -- Validate input
    IF p_code IS NULL OR trim(p_code) = '' THEN
        RAISE EXCEPTION 'Property code cannot be null or empty';
    END IF;

    -- Get total count of matching properties
    SELECT COUNT(*) INTO v_total_count
    FROM properties_v2 p
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND p.property_details->'meta'->>'code' = p_code;

    -- Return results for matching properties
    RETURN QUERY
    SELECT 
        -- MANDATORY CORE (8 fields)
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        
        -- Determine property type based on flow_type
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
        END::TEXT as property_type,
        
        -- Flow type
        COALESCE(
            p.property_details->'flow'->>'flowType',
            p.property_details->>'flowType',
            'residential_rent'
        )::TEXT as flow_type,
        
        -- Subtype based on flow type
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_rent' THEN 'rent'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_sale' THEN 'sale'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_flatmates' THEN 'flatmates'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'residential_pghostel' THEN 'pghostel'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'commercial_rent' THEN 'rent'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'commercial_sale' THEN 'sale'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'commercial_coworking' THEN 'coworking'
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) = 'land_sale' THEN 'sale'
            ELSE 'rent'
        END::TEXT as subtype,
        
        v_total_count as total_count,
        
        -- COMMON FIELDS (7 fields)
        -- Title (works for all property types)
        COALESCE(
            p.property_details->'flow'->>'title',
            p.property_details->'steps'->'res_rent_basic_details'->>'title',
            p.property_details->'steps'->'res_sale_basic_details'->>'title',
            p.property_details->'steps'->'res_flat_basic_details'->>'title',
            p.property_details->'steps'->'res_pg_basic_details'->>'title',
            p.property_details->'steps'->'com_rent_basic_details'->>'title',
            p.property_details->'steps'->'com_sale_basic_details'->>'title',
            p.property_details->'steps'->'com_cow_basic_details'->>'title',
            p.property_details->'steps'->'land_sale_basic_details'->>'title',
            p.property_details->'steps'->'land_basic_details'->>'title',
            p.property_details->'basicDetails'->>'title',
            'Property'
        )::TEXT as title,
        
        -- Price (works for all property types)
        COALESCE(
            safe_numeric(p.property_details->'flow'->>'price'),
            safe_numeric(p.property_details->'steps'->'res_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'expectedPrice'),
            safe_numeric(p.property_details->'steps'->'com_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'expectedPrice'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'price'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'salePrice'),
            safe_numeric(p.property_details->>'price')
        ) as price,
        
        -- City (works for all property types)
        COALESCE(
            p.property_details->'steps'->'res_rent_location'->>'city',
            p.property_details->'steps'->'res_sale_location'->>'city',
            p.property_details->'steps'->'res_flat_location'->>'city',
            p.property_details->'steps'->'res_pg_location'->>'city',
            p.property_details->'steps'->'com_rent_location'->>'city',
            p.property_details->'steps'->'com_sale_location'->>'city',
            p.property_details->'steps'->'com_cow_location'->>'city',
            p.property_details->'steps'->'land_sale_location'->>'city',
            p.property_details->'steps'->'land_location'->>'city',
            p.property_details->'location'->>'city'
        )::TEXT as city,
        
        -- State (works for all property types)
        COALESCE(
            p.property_details->'steps'->'res_rent_location'->>'state',
            p.property_details->'steps'->'res_sale_location'->>'state',
            p.property_details->'steps'->'res_flat_location'->>'state',
            p.property_details->'steps'->'res_pg_location'->>'state',
            p.property_details->'steps'->'com_rent_location'->>'state',
            p.property_details->'steps'->'com_sale_location'->>'state',
            p.property_details->'steps'->'com_cow_location'->>'state',
            p.property_details->'steps'->'land_sale_location'->>'state',
            p.property_details->'steps'->'land_location'->>'state',
            p.property_details->'location'->>'state'
        )::TEXT as state,
        
        -- Area (works for all property types)
        COALESCE(
            safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'squareFootage'),
            safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'builtUpArea'),
            safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'squareFootage'),
            safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'builtUpArea'),
            safe_numeric(p.property_details->'steps'->'com_rent_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'com_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area'),
            safe_numeric(p.property_details->'basicDetails'->>'area')
        ) as area,
        
        prof.email::TEXT as owner_email,
        COALESCE(p.status, 'active')::TEXT as status,
        
        -- TYPE-SPECIFIC FIELDS (4 fields)
        -- Bedrooms (only for residential)
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'residential_%' THEN
                COALESCE(
                    -- Extract from bhkType format (e.g., "2 BHK")
                    CASE 
                        WHEN p.property_details->'steps'->'res_rent_basic_details'->>'bhkType' ~ '^[0-9]+' 
                        THEN (regexp_match(p.property_details->'steps'->'res_rent_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
                        ELSE NULL 
                    END,
                    CASE 
                        WHEN p.property_details->'steps'->'res_sale_basic_details'->>'bhkType' ~ '^[0-9]+' 
                        THEN (regexp_match(p.property_details->'steps'->'res_sale_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
                        ELSE NULL 
                    END,
                    safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'bedrooms')::integer,
                    safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'bedrooms')::integer
                )
            ELSE NULL
        END as bedrooms,
        
        -- Bathrooms (only for residential)
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'residential_%' THEN
                COALESCE(
                    safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'basicDetails'->>'bathrooms')
                )
            ELSE NULL
        END as bathrooms,
        
        -- Area unit
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'land_%' THEN
                COALESCE(
                    p.property_details->'steps'->'land_sale_basic_details'->>'areaUnit',
                    p.property_details->'steps'->'land_basic_details'->>'areaUnit',
                    'sq_ft'
                )
            ELSE 'sq_ft'
        END::TEXT as area_unit,
        
        -- Land type (only for land properties)
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'land_%' THEN
                COALESCE(
                    p.property_details->'steps'->'land_sale_basic_details'->>'landType',
                    p.property_details->'steps'->'land_basic_details'->>'landType',
                    p.property_details->'basicDetails'->>'landType',
                    'agricultural'
                )
            ELSE NULL
        END::TEXT as land_type,
        
        -- Primary image (works for all property types)
        COALESCE(
            -- Check imageFiles array first
            CASE 
                WHEN p.property_details ? 'imageFiles' AND jsonb_array_length(p.property_details->'imageFiles') > 0 THEN
                    (p.property_details->'imageFiles'->0)->>'fileName'
                ELSE NULL 
            END,
            -- Check alternative locations
            p.property_details->'steps'->'image_upload'->>'primaryImage',
            p.property_details->'steps'->'images'->>'primaryImage',
            p.property_details->'media'->'photos'->>'primaryImage',
            p.property_details->'images'->>'primary'
        )::TEXT as primary_image,
        
        -- Property code from meta
        p.property_details->'meta'->>'code'::TEXT as code
        
    FROM properties_v2 p
    LEFT JOIN profiles prof ON p.owner_id = prof.id
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND p.property_details->'meta'->>'code' = p_code
    ORDER BY p.created_at DESC;
    
END;
$function$
;

-- Function 2: search_property_by_code_insensitive
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.search_property_by_code_insensitive(p_code text)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, total_count bigint, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, code text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Validate input
    IF p_code IS NULL OR trim(p_code) = '' THEN
        RAISE EXCEPTION 'Property code cannot be null or empty';
    END IF;

    -- Call the main function with uppercase code for case-insensitive search
    RETURN QUERY
    SELECT * FROM search_property_by_code(UPPER(trim(p_code)));
    
END;
$function$
;

-- =============================================================================
-- END OF FILE - 2 functions extracted
-- =============================================================================
