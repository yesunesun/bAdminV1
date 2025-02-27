// src/modules/owner/components/property/wizard/sections/LocationDetails/services/MapService.ts
// Version: 1.4.0
// Last Modified: 29-02-2025 10:00 IST
// Purpose: Fixed Google Maps loading with async pattern

export class MapService {
  // Get API key in a browser-compatible way
  static getGoogleMapsApiKey(): string {
    try {
      // Check if import.meta is available (for Vite)
      if (typeof import.meta !== 'undefined' && import.meta.env) {
        if (import.meta.env.VITE_GOOGLE_MAPS_KEY) {
          return import.meta.env.VITE_GOOGLE_MAPS_KEY;
        }
      }
    } catch (error) {
      console.warn('Error accessing import.meta:', error);
    }
    
    // Hard-coded fallback (for development only)
    return 'AIzaSyCcFkML1_Nby7Sup';
  }

  static loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Skip if already loaded
      if (window.google?.maps || document.getElementById('google-maps-script')) {
        resolve();
        return;
      }

      // Get API key in a browser-compatible way
      const apiKey = this.getGoogleMapsApiKey();

      // Following Google's recommended loading pattern
      // https://goo.gl/js-api-loading
      
      // 1. Define the callback function before creating the script
      window.initGoogleMaps = () => {
        resolve();
      };

      // 2. Create script element with async
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true; // Keep this for async loading
      script.defer = true;

      // 3. Handle errors
      script.onerror = () => {
        console.error('Failed to load Google Maps - API key may be invalid or missing');
        reject(new Error('Failed to load Google Maps'));
      };

      // 4. Add the script to the document
      document.head.appendChild(script);
    });
  }

  static getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  static geocodeAddress(
    geocoder: google.maps.Geocoder,
    address: string
  ): Promise<google.maps.GeocoderResult[]> {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results);
        } else {
          reject(new Error(`Geocoding failed with status: ${status}`));
        }
      });
    });
  }

  static reverseGeocode(
    geocoder: google.maps.Geocoder,
    position: google.maps.LatLng
  ): Promise<google.maps.GeocoderResult[]> {
    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          resolve(results);
        } else {
          reject(new Error(`Reverse geocoding failed with status: ${status}`));
        }
      });
    });
  }
}

// Add this globally for TypeScript
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}