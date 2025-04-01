// src/modules/seeker/services/seekerService.ts
// Version: 2.1.0
// Last Modified: 02-04-2025 21:15 IST
// Purpose: Comprehensive property seeker services with enhanced functionality

import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/modules/owner/components/property/types';

export interface PropertyFilters {
  searchQuery?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: string;
}

export const fetchProperties = async (filters: PropertyFilters = {}) => {
  try {
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
    
    // Apply filters
    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%`);
    }
    
    if (filters.propertyType) {
      query = query.filter('property_details->propertyType', 'ilike', `%${filters.propertyType}%`);
    }
    
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters.bedrooms !== undefined) {
      query = query.gte('bedrooms', filters.bedrooms);
    }
    
    if (filters.bathrooms !== undefined) {
      query = query.gte('bathrooms', filters.bathrooms);
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
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
    
    // Process images to ensure consistent sorting
    const processedProperties = (data || []).map(property => ({
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
      totalCount: processedProperties.length 
    };
  } catch (error) {
    console.error('Comprehensive property fetch error:', error);
    throw error;
  }
};

// Fetch a single property by ID with owner information
export const fetchPropertyById = async (propertyId: string) => {
  const { data, error } = await supabase
    .from('properties')
    .select(`
      *,
      profiles:owner_id (
        id,
        email,
        phone,
        role
      ),
      property_images (
        id,
        url,
        is_primary,
        display_order
      )
    `)
    .eq('id', propertyId)
    .single();
  
  if (error) {
    console.error('Error fetching property details:', error);
    throw error;
  }
  
  if (!data) {
    throw new Error('Property not found');
  }
  
  // Sort images by display_order if available
  if (data.property_images && Array.isArray(data.property_images)) {
    data.property_images.sort((a, b) => {
      // Sort by is_primary first (primary images first)
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      
      // Then sort by display_order if available
      if (a.display_order !== null && b.display_order !== null) {
        return a.display_order - b.display_order;
      }
      
      return 0;
    });
  }
  
  return data;
};

// Check if property is in user's favorites
export const checkIsFavorite = async (propertyId: string) => {
  const { data, error } = await supabase
    .from('property_likes')
    .select('*')
    .eq('property_id', propertyId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking favorite status:', error);
    throw error;
  }
  
  return !!data;
};

// Check if property is liked by a specific user
export const checkPropertyLike = async (propertyId: string, userId: string) => {
  const { data, error } = await supabase
    .from('property_likes')
    .select('*')
    .eq('property_id', propertyId)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error checking property like status:', error);
    throw error;
  }
  
  return { 
    liked: data && data.length > 0,
    data: data?.[0] || null
  };
};

// Toggle property favorite status
export const toggleFavorite = async (propertyId: string) => {
  // First check if property is already favorited
  const isFavorite = await checkIsFavorite(propertyId);
  
  if (isFavorite) {
    // Remove from favorites
    const { error } = await supabase
      .from('property_likes')
      .delete()
      .eq('property_id', propertyId);
    
    if (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
    
    return false;
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('property_likes')
      .insert({ property_id: propertyId });
    
    if (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
    
    return true;
  }
};

// Toggle property like status (with user_id parameter)
export const togglePropertyLike = async (propertyId: string, userId: string) => {
  // Check if the property is already liked by this user
  const { liked } = await checkPropertyLike(propertyId, userId);
  
  if (liked) {
    // Remove like
    const { error } = await supabase
      .from('property_likes')
      .delete()
      .eq('property_id', propertyId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error removing property like:', error);
      throw error;
    }
    
    return { liked: false };
  } else {
    // Add like
    const { error } = await supabase
      .from('property_likes')
      .insert({ 
        property_id: propertyId,
        user_id: userId 
      });
    
    if (error) {
      console.error('Error adding property like:', error);
      throw error;
    }
    
    return { liked: true };
  }
};

// Submit a request to visit a property
export const submitVisitRequest = async (
  propertyId: string,
  userId: string,
  visitDate: Date,
  message?: string
) => {
  const { error } = await supabase
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
  
  return true;
};

// Report a property for inappropriate content, inaccuracy, etc.
export const reportProperty = async (
  propertyId: string,
  userId: string,
  reason: string,
  description?: string
) => {
  // Assuming there's a property_reports table in the database
  const { error } = await supabase
    .from('property_reports')
    .insert({
      property_id: propertyId,
      user_id: userId,
      reason: reason,
      description: description || null,
      status: 'pending',
      created_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error reporting property:', error);
    throw error;
  }
  
  return true;
};

// Get user's favorite properties
export const getUserFavorites = async () => {
  // First get all liked property IDs
  const { data: likedProperties, error: likesError } = await supabase
    .from('property_likes')
    .select('property_id');
  
  if (likesError) {
    console.error('Error fetching liked properties:', likesError);
    throw likesError;
  }
  
  if (!likedProperties || likedProperties.length === 0) {
    return [];
  }
  
  // Get the property details for all liked properties
  const propertyIds = likedProperties.map(like => like.property_id);
  
  const { data: properties, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .in('id', propertyIds);
  
  if (propertiesError) {
    console.error('Error fetching favorited properties:', propertiesError);
    throw propertiesError;
  }
  
  return properties || [];
};

// Remove property from favorites
export const removeFavorite = async (propertyId: string) => {
  const { error } = await supabase
    .from('property_likes')
    .delete()
    .eq('property_id', propertyId);
  
  if (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
  
  return true;
};