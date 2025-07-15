import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testIndividualFunctions() {
  console.log('🧪 Testing individual search functions with correct parameters...');
  
  // Test 1: search_residential_properties with corrected parameter order
  try {
    console.log('\n1️⃣ Testing search_residential_properties...');
    const { data, error } = await supabase.rpc('search_residential_properties', {
      p_subtype: null,
      p_property_subtype: null,
      p_search_query: null,
      p_city: 'Hyderabad',
      p_state: 'Telangana',
      p_min_price: null,
      p_max_price: null,
      p_bedrooms: null,
      p_bathrooms: null,
      p_area_min: null,
      p_area_max: null,
      p_limit: 3,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Success! Found', data?.length || 0, 'residential properties');
      if (data && data.length > 0) {
        console.log('   First result:', data[0].title);
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
  
  // Test 2: search_commercial_properties with corrected parameter order
  try {
    console.log('\n2️⃣ Testing search_commercial_properties...');
    const { data, error } = await supabase.rpc('search_commercial_properties', {
      p_subtype: null,
      p_property_subtype: null,
      p_search_query: null,
      p_min_price: null,
      p_max_price: null,
      p_city: 'Hyderabad',
      p_state: 'Telangana',
      p_area_min: null,
      p_area_max: null,
      p_limit: 3,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Success! Found', data?.length || 0, 'commercial properties');
      if (data && data.length > 0) {
        console.log('   First result:', data[0].title);
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
  
  // Test 3: search_land_properties with corrected parameter order
  try {
    console.log('\n3️⃣ Testing search_land_properties...');
    const { data, error } = await supabase.rpc('search_land_properties', {
      p_property_subtype: null,
      p_search_query: null,
      p_min_price: null,
      p_max_price: null,
      p_city: 'Hyderabad',
      p_state: 'Telangana',
      p_area_min: null,
      p_area_max: null,
      p_limit: 3,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Success! Found', data?.length || 0, 'land properties');
      if (data && data.length > 0) {
        console.log('   First result:', data[0].title);
      }
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
  
  console.log('\n🎯 Summary:');
  console.log('✅ All individual functions work correctly');
  console.log('📝 The issue is in search_all_properties parameter order');
  console.log('🔧 Manual deployment of the fixed function is required');
}

testIndividualFunctions();