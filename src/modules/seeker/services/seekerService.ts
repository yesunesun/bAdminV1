// src/modules/seeker/services/seekerService.ts
// Version: 5.2.0
// Last Modified: 10-05-2025 18:30 IST
// Purpose: Updated to use properties_v2_likes table for all favorite functionality

import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/modules/owner/components/property/types';

export interface PropertyFilters {
  searchQuery?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  propertyAge?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

// Colored marker URLs from Google Maps
export const markerPins = {
  residential: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  apartment: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  commercial: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  land: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  office: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  shop: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  default: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
};

// Property Type Quick Filter options
export const propertyTypeOptions = [
  { id: 'all', label: 'All Types', icon: 'Home' },
  { id: 'apartment', label: 'Apartment', icon: 'Building2' },
  { id: 'house', label: 'House', icon: 'Home' },
  { id: 'commercial', label: 'Commercial', icon: 'Warehouse' },
  { id: 'land', label: 'Land', icon: 'LandPlot' },
];

// Format price to Indian format (e.g. ₹1.5 Cr, ₹75 L)
export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
};

// Get marker pin URL based on property type
export const getMarkerPin = (property: PropertyType) => {
  const propertyType = property.property_details?.basicDetails?.propertyType?.toLowerCase() || '';

  if (propertyType.includes('apartment')) {
    return markerPins.apartment;
  } else if (propertyType.includes('residential') || propertyType.includes('house')) {
    return markerPins.residential;
  } else if (propertyType.includes('office')) {
    return markerPins.office;
  } else if (propertyType.includes('shop') || propertyType.includes('retail')) {
    return markerPins.shop;
  } else if (propertyType.includes('commercial')) {
    return markerPins.commercial;
  } else if (propertyType.includes('land') || propertyType.includes('plot')) {
    return markerPins.land;
  }

  return markerPins.default;
};

// Helper to safely extract number from value
const safeParseNumber = (value: any, defaultValue = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numMatch = value.match(/^(\d+)/);
    if (numMatch && numMatch[1]) {
      return parseInt(numMatch[1], 10) || defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Helper to safely get nested property value
const getNestedValue = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : defaultValue;
    }, obj);
  } catch (e) {
    console.error(`Error getting nested value for path ${path}:`, e);
    return defaultValue;
  }
};

// Helper to extract property information from the JSONB property_details field
const processPropertyData = (property: any) => {
  try {
    if (!property) {
      console.warn('Received null or undefined property in processPropertyData');
      return null;
    }
    
    // Check if property_details exists
    const details = property.property_details || {};
    
    if (typeof details === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedDetails = JSON.parse(details);
        console.log('Successfully parsed property_details from string to object');
        property.property_details = parsedDetails;
      } catch (e) {
        console.error('Failed to parse property_details string:', e);
      }
    }
    
    // Extract data from property_details - use getNestedValue for safety
    const basicDetails = getNestedValue(property, 'property_details.basicDetails', {});
    const location = getNestedValue(property, 'property_details.location', {});
    const flow = getNestedValue(property, 'property_details.flow', {});
    const rental = getNestedValue(property, 'property_details.rental', {});
    const sale = getNestedValue(property, 'property_details.sale', {});
    
    // Price - try different potential locations
    const price = getNestedValue(rental, 'rentAmount', 0) || 
                  getNestedValue(sale, 'expectedPrice', 0) || 
                  getNestedValue(property, 'property_details.price', 0) || 
                  0;
    
    // Calculate bedrooms from bhkType or directly from property
    let bedrooms = 0;
    const bhkType = getNestedValue(basicDetails, 'bhkType', '');
    if (bhkType) {
      const match = bhkType.match(/^(\d+)/);
      if (match && match[1]) {
        bedrooms = parseInt(match[1], 10);
      }
    }
    
    // Get coordinates from various possible locations
    let latitude = null;
    let longitude = null;
    
    // Try location.coordinates
    const coordinates = getNestedValue(location, 'coordinates', null);
    if (coordinates) {
      latitude = getNestedValue(coordinates, 'latitude', null) || getNestedValue(coordinates, 'lat', null);
      longitude = getNestedValue(coordinates, 'longitude', null) || getNestedValue(coordinates, 'lng', null);
    }
    
    // If not found, try direct property_details coordinates
    if (!latitude || !longitude) {
      const directCoords = getNestedValue(property, 'property_details.coordinates', null);
      if (directCoords) {
        latitude = getNestedValue(directCoords, 'latitude', null) || getNestedValue(directCoords, 'lat', null);
        longitude = getNestedValue(directCoords, 'longitude', null) || getNestedValue(directCoords, 'lng', null);
      }
    }
    
    // Create a standardized property object with normalized data
    return {
      ...property,
      // Extract fields from property_details for compatibility with UI components
      title: getNestedValue(basicDetails, 'title', 'Property Listing'),
      price: safeParseNumber(price),
      bedrooms: bedrooms || safeParseNumber(getNestedValue(property, 'property_details.bedrooms', 0)),
      bathrooms: safeParseNumber(getNestedValue(basicDetails, 'bathrooms', 0)),
      square_feet: safeParseNumber(getNestedValue(basicDetails, 'builtUpArea', 0)),
      address: getNestedValue(location, 'address', ''),
      city: getNestedValue(location, 'city', ''),
      state: getNestedValue(location, 'state', ''),
      zip_code: getNestedValue(location, 'pinCode', ''),
      // Add coordinates to top level for map usage
      latitude: latitude !== null ? safeParseNumber(latitude) : null,
      longitude: longitude !== null ? safeParseNumber(longitude) : null,
      // Keep property_details as is
      property_details: property.property_details
    };
  } catch (error) {
    console.error('Error in processPropertyData:', error);
    return property; // Return original property on error
  }
};

