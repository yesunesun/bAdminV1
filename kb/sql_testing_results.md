# SQL Testing Results Report

**Generated:** 2025-07-15T16:47:20.251Z
**Total Tests:** 36
**Passed:** 36
**Failed:** 0
**Errors:** 0
**Success Rate:** 100.00%

## Executive Summary

✅ **36 tests passed successfully** - The database functions are working correctly for these test cases.

## Function Performance Analysis

**get_latest_properties**: 3 tests, avg 252.33ms
**search_residential_properties**: 22 tests, avg 163.05ms
**search_commercial_properties**: 7 tests, avg 123.29ms
**search_land_properties**: 2 tests, avg 127.00ms
**search_property_by_code**: 1 tests, avg 107.00ms
**search_property_by_code_insensitive**: 1 tests, avg 134.00ms

## Test Results Detail

### Test 1: Search all property types with no filters (latest properties)

**Status:** PASSED
**Function:** `get_latest_properties`
**Execution Time:** 536ms
**Parameters:** `{"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 146,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 146,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

---

### Test 2: Search residential properties with 'apartment' text query

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 126ms
**Parameters:** `{"p_search_query":"apartment","p_limit":15}`

**Row Count:** 15

**Sample Data:**
```json
[
  {
    "id": "c8b9a4d9-00f0-4f47-90b0-c6b3dbd58ce9",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T05:10:31.037+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 16,
    "title": "3 BHK Apartment for Family in Mudfort",
    "price": 50000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 2000,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748927500761_r4itqez3.jpg",
    "latitude": 17.44896,
    "longitude": 78.495744
  },
  {
    "id": "437f90e4-7ad0-4e4b-9059-3e9a1b871021",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-01T13:08:04.896+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 16,
    "title": "4 BHK Apartment in Ashok Nagar",
    "price": 60000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 1100,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": 4,
    "bathrooms": 4,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4347251,
    "longitude": 78.4979136
  }
]
```

---

### Test 3: Search residential properties in Hyderabad

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 120ms
**Parameters:** `{"p_city":"Hyderabad","p_limit":20}`

**Row Count:** 20

**Sample Data:**
```json
[
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 25,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  },
  {
    "id": "1ab064af-6ee4-4c63-980d-29f515da08c1",
    "owner_id": "d1ffbed8-0856-4268-b444-4eaa2639f1d5",
    "created_at": "2025-06-03T10:14:15.761+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 25,
    "title": "3 BHK Villa in Sri Vasavi Siva Nagar Colony",
    "price": 34567899,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 2200,
    "owner_email": "chandrababu.nsn@gmail.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4918573,
    "longitude": 78.58670339999999
  }
]
```

---

### Test 4: Search residential properties

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 103ms
**Parameters:** `{"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 96,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 96,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

---

### Test 5: Search commercial properties

**Status:** PASSED
**Function:** `search_commercial_properties`
**Execution Time:** 117ms
**Parameters:** `{"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "4d689871-95da-4bc8-9eba-7330a07c371b",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-21T09:34:06.215+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_rent",
    "subtype": "rent",
    "total_count": 22,
    "title": "2900 Sq Ft Showroom, Madhuranagar,Vizag",
    "price": 145000,
    "city": "Visakhapatnam",
    "state": "Andhra Pradesh",
    "area": null,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1750498465095_3tg8shvv.jpg",
    "latitude": 17.730566167797342,
    "longitude": 83.30659630307578
  },
  {
    "id": "da353dde-cd05-42db-9948-5c338ec756ca",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T07:57:15.014+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_coworking",
    "subtype": "coworking",
    "total_count": 22,
    "title": "Coworking Space in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748937564546_rmc9cgt8.jpg",
    "latitude": 17.4786666,
    "longitude": 78.4936271
  }
]
```

---

### Test 6: Search land properties

**Status:** PASSED
**Function:** `search_land_properties`
**Execution Time:** 109ms
**Parameters:** `{"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "e2d4be27-0128-45cf-8ea9-0e180d14e627",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-07-03T07:16:55.55+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "land",
    "flow_type": "land_sale",
    "subtype": "sale",
    "total_count": 28,
    "title": "150 Sq Ft Corner Plot in Lakshmipuram Colony",
    "price": 2550000,
    "city": "Chatrakanigudem",
    "state": "Telangana",
    "area": null,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sqyd",
    "land_type": "Residential Plot",
    "primary_image": "1751527099307_ew1ec9ro.jpg",
    "latitude": 17.483766131713576,
    "longitude": 78.7808889461365
  },
  {
    "id": "7f9de22d-55d7-472e-97e2-30de3ac82a3f",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-25T11:10:53.995+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "land",
    "flow_type": "land_sale",
    "subtype": "sale",
    "total_count": 28,
    "title": "200 Sq Ft Corner Plot in Digwal",
    "price": 3200000,
    "city": "Madri",
    "state": "Telangana",
    "area": null,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sqyd",
    "land_type": "Residential Plot",
    "primary_image": "1750849898693_pkia4kuq.jpg",
    "latitude": 17.66890522820895,
    "longitude": 77.69927782883609
  }
]
```

---

### Test 7: Search residential rent properties

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 105ms
**Parameters:** `{"p_subtype":"rent","p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 20,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  },
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 20,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  }
]
```

---

### Test 8: Search residential sale properties

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 102ms
**Parameters:** `{"p_subtype":"sale","p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "da926ea6-45c1-41de-bfdc-525d7743e05a",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-20T13:35:08.602+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 55,
    "title": "4+ BHK Villa in Kalyan Gardens",
    "price": 45000000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 267,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 4,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1750426533341_xaeb3lrt.jpg",
    "latitude": 17.49928591921926,
    "longitude": 78.54158993558197
  },
  {
    "id": "089479d3-53fc-4a11-8cd6-c3d1c02a16b1",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-20T13:07:11.135+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 55,
    "title": "4+ BHK Independent House in Rampally",
    "price": 13500000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 156,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 4,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1750424866049_0s4w9y0c.jpg",
    "latitude": 17.470697118252527,
    "longitude": 78.6389865116394
  }
]
```

---

### Test 9: Search commercial rent properties

**Status:** PASSED
**Function:** `search_commercial_properties`
**Execution Time:** 116ms
**Parameters:** `{"p_subtype":"rent","p_limit":10}`

**Row Count:** 9

**Sample Data:**
```json
[
  {
    "id": "4d689871-95da-4bc8-9eba-7330a07c371b",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-21T09:34:06.215+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_rent",
    "subtype": "rent",
    "total_count": 9,
    "title": "2900 Sq Ft Showroom, Madhuranagar,Vizag",
    "price": 145000,
    "city": "Visakhapatnam",
    "state": "Andhra Pradesh",
    "area": null,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1750498465095_3tg8shvv.jpg",
    "latitude": 17.730566167797342,
    "longitude": 83.30659630307578
  },
  {
    "id": "a56eb780-d539-44b0-828e-abe49c22f4e2",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T06:46:50.017+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_rent",
    "subtype": "rent",
    "total_count": 9,
    "title": "700 Sq Ft Shop, Mudfort",
    "price": 29500,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748933451721_fvf1xqnv.jpg",
    "latitude": 17.44896,
    "longitude": 78.495744
  }
]
```

---

### Test 10: Search commercial coworking properties

**Status:** PASSED
**Function:** `search_commercial_properties`
**Execution Time:** 115ms
**Parameters:** `{"p_subtype":"coworking","p_limit":10}`

**Row Count:** 7

**Sample Data:**
```json
[
  {
    "id": "da353dde-cd05-42db-9948-5c338ec756ca",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T07:57:15.014+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_coworking",
    "subtype": "coworking",
    "total_count": 7,
    "title": "Coworking Space in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748937564546_rmc9cgt8.jpg",
    "latitude": 17.4786666,
    "longitude": 78.4936271
  },
  {
    "id": "8e5f9d28-7f16-4993-b92e-6209f25e20ec",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-05-29T07:15:30.044+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_coworking",
    "subtype": "coworking",
    "total_count": 7,
    "title": "Coworking Space in Rajiv Gandhi Nagar",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748502939858_v394f9jh.jpg",
    "latitude": 17.481728,
    "longitude": 78.4924672
  }
]
```

---

### Test 11: Search residential properties with price range (10K - 50K)

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 121ms
**Parameters:** `{"p_min_price":10000,"p_max_price":50000,"p_limit":15}`

**Row Count:** 9

**Sample Data:**
```json
[
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 9,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  },
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 9,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  }
]
```

---

### Test 12: Search commercial properties above 1 Lakh

**Status:** PASSED
**Function:** `search_commercial_properties`
**Execution Time:** 128ms
**Parameters:** `{"p_min_price":100000,"p_limit":10}`

**Row Count:** 9

**Sample Data:**
```json
[
  {
    "id": "4d689871-95da-4bc8-9eba-7330a07c371b",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-21T09:34:06.215+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_rent",
    "subtype": "rent",
    "total_count": 9,
    "title": "2900 Sq Ft Showroom, Madhuranagar,Vizag",
    "price": 145000,
    "city": "Visakhapatnam",
    "state": "Andhra Pradesh",
    "area": null,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1750498465095_3tg8shvv.jpg",
    "latitude": 17.730566167797342,
    "longitude": 83.30659630307578
  },
  {
    "id": "4ea614cd-205e-4662-82e1-1b5725bd8b3e",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T07:02:56.724+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_sale",
    "subtype": "sale",
    "total_count": 9,
    "title": "9000 Sq Ft Showroom, Mudfort",
    "price": 500000000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748934204548_c2km9k4r.jpg",
    "latitude": 17.44896,
    "longitude": 78.495744
  }
]
```

---

### Test 13: Search residential properties below 25K

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 116ms
**Parameters:** `{"p_max_price":25000,"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 11,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  },
  {
    "id": "7e1ecb43-be11-42dd-8345-66bebd5dfe36",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-05-31T08:03:10.682+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 11,
    "title": "2 BHK Service Apartment for Family in Jagjivannagar Colony",
    "price": 12000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 1100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748678642387_t8mg0r26.jpg",
    "latitude": 17.483239333437307,
    "longitude": 78.53876024944253
  }
]
```

---

### Test 14: Search for 2 BHK residential properties

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 108ms
**Parameters:** `{"p_bedrooms":2,"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 10,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  },
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 10,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  }
]
```

---

### Test 15: Search for 3 BHK residential properties

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 130ms
**Parameters:** `{"p_bedrooms":3,"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "1ab064af-6ee4-4c63-980d-29f515da08c1",
    "owner_id": "d1ffbed8-0856-4268-b444-4eaa2639f1d5",
    "created_at": "2025-06-03T10:14:15.761+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 21,
    "title": "3 BHK Villa in Sri Vasavi Siva Nagar Colony",
    "price": 34567899,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 2200,
    "owner_email": "chandrababu.nsn@gmail.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4918573,
    "longitude": 78.58670339999999
  },
  {
    "id": "c8b9a4d9-00f0-4f47-90b0-c6b3dbd58ce9",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T05:10:31.037+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 21,
    "title": "3 BHK Apartment for Family in Mudfort",
    "price": 50000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 2000,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748927500761_r4itqez3.jpg",
    "latitude": 17.44896,
    "longitude": 78.495744
  }
]
```

---

### Test 16: Search residential properties with 2+ bathrooms

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 109ms
**Parameters:** `{"p_bathrooms":2,"p_limit":10}`

**Row Count:** 4

**Sample Data:**
```json
[
  {
    "id": "437f90e4-7ad0-4e4b-9059-3e9a1b871021",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-01T13:08:04.896+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 4,
    "title": "4 BHK Apartment in Ashok Nagar",
    "price": 60000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 1100,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": 4,
    "bathrooms": 4,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4347251,
    "longitude": 78.4979136
  },
  {
    "id": "6bd21b45-fad3-472b-a9d5-056e4ce763e9",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-05-31T05:18:41.624+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 4,
    "title": "4+ BHK Villa in Begumpet",
    "price": 350000000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 1100,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": 4,
    "bathrooms": 6,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748668740256_vucwjsmj.jpg",
    "latitude": 17.4497378691872,
    "longitude": 78.47250599259033
  }
]
```

---

### Test 17: Search residential properties by area range (1000-2000 sq ft)

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 103ms
**Parameters:** `{"p_area_min":1000,"p_area_max":2000,"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "c8b9a4d9-00f0-4f47-90b0-c6b3dbd58ce9",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T05:10:31.037+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 11,
    "title": "3 BHK Apartment for Family in Mudfort",
    "price": 50000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 2000,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748927500761_r4itqez3.jpg",
    "latitude": 17.44896,
    "longitude": 78.495744
  },
  {
    "id": "437f90e4-7ad0-4e4b-9059-3e9a1b871021",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-01T13:08:04.896+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 11,
    "title": "4 BHK Apartment in Ashok Nagar",
    "price": 60000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 1100,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": 4,
    "bathrooms": 4,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4347251,
    "longitude": 78.4979136
  }
]
```

---

### Test 18: Search commercial properties above 3000 sq ft

**Status:** PASSED
**Function:** `search_commercial_properties`
**Execution Time:** 158ms
**Parameters:** `{"p_area_min":3000,"p_limit":10}`

**Row Count:** 0

---

### Test 19: Search residential properties in Hyderabad, Telangana

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 99ms
**Parameters:** `{"p_city":"Hyderabad","p_state":"Telangana","p_limit":15}`

**Row Count:** 15

**Sample Data:**
```json
[
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 25,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  },
  {
    "id": "1ab064af-6ee4-4c63-980d-29f515da08c1",
    "owner_id": "d1ffbed8-0856-4268-b444-4eaa2639f1d5",
    "created_at": "2025-06-03T10:14:15.761+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 25,
    "title": "3 BHK Villa in Sri Vasavi Siva Nagar Colony",
    "price": 34567899,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 2200,
    "owner_email": "chandrababu.nsn@gmail.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4918573,
    "longitude": 78.58670339999999
  }
]
```

---

### Test 20: Search residential properties in Telangana state

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 109ms
**Parameters:** `{"p_state":"Telangana","p_limit":20}`

**Row Count:** 20

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 96,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 96,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

---

### Test 21: Complex residential search (3BHK, 2+ bath, 1500+ sq ft, 30K-80K)

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 115ms
**Parameters:** `{"p_bedrooms":3,"p_bathrooms":2,"p_area_min":1500,"p_min_price":30000,"p_max_price":80000,"p_limit":10}`

**Row Count:** 0

---

### Test 22: Commercial office search with area and price filters

**Status:** PASSED
**Function:** `search_commercial_properties`
**Execution Time:** 112ms
**Parameters:** `{"p_search_query":"office","p_area_min":500,"p_min_price":20000,"p_max_price":100000,"p_limit":10}`

**Row Count:** 0

---

### Test 23: Land search with area and price filters

**Status:** PASSED
**Function:** `search_land_properties`
**Execution Time:** 145ms
**Parameters:** `{"p_property_subtype":"agricultural","p_area_min":1000,"p_max_price":500000,"p_limit":10}`

**Row Count:** 0

---

### Test 24: Pagination - Residential properties first page

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 102ms
**Parameters:** `{"p_limit":5,"p_offset":0}`

**Row Count:** 5

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 96,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 96,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

**Pagination Analysis:** This test validates the pagination functionality.

---

### Test 25: Pagination - Residential properties second page

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 112ms
**Parameters:** `{"p_limit":5,"p_offset":5}`

**Row Count:** 5

**Sample Data:**
```json
[
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 96,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  },
  {
    "id": "1ab064af-6ee4-4c63-980d-29f515da08c1",
    "owner_id": "d1ffbed8-0856-4268-b444-4eaa2639f1d5",
    "created_at": "2025-06-03T10:14:15.761+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 96,
    "title": "3 BHK Villa in Sri Vasavi Siva Nagar Colony",
    "price": 34567899,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 2200,
    "owner_email": "chandrababu.nsn@gmail.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4918573,
    "longitude": 78.58670339999999
  }
]
```

**Pagination Analysis:** This test validates the pagination functionality.

---

### Test 26: Pagination - Residential properties third page

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 113ms
**Parameters:** `{"p_limit":5,"p_offset":10}`

**Row Count:** 5

**Sample Data:**
```json
[
  {
    "id": "c9eda6e1-f6b3-4bcb-a924-b315e6162a02",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T06:25:49.17+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 96,
    "title": "PG in Mudfort",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748932400099_cns32uqi.jpg",
    "latitude": 17.44896,
    "longitude": 78.495744
  },
  {
    "id": "a39e0072-7374-4483-8b9c-edfac36121c2",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T06:10:50.191+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_flatmates",
    "subtype": "flatmates",
    "total_count": 96,
    "title": "Shared Room in 3 BHK in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4786702,
    "longitude": 78.4936358
  }
]
```

**Pagination Analysis:** This test validates the pagination functionality.

---

### Test 27: Latest properties with coordinates (for map display)

**Status:** PASSED
**Function:** `get_latest_properties`
**Execution Time:** 102ms
**Parameters:** `{"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 146,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 146,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

**Coordinate Analysis:** This test validates properties with coordinate data for mapping.

---

### Test 28: Residential properties in Hyderabad with coordinates

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 106ms
**Parameters:** `{"p_city":"Hyderabad","p_limit":15}`

**Row Count:** 15

**Sample Data:**
```json
[
  {
    "id": "e92f65e7-bc5e-40ba-9203-fed5415f8e79",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-03T11:12:06.275+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 25,
    "title": "2 BHK Independent House for Family in Venkataramana Colony",
    "price": 15000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748949171903_ov5rckz9.jpg",
    "latitude": 17.492413909991814,
    "longitude": 78.59138966143799
  },
  {
    "id": "1ab064af-6ee4-4c63-980d-29f515da08c1",
    "owner_id": "d1ffbed8-0856-4268-b444-4eaa2639f1d5",
    "created_at": "2025-06-03T10:14:15.761+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 25,
    "title": "3 BHK Villa in Sri Vasavi Siva Nagar Colony",
    "price": 34567899,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 2200,
    "owner_email": "chandrababu.nsn@gmail.com",
    "status": "draft",
    "bedrooms": 3,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4918573,
    "longitude": 78.58670339999999
  }
]
```

**Coordinate Analysis:** This test validates properties with coordinate data for mapping.

---

### Test 29: Search residential properties with null parameters

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 164ms
**Parameters:** `{"p_search_query":null,"p_city":null,"p_limit":10}`

**Row Count:** 10

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 96,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 96,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

---

### Test 30: Search property by valid code (if exists)

**Status:** PASSED
**Function:** `search_property_by_code`
**Execution Time:** 107ms
**Parameters:** `{"p_code":"BT001234"}`

**Row Count:** 0

**Property Code Search:** This test validates searching by property code.

---

### Test 31: Search residential properties with very high price range

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 1128ms
**Parameters:** `{"p_min_price":1000000,"p_max_price":10000000,"p_limit":10}`

**Row Count:** 7

**Sample Data:**
```json
[
  {
    "id": "9f2dcabd-f890-4c1b-a301-9c7c8f55eaba",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-05-31T09:41:49.071+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 7,
    "title": "4 BHK Villa in Subhash Nagar",
    "price": 8500000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 250,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 4,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748684547803_s7d9zyzl.jpg",
    "latitude": 17.480667858546102,
    "longitude": 78.50973804937503
  },
  {
    "id": "7277b2ef-2166-4044-8dc2-575a7a830873",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-05-31T09:27:45.186+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_sale",
    "subtype": "sale",
    "total_count": 7,
    "title": "2 BHK Independent House in Kiran Enclave",
    "price": 6500000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 150,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748683752801_y1swf99j.jpg",
    "latitude": 17.463059963246792,
    "longitude": 78.48968661689906
  }
]
```

---

### Test 32: Large limit test - residential properties

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 187ms
**Parameters:** `{"p_limit":100}`

**Row Count:** 96

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 96,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 96,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

---

### Test 33: Large limit test - commercial properties

**Status:** PASSED
**Function:** `search_commercial_properties`
**Execution Time:** 117ms
**Parameters:** `{"p_limit":100}`

**Row Count:** 22

**Sample Data:**
```json
[
  {
    "id": "4d689871-95da-4bc8-9eba-7330a07c371b",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-06-21T09:34:06.215+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_rent",
    "subtype": "rent",
    "total_count": 22,
    "title": "2900 Sq Ft Showroom, Madhuranagar,Vizag",
    "price": 145000,
    "city": "Visakhapatnam",
    "state": "Andhra Pradesh",
    "area": null,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1750498465095_3tg8shvv.jpg",
    "latitude": 17.730566167797342,
    "longitude": 83.30659630307578
  },
  {
    "id": "da353dde-cd05-42db-9948-5c338ec756ca",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-06-03T07:57:15.014+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "commercial",
    "flow_type": "commercial_coworking",
    "subtype": "coworking",
    "total_count": 22,
    "title": "Coworking Space in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748937564546_rmc9cgt8.jpg",
    "latitude": 17.4786666,
    "longitude": 78.4936271
  }
]
```

---

### Test 34: Complex apartment search in Hyderabad

**Status:** PASSED
**Function:** `search_residential_properties`
**Execution Time:** 109ms
**Parameters:** `{"p_search_query":"apartment","p_city":"Hyderabad","p_min_price":10000,"p_max_price":50000,"p_bedrooms":2,"p_area_min":1000,"p_limit":20}`

**Row Count:** 2

**Sample Data:**
```json
[
  {
    "id": "7e1ecb43-be11-42dd-8345-66bebd5dfe36",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-05-31T08:03:10.682+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 2,
    "title": "2 BHK Service Apartment for Family in Jagjivannagar Colony",
    "price": 12000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 1100,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748678642387_t8mg0r26.jpg",
    "latitude": 17.483239333437307,
    "longitude": 78.53876024944253
  },
  {
    "id": "5b2cb6e5-e922-469f-ac34-fce1d49b3e2a",
    "owner_id": "e452e033-49ca-4ffc-90bb-d33e26d0284a",
    "created_at": "2025-05-30T11:50:24.147+00:00",
    "updated_at": "2025-07-08T09:11:35.320815+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 2,
    "title": "2 BHK Apartment for Family in Ward No 7 Secunderabad",
    "price": 12000,
    "city": "Hyderabad",
    "state": "Telangana",
    "area": 1050,
    "owner_email": "bhoomitallivideos@gmail.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "1748605940419_nckoqe6z.jpg",
    "latitude": 17.483994191752828,
    "longitude": 78.61696147683958
  }
]
```

---

### Test 35: Test case-insensitive property code search

**Status:** PASSED
**Function:** `search_property_by_code_insensitive`
**Execution Time:** 134ms
**Parameters:** `{"p_code":"bt001234"}`

**Row Count:** 0

**Property Code Search:** This test validates searching by property code.

---

### Test 36: Test latest properties with various limits

**Status:** PASSED
**Function:** `get_latest_properties`
**Execution Time:** 119ms
**Parameters:** `{"p_limit":50}`

**Row Count:** 50

**Sample Data:**
```json
[
  {
    "id": "eb274f5a-70b9-4357-88ab-fec90d069c15",
    "owner_id": "a2edfe63-3f12-4125-9ae1-d47dfc4a5d51",
    "created_at": "2025-07-15T05:07:52.616+00:00",
    "updated_at": "2025-07-15T05:08:14.110937+00:00",
    "property_type": "residential",
    "flow_type": "residential_pghostel",
    "subtype": "pghostel",
    "total_count": 146,
    "title": "PG in Prem Sagar Enclave",
    "price": null,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": null,
    "owner_email": "jonathan@deeppulp.com",
    "status": "draft",
    "bedrooms": null,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": "optimization_2edc938d-4f70-42fe-960d-c5de57d350cf",
    "latitude": 17.4786873,
    "longitude": 78.4935133
  },
  {
    "id": "d41b14e4-b769-4ae3-9c73-099c37f05dff",
    "owner_id": "22b223ee-b382-4f9c-bd3c-e6aa9a4ab5c5",
    "created_at": "2025-07-14T13:45:16.597+00:00",
    "updated_at": "2025-07-14T13:45:18.553377+00:00",
    "property_type": "residential",
    "flow_type": "residential_rent",
    "subtype": "rent",
    "total_count": 146,
    "title": "2 BHK Independent House for Family in Prem Sagar Enclave",
    "price": 45000,
    "city": "Secunderabad",
    "state": "Telangana",
    "area": 100,
    "owner_email": "yesunesun@yahoo.com",
    "status": "draft",
    "bedrooms": 2,
    "bathrooms": null,
    "area_unit": "sq_ft",
    "land_type": null,
    "primary_image": null,
    "latitude": 17.4788561,
    "longitude": 78.4932097
  }
]
```

---

## Overall Analysis

**Average Execution Time:** 158.39ms

### Function Category Analysis

- **Residential Properties:** 22/22 passed
- **Commercial Properties:** 7/7 passed
- **Land Properties:** 2/2 passed
- **Latest Properties:** 3/3 passed
- **Property Code Search:** 2/2 passed

### Key Findings

**High Data Availability:** 8 tests returned >10 results
**No Data Found:** 6 tests returned 0 results

### Recommendations

1. **Good Performance:** The database functions are performing well with 36 successful tests.
2. **Ready for Integration:** The functions appear ready for integration with the frontend.

1. **Data Population:** Consider adding test data to the database for better test coverage.
2. **Search Optimization:** Review search parameters to ensure they match available data.

