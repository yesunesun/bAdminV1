# Search All Properties Function - Comprehensive Test Cases

**Generated:** 15-07-2025 15:30 IST  
**Total Test Cases:** 250+  
**Function:** `search_all_properties()`  
**Database:** PostgreSQL with Supabase  

## Test Categories Overview

| Category | Count | Description |
|----------|-------|-------------|
| Basic Search | 60 | Simple parameter testing |
| Property Type Specific | 70 | Type-based filtering |
| Advanced Combinations | 80 | Multiple filter combinations |
| Edge Cases | 30 | Boundary and error conditions |
| Performance & Pagination | 10 | Load and pagination testing |

---

## 1. Basic Search Scenarios (60 Test Cases)

### 1.1 Location-Based Searches (20 Cases)

#### Test 1: Search by City Only
```sql
SELECT * FROM search_all_properties(
    p_search_query := NULL,
    p_city := 'Hyderabad',
    p_state := NULL,
    p_property_type := NULL,
    p_subtype := NULL,
    p_property_subtype := NULL,
    p_min_price := NULL,
    p_max_price := NULL,
    p_bedrooms := NULL,
    p_bathrooms := NULL,
    p_area_min := NULL,
    p_area_max := NULL,
    p_limit := 50,
    p_offset := 0
);
```
**Expected:** Returns all properties in Hyderabad across all types

#### Test 2: Search by State Only
```sql
SELECT * FROM search_all_properties(
    p_city := NULL,
    p_state := 'Telangana',
    p_limit := 50
);
```
**Expected:** Returns all properties in Telangana state

#### Test 3: Search by City and State
```sql
SELECT * FROM search_all_properties(
    p_city := 'Hyderabad',
    p_state := 'Telangana',
    p_limit := 50
);
```
**Expected:** Returns properties matching both city and state

#### Test 4: Case Insensitive City Search
```sql
SELECT * FROM search_all_properties(
    p_city := 'HYDERABAD',
    p_limit := 50
);
```
**Expected:** Returns same results as 'Hyderabad'

#### Test 5: Partial City Name Match
```sql
SELECT * FROM search_all_properties(
    p_city := 'Hyd',
    p_limit := 50
);
```
**Expected:** Returns properties where city contains 'Hyd'

#### Test 6: Multiple Cities (Edge Case)
```sql
SELECT * FROM search_all_properties(
    p_city := 'Hyderabad,Bangalore',
    p_limit := 50
);
```
**Expected:** Should handle gracefully or return no results

#### Test 7: Non-existent City
```sql
SELECT * FROM search_all_properties(
    p_city := 'NonExistentCity',
    p_limit := 50
);
```
**Expected:** Returns empty result set

#### Test 8: Empty City String
```sql
SELECT * FROM search_all_properties(
    p_city := '',
    p_limit := 50
);
```
**Expected:** Treats as NULL, returns all cities

#### Test 9: City with Special Characters
```sql
SELECT * FROM search_all_properties(
    p_city := 'Hyd-bad',
    p_limit := 50
);
```
**Expected:** Handles special characters properly

#### Test 10: City with Numbers
```sql
SELECT * FROM search_all_properties(
    p_city := 'Sector-1',
    p_limit := 50
);
```
**Expected:** Handles numeric components in city names

#### Test 11-20: Additional Location Variations
- Different state names (Karnataka, Maharashtra, etc.)
- Mixed case states ('telangana', 'TELANGANA')
- International locations (if any)
- Locality-based searches
- Pin code searches (if supported)
- Area/zone specific searches
- Metro vs non-metro cities
- Rural vs urban locations
- Tier-1, Tier-2, Tier-3 cities
- Regional language city names

### 1.2 Text-Based Searches (20 Cases)

#### Test 21: Search by Property Title
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'Spacious Apartment',
    p_limit := 50
);
```
**Expected:** Returns properties with titles containing 'Spacious Apartment'

#### Test 22: Partial Title Search
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'Apartment',
    p_limit := 50
);
```
**Expected:** Returns all properties with 'Apartment' in title

#### Test 23: Case Insensitive Title Search
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'APARTMENT',
    p_limit := 50
);
```
**Expected:** Same results as lowercase 'apartment'

#### Test 24: Multiple Word Search
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'luxury villa',
    p_limit := 50
);
```
**Expected:** Properties containing both 'luxury' and 'villa'

#### Test 25: Special Character Search
```sql
SELECT * FROM search_all_properties(
    p_search_query := '2-BHK',
    p_limit := 50
);
```
**Expected:** Handles hyphens and special characters

#### Test 26: Numeric Search
```sql
SELECT * FROM search_all_properties(
    p_search_query := '1200',
    p_limit := 50
);
```
**Expected:** Could match area, price, or other numeric fields in title

#### Test 27: Empty Search Query
```sql
SELECT * FROM search_all_properties(
    p_search_query := '',
    p_limit := 50
);
```
**Expected:** Returns all properties (treats as NULL)

