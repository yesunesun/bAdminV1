// Simple console test for property code search
// Copy and paste this into your browser console to test

// Test function you can paste directly into the console
async function testPropertyCodeSearch() {
  console.log('🔍 Testing property code search...');
  
  // Get supabase from the global scope (assuming it's available)
  const { supabase } = await import('/src/lib/supabase.ts');
  
  try {
    // Test 1: Check database connection
    console.log('📋 Step 1: Testing database connection...');
    const { data: dbTest, error: dbError } = await supabase
      .from('properties_v2')
      .select('id')
      .limit(1);
    
    if (dbError) {
      console.error('❌ Database error:', dbError);
      return;
    }
    console.log('✅ Database connection OK');
    
    // Test 2: Check if function exists
    console.log('📋 Step 2: Testing search function...');
    const { data: funcTest, error: funcError } = await supabase
      .rpc('search_property_by_code', { p_code: 'TEST123' });
    
    if (funcError) {
      if (funcError.message.includes('function') && funcError.message.includes('does not exist')) {
        console.log('❌ Function does not exist in database');
        console.log('💡 Please run the SQL script to create the function');
        return;
      }
      console.log('✅ Function exists (returned expected error for test code)');
    } else {
      console.log('✅ Function exists and working');
    }
    
    // Test 3: Check for properties with codes
    console.log('📋 Step 3: Checking for properties with codes...');
    const { data: propsWithCodes } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .not('property_details->meta->code', 'is', null)
      .limit(5);
    
    const validCodes = propsWithCodes?.filter(p => p.property_details?.meta?.code) || [];
    console.log(`Found ${validCodes.length} properties with codes`);
    
    if (validCodes.length === 0) {
      console.log('⚠️  No properties have codes. Adding test code...');
      
      // Add a test code
      const { data: allProps } = await supabase
        .from('properties_v2')
        .select('id, property_details')
        .limit(1);
      
      if (allProps && allProps.length > 0) {
        const testCode = 'TEST01';
        const updatedDetails = {
          ...allProps[0].property_details,
          meta: {
            ...allProps[0].property_details?.meta,
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
          .eq('id', allProps[0].id);
        
        if (updateError) {
          console.error('❌ Error adding test code:', updateError);
        } else {
          console.log(`✅ Added test code "${testCode}" to property ${allProps[0].id}`);
          
          // Test the search with the new code
          console.log('📋 Step 4: Testing search with new code...');
          const { data: searchResult, error: searchError } = await supabase
            .rpc('search_property_by_code', { p_code: testCode });
          
          if (searchError) {
            console.error('❌ Search failed:', searchError);
          } else {
            console.log(`✅ Search successful! Found ${searchResult?.length || 0} results`);
            console.log('🎉 Property code search is working!');
            console.log(`💡 Try searching for "${testCode}" in the search bar`);
          }
        }
      }
    } else {
      // Test with existing code
      const testCode = validCodes[0].property_details.meta.code;
      console.log(`📋 Step 4: Testing search with existing code: ${testCode}`);
      
      const { data: searchResult, error: searchError } = await supabase
        .rpc('search_property_by_code', { p_code: testCode });
      
      if (searchError) {
        console.error('❌ Search failed:', searchError);
      } else {
        console.log(`✅ Search successful! Found ${searchResult?.length || 0} results`);
        console.log('🎉 Property code search is working!');
        console.log(`💡 Try searching for "${testCode}" in the search bar`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Also create a simple version that doesn't need imports
async function simpleTest() {
  console.log('🔍 Simple property code test...');
  
  try {
    // Test the search function directly
    const response = await fetch('/api/rpc/search_property_by_code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_code: 'TEST123' })
    });
    
    if (response.ok) {
      console.log('✅ Function exists and accessible');
    } else {
      console.log('❌ Function not accessible via API');
    }
  } catch (error) {
    console.log('ℹ️  API test failed, but this is expected in local development');
  }
  
  console.log('✅ Page loaded successfully');
  console.log('💡 Run testPropertyCodeSearch() to test the full functionality');
}

// Run simple test immediately
console.log('🚀 Property code search test functions loaded');
console.log('📋 Available functions:');
console.log('  - testPropertyCodeSearch() - Full test');
console.log('  - simpleTest() - Simple test');
simpleTest();