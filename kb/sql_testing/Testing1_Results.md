# SQL Testing Results Report

**Generated:** 2025-07-15T17:15:20.775Z
**Database:** Supabase PostgreSQL
**Total Tests:** 18

## Executive Summary

- ✅ **Successful Tests:** 18
- ❌ **Failed Tests:** 0
- 📊 **Success Rate:** 100.0%

## Test Categories

- **Basic Count:** 2 tests
- **Individual Functions:** 5 tests
- **Filtered Search:** 5 tests
- **Complex Search:** 3 tests
- **Pagination:** 3 tests

## Test Results Details

### 1. Count by Status

**Status:** ✅ PASSED
**Result:** {"draft":146}
**Analysis:** Property status distribution

**Query/Function:**
```sql
SELECT status, COUNT(*) FROM properties_v2 WHERE status != "deleted" GROUP BY status
```

---

### 2. Property Details Sample

**Status:** ✅ PASSED
**Rows Returned:** 5
**Analysis:** Sample property details structure

**Sample Results:**
```json
[
  {
    "property_details": {
      "flow": {
        "title": "4 BHK Apartment in Prem Sagar Enclave",
        "category": "residential",
        "flowType": "residential_rent",
        "listingType": "rent"
      },
      "meta": {
        "code": "YHDWGX",
        "status": "draft",
        "_version": "v3.2",
        "created_at": "2025-05-26T08:52:07.632Z",
        "updated_at": "2025-05-26T08:52:07.632Z",
        "codeGeneratedAt": "2025-05-29T23:53:52.741Z"
      },
      "media": {
        "photos": {
          "images": []
        },
        "videos": {
          "url": "https://lkzbwrrauvdinwypmhyb.supabase.co/storage/v1/object/public/property-images-v2/c9158300-e826-40db-a198-81779cd985cd/video_1748253956172_zxten5.mp4",
          "fileName": "video_1748253956172_zxten5.mp4",
          "fileSize": 6403753,
          "uploadedAt": "2025-05-26T10:05:58.374Z",
          "thumbnailUrl": "data:image/jpeg;base64,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"
        }
      },
      "steps": {
        "res_rent_rental": {
          "parking": "Both",
          "furnishing": "Fully Furnished",
          "rentAmount": "65000",
          "maintenance": "Maintenance Extra",
          "petsAllowed": true,
          "availableFrom": "2025-05-31",
          "nonVegAllowed": true,
          "rentNegotiable": true,
          "securityDeposit": "8000",
          "preferredTenants": [
            "Any"
          ]
        },
        "res_rent_review": {},
        "res_rent_features": {
          "amenities": [
            "Power Backup",
            "Gas Pipeline",
            "Intercom",
            "Children Play Area",
            "Garden",
            "Fire Safety",
            "Water Storage",
            "Rain Water Harvesting",
            "Shopping Center",
            "House Keeping",
            "Indoor Games",
            "Air Conditioner",
            "Lift",
            "Swimming Pool",
            "Security",
            "Internet Services",
            "Club House",
            "Park",
            "Sewage Treatment Plant"
          ],
          "balconies": "2",
          "bathrooms": "4",
          "gatedSecurity": true,
          "secondaryNumber": "5667787809",
          "propertyCondition": "Excellent",
          "propertyShowOption": "Agent"
        },
        "res_rent_location": {
          "city": "Secunderabad",
          "state": "Telangana",
          "address": "Manasarovar Heights Phase 2, Phase - 2, Manasarovar Heights Rd, above Ushodaya Super Market, Prem Sagar Enclave, RTC Officers Colony, Tirumalagiri, Secunderabad, Telangana 500009, India",
          "pinCode": "500009",
          "landmark": "bhopal shops",
          "latitude": 17.4787049,
          "locality": "Prem Sagar Enclave",
          "longitude": 78.4936175,
          "flatPlotNo": "556",
          "coordinates_verified": "false"
        },
        "res_rent_basic_details": {
          "floor": "4",
          "facing": "East",
          "bhkType": "4 BHK",
          "builtUpArea": "1234",
          "propertyAge": "1 - 3 years",
          "totalFloors": "9",
          "propertyType": "Apartment",
          "possessionDate": "2025-05-27",
          "builtUpAreaUnit": "sqft"
        }
      },
      "imageFiles": [
        {
          "id": "img_1748250158339_pswlgm2",
          "fileName": "1748250157763_26ykvr21.jpg",
          "isPrimary": true
        },
        {
          "id": "img_1748250162500_2dbktwi",
          "fileName": "1748250162147_7p7dpjip.jpg",
          "isPrimary": false
        }
      ]
    }
  },
  {
    "property_details": {
      "flow": {
        "title": "3 BHK Independent House in Prem Sagar Enclave",
        "category": "residential",
        "flowType": "residential_rent",
        "listingType": "rent"
      },
      "meta": {
        "code": "236NSY",
        "status": "draft",
        "_version": "v3.2",
        "created_at": "2025-05-26T09:03:36.999Z",
        "updated_at": "2025-05-26T09:03:36.999Z",
        "codeGeneratedAt": "2025-05-29T23:53:54.368Z"
      },
      "media": {
        "photos": {
          "images": []
        },
        "videos": {
          "urls": []
        }
      },
      "steps": {
        "res_rent_rental": {
          "parking": "Both",
          "furnishing": "Fully Furnished",
          "rentAmount": "25000",
          "rentalType": "lease",
          "maintenance": "Maintenance Extra",
          "petsAllowed": true,
          "availableFrom": "2025-05-31",
          "nonVegAllowed": true,
          "rentNegotiable": true,
          "securityDeposit": "15000",
          "preferredTenants": [
            "Any"
          ]
        },
        "res_rent_review": {},
        "res_rent_features": {
          "amenities": [
            "Power Backup",
            "Internet Services",
            "Air Conditioner",
            "Gas Pipeline",
            "Intercom",
            "Park",
            "Indoor Games",
            "Children Play Area",
            "Garden",
            "Fire Safety",
            "Water Storage",
            "Rain Water Harvesting",
            "Sewage Treatment Plant"
          ]
        },
        "res_rent_location": {
          "city": "Secunderabad",
          "state": "Telangana",
          "address": "Manasarovar Heights Phase 2, Phase - 2, Manasarovar Heights Rd, above Ushodaya Super Market, Prem Sagar Enclave, RTC Officers Colony, Tirumalagiri, Secunderabad, Telangana 500009, India",
          "pinCode": "500009",
          "landmark": "fh",
          "latitude": 17.4787057,
          "locality": "Prem Sagar Enclave",
          "longitude": 78.4936211,
          "flatPlotNo": "55",
          "coordinates_verified": "false"
        },
        "res_rent_basic_details": {
          "floor": "1",
          "facing": "North West",
          "bhkType": "3 BHK",
          "builtUpArea": "2344",
          "propertyAge": "3 - 5 years",
          "totalFloors": "2",
          "propertyType": "Independent House",
          "possessionDate": "2025-05-27"
        }
      },
      "imageFiles": [
        {
          "id": "img_1748257565980_vsyextc",
          "fileName": "1748257565596_h0oibngj.jpg",
          "isPrimary": true
        },
        {
          "id": "img_1748257571059_5kexj3u",
          "fileName": "1748257570789_4p0z7tpg.jpg",
          "isPrimary": false
        }
      ]
    }
  }
]
```

