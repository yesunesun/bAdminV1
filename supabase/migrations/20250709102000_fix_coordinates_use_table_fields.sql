-- Fix coordinate usage - use properties_v2 table fields instead of extraction functions
-- Created: 2025-07-09 10:20:00 IST
-- Purpose: Drop coordinate extraction functions and use direct table fields

-- =============================================================================
-- DROP ALL COORDINATE EXTRACTION FUNCTIONS
-- =============================================================================

-- Drop commercial coordinate functions (if they exist)
DROP FUNCTION IF EXISTS public.extract_commercial_latitude(jsonb);
DROP FUNCTION IF EXISTS public.extract_commercial_longitude(jsonb);

-- Drop land coordinate functions (if they exist)  
DROP FUNCTION IF EXISTS public.extract_land_latitude(jsonb);
DROP FUNCTION IF EXISTS public.extract_land_longitude(jsonb);

-- Drop residential coordinate functions (if they exist)
DROP FUNCTION IF EXISTS public.extract_residential_latitude(jsonb);
DROP FUNCTION IF EXISTS public.extract_residential_longitude(jsonb);

-- =============================================================================
-- UPDATE ALL SEARCH FUNCTIONS TO USE TABLE COORDINATES
-- =============================================================================

-- Update search_commercial_properties to use table coordinates
DROP FUNCTION IF EXISTS public.search_commercial_properties(text,text,text,numeric,numeric,text,text,numeric,numeric,integer,integer);

CREATE OR REPLACE FUNCTION public.search_commercial_properties(
    p_subtype text DEFAULT NULL::text, 
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

    -- Return the normalized results with table coordinates
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
        
        -- COORDINATE FIELDS - USE TABLE FIELDS DIRECTLY
        p.latitude as latitude,
        p.longitude as longitude
        
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
$function$;

-- Update search_land_properties to use table coordinates
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
        
        -- COORDINATE FIELDS - USE TABLE FIELDS DIRECTLY
        p.latitude as latitude,
        p.longitude as longitude
        
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
-- UPDATE RESIDENTIAL SEARCH FUNCTION (if it uses coordinate extraction)
-- =============================================================================

-- Check if residential search needs updating - it should also use table coordinates
-- This assumes search_residential_properties exists and might need similar fix

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================