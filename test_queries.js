const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

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

async function runQuery(query, testName) {
  try {
    console.log(`\n🔍 Running ${testName}...`);
    const { data, error } = await supabase.from('properties_v2').select('*').limit(0);
    
    // Use the rpc method for function calls or direct query execution
    let result;
    if (query.trim().toLowerCase().startsWith('select')) {
      // For SELECT queries, try using the Supabase RPC
      result = await supabase.rpc('exec_raw_sql', { sql_query: query });
    } else {
      // For function calls, parse and call appropriately
      result = await supabase.rpc('exec_raw_sql', { sql_query: query });
    }
    
    if (result.error) {
      console.error(`❌ Error in ${testName}:`, result.error);
      addTestResult(testName, query, { error: result.error.message }, 'Query failed');
      return null;
    }
    
    console.log(`✅ ${testName} completed - ${result.data?.length || 0} rows returned`);
    addTestResult(testName, query, result.data, `Returned ${result.data?.length || 0} rows`);
    return result.data;
  } catch (err) {
    console.error(`❌ Exception in ${testName}:`, err);
    addTestResult(testName, query, { error: err.message }, 'Query exception');
    return null;
  }
}

async function runBasicCountQueries() {
  console.log('\n📊 BASIC COUNT VERIFICATION QUERIES');
  console.log('=' + '='.repeat(50));
  
  // Query 1: Count all active properties by type
  const query1 = `
    SELECT 
        CASE 
            WHEN extract_residential_flow_type(property_details) LIKE 'residential_%' THEN 'residential'
            WHEN extract_commercial_flow_type(property_details) IN ('commercial_rent', 'commercial_sale', 'commercial_coworking') THEN 'commercial'
            WHEN extract_land_flow_type(property_details) = 'land_sale' THEN 'land'
            ELSE 'other'
        END as property_type,
        COUNT(*) as total_count
    FROM properties_v2 
    WHERE status IS DISTINCT FROM 'deleted'
    GROUP BY property_type
    ORDER BY property_type;
  `;
  
  await runQuery(query1, 'Test 1: Count all active properties by type');
  
  // Query 2: Count by property type and subtype
  const query2 = `
    SELECT 
        CASE 
            WHEN extract_residential_flow_type(property_details) LIKE 'residential_%' THEN 'residential'
            WHEN extract_commercial_flow_type(property_details) IN ('commercial_rent', 'commercial_sale', 'commercial_coworking') THEN 'commercial'
            WHEN extract_land_flow_type(property_details) = 'land_sale' THEN 'land'
            ELSE 'other'
        END as property_type,
        CASE 
            WHEN extract_residential_flow_type(property_details) = 'residential_rent' THEN 'rent'
            WHEN extract_residential_flow_type(property_details) = 'residential_sale' THEN 'sale'
            WHEN extract_residential_flow_type(property_details) = 'residential_flatmates' THEN 'flatmates'
            WHEN extract_residential_flow_type(property_details) = 'residential_pghostel' THEN 'pghostel'
            WHEN extract_commercial_flow_type(property_details) = 'commercial_rent' THEN 'rent'
            WHEN extract_commercial_flow_type(property_details) = 'commercial_sale' THEN 'sale'
            WHEN extract_commercial_flow_type(property_details) = 'commercial_coworking' THEN 'coworking'
            WHEN extract_land_flow_type(property_details) = 'land_sale' THEN 'sale'
            ELSE 'other'
        END as subtype,
        COUNT(*) as count
    FROM properties_v2 
    WHERE status IS DISTINCT FROM 'deleted'
    GROUP BY property_type, subtype
    ORDER BY property_type, subtype;
  `;
  
  await runQuery(query2, 'Test 2: Count by property type and subtype');
}

