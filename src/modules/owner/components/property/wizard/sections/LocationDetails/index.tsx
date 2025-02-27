// src/modules/owner/components/property/wizard/sections/LocationDetails/index.tsx
// Version: 1.2.0
// Last Modified: 28-02-2025 21:15 IST
// Purpose: Main LocationDetails component with local constants

import React, { useState, useRef, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { FormSectionProps } from '../../../types';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { useMapInteractions } from './hooks/useMapInteractions';
import { ZoneLocalitySelectors } from './components/ZoneLocalitySelectors';
import { LandmarkPincodeInputs } from './components/LandmarkPincodeInputs';
import { AddressInput } from './components/AddressInput';
import { MapControls } from './components/MapControls';
import { MapContainer } from './components/MapContainer';
// Import from local constants file
import { HYDERABAD_LOCATIONS } from './constants';

// Define global initialization function
if (typeof window !== 'undefined') {
  window.initGoogleMaps = () => {
    console.log("Google Maps initialized");
  };
}

export function LocationDetails({ form }: FormSectionProps) {
  const { setValue, watch } = form;
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [localities, setLocalities] = useState<string[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  const zone = watch('zone');
  const locality = watch('locality');
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

  // Update localities when zone changes
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
        {/* Zone and Locality Selection */}
        <ZoneLocalitySelectors 
          form={form} 
          selectedZone={selectedZone} 
          localities={localities} 
        />

        {/* Landmark and PIN Code */}
        <LandmarkPincodeInputs 
          form={form} 
          handlePinCodeChange={handlePinCodeChange} 
        />

        {/* Complete Address */}
        <AddressInput form={form} />

        {/* Map Controls */}
        <MapControls
          findAddressOnMap={findAddressOnMap}
          getUserCurrentLocation={getUserCurrentLocation}
          isGeocoding={isGeocoding}
          isGeolocating={isGeolocating}
          mapLoaded={mapLoaded}
          address={address}
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

        {/* Hidden inputs for coordinates */}
        <input type="hidden" {...form.register('latitude')} />
        <input type="hidden" {...form.register('longitude')} />
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