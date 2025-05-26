// src/modules/owner/components/property/wizard/sections/CommercialRentalDetails.tsx
// Version: 1.0.0
// Last Modified: 26-05-2025 10:30 IST
// Purpose: Commercial-specific rental details component

import React, { useEffect } from 'react';
import { FormData, FormSectionProps } from '../types';
import { 
  COMMERCIAL_RENTAL_TYPES,
  COMMERCIAL_MAINTENANCE_OPTIONS,
  COMMERCIAL_BUSINESS_PREFERENCES,
  COMMERCIAL_FURNISHING_OPTIONS,
  COMMERCIAL_PARKING_OPTIONS,
  LEASE_TERMS,
  OPERATING_HOURS_OPTIONS
} from '../constants/commercialRentalDetails';
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

export const CommercialRentalDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType,
  stepId = 'com_rent_rental' // Commercial rent rental step ID
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
      'businessPreferences', 'operatingHours', 'hasLockInPeriod', 
      'lockInPeriod', 'advanceRent', 'includesUtilities', 'camCharges'
    ];
    
    migrateRootFields(fieldsToMigrate);
  }, [migrateRootFields]);
  
  // Watch for dependencies using the step structure
  const rentalType = watchField('rentalType');
  const rentNegotiable = watchField('rentNegotiable');
  const hasLockInPeriod = watchField('hasLockInPeriod');
  const includesUtilities = watchField('includesUtilities');

  // Function to convert number to Indian currency format
  const formatToIndianCurrency = (value: number): string => {
    if (!value) return '';
    
    if (value >= 10000000) {
      return `₹ ${(value / 10000000).toFixed(2)} Crores`;
    } else if (value >= 100000) {
      return `₹ ${(value / 100000).toFixed(0)} Lacs`;
    } else if (value >= 1000) {
      return `₹ ${(value / 1000).toFixed(0)} Thousand`;
    } else {
      return `₹ ${value}`;
    }
  };

  return (
    <FormSection
      title="Commercial Rental Details"
      description="Specify your commercial rental terms and business preferences"
    >
      <div className="space-y-6">
        
        {/* First Row - Rental Type and Rent Amount */}
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
                {COMMERCIAL_RENTAL_TYPES.map((type) => (
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
                placeholder="e.g. 50000"
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
            {getFieldValue('rentAmount') && !isNaN(Number(getFieldValue('rentAmount'))) && (
              <p className="text-sm text-teal-500 text-right">
                {formatToIndianCurrency(Number(getFieldValue('rentAmount')))}
              </p>
            )}
            {getFieldError('rentAmount') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('rentAmount')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Second Row - Security Deposit and Advance Rent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Deposit */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('securityDeposit')}>Security Deposit (₹)</RequiredLabel>
            <Input
              id={getFieldId('securityDeposit')}
              type="text"
              {...registerField('securityDeposit')}
              placeholder="e.g. 200000"
              className={cn(
                getFieldError('securityDeposit') && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {getFieldError('securityDeposit') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('securityDeposit')?.message as string}</p>
            )}
          </div>

          {/* Advance Rent */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('advanceRent')}>Advance Rent (months)</RequiredLabel>
            <Input
              id={getFieldId('advanceRent')}
              type="number"
              min={0}
              max={12}
              {...registerField('advanceRent')}
              placeholder="e.g. 2"
              className={cn(
                getFieldError('advanceRent') && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {getFieldError('advanceRent') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('advanceRent')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Third Row - Maintenance and CAM Charges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {COMMERCIAL_MAINTENANCE_OPTIONS.map((option) => (
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

          {/* CAM Charges */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('camCharges')}>CAM Charges (₹/sq ft/month)</RequiredLabel>
            <Input
              id={getFieldId('camCharges')}
              type="text"
              {...registerField('camCharges')}
              placeholder="e.g. 15"
              className={cn(
                getFieldError('camCharges') && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <p className="text-xs text-gray-500">Common Area Maintenance charges</p>
            {getFieldError('camCharges') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('camCharges')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Fourth Row - Available From and Furnishing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {COMMERCIAL_FURNISHING_OPTIONS.map((option) => (
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
        </div>

        {/* Fifth Row - Parking and Operating Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {COMMERCIAL_PARKING_OPTIONS.map((option) => (
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

          {/* Operating Hours */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('operatingHours')}>Operating Hours</RequiredLabel>
            <Select
              value={getFieldValue('operatingHours') || ''}
              onValueChange={(value) => setFieldValue('operatingHours', value)}
            >
              <SelectTrigger 
                id={getFieldId('operatingHours')}
                className={cn(
                  "w-full",
                  getFieldError('operatingHours') && "border-destructive focus-visible:ring-destructive"
                )}
              >
                <SelectValue placeholder="Select Operating Hours" />
              </SelectTrigger>
              <SelectContent>
                {OPERATING_HOURS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError('operatingHours') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('operatingHours')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Business Preferences */}
        <div className="mt-8">
          <RequiredLabel>Preferred Business Types</RequiredLabel>
          <p className="text-sm text-gray-600 mb-3">Select the types of businesses you prefer as tenants</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
            {COMMERCIAL_BUSINESS_PREFERENCES.map((business) => (
              <div key={business} className="flex items-start space-x-2">
                <Checkbox
                  id={getFieldId(`businessPref-${business}`)}
                  checked={(getFieldValue('businessPreferences') || []).includes(business)}
                  onCheckedChange={(checked) => {
                    const currentPreferences = getFieldValue('businessPreferences') || [];
                    if (checked) {
                      setFieldValue('businessPreferences', [...currentPreferences, business]);
                    } else {
                      setFieldValue(
                        'businessPreferences',
                        currentPreferences.filter((item) => item !== business)
                      );
                    }
                  }}
                />
                <label
                  htmlFor={getFieldId(`businessPref-${business}`)}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {business}
                </label>
              </div>
            ))}
          </div>
          {getFieldError('businessPreferences') && (
            <p className="text-sm text-destructive mt-2">{getFieldError('businessPreferences')?.message as string}</p>
          )}
        </div>

        {/* Commercial Terms */}
        <div className="mt-8">
          <h3 className="text-base font-medium mb-3">Commercial Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lock-in Period */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id={getFieldId('hasLockInPeriod')}
                  checked={hasLockInPeriod || false}
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
              
              {hasLockInPeriod && (
                <div className="ml-6">
                  <Select
                    value={getFieldValue('lockInPeriod') || ''}
                    onValueChange={(value) => setFieldValue('lockInPeriod', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Lock-in Period" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEASE_TERMS.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Utilities Included */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id={getFieldId('includesUtilities')}
                checked={includesUtilities || false}
                onCheckedChange={(checked) => setFieldValue('includesUtilities', !!checked)}
              />
              <div>
                <label
                  htmlFor={getFieldId('includesUtilities')}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Utilities Included
                </label>
                <p className="text-xs text-gray-500 mt-1">Electricity, water, internet included in rent</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CommercialRentalDetails;