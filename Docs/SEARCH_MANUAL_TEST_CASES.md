# Search Functionality - Manual Test Cases

## Overview

This document contains comprehensive manual test cases for the search functionality in the Bhoomitalli real estate platform. The search system includes a unified search interface with location filtering, property type filtering, and advanced search capabilities.

## Test Environment Setup

- **Browser:** Chrome/Firefox/Safari (latest versions)
- **Devices:** Desktop (1920x1080), Tablet (768px), Mobile (375px)
- **Prerequisites:** Application running locally or on staging environment
- **Test Data:** Sample properties in database across different categories

---

## 1. Basic Search Interface Tests

### Test Case 1.1: Search Container Layout
**Objective:** Verify search container displays correctly with all elements

**Steps:**
1. Navigate to homepage/search page
2. Verify search container is visible and properly styled

**Expected Results:**
- Search container displays with gradient header (blue to purple)
- Location dropdown shows with MapPin icon
- Search input field displays with placeholder text
- Search button shows with Search icon
- Filter row displays below with all dropdown filters

**Priority:** High

---

### Test Case 1.2: Responsive Design
**Objective:** Ensure search interface adapts to different screen sizes

**Steps:**
1. Test on desktop (1920x1080)
2. Test on tablet (768px width)
3. Test on mobile (375px width)

**Expected Results:**
- Desktop: Horizontal layout with all elements in one row
- Mobile: Stacked layout with location above search bar
- All elements remain accessible and properly sized

**Priority:** High

---

## 2. Location Filter Tests

### Test Case 2.1: Location Dropdown
**Objective:** Verify location filter functionality

**Steps:**
1. Click on location dropdown
2. Verify available options
3. Select different locations

**Expected Results:**
- Dropdown shows "Any Location" as default
- Shows all Telangana locations (Hyderabad, Secunderabad, Warangal, etc.)
- Selected location updates in dropdown
- Location selection triggers search automatically (300ms debounce)

**Priority:** High

---

## 3. Search Input Tests

### Test Case 3.1: Basic Text Search
**Objective:** Test standard text-based search functionality

**Steps:**
1. Type "gachibowli" in search input
2. Wait for suggestions to appear
3. Press Enter or click Search

**Expected Results:**
- Search suggestions appear after 2+ characters with 300ms debounce
- Suggestions include relevant location matches
- Search executes and shows results

**Priority:** High

---

### Test Case 3.2: Property Code Search
**Objective:** Test property code detection and search

**Steps:**
1. Type "BT001234" (property code format)
2. Observe input field changes
3. Execute search

**Expected Results:**
- Input field shows orange border and background
- "CODE" badge appears in input field
- Placeholder text changes to show property code format
- Property code suggestions show with "Search by code:" prefix

**Priority:** Medium

---

### Test Case 3.3: Search Suggestions
**Objective:** Verify search suggestion dropdown functionality

**Steps:**
1. Type partial text (e.g., "gachi")
2. Wait for suggestions dropdown
3. Click on a suggestion

**Expected Results:**
- Suggestions appear after 300ms delay
- Property code suggestions show with orange "CODE" badge
- Clicking suggestion fills input and triggers search
- Dropdown closes after selection

**Priority:** Medium

---

### Test Case 3.4: Search Input Controls
**Objective:** Test search input interaction controls

**Steps:**
1. Type text in search input
2. Click the X (clear) button
3. Use keyboard navigation (Enter, Escape)

**Expected Results:**
- Clear button (X) appears when text is entered
- Clicking X clears input and hides suggestions
- Enter key triggers search
- Escape key closes suggestions dropdown

**Priority:** Medium

---

## 4. Filter Tests

### Test Case 4.1: Action Type Filter (Buy/Rent/Any)
**Objective:** Test action type filter and its effect on available property types

**Steps:**
1. Select "Buy" from action type dropdown
2. Verify available property types change
3. Select "Rent" and verify again
4. Select "Any" and verify all types available

**Expected Results:**
- Buy: Shows Residential, Commercial, Land
- Rent: Shows Residential, Commercial, PG/Hostel, Flatmates
- Any: Shows all property types
- Filter change triggers automatic search

