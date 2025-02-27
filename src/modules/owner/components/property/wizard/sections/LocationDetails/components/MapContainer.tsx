// src/modules/owner/components/property/wizard/sections/LocationDetails/components/MapContainer.tsx
// Version: 1.0.0
// Last Modified: 28-02-2025 19:25 IST
// Purpose: Map container UI component

import React from 'react';
import { MapPin } from 'lucide-react';
import { RequiredLabel } from '@/components/ui/RequiredLabel';

interface MapContainerProps {
  mapRef: React.RefObject<HTMLDivElement>;
  mapLoaded: boolean;
  mapError: string;
  resetMarker: () => void;
  latitude?: number | string;
  longitude?: number | string;
}

export function MapContainer({ 
  mapRef, 
  mapLoaded, 
  mapError, 
  resetMarker, 
  latitude, 
  longitude 
}: MapContainerProps) {
  return (
    <div className="space-y-2">
      <RequiredLabel>Location on Map</RequiredLabel>
      <div className="relative rounded-xl border border-slate-200 overflow-hidden">
        {/* Map Container */}
        <div className="h-64 w-full">
          {mapError ? (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-red-500 p-4 text-center">
              <p>{mapError}</p>
            </div>
          ) : (
            <div 
              id="property-map"
              ref={mapRef}
              className="w-full h-full bg-slate-100 relative"
            >
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-slate-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm">Loading map...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Map Controls */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50"
            onClick={resetMarker}
            title="Reset marker"
            disabled={!latitude || !longitude}
          >
            <MapPin className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </div>
      
      {/* Display selected coordinates if any */}
      {latitude && longitude && (
        <div className="text-xs text-slate-500 flex justify-between">
          <span>Coordinates: {parseFloat(String(latitude)).toFixed(6)}, {parseFloat(String(longitude)).toFixed(6)}</span>
          <button 
            type="button" 
            className="text-blue-500 hover:text-blue-700"
            onClick={resetMarker}
          >
            Reset location
          </button>
        </div>
      )}
      
      <p className="text-xs text-slate-500">
        * Click on the map to mark your property location or use the "Find on Map" button
      </p>
    </div>
  );
}