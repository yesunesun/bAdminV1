// Browser console test script
// Copy and paste this into the browser console at http://localhost:5174

(async function testSearchByCode() {
  console.log('🧪 Testing Search by Code in Browser...');
  
  try {
    // Import the search service
    const { searchService } = await import('/src/components/Search/services/searchService.ts');
    
    console.log('✅ Search service imported successfully');
    
    // Test property codes
    const testCodes = ['YHDWGX', '23WY3X', '236NSY'];
    
    for (const code of testCodes) {
      console.log(`\n🔍 Testing code: ${code}`);
      
      // Test isPropertyCode validation
      const isValid = searchService.isPropertyCode(code);
      console.log(`  ✅ isPropertyCode("${code}"): ${isValid}`);
      
      if (isValid) {
        try {
          // Test searchByCode
          console.log(`  🔍 Calling searchByCode("${code}")...`);
          const result = await searchService.searchByCode(code);
          console.log(`  ✅ searchByCode returned:`, {
            resultCount: result.results.length,
            totalCount: result.totalCount,
            firstResult: result.results[0] ? {
              id: result.results[0].id,
              title: result.results[0].title,
              code: result.results[0].code
            } : null
          });
          
          // Test smartSearch with property code
          console.log(`  🎯 Calling smartSearch with filters containing code...`);
          const smartResult = await searchService.smartSearch({
            searchQuery: code,
            selectedLocation: 'any',
            selectedPropertyType: 'any',
            selectedSubType: 'any',
            selectedBHK: 'any',
            selectedPriceRange: 'any',
            transactionType: 'any'
          });
          console.log(`  ✅ smartSearch returned:`, {
            resultCount: smartResult.results.length,
            totalCount: smartResult.totalCount,
            firstResult: smartResult.results[0] ? {
              id: smartResult.results[0].id,
              title: smartResult.results[0].title,
              code: smartResult.results[0].code
            } : null
          });
          
        } catch (error) {
          console.error(`  ❌ Error testing ${code}:`, error);
        }
      }
    }
    
    console.log('\n🎉 Test completed! Check results above.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
})();

// Alternative test - simulate user search input
console.log('\n📋 Alternative test: Simulate search input');
console.log('Try typing "YHDWGX" into the search box and see what happens in the console');