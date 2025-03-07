// src/modules/owner/components/property/wizard/hooks/usePropertyForm.ts
// Version: 3.2.0
// Last Modified: 08-03-2025 20:45 IST
// Purpose: Exposed isSaleMode flag and improved form orchestration

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
    setError
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
    isSaleMode,  // Make sure we expose this flag
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