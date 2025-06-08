// src/modules/owner/components/property/wizard/hooks/useValidatedNavigation.ts
// Version: 1.0.0
// Last Modified: 29-05-2025 19:15 IST
// Purpose: Enhanced navigation control with step validation

import { useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useStepValidation } from './useStepValidation';
import { FormData } from '../types';

interface UseValidatedNavigationProps {
  form: UseFormReturn<FormData>;
  flowType: string;
  currentStepId: string;
  onNavigationBlock?: (reason: string, missingFields: string[]) => void;
}

export function useValidatedNavigation({
  form,
  flowType,
  currentStepId,
  onNavigationBlock
}: UseValidatedNavigationProps) {
  
  const {
    canProceedToNextStep,
    getValidationSummary,
    validateCurrentStep,
    isValid: stepIsValid,
    requiredFields
  } = useStepValidation({
    form,
    flowType,
    currentStepId
  });

  // Check if navigation should be allowed
  const checkNavigationAllowed = useCallback(() => {
    const isValid = canProceedToNextStep();
    
    if (!isValid) {
      const summary = getValidationSummary();
      const missingFields = summary?.invalidFields.map(f => f.label) || [];
      
      if (onNavigationBlock) {
        onNavigationBlock(
          `Please complete all required fields before proceeding: ${missingFields.join(', ')}`,
          missingFields
        );
      }
      
      return false;
    }
    
    return true;
  }, [canProceedToNextStep, getValidationSummary, onNavigationBlock]);

  // Block navigation if validation fails
  const interceptNavigation = useCallback((event: Event) => {
    if (!checkNavigationAllowed()) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    return true;
  }, [checkNavigationAllowed]);

  // Enhanced navigation with validation
  const navigateWithValidation = useCallback((navigationCallback: () => void) => {
    if (checkNavigationAllowed()) {
      navigationCallback();
    }
  }, [checkNavigationAllowed]);

  // Get validation status for UI
  const getNavigationStatus = useCallback(() => {
    const summary = getValidationSummary();
    
    return {
      canProceed: stepIsValid,
      completionPercentage: summary?.completionPercentage || 0,
      missingFields: summary?.invalidFields || [],
      totalRequiredFields: summary?.totalRequiredFields || 0,
      completedFields: summary?.completedFields || 0
    };
  }, [stepIsValid, getValidationSummary]);

  // Effect to set up navigation interception
  useEffect(() => {
    // Find and enhance navigation buttons
    const nextButtons = document.querySelectorAll('button[data-testid="next-button"], button[type="submit"]');
    const continueButtons = document.querySelectorAll('button:contains("Next"), button:contains("Continue")');
    
    const allButtons = [...nextButtons, ...continueButtons];
    
    allButtons.forEach(button => {
      if (button instanceof HTMLButtonElement) {
        const originalHandler = button.onclick;
        
        button.onclick = (event) => {
          if (!interceptNavigation(event)) {
            return false;
          }
          
          if (originalHandler) {
            return originalHandler.call(button, event);
          }
          
          return true;
        };
      }
    });

    // Cleanup function
    return () => {
      allButtons.forEach(button => {
        if (button instanceof HTMLButtonElement) {
          button.onclick = null;
        }
      });
    };
  }, [interceptNavigation]);

  return {
    canProceed: stepIsValid,
    checkNavigationAllowed,
    navigateWithValidation,
    getNavigationStatus,
    validateCurrentStep
  };
}