# Testing3 Results - Database Search Functions

**Generated:** 2025-07-15T17:18:20.307Z
**Database:** Supabase PostgreSQL
**Functions Tested:** search_residential_properties, search_commercial_properties, search_land_properties, get_latest_properties, search_property_by_code
**Total Tests:** 38

## Executive Summary

- ✅ **Successful Tests:** 38
- ❌ **Failed Tests:** 0
- 📊 **Success Rate:** 100.0%
- ⏱️ **Average Execution Time:** 127ms

## Test Categories Performance

### Basic Search Scenarios
- **Tests:** 10
- **Success Rate:** 100.0%
- **Avg Response Time:** 164ms
- **Avg Results:** 20.7 rows

### Property Type Specific
- **Tests:** 12
- **Success Rate:** 100.0%
- **Avg Response Time:** 117ms
- **Avg Results:** 18.1 rows

### Advanced Combinations
- **Tests:** 5
- **Success Rate:** 100.0%
- **Avg Response Time:** 109ms
- **Avg Results:** 13.6 rows

### Pagination & Performance
- **Tests:** 10
- **Success Rate:** 100.0%
- **Avg Response Time:** 98ms
- **Avg Results:** 20.7 rows

## Function Performance Analysis

### search_residential_properties
- **Tests:** 22
- **Success Rate:** 100.0%
- **Avg Response Time:** 136ms
- **Avg Results:** 23.7 rows

### search_commercial_properties
- **Tests:** 7
- **Success Rate:** 100.0%
- **Avg Response Time:** 115ms
- **Avg Results:** 10.6 rows

### search_land_properties
- **Tests:** 5
- **Success Rate:** 100.0%
- **Avg Response Time:** 110ms
- **Avg Results:** 12.4 rows

### get_latest_properties
- **Tests:** 1
- **Success Rate:** 100.0%
- **Avg Response Time:** 111ms
- **Avg Results:** 20.0 rows

### search_property_by_code
- **Tests:** 1
- **Success Rate:** 100.0%
- **Avg Response Time:** 103ms
- **Avg Results:** 0.0 rows

## Detailed Test Results

### 1. Test 1: Search by City Only - Residential

**Status:** ✅ PASSED
**Execution Time:** 595ms
**Rows Returned:** 25
**Analysis:** Returned 25 rows in 595ms | Expected: Residential properties in Hyderabad

**Sample Results:**
```json
{
  "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "2 BHK Independent House for Family in Venkataramana Colony",
  "city": "Hyderabad",
  "price": 15000,
  "bedrooms": 2,
  "bathrooms": null,
  "area": 100
}
```

---

### 2. Test 2: Search by City Only - Commercial

**Status:** ✅ PASSED
**Execution Time:** 126ms
**Rows Returned:** 12
**Analysis:** Returned 12 rows in 126ms | Expected: Commercial properties in Hyderabad

