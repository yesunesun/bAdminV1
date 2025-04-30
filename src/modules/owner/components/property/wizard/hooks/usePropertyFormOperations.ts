// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 4.4.0
// Last Modified: 01-05-2025 23:30 IST
// Purpose: Removed auto-fill function and added default values for required fields

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData, FormDataV1, FormDataV2 } from '../types';
import { supabase } from '@/lib/supabase';
import { 
  detectDataVersion, 
  detectSpecializedPropertyType,
  DATA_VERSION_V1, 
  DATA_VERSION_V2, 
  CURRENT_DATA_VERSION,
  convertV1ToV2,
  convertV2ToV1,
  cleanV2Structure
} from '../utils/propertyDataAdapter';

interface UsePropertyFormOperationsProps {
  form: UseFormReturn<FormData>;
  user: any;
  mode: 'create' | 'edit';
  existingPropertyId?: string;
  adType?: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;
  setSavedPropertyId: (id: string | null) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string) => void;
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

  /**
   * Function to determine the flow type based on URL and state
   */
  const determineFlowType = () => {
    // Get URL path components
    const pathParts = window.location.pathname.split('/');
    const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
    const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
    
    let category = 'residential';
    let listingType = 'rent';
    
    // Check URL first
    if (urlPropertyType) {
      category = urlPropertyType.toLowerCase();
    }
    
    if (urlListingType) {
      listingType = urlListingType.toLowerCase();
    }
    
    // FIX: Check for 'sale' first in URL to prioritize sale flow
    if (urlListingType && (urlListingType.toLowerCase() === 'sale' || urlListingType.toLowerCase() === 'sell')) {
      listingType = 'sale';
    }
    
    // Check form state overrides
    if (isSaleMode) {
      listingType = 'sale';
    }
    
    if (isPGHostelMode) {
      listingType = 'pghostel';
    }
    
    // Check adType prop
    if (adType) {
      const lowerAdType = adType.toLowerCase();
      // FIX: Properly map 'sale' and 'sell' to 'sale'
      if (lowerAdType === 'sale' || lowerAdType === 'sell') {
        listingType = 'sale';
      } else {
        listingType = lowerAdType;
      }
    }
    
    console.log(`determineFlowType: category=${category}, listingType=${listingType}`);
    
    // Return determined flow type
    return { category, listingType };
  };

  /**
   * Function to ensure required fields have values
   */
  const ensureRequiredFields = (formData: FormData): FormData => {
    const dataVersion = detectDataVersion(formData);
    const { category, listingType } = determineFlowType();
    
    // For V2 data structure
    if (dataVersion === DATA_VERSION_V2) {
      const v2Data = { ...(formData as FormDataV2) };
      
      // Basic details defaults
      if (!v2Data.basicDetails) {
        v2Data.basicDetails = {} as any;
      }
      
      v2Data.basicDetails.title = v2Data.basicDetails.title || 'Untitled Property';
      v2Data.basicDetails.propertyType = v2Data.basicDetails.propertyType || 'Apartment';
      v2Data.basicDetails.builtUpArea = v2Data.basicDetails.builtUpArea || 1000;
      v2Data.basicDetails.builtUpAreaUnit = v2Data.basicDetails.builtUpAreaUnit || 'sqft';
      
      // Location defaults
      if (!v2Data.location) {
        v2Data.location = {} as any;
      }
      
      v2Data.location.city = v2Data.location.city || 'Hyderabad';
      v2Data.location.address = v2Data.location.address || 'Default Address';
      
      // Features defaults
      if (!v2Data.features) {
        v2Data.features = {} as any;
      }
      
      v2Data.features.amenities = v2Data.features.amenities || [];
      v2Data.features.description = v2Data.features.description || 'No description provided';
      
      // Flow-specific defaults
      if (listingType === 'sale') {
        if (!v2Data.sale) {
          v2Data.sale = {} as any;
        }
        
        v2Data.sale.expectedPrice = v2Data.sale.expectedPrice || 5000000; // Default price for sale
        v2Data.sale.maintenanceCost = v2Data.sale.maintenanceCost || 0;
        v2Data.sale.possessionDate = v2Data.sale.possessionDate || new Date().toISOString().split('T')[0];
      } 
      else if (listingType === 'rent') {
        if (!v2Data.rental) {
          v2Data.rental = {} as any;
        }
        
        v2Data.rental.rentAmount = v2Data.rental.rentAmount || 20000; // Default rent amount
        v2Data.rental.securityDeposit = v2Data.rental.securityDeposit || 50000;
        v2Data.rental.availableFrom = v2Data.rental.availableFrom || new Date().toISOString().split('T')[0];
        v2Data.rental.preferredTenants = v2Data.rental.preferredTenants || [];
        v2Data.rental.furnishingStatus = v2Data.rental.furnishingStatus || 'Semi Furnished';
      }
      
      return v2Data;
    } 
    // For V1 data structure
    else if (dataVersion === DATA_VERSION_V1) {
      const v1Data = { ...(formData as FormDataV1) };
      
      // Basic property details
      v1Data.title = v1Data.title || 'Untitled Property';
      v1Data.propertyType = v1Data.propertyType || 'Apartment';
      v1Data.builtUpArea = v1Data.builtUpArea || '1000';
      v1Data.builtUpAreaUnit = v1Data.builtUpAreaUnit || 'sqft';
      v1Data.city = v1Data.city || 'Hyderabad';
      v1Data.address = v1Data.address || 'Default Address';
      v1Data.description = v1Data.description || 'No description provided';
      v1Data.amenities = v1Data.amenities || [];
      
      // Price/rent defaults based on listing type
      if (listingType === 'sale') {
        v1Data.expectedPrice = v1Data.expectedPrice || '5000000';
        v1Data.maintenanceCost = v1Data.maintenanceCost || '0';
        v1Data.possessionDate = v1Data.possessionDate || new Date().toISOString().split('T')[0];
      } else {
        v1Data.rentAmount = v1Data.rentAmount || '20000';
        v1Data.securityDeposit = v1Data.securityDeposit || '50000';
        v1Data.availableFrom = v1Data.availableFrom || new Date().toISOString().split('T')[0];
        v1Data.preferredTenants = v1Data.preferredTenants || [];
        v1Data.furnishing = v1Data.furnishing || 'Semi Furnished';
      }
      
      return v1Data;
    }
    
    return formData;
  };

  /**
   * Function to ensure the flow property in the form data is correct
   * and matches the current flow being used in the wizard
   */
  const ensureCorrectFlowType = (formData: FormData): FormData => {
    // Get current form values
    const dataVersion = detectDataVersion(formData);
    
    // Define flow type based on URL and form state
    const determinedFlowType = determineFlowType();
    
    console.log('Ensuring correct flow type before save:', determinedFlowType);
    
    // For V2 data structure
    if (dataVersion === DATA_VERSION_V2) {
      const v2Data = { ...(formData as FormDataV2) };
      
      // Fix: Ensure flow.listingType matches the current flow type
      if (v2Data.flow) {
        v2Data.flow.listingType = determinedFlowType.listingType;
        v2Data.flow.category = determinedFlowType.category;
      } else {
        v2Data.flow = {
          category: determinedFlowType.category as "residential" | "commercial" | "land",
          listingType: determinedFlowType.listingType
        };
      }
      
      // FIX: Sale flow - ensure sale section exists and remove rental section
      if (determinedFlowType.listingType === 'sale') {
        // Create or update sale section
        v2Data.sale = v2Data.sale || {
          expectedPrice: null,
          maintenanceCost: null,
          priceNegotiable: false,
          possessionDate: '',
          kitchenType: ''
        };
        
        // Copy over any existing rental data to avoid data loss
        if (v2Data.rental) {
          // Map relevant fields from rental to sale if sale fields are empty
          if (v2Data.rental.rentAmount && !v2Data.sale.expectedPrice) {
            v2Data.sale.expectedPrice = v2Data.rental.rentAmount;
          }
          
          if (v2Data.rental.maintenanceCharges && !v2Data.sale.maintenanceCost) {
            v2Data.sale.maintenanceCost = v2Data.rental.maintenanceCharges;
          }
          
          if (v2Data.rental.availableFrom && !v2Data.sale.possessionDate) {
            v2Data.sale.possessionDate = v2Data.rental.availableFrom;
          }
          
          // Remove rental section
          delete v2Data.rental;
        }
      } 
      // Rent flow - ensure rental section exists and remove sale section
      else if (determinedFlowType.listingType === 'rent') {
        // Create or update rental section
        v2Data.rental = v2Data.rental || {
          rentAmount: null,
          securityDeposit: null,
          maintenanceCharges: null,
          rentNegotiable: false,
          availableFrom: '',
          preferredTenants: [],
          leaseDuration: '',
          furnishingStatus: ''
        };
        
        // Copy over any existing sale data to avoid data loss
        if (v2Data.sale) {
          // Map relevant fields from sale to rental if rental fields are empty
          if (v2Data.sale.expectedPrice && !v2Data.rental.rentAmount) {
            v2Data.rental.rentAmount = v2Data.sale.expectedPrice;
          }
          
          if (v2Data.sale.maintenanceCost && !v2Data.rental.maintenanceCharges) {
            v2Data.rental.maintenanceCharges = v2Data.sale.maintenanceCost;
          }
          
          if (v2Data.sale.possessionDate && !v2Data.rental.availableFrom) {
            v2Data.rental.availableFrom = v2Data.sale.possessionDate;
          }
          
          // Remove sale section
          delete v2Data.sale;
        }
      }
      
      // Clean the structure to ensure all properties are properly placed
      return cleanV2Structure(v2Data);
    } 
    // For V1 data structure
    else if (dataVersion === DATA_VERSION_V1) {
      const v1Data = { ...(formData as FormDataV1) };
      
      // Fix: Update flow tracking fields to match current flow
      v1Data.flow_property_type = determinedFlowType.category;
      v1Data.flow_listing_type = determinedFlowType.listingType;
      v1Data.propertyCategory = determinedFlowType.category;
      v1Data.listingType = determinedFlowType.listingType;
      
      // Fix: Update sale/rent flags
      v1Data.isSaleProperty = determinedFlowType.listingType === 'sale';
      v1Data.propertyPriceType = determinedFlowType.listingType === 'sale' ? 'sale' : 'rental';
      
      // FIX: For sale properties, make sure expected price is used instead of rent amount
      if (determinedFlowType.listingType === 'sale') {
        // If we have a rent amount but no expected price, copy it over
        if (v1Data.rentAmount && !v1Data.expectedPrice) {
          v1Data.expectedPrice = v1Data.rentAmount;
        }
      }
      
      return v1Data;
    }
    
    return formData;
  };

  /**
   * Function to extract price from form data for database column
   * This fixes the null value in "price" column error
   */
  const extractPriceForDatabase = (formData: FormData): number => {
    const dataVersion = detectDataVersion(formData);
    const { category, listingType } = determineFlowType();
    
    // Default price values based on property type
    const defaultPrice = listingType === 'sale' ? 5000000 : 20000;
    
    let price = defaultPrice; // Default fallback price to satisfy NOT NULL constraint
    
    // For V2 data structure
    if (dataVersion === DATA_VERSION_V2) {
      const v2Data = formData as FormDataV2;
      
      if (listingType === 'sale' && v2Data.sale?.expectedPrice) {
        price = v2Data.sale.expectedPrice;
      } else if (listingType === 'rent' && v2Data.rental?.rentAmount) {
        price = v2Data.rental.rentAmount;
      } else if (category === 'land' && v2Data.land?.expectedPrice) {
        price = v2Data.land.expectedPrice;
      } else if (listingType === 'coworking' && v2Data.coworking?.rentPrice) {
        price = v2Data.coworking.rentPrice;
      } else if (listingType === 'pghostel' && v2Data.pghostel?.rentAmount) {
        price = v2Data.pghostel.rentAmount;
      } else if (listingType === 'flatmates' && v2Data.flatmate?.rentAmount) {
        price = v2Data.flatmate.rentAmount;
      }
    }
    // For V1 data structure
    else if (dataVersion === DATA_VERSION_V1) {
      const v1Data = formData as FormDataV1;
      
      if (listingType === 'sale' && v1Data.expectedPrice) {
        price = typeof v1Data.expectedPrice === 'string' ? 
          parseFloat(v1Data.expectedPrice) : v1Data.expectedPrice;
      } else if (v1Data.rentAmount) {
        price = typeof v1Data.rentAmount === 'string' ? 
          parseFloat(v1Data.rentAmount) : v1Data.rentAmount;
      }
    }
    
    // Ensure price is a valid number and not null
    return isNaN(price) || price === null ? defaultPrice : price;
  };

  /**
   * Function to save the form data as draft
   */
  const handleSaveAsDraft = async () => {
    // Check if user is logged in
    if (!user) {
      setError('Please log in to save your property listing');
      return;
    }

    setSaving(true);
    
    try {
      // Get current form values
      let formData = form.getValues();
      
      // Important: Log form data before modification to debug issues
      console.log('Original form data before save:', JSON.stringify(formData));
      
      // Ensure flow type is correctly set before saving
      formData = ensureCorrectFlowType(formData);
      
      // Ensure required fields have values
      formData = ensureRequiredFields(formData);
      
      // Log the modified form data to verify changes
      console.log('Modified form data for save:', JSON.stringify(formData));
      
      // Extract price for database column to avoid NOT NULL constraint error
      const price = extractPriceForDatabase(formData);
      console.log('Extracted price for database:', price);
      
      // Process form data depending on mode
      if (mode === 'edit' && existingPropertyId) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties')
          .update({
            property_details: formData,
            price: price, // Make sure price is not null
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPropertyId);

        if (error) {
          console.error('Error updating property:', error);
          setError(`Error saving property: ${error.message}`);
          setSaving(false);
          return;
        }

        console.log('Property updated successfully:', data);
        setSavedPropertyId(existingPropertyId);
      } else {
        // Create new property
        const { data, error } = await supabase
          .from('properties')
          .insert({
            owner_id: user.id,
            title: getFormTitle(formData),
            property_details: formData,
            price: price, // Make sure price is not null
            status: 'draft'
          })
          .select();

        if (error) {
          console.error('Error creating property:', error);
          setError(`Error saving property: ${error.message}`);
          setSaving(false);
          return;
        }

        if (data && data.length > 0) {
          console.log('Property created successfully:', data[0]);
          setSavedPropertyId(data[0].id);
        }
      }

      // Success notification
      setStatus('draft');
    } catch (err: any) {
      console.error('Error saving property:', err);
      setError(`Error saving property: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Function to save and publish the property
   */
  const handleSaveAndPublish = async () => {
    // Check if user is logged in
    if (!user) {
      setError('Please log in to publish your property listing');
      return;
    }

    setSaving(true);
    
    try {
      // Get current form values
      let formData = form.getValues();
      
      // Important: Log form data before modification
      console.log('Original form data before publish:', JSON.stringify(formData));
      
      // Ensure flow type is correctly set before saving
      formData = ensureCorrectFlowType(formData);
      
      // Ensure required fields have values
      formData = ensureRequiredFields(formData);
      
      // Log the modified form data
      console.log('Modified form data for publish:', JSON.stringify(formData));
      
      // Extract price for database column to avoid NOT NULL constraint error
      const price = extractPriceForDatabase(formData);
      console.log('Extracted price for database:', price);
      
      // Process form data depending on mode
      if (mode === 'edit' && existingPropertyId) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties')
          .update({
            property_details: formData,
            price: price, // Make sure price is not null
            status: 'published',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPropertyId);

        if (error) {
          console.error('Error updating property:', error);
          setError(`Error publishing property: ${error.message}`);
          setSaving(false);
          return;
        }

        console.log('Property published successfully:', data);
        setSavedPropertyId(existingPropertyId);
      } else {
        // Create new property
        const { data, error } = await supabase
          .from('properties')
          .insert({
            owner_id: user.id,
            title: getFormTitle(formData),
            property_details: formData,
            price: price, // Make sure price is not null
            status: 'published'
          })
          .select();

        if (error) {
          console.error('Error creating property:', error);
          setError(`Error publishing property: ${error.message}`);
          setSaving(false);
          return;
        }

        if (data && data.length > 0) {
          console.log('Property published successfully:', data[0]);
          setSavedPropertyId(data[0].id);
        }
      }

      // Success notification
      setStatus('published');
      handleNextStep();
    } catch (err: any) {
      console.error('Error publishing property:', err);
      setError(`Error publishing property: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Function to update the property details
   */
  const handleUpdate = async () => {
    // Similar to handleSaveAsDraft but with different UI feedback
    if (!user) {
      setError('Please log in to update your property listing');
      return;
    }

    setSaving(true);
    
    try {
      // Get current form values
      let formData = form.getValues();
      
      // Important: Log form data before modification
      console.log('Original form data before update:', JSON.stringify(formData));
      
      // Ensure flow type is correctly set before saving
      formData = ensureCorrectFlowType(formData);
      
      // Ensure required fields have values
      formData = ensureRequiredFields(formData);
      
      // Log the modified form data
      console.log('Modified form data for update:', JSON.stringify(formData));
      
      // Extract price for database column to avoid NOT NULL constraint error
      const price = extractPriceForDatabase(formData);
      console.log('Extracted price for database:', price);
      
      // Update property
      if (existingPropertyId) {
        const { data, error } = await supabase
          .from('properties')
          .update({
            property_details: formData,
            price: price, // Make sure price is not null
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPropertyId);

        if (error) {
          console.error('Error updating property:', error);
          setError(`Error updating property: ${error.message}`);
          setSaving(false);
          return;
        }

        console.log('Property updated successfully:', data);
      } else {
        setError('No property ID found for update');
        setSaving(false);
        return;
      }

      // Success notification
    } catch (err: any) {
      console.error('Error updating property:', err);
      setError(`Error updating property: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Function to get the form title for database entry
   */
  const getFormTitle = (formData: FormData): string => {
    const dataVersion = detectDataVersion(formData);
    
    // For V2 data structure
    if (dataVersion === DATA_VERSION_V2) {
      return (formData as FormDataV2).basicDetails?.title || 'Untitled Property';
    }
    
    // For V1 data structure
    return (formData as FormDataV1).title || 'Untitled Property';
  };

  // Return the functions and constants
  return {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    determineFlowType,
    detectDataVersion,
    CURRENT_DATA_VERSION
  };
}