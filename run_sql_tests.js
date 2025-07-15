import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test results container
let testResults = [];

function addTestResult(testName, query, result, analysis = '') {
  testResults.push({
    testName,
    query,
    result,
    analysis,
    timestamp: new Date().toISOString()
  });
}

async function runQuery(rpcFunction, params, testName, description = '') {
  try {
    console.log(`\n🔍 Running ${testName}...`);
    if (description) {
      console.log(`📝 ${description}`);
    }
    
    const { data, error } = await supabase.rpc(rpcFunction, params);
    
    if (error) {
      console.error(`❌ Error in ${testName}:`, error);
      addTestResult(testName, `RPC: ${rpcFunction}(${JSON.stringify(params)})`, { error: error.message }, 'Query failed');
      return null;
    }
    
    console.log(`✅ ${testName} completed - ${data?.length || 0} rows returned`);
    addTestResult(testName, `RPC: ${rpcFunction}(${JSON.stringify(params)})`, data, `Returned ${data?.length || 0} rows`);
    return data;
  } catch (err) {
    console.error(`❌ Exception in ${testName}:`, err);
    addTestResult(testName, `RPC: ${rpcFunction}(${JSON.stringify(params)})`, { error: err.message }, 'Query exception');
    return null;
  }
}

async function runBasicCountQueries() {
  console.log('\n📊 BASIC COUNT VERIFICATION QUERIES');
  console.log('=' + '='.repeat(50));
  
  try {
    // Test 1: Count all properties by status
    const { data: statusData } = await supabase
      .from('properties_v2')
      .select('status')
      .neq('status', 'deleted');
    
    const statusCounts = {};
    statusData?.forEach(item => {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    });
    
    console.log('✅ Property counts by status:', statusCounts);
    addTestResult('Count by Status', 'SELECT status, COUNT(*) FROM properties_v2 WHERE status != "deleted" GROUP BY status', statusCounts, 'Property status distribution');
    
    // Test 2: Sample property_details structure
    const { data: sampleData } = await supabase
      .from('properties_v2')
      .select('property_details')
      .not('property_details', 'is', null)
      .limit(5);
    
    console.log('✅ Sample property_details structure:', sampleData?.length || 0, 'properties found');
    addTestResult('Property Details Sample', 'SELECT property_details FROM properties_v2 LIMIT 5', sampleData, 'Sample property details structure');
    
  } catch (error) {
    console.error('❌ Basic count queries failed:', error);
  }
}

