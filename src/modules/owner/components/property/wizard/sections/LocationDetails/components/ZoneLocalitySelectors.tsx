// src/modules/owner/components/property/wizard/sections/LocationDetails/components/ZoneLocalitySelectors.tsx
// Version: 1.0.0
// Last Modified: 28-02-2025 19:25 IST
// Purpose: Zone and locality selector component

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { FormData } from '../../../../types';
// Update import to use local constants
import { HYDERABAD_LOCATIONS } from '../constants';

interface ZoneLocalitySelectorsProps {
  form: UseFormReturn<FormData>;
  selectedZone: string;
  localities: string[];
}

export function ZoneLocalitySelectors({ form, selectedZone, localities }: ZoneLocalitySelectorsProps) {
  const { setValue, formState: { errors }, watch } = form;
  const zone = watch('zone');
  const locality = watch('locality');
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <RequiredLabel required>Zone</RequiredLabel>
        <Select 
          value={zone}
          onValueChange={(value) => setValue('zone', value)}
        >
          <SelectTrigger className="h-11 text-base">
            <SelectValue placeholder="Select area zone" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(HYDERABAD_LOCATIONS).map(zoneOption => (
              <SelectItem key={zoneOption} value={zoneOption} className="text-base">
                {zoneOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.zone && (
          <p className="text-sm text-red-600 mt-0.5">{errors.zone.message}</p>
        )}
      </div>

      <div>
        <RequiredLabel required>Locality</RequiredLabel>
        <Select
          value={locality}
          onValueChange={value => setValue('locality', value)}
          disabled={!selectedZone}
        >
          <SelectTrigger className="h-11 text-base">
            <SelectValue placeholder={selectedZone ? "Select locality" : "Select zone first"} />
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
    </div>
  );
}