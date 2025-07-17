// src/modules/seeker/services/favoriteService.ts
// Version: 1.2.0
// Last Modified: 09-05-2025 16:30 IST
// Purpose: Updated to use properties_v2_likes table for all favorite functionality

import { supabase } from '@/lib/supabase';
import { processPropertyData, extractImagesFromProperty } from './utilityService';

// Get all user's liked property IDs from properties_v2_likes
export const getUserLikedPropertyIds = async (userId: string): Promise<string[]> => {
  try {
    if (!userId) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('properties_v2_likes') // Using properties_v2_likes instead of property_likes
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

// Check if a property is liked by the user - Using properties_v2_likes table
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

// Add a property to favorites - Using properties_v2_likes table
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

    // Insert into properties_v2_likes table without checking property existence
    // This assumes the foreign key constraint is either not present or is handled differently
    const { error } = await supabase
      .from('properties_v2_likes')  // Updated to use properties_v2_likes table
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

// Remove a property from favorites - Using properties_v2_likes table
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
      console.error('Error removing favorite:', error);
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

// Get user's favorite properties - Using properties_v2_likes and properties_v2 tables
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

    // Fetch properties from properties_v2 table
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
        
        // Extract and process images to find primary_image filename
        const propertyImages = extractImagesFromProperty(processedProperty);
        
        console.log(`🔍 [getUserFavorites] Property ${property.id} - extracted images:`, propertyImages);
        
        // Find primary image filename for simpleImageService
        let primaryImageFilename = null;
        if (propertyImages.length > 0) {
          const primary = propertyImages.find(img => img.is_primary);
          const imageToUse = primary || propertyImages[0];
          
          console.log(`🔍 [getUserFavorites] Property ${property.id} - using image:`, imageToUse);
          
          // Extract filename from the image URL or use the fileName property
          if (imageToUse.fileName) {
            primaryImageFilename = imageToUse.fileName;
          } else if (imageToUse.url && imageToUse.url.includes('/')) {
            // Try to extract filename from URL
            const urlParts = imageToUse.url.split('/');
            primaryImageFilename = urlParts[urlParts.length - 1];
          }
        }
        
        console.log(`🔍 [getUserFavorites] Property ${property.id} - final primaryImageFilename:`, primaryImageFilename);
        
        // Set primary_image field for simpleImageService (this is what the image service expects)
        const finalProperty = {
          ...processedProperty,
          primary_image: primaryImageFilename, // This is the key field that simpleImageService uses
          property_details: {
            ...(processedProperty.property_details || {}),
            primaryImage: primaryImageFilename // Keep legacy support
          }
        };
        
        console.log(`🔍 [getUserFavorites] Property ${property.id} - final property object:`, {
          id: finalProperty.id,
          primary_image: finalProperty.primary_image,
          property_images: finalProperty.property_images,
          property_details_primaryImage: finalProperty.property_details?.primaryImage
        });
        
        return finalProperty;
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