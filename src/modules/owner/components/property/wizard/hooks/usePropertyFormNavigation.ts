// src/modules/owner/components/property/wizard/hooks/usePropertyFormNavigation.ts
// Version: 1.2.0
// Last Modified: 08-03-2025 14:30 IST
// Purpose: Improved URL step synchronization and navigation controls

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

  // Update URL when step changes
  const updateUrl = useCallback((newStep: number) => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for URL update');
        return;
      }
      
      const effectiveCategory = form.getValues('propertyType');
      const effectiveType = form.getValues('listingType');
      
      if (!effectiveCategory || !effectiveType) {
        console.error('Cannot update URL: missing category or type');
        return;
      }

      const stepData = STEPS[newStep - 1];
      if (!stepData) {
        console.error('Invalid step index for URL update:', newStep);
        return;
      }

      // For edit mode, use query parameter
      if (mode === 'edit' && existingPropertyId) {
        const newPath = `/properties/${existingPropertyId}/edit?step=${stepData.id}`;
        console.log('Updating URL to:', newPath);
        navigate(newPath, { replace: true });
        return;
      }

      // For create mode, use path parameter
      const stepId = stepData.id;
      const newPath = `/properties/list/${effectiveCategory.toLowerCase()}/${effectiveType.toLowerCase()}/${stepId}`;
      console.log('Updating URL to:', newPath);
      navigate(newPath, { replace: true });
    } catch (err) {
      console.error('Error updating URL:', err);
    }
  }, [navigate, form, mode, existingPropertyId]);

  // Effect to sync URL with current step
  useEffect(() => {
    // Only update URL when form is properly initialized
    if (form && typeof form.getValues === 'function') {
      updateUrl(currentStep);
    }
  }, [currentStep, updateUrl, form]);

  // Save form data to localStorage
  const saveFormToStorage = useCallback((data: Partial<FormData>) => {
    try {
      if (user?.id) {
        console.log('Saving form data to localStorage');
        
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
      console.error('Error saving form data to localStorage:', err);
    }
  }, [user?.id, mode, existingPropertyId]);

  // Enhanced setCurrentStep with localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    try {
      console.log('Setting current step to:', step);
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
      console.error('Error setting current step:', err);
    }
  }, [user?.id, mode, existingPropertyId]);

  // Handle next step with special case for Rental -> Features navigation
  const handleNextStep = useCallback(() => {
    try {
      console.log('=== handleNextStep called ===');
      
      if (!validateCurrentStep()) {
        setError('Please fill in all required fields');
        return;
      }
      
      setError('');
      
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for next step');
        return;
      }
      
      const formData = form.getValues();
      console.log('Current form data:', formData);
      console.log('Current step:', currentStep);
      
      // Special case: If current step is rental tab, force navigate to features tab
      const currentStepId = STEPS[currentStep - 1]?.id;
      console.log('Current step ID:', currentStepId);
      
      if (currentStepId === 'rental') {
        console.log('On rental tab, navigating to features tab');
        const featuresIndex = STEPS.findIndex(step => step.id === 'features');
        if (featuresIndex !== -1) {
          console.log('Found features tab at index:', featuresIndex);
          // Save form data before navigation
          saveFormToStorage(formData);
          // Navigate to features tab
          setCurrentStepWithPersistence(featuresIndex + 1);
          return;
        }
      }
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      setCurrentStepWithPersistence(Math.min(currentStep + 1, STEPS.length));
    } catch (err) {
      console.error('Error in handleNextStep:', err);
      setError('An error occurred while proceeding to the next step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, validateCurrentStep, setError]);

  // Handle previous step
  const handlePreviousStep = useCallback(() => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for previous step');
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
      console.error('Error in handlePreviousStep:', err);
      setError('An error occurred while going back to the previous step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence, setError]);

  // Clear storage when form is completed
  const clearStorage = useCallback(() => {
    try {
      if (user?.id) {
        console.log('Clearing form data from localStorage');
        if (mode === 'edit' && existingPropertyId) {
          localStorage.removeItem(`propertyWizard_${user.id}_${existingPropertyId}_step`);
          localStorage.removeItem(`propertyWizard_${user.id}_${existingPropertyId}_data`);
        } else {
          localStorage.removeItem(`propertyWizard_${user.id}_step`);
          localStorage.removeItem(`propertyWizard_${user.id}_data`);
        }
      }
    } catch (err) {
      console.error('Error clearing storage:', err);
    }
  }, [user?.id, mode, existingPropertyId]);

  const handleImageUploadComplete = useCallback(() => {
    try {
      clearStorage();
      navigate('/properties');
    } catch (err) {
      console.error('Error in handleImageUploadComplete:', err);
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