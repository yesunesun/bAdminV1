import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunctions() {
  console.log('🔍 Checking search functions...');
  
  // Test search_residential_properties
  try {
    const { data, error } = await supabase.rpc('search_residential_properties', { p_limit: 1 });
    if (error) {
      console.log('❌ search_residential_properties:', error.message);
    } else {
      console.log('✅ search_residential_properties: Works!');
    }
  } catch (e) {
    console.log('❌ search_residential_properties: Exception -', e.message);
  }
  
  // Test search_commercial_properties
  try {
    const { data, error } = await supabase.rpc('search_commercial_properties', { p_limit: 1 });
    if (error) {
      console.log('❌ search_commercial_properties:', error.message);
    } else {
      console.log('✅ search_commercial_properties: Works!');
    }
  } catch (e) {
    console.log('❌ search_commercial_properties: Exception -', e.message);
  }
  
  // Test search_land_properties
  try {
    const { data, error } = await supabase.rpc('search_land_properties', { p_limit: 1 });
    if (error) {
      console.log('❌ search_land_properties:', error.message);
    } else {
      console.log('✅ search_land_properties: Works!');
    }
  } catch (e) {
    console.log('❌ search_land_properties: Exception -', e.message);
  }
  
  // Test search_all_properties
  try {
    const { data, error } = await supabase.rpc('search_all_properties', { p_limit: 1 });
    if (error) {
      console.log('❌ search_all_properties:', error.message);
    } else {
      console.log('✅ search_all_properties: Works! Got', data?.length || 0, 'results');
    }
  } catch (e) {
    console.log('❌ search_all_properties: Exception -', e.message);
  }
}

checkFunctions();