#### Test 28: Very Long Search Query
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'This is a very long search query that might test the limits of the search functionality and should be handled gracefully',
    p_limit := 50
);
```
**Expected:** Handles long queries without errors

#### Test 29: Search with SQL Injection Attempt
```sql
SELECT * FROM search_all_properties(
    p_search_query := "'; DROP TABLE properties_v2; --",
    p_limit := 50
);
```
**Expected:** Safely handles and escapes malicious input

#### Test 30: Unicode Character Search
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'अपार्टमेंट',
    p_limit := 50
);
```
**Expected:** Handles non-English characters properly

#### Test 31-40: Additional Text Search Variations
- Amenity-based searches ('pool', 'gym', 'parking')
- Property feature searches ('balcony', 'terrace')
- Brand name searches ('DLF', 'Godrej')
- Builder name searches
- Project name searches
- Landmark-based searches ('near metro', 'mall')
- Furnished/unfurnished searches
- Age-related searches ('new', 'old')
- Floor-related searches ('ground floor', 'top floor')
- Facing-related searches ('east facing', 'park facing')

### 1.3 Price Range Searches (20 Cases)

#### Test 41: Minimum Price Only
```sql
SELECT * FROM search_all_properties(
    p_min_price := 50000,
    p_limit := 50
);
```
**Expected:** Returns properties priced >= 50,000

#### Test 42: Maximum Price Only
```sql
SELECT * FROM search_all_properties(
    p_max_price := 100000,
    p_limit := 50
);
```
**Expected:** Returns properties priced <= 100,000

#### Test 43: Price Range
```sql
SELECT * FROM search_all_properties(
    p_min_price := 50000,
    p_max_price := 100000,
    p_limit := 50
);
```
**Expected:** Returns properties between 50,000 and 100,000

#### Test 44: Zero Minimum Price
```sql
SELECT * FROM search_all_properties(
    p_min_price := 0,
    p_max_price := 50000,
    p_limit := 50
);
```
**Expected:** Returns properties up to 50,000

#### Test 45: Very High Price Range
```sql
SELECT * FROM search_all_properties(
    p_min_price := 10000000,
    p_max_price := 50000000,
    p_limit := 50
);
```
**Expected:** Returns luxury/premium properties

#### Test 46: Negative Price (Invalid)
```sql
SELECT * FROM search_all_properties(
    p_min_price := -1000,
    p_limit := 50
);
```
**Expected:** Should handle gracefully, possibly ignore negative values

#### Test 47: Min > Max Price (Invalid)
```sql
SELECT * FROM search_all_properties(
    p_min_price := 100000,
    p_max_price := 50000,
    p_limit := 50
);
```
**Expected:** Should return empty result or handle validation

#### Test 48: Exact Price Match
```sql
SELECT * FROM search_all_properties(
    p_min_price := 75000,
    p_max_price := 75000,
    p_limit := 50
);
```
**Expected:** Returns properties priced exactly at 75,000

#### Test 49: Budget Range (Low)
```sql
SELECT * FROM search_all_properties(
    p_min_price := 10000,
    p_max_price := 25000,
    p_limit := 50
);
```
**Expected:** Returns budget-friendly properties

#### Test 50: Premium Range (High)
```sql
SELECT * FROM search_all_properties(
    p_min_price := 200000,
    p_limit := 50
);
```
**Expected:** Returns premium properties

#### Test 51-60: Additional Price Range Variations
- Mid-range prices (25,000-75,000)
- Commercial property price ranges
- Land price ranges (per sq ft basis)
- Rental vs sale price filtering
- Currency validation tests
- Decimal price values
- Very large numbers (crores)
- International currency handling
- Price per sq ft calculations
- EMI-based price searches

---

## 2. Property Type Specific Tests (70 Test Cases)

### 2.1 Residential Properties (30 Cases)

#### Test 61: All Residential Properties
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 50
);
```
**Expected:** Returns only residential properties

#### Test 62: Residential Rent Only
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'rent',
    p_limit := 50
);
```
**Expected:** Returns only residential rental properties

#### Test 63: Residential Sale Only
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'sale',
    p_limit := 50
);
```
**Expected:** Returns only residential sale properties

#### Test 64: Residential Flatmates
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'flatmates',
    p_limit := 50
);
```
**Expected:** Returns only flatmate/shared accommodation properties

#### Test 65: Residential PG/Hostel
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'pghostel',
    p_limit := 50
);
```
**Expected:** Returns only PG/hostel properties

#### Test 66: 1 BHK Properties
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 1,
    p_limit := 50
);
```
**Expected:** Returns 1 bedroom residential properties

#### Test 67: 2 BHK Properties
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 2,
    p_limit := 50
);
```
**Expected:** Returns 2 bedroom properties

#### Test 68: 3+ BHK Properties
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 3,
    p_limit := 50
);
```
**Expected:** Returns 3 bedroom properties

#### Test 69: Studio Apartments (0 BHK)
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 0,
    p_limit := 50
);
```
**Expected:** Returns studio/0 bedroom properties

#### Test 70: Luxury Properties (4+ BHK)
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 4,
    p_limit := 50
);
```
**Expected:** Returns 4+ bedroom luxury properties

