// src/modules/owner/components/property/wizard/sections/PGDetails.tsx
// Version: 2.4.0
// Last Modified: 19-05-2025 20:10 IST
// Purpose: Fixed missing fields and Gate Closing Time in PG Details tab

import React, { useEffect } from 'react';
import { FormData, FormSectionProps } from '../types';
import { PREFERRED_GUESTS_OPTIONS } from '../constants';
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
import { 
  Textarea 
} from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';
import { FLOW_TYPES } from '../constants/flows';

const PGDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType,
  stepId // Allow stepId to be passed in
}) => {
  const isEditMode = mode === 'edit';
  
  // Get form methods
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  
  // Determine the correct step ID based on the flow type
  const flowType = getValues('flow.flowType');
  const isPGFlow = flowType === FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
  
  // Default to pg step id if we detect PG flow, otherwise use provided stepId or fallback
  const actualStepId = isPGFlow ? 'res_pg_pg_details' : (stepId || 'res_rent_rental');
  
  console.log(`PG Details using step ID: ${actualStepId} for flow type: ${flowType}`);
  
  // Create path helper to ensure we register fields in the correct step
  const getFieldPath = (field: string) => `steps.${actualStepId}.${field}`;
  
  // Helper to register fields with the correct path
  const registerField = (field: string, options = {}) => register(getFieldPath(field), options);
  
  // Direct register for date fields to ensure they work properly
  const registerDateField = (field: string, options = {}) => {
    return {
      ...register(getFieldPath(field), {
        ...options
      }),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setValue(getFieldPath(field), value, { shouldValidate: true });
      }
    };
  };
  
  // Direct register for time fields to ensure they work properly
  const registerTimeField = (field: string, options = {}) => {
    return {
      ...register(getFieldPath(field), {
        ...options
      }),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        console.log(`Setting ${field} to:`, value);
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

  // When component mounts, ensure fields are registered in the correct step path
  useEffect(() => {
    // Check if any of the fields are at root level but should be in step
    const fieldsToCheck = [
      'genderPreference', 'gender', 'occupantType', 'preferredGuests',
      'mealOption', 'foodIncluded', 'mealOptions', 'rules',
      'noSmoking', 'noDrinking', 'noNonVeg', 'noGuardians', 'noGirlsEntry',
      'gateClosingTime', 'availableFrom', 'description'
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
    console.log("Current form state for PG Details:", getValues());
    console.log("Gate Closing Time value:", getValues(getFieldPath('gateClosingTime')));
  }, [actualStepId]);

  // Watch values for debugging
  const watchedGender = watch(getFieldPath('genderPreference'));
  const watchedOccupant = watch(getFieldPath('occupantType'));
  const watchedMeal = watch(getFieldPath('mealOption'));
  const watchedGateClosingTime = watch(getFieldPath('gateClosingTime'));

  console.log("Watched PG Details values:", {
    genderPreference: watchedGender,
    occupantType: watchedOccupant,
    mealOption: watchedMeal,
    gateClosingTime: watchedGateClosingTime
  });

  return (
    <FormSection
      title="Provide details about your place"
      description="Tell us more about your PG/Hostel facility"
    >
      {/* Place is available for */}
      <div className="space-y-3 mb-6">
        <RequiredLabel htmlFor={getFieldPath("genderPreference")}>Place is available for</RequiredLabel>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="genderMale"
              value="Male"
              checked={getValue('genderPreference') === 'Male'}
              onChange={() => setStepValue('genderPreference', 'Male', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="genderMale" className="text-sm">Male</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="genderFemale"
              value="Female"
              checked={getValue('genderPreference') === 'Female'}
              onChange={() => setStepValue('genderPreference', 'Female', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="genderFemale" className="text-sm">Female</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="genderAnyone"
              value="Both"
              checked={getValue('genderPreference') === 'Both'}
              onChange={() => setStepValue('genderPreference', 'Both', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="genderAnyone" className="text-sm">Anyone</label>
          </div>
        </div>
        {errors.steps?.[actualStepId]?.genderPreference && (
          <p className="text-sm text-destructive mt-1">
            {errors.steps?.[actualStepId]?.genderPreference?.message as string}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Preferred guests */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("occupantType")}>Preferred guests</RequiredLabel>
          <Select
            value={getValue('occupantType') || ''}
            onValueChange={(value) => setStepValue('occupantType', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id={getFieldPath("occupantType")}
              className={cn(
                "w-full",
                errors.steps?.[actualStepId]?.occupantType && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Students">Students</SelectItem>
              <SelectItem value="Working Professionals">Working Professionals</SelectItem>
              <SelectItem value="Both">Both Students & Professionals</SelectItem>
            </SelectContent>
          </Select>
          {errors.steps?.[actualStepId]?.occupantType && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.occupantType?.message as string}
            </p>
          )}
        </div>

        {/* Available From */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldPath("availableFrom")}>Available From</RequiredLabel>
          <div className="relative">
            <Input
              id={getFieldPath("availableFrom")}
              type="date"
              value={getValue('availableFrom') || ''}
              onChange={(e) => {
                const newValue = e.target.value;
                setStepValue('availableFrom', newValue, { shouldValidate: true });
              }}
              className={cn(
                errors.steps?.[actualStepId]?.availableFrom && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>
          {errors.steps?.[actualStepId]?.availableFrom && (
            <p className="text-sm text-destructive mt-1">
              {errors.steps?.[actualStepId]?.availableFrom?.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Food Included */}
      <div className="space-y-3 mb-6">
        <RequiredLabel htmlFor={getFieldPath("mealOption")}>Food Included</RequiredLabel>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="foodYes"
              value="Food Included"
              checked={getValue('mealOption') === 'Food Included'}
              onChange={() => setStepValue('mealOption', 'Food Included', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="foodYes" className="text-sm">Yes</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="foodNo"
              value="No Food"
              checked={getValue('mealOption') === 'No Food'}
              onChange={() => setStepValue('mealOption', 'No Food', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="foodNo" className="text-sm">No</label>
          </div>
        </div>
        {errors.steps?.[actualStepId]?.mealOption && (
          <p className="text-sm text-destructive mt-1">
            {errors.steps?.[actualStepId]?.mealOption?.message as string}
          </p>
        )}
      </div>

      {/* PG/Hostel Rules */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-4">PG/Hostel Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="rule_noSmoking"
              checked={getValue('rules')?.includes('No Smoking') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValue('rules') || [];
                if (checked) {
                  setStepValue('rules', [...currentRules, 'No Smoking'], { shouldValidate: true });
                } else {
                  setStepValue(
                    'rules',
                    currentRules.filter((item) => item !== 'No Smoking'),
                    { shouldValidate: true }
                  );
                }
              }}
            />
            <label
              htmlFor="rule_noSmoking"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              No Smoking
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="rule_noGuardians"
              checked={getValue('rules')?.includes('No Guardians Stay') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValue('rules') || [];
                if (checked) {
                  setStepValue('rules', [...currentRules, 'No Guardians Stay'], { shouldValidate: true });
                } else {
                  setStepValue(
                    'rules',
                    currentRules.filter((item) => item !== 'No Guardians Stay'),
                    { shouldValidate: true }
                  );
                }
              }}
            />
            <label
              htmlFor="rule_noGuardians"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              No Guardians Stay
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="rule_noGirlsEntry"
              checked={getValue('rules')?.includes('No Girl\'s Entry') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValue('rules') || [];
                if (checked) {
                  setStepValue('rules', [...currentRules, 'No Girl\'s Entry'], { shouldValidate: true });
                } else {
                  setStepValue(
                    'rules',
                    currentRules.filter((item) => item !== 'No Girl\'s Entry'),
                    { shouldValidate: true }
                  );
                }
              }}
            />
            <label
              htmlFor="rule_noGirlsEntry"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              No Girl's Entry
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="rule_noDrinking"
              checked={getValue('rules')?.includes('No Drinking') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValue('rules') || [];
                if (checked) {
                  setStepValue('rules', [...currentRules, 'No Drinking'], { shouldValidate: true });
                } else {
                  setStepValue(
                    'rules',
                    currentRules.filter((item) => item !== 'No Drinking'),
                    { shouldValidate: true }
                  );
                }
              }}
            />
            <label
              htmlFor="rule_noDrinking"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              No Drinking
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="rule_noNonVeg"
              checked={getValue('rules')?.includes('No Non-veg') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValue('rules') || [];
                if (checked) {
                  setStepValue('rules', [...currentRules, 'No Non-veg'], { shouldValidate: true });
                } else {
                  setStepValue(
                    'rules',
                    currentRules.filter((item) => item !== 'No Non-veg'),
                    { shouldValidate: true }
                  );
                }
              }}
            />
            <label
              htmlFor="rule_noNonVeg"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              No Non-veg
            </label>
          </div>
        </div>
      </div>

      {/* Gate Closing Time - Updated to use controlled component pattern */}
      <div className="space-y-2 mb-6">
        <RequiredLabel htmlFor={getFieldPath("gateClosingTime")}>Gate Closing Time</RequiredLabel>
        <Input
          id={getFieldPath("gateClosingTime")}
          type="time"
          value={getValue('gateClosingTime') || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log("Gate closing time changed to:", newValue);
            setStepValue('gateClosingTime', newValue, { shouldValidate: true });
          }}
          placeholder="Gate Closing Time"
          className={cn(
            errors.steps?.[actualStepId]?.gateClosingTime && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.steps?.[actualStepId]?.gateClosingTime && (
          <p className="text-sm text-destructive mt-1">
            {errors.steps?.[actualStepId]?.gateClosingTime?.message as string}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <RequiredLabel htmlFor={getFieldPath("description")}>Description</RequiredLabel>
        <Textarea
          id={getFieldPath("description")}
          value={getValue('description') || ''}
          onChange={(e) => {
            const newValue = e.target.value;
            setStepValue('description', newValue, { shouldValidate: true });
          }}
          placeholder="Write a few lines about your property something which is special and makes your property stand out. Please do not mention your contact details in any format."
          className={cn(
            "min-h-[120px]",
            errors.steps?.[actualStepId]?.description && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.steps?.[actualStepId]?.description && (
          <p className="text-sm text-destructive mt-1">
            {errors.steps?.[actualStepId]?.description?.message as string}
          </p>
        )}
      </div>
    </FormSection>
  );
};

export default PGDetails;