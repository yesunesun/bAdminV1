// src/modules/owner/components/property/wizard/sections/CommercialBasicDetails.tsx
// Version: 1.3.0
// Last Modified: 13-05-2025 16:45 IST
// Purpose: Removed debug information display while keeping Debug button functionality

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

export function CommercialBasicDetails({ form, mode = 'create', category, adType }: FormSectionProps) {
  // Track mount status to avoid updates after unmount
  const isMounted = useRef(true);
  
  // Track if initial form values have been processed
  const initialProcessDone = useRef(false);
  
  // Get initial form values directly
  const initialValues = form.getValues();
  
  // Use component state to render values with proper initialization
  const [values, setValues] = useState({
    propertyType: initialValues.propertyType || '',
    buildingType: initialValues.buildingType || '',
    ageOfProperty: initialValues.ageOfProperty || '',
    builtUpArea: initialValues.builtUpArea || '',
    builtUpAreaUnit: initialValues.builtUpAreaUnit || 'sqft', // Always default to sqft
    floor: initialValues.floor || '',
    totalFloors: initialValues.totalFloors || '',
    cabins: initialValues.cabins || '',
    conferenceRooms: initialValues.conferenceRooms || '',
    receptionArea: initialValues.receptionArea || 'Yes',
    furnishing: initialValues.furnishing || '',
    carParking: initialValues.carParking || '',
    bikeParking: initialValues.bikeParking || '',
    title: initialValues.title || ''
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
      // Also watch v2 nested structure fields
      'basicDetails'
    ];
    
    // Subscribe to form changes for specific fields
    const subscription = form.watch((value, { name, type }) => {
      updateCounter.current += 1;
      const count = updateCounter.current;
      
      console.log(`[${count}] Form update - Changed field: ${name}, Type: ${type}`);
      
      // If specific fields we care about change, update our state
      if (watchFields.includes(name as string) || name === undefined) {
        console.log(`[${count}] Updating component state from form values`);
        updateStateFromForm(true, `subscription-${count}`);
      }
      
      // For nested structure changes (v2 format)
      if (name === 'basicDetails') {
        console.log(`[${count}] Updating from nested basicDetails structure`);
        const basicDetails = form.getValues('basicDetails');
        if (basicDetails) {
          // Update flat fields from nested structure
          const nestedValues = {
            title: basicDetails.title || values.title,
            propertyType: basicDetails.propertyType || values.propertyType,
            buildingType: basicDetails.buildingType || values.buildingType,
            ageOfProperty: basicDetails.ageOfProperty || values.ageOfProperty,
            builtUpArea: basicDetails.builtUpArea?.toString() || values.builtUpArea,
            builtUpAreaUnit: basicDetails.builtUpAreaUnit || values.builtUpAreaUnit,
            floor: basicDetails.floor?.toString() || values.floor,
            totalFloors: basicDetails.totalFloors?.toString() || values.totalFloors,
            furnishing: basicDetails.furnishing || values.furnishing
          };
          
          console.log(`[${count}] Updating flat fields from nested values:`, nestedValues);
          
          // Set local state
          if (isMounted.current) {
            setValues(prev => ({...prev, ...nestedValues}));
          }
          
          // Also set flat fields in form if they're not already set
          Object.entries(nestedValues).forEach(([field, value]) => {
            const currentValue = form.getValues(field);
            if (!currentValue && value) {
              console.log(`[${count}] Setting flat field ${field} from nested structure:`, value);
              form.setValue(field, value, { shouldValidate: false });
            }
          });
        }
      }
    });
    
    // One-time initialization
    if (!initialProcessDone.current) {
      console.log('First-time processing of initial values');
      initialProcessDone.current = true;
      
      // Ensure builtUpAreaUnit has a default value of 'sqft'
      if (!form.getValues().builtUpAreaUnit) {
        console.log('Setting default builtUpAreaUnit to sqft');
        form.setValue('builtUpAreaUnit', 'sqft', { shouldValidate: false });
      }
      
      // Process nested structure (v2 format)
      const basicDetails = form.getValues('basicDetails');
      if (basicDetails) {
        console.log('Processing nested basicDetails:', basicDetails);
        
        // Map nested values to flat fields if they're not set
        if (basicDetails.propertyType && !form.getValues('propertyType')) {
          form.setValue('propertyType', basicDetails.propertyType, { shouldValidate: false });
        }
        if (basicDetails.buildingType && !form.getValues('buildingType')) {
          form.setValue('buildingType', basicDetails.buildingType, { shouldValidate: false });
        }
        if (basicDetails.ageOfProperty && !form.getValues('ageOfProperty')) {
          form.setValue('ageOfProperty', basicDetails.ageOfProperty, { shouldValidate: false });
        }
        if (basicDetails.builtUpArea && !form.getValues('builtUpArea')) {
          form.setValue('builtUpArea', basicDetails.builtUpArea.toString(), { shouldValidate: false });
        }
        if (basicDetails.builtUpAreaUnit && !form.getValues('builtUpAreaUnit')) {
          form.setValue('builtUpAreaUnit', basicDetails.builtUpAreaUnit, { shouldValidate: false });
        }
        if (basicDetails.floor && !form.getValues('floor')) {
          form.setValue('floor', basicDetails.floor.toString(), { shouldValidate: false });
        }
        if (basicDetails.totalFloors && !form.getValues('totalFloors')) {
          form.setValue('totalFloors', basicDetails.totalFloors.toString(), { shouldValidate: false });
        }
        if (basicDetails.furnishing && !form.getValues('furnishing')) {
          form.setValue('furnishing', basicDetails.furnishing, { shouldValidate: false });
        }
      }
      
      // Update state after processing initial values
      updateStateFromForm(false, 'initial-process');
    }
    
    return () => subscription.unsubscribe();
  }, [form, category]);
  
  // Function to update component state from form values
  const updateStateFromForm = (validateAfter = false, source = 'unknown') => {
    if (!isMounted.current) return;
    
    const formValues = form.getValues();
    console.log(`Updating state from form values (source: ${source})`, formValues);
    
    // Ensure builtUpAreaUnit has a value
    const areaUnit = formValues.builtUpAreaUnit || 'sqft';
    
    // Create new state object based on current form values
    const newValues = {
      propertyType: formValues.propertyType || '',
      buildingType: formValues.buildingType || '',
      ageOfProperty: formValues.ageOfProperty || '',
      builtUpArea: formValues.builtUpArea || '',
      builtUpAreaUnit: areaUnit,
      floor: formValues.floor || '',
      totalFloors: formValues.totalFloors || '',
      cabins: formValues.cabins || '',
      conferenceRooms: formValues.conferenceRooms || '',
      receptionArea: formValues.receptionArea || 'Yes',
      furnishing: formValues.furnishing || '',
      carParking: formValues.carParking || '',
      bikeParking: formValues.bikeParking || '',
      title: formValues.title || ''
    };
    
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
    
    // Update form flat field
    form.setValue(field, value, { shouldValidate: true });
    
    // Also update nested structure if it exists (v2 format)
    const basicDetails = form.getValues('basicDetails');
    if (basicDetails) {
      console.log(`Also updating nested basicDetails.${field}:`, value);
      
      // Convert value format for nested structure if needed
      let structuredValue = value;
      if (field === 'floor' || field === 'totalFloors' || field === 'builtUpArea' || 
          field === 'cabins' || field === 'conferenceRooms' || field === 'carParking' || 
          field === 'bikeParking') {
        const numValue = parseInt(value);
        structuredValue = !isNaN(numValue) ? numValue : null;
      }
      
      // Update the nested field
      const updatedBasicDetails = {
        ...basicDetails,
        [field]: structuredValue
      };
      
      form.setValue('basicDetails', updatedBasicDetails, { shouldValidate: false });
    }
    
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
              onValueChange={(value) => updateFormAndState('buildingType', value)}
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
              onValueChange={(value) => updateFormAndState('ageOfProperty', value)}
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
                onValueChange={(value) => updateFormAndState('receptionArea', value)}
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
              onValueChange={(value) => updateFormAndState('furnishing', value)}
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
              onChange={(e) => handleNumberInput(e.target.value, 'carParking')}
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
              onChange={(e) => handleNumberInput(e.target.value, 'bikeParking')}
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