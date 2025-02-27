// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useGoogleMaps.ts
// Version: 1.0.0
// Last Modified: 28-02-2025 19:15 IST
// Purpose: Custom hook for Google Maps initialization

import { useState, useEffect } from 'react';
import { MapService } from '../services/MapService';

export function useGoogleMaps() {
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string>('');

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        await MapService.loadGoogleMapsScript();
        setMapLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setMapError('Failed to load Google Maps. Please refresh the page.');
      }
    };

    // Only initialize if not already loaded
    if (!window.google?.maps) {
      initializeGoogleMaps();
    } else {
      setMapLoaded(true);
    }
  }, []);

  return { mapLoaded, mapError };
}