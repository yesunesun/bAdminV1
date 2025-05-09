// src/modules/seeker/services/propertyService.ts
// Version: 1.1.0
// Last Modified: 09-05-2025 16:15 IST
// Purpose: Property-related functions for fetching and processing properties

import { supabase } from '@/lib/supabase';
import { PropertyFilters } from './seekerService'; // Import from seekerService instead of constants
import { SimilarPropertiesOptions } from './constants';
import { debugTableSchema, processPropertyData, extractImagesFromProperty } from './utilityService';

// Fetch properties with filters and pagination - Only from properties_v2
export const fetchProperties = async (filters: PropertyFilters = {}) => {
  try {
    // First check if the table exists
    const schemaCheck = await debugTableSchema('properties_v2');
    console.log('Schema check results:', schemaCheck);
    
    if (!schemaCheck.exists) {
      console.error('properties_v2 table does not exist or cannot be accessed');
      return {
        properties: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      };
    }
    
    // Set default pagination values
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50; 
    const startIndex = (page - 1) * pageSize;
    
    console.log(`Fetching properties: page=${page}, pageSize=${pageSize}`);

    // Get total count of records first with minimal filtering
    let countQuery = supabase
      .from('properties_v2')
      .select('id', { count: 'exact', head: true });
      
    const { count: totalRecords, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error counting records:', countError);
    } else {
      console.log(`Total records in properties_v2: ${totalRecords}`);
    }
    
    // Build the query for properties_v2
    let query = supabase
      .from('properties_v2')
      .select(`
        *,
        profiles:owner_id (
          id,
          email
        )
      `, { count: 'exact' });
    
    // Apply filters
    if (filters.searchQuery) {
      console.log(`Applying search filter: ${filters.searchQuery}`);
      // Less restrictive search - search in entire property_details
      query = query.filter('property_details', 'ilike', `%${filters.searchQuery}%`);
    }
    
    if (filters.propertyType && filters.propertyType !== 'all') {
      console.log(`Applying property type filter: ${filters.propertyType}`);
      // Less restrictive - search in entire property_details
      query = query.filter('property_details', 'ilike', `%${filters.propertyType}%`);
    }
    
    // No price or bedroom filters for initial debugging
    
    // Apply sorting - Use created_at for all cases initially
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    query = query.range(startIndex, startIndex + pageSize - 1);
    
    console.log(`Executing query for properties_v2`);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
    
    console.log(`Query returned ${data?.length || 0} properties out of ${count || 0} total matching records`);
    
    // Debug - log first record structure if available
    if (data && data.length > 0) {
      console.log('First record ID:', data[0].id);
      console.log('First record property_details type:', typeof data[0].property_details);
      
      // Safely stringify part of the first record for debugging
      try {
        const recordPreview = JSON.stringify(data[0], null, 2).substring(0, 200) + '...';
        console.log('First record preview:', recordPreview);
      } catch (e) {
        console.error('Error stringifying record:', e);
      }
    } else {
      console.warn('No properties returned from query');
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
        const propertyImages = extractImagesFromProperty(processedProperty);
        
        // Sort images - primary ones first, then by display_order
        const sortedImages = propertyImages.sort((a, b) => {
          // Sort by is_primary first (primary images first)
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;

          // Then sort by display_order if available
          return (a.display_order || 0) - (b.display_order || 0);
        });
        
        // Add sorted images to the property
        return {
          ...processedProperty,
          property_images: sortedImages
        };
      } catch (error) {
        console.error(`Error processing property ${property.id}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries

    return {
      properties: processedProperties,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    console.error('Error fetching properties:', error);
    return {
      properties: [],
      totalCount: 0,
      currentPage: 1,
      totalPages: 0
    };
  }
};

// Fetch a single property by ID - Only from properties_v2
export const fetchPropertyById = async (propertyId: string) => {
  try {
    console.log(`Fetching property with ID: ${propertyId}`);
    
    // Fetch from properties_v2 table
    const { data, error } = await supabase
      .from('properties_v2')
      .select(`
        *,
        profiles:owner_id (
          id,
          email,
          phone
        )
      `)
      .eq('id', propertyId)
      .single();
    
    if (error) {
      console.error('Error fetching property by ID:', error);
      throw error;
    }

    if (!data) {
      console.warn(`Property with ID ${propertyId} not found`);
      throw new Error(`Property with ID ${propertyId} not found`);
    }
    
    console.log(`Found property ${propertyId}. Processing...`);
    
    // Process property to ensure consistent structure
    const processedProperty = processPropertyData(data);
    
    if (!processedProperty) {
      console.error(`Failed to process property ${propertyId}`);
      throw new Error(`Error processing property ${propertyId}`);
    }
    
    // Extract and process images
    const images = extractImagesFromProperty(processedProperty);
    
    // Sort images
    const sortedImages = images.sort((a, b) => {
      // Sort by is_primary first (primary images first)
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;

      // Then sort by display_order if available
      return (a.display_order || 0) - (b.display_order || 0);
    });
    
    // Add sorted images to the property
    const finalProperty = {
      ...processedProperty,
      property_images: sortedImages
    };

    // Record view count increment in the background (don't await)
    incrementPropertyViewCount(propertyId).catch(err => {
      console.error('Error incrementing view count:', err);
    });

    return finalProperty;
  } catch (error) {
    console.error(`Error fetching property with ID ${propertyId}:`, error);
    throw error;
  }
};

// Helper function to increment property view count
const incrementPropertyViewCount = async (propertyId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;

    // First check if this user already viewed this property today
    if (userId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      const { data: existingVisit } = await supabase
        .from('property_visits')
        .select('id, visit_count')
        .eq('property_id', propertyId)
        .eq('user_id', userId)
        .gte('visit_date', today.toISOString())
        .single();

      if (existingVisit) {
        // Update existing visit count
        await supabase
          .from('property_visits')
          .update({
            visit_count: (existingVisit.visit_count || 0) + 1,
            visited_at: new Date().toISOString()
          })
          .eq('id', existingVisit.id);
      } else {
        // Insert new visit record
        await supabase
          .from('property_visits')
          .insert({
            property_id: propertyId,
            user_id: userId,
            visit_count: 1,
            visit_date: new Date().toISOString(),
            visited_at: new Date().toISOString()
          });
      }
    } else {
      // For anonymous users, just log without DB tracking
      console.log('Anonymous user view - not tracked in database');
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording property visit:', error);
    return { success: false };
  }
};

// Fetch similar properties - Only from properties_v2
export const fetchSimilarProperties = async (options: SimilarPropertiesOptions) => {
  try {
    const {
      currentPropertyId,
      city,
      state,
      propertyType,
      bedrooms,
      price,
      limit = 3
    } = options;

    console.log(`[fetchSimilarProperties] Starting with options:`, options);

    if (!currentPropertyId) {
      console.error('[fetchSimilarProperties] No property ID provided');
      return [];
    }

    // Base query to fetch properties from properties_v2 with minimal restrictions for debugging
    let query = supabase
      .from('properties_v2')
      .select('*')
      .neq('id', currentPropertyId) // Exclude current property
      .order('created_at', { ascending: false }) // Latest properties first
      .limit(limit + 5); // Fetch a few extra to allow for filtering
    
    // Apply city filter if available - use raw property_details filter for debugging
    if (city) {
      query = query.filter('property_details', 'ilike', `%${city}%`);
    }
    
    // Execute the query with minimal restrictions
    const { data, error } = await query;
    
    if (error) {
      console.error('[fetchSimilarProperties] Error fetching similar properties:', error);
      return [];
    }
    
    console.log(`[fetchSimilarProperties] Found ${data?.length || 0} similar properties`);
    
    if (data && data.length >= 1) {
      // Process and return the properties
      return processSimilarProperties(data);
    }
    
    // If no results, return empty array
    console.log('[fetchSimilarProperties] No similar properties found');
    return [];
  } catch (error) {
    console.error('[fetchSimilarProperties] Error:', error);
    // Return empty array instead of throwing to prevent component errors
    return [];
  }
};

// Helper function for processing similar properties
const processSimilarProperties = (properties: any[]) => {
  return properties.map(property => {
    try {
      // Process property data
      const processedProperty = processPropertyData(property);
      
      if (!processedProperty) {
        console.warn(`Failed to process property ${property.id} for similar properties`);
        return null;
      }
      
      // Extract images
      const extractedImages = extractImagesFromProperty(processedProperty);
      
      // Find primary image or first image
      let primaryImage = '/noimage.png';
      if (extractedImages.length > 0) {
        const primary = extractedImages.find(img => img.is_primary);
        primaryImage = primary ? primary.url : extractedImages[0].url;
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
      console.error(`Error processing similar property ${property.id}:`, error);
      return null;
    }
  }).filter(Boolean); // Remove any null entries
};