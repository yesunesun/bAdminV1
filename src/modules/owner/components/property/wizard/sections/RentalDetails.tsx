// src/modules/owner/components/property/wizard/sections/RentalDetails.tsx
// Version: 2.1.0
// Last Modified: 11-04-2025 00:15 IST
// Purpose: Fixed import for furnishing options

import React from 'react';
import { FormData, FormSectionProps } from '../types';
import { 
  RENTAL_TYPES, 
  MAINTENANCE_OPTIONS,
  TENANT_PREFERENCES,
  FURNISHING_OPTIONS, // Fixed import - removing apostrophe
  PARKING_OPTIONS 
} from '../constants';
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

export const RentalDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType
}) => {
  const isEditMode = mode === 'edit';
  
  // Get form methods
  const { register, formState: { errors }, setValue, getValues, watch } = form;
  
  // Watch for dependencies
  const rentalType = watch('rentalType');
  const rentNegotiable = watch('rentNegotiable');

  return (
    <FormSection
      title="Rental Details"
      description="Specify your rental terms and preferences"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rental Type */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="rentalType">Rental Type</RequiredLabel>
          <Select
            value={getValues('rentalType') || 'rent'}
            onValueChange={(value) => setValue('rentalType', value as 'rent' | 'lease', { shouldValidate: true })}
            disabled={isEditMode}
          >
            <SelectTrigger 
              id="rentalType"
              className={cn(
                "w-full",
                errors.rentalType && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              {RENTAL_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rentalType && (
            <p className="text-sm text-destructive mt-1">{errors.rentalType.message as string}</p>
          )}
        </div>

        {/* Rent Amount */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="rentAmount">
            {rentalType === 'lease' ? 'Lease Amount (₹)' : 'Rent Amount (₹) per month'}
          </RequiredLabel>
          <div className="relative">
            <Input
              id="rentAmount"
              type="text"
              {...register('rentAmount')}
              placeholder="e.g. 15000"
              className={cn(
                errors.rentAmount && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="absolute right-3 top-2.5">
              <Checkbox
                id="rentNegotiable"
                checked={rentNegotiable}
                onCheckedChange={(checked) => setValue('rentNegotiable', !!checked, { shouldValidate: true })}
              />
              <label
                htmlFor="rentNegotiable"
                className="ml-1.5 text-xs font-medium text-muted-foreground cursor-pointer"
              >
                Negotiable
              </label>
            </div>
          </div>
          {errors.rentAmount && (
            <p className="text-sm text-destructive mt-1">{errors.rentAmount.message as string}</p>
          )}
        </div>

        {/* Security Deposit */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="securityDeposit">Security Deposit (₹)</RequiredLabel>
          <Input
            id="securityDeposit"
            type="text"
            {...register('securityDeposit')}
            placeholder="e.g. 50000"
            className={cn(
              errors.securityDeposit && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.securityDeposit && (
            <p className="text-sm text-destructive mt-1">{errors.securityDeposit.message as string}</p>
          )}
        </div>

        {/* Maintenance */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="maintenance">Maintenance</RequiredLabel>
          <Select
            value={getValues('maintenance') || ''}
            onValueChange={(value) => setValue('maintenance', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id="maintenance"
              className={cn(
                "w-full",
                errors.maintenance && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Maintenance Option" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.maintenance && (
            <p className="text-sm text-destructive mt-1">{errors.maintenance.message as string}</p>
          )}
        </div>

        {/* Available From */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="availableFrom">Available From</RequiredLabel>
          <Input
            id="availableFrom"
            type="date"
            {...register('availableFrom')}
            className={cn(
              errors.availableFrom && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {errors.availableFrom && (
            <p className="text-sm text-destructive mt-1">{errors.availableFrom.message as string}</p>
          )}
        </div>

        {/* Furnishing Status */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="furnishing">Furnishing Status</RequiredLabel>
          <Select
            value={getValues('furnishing') || ''}
            onValueChange={(value) => setValue('furnishing', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id="furnishing"
              className={cn(
                "w-full",
                errors.furnishing && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Furnishing Status" />
            </SelectTrigger>
            <SelectContent>
              {FURNISHING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.furnishing && (
            <p className="text-sm text-destructive mt-1">{errors.furnishing.message as string}</p>
          )}
        </div>

        {/* Parking */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="parking">Parking</RequiredLabel>
          <Select
            value={getValues('parking') || ''}
            onValueChange={(value) => setValue('parking', value, { shouldValidate: true })}
          >
            <SelectTrigger 
              id="parking"
              className={cn(
                "w-full",
                errors.parking && "border-destructive focus-visible:ring-destructive"
              )}
            >
              <SelectValue placeholder="Select Parking Option" />
            </SelectTrigger>
            <SelectContent>
              {PARKING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.parking && (
            <p className="text-sm text-destructive mt-1">{errors.parking.message as string}</p>
          )}
        </div>
      </div>

      {/* Preferred Tenants */}
      <div className="mt-8">
        <RequiredLabel>Preferred Tenants</RequiredLabel>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {TENANT_PREFERENCES.map((preference) => (
            <div key={preference} className="flex items-start space-x-2">
              <Checkbox
                id={`tenantPref-${preference}`}
                checked={(getValues('preferredTenants') || []).includes(preference)}
                onCheckedChange={(checked) => {
                  const currentPreferences = getValues('preferredTenants') || [];
                  if (checked) {
                    setValue('preferredTenants', [...currentPreferences, preference], { shouldValidate: true });
                  } else {
                    setValue(
                      'preferredTenants',
                      currentPreferences.filter((item) => item !== preference),
                      { shouldValidate: true }
                    );
                  }
                }}
              />
              <label
                htmlFor={`tenantPref-${preference}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {preference}
              </label>
            </div>
          ))}
        </div>
        {errors.preferredTenants && (
          <p className="text-sm text-destructive mt-2">{errors.preferredTenants.message as string}</p>
        )}
      </div>

      {/* Additional Rental Info - can be expanded as needed */}
      <div className="mt-8">
        <h3 className="text-base font-medium mb-3">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="nonVegAllowed"
              checked={getValues('nonVegAllowed') || false}
              onCheckedChange={(checked) => setValue('nonVegAllowed', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="nonVegAllowed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Non-Veg Allowed
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="petsAllowed"
              checked={getValues('petsAllowed') || false}
              onCheckedChange={(checked) => setValue('petsAllowed', !!checked, { shouldValidate: true })}
            />
            <label
              htmlFor="petsAllowed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Pets Allowed
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id="lockInPeriod"
              checked={getValues('hasLockInPeriod') || false}
              onCheckedChange={(checked) => {
                setValue('hasLockInPeriod', !!checked, { shouldValidate: true });
                if (!checked) {
                  setValue('lockInPeriod', '', { shouldValidate: true });
                }
              }}
            />
            <label
              htmlFor="lockInPeriod"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Has Lock-in Period
            </label>
          </div>
        </div>
        
        {getValues('hasLockInPeriod') && (
          <div className="mt-4 max-w-xs">
            <RequiredLabel htmlFor="lockInPeriod">Lock-in Period (months)</RequiredLabel>
            <Input
              id="lockInPeriod"
              type="number"
              min={1}
              max={36}
              {...register('lockInPeriod')}
              placeholder="e.g. 6"
              className={cn(
                errors.lockInPeriod && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {errors.lockInPeriod && (
              <p className="text-sm text-destructive mt-1">{errors.lockInPeriod.message as string}</p>
            )}
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default RentalDetails;