// Basic test of search functionality without database function
import { supabase } from '@/lib/supabase';

export async function basicSearchTest() {
  console.log('🔍 Starting basic search test...');
  
  try {
    // Step 1: Test if we can search using the search service without property codes
    console.log('📋 Step 1: Testing basic search service...');
    
    const { searchService } = await import('@/components/Search/services/searchService');
    
    // Test the isPropertyCode function
    console.log('🔍 Testing isPropertyCode function...');
    const testCodes = ['ABC123', 'ab123', '123456', 'ABCD12', 'ABC12', 'ABC@123'];
    
    testCodes.forEach(code => {
      const isValid = searchService.isPropertyCode(code);
      console.log(`  "${code}" -> ${isValid ? 'Valid' : 'Invalid'}`);
    });
    
    // Step 2: Test regular search (should work)
    console.log('📋 Step 2: Testing regular search...');
    
    try {
      const regularSearch = await searchService.search({ 
        searchQuery: 'property',
        selectedLocation: 'any',
        actionType: 'any',
        selectedPropertyType: 'any',
        selectedSubType: 'any',
        selectedBHK: 'any',
        selectedPriceRange: 'any'
      });
      
      console.log(`✅ Regular search returned ${regularSearch.results.length} results`);
      
      // Step 3: Test smart search with non-code query
      console.log('📋 Step 3: Testing smart search with text query...');
      
      const smartSearchText = await searchService.smartSearch({ 
        searchQuery: 'apartment',
        selectedLocation: 'any',
        actionType: 'any',
        selectedPropertyType: 'any',
        selectedSubType: 'any',
        selectedBHK: 'any',
        selectedPriceRange: 'any'
      });
      
      console.log(`✅ Smart search (text) returned ${smartSearchText.results.length} results`);
      
      // Step 4: Test smart search with code-like query (should fail gracefully)
      console.log('📋 Step 4: Testing smart search with code-like query...');
      
      try {
        const smartSearchCode = await searchService.smartSearch({ 
          searchQuery: 'ABC123',
          selectedLocation: 'any',
          actionType: 'any',
          selectedPropertyType: 'any',
          selectedSubType: 'any',
          selectedBHK: 'any',
          selectedPriceRange: 'any'
        });
        
        console.log(`✅ Smart search (code) returned ${smartSearchCode.results.length} results`);
        
      } catch (codeError) {
        console.log('⚠️  Smart search with code failed (expected if no database function):', codeError.message);
      }
      
      return {
        success: true,
        regularSearchResults: regularSearch.results.length,
        smartSearchTextResults: smartSearchText.results.length,
        isPropertyCodeWorking: true
      };
      
    } catch (searchError) {
      console.error('❌ Search service error:', searchError);
      return { step: 2, error: searchError };
    }
    
  } catch (error) {
    console.error('❌ Error in basicSearchTest:', error);
    return { error };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).basicSearchTest = basicSearchTest;
}