async function runIndividualFunctionTests() {
  console.log('\n🔍 INDIVIDUAL FUNCTION TESTS');
  console.log('=' + '='.repeat(50));
  
  // Test 1: search_residential_properties
  await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 1: search_residential_properties (all)', 'Get all residential properties');
  
  // Test 2: search_commercial_properties
  await runQuery('search_commercial_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_state: null,
    p_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 2: search_commercial_properties (all)', 'Get all commercial properties');
  
  // Test 3: search_land_properties
  await runQuery('search_land_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_min_price: null,
    p_max_price: null,
    p_city: null,
    p_state: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 3: search_land_properties (all)', 'Get all land properties');
  
  // Test 4: get_latest_properties
  await runQuery('get_latest_properties', {
    p_limit: 10
  }, 'Test 4: get_latest_properties', 'Get latest 10 properties');
  
  // Test 5: search_property_by_code (if it exists)
  await runQuery('search_property_by_code', {
    p_code: 'BT001'
  }, 'Test 5: search_property_by_code', 'Search for property code BT001');
}

async function runFilteredSearchTests() {
  console.log('\n🎯 FILTERED SEARCH TESTS');
  console.log('=' + '='.repeat(50));
  
  // Test 6: Residential rent properties
  await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_subtype: 'rent',
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 6: Residential rent properties', 'Filter for rental properties only');
  
  // Test 7: Properties in Hyderabad
  await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: 'Hyderabad',
    p_state: null,
    p_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 7: Properties in Hyderabad', 'Filter by city: Hyderabad');
  
  // Test 8: 2 BHK properties
  await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: 2,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 8: 2 BHK properties', 'Filter by bedrooms: 2');
  
  // Test 9: Price range filter
  await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_subtype: null,
    p_min_price: 10000,
    p_max_price: 50000,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 9: Price range ₹10K-₹50K', 'Filter by price range');
  
  // Test 10: Text search
  await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: 'apartment',
    p_city: null,
    p_state: null,
    p_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 10: Text search "apartment"', 'Filter by search text');
}

async function runComplexSearchTests() {
  console.log('\n🔬 COMPLEX SEARCH TESTS');
  console.log('=' + '='.repeat(50));
  
  // Test 11: Complex multi-filter search
  await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: 'Hyderabad',
    p_state: 'Telangana',
    p_subtype: 'rent',
    p_min_price: 15000,
    p_max_price: 40000,
    p_bedrooms: 2,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 11: Complex multi-filter search', 'Multiple filters: Hyderabad, rent, 2BHK, ₹15K-₹40K');
  
  // Test 12: Commercial rent properties
  await runQuery('search_commercial_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_state: null,
    p_subtype: 'rent',
    p_min_price: null,
    p_max_price: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 12: Commercial rent properties', 'Commercial properties for rent');
  
  // Test 13: Land properties with price range
  await runQuery('search_land_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_min_price: 1000000,
    p_max_price: 10000000,
    p_city: null,
    p_state: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 13: Land properties ₹10L-₹1Cr', 'Land properties with price range');
}

async function runPaginationTests() {
  console.log('\n📄 PAGINATION TESTS');
  console.log('=' + '='.repeat(50));
  
  // Test 14: First page
  const firstPage = await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 5,
    p_offset: 0
  }, 'Test 14: First page (limit 5, offset 0)', 'Test pagination - first page');
  
  // Test 15: Second page
  const secondPage = await runQuery('search_residential_properties', {
    p_property_subtype: null,
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 5,
    p_offset: 5
  }, 'Test 15: Second page (limit 5, offset 5)', 'Test pagination - second page');
  
  // Compare pagination results
  if (firstPage && secondPage) {
    const firstPageIds = firstPage.map(item => item.id);
    const secondPageIds = secondPage.map(item => item.id);
    const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
    
    console.log('📊 Pagination analysis:', {
      firstPageCount: firstPage.length,
      secondPageCount: secondPage.length,
      overlap: overlap.length,
      paginationWorking: overlap.length === 0
    });
    
    addTestResult('Pagination Analysis', 'Compare first and second page results', {
      firstPageCount: firstPage.length,
      secondPageCount: secondPage.length,
      overlap: overlap.length,
      paginationWorking: overlap.length === 0
    }, `Pagination ${overlap.length === 0 ? 'working correctly' : 'has issues'}`);
  }
}

async function generateMarkdownReport() {
  console.log('\n📄 GENERATING MARKDOWN REPORT');
  console.log('=' + '='.repeat(50));
  
  let markdown = `# SQL Testing Results Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Database:** Supabase PostgreSQL\n`;
  markdown += `**Total Tests:** ${testResults.length}\n\n`;
  
  markdown += `## Executive Summary\n\n`;
  
  const successCount = testResults.filter(r => !r.result.error).length;
  const failureCount = testResults.filter(r => r.result.error).length;
  
  markdown += `- ✅ **Successful Tests:** ${successCount}\n`;
  markdown += `- ❌ **Failed Tests:** ${failureCount}\n`;
  markdown += `- 📊 **Success Rate:** ${((successCount / testResults.length) * 100).toFixed(1)}%\n\n`;
  
  if (failureCount > 0) {
    markdown += `### Failed Tests Summary\n\n`;
    testResults.filter(r => r.result.error).forEach(test => {
      markdown += `- **${test.testName}:** ${test.result.error}\n`;
    });
    markdown += `\n`;
  }
  
  markdown += `## Test Categories\n\n`;
  
  const categoryStats = {
    'Basic Count': testResults.filter(t => t.testName.includes('Count') || t.testName.includes('Sample')).length,
    'Individual Functions': testResults.filter(t => t.testName.includes('Test 1:') || t.testName.includes('Test 2:') || t.testName.includes('Test 3:') || t.testName.includes('Test 4:') || t.testName.includes('Test 5:')).length,
    'Filtered Search': testResults.filter(t => t.testName.includes('Test 6:') || t.testName.includes('Test 7:') || t.testName.includes('Test 8:') || t.testName.includes('Test 9:') || t.testName.includes('Test 10:')).length,
    'Complex Search': testResults.filter(t => t.testName.includes('Test 11:') || t.testName.includes('Test 12:') || t.testName.includes('Test 13:')).length,
    'Pagination': testResults.filter(t => t.testName.includes('Test 14:') || t.testName.includes('Test 15:') || t.testName.includes('Pagination')).length
  };
  
  Object.entries(categoryStats).forEach(([category, count]) => {
    markdown += `- **${category}:** ${count} tests\n`;
  });
  
  markdown += `\n## Test Results Details\n\n`;
  
  testResults.forEach((test, index) => {
    markdown += `### ${index + 1}. ${test.testName}\n\n`;
    
    if (test.result.error) {
      markdown += `**Status:** ❌ FAILED\n`;
      markdown += `**Error:** ${test.result.error}\n\n`;
    } else {
      markdown += `**Status:** ✅ PASSED\n`;
      
      if (Array.isArray(test.result)) {
        markdown += `**Rows Returned:** ${test.result.length}\n`;
        markdown += `**Analysis:** ${test.analysis}\n\n`;
        
        if (test.result.length > 0) {
          markdown += `**Sample Results:**\n`;
          markdown += `\`\`\`json\n`;
          markdown += JSON.stringify(test.result.slice(0, 2), null, 2);
          markdown += `\n\`\`\`\n\n`;
        }
      } else {
        markdown += `**Result:** ${JSON.stringify(test.result)}\n`;
        markdown += `**Analysis:** ${test.analysis}\n\n`;
      }
    }
    
    markdown += `**Query/Function:**\n`;
    markdown += `\`\`\`sql\n${test.query}\n\`\`\`\n\n`;
    markdown += `---\n\n`;
  });
  
  // Add performance analysis
  markdown += `## Performance Analysis\n\n`;
  
  const successfulTests = testResults.filter(r => !r.result.error && Array.isArray(r.result));
  const avgResultCount = successfulTests.reduce((sum, test) => sum + test.result.length, 0) / successfulTests.length;
  
  markdown += `- **Average Results per Query:** ${avgResultCount.toFixed(1)}\n`;
  markdown += `- **Most Productive Test:** ${successfulTests.sort((a, b) => b.result.length - a.result.length)[0]?.testName || 'N/A'}\n`;
  markdown += `- **Least Productive Test:** ${successfulTests.sort((a, b) => a.result.length - b.result.length)[0]?.testName || 'N/A'}\n\n`;
  
  // Add recommendations
  markdown += `## Recommendations\n\n`;
  
  if (failureCount > 0) {
    markdown += `### Issues Found\n\n`;
    markdown += `- **${failureCount} tests failed** - investigate database function availability\n`;
    markdown += `- Check database schema for missing functions\n`;
    markdown += `- Verify function parameter types and names\n\n`;
  }
  
  markdown += `### Optimization Opportunities\n\n`;
  markdown += `- Consider indexing on frequently queried fields (city, bedrooms, price)\n`;
  markdown += `- Implement result caching for popular searches\n`;
  markdown += `- Add query performance monitoring\n\n`;
  
  markdown += `### Next Steps\n\n`;
  markdown += `1. Fix any failing database functions\n`;
  markdown += `2. Implement missing search functions if needed\n`;
  markdown += `3. Add performance monitoring\n`;
  markdown += `4. Consider adding more specific test cases\n`;
  markdown += `5. Set up automated testing pipeline\n\n`;
  
  markdown += `---\n\n`;
  markdown += `*Report generated by SQL Testing Suite*\n`;
  markdown += `*Timestamp: ${new Date().toISOString()}*\n`;
  
  // Save the report
  const reportPath = '/Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/kb/sql_testing/Testing1_Results.md';
  
  // Ensure directory exists
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`📄 Report saved to: ${reportPath}`);
  return reportPath;
}

async function main() {
  console.log('🚀 Starting SQL Testing Suite...');
  console.log('📊 Testing Database Functions and Queries');
  
  try {
    // Run all test categories
    await runBasicCountQueries();
    await runIndividualFunctionTests();
    await runFilteredSearchTests();
    await runComplexSearchTests();
    await runPaginationTests();
    
    // Generate final report
    const reportPath = await generateMarkdownReport();
    
    console.log('\n🎉 Testing completed successfully!');
    console.log(`📄 Report saved to: ${reportPath}`);
    
    // Summary
    const successCount = testResults.filter(r => !r.result.error).length;
    const failureCount = testResults.filter(r => r.result.error).length;
    
    console.log('\n📊 Final Summary:');
    console.log(`✅ Successful Tests: ${successCount}`);
    console.log(`❌ Failed Tests: ${failureCount}`);
    console.log(`📊 Success Rate: ${((successCount / testResults.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  }
}

main();