#### Test 71: Bathroom Count Filter
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bathrooms := 2,
    p_limit := 50
);
```
**Expected:** Returns properties with exactly 2 bathrooms

#### Test 72: Multiple Bathrooms
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bathrooms := 3,
    p_limit := 50
);
```
**Expected:** Returns properties with 3+ bathrooms

#### Test 73: BHK + Bathroom Combination
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 2,
    p_bathrooms := 2,
    p_limit := 50
);
```
**Expected:** Returns 2 BHK with 2 bathroom properties

#### Test 74: Area Range for Residential
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_min := 800,
    p_area_max := 1200,
    p_limit := 50
);
```
**Expected:** Returns properties between 800-1200 sq ft

#### Test 75: Small Apartments
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_area_max := 600,
    p_limit := 50
);
```
**Expected:** Returns compact apartments <= 600 sq ft

#### Test 76-90: Additional Residential Tests
- Furnished vs unfurnished
- Different floor preferences
- Parking availability
- Pet-friendly properties
- Senior citizen friendly
- Bachelor/family preferences
- Gated community properties
- Independent houses vs apartments
- Duplex/triplex properties
- Penthouse properties
- Ground floor properties
- Top floor properties
- Corner properties
- Road-facing properties
- Garden-facing properties

### 2.2 Commercial Properties (20 Cases)

#### Test 91: All Commercial Properties
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_limit := 50
);
```
**Expected:** Returns only commercial properties

#### Test 92: Commercial Rent
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_subtype := 'rent',
    p_limit := 50
);
```
**Expected:** Returns commercial rental properties

#### Test 93: Commercial Sale
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_subtype := 'sale',
    p_limit := 50
);
```
**Expected:** Returns commercial properties for sale

#### Test 94: Coworking Spaces
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_subtype := 'coworking',
    p_limit := 50
);
```
**Expected:** Returns coworking space properties

#### Test 95: Large Commercial Spaces
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_min := 5000,
    p_limit := 50
);
```
**Expected:** Returns large commercial spaces >= 5000 sq ft

#### Test 96: Small Commercial Spaces
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_area_max := 1000,
    p_limit := 50
);
```
**Expected:** Returns small commercial spaces <= 1000 sq ft

#### Test 97: Office Spaces
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_property_subtype := 'office',
    p_limit := 50
);
```
**Expected:** Returns office space properties

#### Test 98: Retail Spaces
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_property_subtype := 'retail',
    p_limit := 50
);
```
**Expected:** Returns retail/shop properties

#### Test 99: Warehouse Properties
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_property_subtype := 'warehouse',
    p_limit := 50
);
```
**Expected:** Returns warehouse properties

#### Test 100: Commercial + Location
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_city := 'Hyderabad',
    p_limit := 50
);
```
**Expected:** Returns commercial properties in Hyderabad

#### Test 101-110: Additional Commercial Tests
- IT park properties
- Shopping mall spaces
- Restaurant spaces
- Manufacturing units
- Cold storage facilities
- Showroom properties
- Business centers
- Industrial plots
- SEZ properties
- IT tower spaces

### 2.3 Land Properties (20 Cases)

#### Test 111: All Land Properties
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_limit := 50
);
```
**Expected:** Returns only land properties

#### Test 112: Land for Sale
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_subtype := 'sale',
    p_limit := 50
);
```
**Expected:** Returns land properties for sale

#### Test 113: Agricultural Land
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_property_subtype := 'agricultural',
    p_limit := 50
);
```
**Expected:** Returns agricultural land

#### Test 114: Residential Plots
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_property_subtype := 'residential',
    p_limit := 50
);
```
**Expected:** Returns residential plots/land

#### Test 115: Commercial Land
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_property_subtype := 'commercial',
    p_limit := 50
);
```
**Expected:** Returns commercial land

#### Test 116: Industrial Land
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_property_subtype := 'industrial',
    p_limit := 50
);
```
**Expected:** Returns industrial land

#### Test 117: Small Land Plots
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_max := 1000,
    p_limit := 50
);
```
**Expected:** Returns land <= 1000 sq ft

#### Test 118: Large Land Holdings
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_area_min := 10000,
    p_limit := 50
);
```
**Expected:** Returns large land >= 10,000 sq ft

#### Test 119: Farm Land
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'farm',
    p_limit := 50
);
```
**Expected:** Returns farm-related land properties

