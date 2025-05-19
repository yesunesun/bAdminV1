// src/modules/seeker/services/propertyService.ts
// Version: 1.2.0
// Last Modified: 19-05-2025 10:30 IST
// Purpose: Added function to fetch nearby properties

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

// New function to fetch nearby properties
export const fetchNearbyProperties = async (
  currentPropertyId: string,
  latitude: number,
  longitude: number,
  radiusKm: number = 5,
  limit: number = 6
) => {
  try {
    console.log(`[fetchNearbyProperties] Starting with coordinates: ${latitude}, ${longitude}, radius: ${radiusKm}km`);

    if (!currentPropertyId || !latitude || !longitude) {
      console.error('[fetchNearbyProperties] Missing required parameters');
      return [];
    }

    // Calculate approximate bounding box for initial filtering
    // 0.01 degree is roughly 1.11km at the equator, adjust based on radius
    const degreePerKm = 0.00904371; // Approximate degree per km (at equator)
    const latDelta = radiusKm * degreePerKm;
    const lngDelta = radiusKm * degreePerKm;

    const latMin = latitude - latDelta;
    const latMax = latitude + latDelta;
    const lngMin = longitude - lngDelta;
    const lngMax = longitude + lngDelta;

    console.log(`[fetchNearbyProperties] Bounding box: lat(${latMin} to ${latMax}), lng(${lngMin} to ${lngMax})`);
    
    // Base query to fetch properties
    const { data, error } = await supabase
      .from('properties_v2')
      .select('*')
      .neq('id', currentPropertyId) // Exclude current property
      .or(`property_details->coordinates->lat.gte.${latMin},property_details->coordinates->latitude.gte.${latMin}`)
      .or(`property_details->coordinates->lat.lte.${latMax},property_details->coordinates->latitude.lte.${latMax}`)
      .or(`property_details->coordinates->lng.gte.${lngMin},property_details->coordinates->longitude.gte.${lngMin}`)
      .or(`property_details->coordinates->lng.lte.${lngMax},property_details->coordinates->longitude.lte.${lngMax}`)
      .order('created_at', { ascending: false })
      .limit(limit + 10); // Fetch extra to allow for post-filtering
    
    if (error) {
      console.error('[fetchNearbyProperties] Error fetching properties:', error);
      return [];
    }
    
    console.log(`[fetchNearbyProperties] Found ${data?.length || 0} properties in bounding box`);
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Process properties and calculate exact distances
    const nearbyProperties = data.map(property => {
      try {
        // Process property data
        const processedProperty = processPropertyData(property);
        
        if (!processedProperty) {
          console.warn(`Failed to process property ${property.id} for nearby properties`);
          return null;
        }
        
        // Extract coordinates from property
        const details = processedProperty.property_details || {};
        let propLat = null;
        let propLng = null;
        
        // Try to find coordinates in various possible locations
        if (details.coordinates) {
          propLat = parseFloat(details.coordinates.lat || details.coordinates.latitude);
          propLng = parseFloat(details.coordinates.lng || details.coordinates.longitude);
        } else if (details.location?.coordinates) {
          propLat = parseFloat(details.location.coordinates.lat || details.location.coordinates.latitude);
          propLng = parseFloat(details.location.coordinates.lng || details.location.coordinates.longitude);
        } else if (details.lat && details.lng) {
          propLat = parseFloat(details.lat);
          propLng = parseFloat(details.lng);
        } else if (details.latitude && details.longitude) {
          propLat = parseFloat(details.latitude);
          propLng = parseFloat(details.longitude);
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
        console.error(`Error processing nearby property ${property.id}:`, error);
        return null;
      }
    })
    .filter(Boolean) // Remove null entries
    .filter(prop => prop.distance <= radiusKm) // Ensure all properties are within radius
    .sort((a, b) => a.distance - b.distance) // Sort by distance
    .slice(0, limit); // Limit to requested number of properties
    
    console.log(`[fetchNearbyProperties] Returning ${nearbyProperties.length} nearby properties`);
    return nearbyProperties;
  } catch (error) {
    console.error('[fetchNearbyProperties] Error:', error);
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