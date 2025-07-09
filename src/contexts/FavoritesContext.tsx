// src/contexts/FavoritesContext.tsx
// Version: 1.0.0
// Last Modified: 10-05-2025 22:30 IST
// Purpose: Updated to use properties_v2_likes table

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { PropertyType } from '@/modules/owner/components/property/types';

interface FavoritesContextType {
  favorites: PropertyType[];
  favoriteCount: number;
  isFavorite: (propertyId: string) => boolean;
  addFavorite: (propertyId: string) => Promise<boolean>;
  removeFavorite: (propertyId: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Helper to process property data from properties_v2 table
const processPropertyData = (property: any) => {
  try {
    if (!property) {
      return null;
    }
    
    // Check if property_details exists
    const details = property.property_details || {};
    
    if (typeof details === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedDetails = JSON.parse(details);
        property.property_details = parsedDetails;
      } catch (e) {
        // Skip parsing on error
      }
    }
    
    // Extract basic details
    const basicDetails = details.basicDetails || {};
    const location = details.location || {};
    const rental = details.rental || {};
    const sale = details.sale || {};
    
    // Extract values with safe fallbacks
    const price = rental.rentAmount || sale.expectedPrice || details.price || 0;
    
    // Calculate bedrooms from bhkType or directly
    let bedrooms = 0;
    const bhkType = basicDetails.bhkType || '';
    if (bhkType) {
      const match = bhkType.match(/^(\d+)/);
      if (match && match[1]) {
        bedrooms = parseInt(match[1], 10);
      }
    }
    
    // Format into expected structure
    return {
      ...property,
      title: basicDetails.title || 'Property Listing',
      price: typeof price === 'number' ? price : parseInt(price) || 0,
      bedrooms: bedrooms || parseInt(details.bedrooms) || 0,
      bathrooms: parseInt(basicDetails.bathrooms) || 0,
      square_feet: parseInt(basicDetails.builtUpArea) || 0,
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      zip_code: location.pinCode || '',
      property_details: details
    };
  } catch (error) {
    return property; // Return original on error
  }
};

// Helper to extract primary image from property
const extractPrimaryImage = (property: any) => {
  try {
    const details = property.property_details || {};
    
    // Try various paths where images might be stored
    if (details.images && Array.isArray(details.images) && details.images.length > 0) {
      // Find primary image or use first
      const primary = details.images.find((img: any) => img.isPrimary || img.is_primary);
      return primary?.url || primary?.dataUrl || details.images[0]?.url || details.images[0]?.dataUrl;
    }
    
    if (details.photos?.images && Array.isArray(details.photos.images) && details.photos.images.length > 0) {
      const primary = details.photos.images.find((img: any) => img.isPrimary || img.is_primary);
      return primary?.url || primary?.dataUrl || details.photos.images[0]?.url || details.photos.images[0]?.dataUrl;
    }
    
    if (details.media?.images && Array.isArray(details.media.images) && details.media.images.length > 0) {
      const primary = details.media.images.find((img: any) => img.isPrimary || img.is_primary);
      return primary?.url || primary?.dataUrl || details.media.images[0]?.url || details.media.images[0]?.dataUrl;
    }
    
    // No images found
    return '/noimage.png';
  } catch (error) {
    return '/noimage.png';
  }
};

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<PropertyType[]>([]);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user's favorite properties
  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteCount(0);
      return;
    }

    setIsLoading(true);
    
    try {
      // Use properties_v2_likes table instead of property_likes
      const { data: likeData, error: likeError, count: likeCount } = await supabase
        .from('properties_v2_likes')
        .select('property_id', { count: 'exact' })
        .eq('user_id', user.id);
        
      if (likeError) {
        throw likeError;
      }
      
      // Update the favorite count immediately
      setFavoriteCount(likeCount || 0);
      
      if (!likeData || likeData.length === 0) {
        setFavorites([]);
        return;
      }
      
      // Extract property IDs
      const propertyIds = likeData.map(like => like.property_id);
      
      // Fetch properties from properties_v2 table
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties_v2')
        .select('*')
        .in('id', propertyIds);
        
      if (propertiesError) {
        throw propertiesError;
      }
      
      if (!propertiesData || propertiesData.length === 0) {
        setFavorites([]);
        return;
      }
      
      // Process all properties to ensure consistent format
      const processedProperties = propertiesData.map(property => {
        try {
          // Process property data
          const processedProperty = processPropertyData(property);
          
          if (!processedProperty) {
            return null;
          }
          
          // Extract primary image
          const primaryImage = extractPrimaryImage(processedProperty);
          
          // Add primary image to property_details
          return {
            ...processedProperty,
            property_details: {
              ...(processedProperty.property_details || {}),
              primaryImage
            }
          };
        } catch (error) {
          return null;
        }
      }).filter(Boolean); // Remove any null entries

      setFavorites(processedProperties);
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize favorites when user changes
  useEffect(() => {
    if (user) {
      fetchFavorites().catch(() => {
        // Handle error silently
      });
    } else {
      setFavorites([]);
      setFavoriteCount(0);
    }
  }, [user]);

  // Check if a property is favorited
  const isFavorite = (propertyId: string) => {
    return favorites.some(property => property.id === propertyId);
  };

  // Add a property to favorites
  const addFavorite = async (propertyId: string) => {
    if (!user) return false;

    try {
      // Check if already favorited
      const { data: existingLike, error: checkError } = await supabase
        .from('properties_v2_likes')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', user.id);
        
      if (checkError) {
        return false;
      }
      
      // If already exists, no need to add
      if (existingLike && existingLike.length > 0) {
        return true;
      }
      
      // Insert into properties_v2_likes table
      const { error } = await supabase
        .from('properties_v2_likes')
        .insert({
          property_id: propertyId,
          user_id: user.id
        });
        
      if (error) {
        return false;
      }

      // Update count and fetch updated favorites
      setFavoriteCount(prevCount => prevCount + 1);
      await fetchFavorites();
      return true;
    } catch (error) {
      return false;
    }
  };

  // Remove a property from favorites
  const removeFavorite = async (propertyId: string) => {
    if (!user) return false;

    try {
      // Delete from properties_v2_likes table
      const { error } = await supabase
        .from('properties_v2_likes')
        .delete()
        .eq('property_id', propertyId)
        .eq('user_id', user.id);

      if (error) {
        return false;
      }

      // Update local state immediately
      setFavorites(favorites.filter(property => property.id !== propertyId));
      setFavoriteCount(prevCount => Math.max(0, prevCount - 1));
      return true;
    } catch (error) {
      return false;
    }
  };

  // Refresh favorites
  const refreshFavorites = async () => {
    try {
      if (!user) {
        setFavorites([]);
        setFavoriteCount(0);
        return;
      }
      
      // First get just the count for immediate UI update
      const { count, error } = await supabase
        .from('properties_v2_likes')
        .select('property_id', { count: 'exact', head: true })
        .eq('user_id', user.id);
        
      if (!error && count !== null) {
        // Update count immediately
        setFavoriteCount(count);
      }
      
      // Then fetch the full data
      await fetchFavorites();
    } catch (error) {
      // Handle error silently
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount,
        isFavorite,
        addFavorite,
        removeFavorite,
        refreshFavorites,
        isLoading
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};