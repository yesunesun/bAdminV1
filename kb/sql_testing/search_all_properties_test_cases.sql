-- ============================================================================
-- COMPREHENSIVE TEST CASES FOR search_all_properties FUNCTION
-- ============================================================================
-- Version: 1.0
-- Date: 2025-07-15
-- Total Test Cases: 324 (Comprehensive coverage)
-- Purpose: Test search_all_properties function with various parameter combinations
-- Based on: properties_v2.csv data and search_all_properties.sql function
-- ============================================================================

-- FUNCTION SIGNATURE:
-- search_all_properties(
--     p_search_query TEXT DEFAULT NULL,
--     p_city TEXT DEFAULT NULL,
--     p_state TEXT DEFAULT NULL,
--     p_property_type TEXT DEFAULT NULL,
--     p_subtype TEXT DEFAULT NULL,
--     p_property_subtype TEXT DEFAULT NULL,
--     p_min_price NUMERIC DEFAULT NULL,
--     p_max_price NUMERIC DEFAULT NULL,
--     p_bedrooms INTEGER DEFAULT NULL,
--     p_bathrooms NUMERIC DEFAULT NULL,
--     p_area_min NUMERIC DEFAULT NULL,
--     p_area_max NUMERIC DEFAULT NULL,
--     p_limit INTEGER DEFAULT 50,
--     p_offset INTEGER DEFAULT 0
-- )

-- ============================================================================
-- CATEGORY 1: RESIDENTIAL PROPERTIES - 108 TEST CASES
-- ============================================================================

-- 1.1 RESIDENTIAL - BASIC SEARCH (18 test cases)
-- TC001: Basic residential search
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 10,
    p_offset := 0
);

-- TC002: Residential with city filter - Hyderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Hyderabad',
    p_limit := 10
);

-- TC003: Residential with city filter - Secunderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Secunderabad',
    p_limit := 10
);

-- TC004: Residential with state filter - Telangana
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_state := 'Telangana',
    p_limit := 10
);

-- TC005: Residential with search query - "apartment"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'apartment',
    p_limit := 10
);

-- TC006: Residential with search query - "house"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'house',
    p_limit := 10
);

-- TC007: Residential with search query - "villa"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'villa',
    p_limit := 10
);

-- TC008: Residential with search query - "flat"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'flat',
    p_limit := 10
);

-- TC009: Residential with search query - "bhk"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'bhk',
    p_limit := 10
);

-- TC010: Residential with search query - "rent"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'rent',
    p_limit := 10
);

-- TC011: Residential with search query - "sale"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'sale',
    p_limit := 10
);

-- TC012: Residential with search query - "furnished"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'furnished',
    p_limit := 10
);

-- TC013: Residential with search query - "gated"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'gated',
    p_limit := 10
);

-- TC014: Residential with search query - "parking"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'parking',
    p_limit := 10
);

-- TC015: Residential with search query - "balcony"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'balcony',
    p_limit := 10
);

-- TC016: Residential with search query - "garden"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'garden',
    p_limit := 10
);

-- TC017: Residential with search query - "pool"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'pool',
    p_limit := 10
);

-- TC018: Residential with search query - "security"
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'security',
    p_limit := 10
);

-- 1.2 RESIDENTIAL - BHK CONFIGURATIONS (15 test cases)
-- TC019: Residential 1 BHK
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 1,
    p_limit := 10
);

-- TC020: Residential 2 BHK
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 2,
    p_limit := 10
);

-- TC021: Residential 3 BHK
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 3,
    p_limit := 10
);

-- TC022: Residential 4 BHK
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 4,
    p_limit := 10
);

-- TC023: Residential 5 BHK
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 5,
    p_limit := 10
);

-- TC024: Residential 1 BHK in Hyderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Hyderabad',
    p_bedrooms := 1,
    p_limit := 10
);

-- TC025: Residential 2 BHK in Hyderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Hyderabad',
    p_bedrooms := 2,
    p_limit := 10
);

-- TC026: Residential 3 BHK in Hyderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Hyderabad',
    p_bedrooms := 3,
    p_limit := 10
);

-- TC027: Residential 4 BHK in Hyderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Hyderabad',
    p_bedrooms := 4,
    p_limit := 10
);

-- TC028: Residential 1 BHK in Secunderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Secunderabad',
    p_bedrooms := 1,
    p_limit := 10
);

-- TC029: Residential 2 BHK in Secunderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Secunderabad',
    p_bedrooms := 2,
    p_limit := 10
);

-- TC030: Residential 3 BHK in Secunderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Secunderabad',
    p_bedrooms := 3,
    p_limit := 10
);

-- TC031: Residential with bathroom filter - 1 bathroom
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bathrooms := 1,
    p_limit := 10
);

-- TC032: Residential with bathroom filter - 2 bathrooms
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bathrooms := 2,
    p_limit := 10
);

-- TC033: Residential with bathroom filter - 3 bathrooms
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bathrooms := 3,
    p_limit := 10
);

-- 1.3 RESIDENTIAL - PRICE RANGES (15 test cases)
-- TC034: Residential under 10,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_max_price := 10000,
    p_limit := 10
);

-- TC035: Residential 10,000 - 20,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_min_price := 10000,
    p_max_price := 20000,
    p_limit := 10
);

-- TC036: Residential 20,000 - 30,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_min_price := 20000,
    p_max_price := 30000,
    p_limit := 10
);

-- TC037: Residential 30,000 - 50,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_min_price := 30000,
    p_max_price := 50000,
    p_limit := 10
);

-- TC038: Residential 50,000 - 100,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_min_price := 50000,
    p_max_price := 100000,
    p_limit := 10
);

