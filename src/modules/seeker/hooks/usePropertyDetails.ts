// src/modules/seeker/hooks/usePropertyDetails.ts
// Version: 5.2.0
// Last Modified: 01-05-2025 16:30 IST
// Purpose: Fixed data extraction for v2 format properties

import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface PropertyImage {
  id: string;
  url: string;
  is_primary?: boolean;
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
}

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

  // Function to normalize property data format (v1 or v2)
  const normalizePropertyData = (propertyData: any): PropertyDetails => {
    const isV2Format = propertyData._version === 'v2';
    console.log(`[usePropertyDetails] Property format detected: ${isV2Format ? 'v2' : 'v1'}`);
    
    // If it's v2 format, adapt it to ensure backward compatibility
    if (isV2Format) {
      // Check each property path and extract with fallbacks
      const rentalDetails = propertyData.rental || {};
      const locationDetails = propertyData.location || {};
      const basicDetails = propertyData.basicDetails || {};
      const featureDetails = propertyData.features || {};
      const flowDetails = propertyData.flow || { category: 'residential', listingType: 'rent' };
      
      // Extract price - for rent use rentAmount, for sale use price
      let price = 0;
      if (flowDetails.listingType === 'rent' && rentalDetails.rentAmount) {
        price = safeParseInt(rentalDetails.rentAmount);
      } else if (flowDetails.listingType === 'sale' && propertyData.price) {
        price = safeParseInt(propertyData.price);
      }
      
      // Extract bedrooms from bhkType 
      let bedrooms = 0;
      if (basicDetails.bhkType) {
        bedrooms = safeParseInt(basicDetails.bhkType);
      }
      
      // Extract bathrooms
      let bathrooms = safeParseInt(basicDetails.bathrooms);
      
      // Extract square feet
      let squareFeet = safeParseInt(basicDetails.builtUpArea);
      
      // Deep debug output for v2 format extraction
      console.log('[usePropertyDetails] V2 Format Extraction:');
      console.log('- Original rental amount:', rentalDetails.rentAmount);
      console.log('- Extracted price:', price);
      console.log('- Original bhkType:', basicDetails.bhkType);
      console.log('- Extracted bedrooms:', bedrooms);
      console.log('- Original bathrooms:', basicDetails.bathrooms);
      console.log('- Extracted bathrooms:', bathrooms);
      console.log('- Original builtUpArea:', basicDetails.builtUpArea);
      console.log('- Extracted square_feet:', squareFeet);
      console.log('- Property type:', basicDetails.propertyType);
      console.log('- Location address:', locationDetails.address);
      
      // Build property details object for backward compatibility
      const propertyDetails = {
        propertyType: basicDetails.propertyType || 'Residential',
        listingType: flowDetails.listingType || 'rent',
        amenities: featureDetails.amenities || [],
        furnishingStatus: rentalDetails.furnishingStatus || 'Unfurnished',
        facing: basicDetails.facing || '',
        floor: safeParseInt(basicDetails.floor),
        totalFloors: safeParseInt(basicDetails.totalFloors),
        propertyAge: basicDetails.propertyAge || '',
        // Add coordinates for map
        latitude: locationDetails.coordinates?.latitude,
        longitude: locationDetails.coordinates?.longitude,
        // Additional details for Property Details section
        yearBuilt: basicDetails.propertyAge || 'Not specified',
        availability: rentalDetails.availableFrom 
          ? new Date(rentalDetails.availableFrom).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) 
          : 'Not specified',
      };
      
      return {
        ...propertyData,
        // Set backward compatible fields
        title: propertyData.title || basicDetails.title || 'Untitled Property',
        description: featureDetails.description || null,
        price: price,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        square_feet: squareFeet,
        address: locationDetails.address || null,
        city: locationDetails.city || null,
        state: locationDetails.state || null,
        zip_code: locationDetails.pinCode || null,
        // Essential property details for backward compatibility
        property_details: propertyDetails
      };
    }
    
    // Return original data for v1 format
    return propertyData;
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

      // Make a direct query to get property data
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId);

      if (fetchError) {
        console.error('[usePropertyDetails] Error fetching property:', fetchError);
        throw new Error(`Failed to load property: ${fetchError.message}`);
      }

      if (!data || data.length === 0) {
        console.error('[usePropertyDetails] Property not found');
        throw new Error('Property not found');
      }

      // Get the property data (first result)
      const propertyData = data[0];
      
      // Check if we have a v2 format property
      const isV2Format = propertyData._version === 'v2';
      console.log(`[usePropertyDetails] Property version: ${isV2Format ? 'v2' : 'v1'}`);
      console.log('[usePropertyDetails] Raw property data:', propertyData);

      // Fetch images in a separate query with timestamp to avoid caching issues
      const timestamp = new Date().getTime();
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false }) // Newest images first
        .then(result => {
          // Add a cache-busting query param to image URLs
          if (result.data) {
            return {
              ...result,
              data: result.data.map(img => ({
                ...img,
                url: img.url.includes('?')
                  ? `${img.url}&_t=${timestamp}`
                  : `${img.url}?_t=${timestamp}`
              }))
            };
          }
          return result;
        });

      if (imagesError) {
        console.error('[usePropertyDetails] Error fetching images:', imagesError);
      }

      console.log('[usePropertyDetails] Images found:', imagesData?.length || 0);

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

      // Create the normalized property object with consistent format
      const normalizedProperty = normalizePropertyData({
        ...propertyData,
        property_images: imagesData || [],
        ownerInfo: ownerInfo
      });

      console.log('[usePropertyDetails] Normalized property object:', normalizedProperty);

      setProperty(normalizedProperty);
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
    refreshData
  };
};