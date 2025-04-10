// src/modules/owner/components/property/wizard/sections/PGDetails.tsx
// Version: 2.0.0
// Last Modified: 10-04-2025 21:30 IST
// Purpose: Updated PG/Hostel facility details section to match new design and removed amenities

import React from 'react';
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

const PGDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType
}) => {
  const isEditMode = mode === 'edit';
  
  // Get form methods
  const { register, formState: { errors }, setValue, getValues, watch } = form;

  return (
    <FormSection
      title="Provide details about your place"
      description="Tell us more about your PG/Hostel facility"
    >
      {/* Place is available for */}
      <div className="space-y-3 mb-6">
        <RequiredLabel htmlFor="genderPreference">Place is available for</RequiredLabel>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="genderMale"
              value="Male"
              checked={getValues('genderPreference') === 'Male'}
              onChange={() => setValue('genderPreference', 'Male', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="genderMale" className="text-sm">Male</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="genderFemale"
              value="Female"
              checked={getValues('genderPreference') === 'Female'}
              onChange={() => setValue('genderPreference', 'Female', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="genderFemale" className="text-sm">Female</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="genderAnyone"
              value="Both"
              checked={getValues('genderPreference') === 'Both'}
              onChange={() => setValue('genderPreference', 'Both', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="genderAnyone" className="text-sm">Anyone</label>
          </div>
        </div>
        {errors.genderPreference && (
          <p className="text-sm text-destructive mt-1">{errors.genderPreference.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Preferred guests */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="occupantType">Preferred guests</RequiredLabel>
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
              <SelectValue placeholder="Select" />
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

        {/* Available From */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="availableFrom">Available From</RequiredLabel>
          <div className="relative">
            <Input
              id="availableFrom"
              type="date"
              {...register('availableFrom')}
              className={cn(
                errors.availableFrom && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          </div>
          {errors.availableFrom && (
            <p className="text-sm text-destructive mt-1">{errors.availableFrom.message as string}</p>
          )}
        </div>
      </div>

      {/* Food Included */}
      <div className="space-y-3 mb-6">
        <RequiredLabel htmlFor="foodIncluded">Food Included</RequiredLabel>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="foodYes"
              value="Yes"
              checked={getValues('mealOption') === 'Food Included'}
              onChange={() => setValue('mealOption', 'Food Included', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="foodYes" className="text-sm">Yes</label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="foodNo"
              value="No"
              checked={getValues('mealOption') === 'No Food'}
              onChange={() => setValue('mealOption', 'No Food', { shouldValidate: true })}
              className="h-4 w-4 text-primary rounded-full"
            />
            <label htmlFor="foodNo" className="text-sm">No</label>
          </div>
        </div>
        {errors.mealOption && (
          <p className="text-sm text-destructive mt-1">{errors.mealOption.message as string}</p>
        )}
      </div>

      {/* PG/Hostel Rules */}
      <div className="mb-6">
        <h3 className="text-base font-medium mb-4">PG/Hostel Rules</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="rule_noSmoking"
              checked={getValues('rules')?.includes('No Smoking') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValues('rules') || [];
                if (checked) {
                  setValue('rules', [...currentRules, 'No Smoking'], { shouldValidate: true });
                } else {
                  setValue(
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
              checked={getValues('rules')?.includes('No Guardians Stay') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValues('rules') || [];
                if (checked) {
                  setValue('rules', [...currentRules, 'No Guardians Stay'], { shouldValidate: true });
                } else {
                  setValue(
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
              checked={getValues('rules')?.includes('No Girl\'s Entry') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValues('rules') || [];
                if (checked) {
                  setValue('rules', [...currentRules, 'No Girl\'s Entry'], { shouldValidate: true });
                } else {
                  setValue(
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
              checked={getValues('rules')?.includes('No Drinking') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValues('rules') || [];
                if (checked) {
                  setValue('rules', [...currentRules, 'No Drinking'], { shouldValidate: true });
                } else {
                  setValue(
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
              checked={getValues('rules')?.includes('No Non-veg') || false}
              onCheckedChange={(checked) => {
                const currentRules = getValues('rules') || [];
                if (checked) {
                  setValue('rules', [...currentRules, 'No Non-veg'], { shouldValidate: true });
                } else {
                  setValue(
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

      {/* Gate Closing Time */}
      <div className="space-y-2 mb-6">
        <RequiredLabel htmlFor="gateClosingTime">Gate Closing Time</RequiredLabel>
        <Input
          id="gateClosingTime"
          type="time"
          {...register('gateClosingTime')}
          placeholder="Gate Closing Time"
          className={cn(
            errors.gateClosingTime && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.gateClosingTime && (
          <p className="text-sm text-destructive mt-1">{errors.gateClosingTime.message as string}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <RequiredLabel htmlFor="description">Description</RequiredLabel>
        <Textarea
          id="description"
          {...register('description')}
          placeholder="Write a few lines about your property something which is special and makes your property stand out. Please do not mention your contact details in any format."
          className={cn(
            "min-h-[120px]",
            errors.description && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message as string}</p>
        )}
      </div>
    </FormSection>
  );
};

export default PGDetails;