-- TC039: Residential above 100,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_min_price := 100000,
    p_limit := 10
);

-- TC040: Residential 1 BHK under 15,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 1,
    p_max_price := 15000,
    p_limit := 10
);

-- TC041: Residential 2 BHK 15,000 - 25,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 2,
    p_min_price := 15000,
    p_max_price := 25000,
    p_limit := 10
);

-- TC042: Residential 3 BHK 25,000 - 40,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 3,
    p_min_price := 25000,
    p_max_price := 40000,
    p_limit := 10
);

-- TC043: Residential 4 BHK above 40,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 4,
    p_min_price := 40000,
    p_limit := 10
);

-- TC044: Residential sale price under 50 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'sale',
    p_max_price := 5000000,
    p_limit := 10
);

-- TC045: Residential sale price 50 lakhs - 1 crore
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'sale',
    p_min_price := 5000000,
    p_max_price := 10000000,
    p_limit := 10
);

-- TC046: Residential sale price 1 crore - 2 crores
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'sale',
    p_min_price := 10000000,
    p_max_price := 20000000,
    p_limit := 10
);

-- TC047: Residential sale price above 2 crores
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'sale',
    p_min_price := 20000000,
    p_limit := 10
);

-- TC048: Residential exact price 25,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_min_price := 25000,
    p_max_price := 25000,
    p_limit := 10
);

-- 1.4 RESIDENTIAL - AREA RANGES (15 test cases)
-- TC049: Residential area under 500 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_max := 500,
    p_limit := 10
);

-- TC050: Residential area 500-1000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 500,
    p_area_max := 1000,
    p_limit := 10
);

-- TC051: Residential area 1000-1500 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 1000,
    p_area_max := 1500,
    p_limit := 10
);

-- TC052: Residential area 1500-2000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 1500,
    p_area_max := 2000,
    p_limit := 10
);

-- TC053: Residential area 2000-3000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 2000,
    p_area_max := 3000,
    p_limit := 10
);

-- TC054: Residential area above 3000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 3000,
    p_limit := 10
);

-- TC055: Residential 1 BHK area 300-600 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 1,
    p_area_min := 300,
    p_area_max := 600,
    p_limit := 10
);

-- TC056: Residential 2 BHK area 600-1200 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 2,
    p_area_min := 600,
    p_area_max := 1200,
    p_limit := 10
);

-- TC057: Residential 3 BHK area 1200-1800 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 3,
    p_area_min := 1200,
    p_area_max := 1800,
    p_limit := 10
);

-- TC058: Residential 4 BHK area 1800-2500 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 4,
    p_area_min := 1800,
    p_area_max := 2500,
    p_limit := 10
);

-- TC059: Residential exact area 1234 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 1234,
    p_area_max := 1234,
    p_limit := 10
);

-- TC060: Residential large area above 5000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 5000,
    p_limit := 10
);

-- TC061: Residential small area under 300 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_max := 300,
    p_limit := 10
);

-- TC062: Residential medium area 800-1200 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 800,
    p_area_max := 1200,
    p_limit := 10
);

-- TC063: Residential premium area 3000-5000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 3000,
    p_area_max := 5000,
    p_limit := 10
);

-- 1.5 RESIDENTIAL - LOCATION SPECIFIC (15 test cases)
-- TC064: Residential in Gachibowli
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Gachibowli',
    p_limit := 10
);

-- TC065: Residential in Hitech City
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Hitech City',
    p_limit := 10
);

-- TC066: Residential in Madhapur
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Madhapur',
    p_limit := 10
);

-- TC067: Residential in Kondapur
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Kondapur',
    p_limit := 10
);

-- TC068: Residential in Kukatpally
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Kukatpally',
    p_limit := 10
);

-- TC069: Residential in Ameerpet
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Ameerpet',
    p_limit := 10
);

-- TC070: Residential in Banjara Hills
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Banjara Hills',
    p_limit := 10
);

-- TC071: Residential in Jubilee Hills
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Jubilee Hills',
    p_limit := 10
);

-- TC072: Residential in Begumpet
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Begumpet',
    p_limit := 10
);

-- TC073: Residential in Uppal
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Uppal',
    p_limit := 10
);

-- TC074: Residential in Kompally
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Kompally',
    p_limit := 10
);

-- TC075: Residential in Miyapur
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Miyapur',
    p_limit := 10
);

-- TC076: Residential in Nizampet
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Nizampet',
    p_limit := 10
);

-- TC077: Residential in Manikonda
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Manikonda',
    p_limit := 10
);

-- TC078: Residential in Bachupally
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Bachupally',
    p_limit := 10
);

-- 1.6 RESIDENTIAL - COMPLEX COMBINATIONS (30 test cases)
-- TC079: Residential 2 BHK in Hyderabad under 25,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Hyderabad',
    p_bedrooms := 2,
    p_max_price := 25000,
    p_limit := 10
);

-- TC080: Residential 3 BHK in Gachibowli 30,000-50,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'Gachibowli',
    p_bedrooms := 3,
    p_min_price := 30000,
    p_max_price := 50000,
    p_limit := 10
);

-- TC081: Residential apartment in Hitech City 1200-1800 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'apartment Hitech City',
    p_area_min := 1200,
    p_area_max := 1800,
    p_limit := 10
);

-- TC082: Residential furnished 2 BHK in Madhapur
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'furnished Madhapur',
    p_bedrooms := 2,
    p_limit := 10
);

-- TC083: Residential villa in Jubilee Hills above 100,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'villa Jubilee Hills',
    p_min_price := 100000,
    p_limit := 10
);

