// src/modules/owner/components/property/wizard/sections/CoworkingDetails.tsx
// Version: 2.1.0
// Last Modified: 03-06-2025 16:50 IST
// Purpose: Fixed mandatory field marking - added required prop to all RequiredLabel components

import React, { useEffect, useCallback } from 'react';
import { FormSection } from '@/components/FormSection';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormSectionProps } from '../types';
import { useStepForm } from '../hooks/useStepForm';
import { useStepValidation } from '../hooks/useStepValidation';
import { 
  COWORKING_PRICING_STRUCTURES,
  COWORKING_LEASE_TERMS,
  COWORKING_BOOKING_OPTIONS,
  COWORKING_INTERNET_SPEEDS,
  COWORKING_AMENITIES
} from '../constants/coworkingDetails';
import { cn } from '@/lib/utils';

const CoworkingDetails: React.FC<FormSectionProps> = ({ 
  form,
  adType,
  stepId = 'com_cow_coworking_details' // Default step ID for coworking details
}) => {
  const { 
    registerField, 
    getFieldError, 
    setFieldValue, 
    getFieldValue,
    getFieldId
  } = useStepForm(form, stepId);

  // ✅ ADDED: Initialize validation system
  const flowType = form.getValues('flow.flowType') || 'commercial_coworking';
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
    flowType,
    currentStepId: stepId
  });
  
  // Migrate data from root to step object if needed
  useEffect(() => {
    const fieldsToMigrate = [
      'coworkingSpaceType', 'totalCapacity', 'availableCapacity', 'pricingStructure',
      'basePrice', 'leaseTerm', 'securityDeposit', 'bookingOption', 'openingTime',
      'closingTime', 'operatingHours', 'accessPolicy', 'operatingDays',
      'internetSpeed', 'coworkingAmenities', 'additionalInformation',
      'officeSize', 'seatingCapacity'
    ];
    
    // Check each field and migrate if needed
    fieldsToMigrate.forEach(field => {
      const currentValue = getFieldValue(field);
      const rootValue = form.getValues(field);
      
      // If there's a value at the root but not in the step, migrate it
      if (rootValue !== undefined && currentValue === undefined) {
        setFieldValue(field, rootValue);
      }
    });
    
    // Handle calculation of operating hours as a composite field
    const openingTime = getFieldValue('openingTime') || form.getValues('openingTime');
    const closingTime = getFieldValue('closingTime') || form.getValues('closingTime');
    
    if (openingTime && closingTime) {
      const operatingHours = `${openingTime} - ${closingTime}`;
      setFieldValue('operatingHours', operatingHours);
    }
  }, []);

  // ✅ ADDED: Enhanced field update with validation
  const updateFormAndState = useCallback((field: string, value: any) => {
    setFieldValue(field, value);
    
    // Mark field as touched and validate
    markFieldAsTouched(field);
    validateField(field);
  }, [setFieldValue, markFieldAsTouched, validateField]);
  
  // Update operating hours when opening or closing time changes
  const handleTimeChange = () => {
    const openingTime = getFieldValue('openingTime');
    const closingTime = getFieldValue('closingTime');
    
    if (openingTime && closingTime) {
      const operatingHours = `${openingTime} - ${closingTime}`;
      setFieldValue('operatingHours', operatingHours);
    }
  };
  
  return (
    <FormSection
      title="Co-working Space Details"
      description="Provide specific details about your co-working space"
    >
      {/* ✅ ADDED: Progress indicator */}
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

      <div className="space-y-6">
        {/* Space Type - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('coworkingSpaceType')} className="mb-2 block" required>
            Co-working Space Type
          </RequiredLabel>
          <select
            id={getFieldId('coworkingSpaceType')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('coworkingSpaceType')}
            onChange={(e) => updateFormAndState('coworkingSpaceType', e.target.value)}
          >
            <option value="">Select space type</option>
            <option value="Hot Desk">Hot Desk</option>
            <option value="Dedicated Desk">Dedicated Desk</option>
            <option value="Private Office">Private Office</option>
            <option value="Meeting Room">Meeting Room</option>
            <option value="Event Space">Event Space</option>
          </select>
          {getFieldError('coworkingSpaceType') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('coworkingSpaceType')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('coworkingSpaceType') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('coworkingSpaceType').error}
            </p>
          )}
        </div>
        
        {/* Capacity - ✅ FIXED: Added required prop to both fields */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('totalCapacity')} className="mb-2 block" required>
              Total Capacity
            </RequiredLabel>
            <Input
              id={getFieldId('totalCapacity')}
              type="number"
              placeholder="e.g., 50"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('totalCapacity')}
              onChange={(e) => updateFormAndState('totalCapacity', parseInt(e.target.value) || 0)}
            />
            {getFieldError('totalCapacity') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('totalCapacity')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('totalCapacity') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('totalCapacity').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('availableCapacity')} className="mb-2 block" required>
              Available Capacity
            </RequiredLabel>
            <Input
              id={getFieldId('availableCapacity')}
              type="number"
              placeholder="e.g., 20"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('availableCapacity')}
              onChange={(e) => updateFormAndState('availableCapacity', parseInt(e.target.value) || 0)}
            />
            {getFieldError('availableCapacity') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('availableCapacity')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('availableCapacity') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('availableCapacity').error}
              </p>
            )}
          </div>
        </div>
        
        {/* Pricing Structure - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('pricingStructure')} className="mb-2 block" required>
            Pricing Structure
          </RequiredLabel>
          <select
            id={getFieldId('pricingStructure')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('pricingStructure')}
            onChange={(e) => updateFormAndState('pricingStructure', e.target.value)}
          >
            <option value="">Select pricing structure</option>
            {COWORKING_PRICING_STRUCTURES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('pricingStructure') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('pricingStructure')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('pricingStructure') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('pricingStructure').error}
            </p>
          )}
        </div>
        
        {/* Base Price - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('basePrice')} className="mb-2 block" required>
            Base Price (₹)
          </RequiredLabel>
          <Input
            id={getFieldId('basePrice')}
            type="number"
            placeholder="e.g., 5000"
            className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
            {...registerField('basePrice')}
            onChange={(e) => updateFormAndState('basePrice', parseFloat(e.target.value) || 0)}
          />
          {getFieldError('basePrice') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('basePrice')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('basePrice') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('basePrice').error}
            </p>
          )}
        </div>
        
        {/* Lease Term - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('leaseTerm')} className="mb-2 block" required>
            Lease Term
          </RequiredLabel>
          <select
            id={getFieldId('leaseTerm')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('leaseTerm')}
            onChange={(e) => updateFormAndState('leaseTerm', e.target.value)}
          >
            <option value="">Select lease term</option>
            {COWORKING_LEASE_TERMS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('leaseTerm') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('leaseTerm')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('leaseTerm') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('leaseTerm').error}
            </p>
          )}
        </div>
        
        {/* Security Deposit - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('securityDeposit')} className="mb-2 block" required>
            Security Deposit (₹)
          </RequiredLabel>
          <Input
            id={getFieldId('securityDeposit')}
            type="number"
            placeholder="e.g., 10000"
            className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
            {...registerField('securityDeposit')}
            onChange={(e) => updateFormAndState('securityDeposit', parseFloat(e.target.value) || 0)}
          />
          {getFieldError('securityDeposit') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('securityDeposit')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('securityDeposit') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('securityDeposit').error}
            </p>
          )}
        </div>
        
        {/* Booking Option - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('bookingOption')} className="mb-2 block" required>
            Booking Option
          </RequiredLabel>
          <select
            id={getFieldId('bookingOption')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('bookingOption')}
            onChange={(e) => updateFormAndState('bookingOption', e.target.value)}
          >
            <option value="">Select booking option</option>
            {COWORKING_BOOKING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('bookingOption') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('bookingOption')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('bookingOption') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('bookingOption').error}
            </p>
          )}
        </div>
        
        {/* Operating Hours - ✅ FIXED: Added required prop to both fields */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('openingTime')} className="mb-2 block" required>
              Opening Time
            </RequiredLabel>
            <Input
              id={getFieldId('openingTime')}
              type="time"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('openingTime')}
              onChange={(e) => {
                form.setValue(`steps.${stepId}.openingTime`, e.target.value);
                handleTimeChange();
                updateFormAndState('openingTime', e.target.value);
              }}
            />
            {getFieldError('openingTime') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('openingTime')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('openingTime') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('openingTime').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('closingTime')} className="mb-2 block" required>
              Closing Time
            </RequiredLabel>
            <Input
              id={getFieldId('closingTime')}
              type="time"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('closingTime')}
              onChange={(e) => {
                form.setValue(`steps.${stepId}.closingTime`, e.target.value);
                handleTimeChange();
                updateFormAndState('closingTime', e.target.value);
              }}
            />
            {getFieldError('closingTime') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('closingTime')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('closingTime') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('closingTime').error}
              </p>
            )}
          </div>
          
          {/* Hidden field to store combined operating hours */}
          <input type="hidden" {...registerField('operatingHours')} />
        </div>
        
        {/* Operating Days - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel className="mb-2 block" required>Operating Days</RequiredLabel>
          <div className="flex flex-wrap gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <label 
                key={day} 
                className="flex items-center space-x-2 border border-border rounded-lg px-3 py-2"
              >
                <input 
                  type="checkbox" 
                  value={day} 
                  id={getFieldId(`operatingDays-${day}`)}
                  {...registerField('operatingDays')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={(e) => {
                    const currentDays = getFieldValue('operatingDays') || [];
                    const newDays = e.target.checked 
                      ? [...currentDays, day]
                      : currentDays.filter((d: string) => d !== day);
                    updateFormAndState('operatingDays', newDays);
                  }}
                />
                <span>{day}</span>
              </label>
            ))}
          </div>
          {getFieldError('operatingDays') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('operatingDays')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('operatingDays') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('operatingDays').error}
            </p>
          )}
        </div>
        
        {/* Internet Speed - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel htmlFor={getFieldId('internetSpeed')} className="mb-2 block" required>
            Internet Speed
          </RequiredLabel>
          <select
            id={getFieldId('internetSpeed')}
            className="w-full h-12 px-4 py-2 rounded-xl border border-border bg-background"
            {...registerField('internetSpeed')}
            onChange={(e) => updateFormAndState('internetSpeed', e.target.value)}
          >
            <option value="">Select internet speed</option>
            {COWORKING_INTERNET_SPEEDS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {getFieldError('internetSpeed') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('internetSpeed')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('internetSpeed') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('internetSpeed').error}
            </p>
          )}
        </div>
        
        {/* Coworking Amenities - ✅ FIXED: Added required prop */}
        <div className="mb-6">
          <RequiredLabel className="mb-2 block" required>Amenities</RequiredLabel>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {COWORKING_AMENITIES.map((amenity) => (
              <label 
                key={amenity} 
                className="flex items-center space-x-2 border border-border rounded-lg px-3 py-2"
              >
                <input 
                  type="checkbox" 
                  value={amenity}
                  id={getFieldId(`coworkingAmenities-${cn(amenity.replace(/\s+/g, '-').toLowerCase())}`)} 
                  {...registerField('coworkingAmenities')}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                  onChange={(e) => {
                    const currentAmenities = getFieldValue('coworkingAmenities') || [];
                    const newAmenities = e.target.checked 
                      ? [...currentAmenities, amenity]
                      : currentAmenities.filter((a: string) => a !== amenity);
                    updateFormAndState('coworkingAmenities', newAmenities);
                  }}
                />
                <span>{amenity}</span>
              </label>
            ))}
          </div>
          {getFieldError('coworkingAmenities') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('coworkingAmenities')?.message as string}</p>
          )}
          {/* ✅ ADDED: Validation error display */}
          {shouldShowFieldError('coworkingAmenities') && (
            <p className="text-sm text-red-600 mt-0.5">
              {getFieldValidation('coworkingAmenities').error}
            </p>
          )}
        </div>
        
        {/* Additional Information - ✅ KEPT: Optional field, no required prop */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={getFieldId('additionalInformation')} className="text-sm font-medium text-foreground">
              Additional Information
            </label>
            <div className="text-xs text-muted-foreground italic">Optional</div>
          </div>
          <Textarea
            id={getFieldId('additionalInformation')}
            placeholder="Any additional information about your co-working space..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background min-h-24"
            {...registerField('additionalInformation')}
            onChange={(e) => updateFormAndState('additionalInformation', e.target.value)}
          />
          {getFieldError('additionalInformation') && (
            <p className="text-sm text-destructive mt-1">{getFieldError('additionalInformation')?.message as string}</p>
          )}
        </div>
        
        {/* Office Size and Seating Capacity - ✅ FIXED: Added required prop to both fields */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <RequiredLabel htmlFor={getFieldId('officeSize')} className="mb-2 block" required>
              Office Size (sqft)
            </RequiredLabel>
            <Input
              id={getFieldId('officeSize')}
              type="number"
              placeholder="e.g., 500"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('officeSize')}
              onChange={(e) => updateFormAndState('officeSize', parseFloat(e.target.value) || 0)}
            />
            {getFieldError('officeSize') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('officeSize')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('officeSize') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('officeSize').error}
              </p>
            )}
          </div>
          
          <div>
            <RequiredLabel htmlFor={getFieldId('seatingCapacity')} className="mb-2 block" required>
              Seating Capacity
            </RequiredLabel>
            <Input
              id={getFieldId('seatingCapacity')}
              type="number"
              placeholder="e.g., 20"
              className="h-12 px-4 py-2 rounded-xl border border-border bg-background w-full"
              {...registerField('seatingCapacity')}
              onChange={(e) => updateFormAndState('seatingCapacity', parseInt(e.target.value) || 0)}
            />
            {getFieldError('seatingCapacity') && (
              <p className="text-sm text-destructive mt-1">{getFieldError('seatingCapacity')?.message as string}</p>
            )}
            {/* ✅ ADDED: Validation error display */}
            {shouldShowFieldError('seatingCapacity') && (
              <p className="text-sm text-red-600 mt-0.5">
                {getFieldValidation('seatingCapacity').error}
              </p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default CoworkingDetails;