// src/modules/seeker/hooks/useGoogleMaps.ts
// Version: 4.1.0
// Last Modified: 14-05-2025 19:15 IST
// Purpose: Added missing DEFAULT_MAP_CENTER export needed by MapPanel component

import { useState, useEffect } from 'react';

// Default API key - this should be moved to environment variables in production
const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY'; // Replace with actual API key

// Export the default map center for Hyderabad (needed by MapPanel.tsx)
export const DEFAULT_MAP_CENTER = { lat: 17.4065, lng: 78.4772 };

interface GoogleMapsHookResult {
  isLoaded: boolean;
  loadError: Error | null;
  google: typeof google | null;
}

export const useGoogleMaps = (): GoogleMapsHookResult => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [google, setGoogle] = useState<typeof window.google | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      setGoogle(window.google);
      return;
    }

    // Check if the script is already being loaded
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      // Script is loading, wait for it
      const handleScriptLoad = () => {
        setIsLoaded(true);
        setGoogle(window.google);
      };

      existingScript.addEventListener('load', handleScriptLoad);
      return () => {
        existingScript.removeEventListener('load', handleScriptLoad);
      };
    }

    // Load the script
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Handle success
    script.onload = () => {
      setIsLoaded(true);
      setGoogle(window.google);
    };

    // Handle failure
    script.onerror = (error) => {
      setLoadError(new Error('Failed to load Google Maps API'));
      console.error('Google Maps loading error:', error);
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Don't remove the script on unmount as other components might need it
      // Just remove our event listeners
      script.onload = null;
      script.onerror = null;
    };
  }, []);

  return { isLoaded, loadError, google };
};

export default useGoogleMaps;