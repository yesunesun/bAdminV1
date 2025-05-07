// src/modules/seeker/hooks/usePropertyDetails.ts
// Version: 5.6.0
// Last Modified: 07-05-2025 16:30 IST
// Purpose: Updated to fetch data from properties_v2 table with fallback to original properties table

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
  sale?: {
    expectedPrice: number;
    maintenanceCost: number;
    kitchenType: string;
    possessionDate: string;
    priceNegotiable: boolean;
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

      // Add this for debugging - log raw DB results
      console.log('=================== DB QUERY RESULTS ===================');
      console.log('RAW DB RESULT:', data);
      if (data && data.length > 0) {
        console.log('FIRST RECORD FROM DB:', {
          id: data[0].id,
          hasData: !!data[0],
          keys: Object.keys(data[0]),
          dataType: typeof data[0]
        });
        
        // Log complete stringified JSON
        console.log('COMPLETE DB RECORD AS JSON:', JSON.stringify(data[0], null, 2));
        
        // Check if property_details contains nested JSON
        if (data[0].property_details) {
          console.log('PROPERTY_DETAILS FIELD TYPE:', typeof data[0].property_details);
          
          // Log property_details content
          if (typeof data[0].property_details === 'object') {
            console.log('PROPERTY_DETAILS CONTENT:', data[0].property_details);
            console.log('PROPERTY_DETAILS KEYS:', Object.keys(data[0].property_details));
            
            // Check for basic details inside property_details
            if (data[0].property_details.basicDetails) {
              console.log('BASIC DETAILS FOUND IN PROPERTY_DETAILS:', 
                data[0].property_details.basicDetails);
            }
          } else if (typeof data[0].property_details === 'string') {
            // Attempt to parse if it's a JSON string
            try {
              const parsedDetails = JSON.parse(data[0].property_details);
              console.log('PARSED PROPERTY_DETAILS:', parsedDetails);
              
              if (parsedDetails.basicDetails) {
                console.log('BASIC DETAILS FOUND IN PARSED PROPERTY_DETAILS:',
                  parsedDetails.basicDetails);
              }
            } catch (parseError) {
              console.error('ERROR PARSING PROPERTY_DETAILS STRING:', parseError);
            }
          }
        }
      } else {
        console.error('[usePropertyDetails] No data returned from database query');
      }
      console.log('=========================================================');

      if (!data || data.length === 0) {
        console.error('[usePropertyDetails] Property not found in either properties_v2 or properties tables');
        throw new Error('Property not found');
      }

      // Get the property data (first result)
      const propertyData = data[0];
      
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
            console.log(`[usePropertyDetails] Found ${key} in property_details:`, details[key]);
            extractedData[key] = details[key];
          }
        });
        
        // Log the extracted data
        console.log('[usePropertyDetails] Extracted data from property_details:', 
          JSON.stringify(extractedData, null, 2));
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
              console.log(`[usePropertyDetails] Found ${key} in parsed property_details:`, parsedDetails[key]);
              extractedData[key] = parsedDetails[key];
            }
          });
          
          console.log('[usePropertyDetails] Extracted data from parsed property_details:', 
            JSON.stringify(extractedData, null, 2));
        } catch (parseError) {
          console.error('[usePropertyDetails] Error parsing property_details string:', parseError);
        }
      }
      
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
      
      // Add images to the final property object
      extractedData.property_images = imagesData || [];
      extractedData.ownerInfo = ownerInfo;
      
      // Log the final property data
      console.log('[usePropertyDetails] Final property data with basicDetails:', 
        JSON.stringify(extractedData.basicDetails, null, 2));

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
    refreshData
  };
};