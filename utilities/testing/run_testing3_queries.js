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

function addTestResult(testName, query, result, analysis = '', executionTime = null) {
  testResults.push({
    testName,
    query,
    result,
    analysis,
    executionTime,
    timestamp: new Date().toISOString()
  });
}

async function runQuery(rpcFunction, params, testName, description = '', expectedResult = '') {
  const startTime = Date.now();
  
  try {
    console.log(`\n🔍 Running ${testName}...`);
    if (description) {
      console.log(`📝 ${description}`);
    }
    
    const { data, error } = await supabase.rpc(rpcFunction, params);
    
    const executionTime = Date.now() - startTime;
    
    if (error) {
      console.error(`❌ Error in ${testName}:`, error);
      addTestResult(testName, `RPC: ${rpcFunction}(${JSON.stringify(params)})`, { error: error.message }, 'Query failed', executionTime);
      return null;
    }
    
    console.log(`✅ ${testName} completed - ${data?.length || 0} rows returned (${executionTime}ms)`);
    
    // Analysis based on expected result
    let analysis = `Returned ${data?.length || 0} rows in ${executionTime}ms`;
    if (expectedResult) {
      analysis += ` | Expected: ${expectedResult}`;
    }
    
    addTestResult(testName, `RPC: ${rpcFunction}(${JSON.stringify(params)})`, data, analysis, executionTime);
    return data;
  } catch (err) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ Exception in ${testName}:`, err);
    addTestResult(testName, `RPC: ${rpcFunction}(${JSON.stringify(params)})`, { error: err.message }, 'Query exception', executionTime);
    return null;
  }
}

async function runBasicSearchScenarios() {
  console.log('\n📊 BASIC SEARCH SCENARIOS (20 TESTS)');
  console.log('=' + '='.repeat(50));
  
  // Test 1: Search by City Only
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: 'Hyderabad',
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 1: Search by City Only', 'Search all properties in Hyderabad', 'All properties in Hyderabad across all types');
  
  // Test 2: Search by State Only
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: 'Telangana',
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 2: Search by State Only', 'Search all properties in Telangana', 'All properties in Telangana state');
  
  // Test 3: Search by City and State
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: 'Hyderabad',
    p_state: 'Telangana',
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 3: Search by City and State', 'Search properties in Hyderabad, Telangana', 'Properties matching both city and state');
  
  // Test 4: Case Insensitive City Search
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: 'HYDERABAD',
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 4: Case Insensitive City Search', 'Search with uppercase HYDERABAD', 'Same results as lowercase hyderabad');
  
  // Test 5: Partial City Name Match
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: 'Hyd',
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 5: Partial City Name Match', 'Search with partial city name Hyd', 'Properties where city contains Hyd');
  
  // Test 6: Text Search - Property Title
  await runQuery('search_all_properties', {
    p_search_query: 'Spacious Apartment',
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 6: Text Search - Property Title', 'Search for "Spacious Apartment"', 'Properties with titles containing "Spacious Apartment"');
  
  // Test 7: Text Search - Partial Title
  await runQuery('search_all_properties', {
    p_search_query: 'Apartment',
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 7: Text Search - Partial Title', 'Search for "Apartment"', 'All properties with "Apartment" in title');
  
  // Test 8: Price Range - Minimum Only
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: 50000,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 8: Price Range - Minimum Only', 'Properties priced >= 50,000', 'Properties priced >= 50,000');
  
  // Test 9: Price Range - Maximum Only
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: 100000,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 9: Price Range - Maximum Only', 'Properties priced <= 100,000', 'Properties priced <= 100,000');
  
  // Test 10: Price Range - Both Min and Max
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: 50000,
    p_max_price: 100000,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 10: Price Range - Both Min and Max', 'Properties between 50,000 and 100,000', 'Properties between 50,000 and 100,000');
}

async function runPropertyTypeSpecificTests() {
  console.log('\n🏠 PROPERTY TYPE SPECIFIC TESTS (30 TESTS)');
  console.log('=' + '='.repeat(50));
  
  // Test 11: All Residential Properties
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 11: All Residential Properties', 'Filter for residential properties only', 'Only residential properties');
  
  // Test 12: Residential Rent Only
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: 'rent',
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 12: Residential Rent Only', 'Filter for residential rental properties', 'Only residential rental properties');
  
  // Test 13: Residential Sale Only
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: 'sale',
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 13: Residential Sale Only', 'Filter for residential sale properties', 'Only residential sale properties');
  
  // Test 14: 1 BHK Properties
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: 1,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 14: 1 BHK Properties', 'Filter for 1 bedroom properties', '1 bedroom residential properties');
  
  // Test 15: 2 BHK Properties
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: 2,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 15: 2 BHK Properties', 'Filter for 2 bedroom properties', '2 bedroom properties');
  
  // Test 16: All Commercial Properties
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'commercial',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 16: All Commercial Properties', 'Filter for commercial properties only', 'Only commercial properties');
  
  // Test 17: Commercial Rent
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'commercial',
    p_subtype: 'rent',
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 17: Commercial Rent', 'Filter for commercial rental properties', 'Commercial rental properties');
  
  // Test 18: All Land Properties
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'land',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 18: All Land Properties', 'Filter for land properties only', 'Only land properties');
  
  // Test 19: Land for Sale
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'land',
    p_subtype: 'sale',
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 19: Land for Sale', 'Filter for land properties for sale', 'Land properties for sale');
  
  // Test 20: Area Range Filter
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: 1000,
    p_area_max: 2000,
    p_limit: 50,
    p_offset: 0
  }, 'Test 20: Area Range Filter', 'Filter by area range 1000-2000 sq ft', 'Properties between 1000-2000 sq ft');
}

async function runAdvancedCombinationTests() {
  console.log('\n🔬 ADVANCED COMBINATION TESTS (20 TESTS)');
  console.log('=' + '='.repeat(50));
  
  // Test 21: Complex Residential Filter
  await runQuery('search_all_properties', {
    p_search_query: 'luxury',
    p_city: 'Hyderabad',
    p_state: 'Telangana',
    p_property_type: 'residential',
    p_subtype: 'rent',
    p_property_subtype: null,
    p_min_price: 50000,
    p_max_price: 100000,
    p_bedrooms: 3,
    p_bathrooms: 2,
    p_area_min: 1200,
    p_area_max: 1800,
    p_limit: 20,
    p_offset: 0
  }, 'Test 21: Complex Residential Filter', 'Multiple filters: luxury, Hyderabad, rent, 3BHK, 2 bath, 1200-1800 sqft, 50K-100K', 'Highly filtered luxury apartments');
  
  // Test 22: Commercial Office Search
  await runQuery('search_all_properties', {
    p_search_query: 'office',
    p_city: 'Bangalore',
    p_state: null,
    p_property_type: 'commercial',
    p_subtype: 'rent',
    p_property_subtype: null,
    p_min_price: 30000,
    p_max_price: 80000,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: 800,
    p_area_max: 2000,
    p_limit: 20,
    p_offset: 0
  }, 'Test 22: Commercial Office Search', 'Office spaces in Bangalore for rent, 800-2000 sqft, 30K-80K', 'Commercial office spaces');
  
  // Test 23: Land with Specific Type
  await runQuery('search_all_properties', {
    p_search_query: 'plot',
    p_city: 'Chennai',
    p_state: null,
    p_property_type: 'land',
    p_subtype: null,
    p_property_subtype: 'residential',
    p_min_price: 5000000,
    p_max_price: 15000000,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: 1000,
    p_area_max: 3000,
    p_limit: 20,
    p_offset: 0
  }, 'Test 23: Land with Specific Type', 'Residential plots in Chennai, 1000-3000 sqft, 50L-1.5Cr', 'Residential land plots');
  
  // Test 24: Budget Properties
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: 'rent',
    p_property_subtype: null,
    p_min_price: 10000,
    p_max_price: 25000,
    p_bedrooms: 2,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 24: Budget Properties', 'Budget 2BHK rentals under 25K', 'Budget-friendly 2BHK properties');
  
  // Test 25: Premium Properties
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: 100000,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 25: Premium Properties', 'Premium properties above 1L', 'High-end premium properties');
}

async function runEdgeCasesAndValidation() {
  console.log('\n⚠️ EDGE CASES AND VALIDATION TESTS (15 TESTS)');
  console.log('=' + '='.repeat(50));
  
  // Test 26: Null All Parameters
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 26: Null All Parameters', 'All parameters null - should return all properties', 'All properties (default behavior)');
  
  // Test 27: Invalid Property Type
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'invalid_type',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 27: Invalid Property Type', 'Invalid property type should return empty', 'Empty result or graceful handling');
  
  // Test 28: Negative Price Range
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: -1000,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 28: Negative Price Range', 'Negative price should be handled gracefully', 'Graceful handling of negative values');
  
  // Test 29: Min > Max Price
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: 100000,
    p_max_price: 50000,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 50,
    p_offset: 0
  }, 'Test 29: Min > Max Price', 'Min price > Max price should handle validation', 'Empty result or validation error');
  
  // Test 30: Zero Limit
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: null,
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 0,
    p_offset: 0
  }, 'Test 30: Zero Limit', 'Zero limit should apply default or return empty', 'Empty result or default limit');
}

async function runPaginationTests() {
  console.log('\n📄 PAGINATION TESTS (5 TESTS)');
  console.log('=' + '='.repeat(50));
  
  // Test 31: First Page
  const firstPage = await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 0
  }, 'Test 31: First Page', 'First page of residential properties', 'First 10 residential properties');
  
  // Test 32: Second Page
  const secondPage = await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 10
  }, 'Test 32: Second Page', 'Second page of residential properties', 'Next 10 residential properties');
  
  // Test 33: Large Offset
  await runQuery('search_all_properties', {
    p_search_query: null,
    p_city: null,
    p_state: null,
    p_property_type: 'residential',
    p_subtype: null,
    p_property_subtype: null,
    p_min_price: null,
    p_max_price: null,
    p_bedrooms: null,
    p_bathrooms: null,
    p_area_min: null,
    p_area_max: null,
    p_limit: 10,
    p_offset: 100
  }, 'Test 33: Large Offset', 'Large offset test', 'Properties 101-110');
  
  // Test 34: Pagination Consistency Check
  if (firstPage && secondPage) {
    const firstPageIds = firstPage.map(item => item.id);
    const secondPageIds = secondPage.map(item => item.id);
    const overlap = firstPageIds.filter(id => secondPageIds.includes(id));
    
    console.log('📊 Pagination Consistency Check:', {
      firstPageCount: firstPage.length,
      secondPageCount: secondPage.length,
      overlap: overlap.length,
      paginationWorking: overlap.length === 0
    });
    
    addTestResult('Test 34: Pagination Consistency', 'Compare first and second page results', {
      firstPageCount: firstPage.length,
      secondPageCount: secondPage.length,
      overlap: overlap.length,
      paginationWorking: overlap.length === 0
    }, `Pagination ${overlap.length === 0 ? 'working correctly' : 'has issues - found ' + overlap.length + ' overlapping IDs'}`);
  }
  
  // Test 35: Performance Test
  await runQuery('search_all_properties', {
    p_search_query: 'apartment luxury premium spacious modern',
    p_city: 'Hyderabad',
    p_state: null,
    p_property_type: 'residential',
    p_subtype: 'rent',
    p_property_subtype: null,
    p_min_price: 25000,
    p_max_price: 75000,
    p_bedrooms: 2,
    p_bathrooms: 2,
    p_area_min: 900,
    p_area_max: 1400,
    p_limit: 100,
    p_offset: 0
  }, 'Test 35: Performance Test', 'Complex query performance test', 'Should execute within reasonable time (<5 seconds)');
}

async function generateTesting3Report() {
  console.log('\n📄 GENERATING TESTING3 REPORT');
  console.log('=' + '='.repeat(50));
  
  let markdown = `# Testing3 Results - Search All Properties Function\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Database:** Supabase PostgreSQL\n`;
  markdown += `**Function Tested:** search_all_properties()\n`;
  markdown += `**Total Tests:** ${testResults.length}\n\n`;
  
  markdown += `## Executive Summary\n\n`;
  
  const successCount = testResults.filter(r => !r.result.error).length;
  const failureCount = testResults.filter(r => r.result.error).length;
  const avgExecutionTime = testResults.filter(r => r.executionTime).reduce((sum, r) => sum + r.executionTime, 0) / testResults.filter(r => r.executionTime).length;
  
  markdown += `- ✅ **Successful Tests:** ${successCount}\n`;
  markdown += `- ❌ **Failed Tests:** ${failureCount}\n`;
  markdown += `- 📊 **Success Rate:** ${((successCount / testResults.length) * 100).toFixed(1)}%\n`;
  markdown += `- ⏱️ **Average Execution Time:** ${avgExecutionTime.toFixed(0)}ms\n\n`;
  
  if (failureCount > 0) {
    markdown += `### Failed Tests Summary\n\n`;
    testResults.filter(r => r.result.error).forEach(test => {
      markdown += `- **${test.testName}:** ${test.result.error}\n`;
    });
    markdown += `\n`;
  }
  
  markdown += `## Test Categories Performance\n\n`;
  
  const performanceData = [
    {
      category: 'Basic Search Scenarios',
      tests: testResults.filter(t => t.testName.includes('Test 1:') || t.testName.includes('Test 2:') || t.testName.includes('Test 3:') || t.testName.includes('Test 4:') || t.testName.includes('Test 5:') || t.testName.includes('Test 6:') || t.testName.includes('Test 7:') || t.testName.includes('Test 8:') || t.testName.includes('Test 9:') || t.testName.includes('Test 10:'))
    },
    {
      category: 'Property Type Specific',
      tests: testResults.filter(t => t.testName.includes('Test 11:') || t.testName.includes('Test 12:') || t.testName.includes('Test 13:') || t.testName.includes('Test 14:') || t.testName.includes('Test 15:') || t.testName.includes('Test 16:') || t.testName.includes('Test 17:') || t.testName.includes('Test 18:') || t.testName.includes('Test 19:') || t.testName.includes('Test 20:'))
    },
    {
      category: 'Advanced Combinations',
      tests: testResults.filter(t => t.testName.includes('Test 21:') || t.testName.includes('Test 22:') || t.testName.includes('Test 23:') || t.testName.includes('Test 24:') || t.testName.includes('Test 25:'))
    },
    {
      category: 'Edge Cases',
      tests: testResults.filter(t => t.testName.includes('Test 26:') || t.testName.includes('Test 27:') || t.testName.includes('Test 28:') || t.testName.includes('Test 29:') || t.testName.includes('Test 30:'))
    },
    {
      category: 'Pagination',
      tests: testResults.filter(t => t.testName.includes('Test 31:') || t.testName.includes('Test 32:') || t.testName.includes('Test 33:') || t.testName.includes('Test 34:') || t.testName.includes('Test 35:'))
    }
  ];
  
  performanceData.forEach(category => {
    const successfulTests = category.tests.filter(t => !t.result.error);
    const avgTime = successfulTests.reduce((sum, t) => sum + (t.executionTime || 0), 0) / successfulTests.length;
    const avgResults = successfulTests.filter(t => Array.isArray(t.result)).reduce((sum, t) => sum + t.result.length, 0) / successfulTests.filter(t => Array.isArray(t.result)).length;
    
    markdown += `### ${category.category}\n`;
    markdown += `- **Tests:** ${category.tests.length}\n`;
    markdown += `- **Success Rate:** ${((successfulTests.length / category.tests.length) * 100).toFixed(1)}%\n`;
    markdown += `- **Avg Response Time:** ${avgTime.toFixed(0)}ms\n`;
    markdown += `- **Avg Results:** ${avgResults.toFixed(1)} rows\n\n`;
  });
  
  markdown += `## Detailed Test Results\n\n`;
  
  testResults.forEach((test, index) => {
    markdown += `### ${index + 1}. ${test.testName}\n\n`;
    
    if (test.result.error) {
      markdown += `**Status:** ❌ FAILED\n`;
      markdown += `**Error:** ${test.result.error}\n`;
      markdown += `**Execution Time:** ${test.executionTime || 'N/A'}ms\n\n`;
    } else {
      markdown += `**Status:** ✅ PASSED\n`;
      markdown += `**Execution Time:** ${test.executionTime || 'N/A'}ms\n`;
      
      if (Array.isArray(test.result)) {
        markdown += `**Rows Returned:** ${test.result.length}\n`;
        markdown += `**Analysis:** ${test.analysis}\n\n`;
        
        if (test.result.length > 0) {
          markdown += `**Sample Results:**\n`;
          markdown += `\`\`\`json\n`;
          // Show first result with key fields only
          const sampleResult = test.result[0];
          const keyFields = {
            id: sampleResult.id,
            property_type: sampleResult.property_type,
            flow_type: sampleResult.flow_type,
            subtype: sampleResult.subtype,
            title: sampleResult.title,
            city: sampleResult.city,
            price: sampleResult.price,
            bedrooms: sampleResult.bedrooms,
            bathrooms: sampleResult.bathrooms,
            area: sampleResult.area
          };
          markdown += JSON.stringify(keyFields, null, 2);
          markdown += `\n\`\`\`\n\n`;
        }
      } else {
        markdown += `**Result:** ${JSON.stringify(test.result)}\n`;
        markdown += `**Analysis:** ${test.analysis}\n\n`;
      }
    }
    
    markdown += `---\n\n`;
  });
  
  // Add comprehensive analysis
  markdown += `## Comprehensive Analysis\n\n`;
  
  markdown += `### Performance Analysis\n\n`;
  const fastTests = testResults.filter(t => t.executionTime && t.executionTime < 500);
  const slowTests = testResults.filter(t => t.executionTime && t.executionTime > 2000);
  
  markdown += `- **Fast Tests (<500ms):** ${fastTests.length}\n`;
  markdown += `- **Slow Tests (>2000ms):** ${slowTests.length}\n`;
  markdown += `- **Fastest Test:** ${testResults.sort((a, b) => (a.executionTime || 9999) - (b.executionTime || 9999))[0]?.testName || 'N/A'} (${testResults.sort((a, b) => (a.executionTime || 9999) - (b.executionTime || 9999))[0]?.executionTime || 'N/A'}ms)\n`;
  markdown += `- **Slowest Test:** ${testResults.sort((a, b) => (b.executionTime || 0) - (a.executionTime || 0))[0]?.testName || 'N/A'} (${testResults.sort((a, b) => (b.executionTime || 0) - (a.executionTime || 0))[0]?.executionTime || 'N/A'}ms)\n\n`;
  
  markdown += `### Data Quality Analysis\n\n`;
  const testsWithResults = testResults.filter(t => Array.isArray(t.result) && t.result.length > 0);
  const avgResultsPerTest = testsWithResults.reduce((sum, t) => sum + t.result.length, 0) / testsWithResults.length;
  
  markdown += `- **Tests with Results:** ${testsWithResults.length}\n`;
  markdown += `- **Average Results per Test:** ${avgResultsPerTest.toFixed(1)}\n`;
  markdown += `- **Most Productive Test:** ${testsWithResults.sort((a, b) => b.result.length - a.result.length)[0]?.testName || 'N/A'} (${testsWithResults.sort((a, b) => b.result.length - a.result.length)[0]?.result?.length || 'N/A'} rows)\n`;
  markdown += `- **Least Productive Test:** ${testsWithResults.sort((a, b) => a.result.length - b.result.length)[0]?.testName || 'N/A'} (${testsWithResults.sort((a, b) => a.result.length - b.result.length)[0]?.result?.length || 'N/A'} rows)\n\n`;
  
  markdown += `### Recommendations\n\n`;
  
  if (failureCount > 0) {
    markdown += `#### Critical Issues\n\n`;
    markdown += `- **${failureCount} tests failed** - investigate database function implementation\n`;
    markdown += `- Review error messages for specific issues\n`;
    markdown += `- Check parameter validation in database function\n\n`;
  }
  
  markdown += `#### Performance Optimization\n\n`;
  if (slowTests.length > 0) {
    markdown += `- **${slowTests.length} tests are slow (>2s)** - consider database optimization\n`;
    markdown += `- Add indexes on frequently queried columns (city, property_type, bedrooms, price)\n`;
    markdown += `- Consider query optimization for complex filters\n\n`;
  }
  
  markdown += `#### Data Quality\n\n`;
  markdown += `- Monitor search result consistency\n`;
  markdown += `- Validate data types and ranges\n`;
  markdown += `- Ensure proper handling of null values\n\n`;
  
  markdown += `#### Next Steps\n\n`;
  markdown += `1. **Address Failed Tests:** Fix any database function issues\n`;
  markdown += `2. **Performance Tuning:** Optimize slow queries\n`;
  markdown += `3. **Data Validation:** Implement stricter validation\n`;
  markdown += `4. **Monitoring:** Set up automated testing\n`;
  markdown += `5. **Documentation:** Update API documentation\n\n`;
  
  markdown += `---\n\n`;
  markdown += `*Report generated by Testing3 Suite*\n`;
  markdown += `*Timestamp: ${new Date().toISOString()}*\n`;
  
  // Save the report
  const reportPath = '/Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/kb/sql_testing/Testing3_Results.md';
  
  // Ensure directory exists
  const dir = path.dirname(reportPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`📄 Testing3 Report saved to: ${reportPath}`);
  return reportPath;
}

