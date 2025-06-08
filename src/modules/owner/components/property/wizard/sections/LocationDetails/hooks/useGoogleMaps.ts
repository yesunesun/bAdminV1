// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useGoogleMaps.ts
// Version: 3.1.0
// Last Modified: 02-05-2025 14:45 IST
// Purpose: Fixed script duplication and initialization issues

import { useState, useEffect } from 'react';

// Keep track of script loading state globally
let isScriptLoading = false;
let isScriptLoaded = false;

export function useGoogleMaps() {
  const [mapLoaded, setMapLoaded] = useState(isScriptLoaded);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      isScriptLoaded = true;
      return;
    }

    // If script is already loading, wait for it
    if (isScriptLoading) {
      const originalCallback = window.initGoogleMaps;
      window.initGoogleMaps = () => {
        if (originalCallback) originalCallback();
        setMapLoaded(true);
        isScriptLoaded = true;
      };
      return;
    }

    try {
      // Get API key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
      
      if (!apiKey) {
        setMapError('Google Maps API key is missing');
        return;
      }

      // Mark as loading
      isScriptLoading = true;

      // Define callback for when Google Maps loads
      window.initGoogleMaps = () => {
        console.log("Google Maps initialized");
        setMapLoaded(true);
        isScriptLoaded = true;
        isScriptLoading = false;
      };

      // Check if script already exists
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.remove(); // Remove existing script to prevent issues
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
        isScriptLoading = false;
      };

      // Add script to document
      document.head.appendChild(script);
      
      // Clean up on unmount - but do NOT remove the script
      return () => {
        // Only clean up the callback if we're unmounting and it's our current callback
        if (window.initGoogleMaps === setMapLoaded) {
          // Don't delete, just replace with a no-op function to prevent errors
          window.initGoogleMaps = () => {
            console.log("Unmounted component's callback was called");
          };
        }
      };
    } catch (error) {
      console.error('Error setting up Google Maps:', error);
      setMapError('Error setting up Google Maps');
      isScriptLoading = false;
    }
  }, []);

  return { mapLoaded, mapError };
}