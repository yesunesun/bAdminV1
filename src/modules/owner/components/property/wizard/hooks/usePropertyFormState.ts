// src/modules/owner/components/property/wizard/hooks/usePropertyFormState.ts
// Version: 3.1.0
// Last Modified: 16-04-2025 17:45 IST
// Purpose: Enhanced initialization for specialized property types

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { FormData, FormDataV1, FormDataV2 } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  detectDataVersion, 
  detectSpecializedPropertyType,
  DATA_VERSION_V1, 
  DATA_VERSION_V2, 
  CURRENT_DATA_VERSION,
  convertV1ToV2,
  convertV2ToV1,
  cleanV2Structure,
  createNewPropertyData
} from '../utils/propertyDataAdapter';

interface UsePropertyFormStateProps {
  initialData?: FormData;
  propertyCategory?: string;
  adType?: string;
  city?: string;
  existingPropertyId?: string;
  initialStatus?: 'draft' | 'published';
  mode?: 'create' | 'edit';
}

export function usePropertyFormState({
  initialData,
  propertyCategory,
  adType,
  city,
  existingPropertyId,
  initialStatus = 'draft',
  mode = 'create'
}: UsePropertyFormStateProps) {
  const { category, type } = useParams();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);
  const [isFormReady, setIsFormReady] = useState(false);
  const [isPGHostelMode, setIsPGHostelMode] = useState(false);

  // Extract property type and listing type from URL path
  const getFlowFromURL = (): { urlPropertyType: string; urlListingType: string } => {
    const pathParts = window.location.pathname.split('/');
    
    // Extract the last two path components that would indicate property type and listing type
    const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
    const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
    
    return { urlPropertyType, urlListingType };
  };

  // Enhanced logic to determine if we're in a specialized mode
  const { urlPropertyType, urlListingType } = getFlowFromURL();
  
  // Determine if we're in sale mode
  const isSaleMode = 
    adType?.toLowerCase() === 'sale' || 
    type?.toLowerCase() === 'sale' || 
    urlListingType?.toLowerCase() === 'sale' ||
    (initialData && detectDataVersion(initialData) === DATA_VERSION_V2
      ? (initialData as FormDataV2).flow?.listingType === 'sale'
      : (initialData as FormDataV1)?.listingType?.toLowerCase() === 'sale' ||
        (initialData as FormDataV1)?.listingType?.toLowerCase() === 'sell' ||
        (initialData as FormDataV1)?.isSaleProperty === true ||
        (initialData as FormDataV1)?.propertyPriceType === 'sale');
  
  // Determine if we're in PG/Hostel mode
  const isURLPGHostelMode = urlListingType?.toLowerCase() === 'pghostel';
  
  // Update the PG/Hostel mode flag based on URL
  useEffect(() => {
    if (isURLPGHostelMode) {
      setIsPGHostelMode(true);
    }
  }, [isURLPGHostelMode]);
  
  // Determine the actual property category and listing type to use
  const determinePropertyTypeAndListingType = (): { 
    propertyTypeToUse: string, 
    listingTypeToUse: string 
  } => {
    // Prioritize URL values
    let propertyTypeToUse = 
      urlPropertyType || 
      propertyCategory || 
      category || 
      'residential';
    
    let listingTypeToUse = 
      urlListingType || 
      adType || 
      type || 
      (isSaleMode ? 'sale' : 'rent');
    
    // Normalize the values
    propertyTypeToUse = propertyTypeToUse.toLowerCase();
    listingTypeToUse = listingTypeToUse.toLowerCase();
    
    // Check for special cases
    if (isPGHostelMode) {
      listingTypeToUse = 'pghostel';
    }
    
    if (initialData) {
      // If we have initial data, extract values from it
      const { isCoworking, isPGHostel, isFlatmate, isLand } = 
        detectSpecializedPropertyType(initialData);
      
      if (isCoworking) {
        propertyTypeToUse = 'commercial';
        listingTypeToUse = 'coworking';
      } else if (isPGHostel) {
        propertyTypeToUse = 'residential';
        listingTypeToUse = 'pghostel';
      } else if (isFlatmate) {
        propertyTypeToUse = 'residential';
        listingTypeToUse = 'flatmates';
      } else if (isLand) {
        propertyTypeToUse = 'land';
        listingTypeToUse = 'sale';
      }
    }
    
    return { propertyTypeToUse, listingTypeToUse };
  };

  // Function to create basic form values based on current version
  const getBasicFormValues = () => {
    const { propertyTypeToUse, listingTypeToUse } = determinePropertyTypeAndListingType();
    
    // For brand new forms, create a default structure based on current version
    if (!initialData) {
      // Use the enhanced createNewPropertyData function that creates specialized structures
      return createNewPropertyData(propertyTypeToUse, listingTypeToUse);
    }
    
    // If we have initialData, check its version and convert if needed
    const dataVersion = detectDataVersion(initialData);
    
    // If initialData version matches current version, use it directly
    if (dataVersion === CURRENT_DATA_VERSION) {
      // For V2 data, make sure the flow values are correct
      if (dataVersion === DATA_VERSION_V2) {
        const v2Data = { ...(initialData as FormDataV2) };
        
        // Update flow if URL or props specify different values
        if ((urlPropertyType && v2Data.flow.category !== propertyTypeToUse) ||
            (urlListingType && v2Data.flow.listingType !== listingTypeToUse)) {
          
          console.log(`Updating flow values from URL/props: ${propertyTypeToUse}/${listingTypeToUse}`);
          v2Data.flow = {
            category: propertyTypeToUse as "residential" | "commercial" | "land",
            listingType: listingTypeToUse
          };
          
          // Make sure the data structure matches the new flow
          return cleanV2Structure(v2Data);
        }
        
        return initialData;
      }
      
      return initialData;
    }
    
    // If initialData is V1 but we need V2
    if (dataVersion === DATA_VERSION_V1 && CURRENT_DATA_VERSION === DATA_VERSION_V2) {
      console.log("Converting initialData from V1 to V2");
      const v2Data = convertV1ToV2(initialData as FormDataV1);
      
      // Update flow if URL or props specify different values
      if ((urlPropertyType && v2Data.flow.category !== propertyTypeToUse) ||
          (urlListingType && v2Data.flow.listingType !== listingTypeToUse)) {
        
        console.log(`Updating flow values from URL/props: ${propertyTypeToUse}/${listingTypeToUse}`);
        v2Data.flow = {
          category: propertyTypeToUse as "residential" | "commercial" | "land",
          listingType: listingTypeToUse
        };
        
        // Make sure the data structure matches the new flow
        return cleanV2Structure(v2Data);
      }
      
      return v2Data;
    }
    
    // If initialData is V2 but we need V1
    if (dataVersion === DATA_VERSION_V2 && CURRENT_DATA_VERSION === DATA_VERSION_V1) {
      console.log("Converting initialData from V2 to V1");
      const v1Data = convertV2ToV1(initialData as FormDataV2);
      
      // Update flow tracking fields if URL or props specify different values
      if (urlPropertyType || urlListingType) {
        v1Data.flow_property_type = propertyTypeToUse;
        v1Data.flow_listing_type = listingTypeToUse;
        v1Data.propertyCategory = propertyTypeToUse;
        v1Data.listingType = listingTypeToUse;
        v1Data.isSaleProperty = listingTypeToUse === 'sale';
        v1Data.propertyPriceType = listingTypeToUse === 'sale' ? 'sale' : 'rental';
      }
      
      return v1Data;
    }
    
    // Fallback to original data
    return initialData;
  };

  // Initialize form with processed values
  const form = useForm<FormData>({
    defaultValues: getBasicFormValues()
  });

  // Directly query the database for property details in edit mode
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      // Only run this for existing properties in edit mode
      if (!existingPropertyId || mode !== 'edit') {
        setIsFormReady(true);
        return;
      }

      try {
        console.log('Directly querying database for property:', existingPropertyId);
        
        // Query the entire property record
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', existingPropertyId)
          .single();
        
        if (error) {
          console.error('Error fetching property details:', error);
          setIsFormReady(true);
          return;
        }
        
        console.log('Direct database query result:', data);
        
        if (data) {
          // Get the property details and detect version
          let propertyDetails = data.property_details;
          const dataVersion = detectDataVersion(propertyDetails);
          console.log(`Property data version: ${dataVersion}`);
          
          // Detect specialized property types
          const { isCoworking, isPGHostel, isFlatmate, isLand } = 
            detectSpecializedPropertyType(propertyDetails);
          
          // Update PG/Hostel mode flag
          setIsPGHostelMode(isPGHostel);
          
          // Convert to current version if needed
          let formData: FormData;
          
          if (dataVersion === DATA_VERSION_V1 && CURRENT_DATA_VERSION === DATA_VERSION_V2) {
            console.log("Converting database data from V1 to V2");
            formData = convertV1ToV2(propertyDetails as FormDataV1);
            // Clean the structure to ensure all fields are properly categorized
            formData = cleanV2Structure(formData as FormDataV2);
          } else if (dataVersion === DATA_VERSION_V2 && CURRENT_DATA_VERSION === DATA_VERSION_V1) {
            console.log("Converting database data from V2 to V1");
            formData = convertV2ToV1(propertyDetails as FormDataV2);
          } else if (dataVersion === DATA_VERSION_V2) {
            // Same version, but need to ensure proper structure
            formData = cleanV2Structure(propertyDetails as FormDataV2);
            
            // Make sure the specialized section matches the flow
            if (isCoworking && !formData.coworking) {
              console.log("Adding missing coworking section");
              (formData as FormDataV2).coworking = {
                rentPrice: null,
                securityDeposit: null,
                workstations: null,
                availableFrom: "",
                meetingRooms: false,
                conferenceRooms: false,
                cabins: false,
                receptionServices: false,
                internetSpeed: "",
                workingHours: "",
                facilities: []
              };
            } else if (isPGHostel && !formData.pghostel) {
              console.log("Adding missing pghostel section");
              (formData as FormDataV2).pghostel = {
                rentAmount: null,
                securityDeposit: null,
                mealOption: "",
                roomType: "",
                roomCapacity: null,
                availableRooms: null,
                totalRooms: null,
                bathroomType: "",
                gender: "",
                availableFrom: "",
                noticePeriod: "",
                rules: "",
                roomFeatures: {
                  hasAC: false,
                  hasFan: false,
                  hasFurniture: false,
                  hasTV: false,
                  hasWifi: false,
                  hasGeyser: false
                }
              };
            } else if (isFlatmate && !formData.flatmate) {
              console.log("Adding missing flatmate section");
              (formData as FormDataV2).flatmate = {
                rentAmount: null,
                securityDeposit: null,
                occupancy: null,
                availableFrom: "",
                gender: "",
                preferredTenants: [],
                furnishingStatus: ""
              };
            } else if (isLand && !formData.land) {
              console.log("Adding missing land section");
              (formData as FormDataV2).land = {
                expectedPrice: null,
                priceNegotiable: false,
                landArea: (formData as FormDataV2).basicDetails.builtUpArea,
                landAreaUnit: (formData as FormDataV2).basicDetails.builtUpAreaUnit || "sqft",
                landType: "",
                isApproved: false,
                availableFrom: ""
              };
            }
          } else {
            // Same version (V1), use directly
            formData = propertyDetails;
          }
          
          // Update all form fields
          console.log('Setting form values:', formData);
          form.reset(formData);
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setIsFormReady(true);
      }
    };

    fetchPropertyDetails();
  }, [existingPropertyId, mode, form, isSaleMode]);

  return {
    form,
    error,
    setError,
    saving,
    setSaving,
    savedPropertyId,
    setSavedPropertyId,
    status,
    setStatus,
    isSaleMode,
    isPGHostelMode,
    user,
    isFormReady
  };
}