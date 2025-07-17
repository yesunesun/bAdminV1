-- /Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/sql/search_commercial_properties_refactored_070625.sql
-- Last Modified: 07-06-2025 18:30 IST
-- Purpose: Commercial property search functions with coordinate extraction support
-- Updated: Added latitude and longitude extraction for commercial properties

-- =============================================================================
-- EXTRACTED FUNCTION DEFINITIONS WITH COORDINATE SUPPORT
-- =============================================================================

-- Function 1: extract_commercial_price
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_price(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN COALESCE(
        safe_numeric(property_details->'flow'->>'price'),
        safe_numeric(property_details->'steps'->'com_rent_rental'->>'rentAmount'),
        safe_numeric(property_details->'steps'->'com_rent_rental'->>'monthlyRent'),
        safe_numeric(property_details->'steps'->'com_sale_sale_details'->>'salePrice'),
        safe_numeric(property_details->'steps'->'com_sale_sale_details'->>'expectedPrice'),
        safe_numeric(property_details->'steps'->'com_cow_basic_details'->>'price'),
        safe_numeric(property_details->'steps'->'com_cow_basic_details'->>'monthlyPrice'),
        safe_numeric(property_details->'steps'->'commercial_rent_rental'->>'rentAmount'),
        safe_numeric(property_details->'steps'->'commercial_rent_rental'->>'monthlyRent'),
        safe_numeric(property_details->'steps'->'commercial_sale_sale_details'->>'salePrice'),
        safe_numeric(property_details->'steps'->'commercial_sale_sale_details'->>'expectedPrice'),
        safe_numeric(property_details->'steps'->'commercial_coworking_basic_details'->>'price'),
        safe_numeric(property_details->'steps'->'commercial_coworking_basic_details'->>'monthlyPrice'),
        safe_numeric(property_details->'rental'->>'rentAmount'),
        safe_numeric(property_details->'sale'->>'salePrice'),
        safe_numeric(property_details->'sale'->>'expectedPrice'),
        safe_numeric(property_details->>'price')
    );
END;
$function$
;

-- Function 2: extract_commercial_title
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_title(property_details jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN COALESCE(
        property_details->'flow'->>'title',
        property_details->'steps'->'com_rent_basic_details'->>'title',
        property_details->'steps'->'com_sale_basic_details'->>'title',
        property_details->'steps'->'com_cow_basic_details'->>'title',
        property_details->'steps'->'commercial_rent_basic_details'->>'title',
        property_details->'steps'->'commercial_sale_basic_details'->>'title',
        property_details->'steps'->'commercial_coworking_basic_details'->>'title',
        property_details->'basicDetails'->>'title',
        'Commercial Property'
    );
END;
$function$
;

-- Function 3: extract_commercial_city
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_city(property_details jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN COALESCE(
        property_details->'steps'->'com_rent_location'->>'city',
        property_details->'steps'->'com_sale_location'->>'city',
        property_details->'steps'->'com_cow_location'->>'city',
        property_details->'steps'->'commercial_rent_location'->>'city',
        property_details->'steps'->'commercial_sale_location'->>'city',
        property_details->'steps'->'commercial_coworking_location'->>'city',
        property_details->'steps'->'location_details'->>'city',
        property_details->'location'->>'city'
    );
END;
$function$
;

-- Function 4: extract_commercial_state
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_state(property_details jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN COALESCE(
        property_details->'steps'->'com_rent_location'->>'state',
        property_details->'steps'->'com_sale_location'->>'state',
        property_details->'steps'->'com_cow_location'->>'state',
        property_details->'steps'->'commercial_rent_location'->>'state',
        property_details->'steps'->'commercial_sale_location'->>'state',
        property_details->'steps'->'commercial_coworking_location'->>'state',
        property_details->'steps'->'location_details'->>'state',
        property_details->'location'->>'state'
    );
END;
$function$
;

-- Function 5: extract_commercial_area
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_area(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN COALESCE(
        safe_numeric(property_details->'steps'->'com_rent_basic_details'->>'area'),
        safe_numeric(property_details->'steps'->'com_rent_basic_details'->>'totalArea'),
        safe_numeric(property_details->'steps'->'com_rent_basic_details'->>'floorArea'),
        safe_numeric(property_details->'steps'->'com_sale_basic_details'->>'area'),
        safe_numeric(property_details->'steps'->'com_sale_basic_details'->>'totalArea'),
        safe_numeric(property_details->'steps'->'com_sale_basic_details'->>'floorArea'),
        safe_numeric(property_details->'steps'->'com_cow_basic_details'->>'area'),
        safe_numeric(property_details->'steps'->'com_cow_basic_details'->>'totalArea'),
        safe_numeric(property_details->'steps'->'commercial_rent_basic_details'->>'area'),
        safe_numeric(property_details->'steps'->'commercial_rent_basic_details'->>'totalArea'),
        safe_numeric(property_details->'steps'->'commercial_sale_basic_details'->>'area'),
        safe_numeric(property_details->'steps'->'commercial_sale_basic_details'->>'totalArea'),
        safe_numeric(property_details->'steps'->'commercial_coworking_basic_details'->>'area'),
        safe_numeric(property_details->'steps'->'commercial_coworking_basic_details'->>'totalArea'),
        safe_numeric(property_details->'basicDetails'->>'area'),
        safe_numeric(property_details->'basicDetails'->>'totalArea')
    );
END;
$function$
;

-- Function 6: extract_commercial_flow_type
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_flow_type(property_details jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN COALESCE(
        property_details->'flow'->>'flowType',
        property_details->>'flowType',
        property_details->>'flow_type',
        property_details->'meta'->>'flow_type',
        'commercial_rent'
    );
END;
$function$
;

-- Function 7: extract_commercial_property_type
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_property_type(property_details jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN COALESCE(
        property_details->'steps'->'com_rent_basic_details'->>'propertyType',
        property_details->'steps'->'com_sale_basic_details'->>'propertyType',
        property_details->'steps'->'com_cow_basic_details'->>'propertyType',
        property_details->'steps'->'commercial_rent_basic_details'->>'propertyType',
        property_details->'steps'->'commercial_sale_basic_details'->>'propertyType',
        property_details->'steps'->'commercial_coworking_basic_details'->>'propertyType',
        property_details->'basicDetails'->>'propertyType'
    );
END;
$function$
;

-- Function 8: extract_commercial_primary_image
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_primary_image(property_details jsonb)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
    image_file JSONB;
    primary_filename TEXT;
BEGIN
    -- Check if imageFiles array exists and has elements
    IF property_details ? 'imageFiles' AND jsonb_array_length(property_details->'imageFiles') > 0 THEN
        -- Iterate through imageFiles array to find the primary image
        FOR image_file IN SELECT jsonb_array_elements(property_details->'imageFiles')
        LOOP
            -- Check if this image is marked as primary
            IF (image_file->>'isPrimary')::boolean = true THEN
                primary_filename := image_file->>'fileName';
                EXIT; -- Found primary image, exit loop
            END IF;
        END LOOP;
        
        -- If no primary image found, return the first image filename
        IF primary_filename IS NULL THEN
            primary_filename := (property_details->'imageFiles'->0)->>'fileName';
        END IF;
    END IF;
    
    -- Check alternative image storage locations
    IF primary_filename IS NULL THEN
        primary_filename := COALESCE(
            property_details->'steps'->'image_upload'->>'primaryImage',
            property_details->'steps'->'images'->>'primaryImage',
            property_details->'media'->'photos'->>'primaryImage',
            property_details->'images'->>'primary'
        );
    END IF;
    
    RETURN primary_filename;
END;
$function$
;

-- Function 9: commercial_flow_type_to_subtype
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.commercial_flow_type_to_subtype(flow_type text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN CASE 
        WHEN flow_type = 'commercial_rent' THEN 'rent'
        WHEN flow_type = 'commercial_sale' THEN 'sale'
        WHEN flow_type = 'commercial_coworking' THEN 'coworking'
        ELSE 'rent'
    END;
END;
$function$
;

-- Function 10: matches_commercial_subtype
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.matches_commercial_subtype(property_details jsonb, p_subtype text)
 RETURNS boolean
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
DECLARE
    flow_type TEXT;
BEGIN
    IF p_subtype IS NULL THEN
        RETURN TRUE;
    END IF;
    
    flow_type := extract_commercial_flow_type(property_details);
    
    RETURN CASE 
        WHEN p_subtype = 'rent' THEN flow_type = 'commercial_rent'
        WHEN p_subtype = 'sale' THEN flow_type = 'commercial_sale'
        WHEN p_subtype = 'coworking' THEN flow_type = 'commercial_coworking'
        ELSE TRUE
    END;
END;
$function$
;

-- Function 11: extract_commercial_latitude (NEW)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_latitude(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
   RETURN COALESCE(
       safe_numeric(property_details->'steps'->'com_rent_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'com_sale_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'com_cow_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'commercial_rent_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'commercial_sale_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'commercial_coworking_location'->>'latitude'),
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

-- Function 12: extract_commercial_longitude (NEW)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.extract_commercial_longitude(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
   RETURN COALESCE(
       safe_numeric(property_details->'steps'->'com_rent_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'com_sale_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'com_cow_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'commercial_rent_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'commercial_sale_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'commercial_coworking_location'->>'longitude'),
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

-- Function 13: search_commercial_properties (UPDATED WITH COORDINATES)
-- -----------------------------------------------------------------------------

-- Drop existing function to update return type
DROP FUNCTION IF EXISTS public.search_commercial_properties(text,text,text,numeric,numeric,text,text,numeric,numeric,integer,integer);

CREATE OR REPLACE FUNCTION public.search_commercial_properties(p_subtype text DEFAULT NULL::text, p_property_subtype text DEFAULT NULL::text, p_search_query text DEFAULT NULL::text, p_min_price numeric DEFAULT NULL::numeric, p_max_price numeric DEFAULT NULL::numeric, p_city text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_area_min numeric DEFAULT NULL::numeric, p_area_max numeric DEFAULT NULL::numeric, p_limit integer DEFAULT 50, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, owner_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, property_type text, flow_type text, subtype text, total_count bigint, title text, price numeric, city text, state text, area numeric, owner_email text, status text, bedrooms integer, bathrooms numeric, area_unit text, land_type text, primary_image text, latitude numeric, longitude numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_total_count BIGINT;
BEGIN
    -- Validate parameters
    IF p_limit IS NULL OR p_limit <= 0 OR p_limit > 1000 THEN
        p_limit := 50;
    END IF;
    
    IF p_offset IS NULL OR p_offset < 0 THEN
        p_offset := 0;
    END IF;

    -- Get total count using helper functions
    SELECT COUNT(*) INTO v_total_count
    FROM properties_v2 p
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND extract_commercial_flow_type(p.property_details) IN ('commercial_rent', 'commercial_sale', 'commercial_coworking')
      AND matches_commercial_subtype(p.property_details, p_subtype)
      AND (p_property_subtype IS NULL OR 
           extract_commercial_property_type(p.property_details) ILIKE p_property_subtype)
      AND (p_search_query IS NULL OR 
           extract_commercial_title(p.property_details) ILIKE '%' || p_search_query || '%')
      AND (p_city IS NULL OR 
           extract_commercial_city(p.property_details) ILIKE '%' || p_city || '%')
      AND (p_state IS NULL OR 
           extract_commercial_state(p.property_details) ILIKE '%' || p_state || '%')
      AND (p_min_price IS NULL OR 
           extract_commercial_price(p.property_details) >= p_min_price)
      AND (p_max_price IS NULL OR 
           extract_commercial_price(p.property_details) <= p_max_price)
      AND (p_area_min IS NULL OR 
           extract_commercial_area(p.property_details) >= p_area_min)
      AND (p_area_max IS NULL OR 
           extract_commercial_area(p.property_details) <= p_area_max);

    -- Return the normalized results with standardized 23-column structure (21 + 2 coordinates)
    RETURN QUERY
    SELECT 
        -- MANDATORY CORE (8 fields)
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        'commercial'::TEXT as property_type,
        extract_commercial_flow_type(p.property_details)::TEXT as flow_type,
        commercial_flow_type_to_subtype(extract_commercial_flow_type(p.property_details))::TEXT as subtype,
        v_total_count as total_count,
        
        -- COMMON FIELDS (7 fields) - Using helper functions
        extract_commercial_title(p.property_details)::TEXT as title,
        extract_commercial_price(p.property_details) as price,
        extract_commercial_city(p.property_details)::TEXT as city,
        extract_commercial_state(p.property_details)::TEXT as state,
        extract_commercial_area(p.property_details) as area,
        prof.email::TEXT as owner_email,
        COALESCE(p.status, 'active')::TEXT as status,
        
        -- TYPE-SPECIFIC FIELDS (4 fields) - NULL for commercial (no bedrooms/bathrooms)
        NULL::INTEGER as bedrooms,
        NULL::NUMERIC as bathrooms,
        'sq_ft'::TEXT as area_unit,
        NULL::TEXT as land_type,
        
        -- EXISTING FIELD: Primary image filename
        extract_commercial_primary_image(p.property_details)::TEXT as primary_image,
        
        -- COORDINATE FIELDS (NEW)
        extract_commercial_latitude(p.property_details) as latitude,
        extract_commercial_longitude(p.property_details) as longitude
        
    FROM properties_v2 p
    LEFT JOIN profiles prof ON p.owner_id = prof.id
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND extract_commercial_flow_type(p.property_details) IN ('commercial_rent', 'commercial_sale', 'commercial_coworking')
      AND matches_commercial_subtype(p.property_details, p_subtype)
      AND (p_property_subtype IS NULL OR 
           extract_commercial_property_type(p.property_details) ILIKE p_property_subtype)
      AND (p_search_query IS NULL OR 
           extract_commercial_title(p.property_details) ILIKE '%' || p_search_query || '%')
      AND (p_city IS NULL OR 
           extract_commercial_city(p.property_details) ILIKE '%' || p_city || '%')
      AND (p_state IS NULL OR 
           extract_commercial_state(p.property_details) ILIKE '%' || p_state || '%')
      AND (p_min_price IS NULL OR 
           extract_commercial_price(p.property_details) >= p_min_price)
      AND (p_max_price IS NULL OR 
           extract_commercial_price(p.property_details) <= p_max_price)
      AND (p_area_min IS NULL OR 
           extract_commercial_area(p.property_details) >= p_area_min)
      AND (p_area_max IS NULL OR 
           extract_commercial_area(p.property_details) <= p_area_max)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
    
END;
$function$
;

-- =============================================================================
-- END OF FILE - 13 functions total (11 existing + 2 new coordinate functions)
-- =============================================================================