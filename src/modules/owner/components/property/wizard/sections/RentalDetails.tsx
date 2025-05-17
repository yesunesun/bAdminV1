// src/modules/owner/components/property/wizard/sections/RentalDetails.tsx
// Version: 2.2.0
// Last Modified: 17-05-2025 16:45 IST
// Purpose: Fixed form field registration to save data in step object structure

import React, { useEffect } from 'react';
import { FormData, FormSectionProps } from '../types';
import { 
  RENTAL_TYPES, 
  MAINTENANCE_OPTIONS,
  TENANT_PREFERENCES,
  FURNISHING_OPTIONS,
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
import { useStepForm } from '../hooks/useStepForm';

export const RentalDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType,
  stepId = 'res_rent_rental' // Explicitly set the step ID
}) => {
  const isEditMode = mode === 'edit';
  
  // Use the useStepForm hook for proper step-based registration
  const { 
    registerField, 
    getFieldError, 
    setFieldValue, 
    getFieldValue, 
    watchField,
    getFieldId,
    migrateRootFields
  } = useStepForm(form, stepId);
  
  // Migrate existing data from root to step object on component mount
  useEffect(() => {
    const fieldsToMigrate = [
      'rentalType', 'rentAmount', 'rentNegotiable', 'securityDeposit', 
      'availableFrom', 'maintenance', 'furnishing', 'parking', 
      'preferredTenants', 'nonVegAllowed', 'petsAllowed', 
      'hasLockInPeriod', 'lockInPeriod'
    ];
    
    migrateRootFields(fieldsToMigrate);
  }, [migrateRootFields]);
  
  // Watch for dependencies using the step structure
  const rentalType = watchField('rentalType');
  const rentNegotiable = watchField('rentNegotiable');

  return (
    <FormSection
      title="Rental Details"
      description="Specify your rental terms and preferences"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rental Type */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldId('rentalType')}>Rental Type</RequiredLabel>
          <Select
            value={getFieldValue('rentalType') || 'rent'}
            onValueChange={(value) => setFieldValue('rentalType', value as 'rent' | 'lease')}
            disabled={isEditMode}
          >
            <SelectTrigger 
              id={getFieldId('rentalType')}
              className={cn(
                "w-full",
                getFieldError('rentalType') && "border-destructive focus-visible:ring-destructive"
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
          {getFieldError('rentalType') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('rentalType')?.message as string}</p>
          )}
        </div>

        {/* Rent Amount */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldId('rentAmount')}>
            {rentalType === 'lease' ? 'Lease Amount (₹)' : 'Rent Amount (₹) per month'}
          </RequiredLabel>
          <div className="relative">
            <Input
              id={getFieldId('rentAmount')}
              type="text"
              {...registerField('rentAmount')}
              placeholder="e.g. 15000"
              className={cn(
                getFieldError('rentAmount') && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="absolute right-3 top-2.5">
              <Checkbox
                id={getFieldId('rentNegotiable')}
                checked={rentNegotiable}
                onCheckedChange={(checked) => setFieldValue('rentNegotiable', !!checked)}
              />
              <label
                htmlFor={getFieldId('rentNegotiable')}
                className="ml-1.5 text-xs font-medium text-muted-foreground cursor-pointer"
              >
                Negotiable
              </label>
            </div>
          </div>
          {getFieldError('rentAmount') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('rentAmount')?.message as string}</p>
          )}
        </div>

        {/* Security Deposit */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldId('securityDeposit')}>Security Deposit (₹)</RequiredLabel>
          <Input
            id={getFieldId('securityDeposit')}
            type="text"
            {...registerField('securityDeposit')}
            placeholder="e.g. 50000"
            className={cn(
              getFieldError('securityDeposit') && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {getFieldError('securityDeposit') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('securityDeposit')?.message as string}</p>
          )}
        </div>

        {/* Maintenance */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldId('maintenance')}>Maintenance</RequiredLabel>
          <Select
            value={getFieldValue('maintenance') || ''}
            onValueChange={(value) => setFieldValue('maintenance', value)}
          >
            <SelectTrigger 
              id={getFieldId('maintenance')}
              className={cn(
                "w-full",
                getFieldError('maintenance') && "border-destructive focus-visible:ring-destructive"
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
          {getFieldError('maintenance') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('maintenance')?.message as string}</p>
          )}
        </div>

        {/* Available From */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldId('availableFrom')}>Available From</RequiredLabel>
          <Input
            id={getFieldId('availableFrom')}
            type="date"
            {...registerField('availableFrom')}
            className={cn(
              getFieldError('availableFrom') && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {getFieldError('availableFrom') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('availableFrom')?.message as string}</p>
          )}
        </div>

        {/* Furnishing Status */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldId('furnishing')}>Furnishing Status</RequiredLabel>
          <Select
            value={getFieldValue('furnishing') || ''}
            onValueChange={(value) => setFieldValue('furnishing', value)}
          >
            <SelectTrigger 
              id={getFieldId('furnishing')}
              className={cn(
                "w-full",
                getFieldError('furnishing') && "border-destructive focus-visible:ring-destructive"
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
          {getFieldError('furnishing') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('furnishing')?.message as string}</p>
          )}
        </div>

        {/* Parking */}
        <div className="space-y-2">
          <RequiredLabel htmlFor={getFieldId('parking')}>Parking</RequiredLabel>
          <Select
            value={getFieldValue('parking') || ''}
            onValueChange={(value) => setFieldValue('parking', value)}
          >
            <SelectTrigger 
              id={getFieldId('parking')}
              className={cn(
                "w-full",
                getFieldError('parking') && "border-destructive focus-visible:ring-destructive"
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
          {getFieldError('parking') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('parking')?.message as string}</p>
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
                id={getFieldId(`tenantPref-${preference}`)}
                checked={(getFieldValue('preferredTenants') || []).includes(preference)}
                onCheckedChange={(checked) => {
                  const currentPreferences = getFieldValue('preferredTenants') || [];
                  if (checked) {
                    setFieldValue('preferredTenants', [...currentPreferences, preference]);
                  } else {
                    setFieldValue(
                      'preferredTenants',
                      currentPreferences.filter((item) => item !== preference)
                    );
                  }
                }}
              />
              <label
                htmlFor={getFieldId(`tenantPref-${preference}`)}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {preference}
              </label>
            </div>
          ))}
        </div>
        {getFieldError('preferredTenants') && (
          <p className="text-sm text-destructive mt-2">{getFieldError('preferredTenants')?.message as string}</p>
        )}
      </div>

      {/* Additional Rental Info - can be expanded as needed */}
      <div className="mt-8">
        <h3 className="text-base font-medium mb-3">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id={getFieldId('nonVegAllowed')}
              checked={getFieldValue('nonVegAllowed') || false}
              onCheckedChange={(checked) => setFieldValue('nonVegAllowed', !!checked)}
            />
            <label
              htmlFor={getFieldId('nonVegAllowed')}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Non-Veg Allowed
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id={getFieldId('petsAllowed')}
              checked={getFieldValue('petsAllowed') || false}
              onCheckedChange={(checked) => setFieldValue('petsAllowed', !!checked)}
            />
            <label
              htmlFor={getFieldId('petsAllowed')}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Pets Allowed
            </label>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox
              id={getFieldId('hasLockInPeriod')}
              checked={getFieldValue('hasLockInPeriod') || false}
              onCheckedChange={(checked) => {
                setFieldValue('hasLockInPeriod', !!checked);
                if (!checked) {
                  setFieldValue('lockInPeriod', '');
                }
              }}
            />
            <label
              htmlFor={getFieldId('hasLockInPeriod')}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Has Lock-in Period
            </label>
          </div>
        </div>
        
        {getFieldValue('hasLockInPeriod') && (
          <div className="mt-4 max-w-xs">
            <RequiredLabel htmlFor={getFieldId('lockInPeriod')}>Lock-in Period (months)</RequiredLabel>
            <Input
              id={getFieldId('lockInPeriod')}
              type="number"
              min={1}
              max={36}
              {...registerField('lockInPeriod')}
              placeholder="e.g. 6"
              className={cn(
                getFieldError('lockInPeriod') && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {getFieldError('lockInPeriod') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('lockInPeriod')?.message as string}</p>
            )}
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default RentalDetails;