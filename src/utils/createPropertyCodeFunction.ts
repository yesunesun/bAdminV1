// Utility to create the property code search function in the database
import { supabase } from '@/lib/supabase';

export async function createPropertyCodeSearchFunction() {
  console.log('🔄 Creating property code search function...');
  
  try {
    // First, create the helper function for safe numeric conversion
    const helperFunction = `
      CREATE OR REPLACE FUNCTION public.safe_numeric(input_text text)
      RETURNS numeric
      LANGUAGE plpgsql
      IMMUTABLE
      AS $$
      BEGIN
          -- Handle null/empty input
          IF input_text IS NULL OR trim(input_text) = '' THEN
              RETURN NULL;
          END IF;
          
          -- Try to convert to numeric
          BEGIN
              RETURN input_text::numeric;
          EXCEPTION WHEN OTHERS THEN
              RETURN NULL;
          END;
      END;
      $$;
    `;
    
    console.log('📝 Creating helper function...');
    const { error: helperError } = await supabase.rpc('exec_sql', { sql: helperFunction });
    
    if (helperError) {
      console.error('❌ Error creating helper function:', helperError);
      // Continue anyway - function might already exist
    } else {
      console.log('✅ Helper function created successfully');
    }
    
    // Now create the main search function
    const searchFunction = `
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
              
              -- Determine property type based on flow_type
              CASE 
                  WHEN COALESCE(
                      p.property_details->'flow'->>'category',
                      'residential'
                  ) = 'residential' THEN 'residential'
                  WHEN COALESCE(
                      p.property_details->'flow'->>'category',
                      'residential'
                  ) = 'commercial' THEN 'commercial'
                  WHEN COALESCE(
                      p.property_details->'flow'->>'category',
                      'residential'
                  ) = 'land' THEN 'land'
                  ELSE 'residential'
              END::TEXT as property_type,
              
              -- Flow type
              COALESCE(
                  p.property_details->'flow'->>'category',
                  'residential'
              ) || '_' || COALESCE(
                  p.property_details->'flow'->>'listingType',
                  'rent'
              ) as flow_type,
              
              -- Subtype based on listing type
              COALESCE(
                  p.property_details->'flow'->>'listingType',
                  'rent'
              )::TEXT as subtype,
              
              v_total_count as total_count,
              
              -- Title - try different possible locations
              COALESCE(
                  p.property_details->'steps'->'res_rent_basic_details'->>'title',
                  p.property_details->'steps'->'res_sale_basic_details'->>'title',
                  p.property_details->'steps'->'com_rent_basic_details'->>'title',
                  p.property_details->'steps'->'com_sale_basic_details'->>'title',
                  p.property_details->'steps'->'land_sale_basic_details'->>'title',
                  'Property'
              )::TEXT as title,
              
              -- Price - try different possible locations
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
              )::TEXT as city,
              
              -- State
              COALESCE(
                  p.property_details->'steps'->'res_rent_location'->>'state',
                  p.property_details->'steps'->'res_sale_location'->>'state',
                  p.property_details->'steps'->'com_rent_location'->>'state',
                  p.property_details->'steps'->'com_sale_location'->>'state',
                  p.property_details->'steps'->'land_sale_location'->>'state',
                  'Unknown'
              )::TEXT as state,
              
              -- Area
              COALESCE(
                  (p.property_details->'steps'->'res_rent_basic_details'->>'squareFootage')::numeric,
                  (p.property_details->'steps'->'res_sale_basic_details'->>'squareFootage')::numeric,
                  (p.property_details->'steps'->'com_rent_basic_details'->>'area')::numeric,
                  (p.property_details->'steps'->'com_sale_basic_details'->>'area')::numeric,
                  (p.property_details->'steps'->'land_sale_basic_details'->>'area')::numeric,
                  0
              ) as area,
              
              prof.email::TEXT as owner_email,
              COALESCE(p.status, 'active')::TEXT as status,
              
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
              
              'sq_ft'::TEXT as area_unit,
              
              -- Land type (only for land properties)
              CASE 
                  WHEN COALESCE(p.property_details->'flow'->>'category', 'residential') = 'land' THEN
                      COALESCE(
                          p.property_details->'steps'->'land_sale_basic_details'->>'landType',
                          'residential'
                      )
                  ELSE NULL
              END::TEXT as land_type,
              
              -- Primary image
              COALESCE(
                  p.property_details->'media'->'photos'->'images'->0->>'url',
                  p.property_details->'steps'->'image_upload'->>'primaryImage',
                  ''
              )::TEXT as primary_image,
              
              -- Property code from meta
              p.property_details->'meta'->>'code'::TEXT as code
              
          FROM properties_v2 p
          LEFT JOIN profiles prof ON p.owner_id = prof.id
          WHERE p.status IS DISTINCT FROM 'deleted'
            AND p.property_details->'meta'->>'code' = p_code
          ORDER BY p.created_at DESC;
          
      END;
      $$;
    `;
    
    console.log('📝 Creating search function...');
    const { error: searchError } = await supabase.rpc('exec_sql', { sql: searchFunction });
    
    if (searchError) {
      console.error('❌ Error creating search function:', searchError);
      throw searchError;
    }
    
    console.log('✅ Search function created successfully');
    
    // Create the case-insensitive version
    const insensitiveFunction = `
      CREATE OR REPLACE FUNCTION public.search_property_by_code_insensitive(p_code text)
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
      BEGIN
          -- Validate input
          IF p_code IS NULL OR trim(p_code) = '' THEN
              RAISE EXCEPTION 'Property code cannot be null or empty';
          END IF;

          -- Call the main function with uppercase code for case-insensitive search
          RETURN QUERY
          SELECT * FROM search_property_by_code(UPPER(trim(p_code)));
          
      END;
      $$;
    `;
    
    console.log('📝 Creating case-insensitive search function...');
    const { error: insensitiveError } = await supabase.rpc('exec_sql', { sql: insensitiveFunction });
    
    if (insensitiveError) {
      console.error('❌ Error creating case-insensitive function:', insensitiveError);
      throw insensitiveError;
    }
    
    console.log('✅ Case-insensitive search function created successfully');
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error in createPropertyCodeSearchFunction:', error);
    throw error;
  }
}

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).createPropertyCodeSearchFunction = createPropertyCodeSearchFunction;
}