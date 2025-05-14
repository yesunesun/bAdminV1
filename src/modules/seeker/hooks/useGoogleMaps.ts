// src/modules/seeker/hooks/useGoogleMaps.ts
// Version: 4.4.0
// Last Modified: 14-05-2025 13:30 IST
// Purpose: Fixed environment variable name mismatch for Google Maps API key

import { useState, useEffect } from 'react';

// Correct the environment variable name to match what's in the .env file
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

// Log the presence of the key (but not the key itself) for debugging
console.log(`Google Maps API Key present: ${Boolean(GOOGLE_MAPS_API_KEY)}`);

// Export the default map center for Hyderabad (needed by MapPanel.tsx)
export const DEFAULT_MAP_CENTER = { lat: 17.4065, lng: 78.4772 };

interface GoogleMapsHookResult {
  isLoaded: boolean;
  loadError: Error | null;
  google: typeof google | null;
  isConfigError: boolean; // Flag specifically for configuration errors
}

export const useGoogleMaps = (): GoogleMapsHookResult => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [isConfigError, setIsConfigError] = useState<boolean>(false);
  const [google, setGoogle] = useState<typeof window.google | null>(null);

  useEffect(() => {
    // Check if API key is properly configured
    if (!GOOGLE_MAPS_API_KEY) {
      console.error('Google Maps API key is missing. Please check that VITE_GOOGLE_MAPS_KEY is set in your .env file.');
      setLoadError(new Error('Google Maps API key is not configured'));
      setIsConfigError(true);
      return;
    }

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

      const handleScriptError = () => {
        setLoadError(new Error('Failed to load Google Maps API (script error)'));
        // Check if this is likely a key restriction issue
        if (window.location.hostname !== 'localhost') {
          setIsConfigError(true);
          console.error('Google Maps API key may have domain restrictions. Make sure this domain is allowed.');
        }
      };

      existingScript.addEventListener('load', handleScriptLoad);
      existingScript.addEventListener('error', handleScriptError);
      
      return () => {
        existingScript.removeEventListener('load', handleScriptLoad);
        existingScript.removeEventListener('error', handleScriptError);
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
      console.log('Google Maps API loaded successfully');
    };

    // Handle failure
    script.onerror = (error) => {
      console.error('Google Maps loading error:', error);
      
      // Check if this is likely a key restriction issue
      if (window.location.hostname !== 'localhost') {
        setIsConfigError(true);
        setLoadError(new Error('Google Maps API key may have domain restrictions. Ensure this domain is allowed.'));
      } else {
        setLoadError(new Error('Failed to load Google Maps API. Check your network connection and API key validity.'));
      }
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

  return { isLoaded, loadError, google, isConfigError };
};

export default useGoogleMaps;