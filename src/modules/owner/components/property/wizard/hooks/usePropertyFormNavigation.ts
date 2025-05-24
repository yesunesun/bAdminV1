// src/modules/owner/components/property/wizard/hooks/usePropertyFormNavigation.ts
// Version: 3.0.0
// Last Modified: 25-05-2025 16:30 IST
// Purpose: Remove edit mode functionality and simplify navigation

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { STEPS, FLOW_STEPS } from '../constants'; // Updated to import FLOW_STEPS

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
  
  // Get the appropriate steps based on property type
  const effectiveSteps = isPGHostelMode 
    ? FLOW_STEPS.RESIDENTIAL_PGHOSTEL 
    : STEPS;
  
  // Define currentStep state
  const [currentStep, setCurrentStep] = useState<number>(() => {
    // If step is in URL, prioritize that
    if (urlStep) {
      const stepIndex = effectiveSteps.findIndex(s => s.id === urlStep) + 1;
      // Ensure a valid step index, defaulting to 1 if not found or invalid
      return stepIndex > 0 ? stepIndex : 1;
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

      const stepData = effectiveSteps[newStep - 1];
      if (!stepData) {
        return;
      }

      // For create mode, use path parameter
      const stepId = stepData.id;
      const newPath = `/properties/list/${effectiveCategory.toLowerCase()}/${effectiveType.toLowerCase()}/${stepId}`;
      navigate(newPath, { replace: true });
    } catch (err) {
      // Silent error handling to avoid console spam
    }
  }, [navigate, form, effectiveSteps]);

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
      // Silent error handling
    }
  }, [user?.id]);

  // Enhanced setCurrentStep with localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    try {
      setCurrentStep(step);
      
      if (user?.id) {
        localStorage.setItem(`propertyWizard_${user.id}_step`, step.toString());
      }
    } catch (err) {
      // Silent error handling
    }
  }, [user?.id]);

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
        return;
      }
      
      const formData = form.getValues();
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      
      // Always use effectiveSteps to determine the flow
      const maxStep = effectiveSteps.length;
      const nextStep = Math.min(currentStep + 1, maxStep);
      
      setCurrentStepWithPersistence(nextStep);
      
      // Add debug logging
      console.log(`Navigation: Moving from step ${currentStep} to step ${nextStep} (max: ${maxStep})`);
      console.log(`Current step ID: ${effectiveSteps[currentStep - 1]?.id}, Next step ID: ${effectiveSteps[nextStep - 1]?.id}`);
      console.log(`Using PG/Hostel mode: ${isPGHostelMode}`);
      
    } catch (err) {
      setError('An error occurred while proceeding to the next step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, validateCurrentStep, setError, effectiveSteps, isPGHostelMode]);

  // Added handlePreviousStep implementation
  const handlePreviousStep = useCallback(() => {
    try {
      if (!form || typeof form.getValues !== 'function') {
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
      console.log(`Navigation: Moving back from step ${currentStep} to step ${prevStep}`);
      console.log(`Current step ID: ${effectiveSteps[currentStep - 1]?.id}, Previous step ID: ${effectiveSteps[prevStep - 1]?.id}`);
      console.log(`Using PG/Hostel mode: ${isPGHostelMode}`);
      
    } catch (err) {
      setError('An error occurred while going back to the previous step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, setError, effectiveSteps, isPGHostelMode]);

  // Clear storage when form is completed
  const clearStorage = useCallback(() => {
    try {
      if (user?.id) {
        localStorage.removeItem(`propertyWizard_${user.id}_step`);
        localStorage.removeItem(`propertyWizard_${user.id}_data`);
      }
    } catch (err) {
      // Silent error handling
    }
  }, [user?.id]);

  const handleImageUploadComplete = useCallback(() => {
    try {
      clearStorage();
      navigate('/properties');
    } catch (err) {
      // Silent error handling
    }
  }, [clearStorage, navigate]);

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