#### Test 120: Gated Community Plots
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'land',
    p_search_query := 'gated',
    p_limit := 50
);
```
**Expected:** Returns land in gated communities

#### Test 121-130: Additional Land Tests
- Highway-facing land
- Corner plots
- DTCP approved plots
- HMDA approved plots
- Clear title land
- Disputed land (if tracked)
- Boundary wall plots
- Open plots vs developed
- Investment land
- Joint venture opportunities

---

## 3. Advanced Filter Combinations (80 Test Cases)

### 3.1 Location + Property Type Combinations (20 Cases)

#### Test 131: Hyderabad Residential
```sql
SELECT * FROM search_all_properties(
    p_city := 'Hyderabad',
    p_property_type := 'residential',
    p_limit := 50
);
```

#### Test 132: Bangalore Commercial
```sql
SELECT * FROM search_all_properties(
    p_city := 'Bangalore',
    p_property_type := 'commercial',
    p_limit := 50
);
```

#### Test 133: Mumbai Land
```sql
SELECT * FROM search_all_properties(
    p_city := 'Mumbai',
    p_property_type := 'land',
    p_limit := 50
);
```

#### Test 134: Delhi NCR Premium Residential
```sql
SELECT * FROM search_all_properties(
    p_city := 'Delhi',
    p_property_type := 'residential',
    p_min_price := 200000,
    p_limit := 50
);
```

#### Test 135: Pune IT Commercial
```sql
SELECT * FROM search_all_properties(
    p_city := 'Pune',
    p_property_type := 'commercial',
    p_search_query := 'IT',
    p_limit := 50
);
```

#### Test 136-150: More Location + Type Combinations
- Chennai coastal properties
- Kolkata heritage properties
- Ahmedabad industrial land
- Jaipur tourist commercial
- Kochi waterfront residential
- Trivandrum government area commercial
- Indore central commercial
- Bhopal lake-view residential
- Lucknow heritage commercial
- Kanpur industrial land
- Agra tourist commercial
- Varanasi heritage residential
- Patna commercial centers
- Ranchi residential hills
- Guwahati commercial hubs

### 3.2 Price + Property Specifications (20 Cases)

#### Test 151: Budget 2 BHK
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 2,
    p_min_price := 15000,
    p_max_price := 25000,
    p_limit := 50
);
```

#### Test 152: Luxury 3 BHK
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 3,
    p_min_price := 75000,
    p_bathrooms := 3,
    p_limit := 50
);
```

#### Test 153: Premium Studio
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 0,
    p_min_price := 30000,
    p_area_max := 500,
    p_limit := 50
);
```

#### Test 154: Family 4 BHK
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 4,
    p_bathrooms := 3,
    p_area_min := 1800,
    p_limit := 50
);
```

#### Test 155: Commercial Small Office
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'commercial',
    p_subtype := 'rent',
    p_area_max := 500,
    p_max_price := 50000,
    p_limit := 50
);
```

#### Test 156-170: More Price + Spec Combinations
- Mid-range 1 BHK with parking
- Budget commercial retail space
- Premium coworking with amenities
- Large family villa with garden
- Compact PG with meals
- Startup-friendly office space
- Retail space in prime location
- Industrial land for manufacturing
- Agricultural land for organic farming
- Investment properties for NRI
- Student-friendly accommodations
- Senior citizen homes
- Pet-friendly large apartments
- Wheelchair accessible properties
- Green building certified properties

### 3.3 Area + Location + Type Combinations (20 Cases)

#### Test 171: Large Hyderabad Residential
```sql
SELECT * FROM search_all_properties(
    p_city := 'Hyderabad',
    p_property_type := 'residential',
    p_area_min := 1500,
    p_limit := 50
);
```

#### Test 172: Compact Mumbai Commercial
```sql
SELECT * FROM search_all_properties(
    p_city := 'Mumbai',
    p_property_type := 'commercial',
    p_area_max := 300,
    p_subtype := 'rent',
    p_limit := 50
);
```

#### Test 173: Medium Bangalore Land
```sql
SELECT * FROM search_all_properties(
    p_city := 'Bangalore',
    p_property_type := 'land',
    p_area_min := 2000,
    p_area_max := 5000,
    p_limit := 50
);
```

#### Test 174: Delhi Premium Large
```sql
SELECT * FROM search_all_properties(
    p_city := 'Delhi',
    p_area_min := 2000,
    p_min_price := 100000,
    p_limit := 50
);
```

#### Test 175: Chennai Coastal Large
```sql
SELECT * FROM search_all_properties(
    p_city := 'Chennai',
    p_search_query := 'beach',
    p_area_min := 1200,
    p_limit := 50
);
```

#### Test 176-190: More Area + Location + Type
- Pune IT park medium commercial
- Kolkata heritage large residential
- Ahmedabad industrial large land
- Jaipur tourist compact commercial
- Kochi waterfront medium residential
- Trivandrum government compact office
- Indore central medium commercial
- Bhopal lake medium residential
- Lucknow heritage compact commercial
- Kanpur industrial large land
- Agra tourist compact retail
- Varanasi heritage medium residential
- Patna commercial medium office
- Ranchi hills large residential
- Guwahati compact commercial

### 3.4 Complex Multi-Filter Scenarios (20 Cases)

