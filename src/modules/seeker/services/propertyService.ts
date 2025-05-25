// src/modules/seeker/services/propertyService.ts
// Version: 2.0.0
// Last Modified: 25-05-2025 16:30 IST
// Purpose: Updated to use properties_v2 exclusively with new data structure

import { supabase } from '@/lib/supabase';
import { PropertyFilters } from './seekerService';
import { SimilarPropertiesOptions } from './constants';
import { debugTableSchema, processPropertyData, extractImagesFromProperty } from './utilityService';

// Fetch properties with filters and pagination - Only from properties_v2
export const fetchProperties = async (filters: PropertyFilters = {}) => {
  try {
    console.log('[propertyService] Fetching properties from properties_v2 table exclusively');
    
    // First check if the table exists
    const schemaCheck = await debugTableSchema('properties_v2');
    console.log('[propertyService] Schema check results:', schemaCheck);
    
    if (!schemaCheck.exists) {
      console.error('[propertyService] properties_v2 table does not exist or cannot be accessed');
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
    
    console.log(`[propertyService] Fetching properties: page=${page}, pageSize=${pageSize}`);

    // Get total count of records first
    let countQuery = supabase
      .from('properties_v2')
      .select('id', { count: 'exact', head: true });
      
    const { count: totalRecords, error: countError } = await countQuery;
    
    if (countError) {
      console.error('[propertyService] Error counting records:', countError);
    } else {
      console.log(`[propertyService] Total records in properties_v2: ${totalRecords}`);
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
      console.log(`[propertyService] Applying search filter: ${filters.searchQuery}`);
      // Search in property_details.flow.title and other relevant fields
      query = query.or(`property_details->>flow->>title.ilike.%${filters.searchQuery}%,property_details.ilike.%${filters.searchQuery}%`);
    }
    
    if (filters.propertyType && filters.propertyType !== 'all') {
      console.log(`[propertyService] Applying property type filter: ${filters.propertyType}`);
      // Search in property_details for property type
      query = query.filter('property_details', 'ilike', `%${filters.propertyType}%`);
    }
    
    // Apply sorting - Use created_at for all cases initially
    query = query.order('created_at', { ascending: false });
    
    // Apply pagination
    query = query.range(startIndex, startIndex + pageSize - 1);
    
    console.log(`[propertyService] Executing query for properties_v2`);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[propertyService] Error fetching properties:', error);
      throw error;
    }
    
    console.log(`[propertyService] Query returned ${data?.length || 0} properties out of ${count || 0} total matching records`);
    
    // Debug - log first record structure if available
    if (data && data.length > 0) {
      console.log('[propertyService] First record ID:', data[0].id);
      console.log('[propertyService] First record property_details type:', typeof data[0].property_details);
      
      // Check if the first property has the new data structure
      const firstProperty = data[0];
      if (firstProperty.property_details?.flow?.title) {
        console.log('[propertyService] ✓ New data structure detected with flow.title');
      } else {
        console.log('[propertyService] ⚠ Property missing flow.title in new structure');
      }
    } else {
      console.warn('[propertyService] No properties returned from query');
    }

    // Process the data to have consistent format
    const processedProperties = (data || []).map(property => {
      try {
        // Process property data
        const processedProperty = processPropertyData(property);
        
        if (!processedProperty) {
          console.warn(`[propertyService] Failed to process property ${property.id}`);
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
        console.error(`[propertyService] Error processing property ${property.id}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries

    console.log(`[propertyService] Successfully processed ${processedProperties.length} properties`);

    return {
      properties: processedProperties,
      totalCount: count || 0,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / pageSize)
    };
  } catch (error) {
    console.error('[propertyService] Error fetching properties:', error);
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
    console.log(`[propertyService] Fetching property with ID: ${propertyId} from properties_v2`);
    
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
      console.error('[propertyService] Error fetching property by ID:', error);
      throw error;
    }

    if (!data) {
      console.warn(`[propertyService] Property with ID ${propertyId} not found`);
      throw new Error(`Property with ID ${propertyId} not found`);
    }
    
    console.log(`[propertyService] Found property ${propertyId}. Processing...`);
    
    // Check if property has new data structure
    if (data.property_details?.flow?.title) {
      console.log('[propertyService] ✓ Property has new data structure with flow.title');
    } else {
      console.log('[propertyService] ⚠ Property missing flow.title in new structure');
    }
    
    // Process property to ensure consistent structure
    const processedProperty = processPropertyData(data);
    
    if (!processedProperty) {
      console.error(`[propertyService] Failed to process property ${propertyId}`);
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
      console.error('[propertyService] Error incrementing view count:', err);
    });

    return finalProperty;
  } catch (error) {
    console.error(`[propertyService] Error fetching property with ID ${propertyId}:`, error);
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
      console.log('[propertyService] Anonymous user view - not tracked in database');
    }

    return { success: true };
  } catch (error) {
    console.error('[propertyService] Error recording property visit:', error);
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

    console.log(`[propertyService] fetchSimilarProperties - Starting with options:`, options);

    if (!currentPropertyId) {
      console.error('[propertyService] fetchSimilarProperties - No property ID provided');
      return [];
    }

    // Base query to fetch properties from properties_v2 with minimal restrictions
    let query = supabase
      .from('properties_v2')
      .select('*')
      .neq('id', currentPropertyId) // Exclude current property
      .order('created_at', { ascending: false }) // Latest properties first
      .limit(limit + 5); // Fetch a few extra to allow for filtering
    
    // Apply city filter if available - search in property_details
    if (city) {
      query = query.filter('property_details', 'ilike', `%${city}%`);
    }
    
    // Execute the query with minimal restrictions
    const { data, error } = await query;
    
    if (error) {
      console.error('[propertyService] fetchSimilarProperties - Error fetching similar properties:', error);
      return [];
    }
    
    console.log(`[propertyService] fetchSimilarProperties - Found ${data?.length || 0} similar properties`);
    
    if (data && data.length >= 1) {
      // Process and return the properties
      return processSimilarProperties(data);
    }
    
    // If no results, return empty array
    console.log('[propertyService] fetchSimilarProperties - No similar properties found');
    return [];
  } catch (error) {
    console.error('[propertyService] fetchSimilarProperties - Error:', error);
    // Return empty array instead of throwing to prevent component errors
    return [];
  }
};

// New function to fetch nearby properties
export const fetchNearbyProperties = async (
  currentPropertyId: string,
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  limit: number = 6
) => {
  try {
    console.log(`[propertyService] fetchNearbyProperties - Starting with coordinates: ${latitude}, ${longitude}, radius: ${radiusKm}km`);

    if (!currentPropertyId || !latitude || !longitude) {
      console.error('[propertyService] fetchNearbyProperties - Missing required parameters');
      return [];
    }

    // Calculate approximate bounding box for initial filtering
    const degreePerKm = 0.00904371; // Approximate degree per km (at equator)
    const latDelta = radiusKm * degreePerKm;
    const lngDelta = radiusKm * degreePerKm;

    const latMin = latitude - latDelta;
    const latMax = latitude + latDelta;
    const lngMin = longitude - lngDelta;
    const lngMax = longitude + lngDelta;

    console.log(`[propertyService] fetchNearbyProperties - Bounding box: lat(${latMin} to ${latMax}), lng(${lngMin} to ${lngMax})`);
    
    // Base query to fetch properties from properties_v2
    const { data, error } = await supabase
      .from('properties_v2')
      .select('*')
      .neq('id', currentPropertyId) // Exclude current property
      .order('created_at', { ascending: false })
      .limit(limit + 10); // Fetch extra to allow for post-filtering
    
    if (error) {
      console.error('[propertyService] fetchNearbyProperties - Error fetching properties:', error);
      return [];
    }
    
    console.log(`[propertyService] fetchNearbyProperties - Found ${data?.length || 0} properties for coordinate filtering`);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Process properties and calculate exact distances
    const nearbyProperties = data.map(property => {
      try {
        // Process property data
        const processedProperty = processPropertyData(property);
        
        if (!processedProperty) {
          console.warn(`[propertyService] Failed to process property ${property.id} for nearby properties`);
          return null;
        }
        
        // Extract coordinates from property_details
        const details = processedProperty.property_details || {};
        let propLat = null;
        let propLng = null;
        
        // Try to find coordinates in the new data structure (steps)
        if (details.steps) {
          for (const [stepId, stepData] of Object.entries(details.steps)) {
            if (stepId.includes('location') && stepData && typeof stepData === 'object') {
              const locationData = stepData as any;
              if (locationData.coordinates) {
                propLat = parseFloat(locationData.coordinates.latitude || locationData.coordinates.lat);
                propLng = parseFloat(locationData.coordinates.longitude || locationData.coordinates.lng);
                break;
              }
            }
          }
        }
        
        // Skip properties without coordinates
        if (!propLat || !propLng) {
          return null;
        }
        
        // Calculate distance using Haversine formula
        const distance = calculateDistance(latitude, longitude, propLat, propLng);
        
        // Skip properties outside the exact radius
        if (distance > radiusKm) {
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
        
        // Add distance and primary image to property
        return {
          ...processedProperty,
          distance,
          property_details: {
            ...processedProperty.property_details,
            primaryImage
          }
        };
      } catch (error) {
        console.error(`[propertyService] Error processing nearby property ${property.id}:`, error);
        return null;
      }
    })
    .filter(Boolean) // Remove null entries
    .filter(prop => prop.distance <= radiusKm) // Ensure all properties are within radius
    .sort((a, b) => a.distance - b.distance) // Sort by distance
    .slice(0, limit); // Limit to requested number of properties
    
    console.log(`[propertyService] fetchNearbyProperties - Returning ${nearbyProperties.length} nearby properties`);
    return nearbyProperties;
  } catch (error) {
    console.error('[propertyService] fetchNearbyProperties - Error:', error);
    return [];
  }
};

// Haversine formula to calculate distance between two coordinates in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return parseFloat(distance.toFixed(1));
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI/180);
};

// Helper function for processing similar properties
const processSimilarProperties = (properties: any[]) => {
  return properties.map(property => {
    try {
      // Process property data
      const processedProperty = processPropertyData(property);
      
      if (!processedProperty) {
        console.warn(`[propertyService] Failed to process property ${property.id} for similar properties`);
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
      console.error(`[propertyService] Error processing similar property ${property.id}:`, error);
      return null;
    }
  }).filter(Boolean); // Remove any null entries
};