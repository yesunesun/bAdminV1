// src/contexts/FavoritesContext.tsx
// Version: 1.4.0
// Last Modified: 05-04-2025 16:45 IST
// Purpose: Cleaned up code and removed console logs

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
      // Direct join query to get properties with their likes
      const { data, error } = await supabase
        .from('property_likes')
        .select(`
          property_id,
          properties:property_id (
            id,
            title,
            address,
            city,
            price,
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
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }
      
      // Filter out any null properties and process the data
      const validProperties = data
        .filter(item => item.properties !== null)
        .map(item => {
          const property = item.properties;
          
          // Find primary image or use first available
          let primaryImage = '/noimage.png';
          if (property.property_images && property.property_images.length > 0) {
            const primary = property.property_images.find(img => img.is_primary);
            primaryImage = primary ? primary.url : property.property_images[0].url;
          }
          
          // Ensure property_details exists and add primary image
          return {
            ...property,
            property_details: {
              ...(property.property_details || {}),
              primaryImage
            }
          };
        });

      setFavorites(validProperties);
      setFavoriteCount(validProperties.length);
    } catch (error) {
      console.error('Error in fetchFavorites:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize favorites when user changes
  useEffect(() => {
    if (user) {
      fetchFavorites().catch(err => {
        console.error('Initial favorites load failed:', err);
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
      // First check if already favorited
      const { data: existingLike, error: checkError } = await supabase
        .from('property_likes')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', user.id);
        
      if (checkError) {
        console.error('Error checking existing favorite:', checkError);
        return false;
      }
      
      // If already exists, no need to add
      if (existingLike && existingLike.length > 0) {
        return true;
      }
      
      // Add to favorites
      const { error } = await supabase
        .from('property_likes')
        .insert({
          property_id: propertyId,
          user_id: user.id
        });

      if (error) {
        console.error('Error adding favorite:', error);
        return false;
      }

      // Update local state
      await fetchFavorites();
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  };

  // Remove a property from favorites
  const removeFavorite = async (propertyId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('property_likes')
        .delete()
        .eq('property_id', propertyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing favorite:', error);
        return false;
      }

      // Update local state
      setFavorites(favorites.filter(property => property.id !== propertyId));
      setFavoriteCount(prevCount => Math.max(0, prevCount - 1));
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  };

  // Refresh favorites
  const refreshFavorites = async () => {
    try {
      await fetchFavorites();
    } catch (error) {
      console.error('Error refreshing favorites:', error);
      throw error;
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