// src/modules/owner/components/property/wizard/sections/LocationDetails/index.tsx
// Version: 2.0.0
// Last Modified: 03-03-2025 22:45 IST
// Purpose: Main LocationDetails component with updated location fields

import React, { useRef } from 'react';
import { FormSection } from '@/components/FormSection';
import { FormSectionProps } from '../../../types';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { useMapInteractions } from './hooks/useMapInteractions';
import { LocationSelectors } from './components/LocationSelectors';
import { LandmarkPincodeInputs } from './components/LandmarkPincodeInputs';
import { AddressInput } from './components/AddressInput';
import { MapControls } from './components/MapControls';
import { MapContainer } from './components/MapContainer';

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
        {/* Location Selection Fields (District, City, Locality, Area) */}
        <LocationSelectors form={form} />

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