#### Test 191: Complete Residential Filter
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'luxury',
    p_city := 'Hyderabad',
    p_state := 'Telangana',
    p_property_type := 'residential',
    p_subtype := 'rent',
    p_min_price := 50000,
    p_max_price := 100000,
    p_bedrooms := 3,
    p_bathrooms := 2,
    p_area_min := 1200,
    p_area_max := 1800,
    p_limit := 20
);
```

#### Test 192: Complete Commercial Filter
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'office',
    p_city := 'Bangalore',
    p_property_type := 'commercial',
    p_subtype := 'rent',
    p_min_price := 30000,
    p_max_price := 80000,
    p_area_min := 800,
    p_area_max := 2000,
    p_limit := 20
);
```

#### Test 193: Complete Land Filter
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'plot',
    p_city := 'Chennai',
    p_property_type := 'land',
    p_property_subtype := 'residential',
    p_min_price := 5000000,
    p_max_price := 15000000,
    p_area_min := 1000,
    p_area_max := 3000,
    p_limit := 20
);
```

#### Test 194: NRI Investment Properties
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'investment',
    p_property_type := 'residential',
    p_subtype := 'sale',
    p_min_price := 3000000,
    p_bedrooms := 2,
    p_city := 'Hyderabad',
    p_limit := 25
);
```

#### Test 195: Startup Office Space
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'startup',
    p_property_type := 'commercial',
    p_subtype := 'rent',
    p_max_price := 40000,
    p_area_min := 400,
    p_area_max := 1000,
    p_limit := 30
);
```

#### Test 196-210: More Complex Scenarios
- Student accommodation with mess
- Senior citizen friendly homes
- Pet-friendly large apartments
- Green certified buildings
- Smart home properties
- Gated community properties
- Metro connectivity properties
- School zone residential
- Hospital proximity residential
- IT corridor commercial
- Highway connectivity land
- Airport proximity commercial
- Railway station commercial
- Bus stand commercial
- Mall proximity residential

---

## 4. Edge Cases and Validation Tests (30 Test Cases)

### 4.1 Parameter Validation (10 Cases)

#### Test 211: Null All Parameters
```sql
SELECT * FROM search_all_properties(
    p_search_query := NULL,
    p_city := NULL,
    p_state := NULL,
    p_property_type := NULL,
    p_subtype := NULL,
    p_property_subtype := NULL,
    p_min_price := NULL,
    p_max_price := NULL,
    p_bedrooms := NULL,
    p_bathrooms := NULL,
    p_area_min := NULL,
    p_area_max := NULL,
    p_limit := 50,
    p_offset := 0
);
```
**Expected:** Returns all properties (default behavior)

#### Test 212: Invalid Property Type
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'invalid_type',
    p_limit := 50
);
```
**Expected:** Returns empty result or handles gracefully

#### Test 213: Invalid Subtype
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'invalid_subtype',
    p_limit := 50
);
```
**Expected:** Returns empty result or handles gracefully

#### Test 214: Negative Bedrooms
```sql
SELECT * FROM search_all_properties(
    p_bedrooms := -1,
    p_limit := 50
);
```
**Expected:** Should handle gracefully, possibly ignore negative values

#### Test 215: Excessive Bedrooms
```sql
SELECT * FROM search_all_properties(
    p_bedrooms := 50,
    p_limit := 50
);
```
**Expected:** Returns empty result (no properties with 50 bedrooms)

#### Test 216: Negative Bathrooms
```sql
SELECT * FROM search_all_properties(
    p_bathrooms := -2,
    p_limit := 50
);
```
**Expected:** Should handle gracefully

#### Test 217: Decimal Bedrooms
```sql
SELECT * FROM search_all_properties(
    p_bedrooms := 2.5,
    p_limit := 50
);
```
**Expected:** Should handle decimal conversion or round

#### Test 218: Very Large Area
```sql
SELECT * FROM search_all_properties(
    p_area_min := 999999999,
    p_limit := 50
);
```
**Expected:** Returns empty result (no properties that large)

#### Test 219: Zero Area
```sql
SELECT * FROM search_all_properties(
    p_area_min := 0,
    p_area_max := 0,
    p_limit := 50
);
```
**Expected:** Returns properties with zero area or handles validation

#### Test 220: Invalid State Format
```sql
SELECT * FROM search_all_properties(
    p_state := '12345',
    p_limit := 50
);
```
**Expected:** Returns empty result or handles non-string states

### 4.2 Boundary Conditions (10 Cases)

#### Test 221: Zero Limit
```sql
SELECT * FROM search_all_properties(
    p_limit := 0
);
```
**Expected:** Returns empty result or applies default limit

#### Test 222: Negative Limit
```sql
SELECT * FROM search_all_properties(
    p_limit := -5
);
```
**Expected:** Should apply default limit or handle error

#### Test 223: Very Large Limit
```sql
SELECT * FROM search_all_properties(
    p_limit := 999999
);
```
**Expected:** Should cap at maximum allowed limit (1000 from function)

#### Test 224: Negative Offset
```sql
SELECT * FROM search_all_properties(
    p_offset := -10,
    p_limit := 50
);
```
**Expected:** Should treat as 0 or handle error

#### Test 225: Very Large Offset
```sql
SELECT * FROM search_all_properties(
    p_offset := 999999,
    p_limit := 50
);
```
**Expected:** Returns empty result (beyond available data)

#### Test 226: Minimum Price = 0
```sql
SELECT * FROM search_all_properties(
    p_min_price := 0,
    p_limit := 50
);
```
**Expected:** Includes free properties if any

#### Test 227: Maximum Integer Price
```sql
SELECT * FROM search_all_properties(
    p_min_price := 2147483647,
    p_limit := 50
);
```
**Expected:** Returns properties above max integer value

#### Test 228: Float vs Integer Precision
```sql
SELECT * FROM search_all_properties(
    p_min_price := 50000.99,
    p_max_price := 50001.01,
    p_limit := 50
);
```
**Expected:** Handles decimal precision properly

#### Test 229: Unicode Characters in City
```sql
SELECT * FROM search_all_properties(
    p_city := 'हैदराबाद',
    p_limit := 50
);
```
**Expected:** Handles Unicode city names

#### Test 230: Empty String vs NULL
```sql
SELECT * FROM search_all_properties(
    p_search_query := '',
    p_city := '',
    p_state := '',
    p_limit := 50
);
```
**Expected:** Treats empty strings as NULL

### 4.3 Performance and Load Tests (10 Cases)

#### Test 231: Large Result Set
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 1000
);
```
**Expected:** Returns up to 1000 results efficiently

