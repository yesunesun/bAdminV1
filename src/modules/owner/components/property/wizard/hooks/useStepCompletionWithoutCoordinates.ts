// src/modules/owner/components/property/wizard/hooks/useStepCompletionWithoutCoordinates.ts
// Version: 1.0.0
// Last Modified: 16-07-2025 15:30 IST
// Purpose: Step completion calculation excluding coordinate fields (latitude/longitude)

import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface UseStepCompletionProps {
  requiredFields: string[];
  fieldLabels: Record<string, string>;
  form: UseFormReturn<FormData>;
  stepId: string;
  values: Record<string, any>;
}

interface StepCompletionResult {
  completionPercentage: number;
  unfilledFields: string[];
  isStepValid: boolean;
  totalRequiredFields: number;
  completedFields: number;
}

export function useStepCompletionWithoutCoordinates({
  requiredFields,
  fieldLabels,
  form,
  stepId,
  values
}: UseStepCompletionProps): StepCompletionResult {
  
  return useMemo(() => {
    // Filter out coordinate fields from required fields for UI display
    const visibleRequiredFields = requiredFields.filter(field => 
      field !== 'latitude' && field !== 'longitude'
    );
    
    const unfilledFields: string[] = [];
    let completedFields = 0;
    
    for (const fieldName of visibleRequiredFields) {
      const hasValue = hasFieldValue(fieldName, values, form, stepId);
      
      if (hasValue) {
        completedFields++;
      } else {
        const label = fieldLabels[fieldName] || fieldName;
        unfilledFields.push(label);
      }
    }
    
    const totalRequiredFields = visibleRequiredFields.length;
    const completionPercentage = totalRequiredFields > 0 
      ? Math.round((completedFields / totalRequiredFields) * 100)
      : 100;
    
    // For validation, we still need to check ALL fields including coordinates
    const allFieldsValid = requiredFields.every(fieldName => 
      hasFieldValue(fieldName, values, form, stepId)
    );
    
    return {
      completionPercentage,
      unfilledFields,
      isStepValid: allFieldsValid, // This includes coordinates for validation
      totalRequiredFields,
      completedFields
    };
  }, [requiredFields, fieldLabels, form, stepId, values]);
}

// Helper function to check if a field has a value
function hasFieldValue(
  fieldName: string, 
  values: Record<string, any>, 
  form: UseFormReturn<FormData>, 
  stepId: string
): boolean {
  try {
    // Check component state first
    if (values && values[fieldName] !== undefined) {
      const value = values[fieldName];
      
      if (Array.isArray(value)) {
        return value.length > 0;
      } else if (typeof value === 'boolean') {
        return true;
      } else if (typeof value === 'string') {
        return value.trim() !== '';
      } else if (typeof value === 'number') {
        if (fieldName === 'bathrooms' || fieldName === 'balconies' || fieldName === 'maintenanceCharges' || 
            fieldName === 'maintenanceCost' || fieldName === 'expectedDeposit' || fieldName === 'floor' || 
            fieldName === 'roomCapacity' || fieldName === 'totalCapacity' || fieldName === 'availableCapacity' ||
            fieldName === 'officeSize' || fieldName === 'seatingCapacity' || fieldName === 'basePrice' ||
            fieldName === 'securityDeposit') {
          return !isNaN(value) && value >= 0;
        }
        return !isNaN(value) && value > 0;
      } else if (value !== null && value !== undefined) {
        return true;
      }
    }

    // Check step data in form
    try {
      const stepData = form.getValues(`steps.${stepId}`);
      if (stepData && stepData[fieldName] !== undefined) {
        const value = stepData[fieldName];
        
        if (Array.isArray(value)) {
          return value.length > 0;
        } else if (typeof value === 'boolean') {
          return true;
        } else if (typeof value === 'string') {
          return value.trim() !== '';
        } else if (typeof value === 'number') {
          if (fieldName === 'bathrooms' || fieldName === 'balconies' || fieldName === 'maintenanceCharges' || 
              fieldName === 'maintenanceCost' || fieldName === 'expectedDeposit' || fieldName === 'floor' || 
              fieldName === 'roomCapacity' || fieldName === 'totalCapacity' || fieldName === 'availableCapacity' ||
              fieldName === 'officeSize' || fieldName === 'seatingCapacity' || fieldName === 'basePrice' ||
              fieldName === 'securityDeposit') {
            return !isNaN(value) && value >= 0;
          }
          return !isNaN(value) && value > 0;
        } else if (value !== null && value !== undefined) {
          return true;
        }
      }
    } catch (e) {
      console.error(`Error checking step data for ${fieldName}:`, e);
    }

    // Check root level data as fallback
    try {
      const rootValue = form.getValues(fieldName);
      if (rootValue !== undefined && rootValue !== null) {
        if (Array.isArray(rootValue)) {
          return rootValue.length > 0;
        } else if (typeof rootValue === 'boolean') {
          return true;
        } else if (typeof rootValue === 'string') {
          return rootValue.trim() !== '';
        } else if (typeof rootValue === 'number') {
          if (fieldName === 'bathrooms' || fieldName === 'balconies' || fieldName === 'maintenanceCharges' || 
              fieldName === 'maintenanceCost' || fieldName === 'expectedDeposit' || fieldName === 'floor' || 
              fieldName === 'roomCapacity' || fieldName === 'totalCapacity' || fieldName === 'availableCapacity' ||
              fieldName === 'officeSize' || fieldName === 'seatingCapacity' || fieldName === 'basePrice' ||
              fieldName === 'securityDeposit') {
            return !isNaN(rootValue) && rootValue >= 0;
          }
          return !isNaN(rootValue) && rootValue > 0;
        } else {
          return true;
        }
      }
    } catch (e) {
      console.error(`Error checking root data for ${fieldName}:`, e);
    }

    return false;
  } catch (error) {
    console.error('Error checking field value:', fieldName, error);
    return false;
  }
}

export default useStepCompletionWithoutCoordinates;