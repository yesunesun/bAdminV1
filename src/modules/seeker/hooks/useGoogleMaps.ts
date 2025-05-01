// src/modules/seeker/hooks/useGoogleMaps.ts
// Version: 1.2.0
// Last Modified: 01-05-2025 14:30 IST
// Purpose: Fixed duplicate Google Maps loading and undefined object access

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

// Global script loading state to prevent duplicate loading
let googleMapsLoaded = false;
let googleMapsLoading = false;
let googleMapsCallbacks: Array<() => void> = [];

// Safe Google Maps access function
export const safeGoogleMaps = () => {
  return window.google && window.google.maps ? window.google.maps : null;
};

export const useGoogleMaps = (properties: any[] = []) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(!!safeGoogleMaps());
  const [loadError, setLoadError] = useState<Error | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  
  // Log detailed error for debugging
  const logError = useCallback((message: string, error?: any) => {
    console.error('Google Maps Error:', message, error);
    setLoadError(new Error(message));
  }, []);

  // Function to load Google Maps script
  const loadGoogleMapsScript = useCallback(() => {
    // If already loaded, resolve immediately
    if (googleMapsLoaded || safeGoogleMaps()) {
      googleMapsLoaded = true;
      setIsLoaded(true);
      return;
    }
    
    // Don't start loading again if already in progress
    if (googleMapsLoading) {
      // Add callback to be executed when loading completes
      googleMapsCallbacks.push(() => setIsLoaded(true));
      return;
    }
    
    // Get API key from environment
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      logError(ERROR_MESSAGES.NO_API_KEY);
      return;
    }
    
    // Mark as loading
    googleMapsLoading = true;
    
    // Create script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Success handler
    script.onload = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      console.log('✅ Google Maps API loaded successfully');
      setIsLoaded(true);
      
      // Execute all pending callbacks
      googleMapsCallbacks.forEach(callback => callback());
      googleMapsCallbacks = [];
    };

    // Error handler
    script.onerror = (error) => {
      googleMapsLoading = false;
      logError(ERROR_MESSAGES.SCRIPT_LOAD_ERROR, error);
      
      // Clear callbacks since loading failed
      googleMapsCallbacks = [];
    };

    // Handle existing script element (just in case)
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      document.head.removeChild(existingScript);
    }

    // Add script to document
    document.head.appendChild(script);
  }, [logError]);

  // Attempt to load Google Maps script
  useEffect(() => {
    // Skip if already loaded
    if (isLoaded) return;
    
    loadGoogleMapsScript();
    
    // Cleanup - nothing needed here since we're managing globals
    return () => {};
  }, [isLoaded, loadGoogleMapsScript]);

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    try {
      mapRef.current = map;
      
      // Safety check for Google Maps objects
      if (!safeGoogleMaps()) {
        logError(ERROR_MESSAGES.INITIALIZATION_ERROR);
        return;
      }
      
      // Fit map to properties if available
      if (properties.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        let hasValidCoordinates = false;
        
        properties.forEach(property => {
          // Safely access property coordinates
          const lat = parseFloat(property?.property_details?.latitude || '0');
          const lng = parseFloat(property?.property_details?.longitude || '0');
          
          if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
            bounds.extend({ lat, lng });
            hasValidCoordinates = true;
          }
        });
        
        // If valid bounds, fit the map
        if (hasValidCoordinates && !bounds.isEmpty()) {
          map.fitBounds(bounds);
        } else {
          // Default to center if no valid coordinates
          map.setCenter(DEFAULT_MAP_CENTER);
          map.setZoom(12);
        }
      } else {
        // Set default center and zoom if no properties
        map.setCenter(DEFAULT_MAP_CENTER);
        map.setZoom(12);
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

  const propertyType = property?.property_details?.propertyType?.toLowerCase() || '';
  
  for (const [type, pin] of Object.entries(markerPins)) {
    if (propertyType.includes(type)) return pin;
  }
  
  return markerPins.default;
};