async function runSearchAllPropertiesTests() {
  console.log('\n🔍 SEARCH_ALL_PROPERTIES TESTS');
  console.log('=' + '='.repeat(50));
  
  // Test 1: Basic search across all property types
  const test1 = `
    SELECT property_type, flow_type, subtype, COUNT(*) as count
    FROM search_all_properties(
        NULL,    -- p_search_query
        NULL,    -- p_city
        NULL,    -- p_state
        NULL,    -- p_property_type (all types)
        NULL,    -- p_subtype
        NULL,    -- p_property_subtype
        NULL,    -- p_min_price
        NULL,    -- p_max_price
        NULL,    -- p_bedrooms
        NULL,    -- p_bathrooms
        NULL,    -- p_area_min
        NULL,    -- p_area_max
        100,     -- p_limit
        0        -- p_offset
    ) GROUP BY property_type, flow_type, subtype
    ORDER BY property_type, subtype;
  `;
  
  await runQuery(test1, 'Test 1: Basic search across all property types');
  
  // Test 2: Search only residential properties
  const test2 = `
    SELECT property_type, flow_type, subtype, title, price, city, bedrooms, bathrooms
    FROM search_all_properties(
        NULL,           -- p_search_query
        NULL,           -- p_city
        NULL,           -- p_state
        'residential',  -- p_property_type
        NULL,           -- p_subtype
        NULL,           -- p_property_subtype
        NULL,           -- p_min_price
        NULL,           -- p_max_price
        NULL,           -- p_bedrooms
        NULL,           -- p_bathrooms
        NULL,           -- p_area_min
        NULL,           -- p_area_max
        20,             -- p_limit
        0               -- p_offset
    )
    ORDER BY created_at DESC;
  `;
  
  await runQuery(test2, 'Test 2: Search only residential properties');
  
  // Test 3: Search only commercial properties
  const test3 = `
    SELECT property_type, flow_type, subtype, title, price, city, area
    FROM search_all_properties(
        NULL,          -- p_search_query
        NULL,          -- p_city
        NULL,          -- p_state
        'commercial',  -- p_property_type
        NULL,          -- p_subtype
        NULL,          -- p_property_subtype
        NULL,          -- p_min_price
        NULL,          -- p_max_price
        NULL,          -- p_bedrooms
        NULL,          -- p_bathrooms
        NULL,          -- p_area_min
        NULL,          -- p_area_max
        20,            -- p_limit
        0              -- p_offset
    )
    ORDER BY created_at DESC;
  `;
  
  await runQuery(test3, 'Test 3: Search only commercial properties');
  
  // Test 4: Search only land properties
  const test4 = `
    SELECT property_type, flow_type, subtype, title, price, city, area, land_type
    FROM search_all_properties(
        NULL,    -- p_search_query
        NULL,    -- p_city
        NULL,    -- p_state
        'land',  -- p_property_type
        NULL,    -- p_subtype
        NULL,    -- p_property_subtype
        NULL,    -- p_min_price
        NULL,    -- p_max_price
        NULL,    -- p_bedrooms
        NULL,    -- p_bathrooms
        NULL,    -- p_area_min
        NULL,    -- p_area_max
        20,      -- p_limit
        0        -- p_offset
    )
    ORDER BY created_at DESC;
  `;
  
  await runQuery(test4, 'Test 4: Search only land properties');
  
  // Test 5: City-based search
  const test5 = `
    SELECT property_type, flow_type, title, city, price, COUNT(*) OVER() as total_found
    FROM search_all_properties(
        NULL,         -- p_search_query
        'Hyderabad',  -- p_city
        NULL,         -- p_state
        NULL,         -- p_property_type
        NULL,         -- p_subtype
        NULL,         -- p_property_subtype
        NULL,         -- p_min_price
        NULL,         -- p_max_price
        NULL,         -- p_bedrooms
        NULL,         -- p_bathrooms
        NULL,         -- p_area_min
        NULL,         -- p_area_max
        50,           -- p_limit
        0             -- p_offset
    )
    ORDER BY created_at DESC;
  `;
  
  await runQuery(test5, 'Test 5: City-based search (Hyderabad)');
}

