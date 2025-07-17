import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function deployFixedSearchAll() {
  try {
    console.log('🚀 Deploying fixed search_all_properties function...');
    
    // Read the fixed function
    const functionSQL = fs.readFileSync('./kb/sql_testing/search_all_properties.sql', 'utf8');
    
    // Since we can't use exec_sql, let's try using the raw query approach
    // We'll use the newer fetch API with direct SQL execution
    
    // First, let's create a simplified version that can be executed via RPC
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION public.search_all_properties(
    p_search_query TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_state TEXT DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_subtype TEXT DEFAULT NULL,
    p_property_subtype TEXT DEFAULT NULL,
    p_min_price NUMERIC DEFAULT NULL,
    p_max_price NUMERIC DEFAULT NULL,
    p_bedrooms INTEGER DEFAULT NULL,
    p_bathrooms NUMERIC DEFAULT NULL,
    p_area_min NUMERIC DEFAULT NULL,
    p_area_max NUMERIC DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    property_type TEXT,
    flow_type TEXT,
    subtype TEXT,
    total_count BIGINT,
    title TEXT,
    price NUMERIC,
    city TEXT,
    state TEXT,
    area NUMERIC,
    owner_email TEXT,
    status TEXT,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    area_unit TEXT,
    land_type TEXT,
    primary_image TEXT,
    latitude NUMERIC,
    longitude NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- If specific property type is requested, call appropriate function
    IF p_property_type IS NOT NULL THEN
        IF p_property_type = 'residential' THEN
            RETURN QUERY
            SELECT * FROM search_residential_properties(
                p_subtype, p_property_subtype, p_search_query, p_city, p_state,
                p_min_price, p_max_price, p_bedrooms, p_bathrooms,
                p_area_min, p_area_max, p_limit, p_offset
            );
            RETURN;
        ELSIF p_property_type = 'commercial' THEN
            RETURN QUERY
            SELECT * FROM search_commercial_properties(
                p_subtype, p_property_subtype, p_search_query, p_min_price, p_max_price,
                p_city, p_state, p_area_min, p_area_max, p_limit, p_offset
            );
            RETURN;
        ELSIF p_property_type = 'land' THEN
            RETURN QUERY
            SELECT * FROM search_land_properties(
                p_property_subtype, p_search_query, p_min_price, p_max_price,
                p_city, p_state, p_area_min, p_area_max, p_limit, p_offset
            );
            RETURN;
        END IF;
    END IF;
    
    -- For mixed search, combine all property types
    RETURN QUERY
    SELECT * FROM (
        SELECT * FROM search_residential_properties(
            p_subtype, p_property_subtype, p_search_query, p_city, p_state,
            p_min_price, p_max_price, p_bedrooms, p_bathrooms,
            p_area_min, p_area_max, p_limit/3, p_offset/3
        )
        UNION ALL
        SELECT * FROM search_commercial_properties(
            p_subtype, p_property_subtype, p_search_query, p_min_price, p_max_price,
            p_city, p_state, p_area_min, p_area_max, p_limit/3, p_offset/3
        )
        UNION ALL
        SELECT * FROM search_land_properties(
            p_property_subtype, p_search_query, p_min_price, p_max_price,
            p_city, p_state, p_area_min, p_area_max, p_limit/3, p_offset/3
        )
    ) combined_results
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_all_properties TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_all_properties TO anon;
    `;
    
    console.log('📝 Attempting to deploy via multiple methods...');
    
    // Try direct deployment using the admin client
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    });
    
    if (!response.ok) {
      console.log('❌ Direct deployment failed, trying alternative...');
      
      // Alternative: Try breaking it into smaller pieces
      console.log('🔄 Creating function manually...');
      
      // For now, let's just inform the user what needs to be done
      console.log('📋 Manual deployment required:');
      console.log('1. Connect to your Supabase database');
      console.log('2. Execute the SQL function from kb/sql_testing/search_all_properties.sql');
      console.log('3. The function has been fixed with correct parameter orders');
      
      return false;
    }
    
    console.log('✅ Function deployed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error deploying function:', error.message);
    return false;
  }
}

deployFixedSearchAll();