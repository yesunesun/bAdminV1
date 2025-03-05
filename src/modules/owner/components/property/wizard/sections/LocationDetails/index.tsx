// src/modules/owner/components/property/wizard/sections/LocationDetails/index.tsx
// Version: 3.0.0
// Last Modified: 06-03-2025 15:30 IST
// Purpose: Simplified LocationDetails component with address and PIN code only

import React, { useRef } from 'react';
import { FormSection } from '@/components/FormSection';
import { FormSectionProps } from '../../../types';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { useMapInteractions } from './hooks/useMapInteractions';
import { LandmarkPincodeInputs } from './components/LandmarkPincodeInputs';
import { AddressInput } from './components/AddressInput';
import { FlatPlotInput } from './components/FlatPlotInput';
import { MapContainer } from './components/MapContainer';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

// Define global initialization function
if (typeof window !== 'undefined') {
  window.initGoogleMaps = () => {
    console.log("Google Maps initialized");
  };
}

export function LocationDetails({ form }: FormSectionProps) {
  const { setValue, watch } = form;
  const mapRef = useRef<HTMLDivElement>(null);

  // Get form values
  const address = watch('address');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  // Load Google Maps API
  const { mapLoaded, mapError: apiError } = useGoogleMaps();

  // Setup map interactions
  const {
    isGeolocating,
    isGeocoding,
    mapError: interactionError,
    getUserCurrentLocation,
    findAddressOnMap,
    resetMarker
  } = useMapInteractions({ form, mapLoaded, mapRef });

  // Handle pin code input to only allow numbers
  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('pinCode', value);
  };

  // Combine error messages
  const mapError = apiError || interactionError;

  return (
    <FormSection
      title="Location Details"
      description="Where is your property located?"
    >
      <div className="space-y-4">
        {/* Flat No/Plot No Field */}
        <FlatPlotInput form={form} />
        
        {/* Address with Map Controls */}
        <div>
          <AddressInput form={form} />
          
          <div className="flex justify-end mt-2 gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              onClick={findAddressOnMap}
              disabled={!mapLoaded || !address || isGeocoding}
            >
              <MapPin className="h-5 w-5" />
              <span>{isGeocoding ? 'Finding...' : 'Find on Map'}</span>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              onClick={getUserCurrentLocation}
              disabled={!mapLoaded || isGeolocating}
            >
              <Navigation className="h-5 w-5" />
              <span>{isGeolocating ? 'Locating...' : 'Use My Location'}</span>
            </Button>
          </div>
        </div>

        {/* Landmark and PIN Code */}
        <LandmarkPincodeInputs 
          form={form} 
          handlePinCodeChange={handlePinCodeChange} 
        />

        {/* Map Container */}
        <MapContainer
          mapRef={mapRef}
          mapLoaded={mapLoaded}
          mapError={mapError}
          resetMarker={resetMarker}
          latitude={latitude}
          longitude={longitude}
        />

        {/* Hidden inputs for coordinates and removed fields */}
        <input type="hidden" {...form.register('latitude')} />
        <input type="hidden" {...form.register('longitude')} />
        <input type="hidden" {...form.register('state')} value="" />
        <input type="hidden" {...form.register('district')} value="" />
        <input type="hidden" {...form.register('city')} value="" />
        <input type="hidden" {...form.register('locality')} value="" />
        <input type="hidden" {...form.register('area')} value="" />
      </div>
    </FormSection>
  );
}

// Add this globally for TypeScript
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}