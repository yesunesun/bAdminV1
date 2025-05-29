// src/modules/owner/components/property/wizard/sections/RentalDetails.tsx
// Version: 3.0.0
// Last Modified: 29-05-2025 18:30 IST
// Purpose: Enhanced with comprehensive field validation system for rental details

import React, { useEffect, useState } from 'react';
import { FormData, FormSectionProps } from '../types';
import { 
  RENTAL_TYPES, 
  MAINTENANCE_OPTIONS,
  TENANT_PREFERENCES,
  FURNISHING_OPTIONS,
  PARKING_OPTIONS 
} from '../constants';
import { FormSection } from '@/components/FormSection';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { FormFieldLabel } from '@/components/ui/RequiredLabel';
import { Checkbox } from '@/components/ui/checkbox';
import { useStepValidation } from '../hooks/useStepValidation';
import { cn } from '@/lib/utils';

export const RentalDetails: React.FC<FormSectionProps> = ({ 
  form,
  mode = 'create',
  adType,
  stepId = 'res_rent_rental'
}) => {
  const isEditMode = mode === 'edit';
  
  // Initialize validation system
  const {
    validateField,
    getFieldValidation,
    getFieldConfig,
    shouldShowFieldError,
    markFieldAsTouched,
    validateCurrentStep,
    isValid: stepIsValid,
    completionPercentage,
    requiredFields
  } = useStepValidation({
    form,
    flowType: 'residential_rent',
    currentStepId: stepId
  });

  // Helper functions for form data management
  const getField = (fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    const stepValue = form.getValues(path);
    if (stepValue !== undefined) return stepValue;
    
    // Fallback to root level
    const rootValue = form.getValues(fieldName);
    return rootValue !== undefined ? rootValue : defaultValue;
  };
  
  const saveField = (fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    
    // Ensure steps structure exists
    const steps = form.getValues('steps') || {};
    if (!steps[stepId]) {
      form.setValue('steps', {
        ...steps,
        [stepId]: {}
      }, { shouldValidate: false });
    }
    
    // Set value in step structure
    form.setValue(path, value, { shouldValidate: true });
    
    // Trigger field validation
    validateField(fieldName);
  };

  // State for form values
  const [values, setValues] = useState({
    rentAmount: getField('rentAmount', ''),
    rentNegotiable: getField('rentNegotiable', false),
    securityDeposit: getField('securityDeposit', ''),
    maintenanceCharges: getField('maintenanceCharges', ''),
    availableFrom: getField('availableFrom', ''),
    furnishingStatus: getField('furnishingStatus', ''),
    preferredTenants: getField('preferredTenants', []),
    nonVegAllowed: getField('nonVegAllowed', false),
    petsAllowed: getField('petsAllowed', false),
    hasLockInPeriod: getField('hasLockInPeriod', false),
    lockInPeriod: getField('lockInPeriod', '')
  });

  // Migrate existing data from root to step object
  useEffect(() => {
    const fieldsToMigrate = [
      'rentAmount', 'rentNegotiable', 'securityDeposit', 'maintenanceCharges',
      'availableFrom', 'furnishingStatus', 'preferredTenants', 
      'nonVegAllowed', 'petsAllowed', 'hasLockInPeriod', 'lockInPeriod'
    ];
    
    fieldsToMigrate.forEach(field => {
      const rootValue = form.getValues(field);
      const stepValue = form.getValues(`steps.${stepId}.${field}`);
      
      if (rootValue !== undefined && stepValue === undefined) {
        saveField(field, rootValue);
      }
    });
    
    // Update component state
    updateStateFromForm();
  }, []);

  // Update component state from form values
  const updateStateFromForm = () => {
    const stepData = form.getValues(`steps.${stepId}`) || {};
    const formValues = form.getValues();
    
    setValues({
      rentAmount: stepData.rentAmount || formValues.rentAmount || '',
      rentNegotiable: stepData.rentNegotiable || formValues.rentNegotiable || false,
      securityDeposit: stepData.securityDeposit || formValues.securityDeposit || '',
      maintenanceCharges: stepData.maintenanceCharges || formValues.maintenanceCharges || '',
      availableFrom: stepData.availableFrom || formValues.availableFrom || '',
      furnishingStatus: stepData.furnishingStatus || formValues.furnishingStatus || '',
      preferredTenants: stepData.preferredTenants || formValues.preferredTenants || [],
      nonVegAllowed: stepData.nonVegAllowed || formValues.nonVegAllowed || false,
      petsAllowed: stepData.petsAllowed || formValues.petsAllowed || false,
      hasLockInPeriod: stepData.hasLockInPeriod || formValues.hasLockInPeriod || false,
      lockInPeriod: stepData.lockInPeriod || formValues.lockInPeriod || ''
    });
  };

  // Update form and trigger validation
  const updateFormAndState = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    saveField(field, value);
    markFieldAsTouched(field);
  };

  // Handle numeric input for currency fields
  const handleCurrencyInput = (value: string, fieldName: string) => {
    // Remove non-digits and limit to reasonable values
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 8) { // Max 99,999,999
      updateFormAndState(fieldName, numericValue);
    }
  };

  // Prepare select options
  const furnishingOptions = FURNISHING_OPTIONS.map(option => ({ value: option, label: option }));
  const maintenanceOptions = MAINTENANCE_OPTIONS.map(option => ({ value: option, label: option }));

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <FormSection
      title="Rental Details"
      description="Specify your rental terms and preferences"
    >
      {/* Validation Progress */}
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
        {/* Rent Amount and Security Deposit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ValidatedInput
              form={form}
              name="rentAmount"
              label="Monthly Rent Amount"
              type="text"
              inputMode="numeric"
              placeholder="e.g., 15000"
              value={values.rentAmount}
              required={true}
              helperText="Enter monthly rent in ₹"
              error={shouldShowFieldError('rentAmount') ? getFieldValidation('rentAmount').error : null}
              isValid={getFieldValidation('rentAmount').isValid}
              isTouched={getFieldValidation('rentAmount').isTouched}
              onValidation={(field, value) => handleCurrencyInput(value, field)}
              onChange={(e) => handleCurrencyInput(e.target.value, 'rentAmount')}
              size="lg"
            />
            
            {/* Negotiable checkbox */}
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="rentNegotiable"
                checked={values.rentNegotiable}
                onCheckedChange={(checked) => updateFormAndState('rentNegotiable', !!checked)}
              />
              <label
                htmlFor="rentNegotiable"
                className="text-sm font-medium text-gray-700 cursor-pointer"
              >
                Price is negotiable
              </label>
            </div>
          </div>

          <ValidatedInput
            form={form}
            name="securityDeposit"
            label="Security Deposit"
            type="text"
            inputMode="numeric"
            placeholder="e.g., 50000"
            value={values.securityDeposit}
            required={true}
            helperText="Security deposit amount in ₹"
            error={shouldShowFieldError('securityDeposit') ? getFieldValidation('securityDeposit').error : null}
            isValid={getFieldValidation('securityDeposit').isValid}
            isTouched={getFieldValidation('securityDeposit').isTouched}
            onValidation={(field, value) => handleCurrencyInput(value, field)}
            onChange={(e) => handleCurrencyInput(e.target.value, 'securityDeposit')}
            size="lg"
          />
        </div>

        {/* Maintenance and Available From */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValidatedInput
            form={form}
            name="maintenanceCharges"
            label="Maintenance Charges"
            type="text"
            inputMode="numeric"
            placeholder="e.g., 2000 (optional)"
            value={values.maintenanceCharges}
            required={false}
            helperText="Monthly maintenance charges in ₹"
            error={shouldShowFieldError('maintenanceCharges') ? getFieldValidation('maintenanceCharges').error : null}
            isValid={getFieldValidation('maintenanceCharges').isValid}
            isTouched={getFieldValidation('maintenanceCharges').isTouched}
            onValidation={(field, value) => handleCurrencyInput(value, field)}
            onChange={(e) => handleCurrencyInput(e.target.value, 'maintenanceCharges')}
            size="lg"
          />

          <ValidatedInput
            form={form}
            name="availableFrom"
            label="Available From"
            type="date"
            value={values.availableFrom}
            required={true}
            helperText="When will the property be available?"
            error={shouldShowFieldError('availableFrom') ? getFieldValidation('availableFrom').error : null}
            isValid={getFieldValidation('availableFrom').isValid}
            isTouched={getFieldValidation('availableFrom').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onChange={(e) => updateFormAndState('availableFrom', e.target.value)}
            min={today}
            size="lg"
          />
        </div>

        {/* Furnishing Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValidatedSelect
            form={form}
            name="furnishingStatus"
            label="Furnishing Status"
            placeholder="Select furnishing status"
            options={furnishingOptions}
            value={values.furnishingStatus}
            required={true}
            error={shouldShowFieldError('furnishingStatus') ? getFieldValidation('furnishingStatus').error : null}
            isValid={getFieldValidation('furnishingStatus').isValid}
            isTouched={getFieldValidation('furnishingStatus').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onValueChange={(value) => updateFormAndState('furnishingStatus', value)}
            size="lg"
          />
        </div>

        {/* Preferred Tenants */}
        <div>
          <FormFieldLabel
            fieldName="preferredTenants"
            required={true}
            isValid={getFieldValidation('preferredTenants').isValid}
            isTouched={getFieldValidation('preferredTenants').isTouched}
            error={shouldShowFieldError('preferredTenants') ? getFieldValidation('preferredTenants').error : null}
            helperText="Select who can rent this property"
            size="lg"
          >
            Preferred Tenants
          </FormFieldLabel>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            {TENANT_PREFERENCES.map((preference) => (
              <div key={preference} className="flex items-start space-x-2">
                <Checkbox
                  id={`tenantPref-${preference}`}
                  checked={values.preferredTenants.includes(preference)}
                  onCheckedChange={(checked) => {
                    const currentPreferences = values.preferredTenants || [];
                    let newPreferences;
                    
                    if (checked) {
                      newPreferences = [...currentPreferences, preference];
                    } else {
                      newPreferences = currentPreferences.filter((item) => item !== preference);
                    }
                    
                    updateFormAndState('preferredTenants', newPreferences);
                  }}
                />
                <label
                  htmlFor={`tenantPref-${preference}`}
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {preference}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Preferences */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="nonVegAllowed"
                checked={values.nonVegAllowed}
                onCheckedChange={(checked) => updateFormAndState('nonVegAllowed', !!checked)}
              />
              <label
                htmlFor="nonVegAllowed"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Non-Veg Cooking Allowed
              </label>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="petsAllowed"
                checked={values.petsAllowed}
                onCheckedChange={(checked) => updateFormAndState('petsAllowed', !!checked)}
              />
              <label
                htmlFor="petsAllowed"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Pets Allowed
              </label>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="hasLockInPeriod"
                checked={values.hasLockInPeriod}
                onCheckedChange={(checked) => {
                  updateFormAndState('hasLockInPeriod', !!checked);
                  if (!checked) {
                    updateFormAndState('lockInPeriod', '');
                  }
                }}
              />
              <label
                htmlFor="hasLockInPeriod"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Has Lock-in Period
              </label>
            </div>
          </div>
          
          {/* Lock-in Period Input */}
          {values.hasLockInPeriod && (
            <div className="mt-4 max-w-xs">
              <ValidatedInput
                form={form}
                name="lockInPeriod"
                label="Lock-in Period"
                type="number"
                placeholder="e.g., 6"
                value={values.lockInPeriod}
                required={values.hasLockInPeriod}
                helperText="Lock-in period in months"
                error={shouldShowFieldError('lockInPeriod') ? getFieldValidation('lockInPeriod').error : null}
                isValid={getFieldValidation('lockInPeriod').isValid}
                isTouched={getFieldValidation('lockInPeriod').isTouched}
                onValidation={(field, value) => updateFormAndState(field, value)}
                onChange={(e) => updateFormAndState('lockInPeriod', e.target.value)}
                min="1"
                max="36"
                size="lg"
              />
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
};

export default RentalDetails;