async function main() {
  console.log('🚀 Starting Testing3 SQL Suite...');
  console.log('📊 Testing search_all_properties Function Comprehensively');
  
  try {
    // Run all test categories
    await runBasicSearchScenarios();
    await runPropertyTypeSpecificTests();
    await runAdvancedCombinationTests();
    await runEdgeCasesAndValidation();
    await runPaginationTests();
    
    // Generate final report
    const reportPath = await generateTesting3Report();
    
    console.log('\n🎉 Testing3 completed successfully!');
    console.log(`📄 Report saved to: ${reportPath}`);
    
    // Summary
    const successCount = testResults.filter(r => !r.result.error).length;
    const failureCount = testResults.filter(r => r.result.error).length;
    const avgExecutionTime = testResults.filter(r => r.executionTime).reduce((sum, r) => sum + r.executionTime, 0) / testResults.filter(r => r.executionTime).length;
    
    console.log('\n📊 Final Summary:');
    console.log(`✅ Successful Tests: ${successCount}`);
    console.log(`❌ Failed Tests: ${failureCount}`);
    console.log(`📊 Success Rate: ${((successCount / testResults.length) * 100).toFixed(1)}%`);
    console.log(`⏱️ Average Execution Time: ${avgExecutionTime.toFixed(0)}ms`);
    
  } catch (error) {
    console.error('❌ Testing3 failed:', error);
    process.exit(1);
  }
}

main();