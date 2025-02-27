// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useMapInteractions.ts
// Version: 1.1.0
// Last Modified: 28-02-2025 21:15 IST
// Purpose: Custom hook for map interaction functionality

import { useState, useRef, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../../types';
import { MapService } from '../services/MapService';
// Update import to use local constants
import { HYDERABAD_LOCATIONS } from '../constants';

interface UseMapInteractionsProps {
  form: UseFormReturn<FormData>;
  mapLoaded: boolean;
  mapRef: React.RefObject<HTMLDivElement>;
}

export function useMapInteractions({ form, mapLoaded, mapRef }: UseMapInteractionsProps) {
  const { setValue, watch, getValues } = form;
  const [isGeolocating, setIsGeolocating] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [mapError, setMapError] = useState<string>('');
  
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const zone = watch('zone');
  const locality = watch('locality');
  const address = watch('address');

  // Initialize map when Google Maps API is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current || !window.google?.maps) {
      return;
    }

    try {
      // Default to Hyderabad center if no coordinates are set
      const defaultLat = 17.3850;
      const defaultLng = 78.4867;
      
      const center = {
        lat: latitude ? parseFloat(String(latitude)) : defaultLat,
        lng: longitude ? parseFloat(String(longitude)) : defaultLng
      };

      const mapOptions = {
        center,
        zoom: (latitude && longitude) ? 15 : 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        scrollwheel: true,
      };

      // Create the map
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      googleMapRef.current = map;
      
      // Create geocoder
      geocoderRef.current = new window.google.maps.Geocoder();

      // Add marker if coordinates exist
      if (latitude && longitude) {
        markerRef.current = new window.google.maps.Marker({
          position: center,
          map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });

        // Update form values when marker is dragged
        markerRef.current.addListener('dragend', () => {
          const position = markerRef.current?.getPosition();
          if (position) {
            setValue('latitude', position.lat());
            setValue('longitude', position.lng());
            
            // Reverse geocode to get address
            updateAddressFromPosition(position);
          }
        });
      }

      // Add click listener to set marker
      map.addListener('click', (event: google.maps.MapMouseEvent) => {
        const position = event.latLng;
        if (position) {
          if (markerRef.current) {
            markerRef.current.setPosition(position);
          } else {
            markerRef.current = new window.google.maps.Marker({
              position,
              map,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            });

            // Add listener to new marker
            markerRef.current.addListener('dragend', () => {
              const newPosition = markerRef.current?.getPosition();
              if (newPosition) {
                setValue('latitude', newPosition.lat());
                setValue('longitude', newPosition.lng());
                
                // Reverse geocode to get address
                updateAddressFromPosition(newPosition);
              }
            });
          }
          
          setValue('latitude', position.lat());
          setValue('longitude', position.lng());
          
          // Reverse geocode to get address
          updateAddressFromPosition(position);
        }
      });
      
      // Try to get user's current location if no coordinates are set
      if (!latitude && !longitude) {
        getUserCurrentLocation();
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please refresh the page and try again.');
    }
  }, [mapLoaded, latitude, longitude, setValue, mapRef]);

  // Function to update address fields from a position (reverse geocoding)
  const updateAddressFromPosition = useCallback(async (position: google.maps.LatLng) => {
    if (!geocoderRef.current) return;
    
    try {
      const results = await MapService.reverseGeocode(geocoderRef.current, position);
      const result = results[0];
      
      // Extract address components
      let foundZone = '';
      let foundLocality = '';
      let foundPinCode = '';
      
      // Extract address components
      result.address_components.forEach(component => {
        const types = component.types;
        
        if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
          // This could be a locality or zone
          foundLocality = component.long_name;
        }
        
        if (types.includes('postal_code')) {
          foundPinCode = component.long_name;
        }
        
        // Try to determine zone from administrative areas
        if (types.includes('administrative_area_level_2')) {
          // Could be a zone in some cases
          // Check if it matches any of our known zones
          const zoneName = component.long_name;
          Object.keys(HYDERABAD_LOCATIONS).forEach(knownZone => {
            if (knownZone.includes(zoneName) || zoneName.includes(knownZone)) {
              foundZone = knownZone;
            }
          });
        }
      });
      
      // Set full address
      setValue('address', result.formatted_address);
      
      // Try to set zone, locality and pincode if found
      if (foundZone && Object.keys(HYDERABAD_LOCATIONS).includes(foundZone)) {
        setValue('zone', foundZone);
      }
      
      if (foundLocality) {
        // Check if locality is in our list for the zone
        const zoneValue = foundZone || zone;
        if (zoneValue && HYDERABAD_LOCATIONS[zoneValue as keyof typeof HYDERABAD_LOCATIONS]?.includes(foundLocality)) {
          setValue('locality', foundLocality);
        }
      }
      
      if (foundPinCode && foundPinCode.length === 6) {
        setValue('pinCode', foundPinCode);
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  }, [setValue, zone]);
  
  // Get user's current location
  const getUserCurrentLocation = useCallback(async () => {
    if (!googleMapRef.current) return;
    
    setIsGeolocating(true);
    
    try {
      const position = await MapService.getUserLocation();
      const { latitude, longitude } = position.coords;
      
      // Update map center and zoom
      const userLocation = new window.google.maps.LatLng(latitude, longitude);
      googleMapRef.current.setCenter(userLocation);
      googleMapRef.current.setZoom(15);
      
      // Don't automatically set marker or form values
      // Let user confirm this is the right location first
    } catch (error) {
      console.error('Error getting user location:', error);
      setMapError('Could not get your current location. Please allow location access or set the location manually.');
      setTimeout(() => setMapError(''), 5000);
    } finally {
      setIsGeolocating(false);
    }
  }, []);
  
  // Function to find address on map
  const findAddressOnMap = useCallback(async () => {
    if (!googleMapRef.current || !geocoderRef.current) return;
    
    const formValues = getValues();
    let searchAddress = formValues.address || '';
    
    // Add locality, zone and pincode to make the search more accurate
    if (formValues.locality) {
      searchAddress += `, ${formValues.locality}`;
    }
    
    if (formValues.zone) {
      searchAddress += `, ${formValues.zone}`;
    }
    
    if (formValues.pinCode) {
      searchAddress += `, ${formValues.pinCode}`;
    }
    
    // Add city and state
    searchAddress += ', Hyderabad, Telangana, India';
    
    if (!searchAddress.trim()) {
      return;
    }
    
    setIsGeocoding(true);
    
    try {
      const results = await MapService.geocodeAddress(geocoderRef.current, searchAddress);
      const location = results[0].geometry.location;
      
      // Center map on found location
      googleMapRef.current.setCenter(location);
      googleMapRef.current.setZoom(16);
      
      // Add or move marker
      if (markerRef.current) {
        markerRef.current.setPosition(location);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: googleMapRef.current,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });
        
        // Add drag listener
        markerRef.current.addListener('dragend', () => {
          const newPosition = markerRef.current?.getPosition();
          if (newPosition) {
            setValue('latitude', newPosition.lat());
            setValue('longitude', newPosition.lng());
            updateAddressFromPosition(newPosition);
          }
        });
      }
      
      // Update form values
      setValue('latitude', location.lat());
      setValue('longitude', location.lng());
    } catch (error) {
      console.error('Error geocoding address:', error);
      setMapError('Could not find the address on the map. Please try being more specific or pin the location manually.');
      setTimeout(() => setMapError(''), 5000);
    } finally {
      setIsGeocoding(false);
    }
  }, [getValues, setValue, updateAddressFromPosition]);

  const resetMarker = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    setValue('latitude', undefined);
    setValue('longitude', undefined);
  }, [setValue]);

  return {
    isGeolocating,
    isGeocoding,
    mapError,
    getUserCurrentLocation,
    findAddressOnMap,
    resetMarker
  };
}