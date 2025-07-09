// src/scripts/generatePropertyCodes.ts
// Purpose: Generate property codes for existing properties that don't have codes

import { supabase } from '@/lib/supabase';
import { generatePropertyCode } from '@/lib/utils';

/**
 * Generates property codes for all existing properties that don't have codes
 * This is a one-time migration script to backfill property codes
 */
export async function generateCodesForExistingProperties() {
  try {
    console.log('🔄 Starting property code generation for existing properties...');
    
    // Get all properties that don't have codes
    const { data: properties, error } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .or('property_details->meta->code.is.null,property_details->meta->code.eq.""')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Error fetching properties:', error);
      throw error;
    }
    
    if (!properties || properties.length === 0) {
      console.log('✅ No properties found without codes. All properties already have codes.');
      return;
    }
    
    console.log(`📊 Found ${properties.length} properties without codes. Generating codes...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Process properties in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(properties.length / batchSize)}...`);
      
      const promises = batch.map(async (property) => {
        try {
          // Generate code for this property
          const propertyCode = await generatePropertyCode(property.id, property);
          
          // Update the property details with the generated code
          const updatedPropertyDetails = {
            ...property.property_details,
            meta: {
              ...property.property_details.meta,
              code: propertyCode,
              codeGeneratedAt: new Date().toISOString()
            }
          };
          
          // Update the property in the database
          const { error: updateError } = await supabase
            .from('properties_v2')
            .update({
              property_details: updatedPropertyDetails,
              updated_at: new Date().toISOString()
            })
            .eq('id', property.id);
          
          if (updateError) {
            console.error(`❌ Error updating property ${property.id}:`, updateError);
            errorCount++;
          } else {
            console.log(`✅ Generated code for property ${property.id}: ${propertyCode}`);
            successCount++;
          }
        } catch (error) {
          console.error(`❌ Error processing property ${property.id}:`, error);
          errorCount++;
        }
      });
      
      // Wait for all promises in this batch to complete
      await Promise.all(promises);
      
      // Brief pause between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Property code generation complete!`);
    console.log(`✅ Successfully generated codes for ${successCount} properties`);
    console.log(`❌ Failed to generate codes for ${errorCount} properties`);
    
    return {
      success: successCount,
      errors: errorCount,
      total: properties.length
    };
    
  } catch (error) {
    console.error('❌ Error in generateCodesForExistingProperties:', error);
    throw error;
  }
}

/**
 * Verify that all properties have codes
 */
export async function verifyPropertyCodes() {
  try {
    console.log('🔍 Verifying property codes...');
    
    const { data: propertiesWithoutCodes, error: withoutError } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .or('property_details->meta->code.is.null,property_details->meta->code.eq.""');
    
    if (withoutError) {
      console.error('❌ Error checking properties without codes:', withoutError);
      return;
    }
    
    const { data: propertiesWithCodes, error: withError } = await supabase
      .from('properties_v2')
      .select('id, property_details->meta->code')
      .not('property_details->meta->code', 'is', null)
      .neq('property_details->meta->code', '');
    
    if (withError) {
      console.error('❌ Error checking properties with codes:', withError);
      return;
    }
    
    console.log(`📊 Properties without codes: ${propertiesWithoutCodes?.length || 0}`);
    console.log(`📊 Properties with codes: ${propertiesWithCodes?.length || 0}`);
    
    if (propertiesWithoutCodes?.length === 0) {
      console.log('✅ All properties have codes!');
    } else {
      console.log('⚠️  Some properties are missing codes. Consider running the generation script.');
    }
    
    return {
      withoutCodes: propertiesWithoutCodes?.length || 0,
      withCodes: propertiesWithCodes?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Error in verifyPropertyCodes:', error);
    throw error;
  }
}

// If this script is run directly, execute the generation
if (typeof window === 'undefined' && require.main === module) {
  generateCodesForExistingProperties()
    .then(() => {
      console.log('✅ Property code generation completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Property code generation failed:', error);
      process.exit(1);
    });
}