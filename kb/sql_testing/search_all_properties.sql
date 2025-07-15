-- unified_search_properties_fixed.sql
-- Version: 1.4.0
-- Last Modified: 15-07-2025 17:50 IST
-- Purpose: Fixed unified search function that properly handles all property types

CREATE OR REPLACE FUNCTION public.search_all_properties(
    p_search_query TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_subtype TEXT DEFAULT NULL,
    p_property_subtype TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_bedrooms INTEGER DEFAULT NULL,
    p_bathrooms NUMERIC DEFAULT NULL,
    p_area_min NUMERIC DEFAULT NULL,
    p_area_max NUMERIC DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    -- MANDATORY CORE (8 fields)
    id UUID,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    property_type TEXT,
    flow_type TEXT,
    subtype TEXT,
    total_count BIGINT,
    
    -- COMMON FIELDS (7 fields)
    title TEXT,
    price NUMERIC,
    city TEXT,
    state TEXT,
    area NUMERIC,
    owner_email TEXT,
    status TEXT,
    
    -- TYPE-SPECIFIC FIELDS (4 fields)
    bedrooms INTEGER,
    bathrooms NUMERIC,
    area_unit TEXT,
    land_type TEXT,
    
    -- IMAGE FIELD
    primary_image TEXT,
    
    -- COORDINATE FIELDS
    latitude NUMERIC,
    longitude NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_residential BIGINT := 0;
    v_total_commercial BIGINT := 0;
    v_total_land BIGINT := 0;
    v_grand_total BIGINT := 0;
    v_residential_limit INTEGER := 0;
    v_commercial_limit INTEGER := 0;
    v_land_limit INTEGER := 0;
    v_residential_offset INTEGER := 0;
    v_commercial_offset INTEGER := 0;
    v_land_offset INTEGER := 0;
    v_max_limit INTEGER := 10000;
    v_current_returned INTEGER := 0;
BEGIN
    -- Validate and set parameters
    IF p_limit IS NULL OR p_limit <= 0 THEN
        p_limit := 50;
    ELSIF p_limit > v_max_limit THEN
        p_limit := v_max_limit;
        RAISE NOTICE 'Limit capped at % for performance reasons', v_max_limit;
    END IF;
    
    IF p_offset IS NULL OR p_offset < 0 THEN
        p_offset := 0;
    END IF;
    
    -- If specific property type is requested, call only that function
    IF p_property_type IS NOT NULL THEN
        IF p_property_type = 'residential' THEN
            RETURN QUERY
            SELECT * FROM search_residential_properties(
                p_subtype, p_property_subtype, p_search_query, p_city, p_state,
                p_min_price, p_max_price, p_bedrooms, p_bathrooms,
                p_area_min, p_area_max, p_limit, p_offset
            );
            RETURN;
        ELSIF p_property_type = 'commercial' THEN
            RETURN QUERY
            SELECT * FROM search_commercial_properties(
                p_subtype, p_property_subtype, p_search_query, p_min_price, p_max_price,
                p_city, p_state, p_area_min, p_area_max, p_limit, p_offset
            );
            RETURN;
        ELSIF p_property_type = 'land' THEN
            RETURN QUERY
            SELECT * FROM search_land_properties(
                p_property_subtype, p_search_query, p_min_price, p_max_price,
                p_city, p_state, p_area_min, p_area_max, p_limit, p_offset
            );
            RETURN;
        END IF;
    END IF;
    
    -- For mixed search, get total counts first
    -- Get residential count
    SELECT COALESCE(r.total_count, 0) INTO v_total_residential
    FROM search_residential_properties(
        p_subtype, p_property_subtype, p_search_query, p_city, p_state,
        p_min_price, p_max_price, p_bedrooms, p_bathrooms,
        p_area_min, p_area_max, 1, 0
    ) r LIMIT 1;
    
    -- Get commercial count
    SELECT COALESCE(c.total_count, 0) INTO v_total_commercial
    FROM search_commercial_properties(
        p_subtype, p_property_subtype, p_search_query, p_min_price, p_max_price,
        p_city, p_state, p_area_min, p_area_max, 1, 0
    ) c LIMIT 1;
    
    -- Get land count
    SELECT COALESCE(l.total_count, 0) INTO v_total_land
    FROM search_land_properties(
        p_property_subtype, p_search_query, p_min_price, p_max_price,
        p_city, p_state, p_area_min, p_area_max, 1, 0
    ) l LIMIT 1;
    
    -- Handle NULL counts
    v_total_residential := COALESCE(v_total_residential, 0);
    v_total_commercial := COALESCE(v_total_commercial, 0);
    v_total_land := COALESCE(v_total_land, 0);
    
    v_grand_total := v_total_residential + v_total_commercial + v_total_land;
    
    -- If no results found, return empty
    IF v_grand_total = 0 THEN
        RETURN;
    END IF;
    
    -- Calculate proportional distribution
    -- Use ceiling to ensure we don't lose properties due to rounding
    v_residential_limit := CEIL((v_total_residential::DECIMAL / v_grand_total) * p_limit);
    v_commercial_limit := CEIL((v_total_commercial::DECIMAL / v_grand_total) * p_limit);
    v_land_limit := CEIL((v_total_land::DECIMAL / v_grand_total) * p_limit);
    
    -- Adjust if total exceeds requested limit
    DECLARE
        v_total_calculated INTEGER := v_residential_limit + v_commercial_limit + v_land_limit;
        v_excess INTEGER := v_total_calculated - p_limit;
    BEGIN
        IF v_excess > 0 THEN
            -- Reduce limits proportionally, starting with the largest
            IF v_residential_limit >= v_commercial_limit AND v_residential_limit >= v_land_limit THEN
                v_residential_limit := v_residential_limit - v_excess;
            ELSIF v_commercial_limit >= v_land_limit THEN
                v_commercial_limit := v_commercial_limit - v_excess;
            ELSE
                v_land_limit := v_land_limit - v_excess;
            END IF;
        END IF;
    END;
    
    -- Ensure limits don't exceed available results
    v_residential_limit := LEAST(v_residential_limit, v_total_residential);
    v_commercial_limit := LEAST(v_commercial_limit, v_total_commercial);
    v_land_limit := LEAST(v_land_limit, v_total_land);
    
    -- Calculate offsets proportionally
    IF p_offset > 0 THEN
        v_residential_offset := FLOOR((v_total_residential::DECIMAL / v_grand_total) * p_offset);
        v_commercial_offset := FLOOR((v_total_commercial::DECIMAL / v_grand_total) * p_offset);
        v_land_offset := FLOOR((v_total_land::DECIMAL / v_grand_total) * p_offset);
        
        v_residential_offset := LEAST(v_residential_offset, v_total_residential);
        v_commercial_offset := LEAST(v_commercial_offset, v_total_commercial);
        v_land_offset := LEAST(v_land_offset, v_total_land);
    END IF;
    
    -- Debug logging
    RAISE NOTICE 'Counts: residential=%, commercial=%, land=%, grand_total=%', 
                 v_total_residential, v_total_commercial, v_total_land, v_grand_total;
    RAISE NOTICE 'Limits: residential=%, commercial=%, land=%, total_limit=%', 
                 v_residential_limit, v_commercial_limit, v_land_limit, 
                 (v_residential_limit + v_commercial_limit + v_land_limit);
    
    -- Return results in mixed order to maintain diversity
    -- First, return residential properties
    IF v_residential_limit > 0 THEN
        RETURN QUERY
        SELECT 
            r.id, r.owner_id, r.created_at, r.updated_at, r.property_type,
            r.flow_type, r.subtype, v_grand_total as total_count,
            r.title, r.price, r.city, r.state, r.area, r.owner_email, r.status,
            r.bedrooms, r.bathrooms, r.area_unit, r.land_type, r.primary_image,
            r.latitude, r.longitude
        FROM search_residential_properties(
            p_subtype, p_property_subtype, p_search_query, p_city, p_state,
            p_min_price, p_max_price, p_bedrooms, p_bathrooms,
            p_area_min, p_area_max, v_residential_limit, v_residential_offset
        ) r
        ORDER BY r.created_at DESC;
    END IF;
    
    -- Then, return commercial properties
    IF v_commercial_limit > 0 THEN
        RETURN QUERY
        SELECT 
            c.id, c.owner_id, c.created_at, c.updated_at, c.property_type,
            c.flow_type, c.subtype, v_grand_total as total_count,
            c.title, c.price, c.city, c.state, c.area, c.owner_email, c.status,
            c.bedrooms, c.bathrooms, c.area_unit, c.land_type, c.primary_image,
            c.latitude, c.longitude
        FROM search_commercial_properties(
            p_subtype, p_property_subtype, p_search_query, p_min_price, p_max_price,
            p_city, p_state, p_area_min, p_area_max, 
            v_commercial_limit, v_commercial_offset
        ) c
        ORDER BY c.created_at DESC;
    END IF;
    
    -- Finally, return land properties
    IF v_land_limit > 0 THEN
        RETURN QUERY
        SELECT 
            l.id, l.owner_id, l.created_at, l.updated_at, l.property_type,
            l.flow_type, l.subtype, v_grand_total as total_count,
            l.title, l.price, l.city, l.state, l.area, l.owner_email, l.status,
            l.bedrooms, l.bathrooms, l.area_unit, l.land_type, l.primary_image,
            l.latitude, l.longitude
        FROM search_land_properties(
            p_property_subtype, p_search_query, p_min_price, p_max_price,
            p_city, p_state, p_area_min, p_area_max,
            v_land_limit, v_land_offset
        ) l
        ORDER BY l.created_at DESC;
    END IF;
    
    RETURN;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.search_all_properties TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_properties TO anon;

-- End of file