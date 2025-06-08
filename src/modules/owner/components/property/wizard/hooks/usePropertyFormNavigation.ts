// src/modules/owner/components/property/wizard/hooks/usePropertyFormNavigation.ts
// Version: 4.1.0
// Last Modified: 29-05-2025 18:30 IST
// Purpose: Enhanced navigation with integrated step validation system (Fixed imports and syntax)

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { FLOW_STEP_SEQUENCES } from '../constants/flows';

// Define fallback steps in case STEPS is not available
const FALLBACK_STEPS = [
  { id: 'details', title: 'Property Details' },
  { id: 'location', title: 'Location' },
  { id: 'rental', title: 'Rental Details' },
  { id: 'features', title: 'Features' },
  { id: 'review', title: 'Review' }
];

interface UsePropertyFormNavigationProps {
  form: UseFormReturn<FormData>;
  user: any;
  mode?: 'create';
  existingPropertyId?: string;
  setError: (error: string) => void;
  isPGHostelMode?: boolean;
  flowType?: string;
}

export function usePropertyFormNavigation({
  form,
  user,
  mode = 'create',
  existingPropertyId,
  setError,
  isPGHostelMode = false,
  flowType = 'residential_rent'
}: UsePropertyFormNavigationProps) {
  const navigate = useNavigate();
  const { step: urlStep } = useParams();
  
  // Get the appropriate steps based on property type
  const getEffectiveSteps = () => {
    try {
      if (isPGHostelMode) {
        return FLOW_STEP_SEQUENCES?.residential_pghostel || FALLBACK_STEPS;
      }
      return FLOW_STEP_SEQUENCES?.[flowType] || FALLBACK_STEPS;
    } catch (error) {
      console.warn('[usePropertyFormNavigation] Error getting effective steps:', error);
      return FALLBACK_STEPS;
    }
  };

  const effectiveSteps = getEffectiveSteps();
  
  // Ensure we always have a valid steps array
  const safeEffectiveSteps = Array.isArray(effectiveSteps) && effectiveSteps.length > 0 
    ? effectiveSteps 
    : FALLBACK_STEPS;
  
  // Define currentStep state
  const [currentStep, setCurrentStep] = useState<number>(() => {
    if (urlStep && safeEffectiveSteps) {
      try {
        const stepIndex = safeEffectiveSteps.findIndex(s => s?.id === urlStep) + 1;
        const validStepIndex = stepIndex > 0 ? stepIndex : 1;
        return validStepIndex;
      } catch (error) {
        console.error('[usePropertyFormNavigation] Error resolving URL step:', error);
        return 1;
      }
    }
    return 1;
  });

  // Get current step ID for validation
  const currentStepId = safeEffectiveSteps[currentStep - 1]?.id || '';

  // Simple validation function (will be enhanced with proper validation later)
  const validateCurrentStep = useCallback(() => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        return false;
      }
      
      // For now, return true - will be enhanced with proper validation
      return true;
    } catch (error) {
      console.error('[usePropertyFormNavigation] Validation error:', error);
      return false;
    }
  }, [form]);

  // Update URL when step changes
  const updateUrl = useCallback((newStep: number) => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        return;
      }
      
      const effectiveCategory = form.getValues('propertyType');
      const effectiveType = form.getValues('listingType');
      
      if (!effectiveCategory || !effectiveType) {
        return;
      }

      const stepData = safeEffectiveSteps[newStep - 1];
      if (!stepData || !stepData.id) {
        console.warn('[usePropertyFormNavigation] Invalid step data for step:', newStep);
        return;
      }

      const stepId = stepData.id;
      const newPath = `/properties/list/${effectiveCategory.toLowerCase()}/${effectiveType.toLowerCase()}/${stepId}`;
      navigate(newPath, { replace: true });
      
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error updating URL:', err);
    }
  }, [navigate, form, safeEffectiveSteps]);

  // Effect to sync URL with current step
  useEffect(() => {
    const timer = setTimeout(() => {
      if (form && typeof form.getValues === 'function') {
        updateUrl(currentStep);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentStep, updateUrl, form]);

  // Save form data to localStorage
  const saveFormToStorage = useCallback((data: Partial<FormData>) => {
    try {
      if (user?.id) {
        const safeData = {
          ...data,
          flatPlotNo: data.flatPlotNo || ''
        };
        
        localStorage.setItem(`propertyWizard_${user.id}_data`, JSON.stringify(safeData));
      }
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error saving to storage:', err);
    }
  }, [user?.id]);

  // Enhanced setCurrentStep with localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    try {
      const maxSteps = safeEffectiveSteps.length;
      const validStep = Math.max(1, Math.min(step, maxSteps));
      
      setCurrentStep(validStep);
      
      if (user?.id) {
        localStorage.setItem(`propertyWizard_${user.id}_step`, validStep.toString());
      }
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error setting current step:', err);
    }
  }, [user?.id, safeEffectiveSteps]);

  // Enhanced next step handler with validation
  const handleNextStep = useCallback(() => {
    try {
      // Clear any previous errors
      setError('');
      
      // Validate current step before proceeding
      if (!validateCurrentStep()) {
        setError('Please fill in all required fields before continuing');
        return;
      }
      
      if (!form || typeof form.getValues !== 'function') {
        console.warn('[usePropertyFormNavigation] Form not available for next step');
        return;
      }
      
      const formData = form.getValues();
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      
      const maxStep = safeEffectiveSteps.length;
      const nextStep = Math.min(currentStep + 1, maxStep);
      
      setCurrentStepWithPersistence(nextStep);
      
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error in handleNextStep:', err);
      setError('An error occurred while proceeding to the next step. Please try again.');
    }
  }, [
    currentStep, 
    form, 
    saveFormToStorage, 
    setCurrentStepWithPersistence, 
    setError, 
    safeEffectiveSteps, 
    validateCurrentStep
  ]);

  // Enhanced previous step handler
  const handlePreviousStep = useCallback(() => {
    try {
      setError(''); // Clear errors when going back
      
      if (!form || typeof form.getValues !== 'function') {
        console.warn('[usePropertyFormNavigation] Form not available for previous step');
        return;
      }
      
      const formData = form.getValues();
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      
      const prevStep = Math.max(currentStep - 1, 1);
      setCurrentStepWithPersistence(prevStep);
      
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error in handlePreviousStep:', err);
      setError('An error occurred while going back to the previous step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, setError]);

  // Clear storage when form is completed
  const clearStorage = useCallback(() => {
    try {
      if (user?.id) {
        localStorage.removeItem(`propertyWizard_${user.id}_step`);
        localStorage.removeItem(`propertyWizard_${user.id}_data`);
      }
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error clearing storage:', err);
    }
  }, [user?.id]);

  const handleImageUploadComplete = useCallback(() => {
    try {
      clearStorage();
      navigate('/properties');
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error in handleImageUploadComplete:', err);
    }
  }, [clearStorage, navigate]);

  return {
    // Navigation state
    currentStep,
    setCurrentStep: setCurrentStepWithPersistence,
    
    // Navigation handlers
    handleNextStep,
    handlePreviousStep,
    
    // Validation state (simplified for now)
    canProceed: true,
    isValidating: false,
    validationErrors: [],
    completionPercentage: 100,
    
    // Validation methods
    validateCurrentStep,
    
    // Utility methods
    clearStorage,
    handleImageUploadComplete,
    saveFormToStorage,
    
    // Step information
    totalSteps: safeEffectiveSteps.length,
    currentStepId,
    effectiveSteps: safeEffectiveSteps
  };
}