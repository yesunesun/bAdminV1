-- Complete Property Code Search Functions
-- Run this entire script in your Supabase SQL Editor
-- This will create all necessary functions for property code search

-- =============================================================================
-- STEP 1: DROP EXISTING FUNCTIONS (if they exist)
-- =============================================================================

DROP FUNCTION IF EXISTS public.search_property_by_code(text);
DROP FUNCTION IF EXISTS public.search_property_by_code_insensitive(text);
DROP FUNCTION IF EXISTS public.safe_numeric(text);

-- =============================================================================
-- STEP 2: CREATE HELPER FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.safe_numeric(input_text text)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Handle null/empty input
    IF input_text IS NULL OR trim(input_text) = '' THEN
        RETURN NULL;
    END IF;
    
    -- Try to convert to numeric
    BEGIN
        RETURN input_text::numeric;
    EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
    END;
END;
$$;

-- =============================================================================
-- STEP 3: CREATE MAIN SEARCH FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_property_by_code(p_code text)
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
    code text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        
        -- Property type detection
        CASE 
            WHEN p.property_details->'flow'->>'category' = 'commercial' THEN 'commercial'::text
            WHEN p.property_details->'flow'->>'category' = 'land' THEN 'land'::text
            ELSE 'residential'::text
        END as property_type,
        
        -- Flow type
        COALESCE(
            p.property_details->'flow'->>'category',
            'residential'
        ) || '_' || COALESCE(
            p.property_details->'flow'->>'listingType',
            'rent'
        ) as flow_type,
        
        -- Subtype
        COALESCE(
            p.property_details->'flow'->>'listingType',
            'rent'
        )::text as subtype,
        
        v_total_count as total_count,
        
        -- Title - try different possible locations
        COALESCE(
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
        )::text as title,
        
        -- Price - try different possible locations
        COALESCE(
            safe_numeric(p.property_details->'steps'->'res_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'res_sale_sale_details'->>'expectedPrice'),
            safe_numeric(p.property_details->'steps'->'com_rent_rental'->>'rentAmount'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'salePrice'),
            safe_numeric(p.property_details->'steps'->'com_sale_sale_details'->>'expectedPrice'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'price'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'salePrice'),
            safe_numeric(p.property_details->>'price'),
            0
        ) as price,
        
        -- City
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
            p.property_details->'location'->>'city',
            'Unknown'
        )::text as city,
        
        -- State
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
            p.property_details->'location'->>'state',
            'Unknown'
        )::text as state,
        
        -- Area
        COALESCE(
            safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'squareFootage'),
            safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'builtUpArea'),
            safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'squareFootage'),
            safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'builtUpArea'),
            safe_numeric(p.property_details->'steps'->'com_rent_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'com_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_sale_basic_details'->>'area'),
            safe_numeric(p.property_details->'steps'->'land_basic_details'->>'area'),
            safe_numeric(p.property_details->'basicDetails'->>'area'),
            0
        ) as area,
        
        prof.email::text as owner_email,
        COALESCE(p.status, 'active')::text as status,
        
        -- Bedrooms (only for residential)
        CASE 
            WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'residential' THEN
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
            WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'residential' THEN
                COALESCE(
                    safe_numeric(p.property_details->'steps'->'res_rent_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'steps'->'res_sale_basic_details'->>'bathrooms'),
                    safe_numeric(p.property_details->'basicDetails'->>'bathrooms')
                )
            ELSE NULL
        END as bathrooms,
        
        -- Area unit
        CASE 
            WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'land' THEN
                COALESCE(
                    p.property_details->'steps'->'land_sale_basic_details'->>'areaUnit',
                    p.property_details->'steps'->'land_basic_details'->>'areaUnit',
                    'sq_ft'
                )
            ELSE 'sq_ft'
        END::text as area_unit,
        
        -- Land type (only for land properties)
        CASE 
            WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'land' THEN
                COALESCE(
                    p.property_details->'steps'->'land_sale_basic_details'->>'landType',
                    p.property_details->'steps'->'land_basic_details'->>'landType',
                    p.property_details->'basicDetails'->>'landType',
                    'agricultural'
                )
            ELSE NULL
        END::text as land_type,
        
        -- Primary image
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
            p.property_details->'images'->>'primary',
            ''
        )::text as primary_image,
        
        -- Property code from meta
        p.property_details->'meta'->>'code'::text as code
        
    FROM properties_v2 p
    LEFT JOIN profiles prof ON p.owner_id = prof.id
    WHERE p.status IS DISTINCT FROM 'deleted'
      AND p.property_details->'meta'->>'code' = p_code
    ORDER BY p.created_at DESC;
    
END;
$$;

-- =============================================================================
-- STEP 4: CREATE CASE-INSENSITIVE SEARCH FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION public.search_property_by_code_insensitive(p_code text)
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
    code text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validate input
    IF p_code IS NULL OR trim(p_code) = '' THEN
        RAISE EXCEPTION 'Property code cannot be null or empty';
    END IF;

    -- Call the main function with uppercase code for case-insensitive search
    RETURN QUERY
    SELECT * FROM search_property_by_code(UPPER(trim(p_code)));
    
END;
$$;

-- =============================================================================
-- STEP 5: TEST THE FUNCTIONS (Optional - you can run these to verify)
-- =============================================================================

-- Test with a dummy code (should return no results but no error)
-- SELECT * FROM search_property_by_code('TEST01');

-- Test case-insensitive version
-- SELECT * FROM search_property_by_code_insensitive('test01');

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Functions created successfully!
-- You can now use:
-- 1. search_property_by_code('CODE123') - for exact case-sensitive search
-- 2. search_property_by_code_insensitive('code123') - for case-insensitive search
-- 
-- Next steps:
-- 1. Add property codes to your properties using the generateMissingCodes() function
-- 2. Test the search functionality in your application