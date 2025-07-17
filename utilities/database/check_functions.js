import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunctions() {
  try {
    // Check what functions are available
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .like('proname', '%search%');
    
    if (error) {
      console.error('Error checking functions:', error);
      return;
    }
    
    console.log('Available search functions:');
    data.forEach(func => console.log(' -', func.proname));
    
    // Try to call search_all_properties with minimal parameters
    console.log('\n🔍 Testing search_all_properties...');
    const { data: testData, error: testError } = await supabase.rpc('search_all_properties', {
      p_limit: 5
    });
    
    if (testError) {
      console.error('Error calling search_all_properties:', testError);
    } else {
      console.log('✅ search_all_properties works! Returned', testData?.length || 0, 'rows');
    }
    
  } catch (error) {
    console.error('Exception:', error);
  }
}

checkFunctions();