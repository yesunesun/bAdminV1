// src/components/property/PropertyDetails.tsx
// Version: 1.3.0
// Last Modified: 2025-01-30T16:35:00+05:30 (IST)
// Author: Bhoomitalli Team

import React from 'react';
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

export function PropertyDetails({ form, mode = 'create' }: FormSectionProps) {
  const { register, watch, setValue, formState: { errors }, trigger } = form;

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const value = e.target.value;
    if (value === '') {
      setValue(fieldName, '');
      return;
    }
    
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      e.preventDefault();
      return;
    }
    
    if (numValue < 0) {
      setValue(fieldName, '0');
      return;
    }
    
    setValue(fieldName, numValue.toString());
    trigger(fieldName);
  };

  return (
    <FormSection
      title="Property Details"
      description="Tell us about your property"
    >
      <div className="space-y-4">
        {/* Basic Property Info - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Type</RequiredLabel>
            <Select 
              value={watch('propertyType')} 
              onValueChange={value => setValue('propertyType', value)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Type of property?" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyType && (
              <p className="text-sm text-red-600 mt-0.5">{errors.propertyType.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>BHK</RequiredLabel>
            <Select 
              value={watch('bhkType')} 
              onValueChange={value => setValue('bhkType', value)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Number of bedrooms?" />
              </SelectTrigger>
              <SelectContent>
                {BHK_TYPES.map(type => (
                  <SelectItem key={type} value={type} className="text-base">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bhkType && (
              <p className="text-sm text-red-600 mt-0.5">{errors.bhkType.message}</p>
            )}
          </div>
        </div>

        {/* Floor Details - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Floor</RequiredLabel>
            <Input
              type="number"
              min="0"
              className="h-11 text-base"
              {...register('floor')}
              placeholder="Floor number (0 = ground)"
              onChange={(e) => handleNumberInput(e, 'floor')}
            />
            {errors.floor && (
              <p className="text-sm text-red-600 mt-0.5">{errors.floor.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Total Floors</RequiredLabel>
            <Input
              type="number"
              min="1"
              className="h-11 text-base"
              {...register('totalFloors')}
              placeholder="Building total floors"
              onChange={(e) => handleNumberInput(e, 'totalFloors')}
            />
            {errors.totalFloors && (
              <p className="text-sm text-red-600 mt-0.5">{errors.totalFloors.message}</p>
            )}
          </div>
        </div>

        {/* Property Age and Facing - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Age</RequiredLabel>
            <Select 
              value={watch('propertyAge')} 
              onValueChange={value => setValue('propertyAge', value)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Property age?" />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_AGE.map(age => (
                  <SelectItem key={age} value={age} className="text-base">
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.propertyAge && (
              <p className="text-sm text-red-600 mt-0.5">{errors.propertyAge.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>Facing</RequiredLabel>
            <Select 
              value={watch('facing')} 
              onValueChange={value => setValue('facing', value)}
            >
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="Direction facing?" />
              </SelectTrigger>
              <SelectContent>
                {FACING_OPTIONS.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.facing && (
              <p className="text-sm text-red-600 mt-0.5">{errors.facing.message}</p>
            )}
          </div>
        </div>

        {/* Area and Title - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel required>Built-up Area</RequiredLabel>
            <div className="relative">
              <Input
                type="number"
                min="100"
                className="h-11 pr-16 text-base"
                {...register('builtUpArea')}
                placeholder="Area (min. 100)"
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setValue('builtUpArea', '');
                    return;
                  }
                  const numValue = parseInt(value);
                  if (!isNaN(numValue) && numValue >= 100) {
                    setValue('builtUpArea', numValue.toString());
                  }
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">
                sq ft
              </span>
            </div>
            {errors.builtUpArea && (
              <p className="text-sm text-red-600 mt-0.5">{errors.builtUpArea.message}</p>
            )}
          </div>

          {mode === 'create' && (
            <div>
              <RequiredLabel>Title</RequiredLabel>
              <Input
                className="h-11 text-base"
                {...register('title')}
                placeholder="E.g., Spacious 2BHK in Gachibowli"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-0.5">{errors.title.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
}