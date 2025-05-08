// src/modules/seeker/services/favoriteService.ts
// Version: 1.1.0
// Last Modified: 09-05-2025 23:00 IST
// Purpose: Fixed property favorites compatibility with properties table

import { supabase } from '@/lib/supabase';
import { processPropertyData, extractImagesFromProperty } from './utilityService';

// Check if a property exists in the properties table 
// (this is required due to foreign key constraint)
const checkPropertyExists = async (propertyId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('properties') // Using original properties table for foreign key
      .select('id')
      .eq('id', propertyId)
      .single();
      
    if (error || !data) {
      console.log(`Property ${propertyId} not found in properties table`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking property existence:', error);
    return false;
  }
};

// Get all user's liked property IDs
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

// Check if a property is liked by the user
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

// Add a property to favorites
export const addFavorite = async (propertyId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }
    
    // Check if property exists in properties table (required for foreign key constraint)
    const propertyExists = await checkPropertyExists(propertyId);
    
    if (!propertyExists) {
      console.error(`Property ${propertyId} not found in properties table, cannot add to favorites`);
      return { success: false, error: { message: 'Property not found in compatible table' } };
    }

    // First check if like already exists to avoid duplicates
    const { count } = await supabase
      .from('property_likes')
      .select('id', { count: 'exact', head: true })
      .eq('property_id', propertyId)
      .eq('user_id', user.user.id);
    
    // If like already exists, return success without inserting
    if ((count || 0) > 0) {
      return { success: true };
    }

    // Insert with explicit column identification
    const { error } = await supabase
      .from('property_likes')
      .insert({
        property_id: propertyId,
        user_id: user.user.id
      });

    if (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding favorite:', error);
    return { success: false, error };
  }
};

// Remove a property from favorites
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
      console.error('Error removing favorite:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error };
  }
};

// Toggle property like status
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

// Get user's favorite properties
export const getUserFavorites = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user?.user) {
      throw new Error('User not authenticated');
    }

    // Get the user's liked property IDs
    const { data: likeData, error: likeError } = await supabase
      .from('property_likes')
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

    // Try to fetch from properties table first
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('*')
      .in('id', propertyIds);
      
    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      return [];
    }
    
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