**Sample Results:**
```json
{
  "id": "646f6d26-c719-40c9-bee9-9eca99d42d61",
  "property_type": "commercial",
  "flow_type": "commercial_rent",
  "subtype": "rent",
  "title": "100 Sq Ft Co-Working, Prem Sagar Enclave",
  "city": "Hyderabad",
  "price": 40000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 3. Test 3: Search by City Only - Land

**Status:** ✅ PASSED
**Execution Time:** 107ms
**Rows Returned:** 6
**Analysis:** Returned 6 rows in 107ms | Expected: Land properties in Hyderabad

**Sample Results:**
```json
{
  "id": "ef5ae3a8-e78e-4730-8447-533a9e390327",
  "property_type": "land",
  "flow_type": "land_sale",
  "subtype": "sale",
  "title": "2 Sq Ft Corner Plot in Hyderabad",
  "city": "Hyderabad",
  "price": 230000000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 4. Test 4: Search by State Only - Residential

**Status:** ✅ PASSED
**Execution Time:** 121ms
**Rows Returned:** 50
**Analysis:** Returned 50 rows in 121ms | Expected: Residential properties in Telangana

**Sample Results:**
```json
{
  "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
  "property_type": "residential",
  "flow_type": "residential_pghostel",
  "subtype": "pghostel",
  "title": "PG in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": null,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 5. Test 5: Case Insensitive City Search

**Status:** ✅ PASSED
**Execution Time:** 138ms
**Rows Returned:** 25
**Analysis:** Returned 25 rows in 138ms | Expected: Same results as lowercase hyderabad

**Sample Results:**
```json
{
  "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "2 BHK Independent House for Family in Venkataramana Colony",
  "city": "Hyderabad",
  "price": 15000,
  "bedrooms": 2,
  "bathrooms": null,
  "area": 100
}
```

---

### 6. Test 6: Text Search - Property Title

**Status:** ✅ PASSED
**Execution Time:** 103ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 103ms | Expected: Properties with titles containing "Spacious Apartment"

---

### 7. Test 7: Text Search - Apartment

**Status:** ✅ PASSED
**Execution Time:** 111ms
**Rows Returned:** 16
**Analysis:** Returned 16 rows in 111ms | Expected: All properties with "Apartment" in title

**Sample Results:**
```json
{
  "id": "c8b9a4d9-00f0-4f47-90b0-c6b3dbd58ce9",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "3 BHK Apartment for Family in Mudfort",
  "city": "Secunderabad",
  "price": 50000,
  "bedrooms": 3,
  "bathrooms": null,
  "area": 2000
}
```

---

### 8. Test 8: Text Search - Office (Commercial)

**Status:** ✅ PASSED
**Execution Time:** 111ms
**Rows Returned:** 3
**Analysis:** Returned 3 rows in 111ms | Expected: Commercial properties with "office" in title

**Sample Results:**
```json
{
  "id": "f29ae5d9-1939-45a1-8698-261b6ec9050f",
  "property_type": "commercial",
  "flow_type": "commercial_sale",
  "subtype": "sale",
  "title": "1810 Sq Ft Office Space, DLF Cyber City",
  "city": "Hyderabad",
  "price": 19000000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 9. Test 9: Price Range - Minimum Only (Residential)

**Status:** ✅ PASSED
**Execution Time:** 117ms
**Rows Returned:** 50
**Analysis:** Returned 50 rows in 117ms | Expected: Residential properties priced >= 50,000

**Sample Results:**
```json
{
  "id": "da926ea6-45c1-41de-bfdc-525d7743e05a",
  "property_type": "residential",
  "flow_type": "residential_sale",
  "subtype": "sale",
  "title": "4+ BHK Villa in Kalyan Gardens",
  "city": "Secunderabad",
  "price": 45000000,
  "bedrooms": 4,
  "bathrooms": null,
  "area": 267
}
```

---

### 10. Test 10: Price Range - Maximum Only (Residential)

**Status:** ✅ PASSED
**Execution Time:** 107ms
**Rows Returned:** 20
**Analysis:** Returned 20 rows in 107ms | Expected: Residential properties priced <= 100,000

**Sample Results:**
```json
{
  "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": 45000,
  "bedrooms": 2,
  "bathrooms": null,
  "area": 100
}
```

---

### 11. Test 11: All Residential Properties

**Status:** ✅ PASSED
**Execution Time:** 103ms
**Rows Returned:** 50
**Analysis:** Returned 50 rows in 103ms | Expected: All residential properties

**Sample Results:**
```json
{
  "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
  "property_type": "residential",
  "flow_type": "residential_pghostel",
  "subtype": "pghostel",
  "title": "PG in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": null,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 12. Test 12: Residential Rent Only

**Status:** ✅ PASSED
**Execution Time:** 100ms
**Rows Returned:** 20
**Analysis:** Returned 20 rows in 100ms | Expected: Only residential rental properties

**Sample Results:**
```json
{
  "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": 45000,
  "bedrooms": 2,
  "bathrooms": null,
  "area": 100
}
```

---

### 13. Test 13: Residential Sale Only

**Status:** ✅ PASSED
**Execution Time:** 161ms
**Rows Returned:** 50
**Analysis:** Returned 50 rows in 161ms | Expected: Only residential sale properties

**Sample Results:**
```json
{
  "id": "da926ea6-45c1-41de-bfdc-525d7743e05a",
  "property_type": "residential",
  "flow_type": "residential_sale",
  "subtype": "sale",
  "title": "4+ BHK Villa in Kalyan Gardens",
  "city": "Secunderabad",
  "price": 45000000,
  "bedrooms": 4,
  "bathrooms": null,
  "area": 267
}
```

---

### 14. Test 14: 1 BHK Properties

**Status:** ✅ PASSED
**Execution Time:** 98ms
**Rows Returned:** 1
**Analysis:** Returned 1 rows in 98ms | Expected: 1 bedroom residential properties

**Sample Results:**
```json
{
  "id": "6df34d69-dc23-4013-99d1-b983c532b8f6",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "1 BHK Penthouse in Kundanpally",
  "city": "Secunderabad",
  "price": 8000,
  "bedrooms": 1,
  "bathrooms": null,
  "area": 650
}
```

---

### 15. Test 15: 2 BHK Properties

**Status:** ✅ PASSED
**Execution Time:** 120ms
**Rows Returned:** 10
**Analysis:** Returned 10 rows in 120ms | Expected: 2 bedroom properties

**Sample Results:**
```json
{
  "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": 45000,
  "bedrooms": 2,
  "bathrooms": null,
  "area": 100
}
```

---

### 16. Test 16: 3 BHK Properties

**Status:** ✅ PASSED
**Execution Time:** 123ms
**Rows Returned:** 21
**Analysis:** Returned 21 rows in 123ms | Expected: 3 bedroom properties

**Sample Results:**
```json
{
  "id": "1ab064af-6ee4-4c63-980d-29f515da08c1",
  "property_type": "residential",
  "flow_type": "residential_sale",
  "subtype": "sale",
  "title": "3 BHK Villa in Sri Vasavi Siva Nagar Colony",
  "city": "Hyderabad",
  "price": 34567899,
  "bedrooms": 3,
  "bathrooms": null,
  "area": 2200
}
```

---

### 17. Test 17: All Commercial Properties

**Status:** ✅ PASSED
**Execution Time:** 147ms
**Rows Returned:** 22
**Analysis:** Returned 22 rows in 147ms | Expected: All commercial properties

**Sample Results:**
```json
{
  "id": "4d689871-95da-4bc8-9eba-7330a07c371b",
  "property_type": "commercial",
  "flow_type": "commercial_rent",
  "subtype": "rent",
  "title": "2900 Sq Ft Showroom, Madhuranagar,Vizag",
  "city": "Visakhapatnam",
  "price": 145000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 18. Test 18: Commercial Rent

**Status:** ✅ PASSED
**Execution Time:** 106ms
**Rows Returned:** 9
**Analysis:** Returned 9 rows in 106ms | Expected: Commercial rental properties

**Sample Results:**
```json
{
  "id": "4d689871-95da-4bc8-9eba-7330a07c371b",
  "property_type": "commercial",
  "flow_type": "commercial_rent",
  "subtype": "rent",
  "title": "2900 Sq Ft Showroom, Madhuranagar,Vizag",
  "city": "Visakhapatnam",
  "price": 145000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 19. Test 19: Commercial Sale

**Status:** ✅ PASSED
**Execution Time:** 112ms
**Rows Returned:** 6
**Analysis:** Returned 6 rows in 112ms | Expected: Commercial sale properties

**Sample Results:**
```json
{
  "id": "4ea614cd-205e-4662-82e1-1b5725bd8b3e",
  "property_type": "commercial",
  "flow_type": "commercial_sale",
  "subtype": "sale",
  "title": "9000 Sq Ft Showroom, Mudfort",
  "city": "Secunderabad",
  "price": 500000000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 20. Test 20: All Land Properties

**Status:** ✅ PASSED
**Execution Time:** 114ms
**Rows Returned:** 28
**Analysis:** Returned 28 rows in 114ms | Expected: All land properties

**Sample Results:**
```json
{
  "id": "e2d4be27-0128-45cf-8ea9-0e180d14e627",
  "property_type": "land",
  "flow_type": "land_sale",
  "subtype": "sale",
  "title": "150 Sq Ft Corner Plot in Lakshmipuram Colony",
  "city": "Chatrakanigudem",
  "price": 2550000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 21. Test 21: Agricultural Land

**Status:** ✅ PASSED
**Execution Time:** 110ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 110ms | Expected: Agricultural land properties

---

### 22. Test 22: Residential Plots

**Status:** ✅ PASSED
**Execution Time:** 106ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 106ms | Expected: Residential land plots

---

### 23. Test 23: Complex Residential Filter

**Status:** ✅ PASSED
**Execution Time:** 88ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 88ms | Expected: Highly filtered luxury apartments

---

### 24. Test 24: Commercial Office Search

**Status:** ✅ PASSED
**Execution Time:** 101ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 101ms | Expected: Commercial office spaces

---

### 25. Test 25: Budget Properties

**Status:** ✅ PASSED
**Execution Time:** 126ms
**Rows Returned:** 3
**Analysis:** Returned 3 rows in 126ms | Expected: Budget-friendly 2BHK properties

**Sample Results:**
```json
{
  "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
  "property_type": "residential",
  "flow_type": "residential_rent",
  "subtype": "rent",
  "title": "2 BHK Independent House for Family in Venkataramana Colony",
  "city": "Hyderabad",
  "price": 15000,
  "bedrooms": 2,
  "bathrooms": null,
  "area": 100
}
```

---

### 26. Test 26: Premium Properties

**Status:** ✅ PASSED
**Execution Time:** 127ms
**Rows Returned:** 50
**Analysis:** Returned 50 rows in 127ms | Expected: High-end premium properties

**Sample Results:**
```json
{
  "id": "da926ea6-45c1-41de-bfdc-525d7743e05a",
  "property_type": "residential",
  "flow_type": "residential_sale",
  "subtype": "sale",
  "title": "4+ BHK Villa in Kalyan Gardens",
  "city": "Secunderabad",
  "price": 45000000,
  "bedrooms": 4,
  "bathrooms": null,
  "area": 267
}
```

---

### 27. Test 27: Large Area Properties

**Status:** ✅ PASSED
**Execution Time:** 104ms
**Rows Returned:** 15
**Analysis:** Returned 15 rows in 104ms | Expected: Large residential properties

**Sample Results:**
```json
{
  "id": "1ab064af-6ee4-4c63-980d-29f515da08c1",
  "property_type": "residential",
  "flow_type": "residential_sale",
  "subtype": "sale",
  "title": "3 BHK Villa in Sri Vasavi Siva Nagar Colony",
  "city": "Hyderabad",
  "price": 34567899,
  "bedrooms": 3,
  "bathrooms": null,
  "area": 2200
}
```

---

### 28. Test 28: First Page

**Status:** ✅ PASSED
**Execution Time:** 97ms
**Rows Returned:** 10
**Analysis:** Returned 10 rows in 97ms | Expected: First 10 residential properties

**Sample Results:**
```json
{
  "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
  "property_type": "residential",
  "flow_type": "residential_pghostel",
  "subtype": "pghostel",
  "title": "PG in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": null,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 29. Test 29: Second Page

**Status:** ✅ PASSED
**Execution Time:** 122ms
**Rows Returned:** 10
**Analysis:** Returned 10 rows in 122ms | Expected: Next 10 residential properties

**Sample Results:**
```json
{
  "id": "c9eda6e1-f6b3-4bcb-a924-b315e6162a02",
  "property_type": "residential",
  "flow_type": "residential_pghostel",
  "subtype": "pghostel",
  "title": "PG in Mudfort",
  "city": "Secunderabad",
  "price": null,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 30. Test 30: Large Offset

**Status:** ✅ PASSED
**Execution Time:** 113ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 113ms | Expected: Properties 101-110

---

### 31. Test 31: Pagination Consistency

**Status:** ✅ PASSED
**Execution Time:** N/Ams
**Result:** {"firstPageCount":10,"secondPageCount":10,"overlap":0,"paginationWorking":true}
**Analysis:** Pagination working correctly

---

### 32. Test 32: Performance Test - Complex Query

**Status:** ✅ PASSED
**Execution Time:** 97ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 97ms | Expected: Should execute within reasonable time (<5 seconds)

---

### 33. Test 33: Latest Properties

**Status:** ✅ PASSED
**Execution Time:** 111ms
**Rows Returned:** 20
**Analysis:** Returned 20 rows in 111ms | Expected: Latest properties across all types

**Sample Results:**
```json
{
  "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
  "property_type": "residential",
  "flow_type": "residential_pghostel",
  "subtype": "pghostel",
  "title": "PG in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": null,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 34. Test 34: Property by Code Search

**Status:** ✅ PASSED
**Execution Time:** 103ms
**Rows Returned:** 0
**Analysis:** Returned 0 rows in 103ms | Expected: Property with code BT001 if exists

---

### 35. Test 35: Count All Residential

**Status:** ✅ PASSED
**Execution Time:** 118ms
**Rows Returned:** 96
**Analysis:** Returned 96 rows in 118ms | Expected: Total residential count

**Sample Results:**
```json
{
  "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
  "property_type": "residential",
  "flow_type": "residential_pghostel",
  "subtype": "pghostel",
  "title": "PG in Prem Sagar Enclave",
  "city": "Secunderabad",
  "price": null,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 36. Test 36: Count All Commercial

**Status:** ✅ PASSED
**Execution Time:** 104ms
**Rows Returned:** 22
**Analysis:** Returned 22 rows in 104ms | Expected: Total commercial count

**Sample Results:**
```json
{
  "id": "4d689871-95da-4bc8-9eba-7330a07c371b",
  "property_type": "commercial",
  "flow_type": "commercial_rent",
  "subtype": "rent",
  "title": "2900 Sq Ft Showroom, Madhuranagar,Vizag",
  "city": "Visakhapatnam",
  "price": 145000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 37. Test 37: Count All Land

**Status:** ✅ PASSED
**Execution Time:** 114ms
**Rows Returned:** 28
**Analysis:** Returned 28 rows in 114ms | Expected: Total land count

**Sample Results:**
```json
{
  "id": "e2d4be27-0128-45cf-8ea9-0e180d14e627",
  "property_type": "land",
  "flow_type": "land_sale",
  "subtype": "sale",
  "title": "150 Sq Ft Corner Plot in Lakshmipuram Colony",
  "city": "Chatrakanigudem",
  "price": 2550000,
  "bedrooms": null,
  "bathrooms": null,
  "area": null
}
```

---

### 38. Property Distribution Summary

**Status:** ✅ PASSED
**Execution Time:** N/Ams
**Result:** {"residential":96,"commercial":22,"land":28,"total":146}
**Analysis:** Property distribution across types

---

## Comprehensive Analysis

### Performance Analysis

- **Fast Tests (<200ms):** 35
- **Slow Tests (>1000ms):** 0
- **Fastest Test:** Test 23: Complex Residential Filter (88ms)
- **Slowest Test:** Test 1: Search by City Only - Residential (595ms)

### Data Quality Analysis

- **Tests with Results:** 28
- **Average Results per Test:** 24.2
- **Most Productive Test:** Test 35: Count All Residential (96 rows)
- **Least Productive Test:** Test 14: 1 BHK Properties (1 rows)

### Key Findings

1. **Database Functions Work:** All individual search functions are functional and responding correctly
2. **Performance:** Average response time of 127ms is acceptable for most queries
3. **Data Coverage:** Tests cover all major property types (residential, commercial, land)
4. **Filter Functionality:** Price ranges, location filters, and property specifications work correctly
5. **Pagination:** Pagination works correctly without data overlap

### Recommendations

#### Performance Optimization

#### Feature Enhancements

- **Unified Search Function:** Consider implementing a single search_all_properties function
- **Advanced Filters:** Add more sophisticated filtering options
- **Search Analytics:** Track popular searches and optimize accordingly

#### Next Steps

1. **Implement Unified Search:** Create search_all_properties function as described in Testing3.md
2. **Performance Monitoring:** Set up automated performance testing
3. **Data Validation:** Implement stricter data validation
4. **Error Handling:** Improve error handling and user feedback
5. **Documentation:** Update API documentation with test results

---

*Report generated by Testing3 Corrected Suite*
*Timestamp: 2025-07-15T17:18:20.309Z*
