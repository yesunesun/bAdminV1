// src/modules/owner/components/property/wizard/hooks/useStepForm.ts
// Version: 2.0.0
// Last Modified: 20-05-2025 17:30 IST
// Purpose: Fix field duplication - store values only in step structure, not at root level

import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

/**
 * Hook to handle form field registration within step objects
 * @param form The react-hook-form useForm object
 * @param stepId The ID of the current step
 * @returns Functions to handle step-specific form registration and error access
 */
export function useStepForm(form: UseFormReturn<FormData>, stepId: string) {
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  
  /**
   * Register a field with the proper step path
   * @param fieldName The field name to register
   * @returns The react-hook-form register object with path prepended
   */
  const registerField = useCallback((fieldName: string) => {
    const path = `steps.${stepId}.${fieldName}`;
    return register(path);
  }, [register, stepId]);
  
  /**
   * Get the error for a field within the step
   * @param fieldName The field name to check
   * @returns The error object for the field, if any
   */
  const getFieldError = useCallback((fieldName: string) => {
    // Check both step errors and legacy root errors
    return errors.steps?.[stepId]?.[fieldName] || errors[fieldName];
  }, [errors, stepId]);
  
  /**
   * Set the value of a field within the step
   * @param fieldName The field name to set
   * @param value The value to set
   */
  const setFieldValue = useCallback((fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    
    // Ensure the steps structure exists
    const steps = getValues('steps') || {};
    if (!steps[stepId]) {
      form.setValue('steps', {
        ...steps,
        [stepId]: {}
      }, { shouldValidate: false });
    }
    
    // Set the value in the step structure only
    setValue(path, value, { shouldValidate: true });
    
    // NO LONGER setting at root level to avoid duplication
  }, [setValue, getValues, stepId, form]);
  
  /**
   * Get the value of a field within the step
   * @param fieldName The field name to get
   * @returns The value of the field
   */
  const getFieldValue = useCallback((fieldName: string) => {
    // First check in the step object
    const stepValue = getValues(`steps.${stepId}.${fieldName}`);
    
    // If not found, check at root level (for backward compatibility)
    if (stepValue === undefined) {
      return getValues(fieldName);
    }
    
    return stepValue;
  }, [getValues, stepId]);
  
  /**
   * Watch a field value from the step
   * @param fieldName The field name to watch
   * @returns The current value of the field
   */
  const watchField = useCallback((fieldName: string) => {
    return watch(`steps.${stepId}.${fieldName}`, watch(fieldName));
  }, [watch, stepId]);
  
  /**
   * Get the full path to a field within the step
   * @param fieldName The field name
   * @returns The full path including the step
   */
  const getFieldPath = useCallback((fieldName: string) => {
    return `steps.${stepId}.${fieldName}`;
  }, [stepId]);
  
  /**
   * Get the HTML ID for a field
   * @param fieldName The field name
   * @returns The HTML ID for the field
   */
  const getFieldId = useCallback((fieldName: string) => {
    return `steps_${stepId}_${fieldName}`;
  }, [stepId]);
  
  /**
   * Migration function to move values from root to step structure
   * @param fieldNames Array of field names to migrate
   */
  const migrateRootFields = useCallback((fieldNames: string[]) => {
    fieldNames.forEach(field => {
      const rootValue = getValues(field);
      const stepValue = getValues(`steps.${stepId}.${field}`);
      
      // If there's a value at the root but not in the step, migrate it
      if (rootValue !== undefined && stepValue === undefined) {
        console.log(`Migrating ${field} from root to step:`, rootValue);
        const path = `steps.${stepId}.${field}`;
        setValue(path, rootValue, { shouldValidate: false });
      }
    });
  }, [getValues, setValue, stepId]);
  
  return {
    registerField,
    getFieldError,
    setFieldValue,
    getFieldValue,
    watchField,
    getFieldPath,
    getFieldId,
    migrateRootFields
  };
}