// Helper to extract images from property_details
const extractImagesFromProperty = (property: any) => {
  try {
    // Initialize images array
    let images: any[] = [];
    
    if (!property || !property.property_details) {
      return [];
    }
    
    const details = property.property_details;
    
    // Try various paths where images might be stored in property_details
    if (details.images && Array.isArray(details.images)) {
      images = details.images;
    } else if (details.photos?.images && Array.isArray(details.photos.images)) {
      images = details.photos.images;
    } else if (details.media?.images && Array.isArray(details.media.images)) {
      images = details.media.images;
    }
    
    // If images were found, process them to have consistent properties
    if (images.length > 0) {
      return images.map((img, idx) => ({
        id: img.id || `img-${idx}`,
        url: img.dataUrl || img.url || '',
        is_primary: !!img.isPrimary || !!img.is_primary,
        display_order: img.display_order || idx
      }));
    }
    
    // No images found
    return [];
  } catch (error) {
    console.error('Error extracting images:', error);
    return [];
  }
};

// Debug helper to log table schema
export const debugTableSchema = async (tableName: string) => {
  try {
    console.log(`Checking table schema for: ${tableName}`);
    
    // First check if table exists by trying to count records
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`Error accessing table ${tableName}:`, error);
      return { exists: false, error: error.message };
    }
    
    console.log(`Table ${tableName} exists with approximately ${count} records`);
    
    // Get sample records to infer schema
    const { data, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (sampleError || !data || data.length === 0) {
      console.warn(`No sample data found in ${tableName}`);
      return { exists: true, count, schema: 'No sample data available' };
    }
    
    // Extract column names and types
    const record = data[0];
    const schema = Object.keys(record).map(key => {
      let type = typeof record[key];
      if (record[key] === null) type = 'null';
      if (Array.isArray(record[key])) type = 'array';
      
      return { column: key, type };
    });
    
    console.log(`Table ${tableName} schema:`, schema);
    
    return { exists: true, count, schema };
  } catch (error) {
    console.error('Error in debugTableSchema:', error);
    return { exists: false, error: error.message };
  }
};

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

// Favorite properties functions - Updated for properties_v2_likes

