// src/modules/owner/components/property/wizard/sections/PropertyDetails.tsx
// Version: 4.2.0
// Last Modified: 20-05-2025 16:30 IST
// Purpose: Fix field duplication - stop adding fields to root level when setting step values

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
  // Track mount status to avoid updates after unmount
  const isMounted = useRef(true);
  
  // Track if initial form values have been processed
  const initialProcessDone = useRef(false);
  
  // Generate stepId based on current flow if not provided
  const formFlow = form.getValues('flow');
  const flowType = formFlow ? `${formFlow.category}_${formFlow.listingType}` : 'residential_rent';
  
  // Determine the appropriate stepId based on flow type
  let stepId = providedStepId;
  if (!stepId) {
    // Generate step ID based on flow
    const prefix = flowType.split('_').map(part => part.substring(0, 3)).join('_');
    stepId = `${prefix}_basic_details`;
  }
  
  // Helper functions to work with the form directly
  const getField = (fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    
    // First try to get from new structure
    const stepValue = form.getValues(path);
    if (stepValue !== undefined) {
      return stepValue;
    }
    
    // Fallback to legacy structure
    const legacyValue = form.getValues(fieldName);
    if (legacyValue !== undefined) {
      return legacyValue;
    }
    
    // Check nested basicDetails structure
    const basicDetails = form.getValues('basicDetails');
    if (basicDetails && basicDetails[fieldName] !== undefined) {
      return basicDetails[fieldName];
    }
    
    return defaultValue;
  };
  
  const saveField = (fieldName: string, value: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    
    // Ensure the steps structure exists
    const steps = form.getValues('steps') || {};
    if (!steps[stepId]) {
      // Create the step object if it doesn't exist 
      form.setValue('steps', {
        ...steps,
        [stepId]: {}
      }, { shouldValidate: false });
    }
    
    // Set the value in the step structure only
    form.setValue(path, value, { shouldValidate: true });
    
    // REMOVED: No longer update root level for backward compatibility
    // form.setValue(fieldName, value, { shouldValidate: false });
    
    // Update nested basicDetails structure if it exists (v2 format)
    // We keep this for backward compatibility with v2 formats
    const basicDetails = form.getValues('basicDetails');
    if (basicDetails) {
      // Convert value format for nested structure if needed
      let structuredValue = value;
      if (fieldName === 'floor' || fieldName === 'totalFloors' || fieldName === 'builtUpArea') {
        const numValue = parseInt(value);
        structuredValue = !isNaN(numValue) ? numValue : null;
      }
      
      // Update the nested field
      const updatedBasicDetails = {
        ...basicDetails,
        [fieldName]: structuredValue
      };
      
      form.setValue('basicDetails', updatedBasicDetails, { shouldValidate: false });
    }
  };
  
  // Get initial form values directly
  const initialValues = form.getValues();
  
  // Use component state to render values with proper initialization
  const [values, setValues] = useState({
    propertyType: getField('propertyType', '') || category || '',
    bhkType: getField('bhkType', ''),
    floor: getField('floor', ''),
    totalFloors: getField('totalFloors', ''),
    propertyAge: getField('propertyAge', ''),
    facing: getField('facing', ''),
    builtUpArea: getField('builtUpArea', ''),
    builtUpAreaUnit: getField('builtUpAreaUnit', 'sqft'), // Always default to sqft
    possessionDate: getField('possessionDate', ''),
    title: getField('title', '')
  });
  
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
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting up form subscription');
    }
    
    // Watch all fields that we're interested in
    const watchFields = [
      'propertyType', 
      'bhkType', 
      'floor', 
      'totalFloors', 
      'propertyAge', 
      'facing', 
      'builtUpArea', 
      'builtUpAreaUnit', 
      'possessionDate', 
      'title',
      // Also watch v2 nested structure fields
      'basicDetails'
    ];
    
    // Subscribe to form changes for specific fields
    const subscription = form.watch((value, { name, type }) => {
      updateCounter.current += 1;
      const count = updateCounter.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${count}] Form update - Changed field: ${name}, Type: ${type}`);
      }
      
      // If specific fields we care about change, update our state
      if (watchFields.includes(name as string) || name === undefined) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${count}] Updating component state from form values`);
        }
        updateStateFromForm(true, `subscription-${count}`);
      }
      
      // For nested structure changes (v2 format)
      if (name === 'basicDetails') {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${count}] Updating from nested basicDetails structure`);
        }
        const basicDetails = form.getValues('basicDetails');
        if (basicDetails) {
          // Update flat fields from nested structure
          const nestedValues = {
            title: basicDetails.title || values.title,
            propertyType: basicDetails.propertyType || values.propertyType,
            bhkType: basicDetails.bhkType || values.bhkType,
            floor: basicDetails.floor?.toString() || values.floor,
            totalFloors: basicDetails.totalFloors?.toString() || values.totalFloors,
            propertyAge: basicDetails.propertyAge || values.propertyAge,
            facing: basicDetails.facing || values.facing,
            builtUpArea: basicDetails.builtUpArea?.toString() || values.builtUpArea,
            builtUpAreaUnit: basicDetails.builtUpAreaUnit || values.builtUpAreaUnit
          };
          
          if (process.env.NODE_ENV === 'development') {
            console.log(`[${count}] Updating flat fields from nested values:`, nestedValues);
          }
          
          // Set local state
          if (isMounted.current) {
            setValues(prev => ({...prev, ...nestedValues}));
          }
          
          // Also set fields in step structure if they're not already set
          Object.entries(nestedValues).forEach(([field, value]) => {
            const stepPath = `steps.${stepId}.${field}`;
            const currentStepValue = form.getValues(stepPath);
            
            if (!currentStepValue && value) {
              if (process.env.NODE_ENV === 'development') {
                console.log(`[${count}] Setting field ${field} from nested structure to step:`, value);
              }
              // Only set in the step structure, not at root
              form.setValue(stepPath, value, { shouldValidate: false });
            }
          });
        }
      }
    });
    
    // One-time initialization
    if (!initialProcessDone.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('First-time processing of initial values');
      }
      initialProcessDone.current = true;
      
      // Ensure builtUpAreaUnit has a default value of 'sqft'
      if (!getField('builtUpAreaUnit')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Setting default builtUpAreaUnit to sqft');
        }
        saveField('builtUpAreaUnit', 'sqft');
      }
      
      // Process nested structure (v2 format)
      const basicDetails = form.getValues('basicDetails');
      if (basicDetails) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Processing nested basicDetails:', basicDetails);
        }
        
        // Map nested values to fields in the step structure if they're not set
        if (basicDetails.propertyType && !getField('propertyType')) {
          saveField('propertyType', basicDetails.propertyType);
        }
        if (basicDetails.bhkType && !getField('bhkType')) {
          saveField('bhkType', basicDetails.bhkType);
        }
        if (basicDetails.floor && !getField('floor')) {
          saveField('floor', basicDetails.floor.toString());
        }
        if (basicDetails.totalFloors && !getField('totalFloors')) {
          saveField('totalFloors', basicDetails.totalFloors.toString());
        }
        if (basicDetails.propertyAge && !getField('propertyAge')) {
          saveField('propertyAge', basicDetails.propertyAge);
        }
        if (basicDetails.facing && !getField('facing')) {
          saveField('facing', basicDetails.facing);
        }
        if (basicDetails.builtUpArea && !getField('builtUpArea')) {
          saveField('builtUpArea', basicDetails.builtUpArea.toString());
        }
        if (basicDetails.builtUpAreaUnit && !getField('builtUpAreaUnit')) {
          saveField('builtUpAreaUnit', basicDetails.builtUpAreaUnit);
        }
      }
      
      // Also handle migration from root to step structure for legacy data
      const rootFields = [
        'propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 
        'facing', 'builtUpArea', 'builtUpAreaUnit', 'possessionDate', 'title'
      ];
      
      rootFields.forEach(field => {
        const rootValue = form.getValues(field);
        const stepValue = form.getValues(`steps.${stepId}.${field}`);
        
        // If value exists at root but not in step, migrate it
        if (rootValue !== undefined && stepValue === undefined) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Migrating ${field} from root to step:`, rootValue);
          }
          
          // Set in step structure without updating root again
          const path = `steps.${stepId}.${field}`;
          form.setValue(path, rootValue, { shouldValidate: false });
        }
      });
      
      // Update state after processing initial values
      updateStateFromForm(false, 'initial-process');
    }
    
    return () => subscription.unsubscribe();
  }, [form, category, stepId]);
  
  // Function to update component state from form values
  const updateStateFromForm = (validateAfter = false, source = 'unknown') => {
    if (!isMounted.current) return;
    
    const formValues = form.getValues();
    if (process.env.NODE_ENV === 'development') {
      console.log(`Updating state from form values (source: ${source})`, formValues);
    }
    
    // Get current step data
    const stepData = form.getValues(`steps.${stepId}`) || {};
    
    // Ensure builtUpAreaUnit has a value
    const areaUnit = stepData.builtUpAreaUnit || formValues.builtUpAreaUnit || 'sqft';
    
    // Create new state object based on current form values
    const newValues = {
      propertyType: stepData.propertyType || formValues.propertyType || category || '',
      bhkType: stepData.bhkType || formValues.bhkType || '',
      floor: stepData.floor?.toString() || formValues.floor || '',
      totalFloors: stepData.totalFloors?.toString() || formValues.totalFloors || '',
      propertyAge: stepData.propertyAge || formValues.propertyAge || '',
      facing: stepData.facing || formValues.facing || '',
      builtUpArea: stepData.builtUpArea?.toString() || formValues.builtUpArea || '',
      builtUpAreaUnit: areaUnit,
      possessionDate: stepData.possessionDate || formValues.possessionDate || '',
      title: stepData.title || formValues.title || ''
    };
    
    // Only update state if any values have changed
    const hasChanges = Object.entries(newValues).some(([key, value]) => {
      const currentValue = values[key as keyof typeof values];
      return currentValue !== value;
    });
    
    if (hasChanges) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`State needs update - Changes detected (source: ${source})`, newValues);
      }
      setValues(newValues);
      
      // Validate form after update if requested
      if (validateAfter) {
        setTimeout(() => {
          form.trigger();
        }, 100);
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(`No state changes needed (source: ${source})`);
      }
    }
  };
  
  // Update form when local state changes
  const updateFormAndState = (field: string, value: any) => {
    // Update local state
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Save using the step-based structure
    saveField(field, value);
    
    // Debug log
    if (process.env.NODE_ENV === 'development') {
      console.log(`Updated ${field} to:`, value);
    }
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
  
  // Get tomorrow's date in YYYY-MM-DD format for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <FormSection
      title="Property Details"
      description="Tell us about your property"
      className="text-base"
    >
      <div className="space-y-4">
        {/* Basic Property Info - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Type</RequiredLabel>
            <Select 
              value={values.propertyType}
              onValueChange={(value) => updateFormAndState('propertyType', value)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Type of property?" />
              </SelectTrigger>
              <SelectContent className="text-base">
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <RequiredLabel required className="text-base">BHK</RequiredLabel>
            <Select 
              value={values.bhkType}
              onValueChange={(value) => updateFormAndState('bhkType', value)}
            >
              <SelectTrigger className="h-11 text-base">
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

        {/* Property Age and Facing - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Age</RequiredLabel>
            <Select 
              value={values.propertyAge}
              onValueChange={(value) => updateFormAndState('propertyAge', value)}
            >
              <SelectTrigger className="h-11 text-base">
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
          </div>

          <div>
            <RequiredLabel required className="text-base">Facing</RequiredLabel>
            <Select 
              value={values.facing}
              onValueChange={(value) => updateFormAndState('facing', value)}
            >
              <SelectTrigger className="h-11 text-base">
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
          </div>
        </div>

        {/* Area and Possession Date - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Built-up Area</RequiredLabel>
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
                // Ensure a default value is always set
                defaultValue="sqft"
                value={unitValue}
                onValueChange={(value) => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log('Area unit selected:', value);
                  }
                  updateFormAndState('builtUpAreaUnit', value);
                }}
              >
                <SelectTrigger className="h-11 text-base w-28">
                  <SelectValue>
                    {unitValue === 'sqft' ? 'sq ft' : 'sq yard'}
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

          <div>
            <RequiredLabel className="text-base">Possession Date</RequiredLabel>
            <Input
              type="date"
              className="h-11 text-base"
              min={minDate}
              value={values.possessionDate}
              onChange={(e) => updateFormAndState('possessionDate', e.target.value)}
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
              placeholder="E.g., Spacious 2BHK in Gachibowli"
            />
          </div>
        )}
      </div>
    </FormSection>
  );
}