// src/modules/owner/components/property/wizard/sections/RentalDetails.tsx
// Version: 3.2.0
// Last Modified: 02-06-2025 15:45 IST
// Purpose: Added "Any" master toggle for preferred tenants and made maintenance charges mandatory

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
    maintenanceCharges: getField('maintenanceCharges', ''), // Now mandatory
    availableFrom: getField('availableFrom', ''),
    furnishingStatus: getField('furnishingStatus', ''),
    preferredTenants: getField('preferredTenants', []),
    // ✅ UPDATED: Updated preference fields to match UI requirements
    nonVegCooking: getField('nonVegCooking', 'doesntMatter'), // Changed from nonVegAllowed
    pets: getField('pets', 'doesntMatter'), // Changed from petsAllowed
    lockInPeriod: getField('lockInPeriod', 'no'), // Changed from hasLockInPeriod
    lockInPeriodMonths: getField('lockInPeriodMonths', '') // New field for months
  });

  // ✅ NEW: Computed state for "Any" checkbox
  const isAnySelected = values.preferredTenants.includes('Any');
  const nonAnyTenants = TENANT_PREFERENCES.filter(pref => pref !== 'Any');
  const areAllNonAnySelected = nonAnyTenants.every(pref => values.preferredTenants.includes(pref));

  // Migrate existing data from root to step object
  useEffect(() => {
    const fieldsToMigrate = [
      'rentAmount', 'rentNegotiable', 'securityDeposit', 'maintenanceCharges',
      'availableFrom', 'furnishingStatus', 'preferredTenants', 
      'nonVegCooking', 'pets', 'lockInPeriod', 'lockInPeriodMonths'
    ];
    
    fieldsToMigrate.forEach(field => {
      const rootValue = form.getValues(field);
      const stepValue = form.getValues(`steps.${stepId}.${field}`);
      
      if (rootValue !== undefined && stepValue === undefined) {
        saveField(field, rootValue);
      }
    });
    
    // Migrate old field names to new ones
    const oldNonVegAllowed = getField('nonVegAllowed');
    if (oldNonVegAllowed !== undefined && !getField('nonVegCooking')) {
      saveField('nonVegCooking', oldNonVegAllowed ? 'allowed' : 'notAllowed');
    }
    
    const oldPetsAllowed = getField('petsAllowed');
    if (oldPetsAllowed !== undefined && !getField('pets')) {
      saveField('pets', oldPetsAllowed ? 'allowed' : 'notAllowed');
    }
    
    const oldHasLockInPeriod = getField('hasLockInPeriod');
    if (oldHasLockInPeriod !== undefined && !getField('lockInPeriod')) {
      saveField('lockInPeriod', oldHasLockInPeriod ? 'yes' : 'no');
    }
    
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
      nonVegCooking: stepData.nonVegCooking || formValues.nonVegCooking || 'doesntMatter',
      pets: stepData.pets || formValues.pets || 'doesntMatter',
      lockInPeriod: stepData.lockInPeriod || formValues.lockInPeriod || 'no',
      lockInPeriodMonths: stepData.lockInPeriodMonths || formValues.lockInPeriodMonths || ''
    });
  };

  // Update form and trigger validation
  const updateFormAndState = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    saveField(field, value);
    markFieldAsTouched(field);
  };

  // ✅ NEW: Handle "Any" checkbox toggle logic
  const handleAnyToggle = (checked: boolean) => {
    console.log('[handleAnyToggle] Any checkbox clicked, checked:', checked);
    
    let newPreferences: string[];
    
    if (checked) {
      // "Any" was selected - select all tenant types including "Any"
      newPreferences = [...TENANT_PREFERENCES];
      console.log('[handleAnyToggle] Selecting all preferences:', newPreferences);
    } else {
      // "Any" was unselected - unselect all tenant types
      newPreferences = [];
      console.log('[handleAnyToggle] Clearing all preferences');
    }
    
    updateFormAndState('preferredTenants', newPreferences);
  };

  // ✅ NEW: Handle individual tenant preference toggle
  const handleTenantPreferenceToggle = (preference: string, checked: boolean) => {
    console.log('[handleTenantPreferenceToggle] Preference:', preference, 'Checked:', checked);
    
    const currentPreferences = values.preferredTenants || [];
    let newPreferences: string[];
    
    if (preference === 'Any') {
      // Handle "Any" selection
      handleAnyToggle(checked);
      return;
    }
    
    // Handle individual tenant type selection
    if (checked) {
      // Add the preference if not already present
      newPreferences = currentPreferences.includes(preference) 
        ? currentPreferences 
        : [...currentPreferences, preference];
      
      // Check if all non-"Any" preferences are now selected
      const allNonAnySelected = nonAnyTenants.every(pref => 
        pref === preference || currentPreferences.includes(pref)
      );
      
      // If all non-"Any" preferences are selected, also select "Any"
      if (allNonAnySelected && !newPreferences.includes('Any')) {
        newPreferences = [...newPreferences, 'Any'];
        console.log('[handleTenantPreferenceToggle] All non-Any selected, adding Any');
      }
    } else {
      // Remove the preference
      newPreferences = currentPreferences.filter(item => item !== preference);
      
      // If "Any" was selected and we're removing a preference, also remove "Any"
      if (newPreferences.includes('Any')) {
        newPreferences = newPreferences.filter(item => item !== 'Any');
        console.log('[handleTenantPreferenceToggle] Removed preference, also removing Any');
      }
    }
    
    console.log('[handleTenantPreferenceToggle] New preferences:', newPreferences);
    updateFormAndState('preferredTenants', newPreferences);
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

  // ✅ NEW: Radio button component for preferences
  const PreferenceRadioGroup = ({ 
    name, 
    label, 
    value, 
    onChange, 
    options 
  }: {
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
  }) => (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">{label}</h4>
      <div className="flex gap-6">
        {options.map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

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

        {/* ✅ UPDATED: Maintenance and Available From - Maintenance now MANDATORY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValidatedInput
            form={form}
            name="maintenanceCharges"
            label="Maintenance Charges"
            type="text"
            inputMode="numeric"
            placeholder="e.g., 2000"
            value={values.maintenanceCharges}
            required={true} // ✅ CHANGED: Now mandatory
            helperText="Monthly maintenance charges in ₹ (required)" // ✅ UPDATED: Helper text indicates mandatory
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

        {/* ✅ UPDATED: Preferred Tenants with "Any" Master Toggle */}
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
          
          {/* ✅ NEW: Master "Any" Checkbox with visual distinction */}
          <div className="mt-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="tenantPref-Any-Master"
                checked={isAnySelected}
                onCheckedChange={(checked) => handleAnyToggle(!!checked)}
                className="mt-1"
              />
              <div>
                <label
                  htmlFor="tenantPref-Any-Master"
                  className="text-sm font-semibold text-blue-900 cursor-pointer"
                >
                  Any (Select All)
                </label>
                <p className="text-xs text-blue-700 mt-1">
                  Check this to select all tenant types below, or uncheck to clear all selections
                </p>
              </div>
            </div>
          </div>
          
          {/* ✅ UPDATED: Individual tenant type checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nonAnyTenants.map((preference) => (
              <div key={preference} className="flex items-start space-x-2">
                <Checkbox
                  id={`tenantPref-${preference}`}
                  checked={values.preferredTenants.includes(preference)}
                  onCheckedChange={(checked) => handleTenantPreferenceToggle(preference, !!checked)}
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
          
          {/* ✅ NEW: Selection Status Indicator */}
          {values.preferredTenants.length > 0 && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              <strong>Selected:</strong> {values.preferredTenants.join(', ')}
              {isAnySelected && (
                <span className="ml-2 text-green-600 font-medium">(All types selected)</span>
              )}
            </div>
          )}
        </div>

        {/* ✅ UPDATED: Additional Preferences with Radio Buttons */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Preferences</h3>
          
          {/* Non-Veg Cooking */}
          <PreferenceRadioGroup
            name="nonVegCooking"
            label="Non-Veg Cooking"
            value={values.nonVegCooking}
            onChange={(value) => updateFormAndState('nonVegCooking', value)}
            options={[
              { value: 'allowed', label: 'Allowed' },
              { value: 'notAllowed', label: 'Not Allowed' },
              { value: 'doesntMatter', label: "Doesn't Matter" }
            ]}
          />

          {/* Pets */}
          <PreferenceRadioGroup
            name="pets"
            label="Pets"
            value={values.pets}
            onChange={(value) => updateFormAndState('pets', value)}
            options={[
              { value: 'allowed', label: 'Allowed' },
              { value: 'notAllowed', label: 'Not Allowed' },
              { value: 'doesntMatter', label: "Doesn't Matter" }
            ]}
          />

          {/* Lock-in Period */}
          <div>
            <PreferenceRadioGroup
              name="lockInPeriod"
              label="Lock-in Period"
              value={values.lockInPeriod}
              onChange={(value) => {
                updateFormAndState('lockInPeriod', value);
                if (value === 'no') {
                  updateFormAndState('lockInPeriodMonths', '');
                }
              }}
              options={[
                { value: 'yes', label: 'Yes (show field)' },
                { value: 'no', label: 'No' },
                { value: 'doesntMatter', label: "Doesn't Matter" }
              ]}
            />
            
            {/* Lock-in Period Input - shown when "Yes" is selected */}
            {values.lockInPeriod === 'yes' && (
              <div className="mt-4 max-w-xs">
                <ValidatedInput
                  form={form}
                  name="lockInPeriodMonths"
                  label="Lock-in Period in Months"
                  type="number"
                  placeholder="e.g., 6"
                  value={values.lockInPeriodMonths}
                  required={values.lockInPeriod === 'yes'}
                  helperText="Lock-in period in months"
                  error={shouldShowFieldError('lockInPeriodMonths') ? getFieldValidation('lockInPeriodMonths').error : null}
                  isValid={getFieldValidation('lockInPeriodMonths').isValid}
                  isTouched={getFieldValidation('lockInPeriodMonths').isTouched}
                  onValidation={(field, value) => updateFormAndState(field, value)}
                  onChange={(e) => updateFormAndState('lockInPeriodMonths', e.target.value)}
                  min="1"
                  max="36"
                  size="lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default RentalDetails;