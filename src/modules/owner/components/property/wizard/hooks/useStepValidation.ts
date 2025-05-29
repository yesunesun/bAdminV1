// src/modules/owner/components/property/wizard/hooks/useStepValidation.ts
// Version: 3.0.0 - SIMPLIFIED SAFE VERSION
// Last Modified: 29-05-2025 21:30 IST
// Purpose: Minimal validation hook that never throws errors

import { useState, useCallback, useMemo, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface UseStepValidationProps {
  form: UseFormReturn<FormData>;
  flowType: string;
  currentStepId: string;
}

interface ValidationSummary {
  isValid: boolean;
  completionPercentage: number;
  totalRequiredFields: number;
  completedFields: number;
  invalidFields: Array<{
    name: string;
    label: string;
    error: string;
  }>;
}

export function useStepValidation({
  form,
  flowType,
  currentStepId
}: UseStepValidationProps) {
  
  // Simple state - track validation results
  const [validationResults, setValidationResults] = useState({
    isValid: false,
    completionPercentage: 0,
    lastCheckedStep: ''
  });
  
  // Get required fields for current step (updated with all required fields)
  const getRequiredFieldsForStep = useCallback((stepId: string): string[] => {
    const stepFieldMap: Record<string, string[]> = {
      // Basic details steps - all required fields as shown in UI
      'res_rent_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms'],
      'res_sale_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms'],
      'res_flat_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms'],
      'res_pg_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms'],
      
      // Commercial basic details
      'com_rent_basic_details': ['propertyType', 'floor', 'totalFloors', 'propertyAge', 'builtUpArea'],
      'com_sale_basic_details': ['propertyType', 'floor', 'totalFloors', 'propertyAge', 'builtUpArea'],
      'com_cow_basic_details': ['propertyType', 'spaceType', 'capacity'],
      
      // Land basic details
      'land_sale_basic_details': ['propertyType', 'builtUpArea'],
      
      // Location steps - including locality as required
      'res_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
      'res_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
      'res_flat_location': ['address', 'city', 'state', 'pinCode', 'locality'],
      'res_pg_location': ['address', 'city', 'state', 'pinCode', 'locality'],
      'com_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
      'com_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
      'com_cow_location': ['address', 'city', 'state', 'pinCode', 'locality'],
      'land_sale_location': ['address', 'city', 'state', 'pinCode'],
      
      // Rental steps
      'res_rent_rental': ['rentAmount'],
      'com_rent_rental': ['rentAmount'],
      
      // Sale steps
      'res_sale_sale_details': ['expectedPrice'],
      'com_sale_sale_details': ['expectedPrice'],
      
      // Other steps have no strict requirements for now
      'default': []
    };
    
    return stepFieldMap[stepId] || stepFieldMap['default'];
  }, []);

  // Safe field checker that never throws errors
  const hasFieldValue = useCallback((fieldName: string): boolean => {
    if (!form || !currentStepId || !fieldName) {
      return false; // Changed: Default to invalid when we can't check properly
    }

    try {
      // Method 1: Check all form data and navigate safely (most reliable)
      try {
        const allData = form.getValues();
        console.log(`[hasFieldValue] Checking ${fieldName} in step ${currentStepId}`);
        console.log(`[hasFieldValue] All form data:`, allData);
        
        if (allData?.steps?.[currentStepId]?.[fieldName]) {
          const value = allData.steps[currentStepId][fieldName];
          console.log(`[hasFieldValue] Found step value for ${fieldName}:`, value);
          if (value !== undefined && value !== null && value !== '' && String(value).trim() !== '') {
            return true;
          }
        }
      } catch (e) {
        console.error(`[hasFieldValue] Error in method 1 for ${fieldName}:`, e);
      }

      // Method 2: Direct path check
      try {
        const value = form.getValues(`steps.${currentStepId}.${fieldName}`);
        console.log(`[hasFieldValue] Direct path value for ${fieldName}:`, value);
        if (value !== undefined && value !== null && value !== '' && String(value).trim() !== '') {
          return true;
        }
      } catch (e) {
        console.error(`[hasFieldValue] Error in method 2 for ${fieldName}:`, e);
      }

      // Method 3: Legacy field check
      try {
        const value = form.getValues(fieldName);
        console.log(`[hasFieldValue] Legacy value for ${fieldName}:`, value);
        if (value !== undefined && value !== null && value !== '' && String(value).trim() !== '') {
          return true;
        }
      } catch (e) {
        console.error(`[hasFieldValue] Error in method 3 for ${fieldName}:`, e);
      }

      console.log(`[hasFieldValue] No valid value found for ${fieldName}`);
      return false;
    } catch (error) {
      console.error('[useStepValidation] Error checking field value:', fieldName, error);
      return false; // Changed: Default to invalid on error for required fields
    }
  }, [form, currentStepId]);

  // Simple validation summary
  const getValidationSummary = useCallback((): ValidationSummary => {
    if (!currentStepId) {
      return {
        isValid: true,
        completionPercentage: 100,
        totalRequiredFields: 0,
        completedFields: 0,
        invalidFields: []
      };
    }

    try {
      const requiredFields = getRequiredFieldsForStep(currentStepId);
      const invalidFields: ValidationSummary['invalidFields'] = [];
      let completedFields = 0;

      // Check each required field safely
      for (const fieldName of requiredFields) {
        try {
          const hasValue = hasFieldValue(fieldName);
          if (hasValue) {
            completedFields++;
          } else {
            invalidFields.push({
              name: fieldName,
              label: getFieldLabel(fieldName),
              error: `${getFieldLabel(fieldName)} is required`
            });
          }
        } catch (error) {
          // If we can't check the field, assume it's valid
          completedFields++;
        }
      }

      const totalRequiredFields = requiredFields.length;
      const completionPercentage = totalRequiredFields > 0 
        ? Math.round((completedFields / totalRequiredFields) * 100)
        : 100;

      return {
        isValid: invalidFields.length === 0,
        completionPercentage,
        totalRequiredFields,
        completedFields,
        invalidFields
      };
    } catch (error) {
      console.warn('[useStepValidation] Error getting validation summary:', error);
      return {
        isValid: true,
        completionPercentage: 100,
        totalRequiredFields: 0,
        completedFields: 0,
        invalidFields: []
      };
    }
  }, [currentStepId, getRequiredFieldsForStep, hasFieldValue]);

  // Simple step validation
  const validateCurrentStep = useCallback(() => {
    try {
      const summary = getValidationSummary();
      return {
        isValid: summary.isValid,
        errors: summary.invalidFields.reduce((acc, field) => {
          acc[field.name] = field.error;
          return acc;
        }, {} as Record<string, string>)
      };
    } catch (error) {
      console.warn('[useStepValidation] Error validating step:', error);
      return { isValid: true, errors: {} };
    }
  }, [getValidationSummary]);

  // Check if can proceed to next step
  const canProceedToNextStep = useCallback(() => {
    try {
      const validation = validateCurrentStep();
      return validation.isValid;
    } catch (error) {
      console.warn('[useStepValidation] Error checking if can proceed:', error);
      return true; // Default to allowing proceed
    }
  }, [validateCurrentStep]);

  // Dummy functions for compatibility with existing components
  const validateField = useCallback(() => {
    return { isValid: true, error: null, isTouched: false };
  }, []);

  const getFieldValidation = useCallback((fieldName: string) => {
    try {
      const hasValue = hasFieldValue(fieldName);
      return {
        isValid: hasValue,
        error: hasValue ? null : `${getFieldLabel(fieldName)} is required`,
        isTouched: false
      };
    } catch (error) {
      return { isValid: true, error: null, isTouched: false };
    }
  }, [hasFieldValue]);

  const shouldShowFieldError = useCallback(() => {
    return false; // Never show field errors to prevent UI issues
  }, []);

  const getFieldConfig = useCallback(() => {
    return { required: false };
  }, []);

  const markFieldAsTouched = useCallback(() => {
    // No-op
  }, []);

  const blockNavigation = useCallback(() => {
    return false;
  }, []);

  // Memoized values using reactive state
  const isValid = useMemo(() => {
    return validationResults.isValid;
  }, [validationResults.isValid]);

  const completionPercentage = useMemo(() => {
    return validationResults.completionPercentage;
  }, [validationResults.completionPercentage]);

  const requiredFields = useMemo(() => {
    try {
      return getRequiredFieldsForStep(currentStepId);
    } catch (error) {
      return [];
    }
  }, [getRequiredFieldsForStep, currentStepId]);

  // Watch form changes and update validation (moved after all function definitions)
  useEffect(() => {
    if (!form || !currentStepId) return;

    const subscription = form.watch(() => {
      // Debounce validation updates
      const timeoutId = setTimeout(() => {
        try {
          const summary = getValidationSummary();
          setValidationResults({
            isValid: summary.isValid,
            completionPercentage: summary.completionPercentage,
            lastCheckedStep: currentStepId
          });
          console.log(`[useStepValidation] Updated validation for ${currentStepId}:`, summary);
        } catch (error) {
          console.error('[useStepValidation] Error updating validation:', error);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    });

    // Initial validation
    try {
      const summary = getValidationSummary();
      setValidationResults({
        isValid: summary.isValid,
        completionPercentage: summary.completionPercentage,
        lastCheckedStep: currentStepId
      });
    } catch (error) {
      console.error('[useStepValidation] Error in initial validation:', error);
    }

    return () => subscription.unsubscribe();
  }, [form, currentStepId, getValidationSummary]);

  return {
    isValid,
    canProceedToNextStep,
    completionPercentage,
    getValidationSummary,
    blockNavigation,
    validateCurrentStep,
    requiredFields,
    
    // Compatibility functions
    validateField,
    getFieldValidation,
    getFieldConfig,
    shouldShowFieldError,
    markFieldAsTouched
  };
}

// Helper function to get user-friendly field labels
function getFieldLabel(fieldName: string): string {
  const labels: Record<string, string> = {
    // Property Details fields
    propertyType: 'Property Type',
    bhkType: 'BHK Configuration',
    floor: 'Floor',
    totalFloors: 'Total Floors',
    propertyAge: 'Property Age',
    facing: 'Facing Direction',
    builtUpArea: 'Built-up Area',
    bathrooms: 'Bathrooms',
    
    // Location fields
    address: 'Complete Address',
    city: 'City',
    state: 'State',
    pinCode: 'PIN Code',
    locality: 'Locality',
    
    // Rental/Sale fields
    rentAmount: 'Rent Amount',
    expectedPrice: 'Expected Price',
    
    // Commercial fields
    spaceType: 'Space Type',
    capacity: 'Capacity'
  };
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Export default for backward compatibility
export default useStepValidation;