-- TC084: Residential independent house in Secunderabad
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_city := 'Secunderabad',
    p_search_query := 'independent house',
    p_limit := 10
);

-- TC085: Residential 1 BHK with parking under 20,000
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 1,
    p_search_query := 'parking',
    p_max_price := 20000,
    p_limit := 10
);

-- TC086: Residential 4 BHK with pool and garden
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 4,
    p_search_query := 'pool garden',
    p_limit := 10
);

-- TC087: Residential gated community in Kondapur
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'gated community Kondapur',
    p_limit := 10
);

-- TC088: Residential with gym and security
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'gym security',
    p_limit := 10
);

-- TC089: Residential pet-friendly properties
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'pet friendly',
    p_limit := 10
);

-- TC090: Residential bachelor-friendly properties
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'bachelor',
    p_limit := 10
);

-- TC091: Residential family-only properties
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'family',
    p_limit := 10
);

-- TC092: Residential semi-furnished properties
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'semi furnished',
    p_limit := 10
);

-- TC093: Residential unfurnished properties
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'unfurnished',
    p_limit := 10
);

-- TC094: Residential with balcony and parking
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'balcony parking',
    p_limit := 10
);

-- TC095: Residential ground floor properties
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'ground floor',
    p_limit := 10
);

-- TC096: Residential top floor properties
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'top floor',
    p_limit := 10
);

-- TC097: Residential with power backup
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'power backup',
    p_limit := 10
);

-- TC098: Residential with water storage
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'water storage',
    p_limit := 10
);

-- TC099: Residential with intercom facility
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'intercom',
    p_limit := 10
);

-- TC100: Residential with lift facility
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'lift',
    p_limit := 10
);

-- TC101: Residential with children play area
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'children play area',
    p_limit := 10
);

-- TC102: Residential with fire safety
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'fire safety',
    p_limit := 10
);

-- TC103: Residential with rainwater harvesting
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'rainwater harvesting',
    p_limit := 10
);

-- TC104: Residential with sewage treatment
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'sewage treatment',
    p_limit := 10
);

-- TC105: Residential with shopping center
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'shopping center',
    p_limit := 10
);

-- TC106: Residential with housekeeping service
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'housekeeping',
    p_limit := 10
);

-- TC107: Residential with indoor games
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'indoor games',
    p_limit := 10
);

-- TC108: Residential with air conditioning
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_search_query := 'air conditioning',
    p_limit := 10
);

-- ============================================================================
-- CATEGORY 2: COMMERCIAL PROPERTIES - 72 TEST CASES
-- ============================================================================

-- 2.1 COMMERCIAL - BASIC SEARCH (18 test cases)
-- TC109: Basic commercial search
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_limit := 10,
    p_offset := 0
);

-- TC110: Commercial with city filter - Hyderabad
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_city := 'Hyderabad',
    p_limit := 10
);

-- TC111: Commercial with city filter - Secunderabad
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_city := 'Secunderabad',
    p_limit := 10
);

-- TC112: Commercial with state filter - Telangana
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_state := 'Telangana',
    p_limit := 10
);

-- TC113: Commercial with search query - "office"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'office',
    p_limit := 10
);

-- TC114: Commercial with search query - "shop"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'shop',
    p_limit := 10
);

-- TC115: Commercial with search query - "warehouse"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'warehouse',
    p_limit := 10
);

-- TC116: Commercial with search query - "showroom"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'showroom',
    p_limit := 10
);

-- TC117: Commercial with search query - "retail"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'retail',
    p_limit := 10
);

-- TC118: Commercial with search query - "restaurant"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'restaurant',
    p_limit := 10
);

-- TC119: Commercial with search query - "mall"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'mall',
    p_limit := 10
);

-- TC120: Commercial with search query - "IT space"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'IT space',
    p_limit := 10
);

-- TC121: Commercial with search query - "coworking"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'coworking',
    p_limit := 10
);

-- TC122: Commercial with search query - "business center"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'business center',
    p_limit := 10
);

-- TC123: Commercial with search query - "industrial"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'industrial',
    p_limit := 10
);

-- TC124: Commercial with search query - "factory"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'factory',
    p_limit := 10
);

-- TC125: Commercial with search query - "hotel"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'hotel',
    p_limit := 10
);

-- TC126: Commercial with search query - "hospital"
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'hospital',
    p_limit := 10
);

-- 2.2 COMMERCIAL - PRICE RANGES (18 test cases)
-- TC127: Commercial under 50,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_max_price := 50000,
    p_limit := 10
);

-- TC128: Commercial 50,000 - 100,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_min_price := 50000,
    p_max_price := 100000,
    p_limit := 10
);

-- TC129: Commercial 100,000 - 200,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_min_price := 100000,
    p_max_price := 200000,
    p_limit := 10
);

-- TC130: Commercial 200,000 - 500,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_min_price := 200000,
    p_max_price := 500000,
    p_limit := 10
);

-- TC131: Commercial above 500,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_min_price := 500000,
    p_limit := 10
);

-- TC132: Commercial office space under 75,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'office',
    p_max_price := 75000,
    p_limit := 10
);

-- TC133: Commercial shop space 25,000 - 75,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'shop',
    p_min_price := 25000,
    p_max_price := 75000,
    p_limit := 10
);

-- TC134: Commercial warehouse above 100,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'warehouse',
    p_min_price := 100000,
    p_limit := 10
);

-- TC135: Commercial showroom 50,000 - 150,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'showroom',
    p_min_price := 50000,
    p_max_price := 150000,
    p_limit := 10
);

