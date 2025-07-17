# Search by Code Testing Guide

## Current Status
✅ Fixed searchByCode and smartSearch methods to use Supabase fallback
✅ Added enhanced debug logging
✅ Verified database functions work correctly

## Test Instructions

### 1. Open the Application
Navigate to: http://localhost:5174

### 2. Open Browser Console
Press F12 or right-click → Inspect Element → Console tab

### 3. Test Property Codes
Try searching for these known property codes:
- **YHDWGX** (Secunderabad, Telangana - ₹65,000)
- **23WY3X** 
- **236NSY**
- **22ATMA**
- **6TUA56**

### 4. Browser Console Test Script
Copy and paste this into the browser console:

```javascript
// Test search by code functionality
(async function() {
  try {
    const { searchService } = await import('/src/components/Search/services/searchService.ts');
    console.log('Testing YHDWGX...');
    const result = await searchService.searchByCode('YHDWGX');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
})();
```

### 5. Expected Console Output
Look for these log messages:
- `🔄 Using Supabase fallback for searchByCode`
- `🔍 SearchByCode parameters: {code: "YHDWGX", exact: true, trimmedCode: "YHDWGX"}`
- `🔍 Using RPC function: search_property_by_code`
- `✅ Supabase search by code fallback completed`

### 6. What Should Happen
1. Property code should be detected (orange border around search box)
2. Search should return results
3. Property details should display

## Troubleshooting

### If search doesn't work:
1. Check browser console for error messages
2. Verify the dev server is running on port 5174
3. Check network tab for failed requests

### If no results show:
1. Check console logs for "✅ Supabase search by code fallback completed"
2. Verify resultCount > 0 in the logs
3. Check if SearchResultsView component is receiving results

## Technical Details

### What Was Fixed:
1. **searchByCode**: Now uses Supabase fallback instead of failed Kong API
2. **smartSearch**: Now detects property codes and routes to searchByCode
3. **Enhanced Logging**: Added detailed console output for debugging

### Files Modified:
- `src/components/Search/services/searchService.ts`
  - Added `searchByCodeFromSupabase` method
  - Updated `searchByCode` to use Supabase fallback
  - Updated `smartSearch` to detect property codes

### Database Function Used:
- `search_property_by_code(p_code text)` - Exact match
- `search_property_by_code_insensitive(p_code text)` - Case-insensitive match