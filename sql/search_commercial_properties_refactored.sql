-- src/database/functions/search_commercial_properties_refactored.sql
-- Version: 4.2.0
-- Last Modified: 01-06-2025 22:55 IST
-- Purpose: Refactored modular commercial search with property type filtering and primary image

-- =============================================================================
-- HELPER FUNCTION 1: Extract price from commercial property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_price(property_details JSONB)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- HELPER FUNCTION 2: Extract title from commercial property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_title(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- HELPER FUNCTION 3: Extract city from commercial property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_city(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- HELPER FUNCTION 4: Extract state from commercial property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_state(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- HELPER FUNCTION 5: Extract area from commercial property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_area(property_details JSONB)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- HELPER FUNCTION 6: Extract flow type from commercial property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_flow_type(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN COALESCE(
        property_details->'flow'->>'flowType',
        property_details->>'flowType',
        property_details->>'flow_type',
        property_details->'meta'->>'flow_type',
        'commercial_rent'
    );
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 7: Extract property type from commercial property data
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_property_type(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- HELPER FUNCTION 8: Extract primary image from commercial property data (NEW)
-- =============================================================================
CREATE OR REPLACE FUNCTION extract_commercial_primary_image(property_details JSONB)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- HELPER FUNCTION 9: Convert commercial flow type to subtype
-- =============================================================================
CREATE OR REPLACE FUNCTION commercial_flow_type_to_subtype(flow_type TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    RETURN CASE 
        WHEN flow_type = 'commercial_rent' THEN 'rent'
        WHEN flow_type = 'commercial_sale' THEN 'sale'
        WHEN flow_type = 'commercial_coworking' THEN 'coworking'
        ELSE 'rent'
    END;
END;
$$;

-- =============================================================================
-- HELPER FUNCTION 10: Check if commercial property matches subtype filter
-- =============================================================================
CREATE OR REPLACE FUNCTION matches_commercial_subtype(property_details JSONB, p_subtype TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
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
$$;

-- =============================================================================
-- MAIN FUNCTION: Search commercial properties (enhanced with primary image)
-- =============================================================================

-- First, check if the function exists and drop it safely
DO $$
BEGIN
    -- Check if function exists and drop it
    IF EXISTS (
        SELECT 1 
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND p.proname = 'search_commercial_properties'
    ) THEN
        DROP FUNCTION public.search_commercial_properties CASCADE;
        RAISE NOTICE 'Existing search_commercial_properties function dropped';
    END IF;
END
$$;

CREATE OR REPLACE FUNCTION search_commercial_properties(
    p_subtype TEXT DEFAULT NULL,
    p_property_subtype TEXT DEFAULT NULL,
    p_search_query TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_area_min NUMERIC DEFAULT NULL,
    p_area_max NUMERIC DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    property_type TEXT,
    flow_type TEXT,
    subtype TEXT,
    total_count BIGINT,
    title TEXT,
    price NUMERIC,
    city TEXT,
    state TEXT,
    area NUMERIC,
    owner_email TEXT,
    status TEXT,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    area_unit TEXT,
    land_type TEXT,
    primary_image TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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

    -- Return the normalized results with standardized 21-column structure
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
        
        -- NEW FIELD: Primary image filename
        extract_commercial_primary_image(p.property_details)::TEXT as primary_image
        
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
$$;