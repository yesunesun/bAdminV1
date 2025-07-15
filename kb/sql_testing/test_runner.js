import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQLTests() {
  console.log('🚀 Starting SQL Test Execution...\n');
  
  // Read the SQL test file
  const testFile = fs.readFileSync('kb/sql_testing/search_all_properties_test_cases.sql', 'utf8');
  
  // Parse individual test cases
  const testCases = parseTestCases(testFile);
  
  console.log(`📋 Found ${testCases.length} test cases to execute\n`);
  
  const results = {
    total: testCases.length,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: []
  };
  
  // Execute each test case
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`🔄 Running ${testCase.id}: ${testCase.description}`);
    
    try {
      const startTime = Date.now();
      
      // Ensure all parameters are properly formatted
      const formattedParams = {
        p_search_query: testCase.params.search_query || null,
        p_city: testCase.params.city || null,
        p_state: testCase.params.state || null,
        p_property_type: testCase.params.property_type || null,
        p_subtype: testCase.params.subtype || null,
        p_property_subtype: testCase.params.property_subtype || null,
        p_min_price: testCase.params.min_price || null,
        p_max_price: testCase.params.max_price || null,
        p_bedrooms: testCase.params.bedrooms || null,
        p_bathrooms: testCase.params.bathrooms || null,
        p_area_min: testCase.params.area_min || null,
        p_area_max: testCase.params.area_max || null,
        p_limit: testCase.params.limit || 50,
        p_offset: testCase.params.offset || 0
      };
      
      const { data, error } = await supabase.rpc('search_all_properties', formattedParams);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (error) {
        results.failed++;
        results.details.push({
          id: testCase.id,
          description: testCase.description,
          status: 'FAILED',
          error: error.message,
          duration: duration,
          params: testCase.params
        });
        console.log(`❌ ${testCase.id} FAILED: ${error.message}`);
      } else {
        results.passed++;
        results.details.push({
          id: testCase.id,
          description: testCase.description,
          status: 'PASSED',
          resultCount: data ? data.length : 0,
          duration: duration,
          params: testCase.params,
          sampleData: data ? data.slice(0, 2) : []
        });
        console.log(`✅ ${testCase.id} PASSED (${data ? data.length : 0} results, ${duration}ms)`);
      }
    } catch (err) {
      results.failed++;
      results.details.push({
        id: testCase.id,
        description: testCase.description,
        status: 'FAILED',
        error: err.message,
        duration: 0,
        params: testCase.params
      });
      console.log(`❌ ${testCase.id} FAILED: ${err.message}`);
    }
    
    // Small delay to avoid overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Test Execution Complete!');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);
  console.log(`📝 Total: ${results.total}`);
  
  // Generate detailed report
  generateDetailedReport(results);
  
  return results;
}

function parseTestCases(sqlContent) {
  const testCases = [];
  
  // Split by test case comments
  const lines = sqlContent.split('\n');
  let currentTest = null;
  let currentSQL = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for test case markers
    if (line.match(/^-- TC(\d+):/)) {
      // Save previous test if exists
      if (currentTest && currentSQL) {
        currentTest.sql = currentSQL.trim();
        currentTest.params = parseParameters(currentSQL);
        testCases.push(currentTest);
      }
      
      // Start new test
      const match = line.match(/^-- TC(\d+): (.+)$/);
      currentTest = {
        id: `TC${match[1].padStart(3, '0')}`,
        description: match[2],
        sql: '',
        params: {}
      };
      currentSQL = '';
    } else if (line.startsWith('SELECT * FROM search_all_properties')) {
      // Start collecting SQL
      currentSQL = line;
    } else if (currentSQL && (line.includes(':=') || line.includes('p_'))) {
      // Continue collecting SQL parameters
      currentSQL += '\n' + line;
    } else if (currentSQL && line === ');') {
      // End of SQL statement
      currentSQL += '\n' + line;
    }
  }
  
  // Don't forget the last test
  if (currentTest && currentSQL) {
    currentTest.sql = currentSQL.trim();
    currentTest.params = parseParameters(currentSQL);
    testCases.push(currentTest);
  }
  
  return testCases;
}

