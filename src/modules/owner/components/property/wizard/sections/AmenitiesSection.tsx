// src/modules/owner/components/property/wizard/sections/AmenitiesSection.tsx
// Version: 3.0.0
// Last Modified: 29-05-2025 18:45 IST
// Purpose: Enhanced with comprehensive field validation system for amenities

import React, { useCallback, useState, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { ValidatedSelect } from '@/components/ui/ValidatedSelect';
import { FormFieldLabel } from '@/components/ui/RequiredLabel';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSectionProps } from '../types';
import { useStepValidation } from '../hooks/useStepValidation';
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
  Gamepad
} from 'lucide-react';

import { 
  AMENITIES_LIST, 
  PROPERTY_SHOW_OPTIONS, 
  PROPERTY_CONDITION_OPTIONS 
} from '../constants';

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
    hasGym: getField('hasGym', false),
    gatedSecurity: getField('gatedSecurity', false),
    propertyShowOption: getField('propertyShowOption', ''),
    propertyCondition: getField('propertyCondition', ''),
    secondaryNumber: getField('secondaryNumber', ''),
    hasSimilarUnits: getField('hasSimilarUnits', false),
    amenities: getField('amenities', [])
  });

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
      'bathrooms', 'balconies', 'hasGym', 'gatedSecurity', 
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
      hasGym: stepData.hasGym || formValues.hasGym || false,
      gatedSecurity: stepData.gatedSecurity || formValues.gatedSecurity || false,
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

  // Handle phone number input
  const handlePhoneInput = useCallback((value: string) => {
    // Remove non-digits and limit to 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    updateFormAndState('secondaryNumber', numericValue);
  }, [updateFormAndState]);

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

  // Quick amenities with icons
  const quickAmenities = [
    { id: 'hasGym', label: 'Gym', icon: HeartPulse },
    { id: 'gatedSecurity', label: 'Gated Security', icon: Shield }
  ];

  // Amenity icons mapping
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
    'House Keeping': HomeIcon
  };

  // Prepare select options
  const propertyShowOptions = PROPERTY_SHOW_OPTIONS.map(option => ({ value: option, label: option }));
  const propertyConditionOptions = PROPERTY_CONDITION_OPTIONS.map(option => ({ value: option, label: option }));

  return (
    <FormSection
      title="Amenities & Features"
      description="What does your property offer?"
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
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200 mt-2">
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'decrement')}
                disabled={parseInt(values.bathrooms) <= 0}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 flex items-center justify-center border-x bg-white">
                <span className="text-lg font-medium">{values.bathrooms}</span>
              </div>
              <button
                type="button"
                onClick={() => handleNumberChange('bathrooms', 'increment')}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50"
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
            <div className="flex h-12 rounded-lg overflow-hidden border border-gray-200 mt-2">
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'decrement')}
                disabled={parseInt(values.balconies) <= 0}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 flex items-center justify-center border-x bg-white">
                <span className="text-lg font-medium">{values.balconies}</span>
              </div>
              <button
                type="button"
                onClick={() => handleNumberChange('balconies', 'increment')}
                className="w-12 flex items-center justify-center text-gray-600 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Amenities */}
        <div className="grid grid-cols-2 gap-4">
          {quickAmenities.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                id={id}
                checked={values[id as keyof typeof values] as boolean}
                onCheckedChange={(checked) => updateFormAndState(id, checked)}
              />
              <label
                htmlFor={id}
                className="flex items-center gap-2 text-gray-700 cursor-pointer"
              >
                <Icon className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{label}</span>
              </label>
            </div>
          ))}
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

        {/* Alternate Contact */}
        <div>
          <FormFieldLabel
            fieldName="secondaryNumber"
            required={false}
            isValid={getFieldValidation('secondaryNumber').isValid}
            isTouched={getFieldValidation('secondaryNumber').isTouched}
            error={shouldShowFieldError('secondaryNumber') ? getFieldValidation('secondaryNumber').error : null}
            helperText="Optional backup contact number"
            size="lg"
          >
            Alternate Contact
          </FormFieldLabel>
          <div className="relative mt-2">
            <span className="absolute left-3 inset-y-0 flex items-center text-gray-400">
              <Phone className="h-4 w-4" />
            </span>
            <span className="absolute left-9 inset-y-0 flex items-center text-gray-400">
              +91
            </span>
            <ValidatedInput
              form={form}
              name="secondaryNumber"
              label=""
              type="tel"
              placeholder="Additional contact number"
              value={values.secondaryNumber}
              required={false}
              error={shouldShowFieldError('secondaryNumber') ? getFieldValidation('secondaryNumber').error : null}
              isValid={getFieldValidation('secondaryNumber').isValid}
              isTouched={getFieldValidation('secondaryNumber').isTouched}
              onValidation={(field, value) => handlePhoneInput(value)}
              onChange={(e) => handlePhoneInput(e.target.value)}
              maxLength={10}
              className="h-12 pl-16"
              containerClassName="mb-0"
              size="lg"
            />
          </div>
        </div>

        {/* Similar Units */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <Checkbox
            id="hasSimilarUnits"
            checked={values.hasSimilarUnits}
            onCheckedChange={(checked) => updateFormAndState('hasSimilarUnits', checked)}
          />
          <label
            htmlFor="hasSimilarUnits"
            className="text-gray-700 cursor-pointer font-medium"
          >
            Have similar units available?
          </label>
        </div>

        {/* Other Amenities */}
        <div>
          <FormFieldLabel
            fieldName="amenities"
            required={true}
            isValid={getFieldValidation('amenities').isValid}
            isTouched={getFieldValidation('amenities').isTouched}
            error={shouldShowFieldError('amenities') ? getFieldValidation('amenities').error : null}
            helperText="Select all available amenities"
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
                      ? 'border-blue-300 bg-blue-50 hover:bg-blue-100' 
                      : 'border-gray-200 bg-white hover:bg-gray-50'
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
                    className="flex items-center gap-2 text-gray-700 cursor-pointer flex-1"
                  >
                    {Icon && <Icon className="h-4 w-4 text-gray-500" />}
                    <span className="text-sm font-medium">{amenity}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary of Selected Amenities */}
        {values.amenities && values.amenities.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-900 mb-2">
              Selected Amenities ({values.amenities.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {values.amenities.map((amenity: string) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
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