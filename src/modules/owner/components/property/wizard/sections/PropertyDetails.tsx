// src/modules/owner/components/property/wizard/sections/PropertyDetails.tsx
// Version: 4.7.0
// Last Modified: 03-06-2025 12:45 IST
// Purpose: Removed Bathrooms field and updated mandatory validations for Residential Rent flow

import React, { useEffect, useState, useRef } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSectionProps } from '../types';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import {
  PROPERTY_TYPES,
  BHK_TYPES,
  PROPERTY_AGE,
  FACING_OPTIONS,
  AREA_UNITS,
} from '../constants';

interface PropertyDetailsProps extends FormSectionProps {
  stepId?: string;
}

export function PropertyDetails({ 
  form, 
  mode = 'create', 
  category, 
  adType,
  stepId: providedStepId 
}: PropertyDetailsProps) {
  // Track mount status
  const isMounted = useRef(true);
  const initialProcessDone = useRef(false);
  
  // Generate stepId based on current flow
  const formFlow = form.getValues('flow');
  const flowType = formFlow ? `${formFlow.category}_${formFlow.listingType}` : 'residential_rent';
  
  // Determine the appropriate stepId
  let stepId = providedStepId;
  if (!stepId) {
    const prefix = flowType.split('_').map(part => part.substring(0, 3)).join('_');
    stepId = `${prefix}_basic_details`;
  }

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // ✅ UPDATED: Removed 'bathrooms' from required fields
  const requiredFields = [
    'propertyType', 'bhkType', 'floor', 'totalFloors', 
    'propertyAge', 'facing', 'builtUpArea', 'availableFrom'
  ];

  // Helper functions for form data management
  const getField = (fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    
    // Try step structure first
    const stepValue = form.getValues(path);
    if (stepValue !== undefined) return stepValue;
    
    // Fallback to legacy structure
    const legacyValue = form.getValues(fieldName);
    if (legacyValue !== undefined) return legacyValue;
    
    // Check nested basicDetails structure
    const basicDetails = form.getValues('basicDetails');
    if (basicDetails && basicDetails[fieldName] !== undefined) {
      return basicDetails[fieldName];
    }
    
    return defaultValue;
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
    
    // Basic field validation
    validateField(fieldName, value);
    
    // Update nested basicDetails for backward compatibility
    const basicDetails = form.getValues('basicDetails');
    if (basicDetails) {
      let structuredValue = value;
      if (fieldName === 'floor' || fieldName === 'totalFloors' || fieldName === 'builtUpArea') {
        const numValue = parseInt(value);
        structuredValue = !isNaN(numValue) ? numValue : null;
      }
      
      form.setValue('basicDetails', {
        ...basicDetails,
        [fieldName]: structuredValue
      }, { shouldValidate: false });
    }
  };

  // ✅ UPDATED: Basic field validation - removed bathrooms validation logic
  const validateField = (fieldName: string, value: any) => {
    let error = '';
    
    // Required field validation
    if (requiredFields.includes(fieldName)) {
      if (!value || value === '') {
        error = `${getFieldLabel(fieldName)} is required`;
      }
    }
    
    // Specific field validations
    switch (fieldName) {
      case 'floor':
      case 'totalFloors':
        if (value && (isNaN(parseInt(value)) || parseInt(value) < 0)) {
          error = `${getFieldLabel(fieldName)} must be a valid number`;
        }
        break;
      case 'builtUpArea':
        if (value && (isNaN(parseInt(value)) || parseInt(value) < 100)) {
          error = 'Built-up area must be at least 100 sq ft';
        }
        break;
      case 'availableFrom':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            error = 'Available date cannot be in the past';
          }
        }
        break;
    }
    
    // Update validation errors
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    
    return error === '';
  };

  // ✅ UPDATED: Get user-friendly field label - removed bathrooms
  const getFieldLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      propertyType: 'Property Type',
      bhkType: 'BHK Configuration',
      floor: 'Floor',
      totalFloors: 'Total Floors',
      propertyAge: 'Property Age',
      facing: 'Facing Direction',
      builtUpArea: 'Built-up Area',
      availableFrom: 'Available From'
    };
    return labels[fieldName] || fieldName;
  };

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  };

  const shouldShowError = (fieldName: string) => {
    return touchedFields.has(fieldName) && validationErrors[fieldName];
  };

  // ✅ UPDATED: State for form values - removed bathrooms
  const [values, setValues] = useState({
    title: getField('title', ''),
    propertyType: getField('propertyType', '') || category || 'Apartment',
    bhkType: getField('bhkType', ''),
    floor: getField('floor', ''),
    totalFloors: getField('totalFloors', ''),
    propertyAge: getField('propertyAge', ''),
    facing: getField('facing', ''),
    builtUpArea: getField('builtUpArea', ''),
    builtUpAreaUnit: getField('builtUpAreaUnit', 'sqft'),
    availableFrom: getField('availableFrom', '')
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ✅ UPDATED: Initialize and migrate data - removed bathrooms handling
  useEffect(() => {
    if (initialProcessDone.current) return;
    
    initialProcessDone.current = true;
    
    // Set default property type if none exists
    if (!getField('propertyType')) {
      const defaultPropertyType = category || 'Apartment';
      saveField('propertyType', defaultPropertyType);
    }
    
    // Ensure default area unit
    if (!getField('builtUpAreaUnit')) {
      saveField('builtUpAreaUnit', 'sqft');
    }
    
    // Process nested structure (v2 format) - removed bathrooms
    const basicDetails = form.getValues('basicDetails');
    if (basicDetails) {
      const fieldsToMigrate = [
        'title', 'propertyType', 'bhkType', 'floor', 'totalFloors', 
        'propertyAge', 'facing', 'builtUpArea', 'builtUpAreaUnit', 'availableFrom'
      ];
      
      fieldsToMigrate.forEach(field => {
        if (basicDetails[field] && !getField(field)) {
          const value = typeof basicDetails[field] === 'number' 
            ? basicDetails[field].toString() 
            : basicDetails[field];
          saveField(field, value);
        }
      });
    }
    
    // Migrate from root to step structure - removed bathrooms
    const rootFields = [
      'title', 'propertyType', 'bhkType', 'floor', 'totalFloors', 
      'propertyAge', 'facing', 'builtUpArea', 'builtUpAreaUnit', 'availableFrom'
    ];
    
    rootFields.forEach(field => {
      const rootValue = form.getValues(field);
      const stepValue = form.getValues(`steps.${stepId}.${field}`);
      
      if (rootValue !== undefined && stepValue === undefined) {
        form.setValue(`steps.${stepId}.${field}`, rootValue, { shouldValidate: false });
      }
    });
    
    // Update component state
    updateStateFromForm();
  }, []);

  // ✅ UPDATED: Update component state from form values - removed bathrooms
  const updateStateFromForm = () => {
    if (!isMounted.current) return;
    
    const stepData = form.getValues(`steps.${stepId}`) || {};
    const formValues = form.getValues();
    
    const newValues = {
      title: stepData.title || formValues.title || '',
      propertyType: stepData.propertyType || formValues.propertyType || category || 'Apartment',
      bhkType: stepData.bhkType || formValues.bhkType || '',
      floor: stepData.floor?.toString() || formValues.floor || '',
      totalFloors: stepData.totalFloors?.toString() || formValues.totalFloors || '',
      propertyAge: stepData.propertyAge || formValues.propertyAge || '',
      facing: stepData.facing || formValues.facing || '',
      builtUpArea: stepData.builtUpArea?.toString() || formValues.builtUpArea || '',
      builtUpAreaUnit: stepData.builtUpAreaUnit || formValues.builtUpAreaUnit || 'sqft',
      availableFrom: stepData.availableFrom || formValues.availableFrom || ''
    };
    
    setValues(newValues);
  };

  // Update form and trigger validation
  const updateFormAndState = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    saveField(field, value);
    markFieldTouched(field);
  };

  // Handle numeric input with validation
  const handleNumberInput = (value: string, fieldName: string) => {
    if (value === '') {
      updateFormAndState(fieldName, '');
      return;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) {
      return;
    }
    
    updateFormAndState(fieldName, numValue.toString());
  };

  // Calculate completion percentage properly - only count fields that actually have values
  const completionPercentage = () => {
    const completedFields = requiredFields.filter(field => {
      const value = values[field as keyof typeof values];
      // Only count non-empty values
      return value && value !== '' && value.toString().trim() !== '';
    }).length;
    
    // Return 0 if no fields are completed, otherwise calculate percentage
    if (completedFields === 0) return 0;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const currentCompletion = completionPercentage();
  const isStepValid = currentCompletion === 100;

  return (
    <FormSection
      title="Property Details"
      description="Tell us about your property"
    >
      {/* Progress Indicator */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">
            Step Completion: {currentCompletion}%
          </span>
          <span className="text-xs text-blue-700">
            {isStepValid ? '✅ Ready to proceed' : '⚠️ Please complete required fields'}
          </span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${currentCompletion}%` }}
          />
        </div>
        {!isStepValid && (
          <p className="text-xs text-blue-600 mt-2">
            {/* ✅ UPDATED: Removed Bathrooms from required fields text */}
            Required fields: Property Type, BHK, Floor, Total Floors, Age, Facing, Built-up Area, Available From
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Property Title (Edit mode only) */}
        {mode === 'edit' && (
          <div>
            <RequiredLabel className="text-base">Property Title</RequiredLabel>
            <Input
              className="h-12 text-base mt-2"
              value={values.title}
              onChange={(e) => updateFormAndState('title', e.target.value)}
              onBlur={() => markFieldTouched('title')}
              placeholder="E.g., Spacious 2BHK in Gachibowli"
            />
          </div>
        )}

        {/* Basic Property Info - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Property Type</RequiredLabel>
            <Select 
              value={values.propertyType}
              onValueChange={(value) => updateFormAndState('propertyType', value)}
            >
              <SelectTrigger className="h-12 text-base mt-2">
                <SelectValue placeholder="Select Property Type" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowError('propertyType') && (
              <p className="text-sm text-red-500 mt-2">⚠️ {validationErrors.propertyType}</p>
            )}
          </div>

          <div>
            <RequiredLabel required className="text-base">BHK Configuration</RequiredLabel>
            <Select 
              value={values.bhkType}
              onValueChange={(value) => updateFormAndState('bhkType', value)}
            >
              <SelectTrigger className="h-12 text-base mt-2">
                <SelectValue placeholder="Number of bedrooms?" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {BHK_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowError('bhkType') && (
              <p className="text-sm text-red-500 mt-2">⚠️ {validationErrors.bhkType}</p>
            )}
          </div>
        </div>

        {/* Floor Details - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Floor</RequiredLabel>
            <Input
              type="number"
              min="0"
              className="h-12 text-base mt-2"
              value={values.floor}
              placeholder="Floor number (0 = ground)"
              onChange={(e) => handleNumberInput(e.target.value, 'floor')}
              onBlur={() => markFieldTouched('floor')}
            />
            {shouldShowError('floor') && (
              <p className="text-sm text-red-500 mt-2">⚠️ {validationErrors.floor}</p>
            )}
          </div>

          <div>
            <RequiredLabel required className="text-base">Total Floors</RequiredLabel>
            <Input
              type="number"
              min="1"
              className="h-12 text-base mt-2"
              value={values.totalFloors}
              placeholder="Building total floors"
              onChange={(e) => handleNumberInput(e.target.value, 'totalFloors')}
              onBlur={() => markFieldTouched('totalFloors')}
            />
            {shouldShowError('totalFloors') && (
              <p className="text-sm text-red-500 mt-2">⚠️ {validationErrors.totalFloors}</p>
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Property Age and Facing - removed Bathrooms, moved Property Age to first column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Property Age</RequiredLabel>
            <Select 
              value={values.propertyAge}
              onValueChange={(value) => updateFormAndState('propertyAge', value)}
            >
              <SelectTrigger className="h-12 text-base mt-2">
                <SelectValue placeholder="Property age?" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {PROPERTY_AGE.map(age => (
                  <SelectItem key={age} value={age} className="text-base">
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowError('propertyAge') && (
              <p className="text-sm text-red-500 mt-2">⚠️ {validationErrors.propertyAge}</p>
            )}
          </div>

          <div>
            <RequiredLabel required className="text-base">Facing Direction</RequiredLabel>
            <Select 
              value={values.facing}
              onValueChange={(value) => updateFormAndState('facing', value)}
            >
              <SelectTrigger className="h-12 text-base mt-2">
                <SelectValue placeholder="Direction facing?" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {FACING_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {shouldShowError('facing') && (
              <p className="text-sm text-red-500 mt-2">⚠️ {validationErrors.facing}</p>
            )}
          </div>
        </div>

        {/* ✅ UPDATED: Available From (moved to single column since we have space now) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Available From</RequiredLabel>
            <Input
              type="date"
              className="h-12 text-base mt-2"
              min={minDate}
              value={values.availableFrom}
              onChange={(e) => updateFormAndState('availableFrom', e.target.value)}
              onBlur={() => markFieldTouched('availableFrom')}
            />
            {shouldShowError('availableFrom') && (
              <p className="text-sm text-red-500 mt-2">⚠️ {validationErrors.availableFrom}</p>
            )}
          </div>
          
          {/* Empty column to maintain balanced layout */}
          <div className="invisible">
            {/* Placeholder for balanced grid */}
          </div>
        </div>

        {/* Built-up Area with Unit Selector */}
        <div>
          <RequiredLabel required className="text-base mb-2">Built-up Area</RequiredLabel>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <Input
                type="text"
                inputMode="numeric"
                className="h-12 text-base"
                value={values.builtUpArea}
                placeholder="Area (min. 100)"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*$/.test(val)) {
                    updateFormAndState('builtUpArea', val);
                  }
                }}
                onBlur={(e) => {
                  markFieldTouched('builtUpArea');
                  const val = e.target.value;
                  if (val && parseInt(val) < 100) {
                    updateFormAndState('builtUpArea', '100');
                  }
                }}
              />
              {shouldShowError('builtUpArea') && (
                <p className="text-sm text-red-500 mt-1">⚠️ {validationErrors.builtUpArea}</p>
              )}
            </div>
            <div>
              <Select 
                defaultValue="sqft"
                value={values.builtUpAreaUnit}
                onValueChange={(value) => updateFormAndState('builtUpAreaUnit', value)}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue>
                    {values.builtUpAreaUnit === 'sqft' ? 'sq ft' : 'sq yard'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="text-base">
                  {AREA_UNITS.map(unit => (
                    <SelectItem key={unit.value} value={unit.value} className="text-base">
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
}