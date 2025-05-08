// src/contexts/FavoritesContext.tsx
// Version: 2.4.0
// Last Modified: 09-05-2025 21:15 IST
// Purpose: Fixed foreign key constraint error in property_likes table

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

// Helper to safely parse number
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

// Helper to process property data from properties_v2 table
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
   
   // Extract data from property_details using safe accessor
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
   
   // Format into expected structure
   return {
     ...property,
     title: getNestedValue(basicDetails, 'title', 'Property Listing'),
     price: safeParseNumber(price),
     bedrooms: bedrooms || safeParseNumber(getNestedValue(property, 'property_details.bedrooms', 0)),
     bathrooms: safeParseNumber(getNestedValue(basicDetails, 'bathrooms', 0)),
     square_feet: safeParseNumber(getNestedValue(basicDetails, 'builtUpArea', 0)),
     address: getNestedValue(location, 'address', ''),
     city: getNestedValue(location, 'city', ''),
     state: getNestedValue(location, 'state', ''),
     zip_code: getNestedValue(location, 'pinCode', ''),
     property_details: property.property_details
   };
 } catch (error) {
   console.error('Error in processPropertyData:', error);
   return property; // Return original on error
 }
};

// Helper to extract images from property data
const extractImagesFromProperty = (property: any) => {
 try {
   // Try to find images in property_details
   let images: any[] = [];
   const details = property.property_details || {};
   
   // Try various paths where images might be stored
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
     console.log(`Fetching favorites for user: ${user.id}`);
     
     // First get the liked property IDs from property_likes table
     const { data: likeData, error: likeError, count: likeCount } = await supabase
       .from('property_likes')
       .select('property_id', { count: 'exact' })
       .eq('user_id', user.id);
       
     if (likeError) {
       console.error('Error fetching liked property IDs:', likeError);
       throw likeError;
     }
     
     // Update the favorite count immediately based on likes data
     console.log(`Found ${likeCount || 0} favorited properties`);
     setFavoriteCount(likeCount || 0);
     
     if (!likeData || likeData.length === 0) {
       console.log('No favorites found for user');
       setFavorites([]);
       return;
     }
     
     // Extract property IDs
     const propertyIds = likeData.map(like => like.property_id);
     
     // Collect properties from both tables
     let allProperties: any[] = [];
     
     // Try to fetch from properties table first
     const { data: propertiesData, error: propertiesError } = await supabase
       .from('properties')
       .select('*')
       .in('id', propertyIds);
       
     if (!propertiesError && propertiesData && propertiesData.length > 0) {
       console.log(`Found ${propertiesData.length} properties in original properties table`);
       allProperties = [...propertiesData];
     }
     
     // Then try to fetch from properties_v2 table
     const { data: propertiesV2Data, error: propertiesV2Error } = await supabase
       .from('properties_v2')
       .select('*')
       .in('id', propertyIds);
       
     if (!propertiesV2Error && propertiesV2Data && propertiesV2Data.length > 0) {
       console.log(`Found ${propertiesV2Data.length} properties in properties_v2 table`);
       allProperties = [...allProperties, ...propertiesV2Data];
     }
     
     console.log(`Found ${allProperties.length} total properties out of ${propertyIds.length} favorites`);
     
     if (allProperties.length === 0) {
       setFavorites([]);
       return;
     }
     
     // Process all properties to ensure consistent format
     const validProperties = allProperties.map(property => {
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
     }).filter(Boolean);

     console.log(`Processed ${validProperties.length} valid favorite properties`);
     setFavorites(validProperties);
   } catch (error) {
     console.error('Error in fetchFavorites:', error);
     // Don't throw, just set empty favorites but keep favoriteCount from prior setting
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
     // Check if already favorited first to avoid duplicate attempts
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
     
     // Check if the property exists in the properties table
     const { data: propertyExists } = await supabase
       .from('properties')
       .select('id')
       .eq('id', propertyId)
       .single();
     
     if (!propertyExists) {
       console.log('Property not found in properties table, checking properties_v2');
       
       // Property not in properties table, so check if it exists in properties_v2
       const { data: propertyExistsV2 } = await supabase
         .from('properties_v2')
         .select('id')
         .eq('id', propertyId)
         .single();
       
       if (!propertyExistsV2) {
         console.error(`Property with ID ${propertyId} not found in any properties table`);
         return false;
       }
     }
     
     // Use RPC function to safely add property to favorites
     // This will handle the constraint check on the server side
     const { data: rpcResult, error: rpcError } = await supabase.rpc(
       'add_property_to_favorites',
       { p_property_id: propertyId, p_user_id: user.id }
     );
     
     if (rpcError) {
       console.error('RPC error adding favorite:', rpcError);
       
       // Fallback to direct insert if RPC not available
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
     }

     // Increment the favorite count immediately
     setFavoriteCount(prevCount => prevCount + 1);
     
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

     // Update local state immediately
     setFavorites(favorites.filter(property => property.id !== propertyId));
     setFavoriteCount(prevCount => Math.max(0, prevCount - 1));
     return true;
   } catch (error) {
     console.error('Error removing favorite:', error);
     return false;
   }
 };

 // Refresh favorites - optimized to update count first
 const refreshFavorites = async () => {
   try {
     if (!user) {
       setFavorites([]);
       setFavoriteCount(0);
       return;
     }
     
     // First get just the count for immediate UI update
     const { count, error } = await supabase
       .from('property_likes')
       .select('property_id', { count: 'exact', head: true })
       .eq('user_id', user.id);
       
     if (!error && count !== null) {
       // Update count immediately
       setFavoriteCount(count);
     }
     
     // Then fetch the full data
     await fetchFavorites();
   } catch (error) {
     console.error('Error refreshing favorites:', error);
     // Don't throw, just log the error
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