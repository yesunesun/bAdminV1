-- test_search_all_properties.sql
-- Version: 1.0.0
-- Last Modified: 15-07-2025 16:55 IST
-- Purpose: Comprehensive test queries for the unified search function

-- ==================================================
-- BASIC SEARCH TESTS
-- ==================================================

-- Test 1: Search all property types with no filters (should return mixed results)
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties() 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 2: Search with basic text query across all property types
SELECT 
    property_type, 
    title, 
    city, 
    price, 
    total_count 
FROM search_all_properties(
    p_search_query := 'apartment'
) 
ORDER BY created_at DESC 
LIMIT 15;

-- Test 3: Location-based search (city filter)
SELECT 
    property_type, 
    title, 
    city, 
    state, 
    price 
FROM search_all_properties(
    p_city := 'Hyderabad'
) 
ORDER BY price ASC 
LIMIT 20;

-- ==================================================
-- PROPERTY TYPE SPECIFIC TESTS
-- ==================================================

-- Test 4: Search only residential properties
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    bedrooms, 
    bathrooms, 
    price, 
    total_count 
FROM search_all_properties(
    p_property_type := 'residential'
) 
ORDER BY price DESC 
LIMIT 10;

-- Test 5: Search only commercial properties
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    area, 
    price, 
    total_count 
FROM search_all_properties(
    p_property_type := 'commercial'
) 
ORDER BY area DESC 
LIMIT 10;

-- Test 6: Search only land properties
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    area, 
    area_unit, 
    land_type, 
    price, 
    total_count 
FROM search_all_properties(
    p_property_type := 'land'
) 
ORDER BY area DESC 
LIMIT 10;

-- ==================================================
-- SUBTYPE AND FLOW TYPE TESTS
-- ==================================================

-- Test 7: Search residential rent properties
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    bedrooms, 
    bathrooms, 
    price, 
    city 
FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'rent'
) 
ORDER BY price ASC 
LIMIT 10;

-- Test 8: Search residential sale properties
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    bedrooms, 
    bathrooms, 
    price, 
    city 
FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'sale'
) 
ORDER BY price DESC 
LIMIT 10;

-- Test 9: Search commercial rent properties
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    area, 
    price, 
    city 
FROM search_all_properties(
    p_property_type := 'commercial',
    p_subtype := 'rent'
) 
ORDER BY area DESC 
LIMIT 10;

-- Test 10: Search commercial coworking properties
SELECT 
    property_type, 
    flow_type, 
    subtype, 
    title, 
    area, 
    price, 
    city 
FROM search_all_properties(
    p_property_type := 'commercial',
    p_subtype := 'coworking'
) 
ORDER BY price ASC 
LIMIT 10;

-- ==================================================
-- PRICE RANGE TESTS
-- ==================================================

-- Test 11: Search with price range (10K - 50K)
SELECT 
    property_type, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties(
    p_min_price := 10000,
    p_max_price := 50000
) 
ORDER BY price ASC 
LIMIT 15;

-- Test 12: High-end properties (above 1 Lakh)
SELECT 
    property_type, 
    flow_type, 
    title, 
    price, 
    city, 
    area 
FROM search_all_properties(
    p_min_price := 100000
) 
ORDER BY price DESC 
LIMIT 10;

-- Test 13: Budget properties (below 25K)
SELECT 
    property_type, 
    flow_type, 
    title, 
    price, 
    city, 
    bedrooms 
FROM search_all_properties(
    p_max_price := 25000
) 
ORDER BY price ASC 
LIMIT 10;

-- ==================================================
-- BEDROOM AND BATHROOM TESTS
-- ==================================================

-- Test 14: Search for 2 BHK properties
SELECT 
    property_type, 
    title, 
    bedrooms, 
    bathrooms, 
    price, 
    city 
FROM search_all_properties(
    p_bedrooms := 2
) 
ORDER BY price ASC 
LIMIT 10;

-- Test 15: Search for 3+ BHK properties
SELECT 
    property_type, 
    title, 
    bedrooms, 
    bathrooms, 
    price, 
    city 
FROM search_all_properties(
    p_bedrooms := 3
) 
ORDER BY bedrooms DESC 
LIMIT 10;

-- Test 16: Properties with 2+ bathrooms
SELECT 
    property_type, 
    title, 
    bedrooms, 
    bathrooms, 
    price, 
    city 
FROM search_all_properties(
    p_bathrooms := 2
) 
ORDER BY bathrooms DESC 
LIMIT 10;

-- ==================================================
-- AREA RANGE TESTS
-- ==================================================

-- Test 17: Search by area range (1000-2000 sq ft)
SELECT 
    property_type, 
    title, 
    area, 
    area_unit, 
    price, 
    city 
FROM search_all_properties(
    p_area_min := 1000,
    p_area_max := 2000
) 
ORDER BY area ASC 
LIMIT 10;

-- Test 18: Large properties (above 3000 sq ft)
SELECT 
    property_type, 
    title, 
    area, 
    area_unit, 
    price, 
    city 
FROM search_all_properties(
    p_area_min := 3000
) 
ORDER BY area DESC 
LIMIT 10;

-- ==================================================
-- LOCATION SPECIFIC TESTS
-- ==================================================

-- Test 19: Search in specific city and state
SELECT 
    property_type, 
    title, 
    city, 
    state, 
    price, 
    total_count 