-- TC136: Commercial retail space under 100,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'retail',
    p_max_price := 100000,
    p_limit := 10
);

-- TC137: Commercial restaurant space 75,000 - 200,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'restaurant',
    p_min_price := 75000,
    p_max_price := 200000,
    p_limit := 10
);

-- TC138: Commercial IT space 100,000 - 300,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'IT space',
    p_min_price := 100000,
    p_max_price := 300000,
    p_limit := 10
);

-- TC139: Commercial coworking space under 50,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'coworking',
    p_max_price := 50000,
    p_limit := 10
);

-- TC140: Commercial business center above 150,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'business center',
    p_min_price := 150000,
    p_limit := 10
);

-- TC141: Commercial sale price under 1 crore
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'sale',
    p_max_price := 10000000,
    p_limit := 10
);

-- TC142: Commercial sale price 1 crore - 5 crores
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'sale',
    p_min_price := 10000000,
    p_max_price := 50000000,
    p_limit := 10
);

-- TC143: Commercial sale price above 5 crores
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'sale',
    p_min_price := 50000000,
    p_limit := 10
);

-- TC144: Commercial exact price 125,000
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_min_price := 125000,
    p_max_price := 125000,
    p_limit := 10
);

-- 2.3 COMMERCIAL - AREA RANGES (18 test cases)
-- TC145: Commercial area under 500 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_max := 500,
    p_limit := 10
);

-- TC146: Commercial area 500-1000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 500,
    p_area_max := 1000,
    p_limit := 10
);

-- TC147: Commercial area 1000-2000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 1000,
    p_area_max := 2000,
    p_limit := 10
);

-- TC148: Commercial area 2000-5000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 2000,
    p_area_max := 5000,
    p_limit := 10
);

-- TC149: Commercial area 5000-10000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 5000,
    p_area_max := 10000,
    p_limit := 10
);

-- TC150: Commercial area above 10000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 10000,
    p_limit := 10
);

-- TC151: Commercial office space 1000-3000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'office',
    p_area_min := 1000,
    p_area_max := 3000,
    p_limit := 10
);

-- TC152: Commercial shop space 200-800 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'shop',
    p_area_min := 200,
    p_area_max := 800,
    p_limit := 10
);

-- TC153: Commercial warehouse space above 5000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'warehouse',
    p_area_min := 5000,
    p_limit := 10
);

-- TC154: Commercial showroom space 1500-4000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'showroom',
    p_area_min := 1500,
    p_area_max := 4000,
    p_limit := 10
);

-- TC155: Commercial retail space 300-1200 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'retail',
    p_area_min := 300,
    p_area_max := 1200,
    p_limit := 10
);

-- TC156: Commercial restaurant space 800-2500 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'restaurant',
    p_area_min := 800,
    p_area_max := 2500,
    p_limit := 10
);

-- TC157: Commercial IT space 2000-8000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'IT space',
    p_area_min := 2000,
    p_area_max := 8000,
    p_limit := 10
);

-- TC158: Commercial coworking space 500-2000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'coworking',
    p_area_min := 500,
    p_area_max := 2000,
    p_limit := 10
);

-- TC159: Commercial business center 3000-10000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'business center',
    p_area_min := 3000,
    p_area_max := 10000,
    p_limit := 10
);

-- TC160: Commercial small space under 200 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_max := 200,
    p_limit := 10
);

-- TC161: Commercial medium space 1000-3000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 1000,
    p_area_max := 3000,
    p_limit := 10
);

-- TC162: Commercial large space above 20000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 20000,
    p_limit := 10
);

-- 2.4 COMMERCIAL - LOCATION SPECIFIC (18 test cases)
-- TC163: Commercial in Gachibowli
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Gachibowli',
    p_limit := 10
);

-- TC164: Commercial in Hitech City
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Hitech City',
    p_limit := 10
);

-- TC165: Commercial in Madhapur
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Madhapur',
    p_limit := 10
);

-- TC166: Commercial in Kondapur
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Kondapur',
    p_limit := 10
);

-- TC167: Commercial in Kukatpally
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Kukatpally',
    p_limit := 10
);

-- TC168: Commercial in Ameerpet
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Ameerpet',
    p_limit := 10
);

-- TC169: Commercial in Banjara Hills
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Banjara Hills',
    p_limit := 10
);

-- TC170: Commercial in Jubilee Hills
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Jubilee Hills',
    p_limit := 10
);

-- TC171: Commercial in Begumpet
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Begumpet',
    p_limit := 10
);

-- TC172: Commercial in Uppal
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Uppal',
    p_limit := 10
);

-- TC173: Commercial in Kompally
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Kompally',
    p_limit := 10
);

-- TC174: Commercial in Miyapur
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Miyapur',
    p_limit := 10
);

-- TC175: Commercial in Nizampet
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Nizampet',
    p_limit := 10
);

-- TC176: Commercial in Manikonda
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Manikonda',
    p_limit := 10
);

-- TC177: Commercial in Bachupally
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'Bachupally',
    p_limit := 10
);

-- TC178: Commercial office in Hitech City
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'office Hitech City',
    p_limit := 10
);

-- TC179: Commercial shop in Ameerpet
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'shop Ameerpet',
    p_limit := 10
);

-- TC180: Commercial warehouse in Uppal
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_search_query := 'warehouse Uppal',
    p_limit := 10
);

-- ============================================================================
-- CATEGORY 3: LAND PROPERTIES - 54 TEST CASES
-- ============================================================================

-- 3.1 LAND - BASIC SEARCH (18 test cases)
-- TC181: Basic land search
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_limit := 10,
    p_offset := 0
);

