// src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts
// Version: 6.0.0
// Last Modified: 09-03-2025 02:30 IST
// Purpose: Fixed property type detection for sale properties

import { useMemo, useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';

interface UseStepNavigationProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  formIsSaleMode?: boolean;
  originalHandleNextStep: () => void;
  setCurrentStep: (step: number) => void;
  STEPS: any[]; 
}

export function useStepNavigation({
  form,
  formStep,
  formIsSaleMode,
  originalHandleNextStep,
  setCurrentStep,
  STEPS
}: UseStepNavigationProps) {
  // Improved sale mode detection logic
  const isSaleMode = useMemo(() => {
    // Check explicit flag first
    if (formIsSaleMode !== undefined) {
      return formIsSaleMode;
    }
    
    // Get current form values
    const formValues = form.getValues();
    
    // Check listing type - primary indicator
    const listingType = formValues.listingType?.toLowerCase() || '';
    const isSaleFromListingType = listingType === 'sale' || listingType === 'sell';
    
    // Check URL path for keywords
    const urlPath = window.location.pathname.toLowerCase();
    const isSaleFromUrl = urlPath.includes('sale') || urlPath.includes('sell');
    
    // Determine final result with URL having higher priority
    const result = isSaleFromUrl || isSaleFromListingType;
    
    return result;
  }, [form, formIsSaleMode]);
  
  // Effect to ensure the form data has the correct listingType
  useEffect(() => {
    try {
      const currentListingType = form.getValues('listingType')?.toLowerCase();
      
      // If the URL indicates sale but form has rent, update the form
      if (isSaleMode && (currentListingType === 'rent' || !currentListingType)) {
        form.setValue('listingType', 'sale', { shouldValidate: false, shouldDirty: true });
        
        // Also set isSaleProperty to true if it exists
        if ('isSaleProperty' in form.getValues()) {
          form.setValue('isSaleProperty', true, { shouldValidate: false, shouldDirty: true });
        }
      }
      
      // If URL indicates rent but form has sale, update the form
      if (!isSaleMode && (currentListingType === 'sale' || currentListingType === 'sell')) {
        form.setValue('listingType', 'rent', { shouldValidate: false, shouldDirty: true });
        
        // Also set isSaleProperty to false if it exists
        if ('isSaleProperty' in form.getValues()) {
          form.setValue('isSaleProperty', false, { shouldValidate: false, shouldDirty: true });
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }, [form, isSaleMode]);

  // Create a memoized step map for looking up indices quickly
  const stepIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    STEPS.forEach((step, index) => {
      indices[step.id] = index + 1; // 1-based index to match formStep
    });
    return indices;
  }, [STEPS]);

  // Simplified visible steps function
  const getVisibleSteps = useCallback(() => {
    return STEPS.map(step => ({
      ...step,
      hidden: (step.id === 'rental' && isSaleMode) || (step.id === 'sale' && !isSaleMode)
    }));
  }, [STEPS, isSaleMode]);

  // Direct step navigation - simplified to avoid any conditional checks that might fail
  const handleNextStep = useCallback(() => {
    try {
      // Get the current step ID safely
      const currentStepId = formStep > 0 && formStep <= STEPS.length 
        ? STEPS[formStep - 1]?.id 
        : null;
      
      // Explicitly handle each step transition to ensure proper flow
      if (currentStepId === 'details') {
        // Always go to location from details
        setCurrentStep(2); // Location is at index 2
        return;
      }
      
      if (currentStepId === 'location') {
        // From location, go to sale or rental based on type
        if (isSaleMode) {
          const saleIndex = STEPS.findIndex(s => s.id === 'sale');
          if (saleIndex !== -1) {
            setCurrentStep(saleIndex + 1);
          } else {
            setCurrentStep(formStep + 1);
          }
        } else {
          const rentalIndex = STEPS.findIndex(s => s.id === 'rental');
          if (rentalIndex !== -1) {
            setCurrentStep(rentalIndex + 1);
          } else {
            setCurrentStep(formStep + 1);
          }
        }
        return;
      }
      
      if (currentStepId === 'rental' || currentStepId === 'sale') {
        // From rental or sale, go to features
        const featuresIndex = STEPS.findIndex(s => s.id === 'features');
        if (featuresIndex !== -1) {
          setCurrentStep(featuresIndex + 1);
        } else {
          setCurrentStep(formStep + 1);
        }
        return;
      }
      
      if (currentStepId === 'features') {
        // From features, go to review
        const reviewIndex = STEPS.findIndex(s => s.id === 'review');
        if (reviewIndex !== -1) {
          setCurrentStep(reviewIndex + 1);
        } else {
          setCurrentStep(formStep + 1);
        }
        return;
      }
      
      // For all other cases, just increment the step
      setCurrentStep(formStep + 1);
    } catch (error) {
      // Fallback: just increment the step
      setCurrentStep(formStep + 1);
    }
  }, [form, formStep, isSaleMode, STEPS, setCurrentStep]);

  return {
    isSaleMode,
    getVisibleSteps,
    handleNextStep
  };
}