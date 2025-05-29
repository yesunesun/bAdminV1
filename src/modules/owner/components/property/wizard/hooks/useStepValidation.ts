// src/modules/owner/components/property/wizard/hooks/useStepValidation.ts
// Version: 4.1.0
// Last Modified: 30-05-2025 16:40 IST
// Purpose: Fixed validation for sale details step - added all required fields

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
  
  // Get required fields for current step - FIXED: Added sale details fields
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
      
      // Rental steps - includes ALL required fields as shown in UI
      'res_rent_rental': ['rentAmount', 'securityDeposit', 'availableFrom', 'furnishingStatus', 'preferredTenants'],
      'com_rent_rental': ['rentAmount', 'securityDeposit', 'availableFrom', 'furnishingStatus'],
      
      // FIXED: Sale details steps - added ALL required fields as shown in UI
      'res_sale_sale_details': ['expectedPrice', 'maintenanceCost', 'kitchenType', 'availableFrom', 'furnishing', 'parking'],
      'com_sale_sale_details': ['expectedPrice', 'maintenanceCost', 'kitchenType', 'availableFrom', 'furnishing', 'parking'],
      
      // Features steps - includes ALL required fields as shown in UI
      'res_rent_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
      'res_sale_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
      'res_flat_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
      'res_pg_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
      'com_rent_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
      'com_sale_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
      'com_cow_features': ['propertyShowOption', 'propertyCondition', 'amenities'],
      'land_sale_land_features': ['propertyShowOption', 'propertyCondition'],
      
      // Flatmate details
      'res_flat_flatmate_details': ['preferredGender', 'rentAmount'],
      
      // PG details  
      'res_pg_pg_details': ['monthlyRent', 'securityDeposit', 'mealOption'],
      
      // Coworking details
      'com_cow_coworking_details': ['spaceType', 'capacity', 'rentAmount'],
      
      // Land features
      'land_sale_land_features': ['expectedPrice'],
      
      // Default fallback
      'default': []
    };
    
    return stepFieldMap[stepId] || stepFieldMap['default'];
  }, []);

  // Enhanced field checker that properly validates different field types
  const hasFieldValue = useCallback((fieldName: string): boolean => {
    if (!form || !currentStepId || !fieldName) {
      return false;
    }

    try {
      console.log(`[hasFieldValue] Checking ${fieldName} in step ${currentStepId}`);
      
      // Method 1: Check step-specific data first
      try {
        const stepData = form.getValues(`steps.${currentStepId}`);
        if (stepData && stepData[fieldName] !== undefined) {
          const value = stepData[fieldName];
          console.log(`[hasFieldValue] Step value for ${fieldName}:`, value);
          
          // Enhanced validation for different field types
          if (Array.isArray(value)) {
            // For arrays (like preferredTenants), check if it has at least one item
            return value.length > 0;
          } else if (typeof value === 'boolean') {
            // For booleans, consider them valid regardless of true/false
            return true;
          } else if (typeof value === 'string') {
            // For strings, check if not empty after trimming
            return value.trim() !== '';
          } else if (typeof value === 'number') {
            // For numbers, check if not NaN and greater than 0 (except certain fields which can be 0)
            if (fieldName === 'bathrooms' || fieldName === 'balconies' || fieldName === 'maintenanceCost') {
              return !isNaN(value) && value >= 0;
            }
            return !isNaN(value) && value > 0;
          } else if (value !== null && value !== undefined) {
            // For other types, check if not null/undefined
            return true;
          }
        }
      } catch (e) {
        console.error(`[hasFieldValue] Error checking step data for ${fieldName}:`, e);
      }

      // Method 2: Check root level data as fallback
      try {
        const rootValue = form.getValues(fieldName);
        if (rootValue !== undefined && rootValue !== null) {
          console.log(`[hasFieldValue] Root value for ${fieldName}:`, rootValue);
          
          // Same enhanced validation for root values
          if (Array.isArray(rootValue)) {
            return rootValue.length > 0;
          } else if (typeof rootValue === 'boolean') {
            return true;
          } else if (typeof rootValue === 'string') {
            return rootValue.trim() !== '';
          } else if (typeof rootValue === 'number') {
            if (fieldName === 'bathrooms' || fieldName === 'balconies' || fieldName === 'maintenanceCost') {
              return !isNaN(rootValue) && rootValue >= 0;
            }
            return !isNaN(rootValue) && rootValue > 0;
          } else {
            return true;
          }
        }
      } catch (e) {
        console.error(`[hasFieldValue] Error checking root data for ${fieldName}:`, e);
      }

      console.log(`[hasFieldValue] No valid value found for ${fieldName}`);
      return false;
    } catch (error) {
      console.error('[useStepValidation] Error checking field value:', fieldName, error);
      return false;
    }
  }, [form, currentStepId]);

  // Enhanced validation summary
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
      console.log(`[getValidationSummary] Required fields for ${currentStepId}:`, requiredFields);
      
      const invalidFields: ValidationSummary['invalidFields'] = [];
      let completedFields = 0;

      // Check each required field
      for (const fieldName of requiredFields) {
        try {
          const hasValue = hasFieldValue(fieldName);
          console.log(`[getValidationSummary] Field ${fieldName} has value:`, hasValue);
          
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
          console.error(`[getValidationSummary] Error validating field ${fieldName}:`, error);
          // On error, assume field is invalid for required fields
          invalidFields.push({
            name: fieldName,
            label: getFieldLabel(fieldName),
            error: `${getFieldLabel(fieldName)} validation error`
          });
        }
      }

      const totalRequiredFields = requiredFields.length;
      const completionPercentage = totalRequiredFields > 0 
        ? Math.round((completedFields / totalRequiredFields) * 100)
        : 100;

      console.log(`[getValidationSummary] Step ${currentStepId} completion: ${completedFields}/${totalRequiredFields} (${completionPercentage}%)`);
      console.log(`[getValidationSummary] Invalid fields:`, invalidFields.map(f => f.name));

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
        isValid: false,
        completionPercentage: 0,
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
      return { isValid: false, errors: {} };
    }
  }, [getValidationSummary]);

  // Check if can proceed to next step
  const canProceedToNextStep = useCallback(() => {
    try {
      const validation = validateCurrentStep();
      return validation.isValid;
    } catch (error) {
      console.warn('[useStepValidation] Error checking if can proceed:', error);
      return false; // Be strict about navigation
    }
  }, [validateCurrentStep]);

  // Enhanced field validation for individual fields
  const validateField = useCallback((fieldName: string) => {
    try {
      const hasValue = hasFieldValue(fieldName);
      return {
        isValid: hasValue,
        error: hasValue ? null : `${getFieldLabel(fieldName)} is required`,
        isTouched: true
      };
    } catch (error) {
      return { isValid: false, error: 'Validation error', isTouched: false };
    }
  }, [hasFieldValue]);

  const getFieldValidation = useCallback((fieldName: string) => {
    try {
      const hasValue = hasFieldValue(fieldName);
      return {
        isValid: hasValue,
        error: hasValue ? null : `${getFieldLabel(fieldName)} is required`,
        isTouched: false
      };
    } catch (error) {
      return { isValid: false, error: null, isTouched: false };
    }
  }, [hasFieldValue]);

  const shouldShowFieldError = useCallback((fieldName: string) => {
    // Show errors for required fields that are empty
    const requiredFields = getRequiredFieldsForStep(currentStepId);
    if (!requiredFields.includes(fieldName)) {
      return false;
    }
    return !hasFieldValue(fieldName);
  }, [currentStepId, getRequiredFieldsForStep, hasFieldValue]);

  const getFieldConfig = useCallback((fieldName: string) => {
    const requiredFields = getRequiredFieldsForStep(currentStepId);
    return { 
      required: requiredFields.includes(fieldName)
    };
  }, [currentStepId, getRequiredFieldsForStep]);

  const markFieldAsTouched = useCallback(() => {
    // No-op for now
  }, []);

  const blockNavigation = useCallback(() => {
    return !canProceedToNextStep();
  }, [canProceedToNextStep]);

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

  // Watch form changes and update validation
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
    
    // Field-level validation functions
    validateField,
    getFieldValidation,
    getFieldConfig,
    shouldShowFieldError,
    markFieldAsTouched
  };
}

// Helper function to get user-friendly field labels - FIXED: Added sale details labels
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
    rentAmount: 'Monthly Rent Amount',
    securityDeposit: 'Security Deposit',
    availableFrom: 'Available From',
    furnishingStatus: 'Furnishing Status',
    preferredTenants: 'Preferred Tenants',
    
    // FIXED: Added sale details field labels
    expectedPrice: 'Expected Price',
    maintenanceCost: 'Maintenance Cost',
    kitchenType: 'Kitchen Type',
    furnishing: 'Furnishing',
    parking: 'Parking',
    
    // Features fields
    propertyShowOption: 'Who Shows Property',
    propertyCondition: 'Property Condition',
    amenities: 'Amenities',
    
    // Commercial fields
    spaceType: 'Space Type',
    capacity: 'Capacity',
    
    // PG fields
    monthlyRent: 'Monthly Rent',
    mealOption: 'Meal Option',
    
    // Flatmate fields
    preferredGender: 'Preferred Gender'
  };
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Export default for backward compatibility
export default useStepValidation;