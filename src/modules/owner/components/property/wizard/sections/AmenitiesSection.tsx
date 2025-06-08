// src/modules/owner/components/property/wizard/sections/AmenitiesSection.tsx
// Version: 4.1.0
// Last Modified: 02-06-2025 15:30 IST
// Purpose: Enhanced with validation blocking for invalid alternate contact and moved Gym/Gated Security to Other Amenities

import React, { useCallback, useState, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { FormFieldLabel } from '@/components/ui/RequiredLabel';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { FormSectionProps } from '../types';
import { useStepValidation } from '../hooks/useStepValidation';
import { cn } from '@/lib/utils';
import {
  Minus,
  Plus,
  Phone,
  Shield,
  HeartPulse,
  Zap,
  ArrowUpDown,
  Trees,
  Building2,
  Droplet,
  ParkingSquare,
  Container,
  CloudRain,
  Wifi,
  Wind,
  Speaker,
  UserCircle,
  Flame,
  Trash2,
  HomeIcon,
  Store,
  Lock,
  PlaySquare,
  Gamepad,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { 
  AMENITIES_LIST, 
  PROPERTY_SHOW_OPTIONS, 
  PROPERTY_CONDITION_OPTIONS 
} from '../constants';

// India Flag Component - Using Unicode flag emoji
const IndiaFlag = () => (
  <span className="text-lg" role="img" aria-label="India flag">🇮🇳</span>
);

export function AmenitiesSection({ form, stepId = 'res_rent_features' }: FormSectionProps) {
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
  const getField = useCallback((fieldName: string, defaultValue: any = undefined) => {
    const stepPath = `steps.${stepId}.${fieldName}`;
    const stepValue = form.getValues(stepPath);
    
    if (stepValue !== undefined) return stepValue;
    
    // Fallback to root level for backward compatibility
    const rootValue = form.getValues(fieldName);
    return rootValue !== undefined ? rootValue : defaultValue;
  }, [form, stepId]);
  
  const saveField = useCallback((fieldName: string, value: any) => {
    const stepPath = `steps.${stepId}.${fieldName}`;
    
    // Ensure steps structure exists
    const steps = form.getValues('steps') || {};
    if (!steps[stepId]) {
      form.setValue('steps', {
        ...steps,
        [stepId]: {}
      }, { shouldValidate: false });
    }
    
    // Set value in step structure
    form.setValue(stepPath, value, { shouldValidate: true });
    
    // Trigger field validation
    validateField(fieldName);
  }, [form, stepId, validateField]);

  // State for form values
  const [values, setValues] = useState({
    bathrooms: getField('bathrooms', '0'),
    balconies: getField('balconies', '0'),
    propertyShowOption: getField('propertyShowOption', ''),
    propertyCondition: getField('propertyCondition', ''),
    secondaryNumber: getField('secondaryNumber', ''),
    hasSimilarUnits: getField('hasSimilarUnits', false),
    amenities: getField('amenities', [])
  });

  // Phone number validation state
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    error: '',
    isTouched: false
  });

  // Form blocking state - prevents progression if invalid phone number is entered
  const [isFormBlocked, setIsFormBlocked] = useState(false);

  // Initialize steps structure and migrate data
  useEffect(() => {
    const steps = form.getValues('steps') || {};
    if (!steps[stepId]) {
      form.setValue('steps', {
        ...steps,
        [stepId]: {}
      });
    }
    
    // Migrate existing root level fields to step structure
    const fieldsToMigrate = [
      'bathrooms', 'balconies', 
      'propertyShowOption', 'propertyCondition', 'secondaryNumber',
      'hasSimilarUnits', 'amenities'
    ];
    
    fieldsToMigrate.forEach(field => {
      const rootValue = form.getValues(field);
      const stepValue = form.getValues(`steps.${stepId}.${field}`);
      
      if (rootValue !== undefined && stepValue === undefined) {
        form.setValue(`steps.${stepId}.${field}`, rootValue, { shouldValidate: false });
      }
    });
    
    // Update component state
    updateStateFromForm();
  }, [stepId]);

  // Update component state from form values
  const updateStateFromForm = useCallback(() => {
    const stepData = form.getValues(`steps.${stepId}`) || {};
    const formValues = form.getValues();
    
    setValues({
      bathrooms: stepData.bathrooms || formValues.bathrooms || '0',
      balconies: stepData.balconies || formValues.balconies || '0',
      propertyShowOption: stepData.propertyShowOption || formValues.propertyShowOption || '',
      propertyCondition: stepData.propertyCondition || formValues.propertyCondition || '',
      secondaryNumber: stepData.secondaryNumber || formValues.secondaryNumber || '',
      hasSimilarUnits: stepData.hasSimilarUnits || formValues.hasSimilarUnits || false,
      amenities: stepData.amenities || formValues.amenities || []
    });
  }, [form, stepId]);

  // Update form and state with validation
  const updateFormAndState = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    saveField(field, value);
    markFieldAsTouched(field);
  }, [saveField, markFieldAsTouched]);

  // Handle number counters
  const handleNumberChange = useCallback((type: 'bathrooms' | 'balconies', action: 'increment' | 'decrement') => {
    const current = parseInt(values[type] || '0');
    const newValue = (action === 'increment') ? (current + 1) : (current > 0 ? current - 1 : 0);
    updateFormAndState(type, newValue.toString());
  }, [values, updateFormAndState]);

  // ✅ ENHANCED: Indian phone number validation with form blocking
  const validateIndianPhone = useCallback((value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 0) {
      return { isValid: true, error: '', shouldBlock: false }; // Empty is valid (optional field)
    }
    
    if (digits.length < 10) {
      return { 
        isValid: false, 
        error: `Phone number must be exactly 10 digits (${digits.length}/10)`,
        shouldBlock: true 
      };
    }
    
    if (digits.length > 10) {
      return { 
        isValid: false, 
        error: 'Phone number cannot exceed 10 digits',
        shouldBlock: true 
      };
    }
    
    // Check for valid Indian mobile number patterns
    const firstDigit = digits.charAt(0);
    if (!['6', '7', '8', '9'].includes(firstDigit)) {
      return { 
        isValid: false, 
        error: 'Indian mobile numbers start with 6, 7, 8, or 9',
        shouldBlock: true 
      };
    }
    
    return { isValid: true, error: '', shouldBlock: false };
  }, []);

  // ✅ ENHANCED: Handle phone number input with form blocking validation
  const handlePhoneInput = useCallback((value: string) => {
    // Remove all non-digits
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to exactly 10 digits
    const limitedValue = numericValue.slice(0, 10);
    
    // Validate the phone number
    const validation = validateIndianPhone(limitedValue);
    
    setPhoneValidation({
      isValid: validation.isValid,
      error: validation.error,
      isTouched: true
    });
    
    // Block form progression if validation fails and field has content
    setIsFormBlocked(validation.shouldBlock);
    
    updateFormAndState('secondaryNumber', limitedValue);
  }, [updateFormAndState, validateIndianPhone]);

  // ✅ ENHANCED: Format phone number for display
  const formatPhoneDisplay = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 5) return digits;
    if (digits.length <= 10) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
  }, []);

  // Handle amenities selection
  const handleAmenityToggle = useCallback((amenity: string, checked: boolean) => {
    const currentAmenities = values.amenities || [];
    
    let newAmenities;
    if (checked) {
      newAmenities = [...currentAmenities, amenity];
    } else {
      newAmenities = currentAmenities.filter((a: string) => a !== amenity);
    }
    
    updateFormAndState('amenities', newAmenities);
  }, [values.amenities, updateFormAndState]);

  // ✅ REMOVED: Quick amenities - Gym and Gated Security moved to Other Amenities
  // Previously had quickAmenities array here - now removed

  // Amenity icons mapping - Updated to include Gym and Gated Security
  const otherAmenitiesIcons: Record<string, React.ComponentType> = {
    'Power Backup': Zap,
    'Lift': ArrowUpDown,
    'Security': Lock,
    'Park': Trees,
    'Swimming Pool': Droplet,
    'Club House': Building2,
    'Children Play Area': PlaySquare,
    'Garden': Trees,
    'Indoor Games': Gamepad,
    'Visitor Parking': ParkingSquare,
    'Water Storage': Container,
    'Rain Water Harvesting': CloudRain,
    'Internet Services': Wifi,
    'Air Conditioner': Wind,
    'Intercom': Speaker,
    'Servant Room': UserCircle,
    'Gas Pipeline': Flame,
    'Fire Safety': Shield,
    'Shopping Center': Store,
    'Sewage Treatment Plant': Trash2,
    'House Keeping': HomeIcon,
    'Gym': HeartPulse, // ✅ MOVED: Now in Other Amenities
    'Gated Security': Shield // ✅ MOVED: Now in Other Amenities
  };

  // Prepare select options
  const propertyShowOptions = PROPERTY_SHOW_OPTIONS.map(option => ({ value: option, label: option }));
  const propertyConditionOptions = PROPERTY_CONDITION_OPTIONS.map(option => ({ value: option, label: option }));

  // ✅ ENHANCED: Calculate if step is truly valid (including phone validation)
  const isStepCompletelyValid = stepIsValid && !isFormBlocked;

  return (
    <FormSection
      title="Amenities & Features"
      description="What does your property offer?"
    >
      {/* Validation Progress - Enhanced with form blocking indicator */}
      {requiredFields.length > 0 && (
        <div className={`mb-6 p-3 rounded-lg border ${
          isFormBlocked 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${
              isFormBlocked 
                ? 'text-red-900 dark:text-red-100' 
                : 'text-blue-900 dark:text-blue-100'
            }`}>
              Step Completion: {completionPercentage}%
            </span>
            <span className={`text-xs ${
              isFormBlocked 
                ? 'text-red-700 dark:text-red-300' 
                : isStepCompletelyValid 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-blue-700 dark:text-blue-300'
            }`}>
              {isFormBlocked 
                ? '⚠️ Fix validation errors to proceed' 
                : isStepCompletelyValid 
                  ? '✓ Ready to proceed' 
                  : 'Please complete required fields'
              }
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${
            isFormBlocked 
              ? 'bg-red-200 dark:bg-red-800' 
              : 'bg-blue-200 dark:bg-blue-800'
          }`}>
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isFormBlocked 
                  ? 'bg-red-600 dark:bg-red-400' 
                  : 'bg-blue-600 dark:bg-blue-400'
              }`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Bathrooms and Balconies Counter */}
        <div className="grid grid-cols-2 gap-6">
          {/* Bathrooms Counter */}
          <div>
            <FormFieldLabel
              fieldName="bathrooms"
              required={true}
              isValid={getFieldValidation('bathrooms').isValid}
              isTouched={getFieldValidation('bathrooms').isTouched}
              error={shouldShowFieldError('bathrooms') ? getFieldValidation('bathrooms').error : null}
              size="lg"
            >
              Bathrooms
            </FormFieldLabel>
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2">
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'decrement')}
                disabled={parseInt(values.bathrooms) <= 0}
                className="w-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 flex items-center justify-center border-x bg-white dark:bg-gray-900">
                <span className="text-lg font-medium">{values.bathrooms}</span>
              </div>
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'increment')}
                className="w-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Balconies Counter */}
          <div>
            <FormFieldLabel
              fieldName="balconies"
              required={false}
              isValid={getFieldValidation('balconies').isValid}
              isTouched={getFieldValidation('balconies').isTouched}
              error={shouldShowFieldError('balconies') ? getFieldValidation('balconies').error : null}
              size="lg"
            >
              Balconies
            </FormFieldLabel>
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-2">
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'decrement')}
                disabled={parseInt(values.balconies) <= 0}
                className="w-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 flex items-center justify-center border-x bg-white dark:bg-gray-900">
                <span className="text-lg font-medium">{values.balconies}</span>
              </div>
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'increment')}
                className="w-12 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Property Show and Condition */}
        <div className="grid grid-cols-2 gap-6">
          <ValidatedSelect
            form={form}
            name="propertyShowOption"
            label="Who Shows Property?"
            placeholder="Select who shows"
            options={propertyShowOptions}
            value={values.propertyShowOption}
            required={true}
            error={shouldShowFieldError('propertyShowOption') ? getFieldValidation('propertyShowOption').error : null}
            isValid={getFieldValidation('propertyShowOption').isValid}
            isTouched={getFieldValidation('propertyShowOption').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onValueChange={(value) => updateFormAndState('propertyShowOption', value)}
            size="lg"
          />

          <ValidatedSelect
            form={form}
            name="propertyCondition"
            label="Property Condition"
            placeholder="Select condition"
            options={propertyConditionOptions}
            value={values.propertyCondition}
            required={true}
            error={shouldShowFieldError('propertyCondition') ? getFieldValidation('propertyCondition').error : null}
            isValid={getFieldValidation('propertyCondition').isValid}
            isTouched={getFieldValidation('propertyCondition').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onValueChange={(value) => updateFormAndState('propertyCondition', value)}
            size="lg"
          />
        </div>

        {/* ✅ ENHANCED: Alternate Contact with Blocking Validation */}
        <div>
          <FormFieldLabel
            fieldName="secondaryNumber"
            required={false}
            isValid={phoneValidation.isValid || !phoneValidation.isTouched}
            isTouched={phoneValidation.isTouched}
            error={phoneValidation.isTouched && phoneValidation.error ? phoneValidation.error : null}
            helperText="Optional backup contact number (Indian mobile only)"
            size="lg"
          >
            Alternate Contact
          </FormFieldLabel>
          
          <div className="relative mt-2">
            {/* Country Code Prefix */}
            <div className="absolute left-3 inset-y-0 flex items-center gap-2 pointer-events-none">
              <IndiaFlag />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">+91</span>
            </div>
            
            {/* Validation Icon */}
            <div className="absolute right-3 inset-y-0 flex items-center pointer-events-none">
              {phoneValidation.isTouched && values.secondaryNumber && (
                phoneValidation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )
              )}
            </div>
            
            <Input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={formatPhoneDisplay(values.secondaryNumber)}
              onChange={(e) => handlePhoneInput(e.target.value)}
              maxLength={11} // Allow for spacing in display
              className={cn(
                "h-12 pl-20 pr-12 text-lg tracking-wider",
                phoneValidation.isTouched && !phoneValidation.isValid && values.secondaryNumber && "border-red-500 focus-visible:ring-red-500",
                phoneValidation.isTouched && phoneValidation.isValid && values.secondaryNumber && "border-green-500 focus-visible:ring-green-500"
              )}
            />
          </div>
          
          {/* Phone Number Info */}
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>
                {values.secondaryNumber 
                  ? `${values.secondaryNumber.length}/10 digits` 
                  : 'Indian mobile numbers only (6/7/8/9 starting digits)'
                }
              </span>
            </div>
          </div>
          
          {/* Success Message */}
          {phoneValidation.isTouched && phoneValidation.isValid && values.secondaryNumber && values.secondaryNumber.length === 10 && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Valid Indian mobile number</span>
            </div>
          )}
          
          {/* ✅ NEW: Form Blocking Warning */}
          {isFormBlocked && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2">
              <XCircle className="h-4 w-4" />
              <span>Please fix the alternate contact number or leave it empty to continue</span>
            </div>
          )}
        </div>

        {/* Similar Units */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <Checkbox
            id="hasSimilarUnits"
            checked={values.hasSimilarUnits}
            onCheckedChange={(checked) => updateFormAndState('hasSimilarUnits', checked)}
          />
          <label
            htmlFor="hasSimilarUnits"
            className="text-gray-700 dark:text-gray-300 cursor-pointer font-medium"
          >
            Have similar units available?
          </label>
        </div>

        {/* ✅ UPDATED: Other Amenities - Now includes Gym and Gated Security */}
        <div>
          <FormFieldLabel
            fieldName="amenities"
            required={true}
            isValid={getFieldValidation('amenities').isValid}
            isTouched={getFieldValidation('amenities').isTouched}
            error={shouldShowFieldError('amenities') ? getFieldValidation('amenities').error : null}
            helperText="Select all available amenities (including Gym and Gated Security)"
            size="lg"
          >
            Other Amenities
          </FormFieldLabel>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
            {AMENITIES_LIST.map((amenity) => {
              const Icon = otherAmenitiesIcons[amenity];
              const isSelected = (values.amenities || []).includes(amenity);
              
              return (
                <div
                  key={amenity}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    isSelected 
                      ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleAmenityToggle(amenity, !isSelected)}
                >
                  <Checkbox
                    id={`amenity-${amenity}`}
                    checked={isSelected}
                    onCheckedChange={(checked) => handleAmenityToggle(amenity, !!checked)}
                  />
                  <label
                    htmlFor={`amenity-${amenity}`}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer flex-1"
                  >
                    {Icon && <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
                    <span className="text-sm font-medium">{amenity}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary of Selected Amenities */}
        {values.amenities && values.amenities.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              Selected Amenities ({values.amenities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {values.amenities.map((amenity: string) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
}