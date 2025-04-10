// src/modules/owner/components/property/wizard/hooks/usePropertyForm.ts
// Version: 3.3.0
// Last Modified: 10-04-2025 15:50 IST
// Purpose: Added support for PG/Hostel flow

import { usePropertyFormState } from './usePropertyFormState';
import { usePropertyFormNavigation } from './usePropertyFormNavigation';
import { usePropertyFormOperations } from './usePropertyFormOperations';
import { usePropertyFormValidation } from './usePropertyFormValidation';
import { FormData } from '../types';

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
    handleUpdate,
    handleAutoFill
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

  return {
    form,
    currentStep,
    error,
    saving,
    savedPropertyId,
    user,
    status,
    isSaleMode,
    isPGHostelMode,  // Expose the new PG/Hostel flag
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