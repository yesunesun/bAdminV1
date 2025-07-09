// Debug script to check property codes and search functionality
import { supabase } from '@/lib/supabase';

/**
 * Debug function to check properties and their codes
 */
export async function debugPropertyCodes() {
  console.log('🔍 Starting property code debugging...');
  
  try {
    // 1. Check total properties in database
    const { data: allProperties, error: allError } = await supabase
      .from('properties_v2')
      .select('id, property_details, created_at, status')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (allError) {
      console.error('❌ Error fetching all properties:', allError);
      return;
    }
    
    console.log(`📊 Total properties found: ${allProperties?.length || 0}`);
    
    if (!allProperties || allProperties.length === 0) {
      console.log('⚠️  No properties found in database');
      return;
    }
    
    // 2. Check which properties have codes
    const propertiesWithCodes = allProperties.filter(p => 
      p.property_details?.meta?.code && p.property_details.meta.code.trim() !== ''
    );
    
    const propertiesWithoutCodes = allProperties.filter(p => 
      !p.property_details?.meta?.code || p.property_details.meta.code.trim() === ''
    );
    
    console.log(`✅ Properties with codes: ${propertiesWithCodes.length}`);
    console.log(`❌ Properties without codes: ${propertiesWithoutCodes.length}`);
    
    // 3. Show sample properties with codes
    if (propertiesWithCodes.length > 0) {
      console.log('\n📋 Sample properties with codes:');
      propertiesWithCodes.slice(0, 5).forEach((prop, index) => {
        console.log(`${index + 1}. ID: ${prop.id}`);
        console.log(`   Code: ${prop.property_details?.meta?.code}`);
        console.log(`   Status: ${prop.status}`);
        console.log(`   Created: ${prop.created_at}`);
        console.log('');
      });
    }
    
    // 4. Test database functions with actual codes
    if (propertiesWithCodes.length > 0) {
      const testCode = propertiesWithCodes[0].property_details.meta.code;
      console.log(`🧪 Testing search with code: ${testCode}`);
      
      // Test case-sensitive search
      const { data: exactResults, error: exactError } = await supabase
        .rpc('search_property_by_code', { p_code: testCode });
      
      if (exactError) {
        console.error('❌ Error with exact search:', exactError);
      } else {
        console.log(`✅ Exact search results: ${exactResults?.length || 0}`);
      }
      
      // Test case-insensitive search
      const { data: insensitiveResults, error: insensitiveError } = await supabase
        .rpc('search_property_by_code_insensitive', { p_code: testCode.toLowerCase() });
      
      if (insensitiveError) {
        console.error('❌ Error with insensitive search:', insensitiveError);
      } else {
        console.log(`✅ Insensitive search results: ${insensitiveResults?.length || 0}`);
      }
    }
    
    // 5. Check if database functions exist
    console.log('\n🔧 Checking database functions...');
    
    const { data: functions, error: funcError } = await supabase
      .rpc('search_property_by_code', { p_code: 'TEST123' });
    
    if (funcError) {
      console.error('❌ Database function error:', funcError);
      console.log('💡 The search_property_by_code function might not exist in the database');
    } else {
      console.log('✅ Database functions are accessible');
    }
    
    return {
      total: allProperties.length,
      withCodes: propertiesWithCodes.length,
      withoutCodes: propertiesWithoutCodes.length,
      sampleCodes: propertiesWithCodes.slice(0, 3).map(p => p.property_details?.meta?.code)
    };
    
  } catch (error) {
    console.error('❌ Error in debugPropertyCodes:', error);
    throw error;
  }
}

/**
 * Generate codes for properties that don't have them
 */
export async function generateMissingCodes() {
  console.log('🔄 Starting code generation for properties without codes...');
  
  try {
    const { data: propertiesWithoutCodes, error } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .or('property_details->meta->code.is.null,property_details->meta->code.eq.""')
      .limit(10);
    
    if (error) {
      console.error('❌ Error fetching properties without codes:', error);
      return;
    }
    
    if (!propertiesWithoutCodes || propertiesWithoutCodes.length === 0) {
      console.log('✅ All properties already have codes');
      return;
    }
    
    console.log(`📊 Found ${propertiesWithoutCodes.length} properties without codes`);
    
    // Generate codes for these properties
    const { generatePropertyCode } = await import('@/lib/utils');
    
    for (const property of propertiesWithoutCodes) {
      try {
        const code = await generatePropertyCode(property.id, property);
        console.log(`✅ Generated code for ${property.id}: ${code}`);
      } catch (error) {
        console.error(`❌ Error generating code for ${property.id}:`, error);
      }
    }
    
    console.log('🎉 Code generation completed');
    
  } catch (error) {
    console.error('❌ Error in generateMissingCodes:', error);
    throw error;
  }
}

/**
 * Test search functionality end-to-end
 */
export async function testSearchFunctionality() {
  console.log('🧪 Testing search functionality...');
  
  try {
    // Import search service
    const { searchService } = await import('@/components/Search/services/searchService');
    
    // Get a property with a code
    const { data: propertiesWithCodes, error } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .not('property_details->meta->code', 'is', null)
      .neq('property_details->meta->code', '')
      .limit(1);
    
    if (error || !propertiesWithCodes || propertiesWithCodes.length === 0) {
      console.log('❌ No properties with codes found for testing');
      return;
    }
    
    const testCode = propertiesWithCodes[0].property_details.meta.code;
    console.log(`🎯 Testing search with code: ${testCode}`);
    
    // Test isPropertyCode function
    const isValidCode = searchService.isPropertyCode(testCode);
    console.log(`✅ isPropertyCode(${testCode}): ${isValidCode}`);
    
    // Test searchByCode function
    const searchResults = await searchService.searchByCode(testCode);
    console.log(`✅ searchByCode results: ${searchResults.results.length}`);
    
    // Test smartSearch function
    const smartResults = await searchService.smartSearch({ searchQuery: testCode });
    console.log(`✅ smartSearch results: ${smartResults.results.length}`);
    
    return {
      testCode,
      isValidCode,
      searchResults: searchResults.results.length,
      smartResults: smartResults.results.length
    };
    
  } catch (error) {
    console.error('❌ Error in testSearchFunctionality:', error);
    throw error;
  }
}

// Export all functions for console use
if (typeof window !== 'undefined') {
  (window as any).debugPropertyCodes = debugPropertyCodes;
  (window as any).generateMissingCodes = generateMissingCodes;
  (window as any).testSearchFunctionality = testSearchFunctionality;
}