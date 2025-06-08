// src/modules/owner/components/property/wizard/sections/LocationDetails/services/MapService.ts
// Version: 1.6.0
// Last Modified: 03-03-2025 13:15 IST
// Purpose: Fixed Google Maps loading with correct async implementation

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
        console.log("Google Maps API loaded successfully");
        resolve();
      };

      // 2. Create script element with async attribute (not as URL parameter)
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true; // Proper way to set async
      script.defer = true;

      // 3. Handle errors
      script.onerror = () => {
        console.error('Failed to load Google Maps - API key may be invalid or missing');
        reject(new Error('Failed to load Google Maps'));
      };

      // 4. Add the script to the document
      document.head.appendChild(script);
      
      console.log("Google Maps script tag added to document head");
    });
  }

  static getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      console.log("Requesting user geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got user position:", position.coords.latitude, position.coords.longitude);
          resolve(position);
        },
        (error) => {
          console.error("Geolocation error:", error.message);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout for slower connections
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
      console.log("Geocoding address:", address);
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          console.log("Geocoding successful:", results[0].formatted_address);
          resolve(results);
        } else {
          console.error("Geocoding failed:", status);
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
      console.log("Reverse geocoding position:", position.lat(), position.lng());
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          console.log("Reverse geocoding successful:", results[0].formatted_address);
          resolve(results);
        } else {
          console.error("Reverse geocoding failed:", status);
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