// Quick test without complex imports
import { supabase } from '@/lib/supabase';

export async function quickTest() {
  console.log('🔍 Quick property code test...');
  
  try {
    // Test 1: Check if we can access the database
    const { data: dbTest, error: dbError } = await supabase
      .from('properties_v2')
      .select('id')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database error:', dbError);
      return { error: 'Database connection failed' };
    }
    
    console.log('✅ Database connection working');
    
    // Test 2: Check if the function exists
    const { data: funcTest, error: funcError } = await supabase
      .rpc('search_property_by_code', { p_code: 'TEST123' });
    
    if (funcError) {
      if (funcError.message.includes('function') && funcError.message.includes('does not exist')) {
        console.log('❌ Function does not exist');
        return { error: 'Function missing', solution: 'Add database function' };
      }
      console.log('✅ Function exists but returned error (expected for test code)');
    } else {
      console.log('✅ Function exists and working');
    }
    
    // Test 3: Check for properties with codes
    const { data: propsWithCodes, error: propsError } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .not('property_details->meta->code', 'is', null)
      .limit(3);
    
    if (propsError) {
      console.error('❌ Error checking properties:', propsError);
      return { error: 'Properties check failed' };
    }
    
    const codesFound = propsWithCodes?.filter(p => p.property_details?.meta?.code) || [];
    console.log(`✅ Found ${codesFound.length} properties with codes`);
    
    // Test 4: If we have codes, test the search
    if (codesFound.length > 0) {
      const testCode = codesFound[0].property_details.meta.code;
      console.log(`🔍 Testing search with code: ${testCode}`);
      
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_property_by_code', { p_code: testCode });
      
      if (searchError) {
        console.error('❌ Search error:', searchError);
        return { error: 'Search failed', code: testCode };
      }
      
      console.log(`✅ Search successful - found ${searchResult?.length || 0} results`);
      
      return {
        success: true,
        testCode,
        searchResults: searchResult?.length || 0,
        totalPropertiesWithCodes: codesFound.length
      };
    }
    
    return {
      success: true,
      message: 'Function works but no properties have codes',
      totalPropertiesWithCodes: 0
    };
    
  } catch (error) {
    console.error('❌ Test error:', error);
    return { error: error.message || 'Unknown error' };
  }
}

export async function addTestCode() {
  console.log('🔧 Adding test code to a property...');
  
  try {
    // Get a property without a code
    const { data: props, error: propsError } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .is('property_details->meta->code', null)
      .limit(1);
    
    if (propsError || !props || props.length === 0) {
      console.log('❌ No properties found to add code to');
      return { error: 'No suitable properties found' };
    }
    
    const property = props[0];
    const testCode = 'TEST01';
    
    // Add the code
    const updatedDetails = {
      ...property.property_details,
      meta: {
        ...property.property_details?.meta,
        code: testCode,
        codeGeneratedAt: new Date().toISOString()
      }
    };
    
    const { error: updateError } = await supabase
      .from('properties_v2')
      .update({
        property_details: updatedDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', property.id);
    
    if (updateError) {
      console.error('❌ Update error:', updateError);
      return { error: 'Failed to update property' };
    }
    
    console.log(`✅ Added code "${testCode}" to property ${property.id}`);
    
    return {
      success: true,
      propertyId: property.id,
      code: testCode
    };
    
  } catch (error) {
    console.error('❌ Error adding test code:', error);
    return { error: error.message || 'Unknown error' };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  (window as any).quickTest = quickTest;
  (window as any).addTestCode = addTestCode;
}