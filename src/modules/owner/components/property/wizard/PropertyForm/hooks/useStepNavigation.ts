// src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts
// Version: 5.0.0
// Last Modified: 09-03-2025 00:15 IST
// Purpose: Fixed navigation issues and added error handling

import { useMemo, useCallback } from 'react';
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
  // Determine if we're in sale mode (minimal checks to avoid excessive re-rendering)
  const isSaleMode = useMemo(() => {
    if (formIsSaleMode !== undefined) {
      return formIsSaleMode;
    }
    
    const listingType = form.getValues('listingType')?.toLowerCase() || '';
    return listingType === 'sale' || listingType === 'sell';
  }, [form, formIsSaleMode]);

  // Simplified visible steps function
  const getVisibleSteps = useCallback(() => {
    return STEPS.map(step => ({
      ...step,
      hidden: (step.id === 'rental' && isSaleMode) || (step.id === 'sale' && !isSaleMode)
    }));
  }, [STEPS, isSaleMode]);

  // Simple and direct next step handler
  const handleNextStep = useCallback(() => {
    // Basic safety check
    if (formStep < 1 || formStep > STEPS.length) {
      return;
    }
    
    // Just increment to the next step - keep it simple
    setCurrentStep(formStep + 1);
    
  }, [formStep, setCurrentStep, STEPS.length]);

  return {
    isSaleMode,
    getVisibleSteps,
    handleNextStep
  };
}