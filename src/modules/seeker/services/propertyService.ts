// src/modules/seeker/services/propertyService.ts
// Version: 4.1.0
// Last Modified: 01-06-2025 10:30 IST
// Purpose: Added coordinate fetching to property listings for AllProperties page display

import { supabase } from '@/lib/supabase';
import { PropertyFilters } from './seekerService';
import { SimilarPropertiesOptions } from './constants';
import { debugTableSchema, processPropertyData, extractImagesFromProperty } from './utilityService';

// Interface for nearby property results
interface NearbyProperty {
  id: string;
  title: string;
  distance: number;
  price: number;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  property_details: {
    primaryImage: string;
    flow?: any;
    steps?: any;
    [key: string]: any;
  };
}

// Interface for coordinate sync results
interface SyncResult {
  success: boolean;
  syncedCount?: number;
  totalProperties?: number;
  errors?: string[];
  error?: string;
  data?: any;
}

// Interface for property coordinates
interface PropertyCoordinates {
  id: string;
  property_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  created_at: string;
  updated_at: string;
}

// Fetch properties with filters and pagination - Only from properties_v2, now with coordinates
export const fetchProperties = async (filters: PropertyFilters = {}) => {
  try {
    console.log('[propertyService] Fetching properties from properties_v2 table exclusively with coordinates');
    
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
    
    // Build the query for properties_v2 with coordinates
    let query = supabase
      .from('properties_v2')
      .select(`
        *,
        profiles:owner_id (
          id,
          email
        ),
        property_coordinates (
          id,
          latitude,
          longitude,
          address,
          city,
          state,
          created_at,
          updated_at
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
    
    console.log(`[propertyService] Executing query for properties_v2 with coordinates`);
    
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
      console.log('[propertyService] First record coordinates:', data[0].property_coordinates);
      
      // Check if the first property has the new data structure
      const firstProperty = data[0];
      if (firstProperty.property_details?.flow?.title) {
        console.log('[propertyService] ✓ New data structure detected with flow.title');
      } else {
        console.log('[propertyService] ⚠ Property missing flow.title in new structure');
      }
      
      // Check coordinates
      if (firstProperty.property_coordinates) {
        console.log('[propertyService] ✓ Coordinates found for first property');
      } else {
        console.log('[propertyService] ⚠ No coordinates found for first property');
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
        
        // Process coordinates data
        let coordinates = null;
        if (property.property_coordinates && property.property_coordinates.length > 0) {
          const coord = property.property_coordinates[0]; // Take first coordinate if multiple exist
          coordinates = {
            id: coord.id,
            property_id: property.id,
            latitude: parseFloat(coord.latitude),
            longitude: parseFloat(coord.longitude),
            address: coord.address || null,
            city: coord.city || null,
            state: coord.state || null,
            created_at: coord.created_at,
            updated_at: coord.updated_at
          };
        }
        
        // Add sorted images and coordinates to the property
        return {
          ...processedProperty,
          property_images: sortedImages,
          coordinates: coordinates
        };
      } catch (error) {
        console.error(`[propertyService] Error processing property ${property.id}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries

    console.log(`[propertyService] Successfully processed ${processedProperties.length} properties`);
    
    // Log coordinates statistics
    const propertiesWithCoords = processedProperties.filter(p => p.coordinates);
    const propertiesWithoutCoords = processedProperties.filter(p => !p.coordinates);
    console.log(`[propertyService] Coordinate stats: ${propertiesWithCoords.length} with coordinates, ${propertiesWithoutCoords.length} without coordinates`);

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

// Fetch a single property by ID - Only from properties_v2, now with coordinates
export const fetchPropertyById = async (propertyId: string) => {
  try {
    console.log(`[propertyService] Fetching property with ID: ${propertyId} from properties_v2 with coordinates`);
    
    // Fetch from properties_v2 table with coordinates
    const { data, error } = await supabase
      .from('properties_v2')
      .select(`
        *,
        profiles:owner_id (
          id,
          email,
          phone
        ),
        property_coordinates (
          id,
          latitude,
          longitude,
          address,
          city,
          state,
          created_at,
          updated_at
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
    
    // Check coordinates
    if (data.property_coordinates) {
      console.log('[propertyService] ✓ Coordinates found for property');
    } else {
      console.log('[propertyService] ⚠ No coordinates found for property');
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
    
    // Process coordinates data
    let coordinates = null;
    if (data.property_coordinates && data.property_coordinates.length > 0) {
      const coord = data.property_coordinates[0]; // Take first coordinate if multiple exist
      coordinates = {
        id: coord.id,
        property_id: propertyId,
        latitude: parseFloat(coord.latitude),
        longitude: parseFloat(coord.longitude),
        address: coord.address || null,
        city: coord.city || null,
        state: coord.state || null,
        created_at: coord.created_at,
        updated_at: coord.updated_at
      };
    }
    
    // Add sorted images and coordinates to the property
    const finalProperty = {
      ...processedProperty,
      property_images: sortedImages,
      coordinates: coordinates
    };

    // Record view count increment in the background (don't await)
    incrementPropertyViewCount(propertyId).catch(err => {
      console.error('[propertyService] Error incrementing view count:', err);
    });

    // Extract and sync coordinates to coordinates table (background operation)
    syncPropertyCoordinates(propertyId).catch(err => {
      console.error('[propertyService] Error syncing coordinates:', err);
    });

    return finalProperty;
  } catch (error) {
    console.error(`[propertyService] Error fetching property with ID ${propertyId}:`, error);
    throw error;
  }
};

// Helper function to sync property coordinates to the coordinates table
const syncPropertyCoordinates = async (propertyId: string): Promise<void> => {
  try {
    console.log(`[propertyService] Syncing coordinates for property ${propertyId}`);
    
    const { data, error } = await supabase.rpc('extract_and_upsert_property_coordinates', {
      p_property_id: propertyId
    });
    
    if (error) {
      console.error('[propertyService] Error syncing coordinates:', error);
      return;
    }
    
    if (data?.success) {
      console.log(`[propertyService] Successfully synced coordinates for property ${propertyId}`);
    } else {
      console.warn(`[propertyService] Failed to sync coordinates for property ${propertyId}:`, data?.error);
    }
  } catch (error) {
    console.error('[propertyService] Error in syncPropertyCoordinates:', error);
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

// OPTIMIZED: Fetch nearby properties using property_coordinates table
export const fetchNearbyProperties = async (
  currentPropertyId: string,
  latitude: number,
  longitude: number,
  radiusKm: number = 2,
  limit: number = 6
): Promise<NearbyProperty[]> => {
  try {
    console.log(`[propertyService] fetchNearbyProperties - Starting with coordinates: ${latitude}, ${longitude}, radius: ${radiusKm}km`);

    // Validate inputs
    if (!currentPropertyId || !latitude || !longitude) {
      console.error('[propertyService] fetchNearbyProperties - Missing required parameters');
      throw new Error('Missing required parameters: propertyId, latitude, or longitude');
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      console.error('[propertyService] fetchNearbyProperties - Invalid coordinates');
      throw new Error('Invalid coordinates provided');
    }

    // Convert numbers to ensure proper types
    const lat = Number(latitude);
    const lng = Number(longitude);
    const radius = Number(radiusKm);
    const resultLimit = Number(limit);

    console.log(`[propertyService] Calling find_nearby_properties with: lat=${lat}, lng=${lng}, radius=${radius}, limit=${resultLimit}`);

    // Use the database function to find nearby coordinates
    const { data: nearbyCoords, error: coordsError } = await supabase.rpc('find_nearby_properties', {
      p_latitude: lat,
      p_longitude: lng,
      p_radius_km: radius,
      p_exclude_property_id: currentPropertyId,
      p_limit: resultLimit
    });

    if (coordsError) {
      console.error('[propertyService] fetchNearbyProperties - Database function error:', coordsError);
      throw new Error(`Database error: ${coordsError.message}`);
    }

    if (!nearbyCoords || nearbyCoords.length === 0) {
      console.log('[propertyService] fetchNearbyProperties - No nearby properties found');
      return [];
    }

    console.log(`[propertyService] fetchNearbyProperties - Found ${nearbyCoords.length} nearby coordinates`);

    // Get the property IDs
    const propertyIds = nearbyCoords.map((coord: any) => coord.property_id);

    // Fetch the actual property data from properties_v2
    const { data: properties, error: propertiesError } = await supabase
      .from('properties_v2')
      .select('*')
      .in('id', propertyIds);

    if (propertiesError) {
      console.error('[propertyService] fetchNearbyProperties - Error fetching property data:', propertiesError);
      throw new Error(`Error fetching property data: ${propertiesError.message}`);
    }

    if (!properties || properties.length === 0) {
      console.log('[propertyService] fetchNearbyProperties - No property data found for nearby coordinates');
      return [];
    }

    console.log(`[propertyService] fetchNearbyProperties - Found ${properties.length} properties with data`);

    // Process properties and merge with coordinate data
    const nearbyProperties: NearbyProperty[] = properties.map(property => {
      try {
        // Find the corresponding coordinate data
        const coordData = nearbyCoords.find((coord: any) => coord.property_id === property.id);
        
        if (!coordData) {
          console.warn(`[propertyService] No coordinate data found for property ${property.id}`);
          return null;
        }

        // Process property data using the existing utility function
        const processedProperty = processPropertyData(property);
        
        if (!processedProperty) {
          console.warn(`[propertyService] Failed to process property ${property.id} for nearby properties`);
          return null;
        }

        // Extract images using the existing utility function
        const extractedImages = extractImagesFromProperty(processedProperty);
        
        // Find primary image or first image
        let primaryImage = '/noimage.png';
        if (extractedImages.length > 0) {
          const primary = extractedImages.find(img => img.is_primary);
          primaryImage = primary ? primary.url : extractedImages[0].url;
        }

        // Get title from various possible locations
        let title = 'Property';
        if (processedProperty.property_details?.flow?.title) {
          title = processedProperty.property_details.flow.title;
        } else if (processedProperty.title) {
          title = processedProperty.title;
        } else if (processedProperty.property_details?.title) {
          title = processedProperty.property_details.title;
        }

        // Get price from various possible locations
        let price = 0;
        if (processedProperty.property_details?.flow?.price) {
          price = Number(processedProperty.property_details.flow.price) || 0;
        } else if (processedProperty.price) {
          price = Number(processedProperty.price) || 0;
        }

        // Create a consistent property object
        return {
          id: property.id,
          title,
          distance: Math.round(parseFloat(coordData.distance_km) * 100) / 100, // Round to 2 decimal places
          price,
          city: coordData.city || processedProperty.city || 'Unknown',
          coordinates: {
            lat: parseFloat(coordData.latitude),
            lng: parseFloat(coordData.longitude)
          },
          property_details: {
            ...processedProperty.property_details,
            primaryImage,
            flow: processedProperty.property_details?.flow || { title, price },
            // Add coordinate data to steps for map display
            steps: {
              ...processedProperty.property_details?.steps,
              location_details: {
                latitude: parseFloat(coordData.latitude),
                longitude: parseFloat(coordData.longitude),
                address: coordData.address,
                city: coordData.city,
                state: coordData.state
              }
            }
          }
        };
      } catch (error) {
        console.error(`[propertyService] Error processing nearby property ${property.id}:`, error);
        return null;
      }
    })
    .filter((property): property is NearbyProperty => property !== null) // Remove null entries with type guard
    .sort((a, b) => a.distance - b.distance); // Sort by distance

    console.log(`[propertyService] fetchNearbyProperties - Returning ${nearbyProperties.length} processed nearby properties`);
    return nearbyProperties;

  } catch (error) {
    console.error('[propertyService] fetchNearbyProperties - Unexpected error:', error);
    // Instead of throwing, return empty array to prevent UI crashes
    return [];
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

// Function to bulk sync all property coordinates
export const bulkSyncPropertyCoordinates = async (): Promise<SyncResult> => {
  try {
    console.log('[propertyService] Starting bulk sync of property coordinates...');

    // Get all properties from properties_v2
    const { data: properties, error } = await supabase
      .from('properties_v2')
      .select('id')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[propertyService] Error fetching properties for bulk sync:', error);
      return { success: false, error: error.message };
    }

    if (!properties || properties.length === 0) {
      console.log('[propertyService] No properties found for bulk sync');
      return { success: true, syncedCount: 0, errors: [] };
    }

    console.log(`[propertyService] Found ${properties.length} properties to sync`);

    const errors: string[] = [];
    let syncedCount = 0;

    // Process properties in batches to avoid overwhelming the database
    const batchSize = 10;
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize);
      
      console.log(`[propertyService] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(properties.length / batchSize)}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (property) => {
        try {
          const { data, error } = await supabase.rpc('extract_and_upsert_property_coordinates', {
            p_property_id: property.id
          });

          if (error) {
            throw new Error(`Property ${property.id}: ${error.message}`);
          }

          if (data?.success) {
            syncedCount++;
            console.log(`[propertyService] ✓ Synced coordinates for property ${property.id}`);
          } else {
            errors.push(`Property ${property.id}: ${data?.error || 'Unknown error'}`);
          }
        } catch (error) {
          const errorMessage = `Property ${property.id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          console.error(`[propertyService] ✗ Error syncing property ${property.id}:`, error);
        }
      });

      // Wait for batch to complete
      await Promise.all(batchPromises);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < properties.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`[propertyService] Bulk sync completed: ${syncedCount} synced, ${errors.length} errors`);

    return {
      success: true,
      syncedCount,
      totalProperties: properties.length,
      errors: errors.slice(0, 10) // Return first 10 errors to avoid overwhelming the response
    };
  } catch (error) {
    console.error('[propertyService] Error in bulk sync:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to manually sync coordinates for a specific property
export const syncSinglePropertyCoordinates = async (propertyId: string): Promise<SyncResult> => {
  try {
    console.log(`[propertyService] Manually syncing coordinates for property ${propertyId}`);

    const { data, error } = await supabase.rpc('extract_and_upsert_property_coordinates', {
      p_property_id: propertyId
    });

    if (error) {
      console.error('[propertyService] Error manually syncing coordinates:', error);
      return { success: false, error: error.message };
    }

    if (data?.success) {
      console.log(`[propertyService] Successfully manually synced coordinates for property ${propertyId}`);
      return { 
        success: true, 
        data: {
          propertyId,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address,
          city: data.city,
          state: data.state
        }
      };
    } else {
      console.warn(`[propertyService] Failed to manually sync coordinates for property ${propertyId}:`, data?.error);
      return { success: false, error: data?.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('[propertyService] Error in syncSinglePropertyCoordinates:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
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