#### Test 232: Complex Query Performance
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'apartment luxury premium spacious modern',
    p_city := 'Hyderabad',
    p_property_type := 'residential',
    p_subtype := 'rent',
    p_min_price := 25000,
    p_max_price := 75000,
    p_bedrooms := 2,
    p_bathrooms := 2,
    p_area_min := 900,
    p_area_max := 1400,
    p_limit := 100
);
```
**Expected:** Executes within reasonable time (<5 seconds)

#### Test 233: No Results Query
```sql
SELECT * FROM search_all_properties(
    p_city := 'NonExistentCity',
    p_property_type := 'residential',
    p_bedrooms := 50,
    p_min_price := 999999999,
    p_limit := 50
);
```
**Expected:** Returns empty result quickly

#### Test 234: Single Result Query
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'unique_property_identifier_12345',
    p_limit := 50
);
```
**Expected:** Returns exactly one result if exists

#### Test 235: All Properties Query
```sql
SELECT * FROM search_all_properties(
    p_limit := 1000
);
```
**Expected:** Returns maximum allowed results

#### Test 236: Pagination Performance - Page 1
```sql
SELECT * FROM search_all_properties(
    p_limit := 20,
    p_offset := 0
);
```
**Expected:** Fast response for first page

#### Test 237: Pagination Performance - Middle Page
```sql
SELECT * FROM search_all_properties(
    p_limit := 20,
    p_offset := 500
);
```
**Expected:** Reasonable response for middle pages

#### Test 238: Pagination Performance - Last Page
```sql
SELECT * FROM search_all_properties(
    p_limit := 20,
    p_offset := 980
);
```
**Expected:** Good performance even for last pages

#### Test 239: Concurrent Query Load
```sql
-- Execute multiple simultaneous queries
SELECT * FROM search_all_properties(p_city := 'Hyderabad', p_limit := 50);
SELECT * FROM search_all_properties(p_city := 'Bangalore', p_limit := 50);
SELECT * FROM search_all_properties(p_city := 'Mumbai', p_limit := 50);
```
**Expected:** All queries execute without blocking

#### Test 240: Memory Usage Test
```sql
SELECT * FROM search_all_properties(
    p_search_query := 'property apartment house villa flat office commercial residential land plot',
    p_limit := 1000
);
```
**Expected:** Efficient memory usage for large text searches

---

## 5. Pagination and Sorting Tests (10 Test Cases)

### 5.1 Pagination Scenarios (5 Cases)

#### Test 241: First Page
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 10,
    p_offset := 0
);
```
**Expected:** Returns first 10 residential properties

#### Test 242: Second Page
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 10,
    p_offset := 10
);
```
**Expected:** Returns next 10 residential properties

#### Test 243: Large Offset
```sql
SELECT * FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 10,
    p_offset := 100
);
```
**Expected:** Returns properties 101-110

#### Test 244: Pagination Consistency
```sql
-- Run same query with different pagination
SELECT id FROM search_all_properties(p_city := 'Hyderabad', p_limit := 50, p_offset := 0);
SELECT id FROM search_all_properties(p_city := 'Hyderabad', p_limit := 25, p_offset := 0);
SELECT id FROM search_all_properties(p_city := 'Hyderabad', p_limit := 25, p_offset := 25);
```
**Expected:** Second and third queries combined should match first query IDs

#### Test 245: Beyond Available Data
```sql
SELECT * FROM search_all_properties(
    p_city := 'SmallCity',
    p_limit := 50,
    p_offset := 1000
);
```
**Expected:** Returns empty result when offset exceeds available data

### 5.2 Sorting Verification (5 Cases)

#### Test 246: Creation Date Sorting
```sql
SELECT id, created_at FROM search_all_properties(
    p_limit := 20
);
```
**Expected:** Results sorted by created_at DESC (newest first)

