// src/modules/owner/components/property/wizard/sections/RoomDetails.tsx
// Version: 4.0.0
// Last Modified: 31-05-2025 12:15 IST
// Purpose: Added mandatory field asterisk indicators for all required fields

import React, { useEffect, useCallback } from 'react';
import { FormData, FormSectionProps } from '../types';
import { ROOM_TYPES, BATHROOM_TYPES, MEAL_OPTIONS, PG_AMENITIES_LIST } from '../constants/pgDetails';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Input 
} from '@/components/ui/input';
import { 
  Checkbox 
} from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { FLOW_TYPES } from '../constants/flows';
// ✅ ADDED: Import validation hook
import { useStepValidation } from '../hooks/useStepValidation';

const RoomDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  stepId // Allow stepId to be passed in
}) => {
  const isEditMode = mode === 'edit';
  
  // Get form methods
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  
  // Determine the correct step ID based on the flow type
  const flowType = getValues('flow.flowType');
  const isPGFlow = flowType === FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
  
  // Default to pg step id if we detect PG flow, otherwise use provided stepId or fallback
  const actualStepId = isPGFlow ? 'res_pg_basic_details' : (stepId || 'res_rent_basic_details');
  const effectiveStepId = actualStepId;
  
  console.log(`Room Details using step ID: ${actualStepId} for flow type: ${flowType}`);
  
  // ✅ ADDED: Initialize validation system
  const {
    validateField,
    getFieldValidation,
    shouldShowFieldError,
    markFieldAsTouched,
    isValid: stepIsValid,
    completionPercentage,
    requiredFields
  } = useStepValidation({
    form,
    flowType: flowType || 'residential_pghostel',
    currentStepId: effectiveStepId || 'res_pg_basic_details'
  });
  
  // Create path helper to ensure we register fields in the correct step
  const getFieldPath = (field: string) => `steps.${actualStepId}.${field}`;
  
  // ✅ ADDED: Enhanced field update with validation
  const updateFormAndState = useCallback((field: string, value: any) => {
    // Set the field value
    setValue(getFieldPath(field), value, { shouldValidate: true });
    
    // ✅ NEW: Mark field as touched and validate
    markFieldAsTouched(field);
    validateField(field);
  }, [setValue, markFieldAsTouched, validateField, actualStepId]);
  
  // Direct register for numeric fields to ensure they work properly
  const registerNumericField = (field: string, options = {}) => {
    return {
      ...register(getFieldPath(field), {
        valueAsNumber: true,
        ...options
      }),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? null : Number(e.target.value);
        updateFormAndState(field, value);
      }
    };
  };
  
  // Helper to get values with the correct path
  const getValue = (field: string) => {
    // First try to get from the step
    const stepValue = getValues(getFieldPath(field));
    
    // If not found in the step, try root level for backward compatibility during migration
    if (stepValue === undefined) {
      return getValues(field);
    }
    
    return stepValue;
  };
  
  // Helper to set values ONLY in the correct step path (no more dual registration)
  const setStepValue = (field: string, value: any, options?: any) => {
    // Only set in the proper step location
    updateFormAndState(field, value);
  };

  // Get array values (for checkboxes)
  const getArrayValue = (field: string): string[] => {
    const value = getValue(field);
    return Array.isArray(value) ? value : [];
  };

  // Toggle array value helper (for checkboxes)
  const toggleArrayValue = (field: string, value: string) => {
    const currentValues = getArrayValue(field);
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    updateFormAndState(field, newValues);
  };

  // When component mounts, migrate any root level fields to step location ONCE
  useEffect(() => {
    // Check if any of the fields are at root level but should be in step
    const fieldsToCheck = [
      'roomType', 'roomCapacity', 'expectedRent', 'expectedDeposit', 
      'bathroomType', 'roomSize', 'mealOption', 'roomFeatures'
    ];
    
    fieldsToCheck.forEach(field => {
      const rootValue = getValues(field);
      const stepValue = getValues(getFieldPath(field));
      
      // Only migrate if root value exists and step doesn't have the value
      if (rootValue !== undefined && rootValue !== null && rootValue !== '' && 
          (stepValue === undefined || stepValue === null || stepValue === '')) {
        console.log(`Migrating field ${field} from root to step ${actualStepId}`, rootValue);
        setValue(getFieldPath(field), rootValue);
        
        // Clear the root level value to prevent duplication
        setValue(field, undefined);
      }
    });
    
    // Log current form state for debugging
    console.log("Current form state:", getValues());
  }, [actualStepId]);

  // Form fields being watched for live updates
  const watchedRent = watch(getFieldPath('expectedRent'));
  const watchedDeposit = watch(getFieldPath('expectedDeposit'));
  const watchedRoomSize = watch(getFieldPath('roomSize'));

  console.log("Watched values:", {
    expectedRent: watchedRent,
    expectedDeposit: watchedDeposit,
    roomSize: watchedRoomSize
  });

  return (
    <FormSection
      title="Room Details"
      description="Provide details about your PG/Hostel rooms"
    >
      {/* ✅ ADDED: Progress indicator (like LocationDetails and SaleDetails) */}
      {requiredFields.length > 0 && (
        <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Step Completion: {completionPercentage}%
            </span>
            <span className="text-xs text-blue-700 dark:text-blue-300">
              {stepIsValid ? '✓ Ready to proceed' : 'Please complete required fields'}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Room Type - MANDATORY */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("roomType")}>Room Type *</RequiredLabel>
          <Select
            value={getValue('roomType') || ''}
            onValueChange={(value) => updateFormAndState('roomType', value)}
          >
            <SelectTrigger 
              id={getFieldPath("roomType")}
              className={cn(
                "w-full",
                errors.steps?.[actualStepId]?.roomType && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Room Type" />
            </SelectTrigger>
            <SelectContent>
              {ROOM_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* ✅ ADDED: Error messages below required fields */}
          {shouldShowFieldError('roomType') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('roomType').error}
            </p>
          )}
          {errors.steps?.[actualStepId]?.roomType && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.roomType?.message as string}
            </p>
          )}
        </div>

        {/* Total Capacity - MANDATORY */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("roomCapacity")}>Total Capacity (per room) *</RequiredLabel>
          <Input
            id={getFieldPath("roomCapacity")}
            type="number"
            defaultValue={getValue('roomCapacity') || ''}
            {...registerNumericField('roomCapacity', { 
              min: { value: 1, message: "Capacity must be at least 1" } 
            })}
            placeholder="How many people per room?"
            className={cn(
              errors.steps?.[actualStepId]?.roomCapacity && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {/* ✅ ADDED: Error messages below required fields */}
          {shouldShowFieldError('roomCapacity') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('roomCapacity').error}
            </p>
          )}
          {errors.steps?.[actualStepId]?.roomCapacity && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.roomCapacity?.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Expected Rent - MANDATORY */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("expectedRent")}>Expected Rent (₹/month) *</RequiredLabel>
          <Input
            id={getFieldPath("expectedRent")}
            type="number"
            defaultValue={getValue('expectedRent') || ''}
            {...registerNumericField('expectedRent', { 
              min: { value: 0, message: "Rent cannot be negative" } 
            })}
            placeholder="Monthly rent amount"
            className={cn(
              errors.steps?.[actualStepId]?.expectedRent && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {/* ✅ ADDED: Error messages below required fields */}
          {shouldShowFieldError('expectedRent') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('expectedRent').error}
            </p>
          )}
          {errors.steps?.[actualStepId]?.expectedRent && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.expectedRent?.message as string}
            </p>
          )}
        </div>

        {/* Expected Deposit - MANDATORY */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("expectedDeposit")}>Expected Deposit (₹) *</RequiredLabel>
          <Input
            id={getFieldPath("expectedDeposit")}
            type="number"
            defaultValue={getValue('expectedDeposit') || ''}
            {...registerNumericField('expectedDeposit', { 
              min: { value: 0, message: "Deposit cannot be negative" } 
            })}
            placeholder="Security deposit amount"
            className={cn(
              errors.steps?.[actualStepId]?.expectedDeposit && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {/* ✅ ADDED: Error messages below required fields */}
          {shouldShowFieldError('expectedDeposit') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('expectedDeposit').error}
            </p>
          )}
          {errors.steps?.[actualStepId]?.expectedDeposit && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.expectedDeposit?.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Bathroom Type - MANDATORY */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("bathroomType")}>Bathroom Type *</RequiredLabel>
          <Select
            value={getValue('bathroomType') || ''}
            onValueChange={(value) => updateFormAndState('bathroomType', value)}
          >
            <SelectTrigger 
              id={getFieldPath("bathroomType")}
              className={cn(
                "w-full",
                errors.steps?.[actualStepId]?.bathroomType && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Bathroom Type" />
            </SelectTrigger>
            <SelectContent>
              {BATHROOM_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* ✅ ADDED: Error messages below required fields */}
          {shouldShowFieldError('bathroomType') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('bathroomType').error}
            </p>
          )}
          {errors.steps?.[actualStepId]?.bathroomType && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.bathroomType?.message as string}
            </p>
          )}
        </div>

        {/* Room Size - MANDATORY */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("roomSize")}>Room Size (sqft) *</RequiredLabel>
          <Input
            id={getFieldPath("roomSize")}
            type="number"
            defaultValue={getValue('roomSize') || ''}
            {...registerNumericField('roomSize', { 
              min: { value: 0, message: "Size cannot be negative" } 
            })}
            placeholder="Size of room in square feet"
            className={cn(
              errors.steps?.[actualStepId]?.roomSize && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {/* ✅ ADDED: Error messages below required fields */}
          {shouldShowFieldError('roomSize') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('roomSize').error}
            </p>
          )}
          {errors.steps?.[actualStepId]?.roomSize && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.roomSize?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Meal Options - MANDATORY */}
      <div className="mb-6">
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("mealOption")}>Meal Options *</RequiredLabel>
          <Select
            value={getValue('mealOption') || ''}
            onValueChange={(value) => updateFormAndState('mealOption', value)}
          >
            <SelectTrigger 
              id={getFieldPath("mealOption")}
              className={cn(
                "w-full",
                errors.steps?.[actualStepId]?.mealOption && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Meal Option" />
            </SelectTrigger>
            <SelectContent>
              {MEAL_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* ✅ ADDED: Error messages below required fields */}
          {shouldShowFieldError('mealOption') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('mealOption').error}
            </p>
          )}
          {errors.steps?.[actualStepId]?.mealOption && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.mealOption?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Room Features section with checkboxes - OPTIONAL */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-4">Room Features (Optional)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PG_AMENITIES_LIST.map(amenity => {
            const amenityId = `${getFieldPath("roomFeatures")}-${amenity}`;
            const isChecked = getArrayValue('roomFeatures').includes(amenity);
            
            return (
              <div 
                key={amenityId} 
                className="flex items-center space-x-2"
              >
                <Checkbox 
                  id={amenityId}
                  checked={isChecked}
                  onCheckedChange={() => toggleArrayValue('roomFeatures', amenity)}
                />
                <label
                  htmlFor={amenityId}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {amenity}
                </label>
              </div>
            );
          })}
        </div>
        {/* ✅ ADDED: Error messages for room features if required */}
        {shouldShowFieldError('roomFeatures') && (
          <p className="text-sm text-red-600 mt-2">
            {getFieldValidation('roomFeatures').error}
          </p>
        )}
      </div>
    </FormSection>
  );
};

export default RoomDetails;