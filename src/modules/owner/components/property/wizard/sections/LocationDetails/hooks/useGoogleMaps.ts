// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useGoogleMaps.ts
// Version: 3.0.0
// Last Modified: 07-03-2025 22:15 IST
// Purpose: Extremely simplified map integration

import { useState, useEffect } from 'react';

export function useGoogleMaps() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    // Define callback for when Google Maps loads
    window.initGoogleMaps = () => {
      console.log("Google Maps initialized");
      setMapLoaded(true);
    };

    try {
      // Get API key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
      
      if (!apiKey) {
        setMapError('Google Maps API key is missing');
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.id = 'google-maps-script';
      
      // Handle errors
      script.onerror = () => {
        setMapError('Failed to load Google Maps API');
      };

      // Add script to document
      document.head.appendChild(script);
      
      // Clean up on unmount
      return () => {
        // Only remove if it's our script
        const ourScript = document.getElementById('google-maps-script');
        if (ourScript) {
          document.head.removeChild(ourScript);
        }
        // Clean up global callback
        delete window.initGoogleMaps;
      };
    } catch (error) {
      console.error('Error setting up Google Maps:', error);
      setMapError('Error setting up Google Maps');
    }
  }, []);

  return { mapLoaded, mapError };
}