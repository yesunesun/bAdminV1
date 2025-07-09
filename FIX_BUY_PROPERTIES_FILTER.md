# Fix: Buy Properties Filter Only Shows Residential Properties

## Problem Description

When users select "Buy Properties" filter, only residential properties are displayed instead of showing all property types (residential, commercial, and land) that are available for purchase.

## Root Cause

The issue is caused by **duplicate database functions** for `search_commercial_properties` and `search_land_properties`. PostgreSQL cannot determine which function to call when there are multiple functions with the same name but different parameter orders, causing the searches to return no data instead of errors.

## Investigation Summary

### Duplicate Functions Found:

**search_commercial_properties:**
- Function 1: `(p_subtype, p_property_subtype, p_search_query, p_city, p_state, p_min_price, p_max_price, p_area_min, p_area_max, p_limit, p_offset)`
- Function 2: `(p_subtype, p_property_subtype, p_search_query, p_min_price, p_max_price, p_city, p_state, p_area_min, p_area_max, p_limit, p_offset)`

**search_land_properties:**
- Function 1: `(p_property_subtype, p_search_query, p_city, p_state, p_min_price, p_max_price, p_area_min, p_area_max, p_limit, p_offset)`
- Function 2: `(p_property_subtype, p_search_query, p_min_price, p_max_price, p_city, p_state, p_area_min, p_area_max, p_limit, p_offset)`

### Search Flow Analysis

1. User selects "Buy Properties" → `actionType: 'buy'`
2. Frontend transforms to `transactionType: 'buy'` and `p_subtype: 'sale'`
3. Search service calls `searchAllPropertyTypes()` which queries:
   - `search_residential_properties()` ✅ Works (56 properties found)
   - `search_commercial_properties()` ❌ Fails due to duplicate functions
   - `search_land_properties()` ❌ Fails due to duplicate functions
4. Only residential results are returned

## Solution: Database Migration

### Step 1: Create Migration File

The migration file is already created at:
```
/Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/supabase/migrations/20250709100000_fix_duplicate_search_functions.sql
```

### Step 2: Run Migration

Execute the following command from the project root:

```bash
npx supabase db push
```

### Step 3: Verify Fix

After migration, test the "Buy Properties" filter:

1. Open the application in browser
2. Open Developer Tools → Console tab
3. Select "Buy Properties" from the filter dropdown
4. Click Search button
5. Look for these console logs:
   - `🏠 Residential search results: X properties`
   - `🏢 Commercial search results: X properties` (should show data if commercial properties exist)
   - `🌍 Land search results: X properties` (should show data if land properties exist)

## Migration Details

The migration performs the following actions:

### 1. Drop All Duplicate Functions
```sql
-- Drop all existing search_commercial_properties functions
DROP FUNCTION IF EXISTS public.search_commercial_properties(text,text,text,numeric,numeric,text,text,numeric,numeric,integer,integer);
DROP FUNCTION IF EXISTS public.search_commercial_properties(text,text,text,text,text,numeric,numeric,numeric,numeric,integer,integer);
DROP FUNCTION IF EXISTS public.search_commercial_properties(text,text,numeric,numeric,text,text,numeric,numeric,integer,integer);

-- Drop all existing search_land_properties functions  
DROP FUNCTION IF EXISTS public.search_land_properties(text,text,text,text,numeric,numeric,numeric,numeric,integer,integer);
DROP FUNCTION IF EXISTS public.search_land_properties(text,text,numeric,numeric,text,text,numeric,numeric,integer,integer);
```

### 2. Create Correct Functions

**search_commercial_properties** with parameter order:
```
(p_subtype, p_property_subtype, p_search_query, p_min_price, p_max_price, p_city, p_state, p_area_min, p_area_max, p_limit, p_offset)
```

**search_land_properties** with parameter order:
```
(p_property_subtype, p_search_query, p_min_price, p_max_price, p_city, p_state, p_area_min, p_area_max, p_limit, p_offset)
```

### 3. Uses Existing Helper Functions

The migration uses the existing helper functions that are already in the database:

**Commercial helpers:**
- `extract_commercial_*()` functions
- `matches_commercial_subtype()`
- `commercial_flow_type_to_subtype()`

**Land helpers:**
- `extract_land_*()` functions  
- `extract_land_flow_type()`
- `land_flow_type_to_subtype()`

## Expected Results After Fix

When "Buy Properties" is selected, the search should return:
- **Residential properties** for sale (rent/sale flow_type = 'residential_sale')
- **Commercial properties** for sale (flow_type = 'commercial_sale') 
- **Land properties** (flow_type = 'land_sale' - land is always for sale)

## Troubleshooting

### If Migration Fails
1. Check for missing helper functions by running:
```sql
SELECT proname FROM pg_proc WHERE proname LIKE 'extract_commercial_%' OR proname LIKE 'extract_land_%';
```

2. If helper functions are missing, you may need to run the function creation scripts first:
   - `/sql/search_commercial_properties_refactored_070625.sql`
   - `/sql/search_land_properties_refactored_070625.sql`

### If Search Still Returns Only Residential
1. Check if commercial/land properties exist in database:
```sql
-- Check property counts by type
SELECT 
    property_details->'flow'->>'category' as category,
    property_details->'flow'->>'listingType' as listing_type,
    COUNT(*) as count
FROM properties_v2 
WHERE status IS DISTINCT FROM 'deleted'
GROUP BY property_details->'flow'->>'category', property_details->'flow'->>'listingType'
ORDER BY count DESC;
```

2. Test functions directly:
```sql
-- Test commercial search
SELECT COUNT(*) FROM search_commercial_properties(p_subtype => 'sale');

-- Test land search  
SELECT COUNT(*) FROM search_land_properties();
```

### If Functions Still Have Conflicts
Check for remaining duplicates:
```sql
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
  AND p.proname IN ('search_commercial_properties', 'search_land_properties')
ORDER BY p.proname;
```

## Files Modified

1. **Migration file created**: `/supabase/migrations/20250709100000_fix_duplicate_search_functions.sql`
2. **Debug logs added**: Already present in search service for troubleshooting

## Contact

If this fix doesn't resolve the issue, the debugging logs in the console will show exactly what's happening at each step of the search process.