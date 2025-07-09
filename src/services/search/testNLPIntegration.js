// src/services/search/testNLPIntegration.js
// Version: 1.0.0
// Last Modified: 09-07-2025 13:30 IST
// Purpose: Test NLP integration in browser console

/**
 * Test NLP integration directly in browser console
 * Usage: In browser console, run: window.testNLPIntegration()
 */

window.testNLPIntegration = async function() {
  console.log('🧪 Testing NLP Search Integration...\n');
  
  try {
    // Import the enhanced search service
    const { enhancedSearchService } = await import('./enhancedSearchService');
    
    // Test queries from user requirements
    const testQueries = [
      "looking for 3bhk apartment in mudfort",
      "find me a land in secunderabad under 50l", 
      "between 5-6l apartment",
      "2bhk flat for rent in gachibowli",
      "office space in hitech city",
      "villa for sale in jubilee hills above 2cr"
    ];
    
    console.log('🔍 Testing NLP Service Status:');
    console.log('  NLP Enabled:', enhancedSearchService.isNLPEnabled());
    console.log('  Stats:', enhancedSearchService.getNLPStats());
    console.log('');
    
    // Test each query
    for (const query of testQueries) {
      console.log(`\n📝 Testing: "${query}"`);
      
      try {
        // Parse the query
        const parseResult = await enhancedSearchService.parseQuery(query);
        
        if (parseResult) {
          console.log(`  ✅ Parsed successfully`);
          console.log(`  🎯 Confidence: ${(parseResult.confidence * 100).toFixed(1)}%`);
          console.log(`  ⚡ Processing Time: ${parseResult.processingTime}ms`);
          console.log(`  🔍 Entities:`, parseResult.entities);
          console.log(`  🎛️  Filters:`, parseResult.filters);
          
          if (parseResult.fallbackReason) {
            console.log(`  ⚠️  Fallback: ${parseResult.fallbackReason}`);
          }
        } else {
          console.log(`  ❌ No NLP result`);
        }
        
      } catch (error) {
        console.error(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 NLP Integration Test Complete!');
    console.log('\n💡 Next Steps:');
    console.log('1. Open the search page in the application');
    console.log('2. Try typing natural language queries');
    console.log('3. Look for the blue "NLP" badge and feedback messages');
    console.log('4. Test the example queries above');
    
  } catch (error) {
    console.error('❌ Failed to test NLP integration:', error);
  }
};

// Also export for ES6 modules
export default window.testNLPIntegration;