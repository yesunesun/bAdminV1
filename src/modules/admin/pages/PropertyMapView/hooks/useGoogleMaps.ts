// src/modules/admin/pages/PropertyMapView/hooks/useGoogleMaps.ts
// Version: 1.0.0
// Last Modified: 01-03-2025 11:40 IST
// Purpose: Hook for initializing and managing Google Maps

import { useState, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

// Libraries to load - defined outside component to prevent reloading
const libraries = ['places'];

// Default center (Hyderabad, India)
export const defaultCenter = {
  lat: 17.385044,
  lng: 78.486671
};

export const useGoogleMaps = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  
  // Load Google Maps API using useJsApiLoader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries
  });
  
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  
  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMapInstance(map);
    
    // Create a reusable InfoWindow
    const infoWindow = new google.maps.InfoWindow();
    setInfoWindow(infoWindow);
  }, []);

  return {
    googleMapsApiKey,
    isLoaded,
    loadError,
    mapInstance,
    infoWindow,
    onMapLoad,
    defaultCenter
  };
};