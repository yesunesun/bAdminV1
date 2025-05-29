// src/modules/owner/components/property/wizard/sections/LocationDetails/index.tsx
// Version: 7.1.0
// Last Modified: 29-05-2025 19:50 IST
// Purpose: Fixed import paths and validation system - working version

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FormSection } from '@/components/FormSection';
import { FormSectionProps } from '../../../types';
import { useGoogleMaps } from './hooks/useGoogleMaps';
import { ValidatedInput } from '@/components/ui/ValidatedInput';
import { RequiredLabel } from '@/components/ui/RequiredLabel';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { useStepValidation } from '../../hooks/useStepValidation';

export function LocationDetails({ form, stepId }: FormSectionProps) {
  // Initialize validation system
  const {
    validateField,
    getFieldValidation,
    getFieldConfig,
    shouldShowFieldError,
    markFieldAsTouched,
    validateCurrentStep,
    isValid: stepIsValid,
    completionPercentage,
    requiredFields
  } = useStepValidation({
    form,
    flowType: 'residential_rent',
    currentStepId: stepId || 'res_rent_location'
  });

  const effectiveStepId = stepId || 'res_rent_location';

  // Helper functions for form data management
  const saveField = useCallback((fieldName: string, value: any) => {
    if (!effectiveStepId) return;
    const path = `steps.${effectiveStepId}.${fieldName}`;
    
    // Ensure steps structure exists
    const steps = form.getValues('steps') || {};
    if (!steps[effectiveStepId]) {
      form.setValue('steps', {
        ...steps,
        [effectiveStepId]: {}
      }, { shouldValidate: false });
    }
    
    form.setValue(path, value, { shouldValidate: true });
    validateField(fieldName);
  }, [form, effectiveStepId, validateField]);

  const getField = useCallback((fieldName: string, defaultValue?: any) => {
    if (!effectiveStepId) return defaultValue;
    const path = `steps.${effectiveStepId}.${fieldName}`;
    const value = form.getValues(path);
    return value ?? defaultValue;
  }, [form, effectiveStepId]);

  // State management
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coordinatesVerified, setCoordinatesVerified] = useState(false);
  const [showCoordinateSuccess, setShowCoordinateSuccess] = useState(false);

  // Form values state
  const [values, setValues] = useState({
    address: getField('address', ''),
    flatPlotNo: getField('flatPlotNo', ''),
    landmark: getField('landmark', ''),
    locality: getField('locality', ''),
    city: getField('city', ''),
    state: getField('state', ''),
    pinCode: getField('pinCode', ''),
    latitude: getField('latitude', ''),
    longitude: getField('longitude', '')
  });

  // Ensure step structure exists
  useEffect(() => {
    if (!effectiveStepId) return;
    
    const currentSteps = form.getValues('steps') || {};
    if (!currentSteps[effectiveStepId]) {
      form.setValue('steps', {
        ...currentSteps,
        [effectiveStepId]: {}
      });
    }

    // Update component state from form
    updateStateFromForm();
  }, [effectiveStepId, form]);

  // Update component state from form values
  const updateStateFromForm = useCallback(() => {
    const stepData = form.getValues(`steps.${effectiveStepId}`) || {};
    const formValues = form.getValues();
    
    setValues({
      address: stepData.address || formValues.address || '',
      flatPlotNo: stepData.flatPlotNo || formValues.flatPlotNo || '',
      landmark: stepData.landmark || formValues.landmark || '',
      locality: stepData.locality || formValues.locality || '',
      city: stepData.city || formValues.city || '',
      state: stepData.state || formValues.state || '',
      pinCode: stepData.pinCode || formValues.pinCode || '',
      latitude: stepData.latitude || formValues.latitude || '',
      longitude: stepData.longitude || formValues.longitude || ''
    });
  }, [form, effectiveStepId]);

  // Update form and state with validation
  const updateFormAndState = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    saveField(field, value);
    markFieldAsTouched(field);
  }, [saveField, markFieldAsTouched]);

  // Check for edit mode
  const isEditMode = window.location.pathname.includes('/edit');
  
  // Load Google Maps API
  const { mapLoaded, mapError } = useGoogleMaps();
  
  // Combined error message
  const mapErrorMessage = mapError || locationError;

  // Helper functions for browser detection
  const detectBrowser = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf('Edg') > -1) return 'Edge';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    return 'Unknown';
  };

  const isHTTPS = () => window.location.protocol === 'https:';

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapInstance) return;
    
    if (!window.google || !window.google.maps) return;
    
    try {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: 17.385, lng: 78.4867 },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
      
      setMapInstance(map);
      
      // Add click listener
      map.addListener('click', (event: any) => {
        if (!event.latLng) return;
        
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        updateFormAndState('latitude', lat);
        updateFormAndState('longitude', lng);
        setCoordinatesVerified(true);
        
        setShowCoordinateSuccess(true);
        setTimeout(() => setShowCoordinateSuccess(false), 3000);
        
        updateMarkerPosition(event.latLng);
        reverseGeocode(event.latLng);
      });
      
      // Auto-load for edit mode
      if (isEditMode && values.address && (!values.latitude || !values.longitude)) {
        setTimeout(() => geocodeAddress(values.address), 1000);
      } else if (values.latitude && values.longitude) {
        const position = {
          lat: parseFloat(String(values.latitude)),
          lng: parseFloat(String(values.longitude))
        };
        
        map.setCenter(position);
        updateMarkerPosition(position);
        setCoordinatesVerified(true);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setLocationError('Error initializing map');
    }
  }, [mapLoaded, mapInstance, isEditMode, values.address, values.latitude, values.longitude]);
  
  // Update marker position
  const updateMarkerPosition = (position: any) => {
    if (!mapInstance || !window.google || !window.google.maps) return;
    
    try {
      if (markerInstance) {
        markerInstance.setMap(null);
      }
      
      const marker = new window.google.maps.Marker({
        position,
        map: mapInstance,
        draggable: true
      });
      
      marker.addListener('dragend', function() {
        const newPosition = marker.getPosition();
        if (!newPosition) return;
        
        updateFormAndState('latitude', newPosition.lat());
        updateFormAndState('longitude', newPosition.lng());
        setCoordinatesVerified(true);
        
        setShowCoordinateSuccess(true);
        setTimeout(() => setShowCoordinateSuccess(false), 3000);
        
        reverseGeocode(newPosition);
      });
      
      setMarkerInstance(marker);
    } catch (error) {
      console.error('Error updating marker:', error);
    }
  };
  
  // Geocode address
  const geocodeAddress = (addressText: string) => {
    if (!mapLoaded || !window.google || !window.google.maps || !addressText) return;
    
    setIsGeocoding(true);
    setLocationError(null);
    
    let fullAddress = addressText;
    if (values.locality) fullAddress += `, ${values.locality}`;
    fullAddress += ', Telangana, India';
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results: any, status: string) => {
        setIsGeocoding(false);
        
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          
          updateFormAndState('latitude', location.lat());
          updateFormAndState('longitude', location.lng());
          setCoordinatesVerified(true);
          
          setShowCoordinateSuccess(true);
          setTimeout(() => setShowCoordinateSuccess(false), 3000);
          
          if (mapInstance) {
            mapInstance.setCenter(location);
            updateMarkerPosition(location);
          }
          
          // Extract address components
          const addressComponents = results[0].address_components || [];
          
          const postalCodeComponent = addressComponents.find(
            (component: any) => component.types.includes('postal_code')
          );
          if (postalCodeComponent) {
            updateFormAndState('pinCode', postalCodeComponent.long_name);
          }
          
          const cityComponent = addressComponents.find(
            (component: any) => 
              component.types.includes('locality') || 
              component.types.includes('administrative_area_level_2')
          );
          if (cityComponent) {
            updateFormAndState('city', cityComponent.long_name);
          }
          
          const localityComponent = addressComponents.find(
            (component: any) => 
              component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality') ||
              component.types.includes('neighborhood')
          );
          if (localityComponent) {
            updateFormAndState('locality', localityComponent.long_name);
          }
          
          const stateComponent = addressComponents.find(
            (component: any) => component.types.includes('administrative_area_level_1')
          );
          if (stateComponent) {
            updateFormAndState('state', stateComponent.long_name);
          }
        } else {
          setLocationError(`Couldn't find the address on the map`);
        }
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      setIsGeocoding(false);
      setLocationError('Error finding address');
    }
  };
  
  // Reverse geocode
  const reverseGeocode = (position: any) => {
    if (!window.google || !window.google.maps || !position) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results: any, status: string) => {
        if (status === 'OK' && results && results.length > 0) {
          const address = results[0].formatted_address;
          updateFormAndState('address', address);
          
          const addressComponents = results[0].address_components || [];
          
          const postalCodeComponent = addressComponents.find(
            (component: any) => component.types.includes('postal_code')
          );
          if (postalCodeComponent) {
            updateFormAndState('pinCode', postalCodeComponent.long_name);
          }
          
          const cityComponent = addressComponents.find(
            (component: any) => 
              component.types.includes('locality') || 
              component.types.includes('administrative_area_level_2')
          );
          if (cityComponent) {
            updateFormAndState('city', cityComponent.long_name);
          }
          
          const localityComponent = addressComponents.find(
            (component: any) => 
              component.types.includes('sublocality_level_1') || 
              component.types.includes('sublocality') ||
              component.types.includes('neighborhood')
          );
          if (localityComponent) {
            updateFormAndState('locality', localityComponent.long_name);
          }
          
          const stateComponent = addressComponents.find(
            (component: any) => component.types.includes('administrative_area_level_1')
          );
          if (stateComponent) {
            updateFormAndState('state', stateComponent.long_name);
          }
        }
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };
  
  // Find address on map
  const findAddressOnMap = () => {
    if (!values.address) {
      setLocationError('Please enter an address to search');
      return;
    }
    geocodeAddress(values.address);
  };
  
  // Get current location
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
    
    if (browser === 'Edge' && !isSecure) {
      setLocationError('Edge browser requires HTTPS to access location services.');
      return;
    }
    
    setIsGeolocating(true);
    setLocationError(null);
    
    try {
      const getCurrentPosition = (options: PositionOptions) => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, options);
        });
      };
      
      let position: GeolocationPosition | null = null;
      
      try {
        position = await getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      } catch (err: any) {
        if (browser === 'Edge' && err.code === 2) {
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
        
        updateFormAndState('latitude', latitude);
        updateFormAndState('longitude', longitude);
        setCoordinatesVerified(true);
        
        setShowCoordinateSuccess(true);
        setTimeout(() => setShowCoordinateSuccess(false), 3000);
        
        const latlng = { lat: latitude, lng: longitude };
        if (mapInstance) {
          mapInstance.setCenter(latlng);
          updateMarkerPosition(latlng);
        }
        
        reverseGeocode(latlng);
        setIsGeolocating(false);
      }
    } catch (error: any) {
      setIsGeolocating(false);
      console.error('Geolocation error:', error);
      
      let errorMessage = 'Could not get your location.';
      
      if (browser === 'Edge') {
        switch(error.code) {
          case 1:
            errorMessage = 'Location access denied. In Edge, click the lock icon and allow location access.';
            break;
          case 2:
            errorMessage = 'Edge is having trouble accessing location services. Try restarting Edge browser.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
      } else {
        switch(error.code) {
          case 1:
            errorMessage = 'Location access denied. Please allow location access in your browser settings.';
            break;
          case 2:
            errorMessage = 'Location service is temporarily unavailable. Please try again.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
      }
      
      setLocationError(errorMessage);
    }
  };
  
  // Handle PIN code input
  const handlePinCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    updateFormAndState('pinCode', numericValue);
  };

  return (
    <FormSection
      title="Location Details"
      description="Where is your property located?"
    >
      {/* Validation Progress */}
      {requiredFields.length > 0 && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Step Completion: {completionPercentage}%
            </span>
            <span className="text-xs text-blue-700">
              {stepIsValid ? '✓ Ready to proceed' : 'Please complete required fields'}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Success notification */}
        {showCoordinateSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded relative">
            <strong className="font-medium">Coordinates captured!</strong>
            <p className="text-sm">
              Location coordinates: {values.latitude ? parseFloat(String(values.latitude)).toFixed(6) : ''}, {values.longitude ? parseFloat(String(values.longitude)).toFixed(6) : ''}
            </p>
          </div>
        )}
        
        {/* Flat/Plot Number */}
        <ValidatedInput
          form={form}
          name="flatPlotNo"
          label="Flat/Plot Number"
          placeholder="e.g., A-101, Plot 45"
          value={values.flatPlotNo}
          required={false}
          error={shouldShowFieldError('flatPlotNo') ? getFieldValidation('flatPlotNo').error : null}
          isValid={getFieldValidation('flatPlotNo').isValid}
          isTouched={getFieldValidation('flatPlotNo').isTouched}
          onValidation={(field, value) => updateFormAndState(field, value)}
          onChange={(e) => updateFormAndState('flatPlotNo', e.target.value)}
          size="lg"
        />
        
        {/* Address with Map Controls */}
        <div>
          <ValidatedInput
            form={form}
            name="address"
            label="Complete Address"
            placeholder="Building name, street, area"
            value={values.address}
            required={true}
            helperText="Provide detailed address for better visibility"
            error={shouldShowFieldError('address') ? getFieldValidation('address').error : null}
            isValid={getFieldValidation('address').isValid}
            isTouched={getFieldValidation('address').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onChange={(e) => updateFormAndState('address', e.target.value)}
            size="lg"
          />
          
          <div className="flex justify-end mt-2 gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900"
              onClick={findAddressOnMap}
              disabled={!mapLoaded || !values.address || isGeocoding}
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

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValidatedInput
            form={form}
            name="locality"
            label="Locality"
            placeholder="Enter locality"
            value={values.locality}
            required={true}
            error={shouldShowFieldError('locality') ? getFieldValidation('locality').error : null}
            isValid={getFieldValidation('locality').isValid}
            isTouched={getFieldValidation('locality').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onChange={(e) => updateFormAndState('locality', e.target.value)}
            size="lg"
          />

          <ValidatedInput
            form={form}
            name="city"
            label="City"
            placeholder="Enter city"
            value={values.city}
            required={true}
            error={shouldShowFieldError('city') ? getFieldValidation('city').error : null}
            isValid={getFieldValidation('city').isValid}
            isTouched={getFieldValidation('city').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onChange={(e) => updateFormAndState('city', e.target.value)}
            size="lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ValidatedInput
            form={form}
            name="state"
            label="State"
            placeholder="Enter state"
            value={values.state}
            required={true}
            error={shouldShowFieldError('state') ? getFieldValidation('state').error : null}
            isValid={getFieldValidation('state').isValid}
            isTouched={getFieldValidation('state').isTouched}
            onValidation={(field, value) => updateFormAndState(field, value)}
            onChange={(e) => updateFormAndState('state', e.target.value)}
            size="lg"
          />

          <ValidatedInput
            form={form}
            name="pinCode"
            label="PIN Code"
            placeholder="Enter 6-digit PIN code"
            value={values.pinCode}
            required={true}
            error={shouldShowFieldError('pinCode') ? getFieldValidation('pinCode').error : null}
            isValid={getFieldValidation('pinCode').isValid}
            isTouched={getFieldValidation('pinCode').isTouched}
            onValidation={(field, value) => handlePinCodeChange(value)}
            onChange={(e) => handlePinCodeChange(e.target.value)}
            maxLength={6}
            size="lg"
          />
        </div>

        {/* Landmark */}
        <ValidatedInput
          form={form}
          name="landmark"
          label="Landmark"
          placeholder="Enter a nearby landmark"
          value={values.landmark}
          required={false}
          error={shouldShowFieldError('landmark') ? getFieldValidation('landmark').error : null}
          isValid={getFieldValidation('landmark').isValid}
          isTouched={getFieldValidation('landmark').isTouched}
          onValidation={(field, value) => updateFormAndState(field, value)}
          onChange={(e) => updateFormAndState('landmark', e.target.value)}
          size="lg"
        />

        {/* Map Container */}
        <div className="space-y-4">
          <RequiredLabel className="text-base">Map Location</RequiredLabel>
          <p className="text-sm text-gray-600">Click on the map to select exact location</p>
          
          {/* Error Display */}
          {mapErrorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              <p className="text-sm">{mapErrorMessage}</p>
            </div>
          )}
          
          {/* Map Container */}
          <ErrorBoundary>
            <div 
              ref={mapContainerRef}
              className="w-full h-96 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
              style={{ 
                minHeight: '400px',
                background: mapLoaded ? 'transparent' : '#f9fafb'
              }}
            >
              {!mapLoaded && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading Google Maps...</p>
                </div>
              )}
            </div>
          </ErrorBoundary>
          
          {/* Coordinates Display */}
          {coordinatesVerified && values.latitude && values.longitude && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                <strong>Coordinates:</strong> {parseFloat(String(values.latitude)).toFixed(6)}, {parseFloat(String(values.longitude)).toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
}