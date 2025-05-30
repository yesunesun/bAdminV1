// src/modules/owner/components/property/wizard/sections/CommercialBasicDetails.tsx
// Version: 3.0.0
// Last Modified: 30-05-2025 23:20 IST
// Purpose: Added cross-field validation for floor vs totalFloors and improved ageOfProperty tracking

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSectionProps } from '../types';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { useStepValidation } from '../hooks/useStepValidation';
import {
  COMMERCIAL_PROPERTY_TYPES,
  PROPERTY_TO_BUILDING_TYPES,
  COMMERCIAL_AGE_OPTIONS
} from '../constants/commercialDetails';

export function CommercialBasicDetails({ form, mode = 'create', category, adType, stepId = 'com_rent_basic_details' }: FormSectionProps) {
  // Track mount status to avoid updates after unmount
  const isMounted = useRef(true);
  
  // Track if initial form values have been processed
  const initialProcessDone = useRef(false);

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
    flowType: 'commercial_rent',
    currentStepId: stepId
  });
  
  // Get initial form values directly
  const initialValues = form.getValues();
  const initialStepValues = initialValues.steps?.[stepId] || {};
  
  // Use component state to render values with proper initialization
  const [values, setValues] = useState({
    propertyType: initialStepValues.propertyType || initialValues.propertyType || '',
    buildingType: initialStepValues.buildingType || initialValues.buildingType || '',
    ageOfProperty: initialStepValues.ageOfProperty || initialValues.ageOfProperty || '',
    builtUpArea: initialStepValues.builtUpArea || initialValues.builtUpArea || '',
    builtUpAreaUnit: initialStepValues.builtUpAreaUnit || initialValues.builtUpAreaUnit || 'sqft',
    floor: initialStepValues.floor || initialValues.floor || '',
    totalFloors: initialStepValues.totalFloors || initialValues.totalFloors || '',
    cabins: initialStepValues.cabins || initialValues.cabins || '',
    conferenceRooms: initialStepValues.conferenceRooms || initialValues.conferenceRooms || '',
    receptionArea: initialStepValues.receptionArea || initialValues.receptionArea || 'Yes',
    carParking: initialStepValues.carParking || initialValues.carParking || '',
    bikeParking: initialStepValues.bikeParking || initialValues.bikeParking || '',
    title: initialStepValues.title || initialValues.title || ''
  });
  
  // ✅ NEW: Track cross-field validation errors
  const [crossFieldErrors, setCrossFieldErrors] = useState<Record<string, string>>({});
  
  // Get available building types based on selected property type
  const availableBuildingTypes = useMemo(() => {
    if (!values.propertyType) return [];
    return PROPERTY_TO_BUILDING_TYPES[values.propertyType] || [];
  }, [values.propertyType]);
  
  // Check if property type is office-related and should show office-specific fields
  const isOfficeType = useMemo(() => {
    const officeTypes = ['Office Space', 'IT/Software Park', 'Business Center'];
    return officeTypes.includes(values.propertyType);
  }, [values.propertyType]);
  
  // Debug counter to track re-renders and updates
  const updateCounter = useRef(0);
  
  // ✅ UPDATED: Validate floor vs totalFloors relationship - show error on totalFloors field
  const validateFloorRelationship = useCallback((floor: string, totalFloors: string) => {
    console.log(`[validateFloorRelationship] Checking: floor=${floor}, totalFloors=${totalFloors}`);
    
    const floorNum = parseInt(floor);
    const totalFloorsNum = parseInt(totalFloors);
    
    console.log(`[validateFloorRelationship] Parsed: floorNum=${floorNum}, totalFloorsNum=${totalFloorsNum}`);
    
    if (isNaN(floorNum) || isNaN(totalFloorsNum)) {
      console.log(`[validateFloorRelationship] Skipping validation - one or both values are NaN`);
      return null; // Skip validation if either is not a number
    }
    
    if (totalFloorsNum < floorNum) {
      console.log(`[validateFloorRelationship] VALIDATION FAILED: ${totalFloorsNum} < ${floorNum}`);
      return 'Total Floors should be equal to or greater than Floor';
    }
    
    console.log(`[validateFloorRelationship] Validation passed`);
    return null;
  }, []);
  
  // ✅ UPDATED: Update cross-field validation errors and use validation hook
  const updateCrossFieldValidation = useCallback(() => {
    console.log(`[updateCrossFieldValidation] Running with floor=${values.floor}, totalFloors=${values.totalFloors}`);
    
    const errors: Record<string, string> = {};
    
    const floorError = validateFloorRelationship(values.floor, values.totalFloors);
    if (floorError) {
      console.log(`[updateCrossFieldValidation] Setting error: ${floorError}`);
      errors.totalFloors = floorError; // Show error on totalFloors field only
    } else {
      console.log(`[updateCrossFieldValidation] No validation error`);
    }
    
    setCrossFieldErrors(errors);
    
    // ✅ NEW: Also trigger validation in the validation hook for both fields
    validateField('floor');
    validateField('totalFloors');
  }, [values.floor, values.totalFloors, validateFloorRelationship, validateField]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper functions for form data management
  const saveField = useCallback((fieldName: string, value: any) => {
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
  }, [form, stepId, validateField]);

  // Helper function to get field value from the correct path
  const getFieldValue = (fieldName: string, defaultValue: any = '') => {
    // First try to get from the step
    const stepValue = form.getValues(`steps.${stepId}.${fieldName}`);
    if (stepValue !== undefined) return stepValue;
    
    // Fall back to root level value for backward compatibility during migration
    const rootValue = form.getValues(fieldName);
    return rootValue !== undefined ? rootValue : defaultValue;
  };
  
  // Helper function to set field ONLY in step location
  const setFieldValue = (fieldName: string, value: any, validate = false) => {
    // Only set in step structure
    form.setValue(`steps.${stepId}.${fieldName}`, value, { shouldValidate: validate });
  };
  
  // Subscribe to form changes with improved handling
  useEffect(() => {
    console.log('Setting up form subscription for commercial basic details');
    
    // Watch all fields that we're interested in
    const watchFields = [
      'propertyType',
      'buildingType',
      'ageOfProperty',
      'builtUpArea', 
      'builtUpAreaUnit', 
      'floor', 
      'totalFloors', 
      'cabins', 
      'conferenceRooms', 
      'receptionArea', 
      'carParking', 
      'bikeParking', 
      'title',
      // Also watch step structure
      `steps.${stepId}`
    ];
    
    // Subscribe to form changes for specific fields
    const subscription = form.watch((value, { name, type }) => {
      updateCounter.current += 1;
      const count = updateCounter.current;
      
      console.log(`[${count}] Form update - Changed field: ${name}, Type: ${type}`);
      
      // If specific fields we care about change, update our state
      if (watchFields.includes(name as string) || name === undefined || 
          name?.startsWith(`steps.${stepId}`)) {
        console.log(`[${count}] Updating component state from form values`);
        updateStateFromForm(true, `subscription-${count}`);
      }
    });
    
    // One-time initialization and migration
    if (!initialProcessDone.current) {
      console.log('First-time processing of initial values');
      initialProcessDone.current = true;
      
      // Ensure step structure exists
      const currentSteps = form.getValues('steps') || {};
      if (!currentSteps[stepId]) {
        console.log(`Creating steps.${stepId} structure`);
        form.setValue('steps', {
          ...currentSteps,
          [stepId]: {}
        }, { shouldValidate: false });
      }
      
      // Ensure builtUpAreaUnit has a default value of 'sqft'
      if (!getFieldValue('builtUpAreaUnit')) {
        console.log('Setting default builtUpAreaUnit to sqft');
        setFieldValue('builtUpAreaUnit', 'sqft', false);
      }
      
      // Migrate root level values to step structure if they exist and clear root
      const fieldsToMove = [
        'propertyType', 'buildingType', 'ageOfProperty', 'builtUpArea',
        'builtUpAreaUnit', 'floor', 'totalFloors', 'cabins', 'conferenceRooms',
        'receptionArea', 'carParking', 'bikeParking', 'title'
      ];
      
      fieldsToMove.forEach(field => {
        const rootValue = form.getValues(field);
        const stepValue = form.getValues(`steps.${stepId}.${field}`);
        
        // Only migrate if root value exists and step doesn't have the value
        if (rootValue !== undefined && rootValue !== '' && 
            (stepValue === undefined || stepValue === null || stepValue === '')) {
          console.log(`Migrating root field ${field} to step structure:`, rootValue);
          setFieldValue(field, rootValue, false);
          
          // Clear the root level value to prevent duplication
          form.setValue(field, undefined, { shouldValidate: false });
        }
      });
      
      // Update state after processing initial values
      updateStateFromForm(false, 'initial-process');
    }
    
    return () => subscription.unsubscribe();
  }, [form, stepId, category]);
  
  // Function to update component state from form values
  const updateStateFromForm = (validateAfter = false, source = 'unknown') => {
    if (!isMounted.current) return;
    
    // Get values from step structure first, then fall back to root level
    const newValues = {
      propertyType: getFieldValue('propertyType', ''),
      buildingType: getFieldValue('buildingType', ''),
      ageOfProperty: getFieldValue('ageOfProperty', ''),
      builtUpArea: getFieldValue('builtUpArea', ''),
      builtUpAreaUnit: getFieldValue('builtUpAreaUnit', 'sqft'),
      floor: getFieldValue('floor', ''),
      totalFloors: getFieldValue('totalFloors', ''),
      cabins: getFieldValue('cabins', ''),
      conferenceRooms: getFieldValue('conferenceRooms', ''),
      receptionArea: getFieldValue('receptionArea', 'Yes'),
      carParking: getFieldValue('carParking', ''),
      bikeParking: getFieldValue('bikeParking', ''),
      title: getFieldValue('title', '')
    };
    
    console.log(`Updating state from form values (source: ${source})`, newValues);
    
    // Only update state if any values have changed
    const hasChanges = Object.entries(newValues).some(([key, value]) => {
      const currentValue = values[key as keyof typeof values];
      return currentValue !== value;
    });
    
    if (hasChanges) {
      console.log(`State needs update - Changes detected (source: ${source})`, newValues);
      setValues(newValues);
      
      // Validate form after update if requested
      if (validateAfter) {
        setTimeout(() => {
          form.trigger();
        }, 100);
      }
    } else {
      console.log(`No state changes needed (source: ${source})`);
    }
  };
  
  // ✅ UPDATED: Update form and state with validation and cross-field checks
  const updateFormAndState = useCallback((field: string, value: any) => {
    // Update local state
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update form field in step structure and trigger validation
    saveField(field, value);
    markFieldAsTouched(field);
    
    // Debug log
    console.log(`Updated ${field} to:`, value);
    
    // ✅ NEW: Trigger cross-field validation after a short delay
    setTimeout(() => {
      updateCrossFieldValidation();
    }, 50);
  }, [saveField, markFieldAsTouched, updateCrossFieldValidation]);
  
  // ✅ UPDATED: Update cross-field validation when floor or totalFloors change - with immediate effect
  useEffect(() => {
    // Only run validation if both values exist
    if (values.floor !== '' && values.totalFloors !== '') {
      updateCrossFieldValidation();
    } else {
      // Clear errors if either field is empty
      setCrossFieldErrors({});
    }
  }, [values.floor, values.totalFloors, updateCrossFieldValidation]);
  
  // Process numeric input with immediate validation
  const handleNumberInput = (value: string, fieldName: string) => {
    if (value === '') {
      updateFormAndState(fieldName, '');
      return;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      return;
    }
    
    if (numValue < 0) {
      updateFormAndState(fieldName, '0');
      return;
    }
    
    updateFormAndState(fieldName, numValue.toString());
    
    // ✅ NEW: Immediately validate cross-field relationship for floor fields
    if (fieldName === 'floor' || fieldName === 'totalFloors') {
      setTimeout(() => {
        updateCrossFieldValidation();
      }, 100);
    }
  };

  // Force a unit value to avoid blank display
  const unitValue = values.builtUpAreaUnit || 'sqft';

  // Handle property type change
  const handlePropertyTypeChange = (value: string) => {
    // Clear building type if new property type doesn't support current building type
    const newBuildingTypes = PROPERTY_TO_BUILDING_TYPES[value] || [];
    if (values.buildingType && !newBuildingTypes.includes(values.buildingType)) {
      updateFormAndState('buildingType', '');
    }
    
    // Update property type
    updateFormAndState('propertyType', value);
    
    // Store as commercialPropertyType for review section compatibility
    setFieldValue('commercialPropertyType', value, false);
  };

  return (
    <FormSection
      title="Commercial Property Details"
      description="Tell us about your commercial property"
      className="text-base"
    >
      {/* Validation Progress */}
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

      <div className="space-y-4">
        {/* Commercial Property Type & Building Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Property Type</RequiredLabel>
            <Select 
              value={values.propertyType}
              onValueChange={handlePropertyTypeChange}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Type of commercial property?" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {COMMERCIAL_PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* ✅ REMOVED: No validation messages for other fields */}
          </div>

          <div>
            <RequiredLabel required className="text-base">Building Type</RequiredLabel>
            <Select 
              value={values.buildingType}
              onValueChange={(value) => {
                updateFormAndState('buildingType', value);
                setFieldValue('subType', value, false);
              }}
              disabled={!values.propertyType}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {availableBuildingTypes.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* ✅ REMOVED: No validation messages for other fields */}
          </div>
        </div>

        {/* Age of Property & Super Built-up Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Age of Property</RequiredLabel>
            <Select 
              value={values.ageOfProperty}
              onValueChange={(value) => {
                console.log('Age of Property selected:', value);
                updateFormAndState('ageOfProperty', value);
                setFieldValue('constructionAge', value, false);
              }}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {COMMERCIAL_AGE_OPTIONS.map(age => (
                  <SelectItem key={age} value={age} className="text-base">
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* ✅ REMOVED: No validation messages for other fields */}
          </div>

          <div>
            <RequiredLabel required className="text-base">Super Built Up Area</RequiredLabel>
            <div className="flex space-x-2">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  inputMode="numeric"
                  className="h-11 text-base"
                  value={values.builtUpArea}
                  placeholder="Area (min. 100)"
                  onChange={(e) => {
                    const val = e.target.value;
                    
                    // Allow empty value for manual editing
                    if (val === '') {
                      updateFormAndState('builtUpArea', '');
                      return;
                    }
                    
                    // Allow typing numbers only
                    if (/^\d*$/.test(val)) {
                      updateFormAndState('builtUpArea', val);
                    }
                  }}
                  onBlur={(e) => {
                    // Validate minimum value when field loses focus
                    const val = e.target.value;
                    if (val && parseInt(val) < 100) {
                      updateFormAndState('builtUpArea', '100');
                    }
                  }}
                />
                {/* ✅ REMOVED: No validation messages for other fields */}
              </div>
              <Select 
                defaultValue="sqft"
                value={unitValue}
                onValueChange={(value) => {
                  console.log('Area unit selected:', value);
                  updateFormAndState('builtUpAreaUnit', value);
                }}
              >
                <SelectTrigger className="h-11 text-base w-28">
                  <SelectValue>
                    {unitValue === 'sqft' ? 'Sq.ft' : 'Sq.yd'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="sqft" className="text-base">Sq.ft</SelectItem>
                  <SelectItem value="sqyd" className="text-base">Sq.yd</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Floor Details - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Floor</RequiredLabel>
            <Input
              type="number"
              min="0"
              className="h-11 text-base"
              value={values.floor}
              placeholder="Floor number (0 = ground)"
              onChange={(e) => handleNumberInput(e.target.value, 'floor')}
            />
            {/* ✅ REMOVED: No validation messages for Floor field */}
          </div>

          <div>
            <RequiredLabel required className="text-base">Total Floors</RequiredLabel>
            <Input
              type="number"
              min="1"
              className="h-11 text-base"
              value={values.totalFloors}
              placeholder="Building total floors"
              onChange={(e) => handleNumberInput(e.target.value, 'totalFloors')}
            />
            {/* ✅ UPDATED: Show validation message directly from component state OR manual check */}
            {(crossFieldErrors.totalFloors || 
              (values.floor && values.totalFloors && parseInt(values.totalFloors) < parseInt(values.floor))) && (
              <p className="text-sm text-red-600 mt-1">
                Total Floors should be equal to or greater than Floor
              </p>
            )}
          </div>
        </div>

        {/* Office Layout Details - Only show for office-type properties */}
        {isOfficeType && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <RequiredLabel className="text-base">Cabins</RequiredLabel>
              <Input
                type="number"
                min="0"
                className="h-11 text-base"
                value={values.cabins}
                placeholder="Number of cabins"
                onChange={(e) => handleNumberInput(e.target.value, 'cabins')}
              />
            </div>

            <div>
              <RequiredLabel className="text-base">Conference Rooms</RequiredLabel>
              <Input
                type="number"
                min="0"
                className="h-11 text-base"
                value={values.conferenceRooms}
                placeholder="Number of conference rooms"
                onChange={(e) => handleNumberInput(e.target.value, 'conferenceRooms')}
              />
            </div>
          </div>
        )}

        {/* Reception Area - Single Column */}
        {isOfficeType && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <RequiredLabel className="text-base">Reception Area</RequiredLabel>
              <Select 
                value={values.receptionArea}
                onValueChange={(value) => {
                  updateFormAndState('receptionArea', value);
                  setFieldValue('hasPantry', value === 'Yes', false);
                }}
              >
                <SelectTrigger className="h-11 text-base">
                  <SelectValue placeholder="Has reception area?" />
                </SelectTrigger>
                <SelectContent className="text-base">
                  <SelectItem value="Yes" className="text-base">Yes</SelectItem>
                  <SelectItem value="No" className="text-base">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="invisible">
              {/* Empty placeholder to maintain grid layout */}
            </div>
          </div>
        )}

        {/* Parking Details - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel className="text-base">Car Parking</RequiredLabel>
            <Input
              type="number"
              min="0"
              className="h-11 text-base"
              value={values.carParking}
              placeholder="Number of car parking spots"
              onChange={(e) => {
                handleNumberInput(e.target.value, 'carParking');
                // Also set parking field for review section
                if (e.target.value) {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    setFieldValue('parking', `${value} car spot(s)`, false);
                  }
                }
              }}
            />
          </div>

          <div>
            <RequiredLabel className="text-base">Bike Parking</RequiredLabel>
            <Input
              type="number"
              min="0"
              className="h-11 text-base"
              value={values.bikeParking}
              placeholder="Number of bike parking spots"
              onChange={(e) => {
                handleNumberInput(e.target.value, 'bikeParking');
                // Update washrooms field for compatibility with review section
                setFieldValue('washrooms', values.totalFloors, false);
              }}
            />
          </div>
        </div>

        {/* Title (Only in edit mode) */}
        {mode === 'edit' && (
          <div>
            <RequiredLabel className="text-base">Title</RequiredLabel>
            <Input
              className="h-11 text-base"
              value={values.title}
              onChange={(e) => updateFormAndState('title', e.target.value)}
              placeholder="E.g., Premium Office Space in HITEC City"
            />
          </div>
        )}
      </div>
    </FormSection>
  );
}