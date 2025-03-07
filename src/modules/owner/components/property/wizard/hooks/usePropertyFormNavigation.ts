// src/modules/owner/components/property/wizard/hooks/usePropertyFormNavigation.ts
// Version: 2.0.0
// Last Modified: 08-03-2025 22:00 IST
// Purpose: Removed excessive logging and simplified navigation logic

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { STEPS } from '../constants';

interface UsePropertyFormNavigationProps {
  form: UseFormReturn<FormData>;
  validateCurrentStep: () => boolean;
  user: any;
  mode?: 'create' | 'edit';
  existingPropertyId?: string;
  setError: (error: string) => void;
}

export function usePropertyFormNavigation({
  form,
  validateCurrentStep,
  user,
  mode = 'create',
  existingPropertyId,
  setError
}: UsePropertyFormNavigationProps) {
  const navigate = useNavigate();
  const { step: urlStep } = useParams();
  const location = useLocation();
  
  // Check for step parameter in query string for edit mode
  const queryParams = new URLSearchParams(location.search);
  const queryStep = queryParams.get('step');
  
  // Combine URL parameter step and query parameter step
  const effectiveUrlStep = urlStep || queryStep;
  
  // Define currentStep state
  const [currentStep, setCurrentStep] = useState<number>(() => {
    // If step is in URL or query params, prioritize that regardless of mode
    if (effectiveUrlStep) {
      const stepIndex = STEPS.findIndex(s => s.id === effectiveUrlStep) + 1;
      // Ensure a valid step index, defaulting to 1 (details) if not found or invalid
      return stepIndex > 0 ? stepIndex : 1;
    }
    
    // For newly created listings after property type selection, always start at step 1
    if (mode === 'create' && !existingPropertyId) {
      return 1; // Always start with Basic Details (step 1)
    }
    
    // If we're in edit mode, try loading from local storage
    if (mode === 'edit' && user?.id && existingPropertyId) {
      const savedStep = localStorage.getItem(`propertyWizard_${user.id}_${existingPropertyId}_step`);
      if (savedStep) {
        return parseInt(savedStep);
      }
    }
    
    // Fall back to general saved step
    if (user?.id) {
      const savedStep = localStorage.getItem(`propertyWizard_${user.id}_step`);
      if (savedStep) {
        return parseInt(savedStep);
      }
    }
    
    // Default to first step (Basic Details)
    return 1;
  });

  // Update URL when step changes - simplified to avoid excessive re-renders
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

      const stepData = STEPS[newStep - 1];
      if (!stepData) {
        return;
      }

      // For edit mode, use query parameter
      if (mode === 'edit' && existingPropertyId) {
        const newPath = `/properties/${existingPropertyId}/edit?step=${stepData.id}`;
        navigate(newPath, { replace: true });
        return;
      }

      // For create mode, use path parameter
      const stepId = stepData.id;
      const newPath = `/properties/list/${effectiveCategory.toLowerCase()}/${effectiveType.toLowerCase()}/${stepId}`;
      navigate(newPath, { replace: true });
    } catch (err) {
      // Silent error handling to avoid console spam
    }
  }, [navigate, form, mode, existingPropertyId]);

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
        
        // In edit mode, store with property ID
        if (mode === 'edit' && existingPropertyId) {
          localStorage.setItem(`propertyWizard_${user.id}_${existingPropertyId}_data`, JSON.stringify(safeData));
        } else {
          localStorage.setItem(`propertyWizard_${user.id}_data`, JSON.stringify(safeData));
        }
      }
    } catch (err) {
      // Silent error handling
    }
  }, [user?.id, mode, existingPropertyId]);

  // Enhanced setCurrentStep with localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    try {
      setCurrentStep(step);
      
      if (user?.id) {
        // In edit mode, store step with property ID
        if (mode === 'edit' && existingPropertyId) {
          localStorage.setItem(`propertyWizard_${user.id}_${existingPropertyId}_step`, step.toString());
        } else {
          localStorage.setItem(`propertyWizard_${user.id}_step`, step.toString());
        }
      }
    } catch (err) {
      // Silent error handling
    }
  }, [user?.id, mode, existingPropertyId]);

  // Simplified next step handler
  const handleNextStep = useCallback(() => {
    try {
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
      setCurrentStepWithPersistence(Math.min(currentStep + 1, STEPS.length));
    } catch (err) {
      setError('An error occurred while proceeding to the next step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, validateCurrentStep, setError]);

  // Simplified previous step handler
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
      setCurrentStepWithPersistence(Math.max(currentStep - 1, 1));
    } catch (err) {
      setError('An error occurred while going back to the previous step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, setError]);

  // Clear storage when form is completed
  const clearStorage = useCallback(() => {
    try {
      if (user?.id) {
        if (mode === 'edit' && existingPropertyId) {
          localStorage.removeItem(`propertyWizard_${user.id}_${existingPropertyId}_step`);
          localStorage.removeItem(`propertyWizard_${user.id}_${existingPropertyId}_data`);
        } else {
          localStorage.removeItem(`propertyWizard_${user.id}_step`);
          localStorage.removeItem(`propertyWizard_${user.id}_data`);
        }
      }
    } catch (err) {
      // Silent error handling
    }
  }, [user?.id, mode, existingPropertyId]);

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
    saveFormToStorage
  };
}