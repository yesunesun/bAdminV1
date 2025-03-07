// src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts
// Version: 1.1.0
// Last Modified: 07-03-2025 22:45 IST
// Purpose: Enhanced navigation logic to fix Rental to Features tab navigation

import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';

interface UseStepNavigationProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  formIsSaleMode?: boolean;
  originalHandleNextStep: () => void;
  setCurrentStep: (step: number) => void;
  STEPS: any[]; // Using any to match the original import type
}

export function useStepNavigation({
  form,
  formStep,
  formIsSaleMode,
  originalHandleNextStep,
  setCurrentStep,
  STEPS
}: UseStepNavigationProps) {
  
  // Enhanced isSaleMode detection with extensive debugging
  const isSaleMode = useMemo(() => {
    // First check from the usePropertyForm hook's determination
    if (formIsSaleMode !== undefined) {
      return formIsSaleMode;
    }
    
    // Get the most up-to-date form values
    const formValues = form.getValues();
    
    // Check multiple indicators for sale mode
    const indicators = {
      // Check listing type from form
      formListingType: (formValues.listingType?.toLowerCase() === 'sale' || formValues.listingType?.toLowerCase() === 'sell'),
      
      // Check explicit sale property flags
      isSalePropertyFlag: formValues.isSaleProperty === true,
      propertyPriceTypeFlag: formValues.propertyPriceType === 'sale',
      
      // Check if expectedPrice exists but rentAmount doesn't
      hasExpectedPriceOnly: !!(formValues.expectedPrice && !formValues.rentAmount)
    };
    
    // If ANY indicator is true, consider it a sale property
    const result = Object.values(indicators).some(indicator => indicator === true);
    
    console.log('Sale mode indicators:', indicators);
    console.log('Final sale mode determination:', result);
    
    return result;
  }, [form, formIsSaleMode]);

  // Get visible steps based on property type
  const getVisibleSteps = () => {
    return STEPS.map(step => ({
      ...step,
      // Hide rental tab for sale properties and vice versa
      hidden: (step.id === 'rental' && isSaleMode) || (step.id === 'sale' && !isSaleMode)
    }));
  };

  // Custom handleNextStep function that properly handles tab navigation for sale properties
  const handleNextStep = () => {
    console.log('=========== DEBUG: CUSTOM NEXT STEP HANDLER ===========');
    const currentStepId = STEPS[formStep - 1]?.id;
    console.log('Current step ID:', currentStepId);
    console.log('Is sale mode:', isSaleMode);
    console.log('Current form step index:', formStep);
    
    // If we're on the Location step and this is a sale property,
    // we should skip the Rental tab and go directly to Sale Details
    if (currentStepId === 'location' && isSaleMode) {
      console.log('Sale property detected, skipping rental tab, going to sale details');
      // Find the index of the sale step
      const saleStepIndex = STEPS.findIndex(step => step.id === 'sale');
      if (saleStepIndex !== -1) {
        setCurrentStep(saleStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', saleStepIndex + 1);
        return;
      }
    }
    
    // If we're on the Location step and this is a rental property,
    // we should skip the Sale tab and go directly to Rental Details
    if (currentStepId === 'location' && !isSaleMode) {
      console.log('Rental property detected, skipping sale tab, going to rental details');
      // Find the index of the rental step
      const rentalStepIndex = STEPS.findIndex(step => step.id === 'rental');
      if (rentalStepIndex !== -1) {
        setCurrentStep(rentalStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', rentalStepIndex + 1);
        return;
      }
    }
    
    // If we're on the Rental tab, navigate to Features tab
    if (currentStepId === 'rental') {
      console.log('Navigating from Rental tab to Features tab');
      // Find the index of the features step
      const featuresStepIndex = STEPS.findIndex(step => step.id === 'features');
      if (featuresStepIndex !== -1) {
        setCurrentStep(featuresStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', featuresStepIndex + 1);
        return;
      }
    }
    
    // If we're on the Sale tab, navigate to Features tab
    if (currentStepId === 'sale') {
      console.log('Navigating from Sale tab to Features tab');
      // Find the index of the features step
      const featuresStepIndex = STEPS.findIndex(step => step.id === 'features');
      if (featuresStepIndex !== -1) {
        setCurrentStep(featuresStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', featuresStepIndex + 1);
        return;
      }
    }
    
    // In other cases, proceed with normal next step
    console.log('Using default next step behavior');
    originalHandleNextStep();
    console.log('=========== DEBUG: CUSTOM NEXT STEP HANDLER END ===========');
  };

  return {
    isSaleMode,
    getVisibleSteps,
    handleNextStep
  };
}