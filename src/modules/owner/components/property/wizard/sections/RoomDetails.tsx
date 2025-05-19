// src/modules/owner/components/property/wizard/sections/RoomDetails.tsx
// Version: 2.3.0
// Last Modified: 19-05-2025 20:45 IST
// Purpose: Added missing fields for PG/Hostel Room Details including meal options and room features

import React, { useEffect } from 'react';
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
  
  console.log(`Room Details using step ID: ${actualStepId} for flow type: ${flowType}`);
  
  // Create path helper to ensure we register fields in the correct step
  const getFieldPath = (field: string) => `steps.${actualStepId}.${field}`;
  
  // Direct register for numeric fields to ensure they work properly
  const registerNumericField = (field: string, options = {}) => {
    return {
      ...register(getFieldPath(field), {
        valueAsNumber: true,
        ...options
      }),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? null : Number(e.target.value);
        setValue(getFieldPath(field), value, { shouldValidate: true });
      }
    };
  };
  
  // Helper to get values with the correct path
  const getValue = (field: string) => {
    // First try to get from the step
    const stepValue = getValues(getFieldPath(field));
    
    // If not found in the step, try root level for backward compatibility
    if (stepValue === undefined) {
      return getValues(field);
    }
    
    return stepValue;
  };
  
  // Helper to set values with the correct path
  const setStepValue = (field: string, value: any, options?: any) => {
    // Set in the proper step
    setValue(getFieldPath(field), value, options);
    
    // Also set at root level for backward compatibility
    setValue(field, value, options);
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
    
    setStepValue(field, newValues, { shouldValidate: true });
  };

  // When component mounts, ensure fields are registered in the correct step path
  useEffect(() => {
    // Check if any of the fields are at root level but should be in step
    const fieldsToCheck = [
      'roomType', 'roomCapacity', 'expectedRent', 'expectedDeposit', 
      'bathroomType', 'roomSize', 'mealOption', 'roomFeatures'
    ];
    
    fieldsToCheck.forEach(field => {
      const rootValue = getValues(field);
      if (rootValue !== undefined && rootValue !== null && rootValue !== '') {
        // Root level field exists, also set it in the proper step
        console.log(`Moving field ${field} from root to step ${actualStepId}`, rootValue);
        setStepValue(field, rootValue);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Room Type */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("roomType")}>Room Type</RequiredLabel>
          <Select
            value={getValue('roomType') || ''}
            onValueChange={(value) => setStepValue('roomType', value, { shouldValidate: true })}
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
          {errors.steps?.[actualStepId]?.roomType && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.roomType?.message as string}
            </p>
          )}
        </div>

        {/* Total Capacity */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("roomCapacity")}>Total Capacity (per room)</RequiredLabel>
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
          {errors.steps?.[actualStepId]?.roomCapacity && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.roomCapacity?.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Expected Rent */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("expectedRent")}>Expected Rent (₹/month)</RequiredLabel>
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
          {errors.steps?.[actualStepId]?.expectedRent && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.expectedRent?.message as string}
            </p>
          )}
        </div>

        {/* Expected Deposit */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("expectedDeposit")}>Expected Deposit (₹)</RequiredLabel>
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
          {errors.steps?.[actualStepId]?.expectedDeposit && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.expectedDeposit?.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Bathroom Type */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("bathroomType")}>Bathroom Type</RequiredLabel>
          <Select
            value={getValue('bathroomType') || ''}
            onValueChange={(value) => setStepValue('bathroomType', value, { shouldValidate: true })}
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
          {errors.steps?.[actualStepId]?.bathroomType && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.bathroomType?.message as string}
            </p>
          )}
        </div>

        {/* Room Size */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("roomSize")}>Room Size (sqft)</RequiredLabel>
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
          {errors.steps?.[actualStepId]?.roomSize && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.roomSize?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Meal Options - Added as a new field */}
      <div className="mb-6">
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("mealOption")}>Meal Options</RequiredLabel>
          <Select
            value={getValue('mealOption') || ''}
            onValueChange={(value) => setStepValue('mealOption', value, { shouldValidate: true })}
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
          {errors.steps?.[actualStepId]?.mealOption && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.mealOption?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Room Features section with checkboxes */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-4">Room Features</h3>
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
      </div>
    </FormSection>
  );
};

export default RoomDetails;