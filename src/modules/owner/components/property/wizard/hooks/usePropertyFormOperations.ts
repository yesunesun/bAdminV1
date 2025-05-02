// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 4.7.0
// Last Modified: 02-05-2025 18:15 IST
// Purpose: Fixed property saving and ID return functionality

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { adapDataToFormats, detectDataVersion, DATA_VERSION_V1, DATA_VERSION_V2, CURRENT_DATA_VERSION } from '../utils/propertyDataAdapter';
import { supabase } from '@/lib/supabase';
import { AutoFillService } from '../services/autoFillService';
import { propertyService } from '@/modules/owner/services/propertyService';

// Define interface to fix type errors
export interface UsePropertyFormOperationsProps {
  form: UseFormReturn<FormData>;
  user: any; // Replace with your User type if available
  mode: 'create' | 'edit';
  existingPropertyId?: string;
  adType?: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;
  setSavedPropertyId: (id: string) => void;
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
  
  /**
   * Determines the flow type based on form data and URL parameters
   */
  const determineFlowType = () => {
    const formData = form.getValues();
    const urlPath = window.location.pathname.toLowerCase();
    
    // Check if we're in PG/Hostel mode
    if (isPGHostelMode || urlPath.includes('pghostel')) {
      return 'pghostel';
    }
    
    // Check if we're in Commercial mode
    if (formData.propertyType === 'Commercial' || urlPath.includes('commercial')) {
      if (urlPath.includes('coworking')) {
        return 'coworking';
      }
      
      if (isSaleMode || urlPath.includes('sale') || urlPath.includes('sell')) {
        return 'commercial_sale';
      }
      
      return 'commercial_rent';
    }
    
    // Check if we're in Land/Plot mode
    if (formData.propertyType === 'Land' || urlPath.includes('land') || urlPath.includes('plot')) {
      return 'land';
    }
    
    // Check if we're in Flatmates mode
    if (urlPath.includes('flatmate')) {
      return 'flatmates';
    }
    
    // Default to residential rent or sale
    if (isSaleMode || urlPath.includes('sale') || urlPath.includes('sell')) {
      return 'residential_sale';
    }
    
    return 'residential_rent';
  };
  
  /**
   * Saves the form data as a draft
   */
  const handleSaveAsDraft = async (): Promise<string> => {
    try {
      setSaving(true);
      
      // Get form data and validate it has required fields
      const formData = form.getValues();
      console.log("Form data to save:", formData);
      
      // Make sure we have the minimum required fields
      if (!formData.title) {
        formData.title = 'New Property';
      }
      
      // Directly use the propertyService to create/update the property
      let savedProperty;
      
      if (mode === 'edit' && existingPropertyId) {
        console.log("Updating existing property:", existingPropertyId);
        savedProperty = await propertyService.updateProperty(existingPropertyId, formData, user.id, 'draft');
      } else {
        console.log("Creating new property...");
        savedProperty = await propertyService.createProperty(formData, user.id, 'draft');
      }
      
      if (!savedProperty || !savedProperty.id) {
        throw new Error("Failed to save property - no ID returned");
      }
      
      console.log("Property saved successfully with ID:", savedProperty.id);
      
      // Set the saved property ID and status
      setSavedPropertyId(savedProperty.id);
      setStatus('draft');
      
      return savedProperty.id;
    } catch (error) {
      console.error("Error in handleSaveAsDraft:", error);
      setError(`Error saving property: ${error.message || "Unknown error"}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Saves and publishes the property
   */
  const handleSaveAndPublish = async (): Promise<string> => {
    try {
      setSaving(true);
      
      // Get form data and validate it has required fields
      const formData = form.getValues();
      
      // Make sure we have the minimum required fields
      if (!formData.title) {
        formData.title = 'New Property';
      }
      
      // Directly use the propertyService to create/update the property
      let savedProperty;
      
      if (mode === 'edit' && existingPropertyId) {
        console.log("Updating and publishing existing property:", existingPropertyId);
        savedProperty = await propertyService.updateProperty(existingPropertyId, formData, user.id, 'published');
      } else {
        console.log("Creating and publishing new property...");
        savedProperty = await propertyService.createProperty(formData, user.id, 'published');
      }
      
      if (!savedProperty || !savedProperty.id) {
        throw new Error("Failed to save and publish property - no ID returned");
      }
      
      console.log("Property saved and published successfully with ID:", savedProperty.id);
      
      // Set the saved property ID and status
      setSavedPropertyId(savedProperty.id);
      setStatus('published');
      
      return savedProperty.id;
    } catch (error) {
      console.error("Error in handleSaveAndPublish:", error);
      setError(`Error publishing property: ${error.message || "Unknown error"}`);
      throw error;
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Updates specific fields of the property
   */
  const handleUpdate = async (fields: Partial<FormData>) => {
    try {
      if (!existingPropertyId) {
        setError("Cannot update: No property ID provided");
        return false;
      }
      
      setSaving(true);
      
      // Merge current form data with provided fields
      const currentData = form.getValues();
      const updatedData = { ...currentData, ...fields };
      
      // Use the property service to update
      const savedProperty = await propertyService.updateProperty(
        existingPropertyId, 
        updatedData, 
        user.id
      );
      
      if (!savedProperty || !savedProperty.id) {
        throw new Error("Failed to update property");
      }
      
      console.log("Property updated successfully with ID:", savedProperty.id);
      return true;
    } catch (error) {
      console.error("Error in handleUpdate:", error);
      setError(`Error updating property: ${error.message || "Unknown error"}`);
      return false;
    } finally {
      setSaving(false);
    }
  };
  
  /**
   * Function to auto-fill the form with test data for the current step
   * Only available in development mode
   */
  const handleAutoFill = () => {
    try {
      console.log("Auto Fill requested");
      
      if (process.env.NODE_ENV !== 'development') {
        console.warn("Auto Fill is only available in development mode");
        return;
      }
      
      // Get current step ID from URL or default to 'details'
      const currentUrlPath = window.location.pathname;
      const pathParts = currentUrlPath.split('/');
      const lastPathSegment = pathParts[pathParts.length - 1];
      
      // Attempt to determine the current step ID
      let currentStepId = 'details';
      
      if (lastPathSegment && !lastPathSegment.includes('.')) {
        // If last path segment is not a file extension, use it as step ID
        currentStepId = lastPathSegment;
      }
      
      // Auto-fill based on current step using our service
      AutoFillService.autoFillCurrentStep(form, currentStepId, 1);
      
    } catch (error) {
      console.error("Error in handleAutoFill:", error);
      setError("Error auto-filling form. Please check console for details.");
    }
  };

  // Return all the functions and constants needed by consumers
  return {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleAutoFill,
    determineFlowType,
    detectDataVersion,
    CURRENT_DATA_VERSION
  };
}