// src/modules/owner/components/property/wizard/sections/CommercialDetails.tsx
// Version: 2.0.0
// Last Modified: 30-05-2025 17:45 IST
// Purpose: Added step completion validation system integration

import React, { useCallback, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { FormSectionProps } from '../../types';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useStepValidation } from '../hooks/useStepValidation';
import { cn } from '@/lib/utils';
import { 
  COMMERCIAL_PROPERTY_TYPES,
  COMMERCIAL_FURNISHING_OPTIONS,
  COMMERCIAL_MAINTENANCE_OPTIONS,
  LEASE_DURATION_OPTIONS,
  COMMERCIAL_AMENITIES
} from '../constants/commercialDetails';

// Commercial Details section component for the property form
export function CommercialDetails({ form, mode = 'create', adType, stepId = 'com_rent_basic_details' }: FormSectionProps) {
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

  // Get form methods
  const { register, formState: { errors }, watch, setValue } = form;
  
  // ✅ ADDED: Custom field save with validation
  const saveField = useCallback((fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    console.log(`Saving field ${fieldName} at path ${path}:`, value);
    form.setValue(path, value, { shouldValidate: true });
    setValue(fieldName, value); // Also set at root level for backward compatibility
    
    // Mark field as touched and validate
    markFieldAsTouched(fieldName);
    validateField(fieldName);
  }, [form, stepId, setValue, markFieldAsTouched, validateField]);

  const getField = useCallback((fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    const stepValue = form.getValues(path);
    if (stepValue !== undefined) return stepValue;
    
    // Fallback to root level
    const rootValue = form.getValues(fieldName);
    return rootValue !== undefined ? rootValue : defaultValue;
  }, [form, stepId]);

  // ✅ ADDED: Ensure step structure exists
  useEffect(() => {
    const currentSteps = form.getValues('steps') || {};
    if (!currentSteps[stepId]) {
      form.setValue('steps', {
        ...currentSteps,
        [stepId]: {}
      });
    }
  }, [stepId, form]);
  
  // Watch for changes to determine conditional fields
  const rentNegotiable = watch('rentNegotiable');
  const commercialPropertyType = watch('commercialPropertyType');
  const furnishingStatus = watch('furnishing');
  
  // ✅ ADDED: Handle checkbox changes with validation
  const handleCheckboxChange = (field: string) => (checked: boolean) => {
    saveField(field, checked);
  };

  // ✅ ADDED: Handle input changes with validation
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    saveField(field, e.target.value);
  };

  // ✅ ADDED: Handle select changes with validation
  const handleSelectChange = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    saveField(field, e.target.value);
  };

  return (
    <FormSection 
      title="Commercial Property Details" 
      description="Enter details specific to your commercial property"
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

      <div className="space-y-8">
        {/* Property Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="commercialPropertyType">Commercial Property Type</RequiredLabel>
            <Select
              id="commercialPropertyType"
              {...register('commercialPropertyType')}
              error={errors.commercialPropertyType?.message}
              onChange={handleSelectChange('commercialPropertyType')}
            >
              <option value="">Select Property Type</option>
              {COMMERCIAL_PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('commercialPropertyType') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('commercialPropertyType').error}
              </p>
            )}
            {errors.commercialPropertyType && (
              <p className="text-xs text-destructive mt-1">
                {errors.commercialPropertyType.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="builtUpArea">Built-up Area</RequiredLabel>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  id="builtUpArea"
                  type="text"
                  placeholder="e.g. 1200"
                  {...register('builtUpArea')}
                  error={errors.builtUpArea?.message}
                  onChange={handleInputChange('builtUpArea')}
                />
              </div>
              <div className="w-32">
                <Select
                  id="builtUpAreaUnit"
                  {...register('builtUpAreaUnit')}
                  error={errors.builtUpAreaUnit?.message}
                  onChange={handleSelectChange('builtUpAreaUnit')}
                >
                  <option value="sqft">sq ft</option>
                  <option value="sqyd">sq yard</option>
                </Select>
              </div>
            </div>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('builtUpArea') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('builtUpArea').error}
              </p>
            )}
            {errors.builtUpArea && (
              <p className="text-xs text-destructive mt-1">
                {errors.builtUpArea.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Rental Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="rentAmount">Monthly Rent (₹)</RequiredLabel>
            <Input
              id="rentAmount"
              type="text"
              placeholder="e.g. 25000"
              {...register('rentAmount')}
              error={errors.rentAmount?.message}
              onChange={handleInputChange('rentAmount')}
            />
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('rentAmount') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('rentAmount').error}
              </p>
            )}
            {errors.rentAmount && (
              <p className="text-xs text-destructive mt-1">
                {errors.rentAmount.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="securityDeposit">Security Deposit (₹)</RequiredLabel>
            <Input
              id="securityDeposit"
              type="text"
              placeholder="e.g. 100000"
              {...register('securityDeposit')}
              error={errors.securityDeposit?.message}
              onChange={handleInputChange('securityDeposit')}
            />
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('securityDeposit') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('securityDeposit').error}
              </p>
            )}
            {errors.securityDeposit && (
              <p className="text-xs text-destructive mt-1">
                {errors.securityDeposit.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Rent Negotiable */}
        <div className="flex items-start space-x-2">
          <Checkbox
            id="rentNegotiable"
            checked={rentNegotiable}
            onCheckedChange={handleCheckboxChange('rentNegotiable')}
          />
          <label
            htmlFor="rentNegotiable"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Rent is negotiable
          </label>
        </div>

        {/* Lease & Maintenance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <RequiredLabel htmlFor="leaseDuration">Lease Duration</RequiredLabel>
            <Select
              id="leaseDuration"
              {...register('leaseDuration')}
              error={errors.leaseDuration?.message}
              onChange={handleSelectChange('leaseDuration')}
            >
              <option value="">Select Lease Duration</option>
              {LEASE_DURATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('leaseDuration') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('leaseDuration').error}
              </p>
            )}
            {errors.leaseDuration && (
              <p className="text-xs text-destructive mt-1">
                {errors.leaseDuration.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <RequiredLabel htmlFor="maintenance">Maintenance</RequiredLabel>
            <Select
              id="maintenance"
              {...register('maintenance')}
              error={errors.maintenance?.message}
              onChange={handleSelectChange('maintenance')}
            >
              <option value="">Select Maintenance</option>
              {COMMERCIAL_MAINTENANCE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            {/* ✅ ADDED: Error message display */}
            {shouldShowFieldError('maintenance') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('maintenance').error}
              </p>
            )}
            {errors.maintenance && (
              <p className="text-xs text-destructive mt-1">
                {errors.maintenance.message as string}
              </p>
            )}
          </div>
        </div>

        {/* Furnishing Status */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="furnishing">Furnishing Status</RequiredLabel>
          <Select
            id="furnishing"
            {...register('furnishing')}
            error={errors.furnishing?.message}
            onChange={handleSelectChange('furnishing')}
          >
            <option value="">Select Furnishing Status</option>
            {COMMERCIAL_FURNISHING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          {/* ✅ ADDED: Error message display */}
          {shouldShowFieldError('furnishing') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('furnishing').error}
            </p>
          )}
          {errors.furnishing && (
            <p className="text-xs text-destructive mt-1">
              {errors.furnishing.message as string}
            </p>
          )}
        </div>

        {/* Parking */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="parking">Parking</RequiredLabel>
          <Select
            id="parking"
            {...register('parking')}
            error={errors.parking?.message}
            onChange={handleSelectChange('parking')}
          >
            <option value="">Select Parking Option</option>
            <option value="Reserved">Reserved Parking</option>
            <option value="Shared">Shared Parking</option>
            <option value="None">No Parking</option>
          </Select>
          {/* ✅ ADDED: Error message display */}
          {shouldShowFieldError('parking') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('parking').error}
            </p>
          )}
          {errors.parking && (
            <p className="text-xs text-destructive mt-1">
              {errors.parking.message as string}
            </p>
          )}
        </div>

        {/* Power Backup */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="powerBackup">Power Backup</RequiredLabel>
          <Select
            id="powerBackup"
            {...register('powerBackup')}
            error={errors.powerBackup?.message}
            onChange={handleSelectChange('powerBackup')}
          >
            <option value="">Select Power Backup</option>
            <option value="Full">Full Backup</option>
            <option value="Partial">Partial Backup</option>
            <option value="None">No Backup</option>
          </Select>
          {/* ✅ ADDED: Error message display */}
          {shouldShowFieldError('powerBackup') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('powerBackup').error}
            </p>
          )}
          {errors.powerBackup && (
            <p className="text-xs text-destructive mt-1">
              {errors.powerBackup.message as string}
            </p>
          )}
        </div>

        {/* Lock-in Period */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="lockInPeriod">Lock-in Period (months)</RequiredLabel>
          <Input
            id="lockInPeriod"
            type="number"
            placeholder="e.g. 12"
            {...register('lockInPeriod')}
            error={errors.lockInPeriod?.message}
            onChange={handleInputChange('lockInPeriod')}
          />
          {/* ✅ ADDED: Error message display */}
          {shouldShowFieldError('lockInPeriod') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('lockInPeriod').error}
            </p>
          )}
          {errors.lockInPeriod && (
            <p className="text-xs text-destructive mt-1">
              {errors.lockInPeriod.message as string}
            </p>
          )}
        </div>

        {/* Available From */}
        <div className="space-y-2">
          <RequiredLabel htmlFor="availableFrom">Available From</RequiredLabel>
          <Input
            id="availableFrom"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register('availableFrom')}
            error={errors.availableFrom?.message}
            onChange={handleInputChange('availableFrom')}
          />
          {/* ✅ ADDED: Error message display */}
          {shouldShowFieldError('availableFrom') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('availableFrom').error}
            </p>
          )}
          {errors.availableFrom && (
            <p className="text-xs text-destructive mt-1">
              {errors.availableFrom.message as string}
            </p>
          )}
        </div>

        {/* Fire Safety & Other Features */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="fireSafety"
              {...register('fireSafety')}
              onCheckedChange={handleCheckboxChange('fireSafety')}
            />
            <label
              htmlFor="fireSafety"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Fire safety measures installed
            </label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="centralizedAC"
              {...register('centralizedAC')}
              onCheckedChange={handleCheckboxChange('centralizedAC')}
            />
            <label
              htmlFor="centralizedAC"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Centralized Air Conditioning
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description (Optional)
          </label>
          <textarea
            id="description"
            className={cn(
              "flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              errors.description && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder="Describe your commercial property in detail..."
            {...register('description')}
            onChange={(e) => saveField('description', e.target.value)}
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">
              {errors.description.message as string}
            </p>
          )}
        </div>
      </div>
    </FormSection>
  );
}

export default CommercialDetails;