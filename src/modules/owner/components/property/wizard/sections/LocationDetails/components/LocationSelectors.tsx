// src/modules/owner/components/property/wizard/sections/LocationDetails/components/LocationSelectors.tsx
// Version: 1.2.0
// Last Modified: 05-03-2025 20:45 IST
// Purpose: Location selectors component with editable locality text input

import React, { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { FormData } from '../../../../types';
import { CITIES_BY_DISTRICT, LOCALITIES_BY_CITY } from '../constants';

interface LocationSelectorsProps {
  form: UseFormReturn<FormData>;
}

export function LocationSelectors({ form }: LocationSelectorsProps) {
  const { setValue, formState: { errors }, watch, register } = form;
  const city = watch('city');
  
  // State to hold suggested localities for autofill
  const [suggestedLocalities, setSuggestedLocalities] = useState<string[]>([]);
  
  // Set defaults - Telangana state and Hyderabad district
  useEffect(() => {
    if (!form.getValues('state')) {
      setValue('state', 'Telangana');
    }
    
    // Always set district to Hyderabad - the only supported district
    setValue('district', 'Hyderabad');
  }, [form, setValue]);
  
  // Update suggested localities when city changes
  useEffect(() => {
    if (city) {
      const localities = LOCALITIES_BY_CITY[city] || [];
      setSuggestedLocalities(localities);
      
      // Auto-fill locality with the first locality in the list if available and locality is not set
      if (localities.length > 0 && !form.getValues('locality')) {
        setValue('locality', localities[0]);
      }
    } else {
      setSuggestedLocalities([]);
    }
  }, [city, setValue, form]);
  
  // Get the list of cities based on Hyderabad district
  const cities = CITIES_BY_DISTRICT['Hyderabad'] || [];
  
  return (
    <div className="space-y-4">
      {/* State - Hardcoded to Telangana */}
      <div>
        <RequiredLabel required>State</RequiredLabel>
        <Input
          value="Telangana"
          readOnly
          className="h-11 text-base bg-slate-50"
        />
        <input type="hidden" {...register('state')} value="Telangana" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* District - Hardcoded to Hyderabad */}
        <div>
          <RequiredLabel required>District</RequiredLabel>
          <Input
            value="Hyderabad"
            readOnly
            className="h-11 text-base bg-slate-50"
          />
          <input type="hidden" {...register('district')} value="Hyderabad" />
        </div>

        {/* City Selector - Only cities in Hyderabad district */}
        <div>
          <RequiredLabel required>City</RequiredLabel>
          <Select
            value={city}
            onValueChange={value => setValue('city', value)}
          >
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map(cityOption => (
                <SelectItem key={cityOption} value={cityOption} className="text-base">
                  {cityOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.city && (
            <p className="text-sm text-red-600 mt-0.5">{errors.city.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Locality Input (replaced dropdown) */}
        <div>
          <RequiredLabel required>Locality</RequiredLabel>
          <div>
            <Input
              {...register('locality')}
              placeholder={city ? "Enter locality" : "Select city first"}
              disabled={!city}
              className="h-11 text-base"
              list="locality-suggestions"
            />
            {/* Datalist for suggestions */}
            <datalist id="locality-suggestions">
              {suggestedLocalities.map(loc => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
          </div>
          {errors.locality && (
            <p className="text-sm text-red-600 mt-0.5">{errors.locality.message}</p>
          )}
        </div>

        {/* Area Input */}
        <div>
          <RequiredLabel required>Area</RequiredLabel>
          <Input
            {...register('area')}
            placeholder="Enter area name"
            className="h-11 text-base"
          />
          {errors.area && (
            <p className="text-sm text-red-600 mt-0.5">{errors.area.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}