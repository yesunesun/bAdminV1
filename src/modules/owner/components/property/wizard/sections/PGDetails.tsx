// src/modules/owner/components/property/wizard/sections/PGDetails.tsx
// Version: 1.0.0
// Last Modified: 10-04-2025 20:30 IST
// Purpose: PG/Hostel facility details section for PG listings

import React from 'react';
import { FormData, FormSectionProps } from '../types';
import { PG_AMENITIES_LIST, MEAL_OPTIONS } from '../constants';
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

const PGDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType
}) => {
  const isEditMode = mode === 'edit';
  
  // Get form methods
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  
  // Watch for dependencies
  const mealOption = watch('mealOption');

  return (
    <FormSection
      title="PG/Hostel Details"
      description="Provide details about your PG/Hostel facility"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Rent */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="monthlyRent">Monthly Rent (₹)</RequiredLabel>
          <Input
            id="monthlyRent"
            type="text"
            {...register('monthlyRent')}
            placeholder="e.g. 6000"
            className={cn(
              errors.monthlyRent && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.monthlyRent && (
            <p className="text-sm text-destructive mt-1">{errors.monthlyRent.message as string}</p>
          )}
        </div>

        {/* Security Deposit */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="securityDeposit">Security Deposit (₹)</RequiredLabel>
          <Input
            id="securityDeposit"
            type="text"
            {...register('securityDeposit')}
            placeholder="e.g. 10000"
            className={cn(
              errors.securityDeposit && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.securityDeposit && (
            <p className="text-sm text-destructive mt-1">{errors.securityDeposit.message as string}</p>
          )}
        </div>

        {/* Meals Option */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="mealOption">Meal Option</RequiredLabel>
          <Select
            value={getValues('mealOption') || ''}
            onValueChange={(value) => setValue('mealOption', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id="mealOption"
              className={cn(
                "w-full",
                errors.mealOption && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Meal Option" />
            </SelectTrigger>
            <SelectContent>
              {MEAL_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.mealOption && (
            <p className="text-sm text-destructive mt-1">{errors.mealOption.message as string}</p>
          )}
        </div>

        {/* Notice Period */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="noticePeriod">Notice Period (days)</RequiredLabel>
          <Input
            id="noticePeriod"
            type="number"
            min={0}
            {...register('noticePeriod')}
            placeholder="e.g. 30"
            className={cn(
              errors.noticePeriod && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.noticePeriod && (
            <p className="text-sm text-destructive mt-1">{errors.noticePeriod.message as string}</p>
          )}
        </div>

        {/* Gender Preference */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="genderPreference">Gender Preference</RequiredLabel>
          <Select
            value={getValues('genderPreference') || ''}
            onValueChange={(value) => setValue('genderPreference', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id="genderPreference"
              className={cn(
                "w-full",
                errors.genderPreference && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Gender Preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male Only</SelectItem>
              <SelectItem value="Female">Female Only</SelectItem>
              <SelectItem value="Both">Co-living (Both)</SelectItem>
            </SelectContent>
          </Select>
          {errors.genderPreference && (
            <p className="text-sm text-destructive mt-1">{errors.genderPreference.message as string}</p>
          )}
        </div>

        {/* Occupant Type */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="occupantType">Preferred Occupants</RequiredLabel>
          <Select
            value={getValues('occupantType') || ''}
            onValueChange={(value) => setValue('occupantType', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id="occupantType"
              className={cn(
                "w-full",
                errors.occupantType && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Preferred Occupants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Students">Students</SelectItem>
              <SelectItem value="Working Professionals">Working Professionals</SelectItem>
              <SelectItem value="Both">Both Students & Professionals</SelectItem>
            </SelectContent>
          </Select>
          {errors.occupantType && (
            <p className="text-sm text-destructive mt-1">{errors.occupantType.message as string}</p>
          )}
        </div>
      </div>

      {/* House Rules */}
      <div className="mt-6 space-y-2">
        <RequiredLabel htmlFor="houseRules">House Rules</RequiredLabel>
        <Textarea
          id="houseRules"
          {...register('houseRules')}
          placeholder="Enter house rules, curfew times, etc."
          className={cn(
            "min-h-[120px]",
            errors.houseRules && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.houseRules && (
          <p className="text-sm text-destructive mt-1">{errors.houseRules.message as string}</p>
        )}
      </div>

      {/* PG Amenities */}
      <div className="mt-8">
        <h3 className="text-base font-medium mb-3">PG/Hostel Amenities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PG_AMENITIES_LIST.map((amenity) => (
            <div key={amenity} className="flex items-start space-x-2">
              <Checkbox
                id={`pgAmenities_${amenity}`}
                checked={getValues('pgAmenities')?.includes(amenity) || false}
                onCheckedChange={(checked) => {
                  const currentAmenities = getValues('pgAmenities') || [];
                  if (checked) {
                    setValue('pgAmenities', [...currentAmenities, amenity], { shouldValidate: true });
                  } else {
                    setValue(
                      'pgAmenities',
                      currentAmenities.filter((item) => item !== amenity),
                      { shouldValidate: true }
                    );
                  }
                }}
              />
              <label
                htmlFor={`pgAmenities_${amenity}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {amenity}
              </label>
            </div>
          ))}
        </div>
        {errors.pgAmenities && (
          <p className="text-sm text-destructive mt-2">{errors.pgAmenities.message as string}</p>
        )}
      </div>
    </FormSection>
  );
};

export default PGDetails;