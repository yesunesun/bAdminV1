import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'https://lkzbwrrauvdinwypmhyb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxremJ3cnJhdXZkaW53eXBtaHliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDgwNTAyNSwiZXhwIjoyMDUwMzgxMDI1fQ.9xQ01SHjN_-YGGn5At0RjQqnR1QIoAIifwJUfPMVV78'

const supabase = createClient(supabaseUrl, supabaseKey)

const tests = [
  {
    id: 1,
    name: "Search all property types with no filters (latest properties)",
    rpc: 'get_latest_properties',
    params: { p_limit: 10 }
  },
  {
    id: 2,
    name: "Search residential properties with 'apartment' text query",
    rpc: 'search_residential_properties',
    params: { p_search_query: 'apartment', p_limit: 15 }
  },
  {
    id: 3,
    name: "Search residential properties in Hyderabad",
    rpc: 'search_residential_properties',
    params: { p_city: 'Hyderabad', p_limit: 20 }
  },
  {
    id: 4,
    name: "Search residential properties",
    rpc: 'search_residential_properties',
    params: { p_limit: 10 }
  },
  {
    id: 5,
    name: "Search commercial properties",
    rpc: 'search_commercial_properties',
    params: { p_limit: 10 }
  },
  {
    id: 6,
    name: "Search land properties",
    rpc: 'search_land_properties',
    params: { p_limit: 10 }
  },
  {
    id: 7,
    name: "Search residential rent properties",
    rpc: 'search_residential_properties',
    params: { p_subtype: 'rent', p_limit: 10 }
  },
  {
    id: 8,
    name: "Search residential sale properties",
    rpc: 'search_residential_properties',
    params: { p_subtype: 'sale', p_limit: 10 }
  },
  {
    id: 9,
    name: "Search commercial rent properties",
    rpc: 'search_commercial_properties',
    params: { p_subtype: 'rent', p_limit: 10 }
  },
  {
    id: 10,
    name: "Search commercial coworking properties",
    rpc: 'search_commercial_properties',
    params: { p_subtype: 'coworking', p_limit: 10 }
  },
  {
    id: 11,
    name: "Search residential properties with price range (10K - 50K)",
    rpc: 'search_residential_properties',
    params: { p_min_price: 10000, p_max_price: 50000, p_limit: 15 }
  },
  {
    id: 12,
    name: "Search commercial properties above 1 Lakh",
    rpc: 'search_commercial_properties',
    params: { p_min_price: 100000, p_limit: 10 }
  },
  {
    id: 13,
    name: "Search residential properties below 25K",
    rpc: 'search_residential_properties',
    params: { p_max_price: 25000, p_limit: 10 }
  },
  {
    id: 14,
    name: "Search for 2 BHK residential properties",
    rpc: 'search_residential_properties',
    params: { p_bedrooms: 2, p_limit: 10 }
  },
  {
    id: 15,
    name: "Search for 3 BHK residential properties",
    rpc: 'search_residential_properties',
    params: { p_bedrooms: 3, p_limit: 10 }
  },
  {
    id: 16,
    name: "Search residential properties with 2+ bathrooms",
    rpc: 'search_residential_properties',
    params: { p_bathrooms: 2, p_limit: 10 }
  },
  {
    id: 17,
    name: "Search residential properties by area range (1000-2000 sq ft)",
    rpc: 'search_residential_properties',
    params: { p_area_min: 1000, p_area_max: 2000, p_limit: 10 }
  },
  {
    id: 18,
    name: "Search commercial properties above 3000 sq ft",
    rpc: 'search_commercial_properties',
    params: { p_area_min: 3000, p_limit: 10 }
  },
  {
    id: 19,
    name: "Search residential properties in Hyderabad, Telangana",
    rpc: 'search_residential_properties',
    params: { p_city: 'Hyderabad', p_state: 'Telangana', p_limit: 15 }
  },
  {
    id: 20,
    name: "Search residential properties in Telangana state",
    rpc: 'search_residential_properties',
    params: { p_state: 'Telangana', p_limit: 20 }
  },
  {
    id: 21,
    name: "Complex residential search (3BHK, 2+ bath, 1500+ sq ft, 30K-80K)",
    rpc: 'search_residential_properties',
    params: { 
      p_bedrooms: 3, 
      p_bathrooms: 2, 
      p_area_min: 1500, 
      p_min_price: 30000, 
      p_max_price: 80000,
      p_limit: 10
    }
  },
  {
    id: 22,
    name: "Commercial office search with area and price filters",
    rpc: 'search_commercial_properties',
    params: { 
      p_search_query: 'office', 
      p_area_min: 500, 
      p_min_price: 20000, 
      p_max_price: 100000,
      p_limit: 10
    }
  },
  {
    id: 23,
    name: "Land search with area and price filters",
    rpc: 'search_land_properties',
    params: { 
      p_property_subtype: 'agricultural', 
      p_area_min: 1000, 
      p_max_price: 500000,
      p_limit: 10
    }
  },
  {
    id: 24,
    name: "Pagination - Residential properties first page",
    rpc: 'search_residential_properties',
    params: { p_limit: 5, p_offset: 0 }
  },
  {
    id: 25,
    name: "Pagination - Residential properties second page",
    rpc: 'search_residential_properties',
    params: { p_limit: 5, p_offset: 5 }
  },
  {
    id: 26,
    name: "Pagination - Residential properties third page",
    rpc: 'search_residential_properties',
    params: { p_limit: 5, p_offset: 10 }
  },
  {
    id: 27,
    name: "Latest properties with coordinates (for map display)",
    rpc: 'get_latest_properties',
    params: { p_limit: 10 },
    filter: (data) => data.filter(item => item.latitude && item.longitude)
  },
  {
    id: 28,
    name: "Residential properties in Hyderabad with coordinates",
    rpc: 'search_residential_properties',
    params: { p_city: 'Hyderabad', p_limit: 15 },
    filter: (data) => data.filter(item => item.latitude && item.longitude)
  },
  {
    id: 29,
    name: "Search residential properties with null parameters",
    rpc: 'search_residential_properties',
    params: { p_search_query: null, p_city: null, p_limit: 10 }
  },
  {
    id: 30,
    name: "Search property by valid code (if exists)",
    rpc: 'search_property_by_code',
    params: { p_code: 'BT001234' }
  },
  {
    id: 31,
    name: "Search residential properties with very high price range",
    rpc: 'search_residential_properties',
    params: { p_min_price: 1000000, p_max_price: 10000000, p_limit: 10 }
  },
  {
    id: 32,
    name: "Large limit test - residential properties",
    rpc: 'search_residential_properties',
    params: { p_limit: 100 }
  },
  {
    id: 33,
    name: "Large limit test - commercial properties",
    rpc: 'search_commercial_properties',
    params: { p_limit: 100 }
  },
  {
    id: 34,
    name: "Complex apartment search in Hyderabad",
    rpc: 'search_residential_properties',
    params: { 
      p_search_query: 'apartment', 
      p_city: 'Hyderabad', 
      p_min_price: 10000, 
      p_max_price: 50000, 
      p_bedrooms: 2, 
      p_area_min: 1000,
      p_limit: 20
    }
  },
  {
    id: 35,
    name: "Test case-insensitive property code search",
    rpc: 'search_property_by_code_insensitive',
    params: { p_code: 'bt001234' }
  },
  {
    id: 36,
    name: "Test latest properties with various limits",
    rpc: 'get_latest_properties',
    params: { p_limit: 50 }
  }
]