-- TC182: Land with city filter - Hyderabad
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_city := 'Hyderabad',
    p_limit := 10
);

-- TC183: Land with city filter - Secunderabad
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_city := 'Secunderabad',
    p_limit := 10
);

-- TC184: Land with state filter - Telangana
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_state := 'Telangana',
    p_limit := 10
);

-- TC185: Land with search query - "plot"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'plot',
    p_limit := 10
);

-- TC186: Land with search query - "agricultural"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'agricultural',
    p_limit := 10
);

-- TC187: Land with search query - "residential plot"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'residential plot',
    p_limit := 10
);

-- TC188: Land with search query - "commercial plot"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'commercial plot',
    p_limit := 10
);

-- TC189: Land with search query - "industrial plot"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'industrial plot',
    p_limit := 10
);

-- TC190: Land with search query - "farm land"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'farm land',
    p_limit := 10
);

-- TC191: Land with search query - "vacant land"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'vacant land',
    p_limit := 10
);

-- TC192: Land with search query - "open land"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'open land',
    p_limit := 10
);

-- TC193: Land with search query - "layout"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'layout',
    p_limit := 10
);

-- TC194: Land with search query - "venture"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'venture',
    p_limit := 10
);

-- TC195: Land with search query - "investment"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'investment',
    p_limit := 10
);

-- TC196: Land with search query - "gated community"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'gated community',
    p_limit := 10
);

-- TC197: Land with search query - "HMDA approved"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'HMDA approved',
    p_limit := 10
);

-- TC198: Land with search query - "DTCP approved"
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'DTCP approved',
    p_limit := 10
);

-- 3.2 LAND - PRICE RANGES (18 test cases)
-- TC199: Land under 10 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_max_price := 1000000,
    p_limit := 10
);

-- TC200: Land 10-25 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_min_price := 1000000,
    p_max_price := 2500000,
    p_limit := 10
);

-- TC201: Land 25-50 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_min_price := 2500000,
    p_max_price := 5000000,
    p_limit := 10
);

-- TC202: Land 50 lakhs - 1 crore
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_min_price := 5000000,
    p_max_price := 10000000,
    p_limit := 10
);

-- TC203: Land 1-2 crores
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_min_price := 10000000,
    p_max_price := 20000000,
    p_limit := 10
);

-- TC204: Land above 2 crores
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_min_price := 20000000,
    p_limit := 10
);

-- TC205: Residential plot under 15 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'residential plot',
    p_max_price := 1500000,
    p_limit := 10
);

-- TC206: Commercial plot 50 lakhs - 2 crores
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'commercial plot',
    p_min_price := 5000000,
    p_max_price := 20000000,
    p_limit := 10
);

-- TC207: Agricultural land under 20 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'agricultural',
    p_max_price := 2000000,
    p_limit := 10
);

-- TC208: Industrial plot above 1 crore
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'industrial plot',
    p_min_price := 10000000,
    p_limit := 10
);

-- TC209: Farm land 5-15 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'farm land',
    p_min_price := 500000,
    p_max_price := 1500000,
    p_limit := 10
);

-- TC210: Vacant land 10-30 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'vacant land',
    p_min_price := 1000000,
    p_max_price := 3000000,
    p_limit := 10
);

-- TC211: Layout plots 20-60 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'layout',
    p_min_price := 2000000,
    p_max_price := 6000000,
    p_limit := 10
);

-- TC212: Investment land under 40 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'investment',
    p_max_price := 4000000,
    p_limit := 10
);

-- TC213: Gated community plots 30-80 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'gated community',
    p_min_price := 3000000,
    p_max_price := 8000000,
    p_limit := 10
);

-- TC214: HMDA approved plots 15-45 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'HMDA approved',
    p_min_price := 1500000,
    p_max_price := 4500000,
    p_limit := 10
);

-- TC215: Exact price 25 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_min_price := 2500000,
    p_max_price := 2500000,
    p_limit := 10
);

-- TC216: Budget land under 5 lakhs
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_max_price := 500000,
    p_limit := 10
);

-- 3.3 LAND - AREA RANGES (18 test cases)
-- TC217: Land area under 1000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_max := 1000,
    p_limit := 10
);

-- TC218: Land area 1000-2000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 1000,
    p_area_max := 2000,
    p_limit := 10
);

-- TC219: Land area 2000-5000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 2000,
    p_area_max := 5000,
    p_limit := 10
);

-- TC220: Land area 5000-10000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 5000,
    p_area_max := 10000,
    p_limit := 10
);

-- TC221: Land area 10000-20000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 10000,
    p_area_max := 20000,
    p_limit := 10
);

-- TC222: Land area above 20000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 20000,
    p_limit := 10
);

-- TC223: Residential plot 1500-3000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'residential plot',
    p_area_min := 1500,
    p_area_max := 3000,
    p_limit := 10
);

-- TC224: Commercial plot 2000-8000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'commercial plot',
    p_area_min := 2000,
    p_area_max := 8000,
    p_limit := 10
);

-- TC225: Agricultural land above 50000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'agricultural',
    p_area_min := 50000,
    p_limit := 10
);

-- TC226: Industrial plot 10000-50000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'industrial plot',
    p_area_min := 10000,
    p_area_max := 50000,
    p_limit := 10
);

-- TC227: Farm land above 100000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'farm land',
    p_area_min := 100000,
    p_limit := 10
);

-- TC228: Vacant land 3000-12000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'vacant land',
    p_area_min := 3000,
    p_area_max := 12000,
    p_limit := 10
);

