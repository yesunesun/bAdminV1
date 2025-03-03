// src/modules/owner/components/property/wizard/sections/LocationDetails/components/LocationSelectors.tsx
// Version: 1.0.0
// Last Modified: 03-03-2025 22:45 IST
// Purpose: Location selectors component for Telangana state

import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Input } from '@/components/ui/input';
import { FormData } from '../../../../types';
import { TELANGANA_DISTRICTS, CITIES_BY_DISTRICT, LOCALITIES_BY_CITY } from '../constants';

interface LocationSelectorsProps {
  form: UseFormReturn<FormData>;
}

export function LocationSelectors({ form }: LocationSelectorsProps) {
  const { setValue, formState: { errors }, watch } = form;
  const district = watch('district');
  const city = watch('city');
  const locality = watch('locality');
  
  // Set Telangana as default state
  useEffect(() => {
    if (!form.getValues('state')) {
      setValue('state', 'Telangana');
    }
  }, [form, setValue]);
  
  // Reset dependent fields when parent field changes
  useEffect(() => {
    if (district && !CITIES_BY_DISTRICT[district]?.includes(city)) {
      setValue('city', '');
      setValue('locality', '');
    }
  }, [district, city, setValue]);
  
  useEffect(() => {
    if (city && !LOCALITIES_BY_CITY[city]?.includes(locality)) {
      setValue('locality', '');
    }
  }, [city, locality, setValue]);
  
  // Get the list of cities based on selected district
  const cities = district ? (CITIES_BY_DISTRICT[district] || []) : [];
  
  // Get the list of localities based on selected city
  const localities = city ? (LOCALITIES_BY_CITY[city] || []) : [];
  
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
        <input type="hidden" {...form.register('state')} value="Telangana" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* District Selector */}
        <div>
          <RequiredLabel required>District</RequiredLabel>
          <Select
            value={district}
            onValueChange={value => setValue('district', value)}
          >
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {TELANGANA_DISTRICTS.map(dist => (
                <SelectItem key={dist} value={dist} className="text-base">
                  {dist}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.district && (
            <p className="text-sm text-red-600 mt-0.5">{errors.district.message}</p>
          )}
        </div>

        {/* City Selector */}
        <div>
          <RequiredLabel required>City</RequiredLabel>
          <Select
            value={city}
            onValueChange={value => setValue('city', value)}
            disabled={!district}
          >
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder={district ? "Select city" : "Select district first"} />
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
        {/* Locality Selector */}
        <div>
          <RequiredLabel required>Locality</RequiredLabel>
          <Select
            value={locality}
            onValueChange={value => setValue('locality', value)}
            disabled={!city}
          >
            <SelectTrigger className="h-11 text-base">
              <SelectValue placeholder={city ? "Select locality" : "Select city first"} />
            </SelectTrigger>
            <SelectContent>
              {localities.map(loc => (
                <SelectItem key={loc} value={loc} className="text-base">
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.locality && (
            <p className="text-sm text-red-600 mt-0.5">{errors.locality.message}</p>
          )}
        </div>

        {/* Area Input */}
        <div>
          <RequiredLabel required>Area</RequiredLabel>
          <Input
            {...form.register('area')}
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