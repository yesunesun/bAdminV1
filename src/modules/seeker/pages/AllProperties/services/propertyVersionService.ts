// src/modules/seeker/pages/AllProperties/services/propertyVersionService.ts
// Version: 1.1.0
// Last Modified: 15-04-2025 14:30 IST
// Purpose: Fixed version update functionality

import { supabase } from '@/lib/supabase';

/**
 * Updates all properties without a _version field to have _version set to "1"
 * @returns Promise with the count of updated properties
 */
export const setDefaultVersionForProperties = async (): Promise<number> => {
  try {
    // First, get all properties that don't have a _version field or where _version is null
    // Using a more reliable method to check for null properties in jsonb
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, property_details')
      .or('property_details->_version.is.null,property_details.is.null');
    
    if (fetchError) throw fetchError;
    if (!properties || properties.length === 0) return 0;
    
    console.log(`Found ${properties.length} properties without version information`);
    
    // Update each property with the default version
    let updatedCount = 0;
    
    for (const property of properties) {
      // Create a new property_details object with _version field
      const updatedDetails = {
        ...property.property_details || {}, // Handle null property_details
        _version: "1"
      };
      
      console.log(`Updating property ${property.id} with version 1`);
      
      // Update the property in the database
      const { error: updateError } = await supabase
        .from('properties')
        .update({ 
          property_details: updatedDetails,
          updated_at: new Date().toISOString() // Update the timestamp
        })
        .eq('id', property.id);
      
      if (!updateError) {
        updatedCount++;
        console.log(`Successfully updated property ${property.id}`);
      } else {
        console.error(`Failed to update property ${property.id}:`, updateError);
      }
    }
    
    console.log(`Successfully updated ${updatedCount}/${properties.length} properties`);
    return updatedCount;
  } catch (error) {
    console.error('Error setting default version for properties:', error);
    throw error;
  }
};

/**
 * Checks if a property has version information
 * @param propertyDetails The property_details object to check
 * @returns Boolean indicating if the property has version information
 */
export const hasVersionInfo = (propertyDetails: any): boolean => {
  return propertyDetails && propertyDetails._version !== undefined;
};

/**
 * Gets the version of a property, defaulting to "N/A" if not present in the UI display
 * @param propertyDetails The property_details object
 * @returns The version string
 */
export const getPropertyVersion = (propertyDetails: any): string => {
  return propertyDetails?._version || 'N/A';
};