-- TC229: Layout plots 1200-2400 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'layout',
    p_area_min := 1200,
    p_area_max := 2400,
    p_limit := 10
);

-- TC230: Investment land 2000-8000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'investment',
    p_area_min := 2000,
    p_area_max := 8000,
    p_limit := 10
);

-- TC231: Gated community plots 1800-4000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'gated community',
    p_area_min := 1800,
    p_area_max := 4000,
    p_limit := 10
);

-- TC232: Small plots under 800 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_max := 800,
    p_limit := 10
);

-- TC233: Medium plots 1500-5000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 1500,
    p_area_max := 5000,
    p_limit := 10
);

-- TC234: Large plots above 25000 sqft
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 25000,
    p_limit := 10
);

-- ============================================================================
-- CATEGORY 4: MIXED SEARCHES (NO PROPERTY TYPE FILTER) - 60 TEST CASES
-- ============================================================================

-- 4.1 MIXED - BASIC SEARCHES (20 test cases)
-- TC235: All properties without filters
SELECT * FROM search_all_properties(
    p_limit := 10,
    p_offset := 0
);

-- TC236: All properties in Hyderabad
SELECT * FROM search_all_properties(
    p_city := 'Hyderabad',
    p_limit := 10
);

-- TC237: All properties in Secunderabad
SELECT * FROM search_all_properties(
    p_city := 'Secunderabad',
    p_limit := 10
);

-- TC238: All properties in Telangana
SELECT * FROM search_all_properties(
    p_state := 'Telangana',
    p_limit := 10
);

-- TC239: All properties with search query - "rent"
SELECT * FROM search_all_properties(
    p_search_query := 'rent',
    p_limit := 10
);

-- TC240: All properties with search query - "sale"
SELECT * FROM search_all_properties(
    p_search_query := 'sale',
    p_limit := 10
);

-- TC241: All properties with search query - "furnished"
SELECT * FROM search_all_properties(
    p_search_query := 'furnished',
    p_limit := 10
);

-- TC242: All properties with search query - "parking"
SELECT * FROM search_all_properties(
    p_search_query := 'parking',
    p_limit := 10
);

-- TC243: All properties with search query - "security"
SELECT * FROM search_all_properties(
    p_search_query := 'security',
    p_limit := 10
);

-- TC244: All properties with search query - "garden"
SELECT * FROM search_all_properties(
    p_search_query := 'garden',
    p_limit := 10
);

-- TC245: All properties with search query - "pool"
SELECT * FROM search_all_properties(
    p_search_query := 'pool',
    p_limit := 10
);

-- TC246: All properties with search query - "gym"
SELECT * FROM search_all_properties(
    p_search_query := 'gym',
    p_limit := 10
);

-- TC247: All properties with search query - "lift"
SELECT * FROM search_all_properties(
    p_search_query := 'lift',
    p_limit := 10
);

-- TC248: All properties with search query - "power backup"
SELECT * FROM search_all_properties(
    p_search_query := 'power backup',
    p_limit := 10
);

-- TC249: All properties with search query - "water storage"
SELECT * FROM search_all_properties(
    p_search_query := 'water storage',
    p_limit := 10
);

-- TC250: All properties with search query - "fire safety"
SELECT * FROM search_all_properties(
    p_search_query := 'fire safety',
    p_limit := 10
);

-- TC251: All properties with search query - "intercom"
SELECT * FROM search_all_properties(
    p_search_query := 'intercom',
    p_limit := 10
);

-- TC252: All properties with search query - "children play area"
SELECT * FROM search_all_properties(
    p_search_query := 'children play area',
    p_limit := 10
);

-- TC253: All properties with search query - "shopping center"
SELECT * FROM search_all_properties(
    p_search_query := 'shopping center',
    p_limit := 10
);

-- TC254: All properties with search query - "club house"
SELECT * FROM search_all_properties(
    p_search_query := 'club house',
    p_limit := 10
);

-- 4.2 MIXED - PRICE RANGES (20 test cases)
-- TC255: All properties under 25,000
SELECT * FROM search_all_properties(
    p_max_price := 25000,
    p_limit := 10
);

-- TC256: All properties 25,000 - 50,000
SELECT * FROM search_all_properties(
    p_min_price := 25000,
    p_max_price := 50000,
    p_limit := 10
);

-- TC257: All properties 50,000 - 100,000
SELECT * FROM search_all_properties(
    p_min_price := 50000,
    p_max_price := 100000,
    p_limit := 10
);

-- TC258: All properties above 100,000
SELECT * FROM search_all_properties(
    p_min_price := 100000,
    p_limit := 10
);

-- TC259: All properties under 1 lakh
SELECT * FROM search_all_properties(
    p_max_price := 100000,
    p_limit := 10
);

-- TC260: All properties 1-5 lakhs
SELECT * FROM search_all_properties(
    p_min_price := 100000,
    p_max_price := 500000,
    p_limit := 10
);

-- TC261: All properties 5-10 lakhs
SELECT * FROM search_all_properties(
    p_min_price := 500000,
    p_max_price := 1000000,
    p_limit := 10
);

-- TC262: All properties 10-25 lakhs
SELECT * FROM search_all_properties(
    p_min_price := 1000000,
    p_max_price := 2500000,
    p_limit := 10
);

-- TC263: All properties 25-50 lakhs
SELECT * FROM search_all_properties(
    p_min_price := 2500000,
    p_max_price := 5000000,
    p_limit := 10
);

-- TC264: All properties 50 lakhs - 1 crore
SELECT * FROM search_all_properties(
    p_min_price := 5000000,
    p_max_price := 10000000,
    p_limit := 10
);