**Priority:** High

---

### Test Case 4.2: Property Type Filter
**Objective:** Test property type selection and subtype dependencies

**Steps:**
1. Set action type to "Buy"
2. Select "Residential" property type
3. Verify subtype options
4. Change to "Commercial" and verify subtypes

**Expected Results:**
- Residential subtypes: Apartment, Independent House, Villa, etc.
- Commercial subtypes: Office Space, Shop, Showroom, etc.
- Land subtypes: Agricultural, Residential Plot, Commercial Plot, etc.
- Subtype dropdown enables/disables based on selection

**Priority:** High

---

### Test Case 4.3: Subtype Filter Dependencies
**Objective:** Verify subtype filter behavior based on property type selection

**Steps:**
1. Start with "Any" property type
2. Verify subtype dropdown is disabled
3. Select specific property type
4. Verify subtype dropdown enables with relevant options

**Expected Results:**
- Subtype disabled when property type is "Any"
- Subtype label changes based on property type:
  - Residential: "Property Type"
  - Land: "Land Type"
  - PG/Hostel/Flatmates: "Room Type"
  - Commercial: "Space Type"

**Priority:** Medium

---

### Test Case 4.4: BHK Filter Conditional Display
**Objective:** Test BHK filter visibility based on property type

**Steps:**
1. Select "Residential" property type
2. Verify BHK filter appears
3. Select "Commercial" property type
4. Verify BHK filter disappears
5. Select "PG/Hostel" or "Flatmates"
6. Verify BHK filter doesn't appear

**Expected Results:**
- BHK filter only visible for "Residential" property type
- Shows options: 1 BHK, 2 BHK, 3 BHK, 4 BHK, 4+ BHK
- Hidden for all other property types

**Priority:** Medium

---

### Test Case 4.5: Price Range Filter
**Objective:** Test price range filter functionality

**Steps:**
1. Click price range dropdown
2. Verify all price ranges available
3. Select different ranges

**Expected Results:**
- Shows price ranges from "Under ₹10L" to "Above ₹10Cr"
- Available for all property types
- Selection triggers automatic search

**Priority:** Medium

---

### Test Case 4.6: Reset Filters
**Objective:** Test filter reset functionality

**Steps:**
1. Apply multiple filters
2. Verify reset button appears
3. Click reset button

**Expected Results:**
- Reset button with rotate icon appears when filters are active
- Clicking reset clears all filters to default ("Any" values)
- Reset triggers new search with cleared filters

**Priority:** Medium

---

## 5. Search Execution Tests

### Test Case 5.1: Manual Search Trigger
**Objective:** Test manual search execution methods

**Steps:**
1. Enter search criteria
2. Click Search button
3. Press Enter in search input

**Expected Results:**
- Loading state shows during search
- Results display in table format
- Search summary shows applied filters
- Total count displays if results found

**Priority:** High

---

### Test Case 5.2: Automatic Search on Filter Change
**Objective:** Test automatic search triggering on filter changes

**Steps:**
1. Change any filter (except search query)
2. Wait 300ms
3. Verify search executes automatically

**Expected Results:**
- Search triggers automatically after 300ms delay
- No manual search button click required
- Loading state shows briefly

**Priority:** High

---

### Test Case 5.3: Search Query Debouncing
**Objective:** Test search suggestion debouncing behavior

**Steps:**
1. Rapidly type in search input
2. Observe suggestion timing
3. Stop typing and wait

**Expected Results:**
- Suggestions don't appear until 300ms after stopping
- Prevents excessive API calls
- Final suggestions match complete input

**Priority:** Medium

---

## 6. Search Results Tests

### Test Case 6.1: Results Display
**Objective:** Verify search results display format and functionality

**Steps:**
1. Execute search with results
2. Verify results table format
3. Check result actions

**Expected Results:**
- Results show in table with property details
- Each result has "View Details" and "Contact Owner" buttons
- Search summary shows applied filters and result count

**Priority:** High

---

### Test Case 6.2: No Results State
**Objective:** Test no results scenario handling

**Steps:**
1. Search for non-existent criteria
2. Verify no results message

