Here are comprehensive test queries:
1. Basic Count Verification Queries
sql-- Count all active properties by type
SELECT 
    CASE 
        WHEN extract_residential_flow_type(property_details) LIKE 'residential_%' THEN 'residential'
        WHEN extract_commercial_flow_type(property_details) IN ('commercial_rent', 'commercial_sale', 'commercial_coworking') THEN 'commercial'
        WHEN extract_land_flow_type(property_details) = 'land_sale' THEN 'land'
        ELSE 'other'
    END as property_type,
    COUNT(*) as total_count
FROM properties_v2 
WHERE status IS DISTINCT FROM 'deleted'
GROUP BY property_type
ORDER BY property_type;
sql-- Count by property type and subtype
SELECT 
    CASE 
        WHEN extract_residential_flow_type(property_details) LIKE 'residential_%' THEN 'residential'
        WHEN extract_commercial_flow_type(property_details) IN ('commercial_rent', 'commercial_sale', 'commercial_coworking') THEN 'commercial'
        WHEN extract_land_flow_type(property_details) = 'land_sale' THEN 'land'
        ELSE 'other'
    END as property_type,
    CASE 
        WHEN extract_residential_flow_type(property_details) = 'residential_rent' THEN 'rent'
        WHEN extract_residential_flow_type(property_details) = 'residential_sale' THEN 'sale'
        WHEN extract_residential_flow_type(property_details) = 'residential_flatmates' THEN 'flatmates'
        WHEN extract_residential_flow_type(property_details) = 'residential_pghostel' THEN 'pghostel'
        WHEN extract_commercial_flow_type(property_details) = 'commercial_rent' THEN 'rent'
        WHEN extract_commercial_flow_type(property_details) = 'commercial_sale' THEN 'sale'
        WHEN extract_commercial_flow_type(property_details) = 'commercial_coworking' THEN 'coworking'
        WHEN extract_land_flow_type(property_details) = 'land_sale' THEN 'sale'
        ELSE 'other'
    END as subtype,
    COUNT(*) as count
