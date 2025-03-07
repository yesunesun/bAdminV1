// src/modules/owner/components/property/wizard/hooks/usePropertyFormValidation.ts
// Version: 1.0.0
// Last Modified: 08-03-2025 16:30 IST
// Purpose: Handle form validation logic

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

export function usePropertyFormValidation(form: UseFormReturn<FormData>) {
  const validateCurrentStep = (currentStep: number = 1) => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for validation');
        return false;
      }
      
      if (currentStep === 1) {
        return !!form.getValues('propertyType') && !!form.getValues('bhkType');
      }
      if (currentStep === 2) {
        return !!form.getValues('locality');
      }
      if (currentStep === 3) {
        // Different validation based on listing type
        const listingType = form.getValues('listingType')?.toLowerCase();
        const isSaleValidation = listingType === 'sale' || listingType === 'sell';
        
        if (isSaleValidation) {
          // Validate sale fields
          const expectedPrice = form.getValues('expectedPrice');
          const maintenanceCost = form.getValues('maintenanceCost');
          
          console.log('Validating sale fields:', { 
            expectedPrice, 
            maintenanceCost,
            result: !!expectedPrice && !!maintenanceCost
          });
          
          return !!expectedPrice && !!maintenanceCost;
        } else {
          // Validate rental fields
          const rentAmount = form.getValues('rentAmount');
          
          console.log('Validating rental fields:', { 
            rentAmount,
            result: !!rentAmount
          });
          
          return !!rentAmount;
        }
      }
      return true;
    } catch (err) {
      console.error('Error validating current step:', err);
      return false;
    }
  };

  return {
    validateCurrentStep
  };
}