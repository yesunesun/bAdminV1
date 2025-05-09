// src/modules/seeker/hooks/usePropertyDetails.ts
// Version: 8.0.0
// Last Modified: 09-05-2025 21:45 IST
// Purpose: Updated to support Supabase storage for property images

import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// Constants
const STORAGE_BUCKET = 'property-images-v2';

export interface PropertyImage {
  id: string;
  url?: string;
  dataUrl?: string;
  fileName?: string;
  is_primary?: boolean;
  isPrimary?: boolean;
  display_order?: number;
  created_at?: string;
}

export interface PropertyDetails {
  id: string;
  title: string;
  description: string | null;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  property_details: any;
  owner_id: string;
  property_images: PropertyImage[];
  ownerInfo: {
    id: string;
    email: string | null;
    phone: string | null;
  } | null;
  // Added for v2 format
  _version?: string;
  flow?: {
    category: string;
    listingType: string;
  };
  rental?: {
    rentAmount: number;
    availableFrom: string;
    leaseDuration: string;
    rentNegotiable: boolean;
    securityDeposit: number;
    furnishingStatus: string;
    preferredTenants: string[];
    maintenanceCharges: number | null;
  };
  features?: {
    hasGym: boolean;
    parking: string;
    amenities: string[];
    direction: string;
    description: string;
    petFriendly: boolean;
    powerBackup: string;
    waterSupply: string;
    gatedSecurity: boolean;
    nonVegAllowed: boolean;
    hasSimilarUnits: boolean;
    secondaryNumber: string;
    propertyCondition: string;
    propertyShowOption: string;
  };
  location?: {
    area: string;
    city: string;
    state: string;
    address: string;
    pinCode: string;
    district: string;
    landmark: string;
    locality: string;
    flatPlotNo: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  basicDetails?: {
    floor: number;
    title: string;
    facing: string;
    bhkType: string;
    balconies: string;
    bathrooms: string;
    builtUpArea: number;
    propertyAge: string;
    totalFloors: number;
    propertyType: string;
    possessionDate: string;
    builtUpAreaUnit: string;
  };
  photos?: {
    images: PropertyImage[];
  };
  sale?: {
    expectedPrice: number;
    maintenanceCost: number;
    kitchenType: string;
    possessionDate: string;
    priceNegotiable: boolean;
  };
}

// Get a public URL for an image stored in Supabase storage
const getStorageImageUrl = (propertyId: string, fileName: string): string => {
  if (!propertyId || !fileName) return '/noimage.png';
  
  // Handle legacy dataUrl format
  if (fileName.startsWith('data:image/')) {
    return fileName;
  }
  
  // Handle legacy images that don't have a real file name
  if (fileName.startsWith('legacy-') || fileName.startsWith('img-')) {
    return '/noimage.png';
  }
  
  // Get the Supabase public URL
  const { data } = supabase
    .storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(`${propertyId}/${fileName}`);
    
  return data.publicUrl;
};

export const usePropertyDetails = (refreshDependency = 0) => {
  const params = useParams();
  const location = useLocation();
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  // Extract property ID from URL manually to ensure we're getting the right value
  const propertyId = params.id || location.pathname.split('/').pop();

  // Parse numeric values safely
  const safeParseInt = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Extract the first numeric part if it's something like "2 BHK"
      const numMatch = value.match(/^(\d+)/);
      if (numMatch && numMatch[1]) {
        return parseInt(numMatch[1], 10) || 0;
      }
      return parseInt(value, 10) || 0;
    }
    return 0;
  };

  // Helper function to extract images from nested property_details structure
  const extractImagesFromPropertyDetails = (propertyData: any): PropertyImage[] => {
    console.log('[usePropertyDetails] Attempting to extract images from property_details');
    
    if (!propertyData || !propertyData.property_details) {
      console.log('[usePropertyDetails] No property_details available');
      return [];
    }
    
    const propertyId = propertyData.id;
    const timestamp = new Date().getTime();
    let extractedImages: PropertyImage[] = [];
    
    try {
      // Parse property_details if it's a string
      let details = propertyData.property_details;
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
          console.log('[usePropertyDetails] Successfully parsed property_details string to object');
        } catch (e) {
          console.error('[usePropertyDetails] Failed to parse property_details as string:', e);
        }
      }
      
      // PRIORITY 1: Check for new imageFiles format first (fileName based)
      if (details && details.imageFiles && Array.isArray(details.imageFiles)) {
        console.log('[usePropertyDetails] Found imageFiles in new format:', details.imageFiles.length);
        
        // These are in the new format with fileNames that point to Supabase storage
        const newFormatImages = details.imageFiles.map((img: any, idx: number) => {
          // Generate full URL from fileName
          const url = getStorageImageUrl(propertyId, img.fileName);
          
          return {
            id: img.id || `img-${idx}`,
            fileName: img.fileName,
            url: url,
            is_primary: !!img.isPrimary,
            isPrimary: !!img.isPrimary,
            display_order: idx
          };
        });
        
        console.log('[usePropertyDetails] Processed new format images:', newFormatImages.length);
        return newFormatImages;
      }
      
      // PRIORITY 2: Check for legacy dataUrl format
      if (details && details.images && Array.isArray(details.images)) {
        const firstImage = details.images[0];
        console.log('[DEBUG] Checking first image format:', firstImage && JSON.stringify(firstImage));
        
        // Check if images are in dataUrl format (from previous version)
        if (firstImage && firstImage.dataUrl) {
          console.log('[SUCCESS] Found images in dataUrl format:', details.images.length);
          
          // Convert to standard format with both url and dataUrl for compatibility
          return details.images.map((img: any, idx: number) => ({
            id: img.id || `img-${idx}`,
            url: img.dataUrl,
            dataUrl: img.dataUrl,
            is_primary: !!img.isPrimary,
            isPrimary: !!img.isPrimary,
            display_order: idx
          }));
        }
      }
      
      // PRIORITY 3: Try various other paths for legacy formats
      if (details?.details?.media?.photos?.images) {
        console.log('[usePropertyDetails] Found images in details.media.photos.images');
        extractedImages = details.details.media.photos.images;
      } else if (details?.details?.media?.images) {
        console.log('[usePropertyDetails] Found images in details.media.images');
        extractedImages = details.details.media.images;
      } else if (details?.media?.photos?.images) {
        console.log('[usePropertyDetails] Found images in media.photos.images');
        extractedImages = details.media.photos.images;
      } else if (details?.media?.images) {
        console.log('[usePropertyDetails] Found images in media.images');
        extractedImages = details.media.images;
      } else if (details?.photos?.images) {
        console.log('[usePropertyDetails] Found images in photos.images');
        extractedImages = details.photos.images;
      } else if (details?.images && Array.isArray(details.images)) {
        console.log('[usePropertyDetails] Found direct images array');
        extractedImages = details.images;
      } else if (propertyData.photos?.images) {
        console.log('[usePropertyDetails] Found images in top-level photos.images');
        extractedImages = propertyData.photos.images;
      } else if (propertyData.property_images && Array.isArray(propertyData.property_images)) {
        console.log('[usePropertyDetails] Using property_images array directly, count:', propertyData.property_images.length);
        extractedImages = propertyData.property_images;
      }
      
      // Process standard image formats
      if (extractedImages && Array.isArray(extractedImages) && extractedImages.length > 0) {
        console.log('[usePropertyDetails] Processing standard image format, count:', extractedImages.length);
        console.log('[DEBUG] First extracted image:', JSON.stringify(extractedImages[0]));
        
        // Filter and transform image objects to a consistent format
        const processedImages = extractedImages
          .filter(img => img && (img.url || img.dataUrl)) // Keep only images with url or dataUrl
          .map((img, idx) => {
            // Handle different image formats and ensure consistent properties
            const imageSource = img.dataUrl || img.url || (typeof img === 'string' ? img : '');
            
            // Create standardized image object with both formats of properties
            return {
              id: img.id || `img-${idx}`,
              url: imageSource, // Standard property expected by most components
              dataUrl: img.dataUrl || imageSource, // Keep dataUrl if available
              is_primary: !!(img.is_primary || img.isPrimary), // Standard snake_case format
              isPrimary: !!(img.isPrimary || img.is_primary), // CamelCase format for newer code
              display_order: img.display_order || idx
            };
          });
        
        console.log('[DEBUG] Processed images count:', processedImages.length);
        if (processedImages.length > 0) {
          console.log('[DEBUG] First processed image:', JSON.stringify(processedImages[0]));
        }
        
        return processedImages;
      }
    } catch (error) {
      console.error('[usePropertyDetails] Error extracting images:', error);
    }
    
    console.log('[usePropertyDetails] No images found in property_details');
    return [];
  };

  // The main data fetching function
  const fetchPropertyDetails = useCallback(async () => {
    if (!propertyId) {
      console.error('[usePropertyDetails] No property ID found in URL');
      setLoading(false);
      setError('No property ID found');
      return;
    }

    setLoading(true);

    try {
      console.log(`[usePropertyDetails] Fetching property with ID: ${propertyId}, refresh: ${refreshDependency}`);

      // First, try to fetch from properties_v2 table
      let { data, error: fetchError } = await supabase
        .from('properties_v2')
        .select('*')
        .eq('id', propertyId);

      // If not found or table doesn't exist, fall back to original properties table
      if (fetchError || !data || data.length === 0) {
        console.log('[usePropertyDetails] Property not found in properties_v2 table or table does not exist. Falling back to properties table.');
        
        const result = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId);
          
        data = result.data;
        fetchError = result.error;
      }

      if (fetchError) {
        console.error('[usePropertyDetails] Error fetching property:', fetchError);
        throw new Error(`Failed to load property: ${fetchError.message}`);
      }

      if (!data || data.length === 0) {
        console.error('[usePropertyDetails] Property not found in either properties_v2 or properties tables');
        throw new Error('Property not found');
      }

      // Get the property data (first result)
      const propertyData = data[0];
      console.log('[DEBUG] Raw property data fetched successfully');
      
      // Extract the nested data from property_details if it exists
      let extractedData: any = { ...propertyData };
      
      // Check if property_details is an object with the data we need
      if (propertyData.property_details && typeof propertyData.property_details === 'object') {
        console.log('[usePropertyDetails] Extracting data from property_details object');
        
        // Extract all the nested properties
        const details = propertyData.property_details;
        
        // Check each key that might be in property_details
        const keysToExtract = ['basicDetails', 'flow', 'features', 'location', 'sale', 'rental', '_version', 'photos'];
        
        keysToExtract.forEach(key => {
          if (details[key]) {
            console.log(`[usePropertyDetails] Found ${key} in property_details`);
            extractedData[key] = details[key];
          }
        });
      }
      // If property_details is a string, try to parse it
      else if (propertyData.property_details && typeof propertyData.property_details === 'string') {
        console.log('[usePropertyDetails] Attempting to parse property_details string');
        
        try {
          const parsedDetails = JSON.parse(propertyData.property_details);
          
          // Extract all the nested properties from parsed JSON
          const keysToExtract = ['basicDetails', 'flow', 'features', 'location', 'sale', 'rental', '_version', 'photos'];
          
          keysToExtract.forEach(key => {
            if (parsedDetails[key]) {
              console.log(`[usePropertyDetails] Found ${key} in parsed property_details`);
              extractedData[key] = parsedDetails[key];
            }
          });
        } catch (parseError) {
          console.error('[usePropertyDetails] Error parsing property_details string:', parseError);
        }
      }
      
      // 1. Extract images from property_details structure
      const extractedImages = extractImagesFromPropertyDetails(propertyData);
      console.log('[usePropertyDetails] Images extracted from property_details:', extractedImages.length);
      
      // 2. As a fallback, fetch images from property_images table
      const timestamp = new Date().getTime();
      let dbImages: PropertyImage[] = [];
      
      if (extractedImages.length === 0) {
        console.log('[usePropertyDetails] No images found in property_details, falling back to property_images table');
        
        const { data: imagesData, error: imagesError } = await supabase
          .from('property_images')
          .select('*')
          .eq('property_id', propertyId)
          .order('created_at', { ascending: false }); // Newest images first
        
        if (imagesError) {
          console.error('[usePropertyDetails] Error fetching images from table:', imagesError);
        } else if (imagesData && imagesData.length > 0) {
          console.log('[usePropertyDetails] Found images in property_images table:', imagesData.length);
          
          // Add cache-busting to image URLs and transform to consistent format
          dbImages = imagesData.map(img => ({
            id: img.id,
            url: img.url.includes('?')
              ? `${img.url}&_t=${timestamp}`
              : `${img.url}?_t=${timestamp}`,
            is_primary: !!img.is_primary,
            isPrimary: !!img.is_primary, // Add camelCase version for newer code
            display_order: img.display_order || 999
          }));
        }
      }
      
      // Merge images, preferring JSON-extracted ones if available
      const allImages = extractedImages.length > 0 ? extractedImages : dbImages;
      console.log('[usePropertyDetails] Final combined image count:', allImages.length);
      
      // Debug - log image URLs for inspection
      if (allImages.length > 0) {
        console.log('[DEBUG] First image details:', {
          id: allImages[0].id,
          url: allImages[0].url ? allImages[0].url.substring(0, 30) + '...' : 'No URL',
          dataUrl: allImages[0].dataUrl ? allImages[0].dataUrl.substring(0, 30) + '...' : 'No dataUrl',
          fileName: allImages[0].fileName || 'No fileName',
          is_primary: allImages[0].is_primary,
          isPrimary: allImages[0].isPrimary,
          display_order: allImages[0].display_order
       });
     }

     // Fetch owner info
     let ownerInfo = null;
     if (propertyData.owner_id) {
       const { data: ownerData } = await supabase
         .from('profiles')
         .select('id, email, phone')
         .eq('id', propertyData.owner_id)
         .maybeSingle();

       ownerInfo = ownerData;
     }

     // Check if the user has liked this property
     if (user) {
       const { data: likeData } = await supabase
         .from('property_likes')
         .select('id')
         .eq('property_id', propertyId)
         .eq('user_id', user.id)
         .maybeSingle();

       setIsLiked(!!likeData);
     }

     // Ensure we have a basicDetails object 
     if (!extractedData.basicDetails) {
       console.log('[usePropertyDetails] Creating default basicDetails object');
       
       // Create a default basicDetails object
       extractedData.basicDetails = {
         propertyType: 'Residential',
         bhkType: extractedData.bedrooms ? `${extractedData.bedrooms} BHK` : '',
         bathrooms: extractedData.bathrooms || '',
         builtUpArea: extractedData.square_feet || 0,
         builtUpAreaUnit: 'sqft',
         floor: 0,
         totalFloors: 0,
         facing: '',
         propertyAge: '',
         possessionDate: ''
       };
     }
     
     // Add images and owner info to the final property object
     extractedData.property_images = allImages;
     extractedData.ownerInfo = ownerInfo;

     setProperty(extractedData);
     setError(null);

   } catch (err) {
     console.error('[usePropertyDetails] Error:', err);
     setError(err instanceof Error ? err.message : 'Failed to load property details');
     setProperty(null);
   } finally {
     setLoading(false);
   }
 }, [propertyId, user, refreshDependency]);

 // Function to manually refresh data
 const refreshData = useCallback(async () => {
   console.log('[usePropertyDetails] Manual refresh requested');
   await fetchPropertyDetails();
 }, [fetchPropertyDetails]);

 // Fetch property details when component mounts or propertyId/user/refreshDependency changes
 useEffect(() => {
   console.log('[usePropertyDetails] Refresh dependency changed, value:', refreshDependency);
   fetchPropertyDetails();
 }, [propertyId, user, refreshDependency, fetchPropertyDetails]);

 // Toggle property like function
 const toggleLike = async () => {
   if (!propertyId || !user) {
     return { success: false, message: 'You need to be logged in to save properties' };
   }

   try {
     if (isLiked) {
       await supabase
         .from('property_likes')
         .delete()
         .eq('property_id', propertyId)
         .eq('user_id', user.id);
     } else {
       await supabase
         .from('property_likes')
         .insert({
           property_id: propertyId,
           user_id: user.id,
           created_at: new Date().toISOString()
         });
     }

     setIsLiked(!isLiked);
     return {
       success: true,
       message: isLiked ? 'Property removed from saved items' : 'Property saved successfully'
     };
   } catch (err) {
     console.error('[usePropertyDetails] Toggle like error:', err);
     return {
       success: false,
       message: 'Failed to update saved status. Please try again.'
     };
   }
 };

 return {
  property,
  loading,
  error,
  isLiked,
  toggleLike,
  refreshData,
  getImageUrl: (image: PropertyImage) => {
    if (!propertyId) return '/noimage.png';
    
    // Handle legacy dataUrl format
    if (image.dataUrl?.startsWith('data:image/')) {
      return image.dataUrl;
    }
    
    // Handle fileName-based format
    if (propertyId && image.fileName && !image.fileName.startsWith('legacy-')) {
      return getStorageImageUrl(propertyId, image.fileName);
    }
    
    // Fall back to standard URL if available
    if (image.url) {
      return image.url;
    }
    
    return '/noimage.png';
  }
};
};