async function runTests() {
  const results = []
  
  console.log('🚀 Starting SQL Test Suite Execution...\n')
  
  for (const test of tests) {
    console.log(`⏳ Running Test ${test.id}: ${test.name}`)
    
    try {
      const startTime = Date.now()
      const { data, error } = await supabase.rpc(test.rpc, test.params)
      const endTime = Date.now()
      const executionTime = endTime - startTime
      
      if (error) {
        console.log(`❌ Test ${test.id} FAILED: ${error.message}`)
        results.push({
          id: test.id,
          name: test.name,
          status: 'FAILED',
          error: error.message,
          executionTime,
          params: test.params,
          rpc: test.rpc
        })
      } else {
        let processedData = data
        
        // Apply filter if provided
        if (test.filter && data) {
          processedData = test.filter(data)
        }
        
        // Limit results for display
        if (processedData && processedData.length > 10) {
          processedData = processedData.slice(0, 10)
        }
        
        console.log(`✅ Test ${test.id} PASSED (${executionTime}ms) - ${data?.length || 0} rows`)
        results.push({
          id: test.id,
          name: test.name,
          status: 'PASSED',
          data: processedData,
          rowCount: data?.length || 0,
          executionTime,
          params: test.params,
          rpc: test.rpc
        })
      }
    } catch (err) {
      console.log(`❌ Test ${test.id} ERROR: ${err.message}`)
      results.push({
        id: test.id,
        name: test.name,
        status: 'ERROR',
        error: err.message,
        executionTime: 0,
        params: test.params,
        rpc: test.rpc
      })
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  console.log('\n🎉 Test Suite Execution Complete!')
  
  // Generate summary
  const passed = results.filter(r => r.status === 'PASSED').length
  const failed = results.filter(r => r.status === 'FAILED').length
  const errors = results.filter(r => r.status === 'ERROR').length
  
  console.log(`\n📊 Test Summary:`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Errors: ${errors}`)
  console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(2)}%`)
  
  // Save results to file
  const reportContent = generateReport(results)
  fs.writeFileSync('/Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/kb/sql_testing_results.md', reportContent)
  
  console.log('\n💾 Results saved to kb/sql_testing_results.md')
  
  return results
}

function generateReport(results) {
  const now = new Date().toISOString()
  const passed = results.filter(r => r.status === 'PASSED').length
  const failed = results.filter(r => r.status === 'FAILED').length
  const errors = results.filter(r => r.status === 'ERROR').length
  
  let report = `# SQL Testing Results Report\n\n`
  report += `**Generated:** ${now}\n`
  report += `**Total Tests:** ${results.length}\n`
  report += `**Passed:** ${passed}\n`
  report += `**Failed:** ${failed}\n`
  report += `**Errors:** ${errors}\n`
  report += `**Success Rate:** ${((passed / results.length) * 100).toFixed(2)}%\n\n`
  
  report += `## Executive Summary\n\n`
  
  if (passed > 0) {
    report += `✅ **${passed} tests passed successfully** - The database functions are working correctly for these test cases.\n\n`
  }
  
  if (failed > 0) {
    report += `❌ **${failed} tests failed** - These tests encountered database errors or unexpected results.\n\n`
  }
  
  if (errors > 0) {
    report += `⚠️ **${errors} tests had errors** - These tests could not be executed due to technical issues.\n\n`
  }
  
  // Function performance analysis
  const functionPerformance = {}
  results.filter(r => r.status === 'PASSED').forEach(result => {
    if (!functionPerformance[result.rpc]) {
      functionPerformance[result.rpc] = { count: 0, totalTime: 0, tests: [] }
    }
    functionPerformance[result.rpc].count++
    functionPerformance[result.rpc].totalTime += result.executionTime
    functionPerformance[result.rpc].tests.push(result.id)
  })
  
  report += `## Function Performance Analysis\n\n`
  for (const [funcName, stats] of Object.entries(functionPerformance)) {
    const avgTime = stats.totalTime / stats.count
    report += `**${funcName}**: ${stats.count} tests, avg ${avgTime.toFixed(2)}ms\n`
  }
  report += `\n`
  
  report += `## Test Results Detail\n\n`
  
  for (const result of results) {
    report += `### Test ${result.id}: ${result.name}\n\n`
    report += `**Status:** ${result.status}\n`
    report += `**Function:** \`${result.rpc}\`\n`
    report += `**Execution Time:** ${result.executionTime}ms\n`
    report += `**Parameters:** \`${JSON.stringify(result.params)}\`\n\n`
    
    if (result.status === 'PASSED') {
      report += `**Row Count:** ${result.rowCount}\n\n`
      if (result.data && result.data.length > 0) {
        report += `**Sample Data:**\n`
        report += `\`\`\`json\n${JSON.stringify(result.data.slice(0, 2), null, 2)}\n\`\`\`\n\n`
      }
      
      // Add specific analysis for some tests
      if (result.id >= 24 && result.id <= 26) {
        report += `**Pagination Analysis:** This test validates the pagination functionality.\n\n`
      }
      
      if (result.id === 27 || result.id === 28) {
        report += `**Coordinate Analysis:** This test validates properties with coordinate data for mapping.\n\n`
      }
      
      if (result.id === 30 || result.id === 35) {
        report += `**Property Code Search:** This test validates searching by property code.\n\n`
      }
      
    } else {
      report += `**Error:** ${result.error}\n\n`
    }
    
    report += `---\n\n`
  }
  
  // Add overall analysis
  report += `## Overall Analysis\n\n`
  
  const avgExecutionTime = results.filter(r => r.status === 'PASSED').reduce((sum, r) => sum + r.executionTime, 0) / passed
  if (avgExecutionTime > 0) {
    report += `**Average Execution Time:** ${avgExecutionTime.toFixed(2)}ms\n\n`
  }
  
  // Analyze by function type
  const residentialTests = results.filter(r => r.rpc === 'search_residential_properties')
  const commercialTests = results.filter(r => r.rpc === 'search_commercial_properties')
  const landTests = results.filter(r => r.rpc === 'search_land_properties')
  const latestTests = results.filter(r => r.rpc === 'get_latest_properties')
  const codeTests = results.filter(r => r.rpc === 'search_property_by_code' || r.rpc === 'search_property_by_code_insensitive')
  
  report += `### Function Category Analysis\n\n`
  report += `- **Residential Properties:** ${residentialTests.filter(r => r.status === 'PASSED').length}/${residentialTests.length} passed\n`
  report += `- **Commercial Properties:** ${commercialTests.filter(r => r.status === 'PASSED').length}/${commercialTests.length} passed\n`
  report += `- **Land Properties:** ${landTests.filter(r => r.status === 'PASSED').length}/${landTests.length} passed\n`
  report += `- **Latest Properties:** ${latestTests.filter(r => r.status === 'PASSED').length}/${latestTests.length} passed\n`
  report += `- **Property Code Search:** ${codeTests.filter(r => r.status === 'PASSED').length}/${codeTests.length} passed\n\n`
  
  report += `### Key Findings\n\n`
  
  // Data availability analysis
  const dataAvailability = results.filter(r => r.status === 'PASSED').map(r => ({
    id: r.id,
    name: r.name,
    rowCount: r.rowCount,
    function: r.rpc
  }))
  
  const highDataTests = dataAvailability.filter(r => r.rowCount > 10)
  const noDataTests = dataAvailability.filter(r => r.rowCount === 0)
  
  if (highDataTests.length > 0) {
    report += `**High Data Availability:** ${highDataTests.length} tests returned >10 results\n`
  }
  
  if (noDataTests.length > 0) {
    report += `**No Data Found:** ${noDataTests.length} tests returned 0 results\n`
  }
  
  report += `\n### Recommendations\n\n`
  
  if (failed > 0 || errors > 0) {
    report += `1. **Fix Failed Tests:** Review and fix the ${failed + errors} failed/error tests before deploying to production.\n`
    report += `2. **Database Review:** Check database function parameters and ensure they match the expected signatures.\n`
    report += `3. **Error Handling:** Implement proper error handling for edge cases.\n\n`
  }
  
  if (passed >= 30) {
    report += `1. **Good Performance:** The database functions are performing well with ${passed} successful tests.\n`
    report += `2. **Ready for Integration:** The functions appear ready for integration with the frontend.\n\n`
  }
  
  if (noDataTests.length > 5) {
    report += `1. **Data Population:** Consider adding test data to the database for better test coverage.\n`
    report += `2. **Search Optimization:** Review search parameters to ensure they match available data.\n\n`
  }
  
  return report
}

// Run the tests
runTests().catch(console.error)