**Expected Results:**
- Appropriate "No results found" message
- Search summary still shows applied filters
- Suggestion to modify search criteria

**Priority:** Medium

---

### Test Case 6.3: Error State Handling
**Objective:** Test error handling in search functionality

**Steps:**
1. Simulate network error
2. Verify error display

**Expected Results:**
- Error message in red card format
- "Try again" button to reload
- Error details if available

**Priority:** Medium

---

### Test Case 6.4: Initial State (No Search)
**Objective:** Verify initial page state before any search

**Steps:**
1. Load page without any search
2. Verify initial message

**Expected Results:**
- "Start Your Property Search" message
- Instructions to use search and filters
- No search summary or results table

**Priority:** Low

---

## 7. Performance Tests

### Test Case 7.1: Debounce Timing
**Objective:** Verify debounce timing for optimal performance

**Steps:**
1. Type quickly in search input
2. Measure suggestion response time
3. Change filters rapidly

**Expected Results:**
- Search suggestions: 300ms delay
- Filter changes: 300ms auto-search delay
- No multiple simultaneous requests

**Priority:** Medium

---

### Test Case 7.2: Loading States
**Objective:** Test loading state transitions

**Steps:**
1. Execute search
2. Observe loading indicators
3. Verify transitions

**Expected Results:**
- Loading state shows immediately
- Results replace loading smoothly
- No flash of incorrect content

**Priority:** Low

---

## 8. Integration Tests

### Test Case 8.1: Property Code Detection
**Objective:** Test property code detection accuracy

**Steps:**
1. Enter various property code formats
2. Verify detection accuracy

**Expected Results:**
- Formats like "BT001234" detected as property codes
- Visual indicators (orange styling, CODE badge)
- Appropriate suggestions generated

**Priority:** Medium

---

### Test Case 8.2: Cross-Filter Dependencies
**Objective:** Test filter interaction and dependencies

**Steps:**
1. Test all filter combinations
2. Verify logical constraints

**Expected Results:**
- Action type correctly limits property types
- Property type correctly enables/disables subtypes
- BHK only shows for residential
- All combinations work logically

**Priority:** High

---

## 9. Edge Cases

### Test Case 9.1: Empty Search
**Objective:** Test behavior with no search criteria

**Steps:**
1. Click search with no input or filters
2. Verify behavior

**Expected Results:**
- Appropriate handling (show all or prompt for criteria)
- No errors or crashes

**Priority:** Low

---

### Test Case 9.2: Special Characters
**Objective:** Test handling of special characters in search

**Steps:**
1. Enter special characters in search
2. Test unicode characters

**Expected Results:**
- Graceful handling of all input types
- No JavaScript errors
- Appropriate search behavior

**Priority:** Low

---

### Test Case 9.3: Very Long Input
**Objective:** Test behavior with extremely long search strings

**Steps:**
1. Enter very long search strings
2. Test input limits

**Expected Results:**
- Input handles long strings gracefully
- UI doesn't break with overflow
- Search still functions correctly

**Priority:** Low

---

## Test Execution Guidelines

### Before Testing
1. Ensure test environment is stable
2. Verify sample data is available
3. Clear browser cache if needed

### During Testing
1. Document actual results for each test case
2. Capture screenshots for visual issues
3. Note browser console errors
4. Record response times for performance tests

### After Testing
1. Summarize pass/fail status for each test case
2. Document any bugs found with reproduction steps
3. Prioritize issues based on severity
4. Create bug reports for development team

### Test Results Template
```
Test Case ID: [e.g., 1.1]
Status: [Pass/Fail/Blocked]
Actual Result: [What actually happened]
Issues Found: [Any bugs or unexpected behavior]
Notes: [Additional observations]
Tested By: [Tester name]
Date: [Test execution date]
```

---

## Browser Compatibility

Test the search functionality across:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Mobile Testing

Specific focus areas for mobile:
- Touch interactions
- Keyboard behavior
- Screen orientation changes
- Performance on slower devices

---

*Last Updated: [Current Date]*
*Version: 1.0*
*Document Owner: QA Team*