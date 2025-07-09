// src/services/search/nlpTest.ts
// Version: 1.0.0
// Last Modified: 09-07-2025 12:45 IST
// Purpose: Test script for NLP search functionality

import { nlpService } from './nlpService';
import { enhancedSearchService } from './enhancedSearchService';

/**
 * Test NLP search functionality
 */
export async function testNLPSearch() {
  console.log('🧪 Testing NLP Search Integration...\n');

  // Test queries from the requirements
  const testQueries = [
    "looking for 3bhk apartment in mudfort",
    "find me a land in secunderabad under 50l",
    "between 5-6l apartment",
    "2bhk flat for rent in gachibowli",
    "office space in hitech city",
    "villa for sale in jubilee hills above 2cr",
    "pg accommodation near kukatpally",
    "commercial plot under 1cr"
  ];

  console.log('📝 Testing NLP Service...\n');
  
  // Test NLP service directly
  for (const query of testQueries) {
    console.log(`\n🔍 Query: "${query}"`);
    
    try {
      // Check if query is detected as natural language
      const isNL = nlpService.isNaturalLanguage(query);
      console.log(`   Natural Language: ${isNL ? '✅ Yes' : '❌ No'}`);
      
      if (isNL) {
        // Parse the query
        const parseResult = await nlpService.parseQuery(query);
        console.log(`   Confidence: ${(parseResult.confidence * 100).toFixed(1)}%`);
        console.log(`   Processing Time: ${parseResult.processingTime}ms`);
        console.log(`   Entities:`, parseResult.entities);
        console.log(`   Filters:`, parseResult.filters);
        
        if (parseResult.fallbackReason) {
          console.log(`   Fallback Reason: ${parseResult.fallbackReason}`);
        }
      }
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
  }

  console.log('\n\n🔍 Testing Enhanced Search Service...\n');
  
  // Test enhanced search service
  for (const query of testQueries.slice(0, 3)) { // Test first 3 queries
    console.log(`\n🚀 Enhanced Search: "${query}"`);
    
    try {
      const searchFilters = {
        searchQuery: query,
        selectedLocation: '',
        actionType: '',
        selectedPropertyType: '',
        selectedSubType: '',
        selectedBHK: '',
        selectedPriceRange: ''
      };
      
      // This would normally call the database, but we'll just test the NLP parsing
      const parseResult = await enhancedSearchService.parseQuery(query);
      
      if (parseResult) {
        console.log(`   NLP Result:`, {
          confidence: parseResult.confidence,
          entities: parseResult.entities,
          filters: parseResult.filters
        });
      } else {
        console.log(`   No NLP parsing result`);
      }
      
    } catch (error) {
      console.error(`   Error: ${error.message}`);
    }
  }

  console.log('\n\n📊 NLP Service Stats:');
  console.log(`   Enabled: ${enhancedSearchService.isNLPEnabled()}`);
  console.log(`   Stats:`, enhancedSearchService.getNLPStats());
}

/**
 * Test specific NLP parsing scenarios
 */
export async function testNLPParsing() {
  console.log('🧪 Testing NLP Parsing Scenarios...\n');

  const scenarios = [
    {
      name: 'Property Type Detection',
      queries: ['apartment', 'villa', 'office', 'land', 'plot']
    },
    {
      name: 'Location Detection',
      queries: ['in mudfort', 'near gachibowli', 'at hitech city', 'around kukatpally']
    },
    {
      name: 'Price Detection',
      queries: ['under 50l', '5-6l', 'above 2cr', 'between 10-20 lakhs']
    },
    {
      name: 'BHK Detection',
      queries: ['1bhk', '2 bhk', '3 bedroom', 'four bedroom']
    },
    {
      name: 'Combined Queries',
      queries: ['2bhk apartment in gachibowli under 50l', 'office space hitech city above 1cr']
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\n📋 ${scenario.name}:`);
    
    for (const query of scenario.queries) {
      try {
        const result = await nlpService.parseQuery(query);
        console.log(`   "${query}" → ${JSON.stringify(result.entities)}`);
      } catch (error) {
        console.error(`   "${query}" → Error: ${error.message}`);
      }
    }
  }
}

/**
 * Test typo correction
 */
export async function testTypoCorrection() {
  console.log('🧪 Testing Typo Correction...\n');

  const typoQueries = [
    'appartment in mudfort',
    'lond for sale',
    'comercial space',
    'residental plot',
    'villa in gachbowli'
  ];

  for (const query of typoQueries) {
    try {
      const result = await nlpService.parseQuery(query);
      console.log(`   "${query}" → Corrected entities:`, result.entities);
    } catch (error) {
      console.error(`   "${query}" → Error: ${error.message}`);
    }
  }
}

// Export for use in browser console or testing
if (typeof window !== 'undefined') {
  (window as any).testNLP = {
    testNLPSearch,
    testNLPParsing,
    testTypoCorrection
  };
}

export default {
  testNLPSearch,
  testNLPParsing,
  testTypoCorrection
};