FROM search_all_properties(
    p_city := 'Hyderabad',
    p_state := 'Telangana'
) 
ORDER BY price ASC 
LIMIT 15;

-- Test 20: Search in multiple locations (state-wide)
SELECT 
    property_type, 
    title, 
    city, 
    state, 
    price 
FROM search_all_properties(
    p_state := 'Telangana'
) 
ORDER BY city, price 
LIMIT 20;

-- ==================================================
-- COMPLEX COMBINATION TESTS
-- ==================================================

-- Test 21: Complex residential search (3BHK, 2+ bath, 1500+ sq ft, 30K-80K)
SELECT 
    property_type, 
    title, 
    bedrooms, 
    bathrooms, 
    area, 
    price, 
    city 
FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 3,
    p_bathrooms := 2,
    p_area_min := 1500,
    p_min_price := 30000,
    p_max_price := 80000
) 
ORDER BY price ASC 
LIMIT 10;

-- Test 22: Commercial office search with area and price filters
SELECT 
    property_type, 
    title, 
    area, 
    price, 
    city 
FROM search_all_properties(
    p_search_query := 'office',
    p_property_type := 'commercial',
    p_area_min := 500,
    p_min_price := 20000,
    p_max_price := 100000
) 
ORDER BY area DESC 
LIMIT 10;

-- Test 23: Land search with specific type and area
SELECT 
    property_type, 
    title, 
    area, 
    area_unit, 
    land_type, 
    price, 
    city 
FROM search_all_properties(
    p_property_type := 'land',
    p_property_subtype := 'agricultural',
    p_area_min := 1000,
    p_max_price := 500000
) 
ORDER BY area DESC 
LIMIT 10;

-- ==================================================
-- PAGINATION TESTS
-- ==================================================

-- Test 24: Pagination - First page (offset 0, limit 5)
SELECT 
    property_type, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties(
    p_limit := 5,
    p_offset := 0
) 
ORDER BY created_at DESC;

-- Test 25: Pagination - Second page (offset 5, limit 5)
SELECT 
    property_type, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties(
    p_limit := 5,
    p_offset := 5
) 
ORDER BY created_at DESC;

-- Test 26: Pagination - Third page (offset 10, limit 5)
SELECT 
    property_type, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties(
    p_limit := 5,
    p_offset := 10
) 
ORDER BY created_at DESC;

-- ==================================================
-- COORDINATE AND MAPPING TESTS
-- ==================================================

-- Test 27: Properties with coordinates (for map display)
SELECT 
    property_type, 
    title, 
    city, 
    latitude, 
    longitude, 
    price 
FROM search_all_properties() 
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 28: Properties in Hyderabad with coordinates
SELECT 
    property_type, 
    title, 
    city, 
    latitude, 
    longitude, 
    price 
FROM search_all_properties(
    p_city := 'Hyderabad'
) 
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
ORDER BY price ASC 
LIMIT 15;

-- ==================================================
-- EDGE CASE TESTS
-- ==================================================

-- Test 29: Search with empty/null parameters
SELECT 
    property_type, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties(
    p_search_query := NULL,
    p_city := NULL,
    p_property_type := NULL
) 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 30: Search with invalid property type (should return no results)
SELECT 
    property_type, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties(
    p_property_type := 'invalid_type'
) 
ORDER BY created_at DESC 
LIMIT 10;

-- Test 31: Search with very high price range (edge case)
SELECT 
    property_type, 
    title, 
    price, 
    city, 
    total_count 
FROM search_all_properties(
    p_min_price := 1000000,
    p_max_price := 10000000
) 
ORDER BY price DESC 
LIMIT 10;

-- ==================================================
-- PERFORMANCE TESTS
-- ==================================================

-- Test 32: Large limit test (performance check)
SELECT 
    COUNT(*) as result_count,
    MAX(total_count) as reported_total
FROM search_all_properties(
    p_limit := 100
);

-- Test 33: Count verification test
SELECT 
    property_type,
    COUNT(*) as actual_count
FROM search_all_properties(
    p_limit := 1000
) 
GROUP BY property_type 
ORDER BY property_type;

-- Test 34: Performance test with complex filters
EXPLAIN ANALYZE
SELECT 
    property_type, 
    title, 
    price, 
    city 
FROM search_all_properties(
    p_search_query := 'apartment',
    p_city := 'Hyderabad',
    p_min_price := 10000,
    p_max_price := 50000,
    p_bedrooms := 2,
    p_area_min := 1000
) 
ORDER BY price ASC 
LIMIT 20;

-- ==================================================
-- DATA VALIDATION TESTS
-- ==================================================

-- Test 35: Validate total_count consistency
WITH search_results AS (
    SELECT total_count FROM search_all_properties(p_limit := 10) LIMIT 1
),
actual_count AS (
    SELECT COUNT(*) as actual FROM search_all_properties(p_limit := 10000)
)
SELECT 
    sr.total_count as reported_total,
    ac.actual as actual_total,
    CASE 
        WHEN sr.total_count = ac.actual THEN 'PASS'
        ELSE 'FAIL'
    END as test_result
FROM search_results sr, actual_count ac;

-- Test 36: Validate property type distribution
SELECT 
    property_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM search_all_properties(p_limit := 100)
GROUP BY property_type
ORDER BY count DESC;

-- End of file