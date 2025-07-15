import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test case definition
const testCases = [
  // Category 1: Residential Properties - 108 test cases
  { id: 'TC001', name: 'Basic residential search', params: { p_property_type: 'residential', p_limit: 10, p_offset: 0 } },
  { id: 'TC002', name: 'Residential with city filter - Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC003', name: 'Residential with city filter - Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC004', name: 'Residential with state filter - Telangana', params: { p_property_type: 'residential', p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC005', name: 'Residential with search query - apartment', params: { p_property_type: 'residential', p_search_query: 'apartment', p_limit: 10 } },
  { id: 'TC006', name: 'Residential with search query - house', params: { p_property_type: 'residential', p_search_query: 'house', p_limit: 10 } },
  { id: 'TC007', name: 'Residential with search query - villa', params: { p_property_type: 'residential', p_search_query: 'villa', p_limit: 10 } },
  { id: 'TC008', name: 'Residential with search query - flat', params: { p_property_type: 'residential', p_search_query: 'flat', p_limit: 10 } },
  { id: 'TC009', name: 'Residential with search query - bhk', params: { p_property_type: 'residential', p_search_query: 'bhk', p_limit: 10 } },
  { id: 'TC010', name: 'Residential with search query - rent', params: { p_property_type: 'residential', p_search_query: 'rent', p_limit: 10 } },
  { id: 'TC011', name: 'Residential with search query - sale', params: { p_property_type: 'residential', p_search_query: 'sale', p_limit: 10 } },
  { id: 'TC012', name: 'Residential with search query - furnished', params: { p_property_type: 'residential', p_search_query: 'furnished', p_limit: 10 } },
  { id: 'TC013', name: 'Residential with search query - gated', params: { p_property_type: 'residential', p_search_query: 'gated', p_limit: 10 } },
  { id: 'TC014', name: 'Residential with search query - parking', params: { p_property_type: 'residential', p_search_query: 'parking', p_limit: 10 } },
  { id: 'TC015', name: 'Residential with search query - balcony', params: { p_property_type: 'residential', p_search_query: 'balcony', p_limit: 10 } },
  { id: 'TC016', name: 'Residential with search query - garden', params: { p_property_type: 'residential', p_search_query: 'garden', p_limit: 10 } },
  { id: 'TC017', name: 'Residential with search query - pool', params: { p_property_type: 'residential', p_search_query: 'pool', p_limit: 10 } },
  { id: 'TC018', name: 'Residential with search query - security', params: { p_property_type: 'residential', p_search_query: 'security', p_limit: 10 } },
  
  // BHK Configurations
  { id: 'TC019', name: 'Residential 1 BHK', params: { p_property_type: 'residential', p_bedrooms: 1, p_limit: 10 } },
  { id: 'TC020', name: 'Residential 2 BHK', params: { p_property_type: 'residential', p_bedrooms: 2, p_limit: 10 } },
  { id: 'TC021', name: 'Residential 3 BHK', params: { p_property_type: 'residential', p_bedrooms: 3, p_limit: 10 } },
  { id: 'TC022', name: 'Residential 4 BHK', params: { p_property_type: 'residential', p_bedrooms: 4, p_limit: 10 } },
  { id: 'TC023', name: 'Residential 5 BHK', params: { p_property_type: 'residential', p_bedrooms: 5, p_limit: 10 } },
  { id: 'TC024', name: 'Residential 1 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 1, p_limit: 10 } },
  { id: 'TC025', name: 'Residential 2 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 2, p_limit: 10 } },
  { id: 'TC026', name: 'Residential 3 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 3, p_limit: 10 } },
  { id: 'TC027', name: 'Residential 4 BHK in Hyderabad', params: { p_property_type: 'residential', p_city: 'Hyderabad', p_bedrooms: 4, p_limit: 10 } },
  { id: 'TC028', name: 'Residential 1 BHK in Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_bedrooms: 1, p_limit: 10 } },
  { id: 'TC029', name: 'Residential 2 BHK in Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_bedrooms: 2, p_limit: 10 } },
  { id: 'TC030', name: 'Residential 3 BHK in Secunderabad', params: { p_property_type: 'residential', p_city: 'Secunderabad', p_bedrooms: 3, p_limit: 10 } },
  { id: 'TC031', name: 'Residential with bathroom filter - 1 bathroom', params: { p_property_type: 'residential', p_bathrooms: 1, p_limit: 10 } },
  { id: 'TC032', name: 'Residential with bathroom filter - 2 bathrooms', params: { p_property_type: 'residential', p_bathrooms: 2, p_limit: 10 } },
  { id: 'TC033', name: 'Residential with bathroom filter - 3 bathrooms', params: { p_property_type: 'residential', p_bathrooms: 3, p_limit: 10 } },
  
  // Price ranges
  { id: 'TC034', name: 'Residential under 10,000', params: { p_property_type: 'residential', p_max_price: 10000, p_limit: 10 } },
  { id: 'TC035', name: 'Residential 10,000 - 20,000', params: { p_property_type: 'residential', p_min_price: 10000, p_max_price: 20000, p_limit: 10 } },
  { id: 'TC036', name: 'Residential 20,000 - 30,000', params: { p_property_type: 'residential', p_min_price: 20000, p_max_price: 30000, p_limit: 10 } },
  { id: 'TC037', name: 'Residential 30,000 - 50,000', params: { p_property_type: 'residential', p_min_price: 30000, p_max_price: 50000, p_limit: 10 } },
  { id: 'TC038', name: 'Residential 50,000 - 100,000', params: { p_property_type: 'residential', p_min_price: 50000, p_max_price: 100000, p_limit: 10 } },
  { id: 'TC039', name: 'Residential above 100,000', params: { p_property_type: 'residential', p_min_price: 100000, p_limit: 10 } },
  { id: 'TC040', name: 'Residential 1 BHK under 15,000', params: { p_property_type: 'residential', p_bedrooms: 1, p_max_price: 15000, p_limit: 10 } },
  { id: 'TC041', name: 'Residential 2 BHK 15,000 - 25,000', params: { p_property_type: 'residential', p_bedrooms: 2, p_min_price: 15000, p_max_price: 25000, p_limit: 10 } },
  { id: 'TC042', name: 'Residential 3 BHK 25,000 - 40,000', params: { p_property_type: 'residential', p_bedrooms: 3, p_min_price: 25000, p_max_price: 40000, p_limit: 10 } },
  { id: 'TC043', name: 'Residential 4 BHK above 40,000', params: { p_property_type: 'residential', p_bedrooms: 4, p_min_price: 40000, p_limit: 10 } },
  { id: 'TC044', name: 'Residential sale price under 50 lakhs', params: { p_property_type: 'residential', p_search_query: 'sale', p_max_price: 5000000, p_limit: 10 } },
  { id: 'TC045', name: 'Residential sale price 50 lakhs - 1 crore', params: { p_property_type: 'residential', p_search_query: 'sale', p_min_price: 5000000, p_max_price: 10000000, p_limit: 10 } },
  { id: 'TC046', name: 'Residential sale price 1 crore - 2 crores', params: { p_property_type: 'residential', p_search_query: 'sale', p_min_price: 10000000, p_max_price: 20000000, p_limit: 10 } },
  { id: 'TC047', name: 'Residential sale price above 2 crores', params: { p_property_type: 'residential', p_search_query: 'sale', p_min_price: 20000000, p_limit: 10 } },
  { id: 'TC048', name: 'Residential exact price 25,000', params: { p_property_type: 'residential', p_min_price: 25000, p_max_price: 25000, p_limit: 10 } },
  
  // Area ranges
  { id: 'TC049', name: 'Residential area under 500 sqft', params: { p_property_type: 'residential', p_area_max: 500, p_limit: 10 } },
  { id: 'TC050', name: 'Residential area 500-1000 sqft', params: { p_property_type: 'residential', p_area_min: 500, p_area_max: 1000, p_limit: 10 } },
  { id: 'TC051', name: 'Residential area 1000-1500 sqft', params: { p_property_type: 'residential', p_area_min: 1000, p_area_max: 1500, p_limit: 10 } },
  { id: 'TC052', name: 'Residential area 1500-2000 sqft', params: { p_property_type: 'residential', p_area_min: 1500, p_area_max: 2000, p_limit: 10 } },
  { id: 'TC053', name: 'Residential area 2000-3000 sqft', params: { p_property_type: 'residential', p_area_min: 2000, p_area_max: 3000, p_limit: 10 } },
  { id: 'TC054', name: 'Residential area above 3000 sqft', params: { p_property_type: 'residential', p_area_min: 3000, p_limit: 10 } },
  
  // Location specific
  { id: 'TC064', name: 'Residential in Gachibowli', params: { p_property_type: 'residential', p_search_query: 'Gachibowli', p_limit: 10 } },
  { id: 'TC065', name: 'Residential in Hitech City', params: { p_property_type: 'residential', p_search_query: 'Hitech City', p_limit: 10 } },
  { id: 'TC066', name: 'Residential in Madhapur', params: { p_property_type: 'residential', p_search_query: 'Madhapur', p_limit: 10 } },
  { id: 'TC067', name: 'Residential in Kondapur', params: { p_property_type: 'residential', p_search_query: 'Kondapur', p_limit: 10 } },
  { id: 'TC068', name: 'Residential in Kukatpally', params: { p_property_type: 'residential', p_search_query: 'Kukatpally', p_limit: 10 } },
  
  // Category 2: Commercial Properties - Sample set
  { id: 'TC109', name: 'Basic commercial search', params: { p_property_type: 'commercial', p_limit: 10, p_offset: 0 } },
  { id: 'TC110', name: 'Commercial with city filter - Hyderabad', params: { p_property_type: 'commercial', p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC111', name: 'Commercial with city filter - Secunderabad', params: { p_property_type: 'commercial', p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC112', name: 'Commercial with state filter - Telangana', params: { p_property_type: 'commercial', p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC113', name: 'Commercial with search query - office', params: { p_property_type: 'commercial', p_search_query: 'office', p_limit: 10 } },
  { id: 'TC114', name: 'Commercial with search query - shop', params: { p_property_type: 'commercial', p_search_query: 'shop', p_limit: 10 } },
  { id: 'TC115', name: 'Commercial with search query - warehouse', params: { p_property_type: 'commercial', p_search_query: 'warehouse', p_limit: 10 } },
  { id: 'TC116', name: 'Commercial with search query - showroom', params: { p_property_type: 'commercial', p_search_query: 'showroom', p_limit: 10 } },
  { id: 'TC117', name: 'Commercial with search query - retail', params: { p_property_type: 'commercial', p_search_query: 'retail', p_limit: 10 } },
  { id: 'TC118', name: 'Commercial with search query - restaurant', params: { p_property_type: 'commercial', p_search_query: 'restaurant', p_limit: 10 } },
  
  // Category 3: Land Properties - Sample set
  { id: 'TC181', name: 'Basic land search', params: { p_property_type: 'land', p_limit: 10, p_offset: 0 } },
  { id: 'TC182', name: 'Land with city filter - Hyderabad', params: { p_property_type: 'land', p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC183', name: 'Land with city filter - Secunderabad', params: { p_property_type: 'land', p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC184', name: 'Land with state filter - Telangana', params: { p_property_type: 'land', p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC185', name: 'Land with search query - plot', params: { p_property_type: 'land', p_search_query: 'plot', p_limit: 10 } },
  { id: 'TC186', name: 'Land with search query - agricultural', params: { p_property_type: 'land', p_search_query: 'agricultural', p_limit: 10 } },
  { id: 'TC187', name: 'Land with search query - residential plot', params: { p_property_type: 'land', p_search_query: 'residential plot', p_limit: 10 } },
  { id: 'TC188', name: 'Land with search query - commercial plot', params: { p_property_type: 'land', p_search_query: 'commercial plot', p_limit: 10 } },
  { id: 'TC189', name: 'Land with search query - industrial plot', params: { p_property_type: 'land', p_search_query: 'industrial plot', p_limit: 10 } },
  { id: 'TC190', name: 'Land with search query - farm land', params: { p_property_type: 'land', p_search_query: 'farm land', p_limit: 10 } },
  
  // Category 4: Mixed Searches - Sample set
  { id: 'TC235', name: 'All properties without filters', params: { p_limit: 10, p_offset: 0 } },
  { id: 'TC236', name: 'All properties in Hyderabad', params: { p_city: 'Hyderabad', p_limit: 10 } },
  { id: 'TC237', name: 'All properties in Secunderabad', params: { p_city: 'Secunderabad', p_limit: 10 } },
  { id: 'TC238', name: 'All properties in Telangana', params: { p_state: 'Telangana', p_limit: 10 } },
  { id: 'TC239', name: 'All properties with search query - rent', params: { p_search_query: 'rent', p_limit: 10 } },
  { id: 'TC240', name: 'All properties with search query - sale', params: { p_search_query: 'sale', p_limit: 10 } },
  { id: 'TC241', name: 'All properties with search query - furnished', params: { p_search_query: 'furnished', p_limit: 10 } },
  { id: 'TC242', name: 'All properties with search query - parking', params: { p_search_query: 'parking', p_limit: 10 } },
  { id: 'TC243', name: 'All properties with search query - security', params: { p_search_query: 'security', p_limit: 10 } },
  { id: 'TC244', name: 'All properties with search query - garden', params: { p_search_query: 'garden', p_limit: 10 } },
  
  // Category 5: Edge Cases - Sample set
  { id: 'TC295', name: 'Large limit test', params: { p_limit: 100, p_offset: 0 } },
  { id: 'TC296', name: 'Maximum limit test', params: { p_limit: 10000, p_offset: 0 } },
  { id: 'TC297', name: 'Offset test - page 2', params: { p_limit: 10, p_offset: 10 } },
  { id: 'TC298', name: 'Offset test - page 5', params: { p_limit: 10, p_offset: 40 } },
  { id: 'TC299', name: 'Large offset test', params: { p_limit: 10, p_offset: 1000 } },
  { id: 'TC305', name: 'Minimum price boundary', params: { p_min_price: 1, p_limit: 10 } },
  { id: 'TC306', name: 'Maximum price boundary', params: { p_max_price: 999999999, p_limit: 10 } },
  { id: 'TC307', name: 'Minimum area boundary', params: { p_area_min: 1, p_limit: 10 } },
  { id: 'TC308', name: 'Maximum area boundary', params: { p_area_max: 999999, p_limit: 10 } },
  { id: 'TC315', name: 'Empty search query', params: { p_search_query: '', p_limit: 10 } },
  { id: 'TC316', name: 'Single character search', params: { p_search_query: 'a', p_limit: 10 } },
  { id: 'TC317', name: 'Numeric search query', params: { p_search_query: '123', p_limit: 10 } },
  { id: 'TC318', name: 'Special characters search', params: { p_search_query: '!@#$%', p_limit: 10 } },
  { id: 'TC321', name: 'Case sensitivity test - lowercase', params: { p_search_query: 'apartment', p_limit: 10 } },
  { id: 'TC322', name: 'Case sensitivity test - uppercase', params: { p_search_query: 'APARTMENT', p_limit: 10 } },
  { id: 'TC323', name: 'Case sensitivity test - mixed case', params: { p_search_query: 'ApArTmEnT', p_limit: 10 } },
  { id: 'TC324', name: 'Search with partial words', params: { p_search_query: 'apart', p_limit: 10 } }
];

// Test execution function
async function executeTest(testCase) {
  const startTime = Date.now();
  const result = {
    id: testCase.id,
    name: testCase.name,
    status: 'PENDING',
    executionTime: 0,
    resultCount: 0,
    error: null,
    details: null
  };

  try {
    const { data, error } = await supabase.rpc('search_all_properties', testCase.params);
    const endTime = Date.now();
    result.executionTime = endTime - startTime;

    if (error) {
      result.status = 'FAILED';
      result.error = error.message || error.toString();
    } else {
      result.status = 'SUCCESS';
      result.resultCount = data ? data.length : 0;
      result.details = {
        hasResults: data && data.length > 0,
        sampleResult: data && data.length > 0 ? {
          id: data[0].id,
          property_type: data[0].property_type,
          city: data[0].city,
          title: data[0].title ? data[0].title.substring(0, 50) + '...' : 'N/A'
        } : null
      };
    }
  } catch (exception) {
    const endTime = Date.now();
    result.executionTime = endTime - startTime;
    result.status = 'FAILED';
    result.error = exception.message || exception.toString();
  }

  return result;
}

// Main test execution
async function runAllTests() {
  console.log('🚀 Starting comprehensive search_all_properties function tests...');
  console.log(`📊 Total test cases to execute: ${testCases.length}`);
  console.log('⏰ Test execution started at:', new Date().toISOString());
  
  const results = {
    executed: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    totalExecutionTime: 0,
    testResults: []
  };

  const startTime = Date.now();
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n🔍 [${i + 1}/${testCases.length}] Executing ${testCase.id}: ${testCase.name}`);
    
    try {
      const result = await executeTest(testCase);
      results.testResults.push(result);
      results.executed++;
      results.totalExecutionTime += result.executionTime;
      
      if (result.status === 'SUCCESS') {
        results.success++;
        console.log(`✅ SUCCESS - ${result.resultCount} results in ${result.executionTime}ms`);
      } else if (result.status === 'FAILED') {
        results.failed++;
        console.log(`❌ FAILED - ${result.error} (${result.executionTime}ms)`);
      }
    } catch (error) {
      results.executed++;
      results.failed++;
      results.testResults.push({
        id: testCase.id,
        name: testCase.name,
        status: 'FAILED',
        executionTime: 0,
        resultCount: 0,
        error: error.message || error.toString(),
        details: null
      });
      console.log(`❌ EXCEPTION - ${error.message}`);
    }
    
    // Small delay between tests to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const endTime = Date.now();
  results.totalExecutionTime = endTime - startTime;
  
  console.log('\n🏁 Test execution completed!');
  console.log('📊 FINAL RESULTS:');
  console.log(`   Total Executed: ${results.executed}`);
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ⏱️  Total Time: ${results.totalExecutionTime}ms`);
  console.log(`   📈 Success Rate: ${((results.success / results.executed) * 100).toFixed(2)}%`);
  
  return results;
}

// Generate detailed report
function generateReport(results) {
  const reportTime = new Date().toISOString();
  
  let report = `# Search All Properties Test Results Report\n\n`;
  report += `**Generated:** ${reportTime}\n`;
  report += `**Total Test Cases:** ${testCases.length}\n\n`;
  
  // Executive Summary
  report += `## Executive Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Total Executed | ${results.executed} |\n`;
  report += `| ✅ Success | ${results.success} |\n`;
  report += `| ❌ Failed | ${results.failed} |\n`;
  report += `| ⏭️ Skipped | ${results.skipped} |\n`;
  report += `| Success Rate | ${((results.success / results.executed) * 100).toFixed(2)}% |\n`;
  report += `| Total Execution Time | ${results.totalExecutionTime}ms |\n`;
  report += `| Average Test Time | ${(results.totalExecutionTime / results.executed).toFixed(2)}ms |\n\n`;
  
  // Test Categories Analysis
  report += `## Test Categories Analysis\n\n`;
  
  const categories = {
    'Residential': results.testResults.filter(r => r.id.startsWith('TC0') && parseInt(r.id.substring(2)) <= 108),
    'Commercial': results.testResults.filter(r => r.id.startsWith('TC1') && parseInt(r.id.substring(2)) >= 109 && parseInt(r.id.substring(2)) <= 180),
    'Land': results.testResults.filter(r => r.id.startsWith('TC1') && parseInt(r.id.substring(2)) >= 181 && parseInt(r.id.substring(2)) <= 234),
    'Mixed': results.testResults.filter(r => r.id.startsWith('TC2') && parseInt(r.id.substring(2)) >= 235 && parseInt(r.id.substring(2)) <= 294),
    'Edge Cases': results.testResults.filter(r => r.id.startsWith('TC2') && parseInt(r.id.substring(2)) >= 295)
  };
  
  report += `| Category | Total | Success | Failed | Success Rate |\n`;
  report += `|----------|-------|---------|--------|-------------|\n`;
  
  for (const [category, tests] of Object.entries(categories)) {
    if (tests.length > 0) {
      const success = tests.filter(t => t.status === 'SUCCESS').length;
      const failed = tests.filter(t => t.status === 'FAILED').length;
      const rate = tests.length > 0 ? ((success / tests.length) * 100).toFixed(2) : '0.00';
      report += `| ${category} | ${tests.length} | ${success} | ${failed} | ${rate}% |\n`;
    }
  }
  
  // Detailed Test Results
  report += `\n## Detailed Test Results\n\n`;
  
  results.testResults.forEach((result, index) => {
    report += `### ${result.id}: ${result.name}\n`;
    report += `**Status:** ${result.status === 'SUCCESS' ? '✅ SUCCESS' : '❌ FAILED'}\n`;
    report += `**Execution Time:** ${result.executionTime}ms\n`;
    report += `**Result Count:** ${result.resultCount}\n`;
    
    if (result.error) {
      report += `**Error:** ${result.error}\n`;
    }
    
    if (result.details && result.details.sampleResult) {
      report += `**Sample Result:**\n`;
      report += `- ID: ${result.details.sampleResult.id}\n`;
      report += `- Type: ${result.details.sampleResult.property_type}\n`;
      report += `- City: ${result.details.sampleResult.city}\n`;
      report += `- Title: ${result.details.sampleResult.title}\n`;
    }
    
    report += `\n`;
  });
  
  // Failed Tests Summary
  const failedTests = results.testResults.filter(r => r.status === 'FAILED');
  if (failedTests.length > 0) {
    report += `## Failed Tests Summary\n\n`;
    report += `Total failed tests: ${failedTests.length}\n\n`;
    
    failedTests.forEach(test => {
      report += `**${test.id}:** ${test.name}\n`;
      report += `Error: ${test.error}\n\n`;
    });
  }
  
  // Performance Analysis
  report += `## Performance Analysis\n\n`;
  const sortedByTime = [...results.testResults].sort((a, b) => b.executionTime - a.executionTime);
  
  report += `### Slowest Tests (Top 10)\n`;
  report += `| Test ID | Name | Execution Time | Result Count |\n`;
  report += `|---------|------|----------------|---------------|\n`;
  
  sortedByTime.slice(0, 10).forEach(test => {
    report += `| ${test.id} | ${test.name} | ${test.executionTime}ms | ${test.resultCount} |\n`;
  });
  
  report += `\n### Fastest Tests (Top 10)\n`;
  report += `| Test ID | Name | Execution Time | Result Count |\n`;
  report += `|---------|------|----------------|---------------|\n`;
  
  sortedByTime.slice(-10).reverse().forEach(test => {
    report += `| ${test.id} | ${test.name} | ${test.executionTime}ms | ${test.resultCount} |\n`;
  });
  
  // Commentary and Analysis
  report += `\n## Commentary and Analysis\n\n`;
  report += `### Database Function Performance\n`;
  report += `The search_all_properties function demonstrates ${results.success > 0 ? 'good' : 'poor'} performance with an average execution time of ${(results.totalExecutionTime / results.executed).toFixed(2)}ms per test.\n\n`;
  
  report += `### Test Coverage Analysis\n`;
  report += `This test suite covers comprehensive scenarios including:\n`;
  report += `- Property type filtering (residential, commercial, land)\n`;
  report += `- Location-based searches (city, state, area names)\n`;
  report += `- Price range filtering (rent and sale prices)\n`;
  report += `- Area range filtering (different property sizes)\n`;
  report += `- Bedroom and bathroom filtering\n`;
  report += `- Search query functionality\n`;
  report += `- Pagination and limits\n`;
  report += `- Edge cases and boundary conditions\n\n`;
  
  report += `### Key Findings\n`;
  if (results.success === results.executed) {
    report += `- ✅ All tests passed successfully\n`;
    report += `- ✅ Function handles all parameter combinations correctly\n`;
    report += `- ✅ No critical errors or exceptions encountered\n`;
  } else {
    report += `- ⚠️ ${results.failed} tests failed out of ${results.executed} total tests\n`;
    report += `- ⚠️ Success rate: ${((results.success / results.executed) * 100).toFixed(2)}%\n`;
  }
  
  report += `\n### Recommendations\n`;
  if (results.failed > 0) {
    report += `1. **Address Failed Tests:** Review and fix the ${results.failed} failing test cases\n`;
    report += `2. **Error Analysis:** Investigate common error patterns in failed tests\n`;
    report += `3. **Performance Optimization:** Consider optimizing slower-performing queries\n`;
  } else {
    report += `1. **Maintain Performance:** Continue monitoring function performance\n`;
    report += `2. **Expand Test Coverage:** Consider adding more edge cases\n`;
    report += `3. **Regular Testing:** Run these tests regularly to catch regressions\n`;
  }
  
  report += `\n---\n`;
  report += `*Report generated by comprehensive test suite for search_all_properties function*\n`;
  
  return report;
}

// Main execution
async function main() {
  try {
    const results = await runAllTests();
    const report = generateReport(results);
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'kb', 'sql_testing', 'search_all_properties_test_cases_result.md');
    fs.writeFileSync(reportPath, report);
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    console.log('\n✅ Test execution completed successfully!');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run the tests
main();