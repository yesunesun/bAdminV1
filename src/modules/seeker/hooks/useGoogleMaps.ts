// src/modules/seeker/hooks/useGoogleMaps.ts
// Version: 2.1.0
// Last Modified: 07-12-2024 18:00 IST
// Purpose: Enhanced Google Maps hook with optional theme support and marker management

import { useJsApiLoader } from '@react-google-maps/api';

// Default map center (Hyderabad, India)
export const DEFAULT_MAP_CENTER = {
  lat: 17.385044,
  lng: 78.486671
};

// Libraries to load for Google Maps
const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ['places'];

export const useGoogleMaps = () => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
  
  // Detect theme from document or default to light
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  // Load Google Maps API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries,
    preventGoogleFontsLoading: true, // Prevent loading Google Fonts
  });

  // Theme-aware map styles
  const getMapStyles = () => {
    const baseStyles = [
      {
        featureType: 'all',
        stylers: [
          { saturation: -10 },
          { lightness: currentTheme === 'dark' ? -20 : 5 }
        ]
      },
      {
        featureType: 'poi',
        stylers: [{ visibility: 'simplified' }]
      },
      {
        featureType: 'transit',
        stylers: [{ visibility: 'simplified' }]
      }
    ];

    if (currentTheme === 'dark') {
      return [
        ...baseStyles,
        {
          featureType: 'all',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#e2e8f0' }]
        },
        {
          featureType: 'all',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#1e293b' }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.fill',
          stylers: [{ color: '#334155' }]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#475569' }]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#1e293b' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#334155' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#475569' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#475569' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#64748b' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#0f172a' }]
        }
      ];
    }

    return baseStyles;
  };

  // Get map options with theme support
  const getMapOptions = () => ({
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    scrollwheel: true,
    gestureHandling: 'greedy' as google.maps.GestureHandlingOptions,
    styles: getMapStyles(),
    backgroundColor: currentTheme === 'dark' ? '#1e293b' : '#f8fafc',
  });

  return {
    isLoaded,
    loadError,
    mapOptions: getMapOptions(),
    mapStyles: getMapStyles(),
    theme: currentTheme,
    center: DEFAULT_MAP_CENTER,
  };
};