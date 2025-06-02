// src/modules/owner/components/property/wizard/sections/CommercialRentalDetails.tsx
// Version: 2.1.0
// Last Modified: 02-06-2025 16:50 IST
// Purpose: Added mandatory field markers and advance rent validation (max 12 months)

import React, { useEffect } from 'react';
import { FormData, FormSectionProps } from '../types';
import { 
  COMMERCIAL_RENTAL_TYPES,
  COMMERCIAL_MAINTENANCE_OPTIONS,
  COMMERCIAL_BUSINESS_PREFERENCES,
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
import { useStepValidation } from '../hooks/useStepValidation';
import { cn } from '@/lib/utils';
import { useStepForm } from '../hooks/useStepForm';

export const CommercialRentalDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType,
  stepId = 'com_rent_rental' // Commercial rent rental step ID
}) => {
  const isEditMode = mode === 'edit';
  
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
    flowType: 'commercial_rent',
    currentStepId: stepId
  });
  
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
  
  // ✅ ADDED: Update form and state with validation
  const updateFormAndState = (field: string, value: any) => {
    setFieldValue(field, value);
    markFieldAsTouched(field);
    validateField(field);
  };
  
  // Migrate existing data from root to step object on component mount (removed furnishing)
  useEffect(() => {
    const fieldsToMigrate = [
      'rentalType', 'rentAmount', 'rentNegotiable', 'securityDeposit', 
      'availableFrom', 'maintenance', 'parking', 
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
  const advanceRent = watchField('advanceRent');

  // ✅ NEW: Advance rent validation
  const handleAdvanceRentChange = (value: string) => {
    const numValue = parseInt(value);
    if (value === '' || (numValue >= 0 && numValue <= 12)) {
      updateFormAndState('advanceRent', value);
    }
  };

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
      {/* ✅ ADDED: Progress indicator */}
      {requiredFields.length > 0 && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Step Completion: {completionPercentage}%
            </span>
            <span className="text-xs text-blue-700">
              {stepIsValid ? '✓ Ready to proceed' : 'Please complete required fields'}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        
        {/* First Row - Rental Type and Rent Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rental Type - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('rentalType')} required>Rental Type</RequiredLabel>
            <Select
              value={getFieldValue('rentalType') || 'rent'}
              onValueChange={(value) => updateFormAndState('rentalType', value as 'rent' | 'lease')}
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
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('rentalType') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('rentalType').error}
              </p>
            )}
            {getFieldError('rentalType') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('rentalType')?.message as string}</p>
            )}
          </div>

          {/* Rent Amount - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('rentAmount')} required>
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
                onChange={(e) => updateFormAndState('rentAmount', e.target.value)}
              />
              <div className="absolute right-3 top-2.5">
                <Checkbox
                  id={getFieldId('rentNegotiable')}
                  checked={rentNegotiable}
                  onCheckedChange={(checked) => updateFormAndState('rentNegotiable', !!checked)}
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
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('rentAmount') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('rentAmount').error}
              </p>
            )}
            {getFieldError('rentAmount') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('rentAmount')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Second Row - Security Deposit and Advance Rent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Deposit - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('securityDeposit')} required>Security Deposit (₹)</RequiredLabel>
            <Input
              id={getFieldId('securityDeposit')}
              type="text"
              {...registerField('securityDeposit')}
              placeholder="e.g. 200000"
              className={cn(
                getFieldError('securityDeposit') && "border-destructive focus-visible:ring-destructive"
              )}
              onChange={(e) => updateFormAndState('securityDeposit', e.target.value)}
            />
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('securityDeposit') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('securityDeposit').error}
              </p>
            )}
            {getFieldError('securityDeposit') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('securityDeposit')?.message as string}</p>
            )}
          </div>

          {/* Advance Rent - MANDATORY with 12 month limit */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('advanceRent')} required>Advance Rent (months)</RequiredLabel>
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
              value={advanceRent || ''}
              onChange={(e) => handleAdvanceRentChange(e.target.value)}
            />
            <p className="text-xs text-gray-500">Maximum 12 months allowed</p>
            {/* ✅ NEW: Show validation error for advance rent limit */}
            {advanceRent && parseInt(advanceRent) > 12 && (
              <p className="text-sm text-red-600 mt-0.5">
                Advance rent cannot exceed 12 months
              </p>
            )}
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('advanceRent') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('advanceRent').error}
              </p>
            )}
            {getFieldError('advanceRent') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('advanceRent')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Third Row - Maintenance and CAM Charges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('maintenance')} required>Maintenance</RequiredLabel>
            <Select
              value={getFieldValue('maintenance') || ''}
              onValueChange={(value) => updateFormAndState('maintenance', value)}
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
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('maintenance') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('maintenance').error}
              </p>
            )}
            {getFieldError('maintenance') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('maintenance')?.message as string}</p>
            )}
          </div>

          {/* CAM Charges - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('camCharges')} required>CAM Charges (₹/sq ft/month)</RequiredLabel>
            <Input
              id={getFieldId('camCharges')}
              type="text"
              {...registerField('camCharges')}
              placeholder="e.g. 15"
              className={cn(
                getFieldError('camCharges') && "border-destructive focus-visible:ring-destructive"
              )}
              onChange={(e) => updateFormAndState('camCharges', e.target.value)}
            />
            <p className="text-xs text-gray-500">Common Area Maintenance charges</p>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('camCharges') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('camCharges').error}
              </p>
            )}
            {getFieldError('camCharges') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('camCharges')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Fourth Row - Available From and Parking (removed furnishing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available From - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('availableFrom')} required>Available From</RequiredLabel>
            <Input
              id={getFieldId('availableFrom')}
              type="date"
              {...registerField('availableFrom')}
              className={cn(
                getFieldError('availableFrom') && "border-destructive focus-visible:ring-destructive"
              )}
              onChange={(e) => updateFormAndState('availableFrom', e.target.value)}
            />
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('availableFrom') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('availableFrom').error}
              </p>
            )}
            {getFieldError('availableFrom') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('availableFrom')?.message as string}</p>
            )}
          </div>

          {/* Parking - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('parking')} required>Parking</RequiredLabel>
            <Select
              value={getFieldValue('parking') || ''}
              onValueChange={(value) => updateFormAndState('parking', value)}
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
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('parking') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('parking').error}
              </p>
            )}
            {getFieldError('parking') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('parking')?.message as string}</p>
            )}
          </div>
        </div>

        {/* Fifth Row - Operating Hours (single column since furnishing was removed) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Operating Hours - MANDATORY */}
          <div className="space-y-2">
            <RequiredLabel htmlFor={getFieldId('operatingHours')} required>Operating Hours</RequiredLabel>
            <Select
              value={getFieldValue('operatingHours') || ''}
              onValueChange={(value) => updateFormAndState('operatingHours', value)}
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
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('operatingHours') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('operatingHours').error}
              </p>
            )}
            {getFieldError('operatingHours') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('operatingHours')?.message as string}</p>
            )}
          </div>

          {/* Empty column to maintain layout */}
          <div className="invisible">
            {/* Empty placeholder */}
          </div>
        </div>

        {/* Business Preferences - MANDATORY (at least 1) */}
        <div className="mt-8">
          <RequiredLabel required>Preferred Business Types (at least 1)</RequiredLabel>
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
                      updateFormAndState('businessPreferences', [...currentPreferences, business]);
                    } else {
                      updateFormAndState(
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
          {/* ✅ NEW: Show validation error if no business preferences selected */}
          {(!getFieldValue('businessPreferences') || getFieldValue('businessPreferences').length === 0) && (
            <p className="text-sm text-red-600 mt-2">
              Please select at least one preferred business type
            </p>
          )}
          {/* ✅ ADDED: Error message display */}
          {shouldShowFieldError('businessPreferences') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('businessPreferences').error}
            </p>
          )}
          {getFieldError('businessPreferences') && (
            <p className="text-sm text-destructive mt-2">{getFieldError('businessPreferences')?.message as string}</p>
          )}
        </div>

        {/* Commercial Terms - OPTIONAL */}
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
                    updateFormAndState('hasLockInPeriod', !!checked);
                    if (!checked) {
                      updateFormAndState('lockInPeriod', '');
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
                    onValueChange={(value) => updateFormAndState('lockInPeriod', value)}
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
                onCheckedChange={(checked) => updateFormAndState('includesUtilities', !!checked)}
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
          {/* ✅ REMOVED: Validation error for commercial terms since it's not mandatory */}
        </div>
      </div>
    </FormSection>
  );
};

export default CommercialRentalDetails;