// Direct database query test for property code search
import { supabase } from '@/lib/supabase';

export async function testDirectDbQuery() {
  console.log('🔍 Testing direct database query for property code search...');
  
  try {
    // First, let's see what properties exist with codes
    console.log('📋 Step 1: Checking properties with codes...');
    
    const { data: propertiesWithCodes, error: propertiesError } = await supabase
      .from('properties_v2')
      .select('id, property_details, created_at, status')
      .not('property_details->meta->code', 'is', null)
      .neq('property_details->meta->code', '')
      .limit(3);
    
    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }
    
    if (!propertiesWithCodes || propertiesWithCodes.length === 0) {
      console.log('⚠️  No properties found with codes. Let\'s generate some...');
      
      // Generate codes for some properties
      const { data: allProperties, error: allError } = await supabase
        .from('properties_v2')
        .select('id, property_details')
        .limit(3);
      
      if (allError || !allProperties || allProperties.length === 0) {
        console.log('❌ No properties found at all');
        return;
      }
      
      console.log(`📦 Found ${allProperties.length} properties. Generating codes...`);
      
      // Generate codes for these properties
      const { generatePropertyCode } = await import('@/lib/utils');
      
      for (const property of allProperties) {
        try {
          const code = await generatePropertyCode(property.id, property);
          console.log(`✅ Generated code for ${property.id}: ${code}`);
        } catch (error) {
          console.error(`❌ Error generating code for ${property.id}:`, error);
        }
      }
      
      // Re-fetch properties with codes
      const { data: newPropertiesWithCodes, error: newError } = await supabase
        .from('properties_v2')
        .select('id, property_details, created_at, status')
        .not('property_details->meta->code', 'is', null)
        .neq('property_details->meta->code', '')
        .limit(3);
      
      if (newError || !newPropertiesWithCodes || newPropertiesWithCodes.length === 0) {
        console.log('❌ Still no properties with codes after generation');
        return;
      }
      
      console.log(`✅ Now found ${newPropertiesWithCodes.length} properties with codes`);
      propertiesWithCodes.push(...newPropertiesWithCodes);
    }
    
    console.log(`✅ Found ${propertiesWithCodes.length} properties with codes`);
    
    // Show the codes
    propertiesWithCodes.forEach((prop, index) => {
      const code = prop.property_details?.meta?.code;
      console.log(`${index + 1}. Property ${prop.id} - Code: ${code}`);
    });
    
    // Now test the database function
    console.log('\n📋 Step 2: Testing database function...');
    
    const testCode = propertiesWithCodes[0].property_details?.meta?.code;
    if (!testCode) {
      console.log('❌ No test code available');
      return;
    }
    
    console.log(`🔍 Testing with code: ${testCode}`);
    
    // Test the database function
    const { data: dbResults, error: dbError } = await supabase
      .rpc('search_property_by_code', { p_code: testCode });
    
    if (dbError) {
      console.error('❌ Database function error:', dbError);
      
      // If function doesn't exist, let's check what functions are available
      if (dbError.message.includes('function') && dbError.message.includes('does not exist')) {
        console.log('💡 Function doesn\'t exist. Let\'s check available functions...');
        
        // Try to get available functions
        const { data: functions, error: funcError } = await supabase
          .rpc('pg_get_functiondef', { funcid: 'search_property_by_code'::regprocedure });
        
        if (funcError) {
          console.log('❌ Could not get function definition:', funcError);
        } else {
          console.log('✅ Function definition found:', functions);
        }
      }
      
      return;
    }
    
    console.log(`✅ Database function returned ${dbResults?.length || 0} results`);
    
    if (dbResults && dbResults.length > 0) {
      console.log('📄 First result structure:');
      console.log(JSON.stringify(dbResults[0], null, 2));
    }
    
    // Test the search service
    console.log('\n📋 Step 3: Testing search service...');
    
    const { searchService } = await import('@/components/Search/services/searchService');
    
    try {
      const serviceResults = await searchService.searchByCode(testCode);
      console.log(`✅ Search service returned ${serviceResults.results.length} results`);
      
      if (serviceResults.results.length > 0) {
        console.log('📄 First service result structure:');
        console.log(JSON.stringify(serviceResults.results[0], null, 2));
      }
      
      // Test smart search
      const smartResults = await searchService.smartSearch({ searchQuery: testCode });
      console.log(`✅ Smart search returned ${smartResults.results.length} results`);
      
      return {
        success: true,
        testCode,
        propertiesWithCodes: propertiesWithCodes.length,
        dbResults: dbResults?.length || 0,
        serviceResults: serviceResults.results.length,
        smartResults: smartResults.results.length
      };
      
    } catch (serviceError) {
      console.error('❌ Search service error:', serviceError);
      return {
        success: false,
        testCode,
        propertiesWithCodes: propertiesWithCodes.length,
        dbResults: dbResults?.length || 0,
        serviceError
      };
    }
    
  } catch (error) {
    console.error('❌ Error in testDirectDbQuery:', error);
    return { error };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testDirectDbQuery = testDirectDbQuery;
}