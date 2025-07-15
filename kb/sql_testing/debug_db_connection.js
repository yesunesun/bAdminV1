import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugDatabaseConnection() {
  console.log('🔍 Debugging Database Connection...\n');
  
  // Check basic connection
  try {
    const { data, error } = await supabase.from('properties_v2').select('count').limit(1);
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }
    console.log('✅ Database connection successful');
  } catch (err) {
    console.log('❌ Database connection error:', err.message);
    return;
  }
  
  // Check if function exists by querying pg_proc
  try {
    console.log('\n🔍 Checking for search_all_properties function...');
    const { data, error } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            p.proname as function_name,
            p.proargnames as argument_names,
            p.proargtypes as argument_types,
            n.nspname as schema_name
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE p.proname = 'search_all_properties'
          AND n.nspname = 'public';
        `
      });
    
    if (error) {
      console.log('❌ Error checking function:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ Function found:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Function not found in public schema');
    }
  } catch (err) {
    console.log('❌ Error querying function:', err.message);
  }
  
  // Try alternative approach - direct RPC call
  try {
    console.log('\n🔍 Testing direct RPC call...');
    const { data, error } = await supabase.rpc('search_all_properties', {
      p_limit: 5,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ Direct RPC call failed:', error.message);
    } else {
      console.log('✅ Direct RPC call successful!');
      console.log(`📊 Returned ${data ? data.length : 0} results`);
    }
  } catch (err) {
    console.log('❌ Direct RPC call error:', err.message);
  }
  
  // Try with explicit parameter naming
  try {
    console.log('\n🔍 Testing with explicit parameter naming...');
    const { data, error } = await supabase.rpc('search_all_properties', {
      p_search_query: null,
      p_city: null,
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
      p_limit: 5,
      p_offset: 0
    });
    
    if (error) {
      console.log('❌ Explicit parameter call failed:', error.message);
    } else {
      console.log('✅ Explicit parameter call successful!');
      console.log(`📊 Returned ${data ? data.length : 0} results`);
    }
  } catch (err) {
    console.log('❌ Explicit parameter call error:', err.message);
  }
  
  // List all available functions
  try {
    console.log('\n🔍 Listing all available RPC functions...');
    const { data, error } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            p.proname as function_name,
            n.nspname as schema_name
          FROM pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
          WHERE n.nspname = 'public'
          AND p.proname LIKE '%search%'
          ORDER BY p.proname;
        `
      });
    
    if (error) {
      console.log('❌ Error listing functions:', error.message);
    } else if (data && data.length > 0) {
      console.log('✅ Search-related functions found:');
      data.forEach(func => {
        console.log(`  - ${func.schema_name}.${func.function_name}`);
      });
    } else {
      console.log('❌ No search-related functions found');
    }
  } catch (err) {
    console.log('❌ Error listing functions:', err.message);
  }
}

debugDatabaseConnection().catch(console.error);