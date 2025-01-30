// src/components/property/LocationDetails.tsx
// Version: 1.2.0
// Last Modified: 2025-01-30T17:05:00+05:30 (IST)
// Author: Bhoomitalli Team

import React, { useState, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSectionProps } from '../types';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { MapPin } from 'lucide-react';
import { HYDERABAD_LOCATIONS } from '../constants';

export function LocationDetails({ form }: FormSectionProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [localities, setLocalities] = useState<string[]>([]);

  const zone = watch('zone');
  const locality = watch('locality');
  const pinCode = watch('pinCode');

  useEffect(() => {
    if (zone) {
      setSelectedZone(zone);
      setLocalities(HYDERABAD_LOCATIONS[zone as keyof typeof HYDERABAD_LOCATIONS] || []);
      // Clear locality when zone changes
      if (!HYDERABAD_LOCATIONS[zone as keyof typeof HYDERABAD_LOCATIONS]?.includes(locality)) {
        setValue('locality', '');
      }
    }
  }, [zone, locality, setValue]);

  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('pinCode', value);
  };

  return (
    <FormSection
      title="Location Details"
      description="Where is your property located?"
    >
      <div className="space-y-4">
        {/* Zone and Locality Selection - Two Column */}
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

        {/* Landmark and PIN Code - Two Column */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <RequiredLabel>Landmark</RequiredLabel>
            <Input
              className="h-11 text-base"
              {...register('landmark')}
              placeholder="Nearby landmark"
            />
            {errors.landmark && (
              <p className="text-sm text-red-600 mt-0.5">{errors.landmark.message}</p>
            )}
          </div>

          <div>
            <RequiredLabel required>PIN Code</RequiredLabel>
            <Input
              value={pinCode}
              onChange={handlePinCodeChange}
              className="h-11 text-base"
              maxLength={6}
              placeholder="6-digit PIN code"
            />
            {errors.pinCode && (
              <p className="text-sm text-red-600 mt-0.5">{errors.pinCode.message}</p>
            )}
          </div>
        </div>

        {/* Complete Address */}
        <div>
          <RequiredLabel required>Complete Address</RequiredLabel>
          <div className="relative">
            <textarea
              {...register('address')}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 py-3 text-base
                shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400
                focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100
                hover:border-slate-300"
              placeholder="Building name, street, area"
            />
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          </div>
          {errors.address && (
            <p className="text-sm text-red-600 mt-0.5">{errors.address.message}</p>
          )}
        </div>

        {/* Map Section */}
        <div className="space-y-2">
          <RequiredLabel>Location on Map</RequiredLabel>
          <div className="relative rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            {/* Map Container */}
            <div className="h-48 w-full">
              {/* Map will be initialized here */}
              <div 
                id="map"
                className="w-full h-full bg-slate-100 relative"
              >
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <p className="text-sm">Click to mark your property location</p>
                </div>
              </div>
            </div>
            
            {/* Optional: Map Controls */}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50"
                onClick={() => {/* Implement map reset */}}
              >
                <MapPin className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            * Marking location helps tenants find your property easily
          </p>
        </div>
      </div>
    </FormSection>
  );
}