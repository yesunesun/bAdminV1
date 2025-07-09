// Simple step-by-step test to diagnose the issue
import { supabase } from '@/lib/supabase';

export async function simpleTest() {
  console.log('🔍 Starting simple diagnostic test...');
  
  try {
    // Step 1: Check if we can connect to the database
    console.log('📋 Step 1: Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('properties_v2')
      .select('id')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return { step: 1, error: connectionError };
    }
    
    console.log('✅ Database connection successful');
    
    // Step 2: Check if properties_v2 table exists and has data
    console.log('📋 Step 2: Checking properties_v2 table...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .limit(3);
    
    if (propertiesError) {
      console.error('❌ Error accessing properties_v2:', propertiesError);
      return { step: 2, error: propertiesError };
    }
    
    console.log(`✅ Found ${properties?.length || 0} properties`);
    
    // Step 3: Check if any property has a code
    console.log('📋 Step 3: Checking for properties with codes...');
    let propertiesWithCodes = properties?.filter(p => 
      p.property_details?.meta?.code && p.property_details.meta.code.trim() !== ''
    ) || [];
    
    console.log(`✅ Found ${propertiesWithCodes.length} properties with codes`);
    
    // Step 4: If no codes, generate one for testing
    if (propertiesWithCodes.length === 0 && properties && properties.length > 0) {
      console.log('📋 Step 4: Generating test code...');
      
      const testProperty = properties[0];
      const testCode = 'TEST01'; // Simple test code
      
      // Update the property with a test code
      const updatedPropertyDetails = {
        ...testProperty.property_details,
        meta: {
          ...testProperty.property_details?.meta,
          code: testCode,
          codeGeneratedAt: new Date().toISOString()
        }
      };
      
      const { error: updateError } = await supabase
        .from('properties_v2')
        .update({
          property_details: updatedPropertyDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', testProperty.id);
      
      if (updateError) {
        console.error('❌ Error updating property with test code:', updateError);
        return { step: 4, error: updateError };
      }
      
      console.log(`✅ Added test code "${testCode}" to property ${testProperty.id}`);
      propertiesWithCodes = [{ ...testProperty, property_details: updatedPropertyDetails }];
    }
    
    // Step 5: Test the database function if we have a code
    if (propertiesWithCodes.length > 0) {
      console.log('📋 Step 5: Testing database function...');
      
      const testCode = propertiesWithCodes[0].property_details.meta.code;
      console.log(`🔍 Testing with code: ${testCode}`);
      
      // First, let's test if the function exists with a simple call
      try {
        const { data: functionTest, error: functionError } = await supabase
          .rpc('search_property_by_code', { p_code: testCode });
        
        if (functionError) {
          console.error('❌ Database function error:', functionError);
          
          // Check if it's a "function does not exist" error
          if (functionError.message.includes('function') && functionError.message.includes('does not exist')) {
            console.log('💡 The search_property_by_code function does not exist in the database');
            console.log('📝 You need to add this function to your Supabase database');
            return { 
              step: 5, 
              error: functionError, 
              solution: 'Add the search_property_by_code function to your database' 
            };
          }
          
          return { step: 5, error: functionError };
        }
        
        console.log(`✅ Database function returned ${functionTest?.length || 0} results`);
        
        if (functionTest && functionTest.length > 0) {
          console.log('📄 Sample result structure:');
          console.log(JSON.stringify(functionTest[0], null, 2));
        }
        
        return {
          success: true,
          testCode,
          propertiesTotal: properties?.length || 0,
          propertiesWithCodes: propertiesWithCodes.length,
          functionResults: functionTest?.length || 0
        };
        
      } catch (functionError) {
        console.error('❌ Exception calling database function:', functionError);
        return { step: 5, error: functionError };
      }
    }
    
    return {
      success: true,
      propertiesTotal: properties?.length || 0,
      propertiesWithCodes: propertiesWithCodes.length,
      note: 'No properties with codes found'
    };
    
  } catch (error) {
    console.error('❌ Error in simpleTest:', error);
    return { error };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).simpleTest = simpleTest;
}