FROM properties_v2 
WHERE status IS DISTINCT FROM 'deleted'
GROUP BY property_type, subtype
ORDER BY property_type, subtype;
2. Test Queries for search_all_properties
Test 1: Basic search across all property types
sql-- Test 1: Get all properties (mixed search)
SELECT property_type, flow_type, subtype, COUNT(*) as count
FROM search_all_properties(
    NULL,    -- p_search_query
    NULL,    -- p_city
    NULL,    -- p_state
    NULL,    -- p_property_type (all types)
    NULL,    -- p_subtype
    NULL,    -- p_property_subtype
    NULL,    -- p_min_price
    NULL,    -- p_max_price
    NULL,    -- p_bedrooms
    NULL,    -- p_bathrooms
    NULL,    -- p_area_min
    NULL,    -- p_area_max
    100,     -- p_limit
    0        -- p_offset
) GROUP BY property_type, flow_type, subtype
ORDER BY property_type, subtype;
Test 2: Search only residential properties
sql-- Test 2: Residential only
SELECT property_type, flow_type, subtype, title, price, city, bedrooms, bathrooms
FROM search_all_properties(
    NULL,           -- p_search_query
    NULL,           -- p_city
    NULL,           -- p_state
    'residential',  -- p_property_type
    NULL,           -- p_subtype
    NULL,           -- p_property_subtype
    NULL,           -- p_min_price
    NULL,           -- p_max_price
    NULL,           -- p_bedrooms
    NULL,           -- p_bathrooms
    NULL,           -- p_area_min
    NULL,           -- p_area_max
    20,             -- p_limit
    0               -- p_offset
)
ORDER BY created_at DESC;
Test 3: Search only commercial properties
sql-- Test 3: Commercial only
SELECT property_type, flow_type, subtype, title, price, city, area
FROM search_all_properties(
    NULL,          -- p_search_query
    NULL,          -- p_city
    NULL,          -- p_state
    'commercial',  -- p_property_type
    NULL,          -- p_subtype
    NULL,          -- p_property_subtype
    NULL,          -- p_min_price
    NULL,          -- p_max_price
    NULL,          -- p_bedrooms
    NULL,          -- p_bathrooms
    NULL,          -- p_area_min
    NULL,          -- p_area_max
    20,            -- p_limit
    0              -- p_offset
)
ORDER BY created_at DESC;
Test 4: Search only land properties
sql-- Test 4: Land only
SELECT property_type, flow_type, subtype, title, price, city, area, land_type
FROM search_all_properties(
    NULL,    -- p_search_query
    NULL,    -- p_city
    NULL,    -- p_state
    'land',  -- p_property_type
    NULL,    -- p_subtype
    NULL,    -- p_property_subtype
    NULL,    -- p_min_price
    NULL,    -- p_max_price
    NULL,    -- p_bedrooms
    NULL,    -- p_bathrooms
    NULL,    -- p_area_min
    NULL,    -- p_area_max
    20,      -- p_limit
    0        -- p_offset
)
ORDER BY created_at DESC;
Test 5: City-based search
sql-- Test 5: Search by city (Hyderabad)
SELECT property_type, flow_type, title, city, price, COUNT(*) OVER() as total_found
FROM search_all_properties(
    NULL,         -- p_search_query
    'Hyderabad',  -- p_city
    NULL,         -- p_state
    NULL,         -- p_property_type
    NULL,         -- p_subtype
    NULL,         -- p_property_subtype
    NULL,         -- p_min_price
    NULL,         -- p_max_price
    NULL,         -- p_bedrooms
    NULL,         -- p_bathrooms
    NULL,         -- p_area_min
    NULL,         -- p_area_max
    50,           -- p_limit
    0             -- p_offset
)
ORDER BY created_at DESC;
Test 6: Price range search
sql-- Test 6: Price range search (₹10,000 to ₹50,000)
SELECT property_type, flow_type, title, price, city
FROM search_all_properties(
    NULL,    -- p_search_query
    NULL,    -- p_city
    NULL,    -- p_state
    NULL,    -- p_property_type
    NULL,    -- p_subtype
    NULL,    -- p_property_subtype
    10000,   -- p_min_price
    50000,   -- p_max_price
    NULL,    -- p_bedrooms
    NULL,    -- p_bathrooms
    NULL,    -- p_area_min
    NULL,    -- p_area_max
    30,      -- p_limit
    0        -- p_offset
)
WHERE price IS NOT NULL
ORDER BY price ASC;
Test 7: Bedroom-specific search
sql-- Test 7: Search for 2 BHK properties
SELECT property_type, flow_type, title, bedrooms, bathrooms, price, city
FROM search_all_properties(
    NULL,    -- p_search_query
    NULL,    -- p_city
    NULL,    -- p_state
    NULL,    -- p_property_type
    NULL,    -- p_subtype
    NULL,    -- p_property_subtype
    NULL,    -- p_min_price
    NULL,    -- p_max_price
    2,       -- p_bedrooms
    NULL,    -- p_bathrooms
    NULL,    -- p_area_min
    NULL,    -- p_area_max
    25,      -- p_limit
    0        -- p_offset
)
WHERE bedrooms IS NOT NULL
ORDER BY bedrooms, price;
Test 8: Subtype-specific search
sql-- Test 8: Search for rental properties only
SELECT property_type, flow_type, subtype, title, price, city
FROM search_all_properties(
    NULL,    -- p_search_query
    NULL,    -- p_city
    NULL,    -- p_state
    NULL,    -- p_property_type
    'rent',  -- p_subtype
    NULL,    -- p_property_subtype
    NULL,    -- p_min_price
    NULL,    -- p_max_price
    NULL,    -- p_bedrooms
    NULL,    -- p_bathrooms
    NULL,    -- p_area_min
    NULL,    -- p_area_max
    40,      -- p_limit
    0        -- p_offset
)
ORDER BY property_type, price;
Test 9: Text search
sql-- Test 9: Text search for 'apartment' or 'flat'
SELECT property_type, flow_type, title, price, city
FROM search_all_properties(
    'apartment', -- p_search_query
    NULL,        -- p_city
    NULL,        -- p_state
    NULL,        -- p_property_type
    NULL,        -- p_subtype
    NULL,        -- p_property_subtype
    NULL,        -- p_min_price
    NULL,        -- p_max_price
    NULL,        -- p_bedrooms
    NULL,        -- p_bathrooms
    NULL,        -- p_area_min
    NULL,        -- p_area_max
    20,          -- p_limit
    0            -- p_offset
)
ORDER BY created_at DESC;
Test 10: Complex multi-filter search
sql-- Test 10: Complex search (residential rent in Hyderabad, 2-3 BHK, ₹15K-40K)
SELECT property_type, flow_type, subtype, title, bedrooms, price, city
FROM search_all_properties(
    NULL,           -- p_search_query
    'Hyderabad',    -- p_city
    'Telangana',    -- p_state
    'residential',  -- p_property_type
    'rent',         -- p_subtype
    NULL,           -- p_property_subtype
    15000,          -- p_min_price
    40000,          -- p_max_price
    2,              -- p_bedrooms
    NULL,           -- p_bathrooms
    NULL,           -- p_area_min
    NULL,           -- p_area_max
    15,             -- p_limit
    0               -- p_offset
)
ORDER BY price ASC;
3. Verification Count Queries
Verify total counts match individual function calls
sql-- Compare total counts: search_all_properties vs individual functions
WITH all_search AS (
    SELECT COUNT(*) as total_all
    FROM search_all_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)
),
individual_counts AS (
    SELECT 
        (SELECT COUNT(*) FROM search_residential_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)) as residential_count,
        (SELECT COUNT(*) FROM search_commercial_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)) as commercial_count,
        (SELECT COUNT(*) FROM search_land_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)) as land_count
)
SELECT 
    a.total_all,
    i.residential_count + i.commercial_count + i.land_count as individual_sum,
    CASE 
        WHEN a.total_all = (i.residential_count + i.commercial_count + i.land_count) 
        THEN 'MATCH ✓' 
        ELSE 'MISMATCH ✗' 
    END as verification_status
FROM all_search a, individual_counts i;
Test pagination consistency
sql-- Test pagination: First 10 vs Next 10
SELECT 'First 10' as batch, COUNT(*) as count
FROM search_all_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,0)
UNION ALL
SELECT 'Next 10' as batch, COUNT(*) as count
FROM search_all_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,10);
These test queries will help you verify:

Count accuracy - Ensure total counts match between unified and individual functions
Property type filtering - Verify each property type returns correct results
Parameter handling - Test various filter combinations
Pagination - Ensure offset and limit work correctly
Mixed results - Verify proportional distribution in mixed searches

Run these queries to thoroughly test the search_all_properties function and identify any issues with the implementation.