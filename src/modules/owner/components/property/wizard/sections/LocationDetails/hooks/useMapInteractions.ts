// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useMapInteractions.ts
// Version: 2.0.0
// Last Modified: 06-03-2025 18:00 IST
// Purpose: Fixed map interactions hook to prevent auto-loading and fix console errors

import { useState, useEffect, RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../../types';

interface UseMapInteractionsProps {
  form: UseFormReturn<FormData>;
  mapLoaded: boolean;
  mapRef: RefObject<HTMLDivElement>;
}

interface UseMapInteractionsReturn {
  isGeolocating: boolean;
  isGeocoding: boolean;
  mapError: string | null;
  getUserCurrentLocation: () => void;
  findAddressOnMap: () => void;
  resetMarker: () => void;
}

export function useMapInteractions({
  form,
  mapLoaded,
  mapRef
}: UseMapInteractionsProps): UseMapInteractionsReturn {
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  const { setValue, getValues } = form;

  // Function to find address on map
  const findAddressOnMap = () => {
    if (!mapLoaded || !window.google) {
      setMapError('Google Maps is not yet loaded');
      return;
    }

    const address = getValues('address');
    if (!address) {
      setMapError('Please enter an address to search');
      return;
    }

    setIsGeocoding(true);
    setMapError(null);

    // Create a new geocoder
    const geocoder = new window.google.maps.Geocoder();
    
    // Geocode the address
    geocoder.geocode({ address }, (results, status) => {
      setIsGeocoding(false);
      
      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location;
        
        // Update form with coordinates
        setValue('latitude', location.lat());
        setValue('longitude', location.lng());
        
        // Extract PIN code from address components if available
        const addressComponents = results[0].address_components || [];
        const postalCodeComponent = addressComponents.find(
          component => component.types.includes('postal_code')
        );
        
        if (postalCodeComponent && postalCodeComponent.long_name) {
          setValue('pinCode', postalCodeComponent.long_name);
        }
        
        // Create a map if it doesn't exist
        if (mapRef.current) {
          // Initialize the map
          const map = new window.google.maps.Map(mapRef.current, {
            center: location,
            zoom: 15,
          });
          
          // Add a marker at the location
          new window.google.maps.Marker({
            map,
            position: location,
          });
        }
      } else {
        setMapError(`Couldn't find the address on the map. Please try a different address.`);
      }
    });
  };

  // Function to get user's current location
  const getUserCurrentLocation = () => {
    if (!mapLoaded || !window.google) {
      setMapError('Google Maps is not yet loaded');
      return;
    }
    
    if (!navigator.geolocation) {
      setMapError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsGeolocating(true);
    setMapError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update form with coordinates
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        
        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        const latlng = { lat: latitude, lng: longitude };
        
        geocoder.geocode({ location: latlng }, (results, status) => {
          setIsGeolocating(false);
          
          if (status === 'OK' && results && results.length > 0) {
            // Get the formatted address
            const formattedAddress = results[0].formatted_address;
            setValue('address', formattedAddress);
            
            // Extract PIN code from address components if available
            const addressComponents = results[0].address_components || [];
            const postalCodeComponent = addressComponents.find(
              component => component.types.includes('postal_code')
            );
            
            if (postalCodeComponent && postalCodeComponent.long_name) {
              setValue('pinCode', postalCodeComponent.long_name);
            }
            
            // Create a map if it doesn't exist
            if (mapRef.current) {
              // Initialize the map
              const map = new window.google.maps.Map(mapRef.current, {
                center: latlng,
                zoom: 15,
              });
              
              // Add a marker at the location
              new window.google.maps.Marker({
                map,
                position: latlng,
              });
            }
          } else {
            setMapError('Could not determine address at this location');
          }
        });
      },
      (error) => {
        setIsGeolocating(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setMapError('User denied the request for geolocation');
            break;
          case error.POSITION_UNAVAILABLE:
            setMapError('Location information is unavailable');
            break;
          case error.TIMEOUT:
            setMapError('The request to get user location timed out');
            break;
          default:
            setMapError('An unknown error occurred when trying to get location');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Function to reset marker and map
  const resetMarker = () => {
    if (!mapLoaded || !window.google || !mapRef.current) return;
    
    // Get current latitude and longitude
    const latitude = getValues('latitude');
    const longitude = getValues('longitude');
    
    // Create default coordinates if none exist
    const position = { 
      lat: latitude ? Number(latitude) : 17.385, 
      lng: longitude ? Number(longitude) : 78.4867 
    };
    
    // Initialize the map
    const map = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: 15,
    });
    
    // Create a marker that is movable
    const marker = new window.google.maps.Marker({
      map,
      position,
      draggable: true,
    });
    
    // Add click listener to the map to set marker position
    map.addListener('click', (event) => {
      marker.setPosition(event.latLng);
      updateCoordinates(event.latLng);
    });
    
    // Add dragend listener to the marker
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        updateCoordinates(position);
      }
    });
  };
  
  // Helper function to update coordinates and reverse geocode
  const updateCoordinates = (latLng) => {
    if (!latLng) return;
    
    // Update form with coordinates
    setValue('latitude', latLng.lat());
    setValue('longitude', latLng.lng());
    
    // Optional: Reverse geocode to get address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const address = results[0].formatted_address;
        setValue('address', address);
        
        // Extract PIN code if available
        const addressComponents = results[0].address_components || [];
        const postalCodeComponent = addressComponents.find(
          component => component.types.includes('postal_code')
        );
        
        if (postalCodeComponent && postalCodeComponent.long_name) {
          setValue('pinCode', postalCodeComponent.long_name);
        }
      }
    });
  };

  // Initialize map when mapRef and coordinates are available
  useEffect(() => {
    // Only try to initialize if map is loaded and we have a ref
    if (mapLoaded && mapRef.current) {
      // Initialize the map with default or existing coordinates
      resetMarker();
    }
  }, [mapLoaded, mapRef.current]);

  return {
    isGeolocating,
    isGeocoding,
    mapError,
    getUserCurrentLocation,
    findAddressOnMap,
    resetMarker
  };
}