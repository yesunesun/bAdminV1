// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useGoogleMaps.ts
// Version: 2.0.0
// Last Modified: 03-03-2025 23:45 IST
// Purpose: Hook to load Google Maps API asynchronously

import { useState, useEffect } from 'react';

export function useGoogleMaps() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Define the callback function for when Google Maps loads
    window.initGoogleMaps = () => {
      console.log("Google Maps initialized");
      setMapLoaded(true);
    };

    // Only load the script if it's not already loaded
    if (!document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      // Get API key from environment variable
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
      
      if (!apiKey) {
        setMapError('Google Maps API key is missing. Please check your environment configuration.');
        return;
      }

      // Create the script element for Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      
      // Handle load errors
      script.onerror = () => {
        setMapError('Failed to load Google Maps API. Please try again later.');
      };

      // Add the script to the document
      document.head.appendChild(script);

      // Cleanup
      return () => {
        // Remove the script when component unmounts
        const scriptElement = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
        if (scriptElement) {
          document.head.removeChild(scriptElement);
        }
        // Remove the global callback
        delete window.initGoogleMaps;
      };
    } else if (window.google && window.google.maps) {
      // If Google Maps is already loaded
      setMapLoaded(true);
    }
  }, []);

  return { mapLoaded, mapError };
}