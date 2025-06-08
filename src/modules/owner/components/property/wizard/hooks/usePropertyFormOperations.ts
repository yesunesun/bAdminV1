// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 7.1.0
// Last Modified: 13-05-2025 14:45 IST
// Purpose: Refactored to use the centralized formDataFormatter utility

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { propertyService } from '../../../../services/propertyService';
import { FlowServiceFactory } from '../services/flows/FlowServiceFactory';
import { FlowContext } from '../services/flows/FlowServiceInterface';
import { prepareFormDataForSubmission } from '../utils/formDataFormatter';

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
  setSavedPropertyId: (id: string) => void;
  setSaving: (isSaving: boolean) => void;
  setError: (error: string) => void;
  handleNextStep?: () => void;
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
  const [lastOperation, setLastOperation] = useState<string | null>(null);

  /**
   * Prepare form data before saving using the centralized utility
   */
  const prepareFormData = (): FormData => {
    // Get the current form data
    const rawFormData = form.getValues();
    
    // Create flow context params
    const contextParams = {
      urlPath: window.location.pathname,
      isSaleMode,
      isPGHostelMode,
      adType
    };
    
    // Use the utility function to prepare the data for submission
    return prepareFormDataForSubmission(rawFormData, contextParams);
  };

  /**
   * Save the property as a draft
   */
  const handleSaveAsDraft = async (): Promise<string> => {
    try {
      setLastOperation('saveAsDraft');
      setSaving(true);
      setError('');
      
      // Check if user is logged in
      if (!user || !user.id) {
        throw new Error('You need to be logged in to save a property');
      }
      
      const formData = prepareFormData();
      
      // Set status as draft
      formData.meta.status = 'draft';
      
      // Save the property
      let result;
      
      if (mode === 'create' || !existingPropertyId) {
        console.log('Creating new property as draft');
        result = await propertyService.createProperty(formData, user.id, 'draft');
      } else {
        console.log('Updating existing property as draft');
        result = await propertyService.updateProperty(existingPropertyId, formData, user.id, 'draft');
      }
      
      // Set the status and saved property ID
      setStatus('draft');
      if (result && result.id) {
        setSavedPropertyId(result.id);
        console.log('Property saved successfully with ID:', result.id);
      }
      
      if (handleNextStep) {
        handleNextStep();
      }
      
      return result.id;
    } catch (error) {
      console.error('Error saving property as draft:', error);
      setError('Failed to save property: ' + (error.message || 'Unknown error'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Save the property and publish it
   */
  const handleSaveAndPublish = async (): Promise<string> => {
    try {
      setLastOperation('saveAndPublish');
      setSaving(true);
      setError('');
      
      // Check if user is logged in
      if (!user || !user.id) {
        throw new Error('You need to be logged in to publish a property');
      }
      
      const formData = prepareFormData();
      
      // Set status as published
      formData.meta.status = 'published';
      
      // Save the property
      let result;
      
      if (mode === 'create' || !existingPropertyId) {
        console.log('Creating new property as published');
        result = await propertyService.createProperty(formData, user.id, 'published');
      } else {
        console.log('Updating existing property as published');
        result = await propertyService.updateProperty(existingPropertyId, formData, user.id, 'published');
      }
      
      // Set the status and saved property ID
      setStatus('published');
      if (result && result.id) {
        setSavedPropertyId(result.id);
        console.log('Property published successfully with ID:', result.id);
        
        // Navigate to the property details page after publishing
        setTimeout(() => {
          navigate(`/properties/${result.id}`);
        }, 1000);
      }
      
      return result.id;
    } catch (error) {
      console.error('Error publishing property:', error);
      setError('Failed to publish property: ' + (error.message || 'Unknown error'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Update an existing property
   */
  const handleUpdate = async (): Promise<string> => {
    try {
      setLastOperation('update');
      setSaving(true);
      setError('');
      
      // Check if user is logged in and property ID exists
      if (!user || !user.id) {
        throw new Error('You need to be logged in to update a property');
      }
      
      if (!existingPropertyId) {
        throw new Error('No property ID found for update');
      }
      
      const formData = prepareFormData();
      
      // Keep the current status
      formData.meta.status = status;
      
      // Update the property
      console.log('Updating existing property');
      const result = await propertyService.updateProperty(existingPropertyId, formData, user.id);
      
      if (result && result.id) {
        setSavedPropertyId(result.id);
        console.log('Property updated successfully with ID:', result.id);
      }
      
      return result.id;
    } catch (error) {
      console.error('Error updating property:', error);
      setError('Failed to update property: ' + (error.message || 'Unknown error'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    lastOperation
  };
}