// src/modules/owner/components/property/wizard/sections/LocationDetails/components/MapControls.tsx
// Version: 2.0.0
// Last Modified: 06-03-2025 16:45 IST
// Purpose: Updated map controls with more prominent, closer buttons

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapControlsProps {
  findAddressOnMap: () => void;
  getUserCurrentLocation: () => void;
  isGeocoding: boolean;
  isGeolocating: boolean;
  mapLoaded: boolean;
  address: string;
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
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-sm flex items-center justify-center gap-2 hover:border-slate-400 transition-colors"
          onClick={findAddressOnMap}
          disabled={!mapLoaded || !address || isGeocoding}
        >
          <MapPin className="h-5 w-5 text-slate-700" />
          <span className="font-medium">{isGeocoding ? 'Finding...' : 'Find on Map'}</span>
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="flex-1 h-12 border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900 shadow-sm flex items-center justify-center gap-2 hover:border-slate-400 transition-colors"
          onClick={getUserCurrentLocation}
          disabled={!mapLoaded || isGeolocating}
        >
          <Navigation className="h-5 w-5 text-slate-700" />
          <span className="font-medium">{isGeolocating ? 'Locating...' : 'Use My Location'}</span>
        </Button>
      </div>
    </div>
  );
}