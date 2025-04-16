// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 4.1.0
// Last Modified: 16-04-2025 17:40 IST
// Purpose: Fixed flow saving and specialized property type structure

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormData, FormDataV1, FormDataV2 } from '../types';
import { autoFillAllSections } from '../test-data';
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

interface UsePropertyFormOperationsProps {
  form: any;
  user: any;
  mode: 'create' | 'edit';
  existingPropertyId?: string;
  adType?: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;
  setSavedPropertyId: (id: string) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string | null) => void;
  handleNextStep: () => void;
}

export function usePropertyFormOperations({
  form,
  user,
  mode,
  existingPropertyId,
  adType,
  isSaleMode,
  isPGHostelMode,
  status,
  setStatus,
  setSavedPropertyId,
  setSaving,
  setError,
  handleNextStep
}: UsePropertyFormOperationsProps) {
  const navigate = useNavigate();
  
  // Function to determine property flow based on form data and URL
  const determinePropertyFlow = (formData: FormData): { propertyCategory: string, propertyFlow: string, listingType: string } => {
    console.log("==== DETERMINING PROPERTY FLOW ====");
    
    // Extract URL path components to get the flow information
    const pathParts = window.location.pathname.split('/');
    const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
    const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
    
    console.log("URL Property Type:", urlPropertyType);
    console.log("URL Listing Type:", urlListingType);
    
    // Check data version and extract flow information based on version
    const dataVersion = detectDataVersion(formData);
    let formCategory = '';
    let formListingType = '';
    
    if (dataVersion === DATA_VERSION_V2) {
      // For V2, get values from flow object
      const v2Data = formData as FormDataV2;
      formCategory = v2Data.flow?.category || '';
      formListingType = v2Data.flow?.listingType || '';
      console.log("V2 Form category:", formCategory);
      console.log("V2 Form listing type:", formListingType);
    } else {
      // For V1 or legacy, get values from flat structure
      const v1Data = formData as FormDataV1;
      formCategory = v1Data.propertyCategory || '';
      formListingType = v1Data.listingType || '';
      console.log("V1 Form flow_property_type:", v1Data.flow_property_type);
      console.log("V1 Form flow_listing_type:", v1Data.flow_listing_type);
      console.log("V1 Form category:", formCategory);
      console.log("V1 Form listing type:", formListingType);
    }
    
    // Prioritize URL path values over stored flow values
    const effectivePropertyType = urlPropertyType || formCategory || '';
    const effectiveListingType = urlListingType || formListingType || '';
    
    console.log("Effective Property Type:", effectivePropertyType);
    console.log("Effective Listing Type:", effectiveListingType);
    
    // Define mapping of property types to their canonical names
    const propertyTypeMapping: {[key: string]: string} = {
      'residential': 'residential',
      'commercial': 'commercial',
      'land': 'land'
    };
    
    // Define mapping of listing types to their canonical names
    const listingTypeMapping: {[key: string]: string} = {
      'rent': 'rent',
      'sale': 'sale',
      'coworking': 'coworking',
      'pghostel': 'pghostel',
      'flatmates': 'flatmates'
    };
    
    // Normalize property type and listing type to canonical values
    const normalizedPropertyType = propertyTypeMapping[effectivePropertyType.toLowerCase()] || 'residential';
    const normalizedListingType = listingTypeMapping[effectiveListingType.toLowerCase()] || 'rent';
    
    // Directly return based on URL path information if it exists
    if (normalizedPropertyType === 'commercial' && normalizedListingType === 'coworking') {
      console.log("Detected Commercial Coworking flow");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_COWORKING',
        listingType: 'coworking'
      };
    }
    
    if (normalizedPropertyType === 'commercial' && normalizedListingType === 'rent') {
      console.log("Detected Commercial Rent flow");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_RENT',
        listingType: 'rent'
      };
    }
    
    if (normalizedPropertyType === 'commercial' && normalizedListingType === 'sale') {
      console.log("Detected Commercial Sale flow");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_SALE',
        listingType: 'sale'
      };
    }
    
    if (normalizedPropertyType === 'residential' && normalizedListingType === 'pghostel') {
      console.log("Detected Residential PG/Hostel flow");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_PGHOSTEL',
        listingType: 'pghostel'
      };
    }
    
    if (normalizedPropertyType === 'residential' && normalizedListingType === 'flatmates') {
      console.log("Detected Residential Flatmates flow");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_FLATMATES',
        listingType: 'flatmates'
      };
    }
    
    if (normalizedPropertyType === 'land' && normalizedListingType === 'sale') {
      console.log("Detected Land Sale flow");
      return {
        propertyCategory: 'land',
        propertyFlow: 'LAND_SALE',
        listingType: 'sale'
      };
    }
    
    if (normalizedPropertyType === 'residential' && normalizedListingType === 'sale') {
      console.log("Detected Residential Sale flow");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_SALE',
        listingType: 'sale'
      };
    }
    
    if (normalizedPropertyType === 'residential' && normalizedListingType === 'rent') {
      console.log("Detected Residential Rent flow");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_RENT',
        listingType: 'rent'
      };
    }
    
    // Check for PG/Hostel mode
    if (isPGHostelMode) {
      console.log("Detected PG/Hostel flow based on isPGHostelMode flag");
      return { 
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_PGHOSTEL',
        listingType: 'pghostel'
      };
    }
    
    // Check for co-working mode
    let isCoworkingMode = false;
    
    if (dataVersion === DATA_VERSION_V2) {
      // For V2, check this differently
      const v2Data = formData as FormDataV2;
      isCoworkingMode = v2Data.flow?.listingType === 'coworking';
    } else {
      // For V1, use the existing check
      const v1Data = formData as FormDataV1;
      isCoworkingMode = v1Data.commercialPropertyType === 'coworking';
    }
    
    if (isCoworkingMode) {
      console.log("Detected Co-working flow based on isCoworkingMode flag");
      return { 
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_COWORKING',
        listingType: 'coworking'
      };
    }
    
    // For v1 data, check the old way
    if (dataVersion === DATA_VERSION_V1 || dataVersion === 'legacy') {
      const v1Data = formData as FormDataV1;
      
      // Check for commercial property
      if (v1Data.propertyCategory === 'commercial') {
        if (v1Data.listingType === 'rent' || adType === 'rent') {
          console.log("Detected Commercial Rent flow");
          return {
            propertyCategory: 'commercial',
            propertyFlow: 'COMMERCIAL_RENT',
            listingType: 'rent'
          };
        } else if (v1Data.listingType === 'sale' || adType === 'sale' || isSaleMode) {
          console.log("Detected Commercial Sale flow");
          return {
            propertyCategory: 'commercial',
            propertyFlow: 'COMMERCIAL_SALE',
            listingType: 'sale'
          };
        }
      }
      
      // Check for land property
      if (v1Data.propertyCategory === 'land') {
        console.log("Detected Land Sale flow");
        return {
          propertyCategory: 'land',
          propertyFlow: 'LAND_SALE',
          listingType: 'sale'
        };
      }
      
      // Default for residential properties
      if (isSaleMode || v1Data.listingType === 'sale' || adType === 'sale') {
        console.log("Detected Residential Sale flow");
        return {
          propertyCategory: 'residential',
          propertyFlow: 'RESIDENTIAL_SALE',
          listingType: 'sale'
        };
      }
    }
    
    // Default fallback
    console.log("Defaulting to Residential Rent flow");
    return {
      propertyCategory: 'residential',
      propertyFlow: 'RESIDENTIAL_RENT',
      listingType: 'rent'
    };
  };
  
  // Function to save property to the database
  const saveProperty = async (formData: FormData, finalStatus: 'draft' | 'published') => {
    if (!user) {
      console.error("User not found, cannot save property");
      setError("User not authenticated. Please log in to save your property.");
      return null;
    }
    
    try {
      // Detect data version
      const dataVersion = detectDataVersion(formData);
      console.log(`Data version before save: ${dataVersion}`);
      
      // Determine the property flow and category
      const { propertyCategory, propertyFlow, listingType } = determinePropertyFlow(formData);
      console.log(`Determined property category: ${propertyCategory}`);
      console.log(`Determined property flow: ${propertyFlow}`);
      console.log(`Determined listing type: ${listingType}`);
      
      // Convert data to the current version for saving to database
      let processedData: any = formData;
      
      // If current version is V2 but data is V1, convert to V2
      if (CURRENT_DATA_VERSION === DATA_VERSION_V2 && dataVersion === DATA_VERSION_V1) {
        console.log("Converting V1 data to V2 for saving");
        processedData = convertV1ToV2(formData as FormDataV1);
      }
      // If current version is V1 but data is V2, convert to V1
      else if (CURRENT_DATA_VERSION === DATA_VERSION_V1 && dataVersion === DATA_VERSION_V2) {
        console.log("Converting V2 data to V1 for saving");
        processedData = convertV2ToV1(formData as FormDataV2);
      }
      
      // Ensure data is properly structured according to its version
      if (dataVersion === DATA_VERSION_V2 || CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        console.log("Cleaning V2 structure before saving");
        processedData = cleanV2Structure(processedData);
        
        // Explicitly set the flow with the detected values
        (processedData as FormDataV2).flow = {
          category: propertyCategory,
          listingType: listingType
        };
        
        console.log("Updated flow values:", (processedData as FormDataV2).flow);
        
        // Ensure the correct specialized section exists based on listing type
        // First, remove any incorrect sections
        if (listingType === 'rent' && !isPGHostelMode) {
          if (processedData.sale) delete processedData.sale;
          if (processedData.coworking) delete processedData.coworking;
          if (processedData.pghostel) delete processedData.pghostel;
          if (processedData.flatmate) delete processedData.flatmate;
          if (processedData.land) delete processedData.land;
          
          // Ensure rental section exists
          if (!processedData.rental) {
            processedData.rental = {
              rentAmount: null,
              securityDeposit: null,
              maintenanceCharges: null,
              rentNegotiable: false,
              availableFrom: "",
              preferredTenants: [],
              leaseDuration: "",
              furnishingStatus: ""
            };
          }
        } 
        else if (listingType === 'sale') {
          if (processedData.rental) delete processedData.rental;
          if (processedData.coworking) delete processedData.coworking;
          if (processedData.pghostel) delete processedData.pghostel;
          if (processedData.flatmate) delete processedData.flatmate;
          if (propertyCategory !== 'land') {
            if (processedData.land) delete processedData.land;
          }
          
          // Ensure sale section exists
          if (!processedData.sale && propertyCategory !== 'land') {
            processedData.sale = {
              expectedPrice: null,
              maintenanceCost: null,
              priceNegotiable: false,
              possessionDate: "",
              kitchenType: ""
            };
          }
          
          // Special case for land
          if (propertyCategory === 'land') {
            if (processedData.sale) delete processedData.sale;
            
            // Ensure land section exists
            if (!processedData.land) {
              processedData.land = {
                expectedPrice: null,
                priceNegotiable: false,
                landArea: processedData.basicDetails?.builtUpArea || null,
                landAreaUnit: processedData.basicDetails?.builtUpAreaUnit || "sqft",
                landType: "",
                isApproved: false,
                availableFrom: ""
              };
            }
          }
        }
        else if (listingType === 'coworking') {
          if (processedData.rental) delete processedData.rental;
          if (processedData.sale) delete processedData.sale;
          if (processedData.pghostel) delete processedData.pghostel;
          if (processedData.flatmate) delete processedData.flatmate;
          if (processedData.land) delete processedData.land;
          
          // Ensure coworking section exists
          if (!processedData.coworking) {
            processedData.coworking = {
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
          }
        }
        else if (listingType === 'pghostel') {
          if (processedData.rental) delete processedData.rental;
          if (processedData.sale) delete processedData.sale;
          if (processedData.coworking) delete processedData.coworking;
          if (processedData.flatmate) delete processedData.flatmate;
          if (processedData.land) delete processedData.land;
          
          // Ensure pghostel section exists
          if (!processedData.pghostel) {
            processedData.pghostel = {
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
          }
        }
        else if (listingType === 'flatmates') {
          if (processedData.rental) delete processedData.rental;
          if (processedData.sale) delete processedData.sale;
          if (processedData.coworking) delete processedData.coworking;
          if (processedData.pghostel) delete processedData.pghostel;
          if (processedData.land) delete processedData.land;
          
          // Ensure flatmate section exists
          if (!processedData.flatmate) {
            processedData.flatmate = {
              rentAmount: null,
              securityDeposit: null,
              occupancy: null,
              availableFrom: "",
              gender: "",
              preferredTenants: [],
              furnishingStatus: ""
            };
          }
        }
      }
      
      // Always set the version to the current version
      if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        (processedData as FormDataV2)._version = CURRENT_DATA_VERSION;
      } else {
        (processedData as FormDataV1)._version = CURRENT_DATA_VERSION;
      }
      
      console.log(`Setting property data version to: ${CURRENT_DATA_VERSION}`);
      
      // Compute the price based on data version and type
      let price = 0;
      let propertyDetails: any = processedData; 
      
      if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
        // For V2 data, extract price from the appropriate section
        const v2Data = processedData as FormDataV2;
        if (listingType === 'sale' && v2Data.sale) {
          price = v2Data.sale.expectedPrice || 0;
        } else if (listingType === 'sale' && propertyCategory === 'land' && v2Data.land) {
          price = v2Data.land.expectedPrice || 0;
        } else if (listingType === 'rent' && v2Data.rental) {
          price = v2Data.rental.rentAmount || 0;
        } else if (listingType === 'coworking' && v2Data.coworking) {
          price = v2Data.coworking.rentPrice || 0;
        } else if (listingType === 'pghostel' && v2Data.pghostel) {
          price = v2Data.pghostel.rentAmount || 0;
        } else if (listingType === 'flatmates' && v2Data.flatmate) {
          price = v2Data.flatmate.rentAmount || 0;
        }
      } else {
        // For V1 data, extract price the old way
        const v1Data = processedData as FormDataV1;
        const isSaleProperty = v1Data.isSaleProperty || 
                              v1Data.listingType?.toLowerCase() === 'sale' || 
                              v1Data.propertyPriceType === 'sale';
        
        price = isSaleProperty 
          ? parseFloat(v1Data.expectedPrice || '0') 
          : parseFloat(v1Data.rentAmount || '0');
        
        // Set flow tracking in the V1 structure
        v1Data.flow_property_type = propertyCategory;
        v1Data.flow_listing_type = listingType;
      }
      
      // Build the database record
      const dbPropertyData = {
        owner_id: user.id,
        title: CURRENT_DATA_VERSION === DATA_VERSION_V2 
          ? (processedData as FormDataV2).basicDetails.title || `Property in ${(processedData as FormDataV2).location?.city || 'Unknown'}`
          : (processedData as FormDataV1).title || `Property in ${(processedData as FormDataV1).locality || 'Unknown'}`,
        description: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).features.description || ''
          : (processedData as FormDataV1).description || '',
        price: price,
        bedrooms: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? ((processedData as FormDataV2).basicDetails.bhkType 
            ? parseInt((processedData as FormDataV2).basicDetails.bhkType.split(' ')[0]) 
            : 0)
          : ((processedData as FormDataV1).bhkType 
            ? parseInt((processedData as FormDataV1).bhkType.split(' ')[0]) 
            : 0),
        bathrooms: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).basicDetails.bathrooms || 0
          : ((processedData as FormDataV1).bathrooms 
            ? parseInt((processedData as FormDataV1).bathrooms) 
            : 0),
        square_feet: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).basicDetails.builtUpArea || 0
          : ((processedData as FormDataV1).builtUpArea 
            ? parseFloat((processedData as FormDataV1).builtUpArea) 
            : 0),
        address: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location.address || ''
          : (processedData as FormDataV1).address || '',
        city: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location.city || ''
          : (processedData as FormDataV1).city || (processedData as FormDataV1).locality || '',
        state: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location.state || 'Telangana'
          : (processedData as FormDataV1).state || 'Telangana',
        zip_code: CURRENT_DATA_VERSION === DATA_VERSION_V2
          ? (processedData as FormDataV2).location.pinCode || ''
          : (processedData as FormDataV1).pinCode || '',
        status: finalStatus,
        property_details: propertyDetails,
        tags: finalStatus === 'published' ? ['public'] : []
      };
      
      console.log('Property data for database:', dbPropertyData);
      
      // Save to database
      let result;
      if (mode === 'create') {
        const { data, error } = await supabase
          .from('properties')
          .insert([dbPropertyData])
          .select();
          
        if (error) throw error;
        result = data?.[0];
      } else if (mode === 'edit' && existingPropertyId) {
        const { data, error } = await supabase
          .from('properties')
          .update(dbPropertyData)
          .eq('id', existingPropertyId)
          .select();
          
        if (error) throw error;
        result = data?.[0];
      }
      
      return result;
    } catch (error) {
      console.error("Error saving property:", error);
      throw error;
    }
  };
  
  // Handle autofill for debugging and testing
  const handleAutoFill = () => {
    if (process.env.NODE_ENV !== 'production') {
      // Get form values to determine property type and ad type
      const formValues = form.getValues();
      
      // Extract property type and ad type from form values or URL
      let propertyType = '';
      let adType = '';
      
      // Detect data version
      const dataVersion = detectDataVersion(formValues);
      
      if (dataVersion === DATA_VERSION_V2) {
        // For V2, get values from flow object
        const v2Data = formValues as FormDataV2;
        propertyType = v2Data.flow?.category || '';
        adType = v2Data.flow?.listingType || '';
      } else {
        // For V1, get values the old way
        const v1Data = formValues as FormDataV1;
        propertyType = v1Data.propertyCategory || '';
        adType = v1Data.listingType || '';
      }
      
      // If not available in form values, try to extract from URL
      if (!propertyType || !adType) {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 2) {
          propertyType = pathParts[pathParts.length - 3] || '';
          adType = pathParts[pathParts.length - 2] || '';
        }
      }
      
      console.log("Auto-filling form with data for property type:", propertyType, "and ad type:", adType);
      
      // Use the enhanced auto-fill function from test-data.ts
      autoFillAllSections(form, propertyType, adType);
      
      // If this is a V2 form, make sure the flow is set correctly
      const formData = form.getValues();
      if (detectDataVersion(formData) === DATA_VERSION_V2) {
        const { propertyCategory, listingType } = determinePropertyFlow(formData);
        form.setValue('flow', {
          category: propertyCategory,
          listingType: listingType
        });
      }
    }
  };
  
  // Handle saving as draft
  const handleSaveAsDraft = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const formData = form.getValues();
      
      // For V2 data, make sure flow is set correctly before saving
      if (detectDataVersion(formData) === DATA_VERSION_V2) {
        const { propertyCategory, listingType } = determinePropertyFlow(formData);
        form.setValue('flow', {
          category: propertyCategory,
          listingType: listingType
        });
      }
      
      const formDataWithCorrectFlow = form.getValues();
      const result = await saveProperty(formDataWithCorrectFlow, 'draft');
      
      if (result) {
        setSavedPropertyId(result.id);
        setStatus('draft');
        navigate(`/owner/properties/${result.id}`);
      }
    } catch (error: any) {
      console.error("Error saving draft:", error);
      setError(`Failed to save draft: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle saving and publishing
  const handleSaveAndPublish = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const formData = form.getValues();
      
      // For V2 data, make sure flow is set correctly before saving
      if (detectDataVersion(formData) === DATA_VERSION_V2) {
        const { propertyCategory, listingType } = determinePropertyFlow(formData);
        form.setValue('flow', {
          category: propertyCategory,
          listingType: listingType
        });
      }
      
      const formDataWithCorrectFlow = form.getValues();
      const result = await saveProperty(formDataWithCorrectFlow, 'published');
      
      if (result) {
        setSavedPropertyId(result.id);
        setStatus('published');
        navigate(`/owner/properties/${result.id}`);
      }
    } catch (error: any) {
      console.error("Error publishing property:", error);
      setError(`Failed to publish property: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle updating an existing property
  const handleUpdate = async () => {
    if (!existingPropertyId) {
      setError("No property ID found for update.");
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const formData = form.getValues();
      
      // For V2 data, make sure flow is set correctly before saving
      if (detectDataVersion(formData) === DATA_VERSION_V2) {
        const { propertyCategory, listingType } = determinePropertyFlow(formData);
        form.setValue('flow', {
          category: propertyCategory,
          listingType: listingType
        });
      }
      
      const formDataWithCorrectFlow = form.getValues();
      const result = await saveProperty(formDataWithCorrectFlow, status);
      
      if (result) {
        setSavedPropertyId(result.id);
        navigate(`/owner/properties/${result.id}`);
      }
    } catch (error: any) {
      console.error("Error updating property:", error);
      setError(`Failed to update property: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  return {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleAutoFill,
    detectDataVersion,
    CURRENT_DATA_VERSION
  };
}