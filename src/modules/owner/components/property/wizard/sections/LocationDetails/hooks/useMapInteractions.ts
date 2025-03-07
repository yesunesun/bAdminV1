// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useMapInteractions.ts
// Version: 3.0.0
// Last Modified: 07-03-2025 21:45 IST
// Purpose: Completely simplified implementation to avoid DOM errors

import { useState, useEffect, useRef, RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../../types';

interface UseMapInteractionsProps {
  form: UseFormReturn<FormData>;
  mapLoaded: boolean;
  mapRef: RefObject<HTMLDivElement>;
  isEditMode?: boolean;
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
  mapRef,
  isEditMode = false
}: UseMapInteractionsProps): UseMapInteractionsReturn {
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  
  // Use simple variables to track map state
  const hasInitializedRef = useRef(false);
  const currentMapRef = useRef<any>(null);
  const currentMarkerRef = useRef<any>(null);
  
  const { setValue, getValues } = form;

  // Safe initialization of the map
  const initializeMap = () => {
    // Skip if already initialized
    if (hasInitializedRef.current) return;
    if (!mapLoaded || !window.google || !mapRef.current) return;
    
    try {
      console.log('Initializing new map instance');
      
      // Create a basic map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 17.385, lng: 78.4867 },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      currentMapRef.current = map;
      
      // Add click handler
      map.addListener('click', (event: any) => {
        if (!event.latLng) return;
        
        // Update form values
        setValue('latitude', event.latLng.lat());
        setValue('longitude', event.latLng.lng());
        
        // Update marker
        updateMarker(event.latLng);
        
        // Optionally reverse geocode
        performReverseGeocoding(event.latLng);
      });
      
      hasInitializedRef.current = true;
      
      // If we're in edit mode, check for existing location data
      if (isEditMode) {
        const address = getValues('address');
        if (address && !getValues('latitude') && !getValues('longitude')) {
          // Use a timeout to ensure UI is fully rendered
          setTimeout(findAddressOnMap, 800);
        } else if (getValues('latitude') && getValues('longitude')) {
          updateMapLocation({
            lat: parseFloat(String(getValues('latitude'))),
            lng: parseFloat(String(getValues('longitude')))
          });
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Error initializing map. Please refresh and try again.');
    }
  };
  
  // Update marker on the map
  const updateMarker = (position: any) => {
    if (!currentMapRef.current) return;
    
    try {
      // Remove existing marker if any
      if (currentMarkerRef.current) {
        currentMarkerRef.current.setMap(null);
      }
      
      // Create new marker
      const marker = new window.google.maps.Marker({
        position,
        map: currentMapRef.current,
        draggable: true
      });
      
      // Add drag end listener
      marker.addListener('dragend', function() {
        const newPos = marker.getPosition();
        if (!newPos) return;
        
        setValue('latitude', newPos.lat());
        setValue('longitude', newPos.lng());
        
        performReverseGeocoding(newPos);
      });
      
      currentMarkerRef.current = marker;
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };
  
  // Update map center and add marker
  const updateMapLocation = (location: any) => {
    if (!currentMapRef.current) return;
    
    try {
      // Pan map to location
      currentMapRef.current.panTo(location);
      currentMapRef.current.setZoom(15);
      
      // Update marker
      updateMarker(location);
    } catch (error) {
      console.error('Error updating map location:', error);
    }
  };
  
  // Perform reverse geocoding to get address from coordinates
  const performReverseGeocoding = (latLng: any) => {
    if (!window.google || !latLng) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results: any, status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const address = results[0].formatted_address;
          setValue('address', address);
          
          // Extract PIN code if available
          const addressComponents = results[0].address_components || [];
          const postalCodeComponent = addressComponents.find(
            (component: any) => component.types.includes('postal_code')
          );
          
          if (postalCodeComponent && postalCodeComponent.long_name) {
            setValue('pinCode', postalCodeComponent.long_name);
          }
        }
      });
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  };

  // Find address on map (geocoding)
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

    console.log('Finding address on map:', address);
    setIsGeocoding(true);
    setMapError(null);

    try {
      // Initialize map if not already done
      if (!hasInitializedRef.current) {
        initializeMap();
      }
      
      // Use geocoder to find address
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results: any, status: string) => {
        setIsGeocoding(false);
        
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          
          // Update form with coordinates
          setValue('latitude', location.lat());
          setValue('longitude', location.lng());
          
          // Extract PIN code if available
          const addressComponents = results[0].address_components || [];
          const postalCodeComponent = addressComponents.find(
            (component: any) => component.types.includes('postal_code')
          );
          
          if (postalCodeComponent && postalCodeComponent.long_name) {
            setValue('pinCode', postalCodeComponent.long_name);
          }
          
          // Update map with new location
          updateMapLocation({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.error('Geocoding failed with status:', status);
          setMapError(`Couldn't find the address on the map. Please try a different address.`);
        }
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      setIsGeocoding(false);
      setMapError('Error finding address. Please try again.');
    }
  };

  // Get user's current location
  const getUserCurrentLocation = () => {
    if (!mapLoaded || !window.google) {
      setMapError('Google Maps is not yet loaded');
      return;
    }
    
    if (!navigator.geolocation) {
      setMapError('Geolocation is not supported by your browser');
      return;
    }
    
    // Initialize map if not already done
    if (!hasInitializedRef.current) {
      initializeMap();
    }
    
    setIsGeolocating(true);
    setMapError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update form with coordinates
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        
        // Update map location
        updateMapLocation({
          lat: latitude,
          lng: longitude
        });
        
        // Perform reverse geocoding
        performReverseGeocoding({
          lat: latitude,
          lng: longitude
        });
        
        setIsGeolocating(false);
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

  // Reset marker and map
  const resetMarker = () => {
    if (!mapLoaded || !window.google) return;
    
    try {
      // Initialize map if not already done
      if (!hasInitializedRef.current) {
        initializeMap();
        return;
      }
      
      // Get current latitude and longitude or use defaults
      const lat = getValues('latitude') ? parseFloat(String(getValues('latitude'))) : 17.385;
      const lng = getValues('longitude') ? parseFloat(String(getValues('longitude'))) : 78.4867;
      
      // Update map location
      updateMapLocation({ lat, lng });
    } catch (error) {
      console.error('Error resetting marker:', error);
    }
  };

  // Initialize map on component mount
  useEffect(() => {
    if (mapLoaded && mapRef.current && !hasInitializedRef.current) {
      initializeMap();
    }
    
    // Cleanup function
    return () => {
      // Only do minimal cleanup to avoid errors
      hasInitializedRef.current = false;
      currentMapRef.current = null;
      currentMarkerRef.current = null;
    };
  }, [mapLoaded]);

  return {
    isGeolocating,
    isGeocoding,
    mapError,
    getUserCurrentLocation,
    findAddressOnMap,
    resetMarker
  };
}