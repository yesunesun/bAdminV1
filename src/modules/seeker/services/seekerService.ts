// src/modules/seeker/services/seekerService.ts
// Version: 4.8.0
// Last Modified: 13-04-2025 15:30 IST
// Purpose: Fixed exports and optimized property likes functionality

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
  const propertyType = property.property_details?.propertyType?.toLowerCase() || '';

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

// Fetch properties with filters and pagination
export const fetchProperties = async (filters: PropertyFilters = {}) => {
  try {
    // Set default pagination values
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50; // Increased from default to show more properties
    const startIndex = (page - 1) * pageSize;

    // Build the query
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          url,
          is_primary,
          display_order
        ),
        profiles:owner_id (
          id,
          email
        )
      `);

    // Create a count query to get total results
    let countQuery = supabase
      .from('properties')
      .select('id', { count: 'exact' });

    // Apply filters to both queries
    if (filters.furnishing) {
      query = query.filter('property_details->furnishing', 'eq', filters.furnishing);
      countQuery = countQuery.filter('property_details->furnishing', 'eq', filters.furnishing);
    }

    if (filters.propertyAge) {
      query = query.filter('property_details->propertyAge', 'eq', filters.propertyAge);
      countQuery = countQuery.filter('property_details->propertyAge', 'eq', filters.propertyAge);
    }

    if (filters.searchQuery) {
      const searchFilter = `title.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%`;
      query = query.or(searchFilter);
      countQuery = countQuery.or(searchFilter);
    }

    if (filters.propertyType) {
      query = query.filter('property_details->propertyType', 'ilike', `%${filters.propertyType}%`);
      countQuery = countQuery.filter('property_details->propertyType', 'ilike', `%${filters.propertyType}%`);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
      countQuery = countQuery.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
      countQuery = countQuery.lte('price', filters.maxPrice);
    }

    if (filters.bedrooms !== undefined) {
      query = query.gte('bedrooms', filters.bedrooms);
      countQuery = countQuery.gte('bedrooms', filters.bedrooms);
    }

    if (filters.bathrooms !== undefined) {
      query = query.gte('bathrooms', filters.bathrooms);
      countQuery = countQuery.gte('bathrooms', filters.bathrooms);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'size_high':
          query = query.order('square_feet', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      // Default sort by creation date (newest first)
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(startIndex, startIndex + pageSize - 1);

    // Execute both queries in parallel
    const [dataResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);

    if (dataResult.error) {
      console.error('Error fetching properties:', dataResult.error);
      throw dataResult.error;
    }

    if (countResult.error) {
      console.error('Error counting properties:', countResult.error);
      throw countResult.error;
    }

    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    console.log(`Fetched ${dataResult.data?.length || 0} properties (page ${page}/${totalPages}, total: ${totalCount})`);

    // Process images to ensure consistent sorting
    const processedProperties = (dataResult.data || []).map(property => ({
      ...property,
      property_images: property.property_images
        ? property.property_images.sort((a, b) => {
          // Sort by is_primary first (primary images first)
          if (a.is_primary && !b.is_primary) return -1;
          if (!a.is_primary && b.is_primary) return 1;

          // Then sort by display_order if available
          return (a.display_order || 0) - (b.display_order || 0);
        })
        : []
    }));

    return {
      properties: processedProperties,
      totalCount,
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error('Comprehensive property fetch error:', error);
    throw error;
  }
};

// Fetch properties specifically for map display
export const fetchPropertiesForMap = async (filters: PropertyFilters = {}) => {
  try {
    // Set default pagination values - changed to 9 to match previous default
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 9; // Changed from 10 to 9 to match the original display count
    const startIndex = (page - 1) * pageSize;

    console.log(`Fetching properties for map: page=${page}, pageSize=${pageSize}, startIndex=${startIndex}`);

    // Build the query with necessary fields for map display
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        address,
        city,
        bedrooms,
        bathrooms,
        square_feet,
        property_details,
        property_images (
          id,
          url,
          is_primary,
          display_order
        )
      `);

    // Create a count query to get total results
    let countQuery = supabase
      .from('properties')
      .select('id', { count: 'exact' });

    // Apply filters to both queries
    if (filters.searchQuery) {
      const searchFilter = `title.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%`;
      query = query.or(searchFilter);
      countQuery = countQuery.or(searchFilter);
    }

    if (filters.propertyType) {
      query = query.filter('property_details->propertyType', 'ilike', `%${filters.propertyType}%`);
      countQuery = countQuery.filter('property_details->propertyType', 'ilike', `%${filters.propertyType}%`);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
      countQuery = countQuery.gte('price', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
      countQuery = countQuery.lte('price', filters.maxPrice);
    }

    if (filters.bedrooms !== undefined) {
      query = query.gte('bedrooms', filters.bedrooms);
      countQuery = countQuery.gte('bedrooms', filters.bedrooms);
    }

    if (filters.bathrooms !== undefined) {
      query = query.gte('bathrooms', filters.bathrooms);
      countQuery = countQuery.gte('bathrooms', filters.bathrooms);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'size_high':
          query = query.order('square_feet', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      // Default sort by creation date (newest first)
      query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(startIndex, startIndex + pageSize - 1);

    // Execute both queries in parallel
    const [dataResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);

    if (dataResult.error) {
      console.error('Error fetching properties for map:', dataResult.error);
      throw dataResult.error;
    }

    if (countResult.error) {
      console.error('Error counting properties for map:', countResult.error);
      throw countResult.error;
    }

    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    console.log(`Fetched ${dataResult.data?.length || 0} properties for map (page ${page}/${totalPages}, total: ${totalCount})`);

    // Process the data to include primary images
    const processedProperties = (dataResult.data || []).map(property => {
      let primaryImage = '/noimage.png';

      if (property.property_images && property.property_images.length > 0) {
        // Find primary image or use first image
        const primary = property.property_images.find(img => img.is_primary);
        primaryImage = (primary || property.property_images[0]).url;
      }

      // Add primary image to property_details
      return {
        ...property,
        property_details: {
          ...property.property_details,
          primaryImage
        }
      };
    });

    return {
      properties: processedProperties,
      totalCount,
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching properties for map:', error);
    throw error;
  }
};

// Fetch a single property by ID
export const fetchPropertyById = async (propertyId: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          url,
          is_primary,
          display_order
        ),
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
      throw new Error(`Property with ID ${propertyId} not found`);
    }

    // Process images to ensure consistent sorting
    const processedImages = data.property_images
      ? data.property_images.sort((a, b) => {
        // Sort by is_primary first (primary images first)
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;

        // Then sort by display_order if available
        return (a.display_order || 0) - (b.display_order || 0);
      })
      : [];

    // Create processed property with sorted images
    const processedProperty = {
      ...data,
      property_images: processedImages
    };

    // Record view count increment in the background (don't await)
    incrementPropertyViewCount(propertyId).catch(err => {
      console.error('Error incrementing view count:', err);
    });

    return processedProperty;
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
      // For anonymous users, just increment the property's view count
      // This could be implemented in the future if needed
      console.log('Anonymous user view - not tracked in database');
    }

    return { success: true };
  } catch (error) {
    console.error('Error recording property visit:', error);
    return { success: false };
  }
};