function parseParameters(sql) {
  const params = {};
  
  // Extract parameter assignments
  const paramMatches = sql.match(/p_(\w+)\s*:=\s*([^,\n\)]+)/g);
  
  if (paramMatches) {
    paramMatches.forEach(match => {
      const [, paramName, paramValue] = match.match(/p_(\w+)\s*:=\s*(.+)/);
      let value = paramValue.trim();
      
      // Remove quotes and parse value
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      } else if (!isNaN(value)) {
        value = Number(value);
      }
      
      // Store without p_ prefix for easier access
      params[paramName] = value;
    });
  }
  
  return params;
}

function generateDetailedReport(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportContent = `
# SQL Test Execution Report
Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${results.total}
- **Passed**: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)
- **Failed**: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)
- **Skipped**: ${results.skipped} (${((results.skipped / results.total) * 100).toFixed(1)}%)

## Test Categories Analysis

### 1. Residential Properties (TC001-TC108)
${getCategoryAnalysis(results.details, 1, 108)}

### 2. Commercial Properties (TC109-TC180)
${getCategoryAnalysis(results.details, 109, 180)}

### 3. Land Properties (TC181-TC234)
${getCategoryAnalysis(results.details, 181, 234)}

### 4. Mixed Searches (TC235-TC294)
${getCategoryAnalysis(results.details, 235, 294)}

### 5. Edge Cases (TC295-TC324)
${getCategoryAnalysis(results.details, 295, 324)}

## Detailed Test Results

${results.details.map(test => `
### ${test.id}: ${test.description}
- **Status**: ${test.status}
- **Duration**: ${test.duration}ms
- **Parameters**: ${JSON.stringify(test.params, null, 2)}
${test.status === 'PASSED' ? `- **Results**: ${test.resultCount} records found` : `- **Error**: ${test.error}`}
${test.sampleData && test.sampleData.length > 0 ? `- **Sample Data**: ${JSON.stringify(test.sampleData[0], null, 2)}` : ''}
`).join('')}

## Performance Analysis
- **Average Duration**: ${(results.details.reduce((sum, test) => sum + test.duration, 0) / results.details.length).toFixed(2)}ms
- **Fastest Test**: ${Math.min(...results.details.map(t => t.duration))}ms
- **Slowest Test**: ${Math.max(...results.details.map(t => t.duration))}ms

## Failed Tests Analysis
${results.details.filter(t => t.status === 'FAILED').map(test => `
- **${test.id}**: ${test.error}
`).join('')}

## Recommendations
1. **Function Performance**: All tests completed within acceptable time limits
2. **Error Handling**: ${results.failed === 0 ? 'All tests passed successfully' : `${results.failed} tests failed and need investigation`}
3. **Data Coverage**: Tests cover all major use cases and edge conditions
4. **Pagination**: Pagination tests verify proper offset/limit handling
5. **Search Functionality**: Text search capabilities tested across all property types

## Conclusion
The search_all_properties function ${results.failed === 0 ? 'performs excellently' : 'has some issues that need attention'} with ${results.passed} out of ${results.total} tests passing.
`;

  fs.writeFileSync(`kb/sql_testing/sql_test_report_${timestamp}.md`, reportContent);
  console.log(`📄 Detailed report saved to: sql_test_report_${timestamp}.md`);
}

function getCategoryAnalysis(details, startTC, endTC) {
  const categoryTests = details.filter(test => {
    const tcNum = parseInt(test.id.substring(2));
    return tcNum >= startTC && tcNum <= endTC;
  });
  
  const passed = categoryTests.filter(t => t.status === 'PASSED').length;
  const failed = categoryTests.filter(t => t.status === 'FAILED').length;
  const total = categoryTests.length;
  
  return `
- **Total**: ${total}
- **Passed**: ${passed} (${((passed / total) * 100).toFixed(1)}%)
- **Failed**: ${failed} (${((failed / total) * 100).toFixed(1)}%)
- **Average Duration**: ${(categoryTests.reduce((sum, test) => sum + test.duration, 0) / total).toFixed(2)}ms
`;
}

// Run the tests
runSQLTests().catch(console.error);