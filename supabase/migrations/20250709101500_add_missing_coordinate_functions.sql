-- Add missing coordinate extraction functions for commercial and land properties
-- Created: 2025-07-09 10:15:00 IST
-- Purpose: Fix missing extract_commercial_latitude, extract_commercial_longitude functions

-- =============================================================================
-- COMMERCIAL COORDINATE FUNCTIONS
-- =============================================================================

-- Function: extract_commercial_latitude
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
$function$;

-- Function: extract_commercial_longitude
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
$function$;

-- =============================================================================
-- LAND COORDINATE FUNCTIONS (if missing)
-- =============================================================================

-- Function: extract_land_latitude (create if missing)
CREATE OR REPLACE FUNCTION public.extract_land_latitude(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
   RETURN COALESCE(
       safe_numeric(property_details->'steps'->'land_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'land_sale_location'->>'latitude'),
       safe_numeric(property_details->'steps'->'location_details'->>'latitude'),
       safe_numeric(property_details->'location'->>'latitude'),
       safe_numeric(property_details->'coordinates'->>'lat'),
       safe_numeric(property_details->'coordinates'->>'latitude'),
       safe_numeric(property_details->'flow'->>'latitude'),
       safe_numeric(property_details->>'latitude')
   );
END;
$function$;

-- Function: extract_land_longitude (create if missing)
CREATE OR REPLACE FUNCTION public.extract_land_longitude(property_details jsonb)
 RETURNS numeric
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
   RETURN COALESCE(
       safe_numeric(property_details->'steps'->'land_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'land_sale_location'->>'longitude'),
       safe_numeric(property_details->'steps'->'location_details'->>'longitude'),
       safe_numeric(property_details->'location'->>'longitude'),
       safe_numeric(property_details->'coordinates'->>'lng'),
       safe_numeric(property_details->'coordinates'->>'longitude'),
       safe_numeric(property_details->'flow'->>'longitude'),
       safe_numeric(property_details->>'longitude')
   );
END;
$function$;

-- =============================================================================
-- UPDATE SEARCH FUNCTIONS TO USE COORDINATE FUNCTIONS
-- =============================================================================

-- Update search_land_properties to use the coordinate functions instead of NULL
DROP FUNCTION IF EXISTS public.search_land_properties(text,text,numeric,numeric,text,text,numeric,numeric,integer,integer);

CREATE OR REPLACE FUNCTION public.search_land_properties(
    p_property_subtype text DEFAULT NULL::text,
    p_search_query text DEFAULT NULL::text, 
    p_min_price numeric DEFAULT NULL::numeric,
    p_max_price numeric DEFAULT NULL::numeric,
    p_city text DEFAULT NULL::text,
    p_state text DEFAULT NULL::text,
    p_area_min numeric DEFAULT NULL::numeric,
    p_area_max numeric DEFAULT NULL::numeric,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid, 
    owner_id uuid, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    property_type text, 
    flow_type text, 
    subtype text, 
    total_count bigint, 
    title text, 
    price numeric, 
    city text, 
    state text, 
    area numeric, 
    owner_email text, 
    status text, 
    bedrooms integer, 
    bathrooms numeric, 
    area_unit text, 
    land_type text, 
    primary_image text, 
    latitude numeric, 
    longitude numeric
)
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
      AND extract_land_flow_type(p.property_details) = 'land_sale'
      AND (p_property_subtype IS NULL OR 
           extract_land_type(p.property_details) ILIKE p_property_subtype)
      AND (p_search_query IS NULL OR 
           extract_land_title(p.property_details) ILIKE '%' || p_search_query || '%')
      AND (p_city IS NULL OR 
           extract_land_city(p.property_details) ILIKE '%' || p_city || '%')
      AND (p_state IS NULL OR 
           extract_land_state(p.property_details) ILIKE '%' || p_state || '%')
      AND (p_min_price IS NULL OR 
           extract_land_price(p.property_details) >= p_min_price)
      AND (p_max_price IS NULL OR 
           extract_land_price(p.property_details) <= p_max_price)
      AND (p_area_min IS NULL OR 
           extract_land_area(p.property_details) >= p_area_min)
      AND (p_area_max IS NULL OR 
           extract_land_area(p.property_details) <= p_area_max);

    -- Return the normalized results
    RETURN QUERY
    SELECT 
        -- MANDATORY CORE (8 fields)
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        'land'::TEXT as property_type,
        extract_land_flow_type(p.property_details)::TEXT as flow_type,
        'sale'::TEXT as subtype,
        v_total_count as total_count,
        
        -- COMMON FIELDS (7 fields) - Using helper functions
        extract_land_title(p.property_details)::TEXT as title,
        extract_land_price(p.property_details) as price,
        extract_land_city(p.property_details)::TEXT as city,
        extract_land_state(p.property_details)::TEXT as state,
        extract_land_area(p.property_details) as area,
        prof.email::TEXT as owner_email,
        COALESCE(p.status, 'active')::TEXT as status,
        
        -- TYPE-SPECIFIC FIELDS (4 fields) - NULL for land (no bedrooms/bathrooms)
        NULL::INTEGER as bedrooms,
        NULL::NUMERIC as bathrooms,
        extract_land_area_unit(p.property_details)::TEXT as area_unit,
        extract_land_type(p.property_details)::TEXT as land_type,
        
        -- EXISTING FIELD: Primary image filename
        extract_land_primary_image(p.property_details)::TEXT as primary_image,
        
        -- COORDINATE FIELDS (NOW USING ACTUAL FUNCTIONS)
        extract_land_latitude(p.property_details) as latitude,
        extract_land_longitude(p.property_details) as longitude
        
    FROM properties_v2 p
    LEFT JOIN profiles prof ON p.owner_id = prof.id
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND extract_land_flow_type(p.property_details) = 'land_sale'
      AND (p_property_subtype IS NULL OR 
           extract_land_type(p.property_details) ILIKE p_property_subtype)
      AND (p_search_query IS NULL OR 
           extract_land_title(p.property_details) ILIKE '%' || p_search_query || '%')
      AND (p_city IS NULL OR 
           extract_land_city(p.property_details) ILIKE '%' || p_city || '%')
      AND (p_state IS NULL OR 
           extract_land_state(p.property_details) ILIKE '%' || p_state || '%')
      AND (p_min_price IS NULL OR 
           extract_land_price(p.property_details) >= p_min_price)
      AND (p_max_price IS NULL OR 
           extract_land_price(p.property_details) <= p_max_price)
      AND (p_area_min IS NULL OR 
           extract_land_area(p.property_details) >= p_area_min)
      AND (p_area_max IS NULL OR 
           extract_land_area(p.property_details) <= p_area_max)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
    
END;
$function$;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================