// Favorite properties functions

export const getUserFavorites = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('property_likes')
      .select(`
        property_id,
        properties:property_id (
          *,
          property_images (
            id,
            url,
            is_primary,
            display_order
          )
        )
      `)
      .eq('user_id', user.user.id);

    if (error) {
      throw error;
    }

    // Format the properties data
    return data.map(like => {
      const property = like.properties;

      // Find primary image or first image
      let primaryImage = '/noimage.png';
      if (property.property_images && property.property_images.length > 0) {
        const primary = property.property_images.find(img => img.is_primary);
        primaryImage = (primary || property.property_images[0]).url;
      }

      // Add primary image to property_details
      return {
        ...property,
        property_details: {
          ...property.property_details,
          primaryImage
        }
      };
    });
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
};

// Fixed version - Get all user's liked property IDs
export const getUserLikedPropertyIds = async (userId: string): Promise<string[]> => {
  try {
    if (!userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('property_likes')
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

// Fixed version with better error handling
export const checkPropertyLike = async (propertyId: string, userId: string) => {
  try {
    if (!propertyId || !userId) {
      console.warn('Missing propertyId or userId in checkPropertyLike', { propertyId, userId });
      return { liked: false };
    }
    
    // Use count instead of single to avoid 406 errors when no record exists
    const { data, error, count } = await supabase
      .from('property_likes')
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

export const addFavorite = async (propertyId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    // First check if like already exists to avoid duplicates
    const { count } = await supabase
      .from('property_likes')
      .select('id', { count: 'exact' })
      .eq('property_id', propertyId)
      .eq('user_id', user.user.id);
    
    // If like already exists, return success without inserting
    if ((count || 0) > 0) {
      return { success: true };
    }

    const { error } = await supabase
      .from('property_likes')
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

export const removeFavorite = async (propertyId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('property_likes')
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
    // Check if the table exists in the database
    // If not, this would require creating a table, but for now we'll use the existing structure

    // Insert the report into a property_reports table or a general reports table
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

    // Base query to fetch properties
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        address,
        city,
        state,
        bedrooms,
        bathrooms,
        square_feet,
        property_details,
        property_images (
          id,
          url,
          is_primary
        )
      `)
      .neq('id', currentPropertyId) // Exclude current property
      .order('created_at', { ascending: false }) // Latest properties first
      .limit(limit + 5); // Fetch a few extra to allow for filtering

    // Add location filters if available
    if (city) {
      query = query.eq('city', city);
    }

    if (state) {
      query = query.eq('state', state);
    }

    // Add property type filter if available
    if (propertyType) {
      query = query.filter('property_details->propertyType', 'ilike', `%${propertyType}%`);
    }

    // Add bedrooms filter if available (with some flexibility)
    if (bedrooms !== undefined && bedrooms !== null) {
      // Find properties with similar bedrooms count (±1)
      query = query.gte('bedrooms', Math.max(1, bedrooms - 1))
        .lte('bedrooms', bedrooms + 1);
    }

    // Add price range filter if available
    if (price !== undefined && price !== null && price > 0) {
      // Find properties within ±30% of the price (more flexibility)
      const minPrice = price * 0.7;
      const maxPrice = price * 1.3;
      query = query.gte('price', minPrice).lte('price', maxPrice);
    }

    console.log('[fetchSimilarProperties] Executing first query with filters');

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('[fetchSimilarProperties] Error fetching similar properties:', error);
      throw error;
    }

    const resultCount = data?.length || 0;
    console.log(`[fetchSimilarProperties] First query returned ${resultCount} properties`);

    // If we got some results, return them
    if (data && data.length >= 1) {
      return processSimilarProperties(data);
    }

    console.log('[fetchSimilarProperties] No similar properties found with strict criteria, trying with relaxed filters');

    // Try again with more relaxed filters
    let fallbackQuery = supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        address,
        city,
        state,
        bedrooms,
        bathrooms,
        square_feet,
        property_details,
        property_images (
          id,
          url,
          is_primary
        )
      `)
      .neq('id', currentPropertyId)
      .limit(limit + 2);

    // Keep city/state filter if available
    if (city) {
      fallbackQuery = fallbackQuery.eq('city', city);
    } else if (state) {
      fallbackQuery = fallbackQuery.eq('state', state);
    }

    // Remove other filters for a broader search

    const { data: fallbackData, error: fallbackError } = await fallbackQuery;

    if (fallbackError) {
      console.error('[fetchSimilarProperties] Error fetching fallback properties:', fallbackError);
      throw fallbackError;
    }

    const fallbackCount = fallbackData?.length || 0;
    console.log(`[fetchSimilarProperties] Fallback query returned ${fallbackCount} properties`);

    if (fallbackData && fallbackData.length >= 1) {
      return processSimilarProperties(fallbackData);
    }

    // If still no results, just get any recent properties
    console.log('[fetchSimilarProperties] No properties found with location criteria, fetching most recent properties');

    const { data: lastResortData, error: lastResortError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        address,
        city,
        state,
        bedrooms,
        bathrooms,
        square_feet,
        property_details,
        property_images (
          id,
          url,
          is_primary
        )
      `)
      .neq('id', currentPropertyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (lastResortError) {
      console.error('[fetchSimilarProperties] Error fetching last resort properties:', lastResortError);
      throw lastResortError;
    }

    const lastResortCount = lastResortData?.length || 0;
    console.log(`[fetchSimilarProperties] Last resort query returned ${lastResortCount} properties`);

    // Return whatever we found, or empty array
    return processSimilarProperties(lastResortData || []);
  } catch (error) {
    console.error('[fetchSimilarProperties] Error:', error);
    // Return empty array instead of throwing to prevent component errors
    return [];
  }
};

// Helper function for processing similar properties
const processSimilarProperties = (properties: any[]) => {
  return properties.map(property => {
    // Find primary image or first image
    let primaryImage = '/noimage.png';
    if (property.property_images && property.property_images.length > 0) {
      const primary = property.property_images.find((img: any) => img.is_primary);
      primaryImage = primary ? primary.url : property.property_images[0].url;
    }

    // Add primary image to property_details
    return {
      ...property,
      property_details: {
        ...property.property_details,
        primaryImage
      }
    };
  });
};