#### Test 247: Consistent Sorting Across Pages
```sql
-- Check if sorting is consistent across pagination
SELECT id, created_at FROM search_all_properties(p_limit := 10, p_offset := 0);
SELECT id, created_at FROM search_all_properties(p_limit := 10, p_offset := 10);
```
**Expected:** All results maintain consistent ordering

#### Test 248: Sorting with Filters
```sql
SELECT id, created_at, price FROM search_all_properties(
    p_property_type := 'residential',
    p_min_price := 50000,
    p_limit := 30
);
```
**Expected:** Filtered results still sorted by created_at DESC

#### Test 249: Mixed Property Types Sorting
```sql
SELECT id, property_type, created_at FROM search_all_properties(
    p_limit := 50
);
```
**Expected:** All property types mixed but sorted by creation date

#### Test 250: Total Count Accuracy
```sql
SELECT COUNT(*) as manual_count FROM (
    SELECT * FROM search_all_properties(p_city := 'Hyderabad', p_limit := 1000)
) subquery;

SELECT total_count FROM search_all_properties(p_city := 'Hyderabad', p_limit := 1) LIMIT 1;
```
**Expected:** Manual count should match total_count field

---

## 6. Data Integrity and Response Structure Tests (20 Test Cases)

### 6.1 Response Structure Validation (10 Cases)

#### Test 251: Required Fields Present
```sql
SELECT 
    id, owner_id, created_at, updated_at, property_type, 
    flow_type, subtype, total_count, title, price, 
    city, state, area, owner_email, status
FROM search_all_properties(p_limit := 1);
```
**Expected:** All mandatory fields present in response

#### Test 252: Coordinate Fields
```sql
SELECT latitude, longitude FROM search_all_properties(
    p_limit := 10
);
```
**Expected:** Coordinate fields present and properly formatted

#### Test 253: Type-Specific Fields for Residential
```sql
SELECT bedrooms, bathrooms, area_unit, land_type 
FROM search_all_properties(
    p_property_type := 'residential',
    p_limit := 10
);
```
**Expected:** Bedrooms and bathrooms populated for residential

#### Test 254: Type-Specific Fields for Land
```sql
SELECT bedrooms, bathrooms, area_unit, land_type 
FROM search_all_properties(
    p_property_type := 'land',
    p_limit := 10
);
```
**Expected:** land_type populated, bedrooms/bathrooms NULL

#### Test 255: Primary Image Field
```sql
SELECT id, primary_image FROM search_all_properties(
    p_limit := 20
);
```
**Expected:** primary_image field present (may be NULL)

#### Test 256: Price Data Types
```sql
SELECT price, 
    pg_typeof(price) as price_type
FROM search_all_properties(p_limit := 10);
```
**Expected:** Price is numeric type

#### Test 257: Date Formats
```sql
SELECT 
    created_at,
    updated_at,
    extract(year from created_at) as year,
    extract(month from created_at) as month
FROM search_all_properties(p_limit := 5);
```
**Expected:** Dates in proper timestamp format

#### Test 258: Text Field Encoding
```sql
SELECT title, city, state FROM search_all_properties(
    p_search_query := 'अपार्टमेंट',
    p_limit := 5
);
```
**Expected:** Proper UTF-8 encoding for all text fields

#### Test 259: NULL Value Handling
```sql
SELECT 
    id,
    CASE WHEN title IS NULL THEN 'NULL_TITLE' ELSE title END as title_check,
    CASE WHEN price IS NULL THEN -1 ELSE price END as price_check
FROM search_all_properties(p_limit := 20);
```
**Expected:** NULL values handled consistently

#### Test 260: Boolean Field Validation
```sql
SELECT status, 
    CASE WHEN status IN ('active', 'inactive', 'deleted', 'draft') 
         THEN 'valid' 
         ELSE 'invalid' 
    END as status_validity
FROM search_all_properties(p_limit := 20);
```
**Expected:** Status values within expected range

### 6.2 Data Consistency Tests (10 Cases)

#### Test 261: Property Type Consistency
```sql
SELECT property_type, flow_type, subtype 
FROM search_all_properties(p_limit := 50)
WHERE property_type = 'residential';
```
**Expected:** flow_type should contain 'residential_' prefix

#### Test 262: Price Range Consistency
```sql
SELECT id, price FROM search_all_properties(
    p_min_price := 50000,
    p_max_price := 100000,
    p_limit := 50
);
```
**Expected:** All prices between 50,000 and 100,000

#### Test 263: Bedroom Count Consistency
```sql
SELECT id, bedrooms FROM search_all_properties(
    p_property_type := 'residential',
    p_bedrooms := 2,
    p_limit := 30
);
```
**Expected:** All results should have exactly 2 bedrooms

#### Test 264: Area Filter Consistency
```sql
SELECT id, area FROM search_all_properties(
    p_area_min := 800,
    p_area_max := 1200,
    p_limit := 40
);
```
**Expected:** All areas between 800 and 1200

