// src/modules/owner/components/property/wizard/sections/LocationDetails/hooks/useMapInteractions.ts
// Version: 2.1.0
// Last Modified: 05-03-2025 20:45 IST
// Purpose: Enhanced map interactions with direct locality setting for text input field

import { useState, useRef, useEffect, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../../types';
import { MapService } from '../services/MapService';
// Import location constants
import { 
  HYDERABAD_LOCATIONS, 
  LOCALITIES_BY_CITY, 
  CITIES_BY_DISTRICT 
} from '../constants';

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
  const city = watch('city');
  const locality = watch('locality');
  const address = watch('address');

  // Always set district to Hyderabad when component mounts
  useEffect(() => {
    setValue('district', 'Hyderabad');
  }, [setValue]);

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
      
      // Always attempt to get user's current location initially
      getUserCurrentLocationWithMarker();
      
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please refresh the page and try again.');
    }
  }, [mapLoaded, latitude, longitude, setValue, mapRef]);

  // Determine city from address components
  const determineCityFromComponents = useCallback((addressComponents: google.maps.GeocoderAddressComponent[]): string => {
    let detectedCity = '';
    
    // First look for explicit city component
    for (const component of addressComponents) {
      const types = component.types;
      const name = component.long_name;
      
      if (types.includes('locality') && 
         (name.includes('Hyderabad') || name.includes('Secunderabad'))) {
        detectedCity = name;
        break;
      }
    }
    
    // If still no city, check for Secunderabad references in other components
    if (!detectedCity) {
      for (const component of addressComponents) {
        if (component.long_name.includes('Secunderabad')) {
          detectedCity = 'Secunderabad';
          break;
        }
      }
    }
    
    // Default to Hyderabad if no city detected
    return detectedCity || 'Hyderabad';
  }, []);

  // Improved function to update address fields from a position (reverse geocoding)
  const updateAddressFromPosition = useCallback(async (position: google.maps.LatLng) => {
    if (!geocoderRef.current) return;
    
    try {
      const results = await MapService.reverseGeocode(geocoderRef.current, position);
      
      if (!results || results.length === 0) {
        console.warn('No geocoding results found');
        return;
      }
      
      const result = results[0];
      console.log('Geocoding result:', result);
      
      // Extract address components
      let detectedLocalityName = '';
      let area = '';
      let pinCode = '';
      
      // Always set district to Hyderabad
      setValue('district', 'Hyderabad');
      
      // Determine city (Hyderabad or Secunderabad)
      const detectedCity = determineCityFromComponents(result.address_components);
      setValue('city', detectedCity);
      
      // Extract other address components
      result.address_components.forEach(component => {
        const types = component.types;
        const name = component.long_name;
        
        // Extract PIN/ZIP code
        if (types.includes('postal_code')) {
          pinCode = name;
        }
        
        // Extract locality/neighborhood
        if (types.includes('sublocality_level_1') || 
            types.includes('sublocality') || 
            types.includes('neighborhood')) {
          detectedLocalityName = name;
        }
        
        // Extract smaller area
        if (types.includes('sublocality_level_2') || 
            types.includes('route') ||
            types.includes('premise')) {
          area = name;
        }
      });
      
      // Set full address from formatted_address
      setValue('address', result.formatted_address);
      
      // Set postal code if found
      if (pinCode) {
        setValue('pinCode', pinCode);
      }
      
      // Directly set the detected locality (no need to match against predefined list)
      if (detectedLocalityName) {
        setValue('locality', detectedLocalityName);
        console.log(`Setting locality to detected value: ${detectedLocalityName}`);
      } else {
        // Try to extract a locality from the formatted address if no locality component was found
        const formattedAddress = result.formatted_address || '';
        const addressParts = formattedAddress.split(',').map(part => part.trim());
        
        // Usually the locality is the second or third part of the address
        if (addressParts.length > 2) {
          // Skip the last parts which are typically city, state, country, zip
          const potentialLocality = addressParts[1];
          if (potentialLocality && 
              !potentialLocality.includes('Hyderabad') && 
              !potentialLocality.includes('Telangana') &&
              !potentialLocality.includes('India') &&
              !/^\d+$/.test(potentialLocality)) { // Make sure it's not just a number
            
            setValue('locality', potentialLocality);
            console.log(`Setting locality from formatted address: ${potentialLocality}`);
          }
        }
      }
      
      // Set area/neighborhood
      if (area) {
        setValue('area', area);
      } else if (detectedLocalityName) {
        // If no specific area but we have a locality, use that as area too
        setValue('area', detectedLocalityName);
      }
      
      // Debug log the updated fields
      console.log('Updated location fields:', {
        district: 'Hyderabad',
        city: detectedCity,
        detectedLocality: detectedLocalityName,
        area,
        pinCode
      });
      
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
    }
  }, [setValue, determineCityFromComponents]);
  
  // Get user's current location and set marker with form values
  const getUserCurrentLocationWithMarker = useCallback(async () => {
    if (!googleMapRef.current) return;
    
    setIsGeolocating(true);
    setMapError('');
    
    try {
      const position = await MapService.getUserLocation();
      const { latitude: lat, longitude: lng } = position.coords;
      
      // Update map center and zoom
      const userLocation = new window.google.maps.LatLng(lat, lng);
      googleMapRef.current.setCenter(userLocation);
      googleMapRef.current.setZoom(15);
      
      // Set marker at current location
      if (markerRef.current) {
        markerRef.current.setPosition(userLocation);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: userLocation,
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
      setValue('latitude', lat);
      setValue('longitude', lng);
      
      // Reverse geocode to update address fields
      updateAddressFromPosition(userLocation);
      
    } catch (error) {
      console.error('Error getting user location:', error);
      setMapError('Could not get your current location. Please allow location access or set the location manually.');
      setTimeout(() => setMapError(''), 5000);
    } finally {
      setIsGeolocating(false);
    }
  }, [googleMapRef, setValue, updateAddressFromPosition]);
  
  // Legacy method - keep for backward compatibility with button
  const getUserCurrentLocation = useCallback(async () => {
    getUserCurrentLocationWithMarker();
  }, [getUserCurrentLocationWithMarker]);
  
  // Function to find address on map
  const findAddressOnMap = useCallback(async () => {
    if (!googleMapRef.current || !geocoderRef.current) return;
    
    const formValues = getValues();
    let searchAddress = formValues.address || '';
    
    // Add locality, zone and pincode to make the search more accurate
    if (formValues.locality) {
      searchAddress += `, ${formValues.locality}`;
    }
    
    if (formValues.pinCode) {
      searchAddress += `, ${formValues.pinCode}`;
    }
    
    // Add city and state - always use Hyderabad, Telangana
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
      
      // Get full address details
      updateAddressFromPosition(location);
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