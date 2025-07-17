import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createSearchCommercialProperties() {
  const sql = `
CREATE OR REPLACE FUNCTION public.search_commercial_properties(
    p_subtype text DEFAULT NULL::text, 
    p_property_subtype text DEFAULT NULL::text, 
    p_search_query text DEFAULT NULL::text, 
    p_min_price numeric DEFAULT NULL::numeric, 
    p_max_price numeric DEFAULT NULL::numeric, 
    p_city text DEFAULT NULL::text, 
    p_state text DEFAULT NULL::text, 
    p_area_min numeric DEFAULT NULL::numeric, 
    p_area_max numeric DEFAULT NULL::numeric, 
    p_limit integer DEFAULT 50, 
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid, 
    owner_id uuid, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    property_type text, 
    flow_type text, 
    subtype text, 
    total_count bigint, 
    title text, 
    price numeric, 
    city text, 
    state text, 
    area numeric, 
    owner_email text, 
    status text, 
    bedrooms integer, 
    bathrooms numeric, 
    area_unit text, 
    land_type text, 
    primary_image text, 
    latitude numeric, 
    longitude numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        'commercial'::text as property_type,
        (p.property_details->>'flow'->>'flowType')::text as flow_type,
        (p.property_details->>'flow'->>'category')::text as subtype,
        COUNT(*) OVER() as total_count,
        (p.property_details->>'flow'->>'title')::text as title,
        COALESCE(
            (p.property_details#>>'{steps,com_rent_rental,rentAmount}')::numeric,
            (p.property_details#>>'{steps,com_sale_sale_details,expectedPrice}')::numeric
        ) as price,
        (p.property_details#>>'{steps,com_rent_location,city}')::text as city,
        (p.property_details#>>'{steps,com_rent_location,state}')::text as state,
        (p.property_details#>>'{steps,com_rent_basic_details,builtUpArea}')::numeric as area,
        auth.email as owner_email,
        p.status,
        NULL::integer as bedrooms,
        NULL::numeric as bathrooms,
        (p.property_details#>>'{steps,com_rent_basic_details,builtUpAreaUnit}')::text as area_unit,
        NULL::text as land_type,
        NULL::text as primary_image,
        (p.coordinates->>'lat')::numeric as latitude,
        (p.coordinates->>'lng')::numeric as longitude
    FROM properties_v2 p
    JOIN auth.users auth ON p.owner_id = auth.id
    WHERE 
        (p.property_details->>'flow'->>'category') = 'commercial'
        AND (p_subtype IS NULL OR (p.property_details->>'flow'->>'listingType') = p_subtype)
        AND (p_property_subtype IS NULL OR (p.property_details#>>'{steps,com_rent_basic_details,propertyType}') = p_property_subtype)
        AND (p_search_query IS NULL OR (p.property_details->>'flow'->>'title') ILIKE '%' || p_search_query || '%')
        AND (p_city IS NULL OR (p.property_details#>>'{steps,com_rent_location,city}') ILIKE '%' || p_city || '%')
        AND (p_state IS NULL OR (p.property_details#>>'{steps,com_rent_location,state}') ILIKE '%' || p_state || '%')
        AND (p_min_price IS NULL OR COALESCE(
            (p.property_details#>>'{steps,com_rent_rental,rentAmount}')::numeric,
            (p.property_details#>>'{steps,com_sale_sale_details,expectedPrice}')::numeric
        ) >= p_min_price)
        AND (p_max_price IS NULL OR COALESCE(
            (p.property_details#>>'{steps,com_rent_rental,rentAmount}')::numeric,
            (p.property_details#>>'{steps,com_sale_sale_details,expectedPrice}')::numeric
        ) <= p_max_price)
        AND (p_area_min IS NULL OR (p.property_details#>>'{steps,com_rent_basic_details,builtUpArea}')::numeric >= p_area_min)
        AND (p_area_max IS NULL OR (p.property_details#>>'{steps,com_rent_basic_details,builtUpArea}')::numeric <= p_area_max)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_commercial_properties TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_commercial_properties TO anon;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    console.log('✅ search_commercial_properties function created');
    return true;
  } catch (error) {
    console.error('❌ Error creating search_commercial_properties:', error.message);
    return false;
  }
}

async function createSearchLandProperties() {
  const sql = `
CREATE OR REPLACE FUNCTION public.search_land_properties(
    p_property_subtype text DEFAULT NULL::text,
    p_search_query text DEFAULT NULL::text, 
    p_min_price numeric DEFAULT NULL::numeric,
    p_max_price numeric DEFAULT NULL::numeric,
    p_city text DEFAULT NULL::text,
    p_state text DEFAULT NULL::text,
    p_area_min numeric DEFAULT NULL::numeric,
    p_area_max numeric DEFAULT NULL::numeric,
    p_limit integer DEFAULT 50,
    p_offset integer DEFAULT 0
)
RETURNS TABLE(
    id uuid, 
    owner_id uuid, 
    created_at timestamp with time zone, 
    updated_at timestamp with time zone, 
    property_type text, 
    flow_type text, 
    subtype text, 
    total_count bigint, 
    title text, 
    price numeric, 
    city text, 
    state text, 
    area numeric, 
    owner_email text, 
    status text, 
    bedrooms integer, 
    bathrooms numeric, 
    area_unit text, 
    land_type text, 
    primary_image text, 
    latitude numeric, 
    longitude numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.owner_id,
        p.created_at,
        p.updated_at,
        'land'::text as property_type,
        (p.property_details->>'flow'->>'flowType')::text as flow_type,
        (p.property_details->>'flow'->>'category')::text as subtype,
        COUNT(*) OVER() as total_count,
        (p.property_details->>'flow'->>'title')::text as title,
        (p.property_details#>>'{steps,land_sale_sale_details,expectedPrice}')::numeric as price,
        (p.property_details#>>'{steps,land_sale_location,city}')::text as city,
        (p.property_details#>>'{steps,land_sale_location,state}')::text as state,
        (p.property_details#>>'{steps,land_sale_basic_details,plotArea}')::numeric as area,
        auth.email as owner_email,
        p.status,
        NULL::integer as bedrooms,
        NULL::numeric as bathrooms,
        (p.property_details#>>'{steps,land_sale_basic_details,plotAreaUnit}')::text as area_unit,
        (p.property_details#>>'{steps,land_sale_basic_details,landType}')::text as land_type,
        NULL::text as primary_image,
        (p.coordinates->>'lat')::numeric as latitude,
        (p.coordinates->>'lng')::numeric as longitude
    FROM properties_v2 p
    JOIN auth.users auth ON p.owner_id = auth.id
    WHERE 
        (p.property_details->>'flow'->>'category') = 'land'
        AND (p_property_subtype IS NULL OR (p.property_details#>>'{steps,land_sale_basic_details,landType}') = p_property_subtype)
        AND (p_search_query IS NULL OR (p.property_details->>'flow'->>'title') ILIKE '%' || p_search_query || '%')
        AND (p_city IS NULL OR (p.property_details#>>'{steps,land_sale_location,city}') ILIKE '%' || p_city || '%')
        AND (p_state IS NULL OR (p.property_details#>>'{steps,land_sale_location,state}') ILIKE '%' || p_state || '%')
        AND (p_min_price IS NULL OR (p.property_details#>>'{steps,land_sale_sale_details,expectedPrice}')::numeric >= p_min_price)
        AND (p_max_price IS NULL OR (p.property_details#>>'{steps,land_sale_sale_details,expectedPrice}')::numeric <= p_max_price)
        AND (p_area_min IS NULL OR (p.property_details#>>'{steps,land_sale_basic_details,plotArea}')::numeric >= p_area_min)
        AND (p_area_max IS NULL OR (p.property_details#>>'{steps,land_sale_basic_details,plotArea}')::numeric <= p_area_max)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_land_properties TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_land_properties TO anon;
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    if (error) throw error;
    console.log('✅ search_land_properties function created');
    return true;
  } catch (error) {
    console.error('❌ Error creating search_land_properties:', error.message);
    return false;
  }
}

async function deployUpdatedSearchAllProperties() {
  const functionSQL = fs.readFileSync('./kb/sql_testing/search_all_properties.sql', 'utf8');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: functionSQL });
    if (error) throw error;
    console.log('✅ search_all_properties function updated');
    return true;
  } catch (error) {
    console.error('❌ Error updating search_all_properties:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Creating search functions manually...');
  
  // Create individual functions
  console.log('📝 Creating search_commercial_properties...');
  await createSearchCommercialProperties();
  
  console.log('📝 Creating search_land_properties...');
  await createSearchLandProperties();
  
  // Update the main function
  console.log('📝 Updating search_all_properties...');
  await deployUpdatedSearchAllProperties();
  
  console.log('🎉 All functions created/updated!');
  console.log('✅ Ready to run tests again');
}

main().catch(console.error);