async function runAdvancedFilterTests() {
  console.log('\n🎯 ADVANCED FILTER TESTS');
  console.log('=' + '='.repeat(50));
  
  // Test 6: Price range search
  const test6 = `
    SELECT property_type, flow_type, title, price, city
    FROM search_all_properties(
        NULL,    -- p_search_query
        NULL,    -- p_city
        NULL,    -- p_state
        NULL,    -- p_property_type
        NULL,    -- p_subtype
        NULL,    -- p_property_subtype
        10000,   -- p_min_price
        50000,   -- p_max_price
        NULL,    -- p_bedrooms
        NULL,    -- p_bathrooms
        NULL,    -- p_area_min
        NULL,    -- p_area_max
        30,      -- p_limit
        0        -- p_offset
    )
    WHERE price IS NOT NULL
    ORDER BY price ASC;
  `;
  
  await runQuery(test6, 'Test 6: Price range search (₹10,000 to ₹50,000)');
  
  // Test 7: Bedroom-specific search
  const test7 = `
    SELECT property_type, flow_type, title, bedrooms, bathrooms, price, city
    FROM search_all_properties(
        NULL,    -- p_search_query
        NULL,    -- p_city
        NULL,    -- p_state
        NULL,    -- p_property_type
        NULL,    -- p_subtype
        NULL,    -- p_property_subtype
        NULL,    -- p_min_price
        NULL,    -- p_max_price
        2,       -- p_bedrooms
        NULL,    -- p_bathrooms
        NULL,    -- p_area_min
        NULL,    -- p_area_max
        25,      -- p_limit
        0        -- p_offset
    )
    WHERE bedrooms IS NOT NULL
    ORDER BY bedrooms, price;
  `;
  
  await runQuery(test7, 'Test 7: Search for 2 BHK properties');
  
  // Test 8: Subtype-specific search
  const test8 = `
    SELECT property_type, flow_type, subtype, title, price, city
    FROM search_all_properties(
        NULL,    -- p_search_query
        NULL,    -- p_city
        NULL,    -- p_state
        NULL,    -- p_property_type
        'rent',  -- p_subtype
        NULL,    -- p_property_subtype
        NULL,    -- p_min_price
        NULL,    -- p_max_price
        NULL,    -- p_bedrooms
        NULL,    -- p_bathrooms
        NULL,    -- p_area_min
        NULL,    -- p_area_max
        40,      -- p_limit
        0        -- p_offset
    )
    ORDER BY property_type, price;
  `;
  
  await runQuery(test8, 'Test 8: Search for rental properties only');
  
  // Test 9: Text search
  const test9 = `
    SELECT property_type, flow_type, title, price, city
    FROM search_all_properties(
        'apartment', -- p_search_query
        NULL,        -- p_city
        NULL,        -- p_state
        NULL,        -- p_property_type
        NULL,        -- p_subtype
        NULL,        -- p_property_subtype
        NULL,        -- p_min_price
        NULL,        -- p_max_price
        NULL,        -- p_bedrooms
        NULL,        -- p_bathrooms
        NULL,        -- p_area_min
        NULL,        -- p_area_max
        20,          -- p_limit
        0            -- p_offset
    )
    ORDER BY created_at DESC;
  `;
  
  await runQuery(test9, 'Test 9: Text search for "apartment"');
  
  // Test 10: Complex multi-filter search
  const test10 = `
    SELECT property_type, flow_type, subtype, title, bedrooms, price, city
    FROM search_all_properties(
        NULL,           -- p_search_query
        'Hyderabad',    -- p_city
        'Telangana',    -- p_state
        'residential',  -- p_property_type
        'rent',         -- p_subtype
        NULL,           -- p_property_subtype
        15000,          -- p_min_price
        40000,          -- p_max_price
        2,              -- p_bedrooms
        NULL,           -- p_bathrooms
        NULL,           -- p_area_min
        NULL,           -- p_area_max
        15,             -- p_limit
        0               -- p_offset
    )
    ORDER BY price ASC;
  `;
  
  await runQuery(test10, 'Test 10: Complex multi-filter search (residential rent in Hyderabad, 2 BHK, ₹15K-40K)');
}

