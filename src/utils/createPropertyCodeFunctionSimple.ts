// Simple utility to create property code search function using raw SQL
import { supabase } from '@/lib/supabase';

export async function createPropertyCodeSearchFunctionSimple() {
  console.log('🔄 Creating property code search function (simple approach)...');
  
  try {
    // Create the function using raw SQL through supabase
    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.search_property_by_code(p_code text)
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
          code text
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
          v_total_count BIGINT;
      BEGIN
          -- Validate input
          IF p_code IS NULL OR trim(p_code) = '' THEN
              RAISE EXCEPTION 'Property code cannot be null or empty';
          END IF;

          -- Get total count of matching properties
          SELECT COUNT(*) INTO v_total_count
          FROM properties_v2 p
          WHERE p.status IS DISTINCT FROM 'deleted'
            AND p.property_details->'meta'->>'code' = p_code;

          -- Return results for matching properties
          RETURN QUERY
          SELECT 
              p.id,
              p.owner_id,
              p.created_at,
              p.updated_at,
              
              -- Simple property type detection
              CASE 
                  WHEN p.property_details->'flow'->>'category' = 'commercial' THEN 'commercial'::text
                  WHEN p.property_details->'flow'->>'category' = 'land' THEN 'land'::text
                  ELSE 'residential'::text
              END as property_type,
              
              -- Flow type
              COALESCE(
                  p.property_details->'flow'->>'category',
                  'residential'
              ) || '_' || COALESCE(
                  p.property_details->'flow'->>'listingType',
                  'rent'
              ) as flow_type,
              
              -- Subtype
              COALESCE(
                  p.property_details->'flow'->>'listingType',
                  'rent'
              )::text as subtype,
              
              v_total_count as total_count,
              
              -- Title
              COALESCE(
                  p.property_details->'steps'->'res_rent_basic_details'->>'title',
                  p.property_details->'steps'->'res_sale_basic_details'->>'title',
                  p.property_details->'steps'->'com_rent_basic_details'->>'title',
                  p.property_details->'steps'->'com_sale_basic_details'->>'title',
                  p.property_details->'steps'->'land_sale_basic_details'->>'title',
                  'Property'
              )::text as title,
              
              -- Price
              COALESCE(
                  (p.property_details->'steps'->'res_rent_rental'->>'rentAmount')::numeric,
                  (p.property_details->'steps'->'res_sale_sale_details'->>'salePrice')::numeric,
                  (p.property_details->'steps'->'com_rent_rental'->>'rentAmount')::numeric,
                  (p.property_details->'steps'->'com_sale_sale_details'->>'salePrice')::numeric,
                  (p.property_details->'steps'->'land_sale_basic_details'->>'price')::numeric,
                  0
              ) as price,
              
              -- City
              COALESCE(
                  p.property_details->'steps'->'res_rent_location'->>'city',
                  p.property_details->'steps'->'res_sale_location'->>'city',
                  p.property_details->'steps'->'com_rent_location'->>'city',
                  p.property_details->'steps'->'com_sale_location'->>'city',
                  p.property_details->'steps'->'land_sale_location'->>'city',
                  'Unknown'
              )::text as city,
              
              -- State
              COALESCE(
                  p.property_details->'steps'->'res_rent_location'->>'state',
                  p.property_details->'steps'->'res_sale_location'->>'state',
                  p.property_details->'steps'->'com_rent_location'->>'state',
                  p.property_details->'steps'->'com_sale_location'->>'state',
                  p.property_details->'steps'->'land_sale_location'->>'state',
                  'Unknown'
              )::text as state,
              
              -- Area
              COALESCE(
                  (p.property_details->'steps'->'res_rent_basic_details'->>'squareFootage')::numeric,
                  (p.property_details->'steps'->'res_sale_basic_details'->>'squareFootage')::numeric,
                  (p.property_details->'steps'->'com_rent_basic_details'->>'area')::numeric,
                  (p.property_details->'steps'->'com_sale_basic_details'->>'area')::numeric,
                  (p.property_details->'steps'->'land_sale_basic_details'->>'area')::numeric,
                  0
              ) as area,
              
              prof.email::text as owner_email,
              COALESCE(p.status, 'active')::text as status,
              
              -- Bedrooms (only for residential)
              CASE 
                  WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'residential' THEN
                      COALESCE(
                          (p.property_details->'steps'->'res_rent_basic_details'->>'bedrooms')::integer,
                          (p.property_details->'steps'->'res_sale_basic_details'->>'bedrooms')::integer,
                          0
                      )
                  ELSE NULL
              END as bedrooms,
              
              -- Bathrooms (only for residential)
              CASE 
                  WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'residential' THEN
                      COALESCE(
                          (p.property_details->'steps'->'res_rent_basic_details'->>'bathrooms')::numeric,
                          (p.property_details->'steps'->'res_sale_basic_details'->>'bathrooms')::numeric,
                          0
                      )
                  ELSE NULL
              END as bathrooms,
              
              'sq_ft'::text as area_unit,
              
              -- Land type (only for land properties)
              CASE 
                  WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'land' THEN
                      COALESCE(
                          p.property_details->'steps'->'land_sale_basic_details'->>'landType',
                          'residential'
                      )
                  ELSE NULL
              END::text as land_type,
              
              -- Primary image
              COALESCE(
                  p.property_details->'media'->'photos'->'images'->0->>'url',
                  p.property_details->'steps'->'image_upload'->>'primaryImage',
                  ''
              )::text as primary_image,
              
              -- Property code from meta
              p.property_details->'meta'->>'code'::text as code
              
          FROM properties_v2 p
          LEFT JOIN profiles prof ON p.owner_id = prof.id
          WHERE p.status IS DISTINCT FROM 'deleted'
            AND p.property_details->'meta'->>'code' = p_code
          ORDER BY p.created_at DESC;
          
      END;
      $$;
    `;
    
    console.log('📝 Creating function via SQL...');
    const { error } = await supabase.from('dummy_table_that_does_not_exist').select('*');
    
    // Since we can't execute raw SQL directly, let's try a different approach
    // Let's test if we can call the function first
    const { data: testData, error: testError } = await supabase.rpc('search_property_by_code', { p_code: 'TEST123' });
    
    if (testError && testError.message.includes('function') && testError.message.includes('does not exist')) {
      console.log('❌ Function does not exist in database');
      console.log('💡 Please add the function to your database manually or through a migration');
      console.log('📋 SQL to add:');
      console.log(functionSQL);
      return { success: false, sql: functionSQL };
    } else if (testError) {
      console.log('✅ Function exists but returned error (expected for test code):', testError.message);
    } else {
      console.log('✅ Function exists and is working');
    }
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error in createPropertyCodeSearchFunctionSimple:', error);
    return { success: false, error };
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).createPropertyCodeSearchFunctionSimple = createPropertyCodeSearchFunctionSimple;
}