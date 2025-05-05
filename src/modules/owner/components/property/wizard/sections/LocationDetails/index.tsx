// src/modules/owner/components/property/wizard/sections/LocationDetails/index.tsx
// Version: 4.8.1
// Last Modified: 08-03-2025 15:00 IST
// Purpose: Fix JSX syntax error in error message objects

import React, { useRef, useState, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { FormSectionProps } from '../../../types';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { LandmarkPincodeInputs } from './components/LandmarkPincodeInputs';
import { AddressInput } from './components/AddressInput';
import { FlatPlotInput } from './components/FlatPlotInput';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export function LocationDetails({ form }: FormSectionProps) {
  const { setValue, watch, register } = form;
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Get form values
  const address = watch('address') || '';
  const latitude = watch('latitude') || '';
  const longitude = watch('longitude') || '';
  
  // Check for edit mode by looking at URL
  const isEditMode = window.location.pathname.includes('/edit');
  
  // Load Google Maps API
  const { mapLoaded, mapError } = useGoogleMaps();
  
  // Combined error message
  const mapErrorMessage = mapError || locationError;
  
  // Helper function to detect browser
  const detectBrowser = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Edg') > -1) return 'Edge';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    return 'Unknown';
  };

  // Helper function to check if HTTPS is used
  const isHTTPS = () => {
    return window.location.protocol === 'https:';
  };

  // Initialize map once when component mounts and maps API is loaded
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstance) return;
    
    // Wait to make sure window.google.maps is available
    if (!window.google || !window.google.maps) {
      console.log('Google Maps not fully loaded yet');
      return;
    }
    
    try {
      // Create map instance
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 17.385, lng: 78.4867 },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      setMapInstance(map);
      
      // Add click listener to map
      map.addListener('click', (event: any) => {
        if (!event.latLng) return;
        
        // Update form coordinates
        setValue('latitude', event.latLng.lat());
        setValue('longitude', event.latLng.lng());
        
        // Update marker
        updateMarkerPosition(event.latLng);
      });
      
      // Auto-load address if in edit mode
      if (isEditMode && address && (!latitude || !longitude)) {
        setTimeout(() => {
          geocodeAddress(address);
        }, 1000);
      } else if (latitude && longitude) {
        // If we have coordinates, show them on map
        const position = {
          lat: parseFloat(String(latitude)),
          lng: parseFloat(String(longitude))
        };
        
        map.setCenter(position);
        updateMarkerPosition(position);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setLocationError('Error initializing map');
    }
  }, [mapLoaded, mapInstance, isEditMode, address, latitude, longitude]);
  
  // Function to update marker position
  const updateMarkerPosition = (position: any) => {
    if (!mapInstance || !window.google || !window.google.maps) return;
    
    try {
      // Remove existing marker if any
      if (markerInstance) {
        markerInstance.setMap(null);
      }
      
      // Create new marker
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        draggable: true
      });
      
      // Add dragend listener
      marker.addListener('dragend', function() {
        const newPosition = marker.getPosition();
        if (!newPosition) return;
        
        // Update form coordinates
        setValue('latitude', newPosition.lat());
        setValue('longitude', newPosition.lng());
        
        // Optionally reverse geocode
        reverseGeocode(newPosition);
      });
      
      setMarkerInstance(marker);
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };
  
  // Function to geocode address
  const geocodeAddress = (addressText: string) => {
    if (!mapLoaded || !window.google || !window.google.maps || !addressText) {
      return;
    }
    
    setIsGeocoding(true);
    setLocationError(null);
    
    try {
      console.log('Geocoding address:', addressText);
      
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: addressText }, (results: any, status: string) => {
        setIsGeocoding(false);
        
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          
          // Update form
          setValue('latitude', location.lat());
          setValue('longitude', location.lng());
          
          // Update map and marker
          if (mapInstance) {
            mapInstance.setCenter(location);
            updateMarkerPosition(location);
          }
          
          // Extract PIN code if available
          const addressComponents = results[0].address_components || [];
          const postalCodeComponent = addressComponents.find(
            (component: any) => component.types.includes('postal_code')
          );
          
          if (postalCodeComponent && postalCodeComponent.long_name) {
            setValue('pinCode', postalCodeComponent.long_name);
          }
        } else {
          console.error('Geocoding failed with status:', status);
          setLocationError(`Couldn't find the address on the map`);
        }
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      setIsGeocoding(false);
      setLocationError('Error finding address');
    }
  };
  
  // Function to reverse geocode
  const reverseGeocode = (position: any) => {
    if (!window.google || !window.google.maps || !position) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results: any, status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const address = results[0].formatted_address;
          setValue('address', address);
          
          // Extract components from address
          const addressComponents = results[0].address_components || [];
          
          // Extract PIN code
          const postalCodeComponent = addressComponents.find(
            (component: any) => component.types.includes('postal_code')
          );
          
          if (postalCodeComponent && postalCodeComponent.long_name) {
            setValue('pinCode', postalCodeComponent.long_name);
          }
          
          // Extract city
          const cityComponent = addressComponents.find(
            (component: any) => 
              component.types.includes('locality') || 
              component.types.includes('administrative_area_level_2')
          );
          
          if (cityComponent && cityComponent.long_name) {
            setValue('city', cityComponent.long_name);
          }
          
          // Extract area/neighborhood
          const areaComponent = addressComponents.find(
            (component: any) => 
              component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality') ||
              component.types.includes('neighborhood')
          );
          
          if (areaComponent && areaComponent.long_name) {
            setValue('area', areaComponent.long_name);
          }
          
          // Extract locality
          const localityComponent = addressComponents.find(
            (component: any) => 
              component.types.includes('sublocality_level_2') || 
              component.types.includes('political')
          );
          
          if (localityComponent && localityComponent.long_name) {
            setValue('locality', localityComponent.long_name);
          }
        }
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };
  
  // Function to find address on map (called by button)
  const findAddressOnMap = () => {
    if (!address) {
      setLocationError('Please enter an address to search');
      return;
    }
    
    geocodeAddress(address);
  };
  
  // Function to get user's current location - Edge browser compatible
  const getUserCurrentLocation = async () => {
    if (!mapLoaded || !window.google || !window.google.maps) {
      setLocationError('Google Maps is not yet loaded');
      return;
    }
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    const browser = detectBrowser();
    const isSecure = isHTTPS();
    
    // Check Edge browser and HTTPS requirements
    if (browser === 'Edge' && !isSecure) {
      setLocationError('Edge browser requires HTTPS to access location services. Please use a secure connection.');
      return;
    }
    
    setIsGeolocating(true);
    setLocationError(null);
    
    try {
      // Use promise-based approach for better error handling
      const getCurrentPosition = (options: PositionOptions) => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
      };
      
      // Attempt to get position with different settings for Edge
      let position: GeolocationPosition | null = null;
      
      try {
        // First attempt with high accuracy
        position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      } catch (err: any) {
        // If high accuracy fails on Edge, try with low accuracy
        if (browser === 'Edge' && err.code === 2) {
          console.log('Retrying with low accuracy for Edge...');
          try {
            position = await getCurrentPosition({
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 60000
            });
          } catch (retryErr: any) {
            throw retryErr;
          }
        } else {
          throw err;
        }
      }
      
      if (position) {
        const { latitude, longitude } = position.coords;
        
        // Update form
        setValue('latitude', latitude);
        setValue('longitude', longitude);
        
        // Update map
        const latlng = { lat: latitude, lng: longitude };
        if (mapInstance) {
          mapInstance.setCenter(latlng);
          updateMarkerPosition(latlng);
        }
        
        // Perform reverse geocoding
        reverseGeocode(latlng);
        
        setIsGeolocating(false);
      }
    } catch (error: any) {
      setIsGeolocating(false);
      console.error('Geolocation error:', error);
      
      let errorMessage = 'Could not get your location.';
      
      // Browser-specific error messages
      if (browser === 'Edge') {
        switch(error.code) {
          case 1:
            errorMessage = 'Location access denied. In Edge, click the lock icon in the address bar and allow location access.';
            break;
          case 2:
            errorMessage = 'Edge is having trouble accessing location services. Try restarting Edge browser and ensure Windows Location services are enabled.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Edge may be taking longer than usual. Please try again.';
            break;
        }
      } else {
        switch(error.code) {
          case 1:
            errorMessage = 'Location access denied. Please allow location access in your browser settings.';
            break;
          case 2:
            errorMessage = 'Location service is temporarily unavailable. Please try again in a moment.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
      }
      
      setLocationError(errorMessage);
      
      // Offer manual input option
      if (confirm('Would you like to enter the address manually instead?')) {
        const addressInput = document.querySelector('textarea[placeholder="Building name, street, area"]') as HTMLTextAreaElement;
        if (addressInput) {
          addressInput.focus();
        }
      }
    }
  };
  
  // Reset marker and map view
  const resetMarker = () => {
    if (!mapInstance) return;
    
    try {
      // Get current values or use defaults
      const lat = latitude ? parseFloat(String(latitude)) : 17.385;
      const lng = longitude ? parseFloat(String(longitude)) : 78.4867;
      
      // Center map
      mapInstance.setCenter({ lat, lng });
      
      // Update marker
      updateMarkerPosition({ lat, lng });
    } catch (error) {
      console.error('Error resetting marker:', error);
    }
  };
  
  // Handle PIN code input to only allow numbers
  const handlePinCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setValue('pinCode', value);
  };

  return (
    <FormSection
      title="Location Details"
      description="Where is your property located?"
    >
      <div className="space-y-4">
        {/* Flat No/Plot No Field */}
        <FlatPlotInput form={form} />
        
        {/* Address with Map Controls */}
        <div>
          <AddressInput form={form} />
          
          <div className="flex justify-end mt-2 gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              onClick={findAddressOnMap}
              disabled={!mapLoaded || !address || isGeocoding}
            >
              <MapPin className="h-5 w-5" />
              <span>{isGeocoding ? 'Finding...' : 'Find on Map'}</span>
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              onClick={getUserCurrentLocation}
              disabled={!mapLoaded || isGeolocating}
            >
              <Navigation className="h-5 w-5" />
              <span>{isGeolocating ? 'Locating...' : 'Use My Location'}</span>
            </Button>
          </div>
        </div>

        {/* Landmark and PIN Code */}
        <LandmarkPincodeInputs 
          form={form} 
          handlePinCodeChange={handlePinCodeChange} 
        />

        {/* Map Container - Wrapped in ErrorBoundary */}
        <ErrorBoundary
          fallback={
            <div className="h-64 w-full bg-slate-100 flex items-center justify-center text-red-500 p-4 text-center rounded-xl border border-slate-200">
              <p>There was an error loading the map. Please refresh the page and try again.</p>
            </div>
          }
        >
          <div className="space-y-2">
            <RequiredLabel>Location on Map</RequiredLabel>
            <div className="relative rounded-xl border border-slate-200 overflow-hidden">
              {/* Map Container */}
              <div className="h-64 w-full">
                {mapErrorMessage ? (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-red-500 p-4 text-center">
                    <p>{mapErrorMessage}</p>
                  </div>
                ) : (
                  <div 
                    id="property-map"
                    ref={mapContainerRef}
                    className="w-full h-full bg-slate-100 relative"
                  >
                    {!mapLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-slate-400 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm">Loading map...</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Loading overlays */}
                    {mapLoaded && (isGeocoding || isGeolocating) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
                        <div className="flex flex-col items-center">
                          <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-sm">
                            {isGeocoding 
                              ? 'Finding location...' 
                              : 'Getting your location...'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Map Controls */}
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  type="button"
                  className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50"
                  onClick={resetMarker}
                  title="Reset marker"
                  disabled={!mapLoaded || !mapInstance || isGeocoding || isGeolocating}
                >
                  <MapPin className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            </div>
            
            {/* Location help/error message */}
            {locationError && (
              <div className="text-xs text-orange-600 mt-1">
                <p>{locationError}</p>
                {detectBrowser() === 'Edge' && (
                  <p className="mt-1">
                    Edge troubleshooting steps:
                    <br />
                    1. Click the lock/location icon in your address bar
                    <br />
                    2. Allow location access for this site
                    <br />
                    3. Ensure Windows Location services are ON (Settings &gt; Privacy &gt; Location)
                    <br />
                    4. Try restarting Edge if issues persist
                  </p>
                )}
              </div>
            )}
            
            {/* Display selected coordinates if any */}
            {latitude && longitude && (
              <div className="text-xs text-slate-500 flex justify-between">
                <span>Coordinates: {parseFloat(String(latitude)).toFixed(6)}, {parseFloat(String(longitude)).toFixed(6)}</span>
                <button 
                  type="button" 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={resetMarker}
                  disabled={isGeocoding || isGeolocating}
                >
                  Reset location
                </button>
              </div>
            )}
            
            <p className="text-xs text-slate-500">
              * Click on the map to mark your property location or use the "Find on Map" button
            </p>
          </div>
        </ErrorBoundary>

        {/* Hidden inputs for coordinates */}
        <div style={{ display: 'none' }}>
          <input {...register('latitude')} defaultValue={latitude || ''} />
          <input {...register('longitude')} defaultValue={longitude || ''} />
          <input {...register('state')} defaultValue="" />
          <input {...register('district')} defaultValue="" />
          <input {...register('city')} defaultValue="" />
          <input {...register('locality')} defaultValue="" />
          <input {...register('area')} defaultValue="" />
        </div>
      </div>
    </FormSection>
  );
}