async function runVerificationQueries() {
  console.log('\n✅ VERIFICATION QUERIES');
  console.log('=' + '='.repeat(50));
  
  // Verification query: Compare total counts
  const verificationQuery = `
    WITH all_search AS (
        SELECT COUNT(*) as total_all
        FROM search_all_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)
    ),
    individual_counts AS (
        SELECT 
            (SELECT COUNT(*) FROM search_residential_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)) as residential_count,
            (SELECT COUNT(*) FROM search_commercial_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)) as commercial_count,
            (SELECT COUNT(*) FROM search_land_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1000,0)) as land_count
    )
    SELECT 
        a.total_all,
        i.residential_count + i.commercial_count + i.land_count as individual_sum,
        CASE 
            WHEN a.total_all = (i.residential_count + i.commercial_count + i.land_count) 
            THEN 'MATCH ✓' 
            ELSE 'MISMATCH ✗' 
        END as verification_status
    FROM all_search a, individual_counts i;
  `;
  
  await runQuery(verificationQuery, 'Verification: Total counts match');
  
  // Pagination test
  const paginationQuery = `
    SELECT 'First 10' as batch, COUNT(*) as count
    FROM search_all_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,0)
    UNION ALL
    SELECT 'Next 10' as batch, COUNT(*) as count
    FROM search_all_properties(NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,10,10);
  `;
  
  await runQuery(paginationQuery, 'Pagination Test: First 10 vs Next 10');
}

async function generateMarkdownReport() {
  console.log('\n📄 GENERATING MARKDOWN REPORT');
  console.log('=' + '='.repeat(50));
  
  let markdown = `# SQL Testing Results Report\n\n`;
  markdown += `**Generated:** ${new Date().toISOString()}\n`;
  markdown += `**Total Tests:** ${testResults.length}\n\n`;
  
  markdown += `## Executive Summary\n\n`;
  
  const successCount = testResults.filter(r => !r.result.error).length;
  const failureCount = testResults.filter(r => r.result.error).length;
  
  markdown += `- ✅ **Successful Tests:** ${successCount}\n`;
  markdown += `- ❌ **Failed Tests:** ${failureCount}\n`;
  markdown += `- 📊 **Success Rate:** ${((successCount / testResults.length) * 100).toFixed(1)}%\n\n`;
  
  markdown += `## Test Results Details\n\n`;
  
  testResults.forEach((test, index) => {
    markdown += `### ${index + 1}. ${test.testName}\n\n`;
    
    if (test.result.error) {
      markdown += `**Status:** ❌ FAILED\n`;
      markdown += `**Error:** ${test.result.error}\n\n`;
    } else {
      markdown += `**Status:** ✅ PASSED\n`;
      markdown += `**Rows Returned:** ${test.result.length}\n`;
      markdown += `**Analysis:** ${test.analysis}\n\n`;
      
      if (test.result.length > 0) {
        markdown += `**Sample Results:**\n`;
        markdown += `\`\`\`json\n`;
        markdown += JSON.stringify(test.result.slice(0, 3), null, 2);
        markdown += `\n\`\`\`\n\n`;
      }
    }
    
    markdown += `**Query:**\n`;
    markdown += `\`\`\`sql\n${test.query.trim()}\n\`\`\`\n\n`;
    markdown += `---\n\n`;
  });
  
  // Save the report
  const reportPath = '/Users/wenceslausyesunesun/ActiveProjects/Bhoomitalli/bAdminV1/kb/sql_testing/Testing1_Results.md';
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`📄 Report saved to: ${reportPath}`);
}

async function main() {
  console.log('🚀 Starting SQL Testing Suite...');
  
  try {
    // Run all test categories
    await runBasicCountQueries();
    await runSearchAllPropertiesTests();
    await runAdvancedFilterTests();
    await runVerificationQueries();
    
    // Generate final report
    await generateMarkdownReport();
    
    console.log('\n🎉 Testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  }
}

main();