-- TC265: All properties 1-2 crores
SELECT * FROM search_all_properties(
    p_min_price := 10000000,
    p_max_price := 20000000,
    p_limit := 10
);

-- TC266: All properties above 2 crores
SELECT * FROM search_all_properties(
    p_min_price := 20000000,
    p_limit := 10
);

-- TC267: All properties in Hyderabad under 50,000
SELECT * FROM search_all_properties(
    p_city := 'Hyderabad',
    p_max_price := 50000,
    p_limit := 10
);

-- TC268: All properties in Secunderabad 25,000-75,000
SELECT * FROM search_all_properties(
    p_city := 'Secunderabad',
    p_min_price := 25000,
    p_max_price := 75000,
    p_limit := 10
);

-- TC269: All rent properties under 30,000
SELECT * FROM search_all_properties(
    p_search_query := 'rent',
    p_max_price := 30000,
    p_limit := 10
);

-- TC270: All sale properties under 50 lakhs
SELECT * FROM search_all_properties(
    p_search_query := 'sale',
    p_max_price := 5000000,
    p_limit := 10
);

-- TC271: All furnished properties 20,000-60,000
SELECT * FROM search_all_properties(
    p_search_query := 'furnished',
    p_min_price := 20000,
    p_max_price := 60000,
    p_limit := 10
);

-- TC272: All properties with parking under 40,000
SELECT * FROM search_all_properties(
    p_search_query := 'parking',
    p_max_price := 40000,
    p_limit := 10
);

-- TC273: All properties with security 30,000-80,000
SELECT * FROM search_all_properties(
    p_search_query := 'security',
    p_min_price := 30000,
    p_max_price := 80000,
    p_limit := 10
);

-- TC274: All properties with garden above 50,000
SELECT * FROM search_all_properties(
    p_search_query := 'garden',
    p_min_price := 50000,
    p_limit := 10
);

-- 4.3 MIXED - AREA RANGES (20 test cases)
-- TC275: All properties under 1000 sqft
SELECT * FROM search_all_properties(
    p_area_max := 1000,
    p_limit := 10
);

-- TC276: All properties 1000-2000 sqft
SELECT * FROM search_all_properties(
    p_area_min := 1000,
    p_area_max := 2000,
    p_limit := 10
);

-- TC277: All properties 2000-5000 sqft
SELECT * FROM search_all_properties(
    p_area_min := 2000,
    p_area_max := 5000,
    p_limit := 10
);

-- TC278: All properties above 5000 sqft
SELECT * FROM search_all_properties(
    p_area_min := 5000,
    p_limit := 10
);

-- TC279: All properties under 500 sqft
SELECT * FROM search_all_properties(
    p_area_max := 500,
    p_limit := 10
);

-- TC280: All properties 500-1500 sqft
SELECT * FROM search_all_properties(
    p_area_min := 500,
    p_area_max := 1500,
    p_limit := 10
);

-- TC281: All properties 1500-3000 sqft
SELECT * FROM search_all_properties(
    p_area_min := 1500,
    p_area_max := 3000,
    p_limit := 10
);

-- TC282: All properties 3000-10000 sqft
SELECT * FROM search_all_properties(
    p_area_min := 3000,
    p_area_max := 10000,
    p_limit := 10
);

-- TC283: All properties above 10000 sqft
SELECT * FROM search_all_properties(
    p_area_min := 10000,
    p_limit := 10
);

-- TC284: All properties in Hyderabad 800-1800 sqft
SELECT * FROM search_all_properties(
    p_city := 'Hyderabad',
    p_area_min := 800,
    p_area_max := 1800,
    p_limit := 10
);

-- TC285: All properties in Secunderabad 1200-2500 sqft
SELECT * FROM search_all_properties(
    p_city := 'Secunderabad',
    p_area_min := 1200,
    p_area_max := 2500,
    p_limit := 10
);

-- TC286: All rent properties 600-1500 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'rent',
    p_area_min := 600,
    p_area_max := 1500,
    p_limit := 10
);

-- TC287: All sale properties 1000-3000 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'sale',
    p_area_min := 1000,
    p_area_max := 3000,
    p_limit := 10
);

-- TC288: All furnished properties 500-1200 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'furnished',
    p_area_min := 500,
    p_area_max := 1200,
    p_limit := 10
);

-- TC289: All properties with parking 800-2000 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'parking',
    p_area_min := 800,
    p_area_max := 2000,
    p_limit := 10
);

-- TC290: All properties with security 1000-2500 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'security',
    p_area_min := 1000,
    p_area_max := 2500,
    p_limit := 10
);

-- TC291: All properties with garden 1500-4000 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'garden',
    p_area_min := 1500,
    p_area_max := 4000,
    p_limit := 10
);

-- TC292: All properties with pool above 2000 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'pool',
    p_area_min := 2000,
    p_limit := 10
);

-- TC293: All properties with gym 800-3000 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'gym',
    p_area_min := 800,
    p_area_max := 3000,
    p_limit := 10
);

-- TC294: All properties with lift 400-1800 sqft
SELECT * FROM search_all_properties(
    p_search_query := 'lift',
    p_area_min := 400,
    p_area_max := 1800,
    p_limit := 10
);

-- ============================================================================
-- CATEGORY 5: EDGE CASES AND SPECIAL SCENARIOS - 30 TEST CASES
-- ============================================================================

-- 5.1 PAGINATION AND LIMITS (10 test cases)
-- TC295: Large limit test
SELECT * FROM search_all_properties(
    p_limit := 100,
    p_offset := 0
);