**Query/Function:**
```sql
SELECT property_details FROM properties_v2 LIMIT 5
```

---

### 3. Test 1: search_residential_properties (all)

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":null,"p_state":null,"p_subtype":null,"p_min_price":null,"p_max_price":null,"p_bedrooms":null,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 4. Test 2: search_commercial_properties (all)

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_commercial_properties({"p_property_subtype":null,"p_search_query":null,"p_state":null,"p_subtype":null,"p_min_price":null,"p_max_price":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 5. Test 3: search_land_properties (all)

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_land_properties({"p_property_subtype":null,"p_search_query":null,"p_min_price":null,"p_max_price":null,"p_city":null,"p_state":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 6. Test 4: get_latest_properties

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: get_latest_properties({"p_limit":10})
```

---

### 7. Test 5: search_property_by_code

**Status:** ✅ PASSED
**Rows Returned:** 0
**Analysis:** Returned 0 rows

**Query/Function:**
```sql
RPC: search_property_by_code({"p_code":"BT001"})
```

---

### 8. Test 6: Residential rent properties

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":null,"p_state":null,"p_subtype":"rent","p_min_price":null,"p_max_price":null,"p_bedrooms":null,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 9. Test 7: Properties in Hyderabad

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":"Hyderabad","p_state":null,"p_subtype":null,"p_min_price":null,"p_max_price":null,"p_bedrooms":null,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 10. Test 8: 2 BHK properties

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":null,"p_state":null,"p_subtype":null,"p_min_price":null,"p_max_price":null,"p_bedrooms":2,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 11. Test 9: Price range ₹10K-₹50K

**Status:** ✅ PASSED
**Rows Returned:** 9
**Analysis:** Returned 9 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":null,"p_state":null,"p_subtype":null,"p_min_price":10000,"p_max_price":50000,"p_bedrooms":null,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 12. Test 10: Text search "apartment"

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":"apartment","p_city":null,"p_state":null,"p_subtype":null,"p_min_price":null,"p_max_price":null,"p_bedrooms":null,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 13. Test 11: Complex multi-filter search

**Status:** ✅ PASSED
**Rows Returned:** 1
**Analysis:** Returned 1 rows

**Sample Results:**
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
    "total_count": 1,
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":"Hyderabad","p_state":"Telangana","p_subtype":"rent","p_min_price":15000,"p_max_price":40000,"p_bedrooms":2,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 14. Test 12: Commercial rent properties

**Status:** ✅ PASSED
**Rows Returned:** 9
**Analysis:** Returned 9 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_commercial_properties({"p_property_subtype":null,"p_search_query":null,"p_state":null,"p_subtype":"rent","p_min_price":null,"p_max_price":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 15. Test 13: Land properties ₹10L-₹1Cr

**Status:** ✅ PASSED
**Rows Returned:** 10
**Analysis:** Returned 10 rows

**Sample Results:**
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
    "total_count": 16,
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
    "total_count": 16,
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

**Query/Function:**
```sql
RPC: search_land_properties({"p_property_subtype":null,"p_search_query":null,"p_min_price":1000000,"p_max_price":10000000,"p_city":null,"p_state":null,"p_area_min":null,"p_area_max":null,"p_limit":10,"p_offset":0})
```

---

### 16. Test 14: First page (limit 5, offset 0)

**Status:** ✅ PASSED
**Rows Returned:** 5
**Analysis:** Returned 5 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":null,"p_state":null,"p_subtype":null,"p_min_price":null,"p_max_price":null,"p_bedrooms":null,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":5,"p_offset":0})
```

---

### 17. Test 15: Second page (limit 5, offset 5)

**Status:** ✅ PASSED
**Rows Returned:** 5
**Analysis:** Returned 5 rows

**Sample Results:**
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

**Query/Function:**
```sql
RPC: search_residential_properties({"p_property_subtype":null,"p_search_query":null,"p_city":null,"p_state":null,"p_subtype":null,"p_min_price":null,"p_max_price":null,"p_bedrooms":null,"p_bathrooms":null,"p_area_min":null,"p_area_max":null,"p_limit":5,"p_offset":5})
```

---

### 18. Pagination Analysis

**Status:** ✅ PASSED
**Result:** {"firstPageCount":5,"secondPageCount":5,"overlap":0,"paginationWorking":true}
**Analysis:** Pagination working correctly

**Query/Function:**
```sql
Compare first and second page results
```

---

## Performance Analysis

- **Average Results per Query:** 7.8
- **Most Productive Test:** Test 1: search_residential_properties (all)
- **Least Productive Test:** Test 5: search_property_by_code

## Recommendations

### Optimization Opportunities

- Consider indexing on frequently queried fields (city, bedrooms, price)
- Implement result caching for popular searches
- Add query performance monitoring

### Next Steps

1. Fix any failing database functions
2. Implement missing search functions if needed
3. Add performance monitoring
4. Consider adding more specific test cases
5. Set up automated testing pipeline

---

*Report generated by SQL Testing Suite*
*Timestamp: 2025-07-15T17:15:20.776Z*
