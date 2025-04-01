// src/modules/properties/hooks/useGoogleMaps.ts
// Version: 2.1.0
// Last Modified: 02-04-2025 14:43 IST
// Purpose: Moved to properties module

import { useState, useEffect, useCallback, useRef } from 'react';

// Default map center (Hyderabad)
export const DEFAULT_MAP_CENTER = {
  lat: 17.385044,
  lng: 78.486671
};

// Comprehensive error messages
const ERROR_MESSAGES: Record<string, string> = {
  NO_API_KEY: 'Google Maps API key is missing. Please check your environment configuration.',
  NETWORK_ERROR: 'Failed to load Google Maps. Please check your internet connection.',
  SCRIPT_LOAD_ERROR: 'Error loading Google Maps script. Please try again later.',
  INITIALIZATION_ERROR: 'Unable to initialize Google Maps. Please refresh the page.'
};

export const useGoogleMaps = (properties: any[]) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Log detailed error for debugging
  const logError = useCallback((message: string, error?: any) => {
    console.error('Google Maps Error:', message, error);
    setLoadError(new Error(message));
  }, []);

  // Attempt to load Google Maps script
  useEffect(() => {
    // Check for API key
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      logError(ERROR_MESSAGES.NO_API_KEY);
      return;
    }

    // Skip if already loaded or script exists
    if (window.google?.maps || document.getElementById('google-maps-script')) {
      setIsLoaded(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Success handler
    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully');
      setIsLoaded(true);
    };

    // Error handler
    script.onerror = (error) => {
      logError(ERROR_MESSAGES.SCRIPT_LOAD_ERROR, error);
    };

    // Add script to document
    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (script) {
        script.onload = null;
        script.onerror = null;
        document.head.removeChild(script);
      }
    };
  }, [logError]);

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    try {
      mapRef.current = map;
      
      // Fit map to properties if available
      if (properties.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        
        properties.forEach(property => {
          const lat = parseFloat(property.property_details?.latitude || '0');
          const lng = parseFloat(property.property_details?.longitude || '0');
          
          if (!isNaN(lat) && !isNaN(lng)) {
            bounds.extend({ lat, lng });
          }
        });
        
        // If valid bounds, fit the map
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
        }
      }

      console.log('🗺️ Map initialized successfully');
    } catch (error) {
      logError(ERROR_MESSAGES.INITIALIZATION_ERROR, error);
    }
  }, [properties, logError]);

  return {
    isLoaded,
    loadError,
    mapRef,
    handleMapLoad
  };
};

// Helper function to get marker icon based on property type
export const getMarkerPin = (property: any) => {
  const markerPins = {
    residential: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    apartment: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
    commercial: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    land: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    office: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    default: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
  };

  const propertyType = property.property_details?.propertyType?.toLowerCase() || '';
  
  for (const [type, pin] of Object.entries(markerPins)) {
    if (propertyType.includes(type)) return pin;
  }
  
  return markerPins.default;
};