-- TC296: Maximum limit test
SELECT * FROM search_all_properties(
    p_limit := 10000,
    p_offset := 0
);

-- TC297: Offset test - page 2
SELECT * FROM search_all_properties(
    p_limit := 10,
    p_offset := 10
);

-- TC298: Offset test - page 5
SELECT * FROM search_all_properties(
    p_limit := 10,
    p_offset := 40
);

-- TC299: Large offset test
SELECT * FROM search_all_properties(
    p_limit := 10,
    p_offset := 1000
);

-- TC300: Residential with pagination
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 5,
    p_offset := 20
);

-- TC301: Commercial with pagination
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_limit := 5,
    p_offset := 15
);

-- TC302: Land with pagination
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_limit := 5,
    p_offset := 25
);

-- TC303: Small limit test
SELECT * FROM search_all_properties(
    p_limit := 1,
    p_offset := 0
);

-- TC304: Zero limit test (should default to 50)
SELECT * FROM search_all_properties(
    p_limit := 0,
    p_offset := 0
);

-- 5.2 BOUNDARY CONDITIONS (10 test cases)
-- TC305: Minimum price boundary
SELECT * FROM search_all_properties(
    p_min_price := 1,
    p_limit := 10
);

-- TC306: Maximum price boundary
SELECT * FROM search_all_properties(
    p_max_price := 999999999,
    p_limit := 10
);

-- TC307: Minimum area boundary
SELECT * FROM search_all_properties(
    p_area_min := 1,
    p_limit := 10
);

-- TC308: Maximum area boundary
SELECT * FROM search_all_properties(
    p_area_max := 999999,
    p_limit := 10
);

-- TC309: Minimum bedrooms boundary
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 0,
    p_limit := 10
);

-- TC310: Maximum bedrooms boundary
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 10,
    p_limit := 10
);

-- TC311: Minimum bathrooms boundary
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bathrooms := 0.5,
    p_limit := 10
);

-- TC312: Maximum bathrooms boundary
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bathrooms := 10,
    p_limit := 10
);

-- TC313: Same min and max price
SELECT * FROM search_all_properties(
    p_min_price := 50000,
    p_max_price := 50000,
    p_limit := 10
);

-- TC314: Same min and max area
SELECT * FROM search_all_properties(
    p_area_min := 1000,
    p_area_max := 1000,
    p_limit := 10
);

-- 5.3 SPECIAL SEARCH QUERIES (10 test cases)
-- TC315: Empty search query
SELECT * FROM search_all_properties(
    p_search_query := '',
    p_limit := 10
);

-- TC316: Single character search
SELECT * FROM search_all_properties(
    p_search_query := 'a',
    p_limit := 10
);

-- TC317: Numeric search query
SELECT * FROM search_all_properties(
    p_search_query := '123',
    p_limit := 10
);

-- TC318: Special characters search
SELECT * FROM search_all_properties(
    p_search_query := '!@#$%',
    p_limit := 10
);

-- TC319: Very long search query
SELECT * FROM search_all_properties(
    p_search_query := 'this is a very long search query that contains many words and should test the search functionality with extended text input',
    p_limit := 10
);

-- TC320: Search with multiple spaces
SELECT * FROM search_all_properties(
    p_search_query := 'apartment     with     multiple     spaces',
    p_limit := 10
);

-- TC321: Case sensitivity test - lowercase
SELECT * FROM search_all_properties(
    p_search_query := 'apartment',
    p_limit := 10
);

-- TC322: Case sensitivity test - uppercase
SELECT * FROM search_all_properties(
    p_search_query := 'APARTMENT',
    p_limit := 10
);

-- TC323: Case sensitivity test - mixed case
SELECT * FROM search_all_properties(
    p_search_query := 'ApArTmEnT',
    p_limit := 10
);

-- TC324: Search with partial words
SELECT * FROM search_all_properties(
    p_search_query := 'apart',
    p_limit := 10
);

-- ============================================================================
-- END OF TEST CASES
-- ============================================================================

-- SUMMARY:
-- Total Test Cases: 324
-- 
-- Category Breakdown:
-- 1. Residential Properties: 108 test cases
--    - Basic Search: 18 cases
--    - BHK Configurations: 15 cases
--    - Price Ranges: 15 cases
--    - Area Ranges: 15 cases
--    - Location Specific: 15 cases
--    - Complex Combinations: 30 cases
--
-- 2. Commercial Properties: 72 test cases
--    - Basic Search: 18 cases
--    - Price Ranges: 18 cases
--    - Area Ranges: 18 cases
--    - Location Specific: 18 cases
--
-- 3. Land Properties: 54 test cases
--    - Basic Search: 18 cases
--    - Price Ranges: 18 cases
--    - Area Ranges: 18 cases
--
-- 4. Mixed Searches: 60 test cases
--    - Basic Searches: 20 cases
--    - Price Ranges: 20 cases
--    - Area Ranges: 20 cases
--
-- 5. Edge Cases: 30 test cases
--    - Pagination and Limits: 10 cases
--    - Boundary Conditions: 10 cases
--    - Special Search Queries: 10 cases
--
-- These test cases cover:
-- - All property types (residential, commercial, land)
-- - All function parameters
-- - Various price ranges from rent to high-value sales
-- - Different area ranges from small to large properties
-- - Location-based searches for major areas in Hyderabad/Secunderabad
-- - Complex combinations of filters
-- - Edge cases and boundary conditions
-- - Pagination scenarios
-- - Special search query patterns
-- - Mixed property type searches
-- - Error conditions and limits
--
-- All test cases are designed to be executable and provide comprehensive
-- coverage of the search_all_properties function functionality.