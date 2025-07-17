-- /Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/sql/get_latest_properties_070625.sql
-- Last Modified: 07-06-2025 18:30 IST
-- Purpose: Latest properties function with coordinate extraction support
-- Updated: Added latitude and longitude extraction for all property types

-- =============================================================================
-- EXTRACTED FUNCTION DEFINITIONS WITH COORDINATE SUPPORT
-- =============================================================================

-- Function 1: extract_general_latitude (NEW)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_general_latitude(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
   RETURN COALESCE(
       -- Residential location steps
       safe_numeric(property_details->'steps'->'res_rent_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'res_sale_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'res_flat_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'res_pg_location'->>'latitude'),
       -- Commercial location steps
       safe_numeric(property_details->'steps'->'com_rent_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'com_sale_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'com_cow_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'commercial_rent_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'commercial_sale_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'commercial_coworking_location'->>'latitude'),
       -- Land location steps
       safe_numeric(property_details->'steps'->'land_sale_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'land_location'->>'latitude'),
       -- Generic location fields
       safe_numeric(property_details->'steps'->'location_details'->>'latitude'),
       safe_numeric(property_details->'location'->>'latitude'),
       safe_numeric(property_details->'coordinates'->>'lat'),
       safe_numeric(property_details->'coordinates'->>'latitude'),
       safe_numeric(property_details->'flow'->>'latitude'),
       safe_numeric(property_details->>'latitude')
   );
END;
$function$
;

-- Function 2: extract_general_longitude (NEW)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_general_longitude(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
   RETURN COALESCE(
       -- Residential location steps
       safe_numeric(property_details->'steps'->'res_rent_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'res_sale_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'res_flat_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'res_pg_location'->>'longitude'),
       -- Commercial location steps
       safe_numeric(property_details->'steps'->'com_rent_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'com_sale_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'com_cow_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'commercial_rent_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'commercial_sale_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'commercial_coworking_location'->>'longitude'),
       -- Land location steps
       safe_numeric(property_details->'steps'->'land_sale_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'land_location'->>'longitude'),
       -- Generic location fields
       safe_numeric(property_details->'steps'->'location_details'->>'longitude'),
       safe_numeric(property_details->'location'->>'longitude'),
       safe_numeric(property_details->'coordinates'->>'lng'),
       safe_numeric(property_details->'coordinates'->>'longitude'),
       safe_numeric(property_details->'flow'->>'longitude'),
       safe_numeric(property_details->>'longitude')
   );
END;
$function$
;

-- Function 3: get_latest_properties (UPDATED WITH COORDINATES)
-- -----------------------------------------------------------------------------

-- Drop existing function to update return type
DROP FUNCTION IF EXISTS public.get_latest_properties(integer);

CREATE OR REPLACE FUNCTION public.get_latest_properties(p_limit integer DEFAULT 50)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, total_count bigint, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, latitude numeric, longitude numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_total_count BIGINT;
BEGIN
    -- Validate limit parameter
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 1000 THEN
        p_limit := 50;
    END IF;

    -- Get total count of active properties
    SELECT COUNT(*) INTO v_total_count
    FROM properties_v2 p
    WHERE p.status IS DISTINCT FROM 'deleted';

    -- Return results for all property types
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
        
        -- Price (ENHANCED - includes all flatmates price paths)
        COALESCE(
            safe_numeric(p.property_details->'flow'->>'price'),
            -- Residential rent paths
            safe_numeric(p.property_details->'steps'->'res_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'res_rent_rental'->>'monthlyRent'),
            -- Residential sale paths
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'expectedPrice'),
            -- Flatmates specific paths (ADDED)
            safe_numeric(p.property_details->'steps'->'res_flat_flatmate_details'->>'rent'),
            safe_numeric(p.property_details->'steps'->'res_flat_flatmate_details'->>'monthlyRent'),
            safe_numeric(p.property_details->'steps'->'res_flat_flatmate_details'->>'rentPerMonth'),
            safe_numeric(p.property_details->'steps'->'res_flat_flatmate_details'->>'monthlyPrice'),
            -- PG/Hostel specific paths (ADDED)
            safe_numeric(p.property_details->'steps'->'res_pg_pg_details'->>'rent'),
            safe_numeric(p.property_details->'steps'->'res_pg_pg_details'->>'monthlyRent'),
            safe_numeric(p.property_details->'steps'->'res_pg_pg_details'->>'monthlyPrice'),
            -- Commercial paths
            safe_numeric(p.property_details->'steps'->'com_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'com_rent_rental'->>'monthlyRent'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'expectedPrice'),
            safe_numeric(p.property_details->'steps'->'com_cow_basic_details'->>'price'),
            safe_numeric(p.property_details->'steps'->'com_cow_basic_details'->>'monthlyPrice'),
            -- Land paths
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'price'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'expectedPrice'),
            -- Fallback paths
            safe_numeric(p.property_details->'rental'->>'rentAmount'),
            safe_numeric(p.property_details->'sale'->>'expectedPrice'),
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
            safe_numeric(p.property_details->'steps'->'res_flat_basic_details'->>'squareFootage'),
            safe_numeric(p.property_details->'steps'->'res_flat_basic_details'->>'builtUpArea'),
            safe_numeric(p.property_details->'steps'->'res_pg_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'com_rent_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'com_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area'),
            safe_numeric(p.property_details->'basicDetails'->>'area')
        ) as area,
        
        prof.email::TEXT as owner_email,
        COALESCE(p.status, 'active')::TEXT as status,
        
        -- TYPE-SPECIFIC FIELDS (4 fields)
        -- Bedrooms (only for residential) - ENHANCED to include flatmates and PG
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
                    CASE 
                        WHEN p.property_details->'steps'->'res_flat_basic_details'->>'bhkType' ~ '^[0-9]+' 
                        THEN (regexp_match(p.property_details->'steps'->'res_flat_basic_details'->>'bhkType', '^([0-9]+)'))[1]::integer
                        ELSE NULL 
                    END,
                    CASE 
                        WHEN p.property_details->'basicDetails'->>'bhkType' ~ '^[0-9]+' 
                        THEN (regexp_match(p.property_details->'basicDetails'->>'bhkType', '^([0-9]+)'))[1]::integer
                        ELSE NULL 
                    END,
                    -- Direct bedrooms fields
                    safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'bedrooms')::integer,
                    safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'bedrooms')::integer,
                    safe_numeric(p.property_details->'steps'->'res_flat_basic_details'->>'bedrooms')::integer,
                    safe_numeric(p.property_details->'steps'->'res_pg_basic_details'->>'bedrooms')::integer,
                    safe_numeric(p.property_details->'basicDetails'->>'bedrooms')::integer
                )
            ELSE NULL
        END as bedrooms,
        
        -- Bathrooms (only for residential) - ENHANCED to include flatmates and PG
        CASE 
            WHEN COALESCE(
                p.property_details->'flow'->>'flowType',
                p.property_details->>'flowType',
                'residential_rent'
            ) LIKE 'residential_%' THEN
                COALESCE(
                    safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'steps'->'res_flat_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'steps'->'res_pg_basic_details'->>'bathrooms'),
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
        
        -- Primary image (ENHANCED - more comprehensive image extraction)
        COALESCE(
            -- Check imageFiles array first (iterate to find primary)
            CASE 
                WHEN p.property_details ? 'imageFiles' AND jsonb_array_length(p.property_details->'imageFiles') > 0 THEN
                    COALESCE(
                        -- Try to find primary image in array
                        (
                            SELECT (elem->>'fileName')
                            FROM jsonb_array_elements(p.property_details->'imageFiles') elem
                            WHERE (elem->>'isPrimary')::boolean = true
                            LIMIT 1
                        ),
                        -- If no primary found, use first image
                        (p.property_details->'imageFiles'->0)->>'fileName'
                    )
                ELSE NULL 
            END,
            -- Check alternative locations
            p.property_details->'steps'->'image_upload'->>'primaryImage',
            p.property_details->'steps'->'images'->>'primaryImage',
            p.property_details->'media'->'photos'->>'primaryImage',
            p.property_details->'images'->>'primary'
        )::TEXT as primary_image,
        
        -- COORDINATE FIELDS (NEW)
        extract_general_latitude(p.property_details) as latitude,
        extract_general_longitude(p.property_details) as longitude
        
    FROM properties_v2 p
    LEFT JOIN profiles prof ON p.owner_id = prof.id
    WHERE p.status IS DISTINCT FROM 'deleted'
    ORDER BY p.created_at DESC
    LIMIT p_limit;
    
END;
$function$
;

-- =============================================================================
-- END OF FILE - 3 functions total (1 existing + 2 new coordinate functions)
-- =============================================================================