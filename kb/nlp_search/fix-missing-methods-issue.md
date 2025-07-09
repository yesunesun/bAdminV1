# Fix: Missing Methods in useEnhancedSearch Hook

**Issue:** `TypeError: search.getSubtypeLabel is not a function`

**Root Cause:** The useEnhancedSearch hook is missing methods that the original useSearch hook provided

**Solution:** Add missing methods to useEnhancedSearch hook

**Files Affected:**
- `/src/components/Search/hooks/useEnhancedSearch.ts`

**Methods to Add:**
- `getSubtypeLabel`
- `getSubTypes`
- `updateLocation`
- Other utility methods from useSearch

**Methods Added:**
- `getSubTypes` - Get available subtypes for current property type
- `getSubtypeLabel` - Get label for subtype dropdown
- `hasActiveFilters` - Check if any filters are active
- `getFilterDisplayValue` - Get display value for filter
- `clearAllFilters` - Clear all filters
- `updateLocation` - Update location filter
- `updateSearchQuery` - Update search query
- `clearResults` - Clear search results
- `isValidPropertyCode` - Check if query is valid property code

**Date:** 2025-07-09
**Status:** ✅ Fixed - All methods added, build successful