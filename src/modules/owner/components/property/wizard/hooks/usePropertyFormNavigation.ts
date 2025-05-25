// src/modules/owner/components/property/wizard/hooks/usePropertyFormNavigation.ts
// Version: 3.1.0
// Last Modified: 26-01-2025 00:15 IST
// Purpose: Fix PG/Hostel flow navigation error and ensure proper step handling

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { STEPS, FLOW_STEP_SEQUENCES } from '../constants'; // Updated to import FLOW_STEP_SEQUENCES

interface UsePropertyFormNavigationProps {
  form: UseFormReturn<FormData>;
  validateCurrentStep: () => boolean;
  user: any;
  mode?: 'create'; // Only create mode supported
  existingPropertyId?: string;
  setError: (error: string) => void;
  isPGHostelMode?: boolean;
}

export function usePropertyFormNavigation({
  form,
  validateCurrentStep,
  user,
  mode = 'create',
  existingPropertyId,
  setError,
  isPGHostelMode = false
}: UsePropertyFormNavigationProps) {
  const navigate = useNavigate();
  const { step: urlStep } = useParams();
  const location = useLocation();
  
  // Get the appropriate steps based on property type - FIXED: Use FLOW_STEP_SEQUENCES
  const effectiveSteps = isPGHostelMode 
    ? FLOW_STEP_SEQUENCES.residential_pghostel || STEPS  // Fallback to STEPS if undefined
    : STEPS;
  
  // Debug logging for step resolution
  console.log('[usePropertyFormNavigation] Step resolution:', {
    isPGHostelMode,
    effectiveStepsLength: effectiveSteps?.length,
    effectiveStepsType: Array.isArray(effectiveSteps) ? 'array' : typeof effectiveSteps,
    firstStep: effectiveSteps?.[0],
    availableFlowSequences: Object.keys(FLOW_STEP_SEQUENCES)
  });
  
  // Ensure we always have a valid steps array
  const safeEffectiveSteps = Array.isArray(effectiveSteps) && effectiveSteps.length > 0 
    ? effectiveSteps 
    : STEPS; // Fallback to default STEPS if effectiveSteps is invalid
  
  // Define currentStep state
  const [currentStep, setCurrentStep] = useState<number>(() => {
    // If step is in URL, prioritize that
    if (urlStep && safeEffectiveSteps) {
      try {
        const stepIndex = safeEffectiveSteps.findIndex(s => s?.id === urlStep) + 1;
        // Ensure a valid step index, defaulting to 1 if not found or invalid
        const validStepIndex = stepIndex > 0 ? stepIndex : 1;
        
        console.log('[usePropertyFormNavigation] URL step resolution:', {
          urlStep,
          stepIndex,
          validStepIndex,
          stepsAvailable: safeEffectiveSteps.map(s => s?.id).filter(Boolean)
        });
        
        return validStepIndex;
      } catch (error) {
        console.error('[usePropertyFormNavigation] Error resolving URL step:', error);
        return 1;
      }
    }
    
    // For newly created listings after property type selection, always start at step 1
    return 1; // Always start with first step
  });

  // Update URL when step changes - simplified for create mode only
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

      // For create mode, use path parameter
      const stepId = stepData.id;
      const newPath = `/properties/list/${effectiveCategory.toLowerCase()}/${effectiveType.toLowerCase()}/${stepId}`;
      navigate(newPath, { replace: true });
      
      console.log('[usePropertyFormNavigation] URL updated:', {
        newStep,
        stepId,
        newPath
      });
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error updating URL:', err);
      // Silent error handling to avoid console spam
    }
  }, [navigate, form, safeEffectiveSteps]);

  // Effect to sync URL with current step - with debounce to prevent rapid updates
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only update URL when form is properly initialized
      if (form && typeof form.getValues === 'function') {
        updateUrl(currentStep);
      }
    }, 100); // Small delay to avoid multiple URL updates
    
    return () => clearTimeout(timer);
  }, [currentStep, updateUrl, form]);

  // Save form data to localStorage - simplified
  const saveFormToStorage = useCallback((data: Partial<FormData>) => {
    try {
      if (user?.id) {
        // Make sure flatPlotNo exists in the data
        const safeData = {
          ...data,
          flatPlotNo: data.flatPlotNo || ''
        };
        
        localStorage.setItem(`propertyWizard_${user.id}_data`, JSON.stringify(safeData));
      }
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error saving to storage:', err);
      // Silent error handling
    }
  }, [user?.id]);

  // Enhanced setCurrentStep with localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    try {
      // Validate step number
      const maxSteps = safeEffectiveSteps.length;
      const validStep = Math.max(1, Math.min(step, maxSteps));
      
      console.log('[usePropertyFormNavigation] Setting step:', {
        requestedStep: step,
        validStep,
        maxSteps
      });
      
      setCurrentStep(validStep);
      
      if (user?.id) {
        localStorage.setItem(`propertyWizard_${user.id}_step`, validStep.toString());
      }
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error setting current step:', err);
      // Silent error handling
    }
  }, [user?.id, safeEffectiveSteps]);

  // Simplified next step handler
  const handleNextStep = useCallback(() => {
    try {
      // Validate current step before proceeding
      if (!validateCurrentStep()) {
        setError('Please fill in all required fields');
        return;
      }
      
      setError('');
      
      if (!form || typeof form.getValues !== 'function') {
        console.warn('[usePropertyFormNavigation] Form not available for next step');
        return;
      }
      
      const formData = form.getValues();
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      
      // Always use safeEffectiveSteps to determine the flow
      const maxStep = safeEffectiveSteps.length;
      const nextStep = Math.min(currentStep + 1, maxStep);
      
      setCurrentStepWithPersistence(nextStep);
      
      // Add debug logging
      console.log('[usePropertyFormNavigation] Moving to next step:', {
        currentStep,
        nextStep,
        maxStep,
        currentStepId: safeEffectiveSteps[currentStep - 1]?.id,
        nextStepId: safeEffectiveSteps[nextStep - 1]?.id,
        isPGHostelMode
      });
      
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error in handleNextStep:', err);
      setError('An error occurred while proceeding to the next step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, validateCurrentStep, setError, safeEffectiveSteps, isPGHostelMode]);

  // Added handlePreviousStep implementation
  const handlePreviousStep = useCallback(() => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.warn('[usePropertyFormNavigation] Form not available for previous step');
        return;
      }
      
      const formData = form.getValues();
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      
      // Calculate previous step
      const prevStep = Math.max(currentStep - 1, 1);
      
      // Update the current step with persistence
      setCurrentStepWithPersistence(prevStep);
      
      // Add debug logging
      console.log('[usePropertyFormNavigation] Moving to previous step:', {
        currentStep,
        prevStep,
        currentStepId: safeEffectiveSteps[currentStep - 1]?.id,
        prevStepId: safeEffectiveSteps[prevStep - 1]?.id,
        isPGHostelMode
      });
      
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error in handlePreviousStep:', err);
      setError('An error occurred while going back to the previous step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, setError, safeEffectiveSteps, isPGHostelMode]);

  // Clear storage when form is completed
  const clearStorage = useCallback(() => {
    try {
      if (user?.id) {
        localStorage.removeItem(`propertyWizard_${user.id}_step`);
        localStorage.removeItem(`propertyWizard_${user.id}_data`);
      }
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error clearing storage:', err);
      // Silent error handling
    }
  }, [user?.id]);

  const handleImageUploadComplete = useCallback(() => {
    try {
      clearStorage();
      navigate('/properties');
    } catch (err) {
      console.error('[usePropertyFormNavigation] Error in handleImageUploadComplete:', err);
      // Silent error handling
    }
  }, [clearStorage, navigate]);

  // Return with additional debugging info
  console.log('[usePropertyFormNavigation] Current state:', {
    currentStep,
    totalSteps: safeEffectiveSteps.length,
    currentStepId: safeEffectiveSteps[currentStep - 1]?.id,
    isPGHostelMode,
    hasValidSteps: safeEffectiveSteps.length > 0
  });

  return {
    currentStep,
    setCurrentStep: setCurrentStepWithPersistence,
    handleNextStep,
    handlePreviousStep,
    clearStorage,
    handleImageUploadComplete,
    saveFormToStorage,
    validateCurrentStep
  };
}