// Test script to verify property code search functionality
import { supabase } from '@/lib/supabase';

export async function testPropertyCodeSearch() {
  console.log('🧪 Testing Property Code Search...');
  
  try {
    // 1. First, let's check if the database function exists
    console.log('📋 Step 1: Testing database function existence...');
    
    const { data: testData, error: testError } = await supabase
      .rpc('search_property_by_code', { p_code: 'TEST123' });
    
    if (testError) {
      console.error('❌ Database function error:', testError);
      if (testError.message.includes('function search_property_by_code') && testError.message.includes('does not exist')) {
        console.log('💡 The search_property_by_code function does not exist in the database');
        return { functionExists: false, error: testError };
      }
    } else {
      console.log('✅ Database function exists and is accessible');
    }
    
    // 2. Check if there are any properties with codes
    console.log('\n📋 Step 2: Checking for properties with codes...');
    
    const { data: propertiesWithCodes, error: propertiesError } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .not('property_details->meta->code', 'is', null)
      .neq('property_details->meta->code', '')
      .limit(5);
    
    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return { functionExists: true, error: propertiesError };
    }
    
    if (!propertiesWithCodes || propertiesWithCodes.length === 0) {
      console.log('⚠️  No properties found with codes');
      return { functionExists: true, propertiesWithCodes: 0 };
    }
    
    console.log(`✅ Found ${propertiesWithCodes.length} properties with codes`);
    
    // 3. Test the database function with actual codes
    console.log('\n📋 Step 3: Testing database function with actual codes...');
    
    const testResults = [];
    
    for (const property of propertiesWithCodes) {
      const code = property.property_details?.meta?.code;
      if (code) {
        console.log(`🔍 Testing with code: ${code}`);
        
        const { data: searchResults, error: searchError } = await supabase
          .rpc('search_property_by_code', { p_code: code });
        
        if (searchError) {
          console.error(`❌ Error searching with code ${code}:`, searchError);
          testResults.push({ code, success: false, error: searchError });
        } else {
          console.log(`✅ Found ${searchResults?.length || 0} results for code ${code}`);
          testResults.push({ code, success: true, results: searchResults?.length || 0 });
        }
      }
    }
    
    // 4. Test the search service integration
    console.log('\n📋 Step 4: Testing search service integration...');
    
    const { searchService } = await import('@/components/Search/services/searchService');
    
    if (propertiesWithCodes.length > 0) {
      const testCode = propertiesWithCodes[0].property_details?.meta?.code;
      if (testCode) {
        console.log(`🔍 Testing searchService.searchByCode with: ${testCode}`);
        
        try {
          const serviceResults = await searchService.searchByCode(testCode);
          console.log(`✅ searchService.searchByCode returned ${serviceResults.results.length} results`);
          
          // Test smartSearch as well
          const smartResults = await searchService.smartSearch({ searchQuery: testCode });
          console.log(`✅ searchService.smartSearch returned ${smartResults.results.length} results`);
          
          return {
            functionExists: true,
            propertiesWithCodes: propertiesWithCodes.length,
            databaseTests: testResults,
            serviceTest: {
              searchByCode: serviceResults.results.length,
              smartSearch: smartResults.results.length
            }
          };
        } catch (serviceError) {
          console.error('❌ Error testing search service:', serviceError);
          return {
            functionExists: true,
            propertiesWithCodes: propertiesWithCodes.length,
            databaseTests: testResults,
            serviceError
          };
        }
      }
    }
    
    return {
      functionExists: true,
      propertiesWithCodes: propertiesWithCodes.length,
      databaseTests: testResults
    };
    
  } catch (error) {
    console.error('❌ Error in testPropertyCodeSearch:', error);
    return { error };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testPropertyCodeSearch = testPropertyCodeSearch;
}