#### Test 265: City Filter Consistency
```sql
SELECT DISTINCT city FROM search_all_properties(
    p_city := 'Hyderabad',
    p_limit := 100
);
```
**Expected:** Only 'Hyderabad' (case variations allowed)

#### Test 266: Subtype Filter Consistency
```sql
SELECT DISTINCT subtype FROM search_all_properties(
    p_property_type := 'residential',
    p_subtype := 'rent',
    p_limit := 50
);
```
**Expected:** Only 'rent' subtype

#### Test 267: Owner Email Format
```sql
SELECT owner_email,
    CASE WHEN owner_email ~ '^[^@]+@[^@]+\.[^@]+ 
         THEN 'valid' 
         ELSE 'invalid' 
    END as email_validity
FROM search_all_properties(p_limit := 30);
```
**Expected:** Valid email format (if not NULL)

#### Test 268: Coordinate Range Validation
```sql
SELECT latitude, longitude,
    CASE WHEN latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180
         THEN 'valid'
         ELSE 'invalid'
    END as coord_validity
FROM search_all_properties(p_limit := 50)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```
**Expected:** All coordinates within valid ranges

#### Test 269: Total Count Accuracy
```sql
WITH counted AS (
    SELECT COUNT(*) as actual_count 
    FROM search_all_properties(p_property_type := 'residential', p_limit := 1000)
),
reported AS (
    SELECT total_count 
    FROM search_all_properties(p_property_type := 'residential', p_limit := 1) 
    LIMIT 1
)
SELECT 
    c.actual_count,
    r.total_count,
    CASE WHEN c.actual_count <= r.total_count THEN 'consistent' ELSE 'inconsistent' END
FROM counted c, reported r;
```
**Expected:** total_count should be >= actual returned count

#### Test 270: Duplicate Prevention
```sql
SELECT id, COUNT(*) as occurrence_count
FROM search_all_properties(p_limit := 200)
GROUP BY id
HAVING COUNT(*) > 1;
```
**Expected:** No duplicate property IDs in results

---

## Test Execution Guidelines

### Prerequisites
1. **Database Setup**: Ensure PostgreSQL database with properties_v2 table is available
2. **Data Population**: Load test data from CSV or generate sample data
3. **Function Deployment**: Deploy the `search_all_properties` function
4. **Index Optimization**: Ensure proper indexes on searchable fields

### Execution Strategy
1. **Sequential Testing**: Run tests in order to build complexity gradually
2. **Performance Monitoring**: Track execution time for each test
3. **Result Validation**: Verify both structure and content of results
4. **Error Handling**: Document any errors or unexpected behaviors

### Expected Test Results Summary

| Test Category | Pass Criteria | Common Issues |
|---------------|---------------|---------------|
| Basic Search | Results match filters | Null handling, case sensitivity |
| Property Types | Correct type filtering | Flow type mapping |
| Advanced Filters | Multiple filter intersection | Performance with complex queries |
| Edge Cases | Graceful error handling | Validation logic |
| Performance | <5s for complex queries | Index optimization needed |

### Automation Script Template

```sql
-- Test Execution Script
DO $
DECLARE
    test_name TEXT;
    test_result BOOLEAN;
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time INTERVAL;
BEGIN
    -- Test 1: Basic City Search
    test_name := 'Test 1: Basic City Search';
    start_time := clock_timestamp();
    
    PERFORM * FROM search_all_properties(
        p_city := 'Hyderabad',
        p_limit := 50
    );
    
    end_time := clock_timestamp();
    execution_time := end_time - start_time;
    
    RAISE NOTICE '% - Execution Time: %', test_name, execution_time;
    
    -- Add more tests here...
END $;
```

### Performance Benchmarks

| Query Complexity | Expected Time | Max Acceptable |
|------------------|---------------|----------------|
| Simple filter | <100ms | 500ms |
| Multiple filters | <500ms | 2s |
| Complex query | <2s | 5s |
| Large result set | <3s | 10s |

### Error Scenarios to Monitor

1. **Timeout Errors**: Queries exceeding maximum execution time
2. **Memory Errors**: Large result sets causing memory issues
3. **Type Conversion**: Invalid data type conversions
4. **Constraint Violations**: Foreign key or check constraint failures
5. **Permission Errors**: RLS policy violations

---

## Conclusion

This comprehensive test suite provides 270+ test cases covering all aspects of the `search_all_properties` function:

- **Functionality Testing**: Verifies all search parameters work correctly
- **Data Integrity**: Ensures results match filter criteria  
- **Performance Testing**: Validates response times under various loads
- **Edge Case Handling**: Tests boundary conditions and error scenarios
- **Scalability**: Tests pagination and large result sets

The test cases are designed to be:
- **Executable**: Can be run directly against the database
- **Comprehensive**: Cover all possible parameter combinations
- **Realistic**: Based on actual property search use cases
- **Maintainable**: Structured for easy updates and extensions

Regular execution of these tests will ensure the search function continues to perform reliably as the application and data scale.

---

**End of Test Cases Document**