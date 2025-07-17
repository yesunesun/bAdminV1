import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBasicQuery() {
  console.log('Testing basic query...');
  
  // Test 1: Try to get basic property count
  try {
    const { data, error } = await supabase
      .from('properties_v2')
      .select('id, status')
      .neq('status', 'deleted')
      .limit(5);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('✅ Basic query successful');
    console.log('Sample data:', data);
    
    // Test 2: Try calling search_all_properties function (the actual function name)
    const { data: searchData, error: searchError } = await supabase
      .rpc('search_all_properties', {
        p_search_query: null,
        p_city: null,
        p_state: null,
        p_property_type: null,
        p_subtype: null,
        p_property_subtype: null,
        p_min_price: null,
        p_max_price: null,
        p_bedrooms: null,
        p_bathrooms: null,
        p_area_min: null,
        p_area_max: null,
        p_limit: 10,
        p_offset: 0
      });
    
    if (searchError) {
      console.error('Search function error:', searchError);
      return;
    }
    
    console.log('✅ Search function successful');
    console.log('Search results count:', searchData?.length || 0);
    if (searchData && searchData.length > 0) {
      console.log('Sample search result:', searchData[0]);
    }
    
  } catch (err) {
    console.error('Exception:', err);
  }
}

testBasicQuery();