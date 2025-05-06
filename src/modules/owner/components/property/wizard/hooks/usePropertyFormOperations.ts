// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 5.0.0
// Last Modified: 06-05-2025 15:30 IST
// Purpose: Removed legacy v1/v2 support and implemented v3-only structure with flow type detection

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { CURRENT_DATA_VERSION } from '../utils/propertyDataAdapter';
import { AutoFillService } from '../services/autoFillService';
import { propertyService } from '@/modules/owner/services/propertyService';
import { FLOW_TYPES } from '../constants/flows';

// Define interface for component props
export interface UsePropertyFormOperationsProps {
  form: UseFormReturn<FormData>;
  user: any;
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
   * Determines the flow type based on form data, URL parameters, and property characteristics
   * Returns a standardized flow type from FLOW_TYPES
   */
  const determineFlowType = (): string => {
    const formData = form.getValues();
    const urlPath = window.location.pathname.toLowerCase();
    
    // Get property category from flow data if available
    const category = formData.flow?.category || 'residential';
    
    // Extract listing type from the URL path or default to form data
    const listingType = formData.flow?.listingType || 
                       (isSaleMode ? 'sale' : 'rent');
    
    // Check for specialized property types
    if (isPGHostelMode || urlPath.includes('pghostel')) {
      return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    }
    
    if (urlPath.includes('flatmate')) {
      return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    }
    
    // Handle commercial properties
    if (category === 'commercial' || urlPath.includes('commercial')) {
      if (urlPath.includes('coworking')) {
        return FLOW_TYPES.COMMERCIAL_COWORKING;
      }
      
      return listingType === 'sale' 
        ? FLOW_TYPES.COMMERCIAL_SALE 
        : FLOW_TYPES.COMMERCIAL_RENT;
    }
    
    // Handle land/plot properties
    if (category === 'land' || urlPath.includes('land') || urlPath.includes('plot')) {
      return FLOW_TYPES.LAND_SALE;
    }
    
    // Default to residential rent or sale
    return listingType === 'sale' 
      ? FLOW_TYPES.RESIDENTIAL_SALE 
      : FLOW_TYPES.RESIDENTIAL_RENT;
  };
  
  /**
   * Ensures form data has the v3 structure and updates flow information
   */
  const prepareFormDataForSubmission = (formData: FormData): FormData => {
    // Create a deep copy to avoid mutating the original
    const preparedData = JSON.parse(JSON.stringify(formData));
    
    // Ensure meta section exists
    if (!preparedData.meta) {
      preparedData.meta = {
        _version: CURRENT_DATA_VERSION,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'draft'
      };
    } else {
      preparedData.meta._version = CURRENT_DATA_VERSION;
      preparedData.meta.updated_at = new Date().toISOString();
    }
    
    // Determine flow type and update flow section
    const flowType = determineFlowType();
    const [category, listingType] = flowType.split('_');
    
    // Ensure flow section exists
    if (!preparedData.flow) {
      preparedData.flow = {
        category: category,
        listingType: listingType
      };
    } else {
      preparedData.flow.category = category;
      preparedData.flow.listingType = listingType;
    }
    
    // Ensure title exists (required for database)
    if (!preparedData.details?.basicDetails?.title) {
      if (!preparedData.details) preparedData.details = {};
      if (!preparedData.details.basicDetails) preparedData.details.basicDetails = {};
      preparedData.details.basicDetails.title = 'New Property';
    }
    
    return preparedData;
  };
  
  /**
   * Saves the form data as a draft
   */
  const handleSaveAsDraft = async (): Promise<string> => {
    try {
      setSaving(true);
      
      // Get form data and prepare it for submission
      const formData = form.getValues();
      const preparedData = prepareFormDataForSubmission(formData);
      
      console.log("Form data prepared for saving:", preparedData);
      
      // Directly use the propertyService to create/update the property
      let savedProperty;
      
      if (mode === 'edit' && existingPropertyId) {
        console.log("Updating existing property:", existingPropertyId);
        savedProperty = await propertyService.updateProperty(existingPropertyId, preparedData, user.id, 'draft');
      } else {
        console.log("Creating new property...");
        savedProperty = await propertyService.createProperty(preparedData, user.id, 'draft');
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
      
      // Get form data and prepare it for submission
      const formData = form.getValues();
      const preparedData = prepareFormDataForSubmission(formData);
      
      console.log("Form data prepared for publishing:", preparedData);
      
      // Directly use the propertyService to create/update the property
      let savedProperty;
      
      if (mode === 'edit' && existingPropertyId) {
        console.log("Updating and publishing existing property:", existingPropertyId);
        savedProperty = await propertyService.updateProperty(existingPropertyId, preparedData, user.id, 'published');
      } else {
        console.log("Creating and publishing new property...");
        savedProperty = await propertyService.createProperty(preparedData, user.id, 'published');
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
      const preparedData = prepareFormDataForSubmission(updatedData);
      
      // Use the property service to update
      const savedProperty = await propertyService.updateProperty(
        existingPropertyId, 
        preparedData, 
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
    CURRENT_DATA_VERSION
  };
}