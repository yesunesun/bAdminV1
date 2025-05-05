// src/modules/owner/components/property/wizard/hooks/usePropertyForm.ts
// Version: 5.0.0
// Last Modified: 04-05-2025 19:30 IST
// Purpose: Updated to only support v3 data structure

import { usePropertyFormState } from './usePropertyFormState';
import { usePropertyFormNavigation } from './usePropertyFormNavigation';
import { usePropertyFormOperations } from './usePropertyFormOperations';
import { usePropertyFormValidation } from './usePropertyFormValidation';
import { FormData } from '../types';
import { 
  detectDataVersion, 
  DATA_VERSION_V3
} from '../utils/propertyDataAdapter';
import { AutoFillService } from '../services/autoFillService';

interface UsePropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
  mode?: 'create' | 'edit';
  status?: 'draft' | 'published';
  propertyCategory?: string;
  adType?: string;
  city?: string;
}

export function usePropertyForm({
  initialData,
  propertyId: existingPropertyId,
  mode = 'create',
  status: initialStatus = 'draft',
  propertyCategory,
  adType,
  city
}: UsePropertyFormProps) {
  // Initialize form state (form, errors, status, etc.)
  const {
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
    user
  } = usePropertyFormState({
    initialData,
    propertyCategory,
    adType,
    city,
    existingPropertyId,
    initialStatus,
    mode
  });
  
  // Initialize validation
  const { validateCurrentStep } = usePropertyFormValidation(form);
  
  // Initialize navigation
  const {
    currentStep,
    setCurrentStep: setCurrentStepWithPersistence,
    handleNextStep,
    handlePreviousStep,
    clearStorage,
    handleImageUploadComplete
  } = usePropertyFormNavigation({
    form,
    validateCurrentStep,
    user,
    mode,
    existingPropertyId,
    setError,
    isPGHostelMode
  });
  
  // Initialize operations (save, update, etc.)
  const {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate
  } = usePropertyFormOperations({
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
  });

  // Get the current data version of the form
  const formData = form.getValues();
  const dataVersion = detectDataVersion(formData);
  
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
      
      // Auto-fill based on current step using our new service
      AutoFillService.autoFillCurrentStep(form, currentStepId, currentStep);
      
    } catch (error) {
      console.error("Error in handleAutoFill:", error);
      setError("Error auto-filling form. Please check console for details.");
    }
  };

  return {
    form,
    currentStep,
    error,
    saving,
    savedPropertyId,
    user,
    status,
    isSaleMode,
    isPGHostelMode,
    dataVersion,
    handleAutoFill,
    handleNextStep,
    handlePreviousStep,
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleImageUploadComplete,
    setCurrentStep: setCurrentStepWithPersistence,
    setError
  };
}