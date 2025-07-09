// Simple test to verify NLP search
import { nlpService } from './src/services/search/nlpService.js';
import { enhancedSearchService } from './src/services/search/enhancedSearchService.js';

console.log('🧪 Testing NLP Search...');

// Test if NLP service is ready
console.log('1. NLP Service Ready:', nlpService.isReady());

// Test a simple query
const testQuery = "3bhk apartment in mudfort";
console.log(`\n2. Testing query: "${testQuery}"`);

// Check if it's detected as natural language
const isNL = nlpService.isNaturalLanguage(testQuery);
console.log('   Natural Language:', isNL);

if (isNL) {
  try {
    const parseResult = await nlpService.parseQuery(testQuery);
    console.log('   Parse Result:', {
      confidence: parseResult.confidence,
      entities: parseResult.entities,
      filters: parseResult.filters,
      fallbackReason: parseResult.fallbackReason
    });
  } catch (error) {
    console.error('   Parse Error:', error);
  }
}

// Test enhanced search
console.log('\n3. Testing Enhanced Search...');
try {
  const searchResult = await enhancedSearchService.search({
    searchQuery: testQuery,
    selectedLocation: 'any',
    actionType: 'any',
    selectedPropertyType: 'any',
    selectedSubType: 'any',
    selectedBHK: 'any',
    selectedPriceRange: 'any'
  }, {
    enableNLP: true,
    debugMode: true
  });
  
  console.log('   Search Result:', {
    searchMethod: searchResult.searchMethod,
    resultsCount: searchResult.results.length,
    processingTime: searchResult.processingTime,
    nlpUsed: searchResult.nlpResult ? 'Yes' : 'No'
  });
} catch (error) {
  console.error('   Search Error:', error);
}