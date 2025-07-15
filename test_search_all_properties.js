import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSearchAllProperties() {
  console.log('🔍 Testing search_all_properties function...');
  
  // Test 1: Basic call with minimal parameters
  console.log('\n1. Testing search_all_properties with minimal params...');
  try {
    const { data, error } = await supabase.rpc('search_all_properties', {
      p_limit: 10,
      p_offset: 0
    });
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Success! Returned', data?.length || 0, 'rows');
      if (data && data.length > 0) {
        console.log('Sample result:', {
          id: data[0].id,
          property_type: data[0].property_type,
          title: data[0].title,
          city: data[0].city,
          price: data[0].price
        });
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
  
  // Test 2: Test with all parameters
  console.log('\n2. Testing search_all_properties with all parameters...');
  try {
    const { data, error } = await supabase.rpc('search_all_properties', {
      p_search_query: null,
      p_city: 'Hyderabad',
      p_state: null,
      p_property_type: 'residential',
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
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Success! Returned', data?.length || 0, 'rows');
      if (data && data.length > 0) {
        console.log('Sample result:', {
          id: data[0].id,
          property_type: data[0].property_type,
          title: data[0].title,
          city: data[0].city,
          price: data[0].price
        });
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
  
  // Test 3: Test with city filter
  console.log('\n3. Testing search_all_properties with city filter...');
  try {
    const { data, error } = await supabase.rpc('search_all_properties', {
      p_city: 'Hyderabad',
      p_limit: 10,
      p_offset: 0
    });
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Success! Returned', data?.length || 0, 'rows');
      if (data && data.length > 0) {
        console.log('Property types found:', [...new Set(data.map(d => d.property_type))]);
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
  
  // Test 4: Test with property type filter
  console.log('\n4. Testing search_all_properties with property type filter...');
  try {
    const { data, error } = await supabase.rpc('search_all_properties', {
      p_property_type: 'residential',
      p_limit: 10,
      p_offset: 0
    });
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Success! Returned', data?.length || 0, 'rows');
      if (data && data.length > 0) {
        console.log('All results are residential:', data.every(d => d.property_type === 'residential'));
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testSearchAllProperties();