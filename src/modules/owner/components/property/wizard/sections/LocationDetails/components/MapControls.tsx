// src/modules/owner/components/property/wizard/sections/LocationDetails/components/MapControls.tsx
// Version: 1.0.0
// Last Modified: 28-02-2025 19:25 IST
// Purpose: Map control buttons component

import React from 'react';
import { Search, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  findAddressOnMap: () => void;
  getUserCurrentLocation: () => void;
  isGeocoding: boolean;
  isGeolocating: boolean;
  mapLoaded: boolean;
  address?: string;
}

export function MapControls({
  findAddressOnMap,
  getUserCurrentLocation,
  isGeocoding,
  isGeolocating,
  mapLoaded,
  address
}: MapControlsProps) {
  return (
    <div className="flex justify-between">
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2"
        onClick={findAddressOnMap}
        disabled={!mapLoaded || isGeocoding || !address}
      >
        {isGeocoding ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Finding...
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            Find on Map
          </>
        )}
      </Button>
      
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2"
        onClick={getUserCurrentLocation}
        disabled={!mapLoaded || isGeolocating}
      >
        {isGeolocating ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Locating...
          </>
        ) : (
          <>
            <Locate className="h-4 w-4" />
            Use My Location
          </>
        )}
      </Button>
    </div>
  );
}