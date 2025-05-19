// src/modules/owner/components/property/wizard/sections/CommercialBasicDetails.tsx
// Version: 1.4.0
// Last Modified: 19-05-2025 23:15 IST
// Purpose: Fixed to store values in the correct step structure (com_rent_basic_details)

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSectionProps } from '../types';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import {
  COMMERCIAL_PROPERTY_TYPES,
  COMMERCIAL_FURNISHING_OPTIONS,
  PROPERTY_TO_BUILDING_TYPES,
  COMMERCIAL_AGE_OPTIONS
} from '../constants/commercialDetails';

export function CommercialBasicDetails({ form, mode = 'create', category, adType, stepId = 'com_rent_basic_details' }: FormSectionProps) {
  // Track mount status to avoid updates after unmount
  const isMounted = useRef(true);
  
  // Track if initial form values have been processed
  const initialProcessDone = useRef(false);
  
  // Get initial form values directly
  const initialValues = form.getValues();
  const initialStepValues = initialValues.steps?.[stepId] || {};
  
  // Use component state to render values with proper initialization
  const [values, setValues] = useState({
    propertyType: initialStepValues.propertyType || initialValues.propertyType || '',
    buildingType: initialStepValues.buildingType || initialValues.buildingType || '',
    ageOfProperty: initialStepValues.ageOfProperty || initialValues.ageOfProperty || '',
    builtUpArea: initialStepValues.builtUpArea || initialValues.builtUpArea || '',
    builtUpAreaUnit: initialStepValues.builtUpAreaUnit || initialValues.builtUpAreaUnit || 'sqft', // Always default to sqft
    floor: initialStepValues.floor || initialValues.floor || '',
    totalFloors: initialStepValues.totalFloors || initialValues.totalFloors || '',
    cabins: initialStepValues.cabins || initialValues.cabins || '',
    conferenceRooms: initialStepValues.conferenceRooms || initialValues.conferenceRooms || '',
    receptionArea: initialStepValues.receptionArea || initialValues.receptionArea || 'Yes',
    furnishing: initialStepValues.furnishing || initialValues.furnishing || '',
    carParking: initialStepValues.carParking || initialValues.carParking || '',
    bikeParking: initialStepValues.bikeParking || initialValues.bikeParking || '',
    title: initialStepValues.title || initialValues.title || ''
  });
  
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
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Helper function to get field value from the correct path
  const getFieldValue = (fieldName: string, defaultValue: any = '') => {
    // First try to get from the step
    const stepValue = form.getValues(`steps.${stepId}.${fieldName}`);
    if (stepValue !== undefined) return stepValue;
    
    // Fall back to root level value
    const rootValue = form.getValues(fieldName);
    return rootValue !== undefined ? rootValue : defaultValue;
  };
  
  // Helper function to set field in both step and root (for backwards compatibility)
  const setFieldValue = (fieldName: string, value: any, validate = false) => {
    // Set in step structure
    form.setValue(`steps.${stepId}.${fieldName}`, value, { shouldValidate: validate });
    
    // Set at root level for backward compatibility
    form.setValue(fieldName, value, { shouldValidate: validate });
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
      'furnishing', 
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
    
    // One-time initialization
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
      
      // Move root level values to step structure if they exist
      const fieldsToMove = [
        'propertyType', 'buildingType', 'ageOfProperty', 'builtUpArea',
        'builtUpAreaUnit', 'floor', 'totalFloors', 'cabins', 'conferenceRooms',
        'receptionArea', 'furnishing', 'carParking', 'bikeParking', 'title'
      ];
      
      fieldsToMove.forEach(field => {
        const rootValue = form.getValues(field);
        if (rootValue !== undefined && rootValue !== '') {
          console.log(`Moving root field ${field} to step structure:`, rootValue);
          setFieldValue(field, rootValue, false);
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
      furnishing: getFieldValue('furnishing', ''),
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
  
  // Update form when local state changes
  const updateFormAndState = (field: string, value: any) => {
    // Update local state
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update form field in both step structure and root level
    setFieldValue(field, value, true);
    
    // Debug log
    console.log(`Updated ${field} to:`, value);
  };
  
  // Process numeric input
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
          </div>
        </div>

        {/* Age of Property & Super Built-up Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Age of Property</RequiredLabel>
            <Select 
              value={values.ageOfProperty}
              onValueChange={(value) => {
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

        {/* Reception Area & Furnishing - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          {isOfficeType ? (
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
          ) : (
            <div className="invisible">
              {/* Empty placeholder to maintain grid layout */}
            </div>
          )}

          <div>
            <RequiredLabel required className="text-base">Furnishing</RequiredLabel>
            <Select 
              value={values.furnishing}
              onValueChange={(value) => {
                updateFormAndState('furnishing', value);
                setFieldValue('furnishingStatus', value, false);
              }}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Furnishing status?" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {COMMERCIAL_FURNISHING_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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