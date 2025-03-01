// src/modules/owner/components/property/wizard/sections/PropertyDetails.tsx
// Version: 3.2.0
// Last Modified: 01-03-2025 12:30 IST
// Purpose: Fixed Built-up Area field to allow manual editing and improved input handling

import React, { useEffect, useState } from 'react';
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
} from '../constants';

export function PropertyDetails({ form, mode = 'create', category, adType }: FormSectionProps) {
  // Get initial form values directly
  const initialValues = form.getValues();
  
  // Use component state to render values with proper initialization
  const [values, setValues] = useState({
    propertyType: initialValues.propertyType || category || '',
    bhkType: initialValues.bhkType || '',
    floor: initialValues.floor || '',
    totalFloors: initialValues.totalFloors || '',
    propertyAge: initialValues.propertyAge || '',
    facing: initialValues.facing || '',
    builtUpArea: initialValues.builtUpArea || '',
    title: initialValues.title || ''
  });
  
  // Log initial values for debugging
  useEffect(() => {
    console.log('PropertyDetails component mount with initial values:', initialValues);
    console.log('State values initialized as:', values);
  }, []);
  
  // Subscribe to form changes to keep local state in sync
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only update our state if specific fields we care about change
      if (name && ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'title'].includes(name)) {
        console.log(`Form field "${name}" changed to:`, value[name]);
        setValues(prev => ({
          ...prev,
          [name]: value[name] || ''
        }));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // After the component mounts, check if we need to sync state with form
  useEffect(() => {
    const formValues = form.getValues();
    const needsSync = Object.entries({
      propertyType: formValues.propertyType || category || '',
      bhkType: formValues.bhkType || '',
      floor: formValues.floor || '',
      totalFloors: formValues.totalFloors || '',
      propertyAge: formValues.propertyAge || '',
      facing: formValues.facing || '',
      builtUpArea: formValues.builtUpArea || '',
      title: formValues.title || ''
    }).some(([key, value]) => values[key as keyof typeof values] !== value);
    
    if (needsSync) {
      console.log('Syncing component state with form values');
      setValues({
        propertyType: formValues.propertyType || category || '',
        bhkType: formValues.bhkType || '',
        floor: formValues.floor || '',
        totalFloors: formValues.totalFloors || '',
        propertyAge: formValues.propertyAge || '',
        facing: formValues.facing || '',
        builtUpArea: formValues.builtUpArea || '',
        title: formValues.title || ''
      });
    }
  }, [form, category]);
  
  // Update form when local state changes
  const updateFormAndState = (field: string, value: any) => {
    // Update local state
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update form
    form.setValue(field, value, { shouldValidate: true });
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

        {/* Area and Title - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required className="text-base">Built-up Area</RequiredLabel>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                className="h-11 text-base pr-16"
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
                    
                    // Validate the minimum value only when submitting or leaving the field
                    // This allows free editing while typing
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-base text-slate-500 pointer-events-none">
                sq ft
              </span>
            </div>
          </div>

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
      </div>
      
      {/* Add a special auto-refresh button in development */}
      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={() => {
            // Direct access to form values
            const currentValues = form.getValues();
            console.log('Manual refresh - current form values:', currentValues);
            
            // Force update local state from form values
            setValues({
              propertyType: currentValues.propertyType || category || '',
              bhkType: currentValues.bhkType || '',
              floor: currentValues.floor || '',
              totalFloors: currentValues.totalFloors || '',
              propertyAge: currentValues.propertyAge || '',
              facing: currentValues.facing || '',
              builtUpArea: currentValues.builtUpArea || '',
              title: currentValues.title || ''
            });
          }}
          className="mt-4 px-3 py-1 text-xs bg-blue-500 text-white rounded"
        >
          Reload Form Values
        </button>
      )}
    </FormSection>
  );
}