import React, { useState, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSectionProps } from './types';
import { HYDERABAD_LOCATIONS } from './constants';

export function LocationDetails({ form }: FormSectionProps) {
  const { register, formState: { errors }, setValue, watch } = form;
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [localities, setLocalities] = useState<string[]>([]);
  const [mapKey, setMapKey] = useState(0);

  const zone = watch('zone');
  const locality = watch('locality');

  useEffect(() => {
    if (zone) {
      setSelectedZone(zone);
      setLocalities(HYDERABAD_LOCATIONS[zone as keyof typeof HYDERABAD_LOCATIONS] || []);
    }
  }, [zone]);

  return (
    <FormSection
      title="Locality Details"
      description="Select your property's location in Hyderabad."
    >
      <div className="space-y-6">
        <div>
          <Label htmlFor="zone">Zone</Label>
          <Select 
            value={zone}
            onValueChange={(value) => {
              setValue('zone', value);
              setSelectedZone(value);
              setValue('locality', '');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select zone in Hyderabad" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(HYDERABAD_LOCATIONS).map(zone => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="locality">Locality</Label>
          <Select
            value={locality}
            onValueChange={value => setValue('locality', value)}
            disabled={!selectedZone}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedZone ? "Select locality" : "Select zone first"} />
            </SelectTrigger>
            <SelectContent>
              {localities.map(locality => (
                <SelectItem key={locality} value={locality}>{locality}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.locality && (
            <p className="text-sm text-red-600 mt-1">{errors.locality.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="landmark">Landmark / Street</Label>
          <Input
            id="landmark"
            {...register('landmark')}
            placeholder="Enter nearby landmark or street name"
          />
          {errors.landmark && (
            <p className="text-sm text-red-600 mt-1">{errors.landmark.message}</p>
          )}
        </div>

        <div>
          <Label>Mark Location on Map</Label>
          <div className="mt-2 h-48 rounded-xl overflow-hidden border border-slate-200">
            <div 
              id="map"
              key={mapKey}
              className="w-full h-full bg-slate-100"
            />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Click on the map to mark your property's exact location
          </p>
        </div>

        <div>
          <Label htmlFor="address">Complete Address</Label>
          <textarea
            id="address"
            {...register('address')}
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-base transition-all
              shadow-[0_2px_4px_rgba(0,0,0,0.02)] placeholder:text-slate-400
              focus:border-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-100
              hover:border-slate-300 hover:shadow-[0_3px_6px_rgba(0,0,0,0.04)]"
            placeholder="Enter complete address"
          />
          {errors.address && (
            <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="pinCode">PIN Code</Label>
            <Input
              id="pinCode"
              {...register('pinCode')}
              placeholder="6-digit PIN code"
            />
            {errors.pinCode && (
              <p className="text-sm text-red-600 mt-1">{errors.pinCode.message}</p>
            )}
          </div>
        </div>
      </div>
    </FormSection>
  );
}