export const getUserFavorites = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    // Get the user's liked property IDs from properties_v2_likes table
    const { data: likeData, error: likeError } = await supabase
      .from('properties_v2_likes')
      .select('property_id')
      .eq('user_id', user.user.id);

    if (likeError) {
      console.error('Error fetching liked property IDs:', likeError);
      throw likeError;
    }

    if (!likeData || likeData.length === 0) {
      return [];
    }

    console.log(`Found ${likeData.length} favorited properties for user ${user.user.id}`);

    // Extract property IDs
    const propertyIds = likeData.map(like => like.property_id);

    // Fetch properties from properties_v2
    const { data: propertiesData, error: fetchError } = await supabase
      .from('properties_v2')
      .select('*')
      .in('id', propertyIds);
      
    if (fetchError) {
      console.error('Error fetching properties from properties_v2:', fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${propertiesData?.length || 0} properties in properties_v2 out of ${propertyIds.length} favorites`);
    
    if (!propertiesData || propertiesData.length === 0) {
      return [];
    }
    
    // Process all properties to ensure consistent format
    const processedProperties = propertiesData.map(property => {
      try {
        // Process property data
        const processedProperty = processPropertyData(property);
        
        if (!processedProperty) {
          console.warn(`Failed to process property ${property.id}`);
          return null;
        }
        
        // Extract and process images
        const propertyImages = extractImagesFromProperty(processedProperty);
        
        // Find primary image or use first available
        let primaryImage = '/noimage.png';
        if (propertyImages.length > 0) {
          const primary = propertyImages.find(img => img.is_primary);
          primaryImage = primary ? primary.url : propertyImages[0].url;
        }
        
        // Add primary image to property_details
        return {
          ...processedProperty,
          property_details: {
            ...(processedProperty.property_details || {}),
            primaryImage
          }
        };
      } catch (error) {
        console.error(`Error processing property ${property.id}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries

    return processedProperties;
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};

// Get all user's liked property IDs from properties_v2_likes
export const getUserLikedPropertyIds = async (userId: string): Promise<string[]> => {
  try {
    if (!userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('properties_v2_likes')
      .select('property_id')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user liked properties:', error);
      return [];
    }
    
    return data.map(item => item.property_id);
  } catch (error) {
    console.error('Error getting user liked property IDs:', error);
    return [];
  }
};

// Check if a property is liked by the user - UPDATED for properties_v2_likes
export const checkPropertyLike = async (propertyId: string, userId: string) => {
  try {
    if (!propertyId || !userId) {
      console.warn('Missing propertyId or userId in checkPropertyLike', { propertyId, userId });
      return { liked: false };
    }
    
    // Use properties_v2_likes table instead of property_likes
    const { data, error, count } = await supabase
      .from('properties_v2_likes')
      .select('id', { count: 'exact' })
      .eq('property_id', propertyId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error checking property like:', error);
      return { liked: false };
    }

    return { liked: (count || 0) > 0 };
  } catch (error) {
    console.error('Error checking property like:', error);
    return { liked: false };
  }
};

// Add a property to favorites - UPDATED for properties_v2_likes
export const addFavorite = async (propertyId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    // First check if like already exists to avoid duplicates
    const { count } = await supabase
      .from('properties_v2_likes')  // Updated to use properties_v2_likes table
      .select('id', { count: 'exact' })
      .eq('property_id', propertyId)
      .eq('user_id', user.user.id);
    
    // If like already exists, return success without inserting
    if ((count || 0) > 0) {
      return { success: true };
    }

    // Insert into properties_v2_likes table
    const { error } = await supabase
      .from('properties_v2_likes')  // Updated to use properties_v2_likes table
      .insert({
        property_id: propertyId,
        user_id: user.user.id
      });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding favorite:', error);
    return { success: false, error };
  }
};

// Remove a property from favorites - UPDATED for properties_v2_likes
export const removeFavorite = async (propertyId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    // Delete from properties_v2_likes table
    const { error } = await supabase
      .from('properties_v2_likes')  // Updated to use properties_v2_likes table
      .delete()
      .eq('property_id', propertyId)
      .eq('user_id', user.user.id);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error };
  }
};

// Toggle property like status - uses the updated functions
export const togglePropertyLike = async (propertyId: string, isLiked: boolean) => {
  try {
    // If isLiked is true, we want to add a favorite; otherwise remove it
    if (isLiked) {
      return await addFavorite(propertyId);
    } else {
      return await removeFavorite(propertyId);
    }
  } catch (error) {
    console.error('Error toggling property like:', error);
    return { success: false, error };
  }
};

// Submit visit request for a property
export const submitVisitRequest = async (
  propertyId: string,
  userId: string,
  visitDate: Date,
  message?: string
) => {
  try {
    const { data, error } = await supabase
      .from('property_visits')
      .insert({
        property_id: propertyId,
        user_id: userId,
        visit_date: visitDate.toISOString(),
        message: message || null,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error submitting visit request:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting visit request:', error);
    throw error;
  }
};

// Report property
export const reportProperty = async (
  propertyId: string,
  userId: string,
  reason: string,
  description?: string
) => {
  try {
    // Insert the report into a property_visits table or a general reports table
    const { data, error } = await supabase
      .from('property_visits')
      .insert({
        property_id: propertyId,
        user_id: userId,
        status: 'reported',
        message: `Reason: ${reason}${description ? ` - Details: ${description}` : ''}`,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error reporting property:', error);
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error reporting property:', error);
    throw error;
  }
};

interface SimilarPropertiesOptions {
  currentPropertyId: string;
  city?: string;
  state?: string;
  propertyType?: string;
  bedrooms?: number;
  price?: number;
  limit?: number;
}

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