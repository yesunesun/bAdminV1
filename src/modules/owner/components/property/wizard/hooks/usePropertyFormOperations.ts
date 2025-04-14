// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 3.1.0
// Last Modified: 14-04-2025 16:45 IST
// Purpose: Fix missing export and improve flow determination logic

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormData } from '../types';
import { TEST_DATA } from '../test-data'; // Changed from testData to TEST_DATA to match actual export
import { supabase } from '@/lib/supabase';

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
  
  // Function to determine property flow based on form data
  const determinePropertyFlow = (formData: FormData): { propertyCategory: string, propertyFlow: string } => {
    console.log("==== DETERMINING PROPERTY FLOW ====");
    
    // Extract URL path components to get the flow information
    const pathParts = window.location.pathname.split('/');
    const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
    const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
    
    console.log("URL Property Type:", urlPropertyType);
    console.log("URL Listing Type:", urlListingType);
    console.log("Form flow_property_type:", formData.flow_property_type);
    console.log("Form flow_listing_type:", formData.flow_listing_type);
    
    // Prioritize URL path or stored flow values
    const effectivePropertyType = urlPropertyType || formData.flow_property_type || formData.propertyType || '';
    const effectiveListingType = urlListingType || formData.flow_listing_type || formData.listingType || '';
    
    console.log("Effective Property Type:", effectivePropertyType);
    console.log("Effective Listing Type:", effectiveListingType);
    
    // Directly return based on URL path information if it exists
    if (effectivePropertyType.toLowerCase() === 'commercial' && effectiveListingType.toLowerCase() === 'coworking') {
      console.log("Detected Commercial Coworking from URL path");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_COWORKING'
      };
    }
    
    if (effectivePropertyType.toLowerCase() === 'commercial' && effectiveListingType.toLowerCase() === 'rent') {
      console.log("Detected Commercial Rent from URL path");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_RENT'
      };
    }
    
    if (effectivePropertyType.toLowerCase() === 'commercial' && effectiveListingType.toLowerCase() === 'sale') {
      console.log("Detected Commercial Sale from URL path");
      return {
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_SALE'
      };
    }
    
    if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'pghostel') {
      console.log("Detected Residential PG/Hostel from URL path");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_PGHOSTEL'
      };
    }
    
    if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'flatmates') {
      console.log("Detected Residential Flatmates from URL path");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_FLATMATES'
      };
    }
    
    if (effectivePropertyType.toLowerCase() === 'land' && effectiveListingType.toLowerCase() === 'sale') {
      console.log("Detected Land Sale from URL path");
      return {
        propertyCategory: 'land',
        propertyFlow: 'LAND_SALE'
      };
    }
    
    if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'sale') {
      console.log("Detected Residential Sale from URL path");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_SALE'
      };
    }
    
    if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'rent') {
      console.log("Detected Residential Rent from URL path");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_RENT'
      };
    }
    
    // Check for PG/Hostel mode
    if (isPGHostelMode) {
      console.log("Detected PG/Hostel flow based on isPGHostelMode flag");
      return { 
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_PGHOSTEL'
      };
    }
    
    // Check for co-working mode
    const isCoworkingMode = formData.commercialPropertyType === 'coworking';
    if (isCoworkingMode) {
      console.log("Detected Co-working flow based on isCoworkingMode flag");
      return { 
        propertyCategory: 'commercial',
        propertyFlow: 'COMMERCIAL_COWORKING'
      };
    }
    
    // Check for commercial property
    if (formData.propertyCategory === 'commercial') {
      if (formData.listingType === 'rent' || adType === 'rent') {
        console.log("Detected Commercial Rent flow");
        return {
          propertyCategory: 'commercial',
          propertyFlow: 'COMMERCIAL_RENT'
        };
      } else if (formData.listingType === 'sale' || adType === 'sale' || isSaleMode) {
        console.log("Detected Commercial Sale flow");
        return {
          propertyCategory: 'commercial',
          propertyFlow: 'COMMERCIAL_SALE'
        };
      }
    }
    
    // Check for land property
    if (formData.propertyCategory === 'land') {
      console.log("Detected Land Sale flow");
      return {
        propertyCategory: 'land',
        propertyFlow: 'LAND_SALE'
      };
    }
    
    // Default for residential properties
    if (isSaleMode || formData.listingType === 'sale' || adType === 'sale') {
      console.log("Detected Residential Sale flow");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_SALE'
      };
    } else {
      console.log("Defaulting to Residential Rent flow");
      return {
        propertyCategory: 'residential',
        propertyFlow: 'RESIDENTIAL_RENT'
      };
    }
  };
  
  // Function to save property to the database
  const saveProperty = async (formData: FormData, finalStatus: 'draft' | 'published') => {
    if (!user) {
      console.error("User not found, cannot save property");
      setError("User not authenticated. Please log in to save your property.");
      return null;
    }
    
    try {
      // Extract flow information from URL path
      const pathParts = window.location.pathname.split('/');
      const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
      const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
      
      // Determine the proper flows
      const { propertyCategory, propertyFlow } = determinePropertyFlow(formData);
      
      // Make sure all required fields exist in the data
      const safeFormData = {
        ...formData,
        owner_id: user.id,
        status: finalStatus,
        property_details: JSON.stringify(formData),
        propertyCategory,
        propertyFlow,
        // Add flow_property_type and flow_listing_type - prioritize URL values
        flow_property_type: urlPropertyType || formData.flow_property_type || '',
        flow_listing_type: urlListingType || formData.flow_listing_type || ''
      };
      
      // Use the flow information to ensure propertyCategory and propertyFlow are consistent
      if (safeFormData.flow_property_type && safeFormData.flow_listing_type) {
        const simplifiedCategory = safeFormData.flow_property_type.toLowerCase();
        const simplifiedType = safeFormData.flow_listing_type.toLowerCase();
        
        // Override the detected propertyCategory based on flow_property_type
        safeFormData.propertyCategory = simplifiedCategory;
        
        // Build a consistent propertyFlow based on the flow properties
        if (simplifiedCategory === 'commercial' && simplifiedType === 'coworking') {
          safeFormData.propertyFlow = 'COMMERCIAL_COWORKING';
        } else if (simplifiedCategory === 'commercial' && simplifiedType === 'rent') {
          safeFormData.propertyFlow = 'COMMERCIAL_RENT';
        } else if (simplifiedCategory === 'commercial' && simplifiedType === 'sale') {
          safeFormData.propertyFlow = 'COMMERCIAL_SALE';
        } else if (simplifiedCategory === 'residential' && simplifiedType === 'pghostel') {
          safeFormData.propertyFlow = 'RESIDENTIAL_PGHOSTEL';
        } else if (simplifiedCategory === 'residential' && simplifiedType === 'flatmates') {
          safeFormData.propertyFlow = 'RESIDENTIAL_FLATMATES';
        } else if (simplifiedCategory === 'land' && simplifiedType === 'sale') {
          safeFormData.propertyFlow = 'LAND_SALE';
        } else if (simplifiedCategory === 'residential' && simplifiedType === 'sale') {
          safeFormData.propertyFlow = 'RESIDENTIAL_SALE';
        } else if (simplifiedCategory === 'residential' && simplifiedType === 'rent') {
          safeFormData.propertyFlow = 'RESIDENTIAL_RENT';
        }
      }
      
      // Format price properties to ensure they're numeric
      if (safeFormData.price && typeof safeFormData.price === 'string') {
        safeFormData.price = parseFloat(safeFormData.price.replace(/,/g, ''));
      }
      
      if (safeFormData.monthlyRent && typeof safeFormData.monthlyRent === 'string') {
        safeFormData.monthlyRent = parseFloat(safeFormData.monthlyRent.replace(/,/g, ''));
      }
      
      // Save to database
      let result;
      if (mode === 'create') {
        const { data, error } = await supabase
          .from('properties')
          .insert([safeFormData])
          .select();
          
        if (error) throw error;
        result = data?.[0];
      } else if (mode === 'edit' && existingPropertyId) {
        const { data, error } = await supabase
          .from('properties')
          .update(safeFormData)
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
  const handleAutoFill = (formType?: string) => {
    if (process.env.NODE_ENV !== 'production') {
      // Create a mapping of form types to TEST_DATA keys
      const testDataMapping: Record<string, keyof typeof TEST_DATA> = {
        'residential_rent': 'rental',
        'residential_sale': 'sale',
        'pg_hostel': 'pg_details',
        'room_details': 'room_details',
        'basic': 'basic',
        'location': 'location',
        'amenities': 'amenities'
      };
      
      // Get the appropriate test data section
      const testDataKey = testDataMapping[formType || 'residential_rent'] || 'rental';
      const testDataToUse = TEST_DATA[testDataKey];
      
      if (testDataToUse) {
        form.reset({
          ...form.getValues(),
          ...testDataToUse
        });
      } else {
        console.warn(`No test data found for form type: ${formType}`);
      }
    }
  };
  
  // Handle saving as draft
  const handleSaveAsDraft = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const formData = form.getValues();
      const result = await saveProperty(formData, 'draft');
      
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
      const result = await saveProperty(formData, 'published');
      
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
      const result = await saveProperty(formData, status);
      
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
    handleAutoFill
  };
}