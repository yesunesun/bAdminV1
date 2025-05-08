// src/modules/seeker/services/mapService.ts
// Version: 1.0.0
// Last Modified: 09-05-2025 13:30 IST
// Purpose: Map-specific functions for properties on a map

import { supabase } from '@/lib/supabase';
import { PropertyFilters } from './constants';
import { processPropertyData, extractImagesFromProperty } from './utilityService';

// Fetch properties specifically for map display - Only from properties_v2
export const fetchPropertiesForMap = async (filters: PropertyFilters = {}) => {
  try {
    // First check the table exists and has data
    const { count: tableCount, error: countError } = await supabase
      .from('properties_v2')
      .select('*', { count: 'exact', head: true });
      
    console.log(`Checking properties_v2 table: ${tableCount} total records exist. Error: ${countError ? countError.message : 'None'}`);
    
    if (countError) {
      console.error('Error accessing properties_v2 table. Check if table exists:', countError);
      return {
        properties: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      };
    }
    
    // Set default pagination values
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 9; 
    const startIndex = (page - 1) * pageSize;

    console.log(`Fetching properties for map: page=${page}, pageSize=${pageSize}, startIndex=${startIndex}`);
    
    // Build the query for properties_v2 - with minimal filtering for debug
    let query = supabase
      .from('properties_v2')
      .select('*', { count: 'exact' });
    
    console.log('Querying properties_v2 table with minimal filters');
    
    // Apply sorting (same as in fetchProperties)
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    query = query.range(startIndex, startIndex + pageSize - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    console.log(`Raw query result: Found ${count || 0} properties. Error: ${error ? error.message : 'None'}`);
    
    if (error) {
      console.error('Error querying properties_v2:', error);
      return {
        properties: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      };
    }
    
    // Debug the first record to see structure
    if (data && data.length > 0) {
      console.log(`First record ID: ${data[0].id}`);
      try {
        console.log(`First record property_details type: ${typeof data[0].property_details}`);
        
        // Safely stringify a portion to see the structure
        if (typeof data[0].property_details === 'object') {
          const preview = JSON.stringify(data[0].property_details).substring(0, 200) + '...';
          console.log(`Property details preview: ${preview}`);
        } else {
          console.log(`Raw property_details: ${data[0].property_details}`);
        }
      } catch (e) {
        console.error('Error logging property details:', e);
      }
    } else {
      console.warn('No properties found in properties_v2 table');
    }

    // Process the data to have consistent format
    const processedProperties = (data || []).map(property => {
      try {
        // Process property data 
        const processedProperty = processPropertyData(property);
        
        if (!processedProperty) {
          console.warn(`Failed to process property ${property.id}`);
          return null;
        }
        
        // Extract images
        const images = extractImagesFromProperty(processedProperty);
        
        // Find primary image or first available image
        let primaryImage = '/noimage.png';
        if (images.length > 0) {
          const primary = images.find(img => img.is_primary);
          primaryImage = primary ? primary.url : images[0].url;
        }
        
        // Add primary image to property_details
        return {
          ...processedProperty,
          property_details: {
            ...processedProperty.property_details,
            primaryImage
          }
        };
      } catch (error) {
        console.error(`Error processing property ${property.id}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries
    
    console.log(`Successfully processed ${processedProperties.length} properties for map`);

    return {
      properties: processedProperties,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    console.error('Error fetching properties for map:', error);
    return {
      properties: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0
    };
  }
};