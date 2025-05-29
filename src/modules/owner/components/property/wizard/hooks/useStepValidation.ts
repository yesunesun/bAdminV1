// src/modules/owner/components/property/wizard/hooks/useStepValidation.ts
// Version: 1.0.0
// Last Modified: 29-05-2025 16:30 IST
// Purpose: Enhanced step validation hook with real-time validation and error management

import { useState, useCallback, useEffect, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { 
  getStepValidationConfig, 
  validateStep, 
  validateField,
  isStepValid,
  StepValidationConfig,
  FieldConfig
} from '../validation/fieldValidationConfig';
import { FLOW_STEPS } from '../constants/flows';

interface UseStepValidationProps {
  form: UseFormReturn<FormData>;
  flowType: string;
  currentStepId: string;
}

interface FieldValidationState {
  [fieldName: string]: {
    error: string | null;
    isValid: boolean;
    isTouched: boolean;
  };
}

interface StepValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  fieldValidation: FieldValidationState;
  touchedFields: Set<string>;
  requiredFields: string[];
  completionPercentage: number;
}

export function useStepValidation({ form, flowType, currentStepId }: UseStepValidationProps) {
  // Get step validation configuration
  const stepConfig = useMemo(() => {
    return getStepValidationConfig(flowType, currentStepId);
  }, [flowType, currentStepId]);

  // Initialize validation state
  const [validationState, setValidationState] = useState<StepValidationState>(() => ({
    isValid: false,
    errors: {},
    fieldValidation: {},
    touchedFields: new Set(),
    requiredFields: stepConfig?.fields.filter(f => f.validation.required).map(f => f.name) || [],
    completionPercentage: 0
  }));

  // Real-time validation function
  const validateCurrentStep = useCallback(() => {
    if (!stepConfig || !form) return false;

    const formData = form.getValues();
    const stepValidation = validateStep(stepConfig, formData);
    
    // Calculate field-level validation
    const fieldValidation: FieldValidationState = {};
    for (const field of stepConfig.fields) {
      const fieldValue = form.getValues(field.name as any);
      const error = validateField(field, fieldValue, formData);
      
      fieldValidation[field.name] = {
        error,
        isValid: !error,
        isTouched: validationState.touchedFields.has(field.name)
      };
    }

    // Calculate completion percentage
    const totalFields = stepConfig.fields.filter(f => f.validation.required).length;
    const completedFields = stepConfig.fields.filter(f => {
      if (!f.validation.required) return true;
      const value = form.getValues(f.name as any);
      return value && (Array.isArray(value) ? value.length > 0 : true);
    }).length;
    
    const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;

    // Update validation state
    setValidationState(prev => ({
      ...prev,
      isValid: stepValidation.isValid,
      errors: stepValidation.errors,
      fieldValidation,
      completionPercentage
    }));

    return stepValidation.isValid;
  }, [stepConfig, form, validationState.touchedFields]);

  // Validate specific field
  const validateFieldByName = useCallback((fieldName: string) => {
    if (!stepConfig || !form) return null;

    const field = stepConfig.fields.find(f => f.name === fieldName);
    if (!field) return null;

    const fieldValue = form.getValues(fieldName as any);
    const formData = form.getValues();
    const error = validateField(field, fieldValue, formData);

    // Update field validation state
    setValidationState(prev => ({
      ...prev,
      fieldValidation: {
        ...prev.fieldValidation,
        [fieldName]: {
          error,
          isValid: !error,
          isTouched: true
        }
      },
      touchedFields: new Set([...prev.touchedFields, fieldName])
    }));

    return error;
  }, [stepConfig, form]);

  // Mark field as touched
  const markFieldAsTouched = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, fieldName])
    }));
  }, []);

  // Get field validation status
  const getFieldValidation = useCallback((fieldName: string) => {
    return validationState.fieldValidation[fieldName] || {
      error: null,
      isValid: true,
      isTouched: false
    };
  }, [validationState.fieldValidation]);

  // Check if field should show error
  const shouldShowFieldError = useCallback((fieldName: string) => {
    const fieldValidation = getFieldValidation(fieldName);
    return fieldValidation.isTouched && fieldValidation.error;
  }, [getFieldValidation]);

  // Get field configuration
  const getFieldConfig = useCallback((fieldName: string): FieldConfig | null => {
    if (!stepConfig) return null;
    return stepConfig.fields.find(f => f.name === fieldName) || null;
  }, [stepConfig]);

  // Check if navigation should be blocked
  const canProceedToNextStep = useCallback(() => {
    return validateCurrentStep();
  }, [validateCurrentStep]);

  // Get validation summary for step
  const getValidationSummary = useCallback(() => {
    if (!stepConfig) return null;

    const requiredFields = stepConfig.fields.filter(f => f.validation.required);
    const invalidFields = requiredFields.filter(f => {
      const validation = getFieldValidation(f.name);
      return !validation.isValid;
    });

    return {
      totalRequiredFields: requiredFields.length,
      completedFields: requiredFields.length - invalidFields.length,
      invalidFields: invalidFields.map(f => ({ name: f.name, label: f.label })),
      completionPercentage: validationState.completionPercentage
    };
  }, [stepConfig, getFieldValidation, validationState.completionPercentage]);

  // Clear validation errors
  const clearValidationErrors = useCallback(() => {
    setValidationState(prev => ({
      ...prev,
      errors: {},
      fieldValidation: {},
      touchedFields: new Set()
    }));
  }, []);

  // Effect to re-validate when form data changes
  useEffect(() => {
    if (!form || !stepConfig) return;

    const subscription = form.watch(() => {
      // Debounce validation to avoid excessive re-renders
      const timeoutId = setTimeout(validateCurrentStep, 300);
      return () => clearTimeout(timeoutId);
    });

    return subscription.unsubscribe;
  }, [form, stepConfig, validateCurrentStep]);

  // Effect to validate on step change
  useEffect(() => {
    if (stepConfig) {
      validateCurrentStep();
    }
  }, [currentStepId, stepConfig, validateCurrentStep]);

  // Check if all steps in flow are valid
  const validateAllSteps = useCallback(() => {
    const flowSteps = FLOW_STEPS[flowType] || [];
    const formData = form.getValues();
    
    const stepValidations = flowSteps.map(stepId => ({
      stepId,
      isValid: isStepValid(flowType, stepId, formData)
    }));

    return {
      allValid: stepValidations.every(s => s.isValid),
      stepValidations
    };
  }, [flowType, form]);

  return {
    // Validation state
    isValid: validationState.isValid,
    errors: validationState.errors,
    completionPercentage: validationState.completionPercentage,
    
    // Field-level validation
    validateField: validateFieldByName,
    getFieldValidation,
    getFieldConfig,
    shouldShowFieldError,
    markFieldAsTouched,
    
    // Step-level validation
    validateCurrentStep,
    canProceedToNextStep,
    getValidationSummary,
    validateAllSteps,
    
    // Utility functions
    clearValidationErrors,
    
    // Step configuration
    stepConfig,
    requiredFields: validationState.requiredFields
  };
}