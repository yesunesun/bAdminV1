// src/modules/seeker/components/PropertyDetails/PropertyLocationSection.tsx
// Version: 5.3.0
// Last Modified: 15-05-2025 11:45 IST
// Purpose: Diagnostic version to identify map loading issues

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPinIcon, LandmarkIcon, MapIcon } from 'lucide-react';
import PropertyLocationMapDiagnostic from './PropertyLocationMapDiagnostic';

interface PropertyLocationSectionProps {
  property: any;
  isLoading?: boolean;
}

const PropertyLocationSection: React.FC<PropertyLocationSectionProps> = ({ 
  property,
  isLoading 
}) => {
  // Log the full property object to console for inspection
  console.log('PropertyLocationSection - Full property object:', property);

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-primary" />
            <span>Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-[16/9] bg-muted animate-pulse rounded-lg"></div>
          <div className="mt-4 space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-5 bg-muted animate-pulse rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!property) return null;

  // Extract location data from the property object with extensive logging
  const getLocationData = () => {
    console.log('Extracting location data from property:', property.id);
    
    // V2 format
    if (property.location) {
      console.log('V2 format detected - property.location exists:', property.location);
      
      // Extract coordinates with detailed logging
      let coordinates = null;
      if (property.location.coordinates) {
        console.log('Location coordinates found:', property.location.coordinates);
        coordinates = {
          lat: property.location.coordinates.latitude || property.location.coordinates.lat,
          lng: property.location.coordinates.longitude || property.location.coordinates.lng
        };
      } else {
        console.log('No coordinates in property.location');
      }
      
      return {
        address: property.location.address,
        locality: property.location.locality,
        city: property.location.city,
        state: property.location.state,
        pinCode: property.location.pinCode,
        landmark: property.location.landmark,
        flatPlotNo: property.location.flatPlotNo,
        coordinates
      };
    }
    
    // V1 format or nested property_details
    console.log('V1 format or property_details format - checking property_details');
    let details = property.property_details || {};
    
    // Try to parse property_details if it's a string
    if (typeof details === 'string') {
      console.log('property_details is a string, attempting to parse');
      try {
        details = JSON.parse(details);
        console.log('Successfully parsed property_details string');
      } catch (e) {
        console.error('Failed to parse property_details string:', e);
      }
    }
    
    console.log('property_details object:', details);
    
    // Try every possible coordinate format
    let coordinates = null;
    
    if (details.coordinates) {
      console.log('Found coordinates in details.coordinates:', details.coordinates);
      coordinates = {
        lat: details.coordinates.lat || details.coordinates.latitude,
        lng: details.coordinates.lng || details.coordinates.longitude
      };
    } else if (details.mapCoordinates) {
      console.log('Found coordinates in details.mapCoordinates:', details.mapCoordinates);
      coordinates = {
        lat: details.mapCoordinates.lat || details.mapCoordinates.latitude,
        lng: details.mapCoordinates.lng || details.mapCoordinates.longitude
      };
    } else if (details.lat && details.lng) {
      console.log('Found lat/lng directly in details:', { lat: details.lat, lng: details.lng });
      coordinates = {
        lat: details.lat,
        lng: details.lng
      };
    } else if (details.latitude && details.longitude) {
      console.log('Found latitude/longitude directly in details:', { 
        latitude: details.latitude, 
        longitude: details.longitude 
      });
      coordinates = {
        lat: details.latitude,
        lng: details.longitude
      };
    } else if (details.location?.coordinates) {
      console.log('Found coordinates in details.location.coordinates:', details.location.coordinates);
      coordinates = {
        lat: details.location.coordinates.lat || details.location.coordinates.latitude,
        lng: details.location.coordinates.lng || details.location.coordinates.longitude
      };
    } else {
      console.log('No coordinates found in any expected location');
    }
    
    return {
      address: property.address || details.address,
      locality: details.locality,
      city: property.city || details.city,
      state: property.state || details.state,
      pinCode: property.zip_code || details.pinCode || details.zipCode,
      landmark: details.landmark,
      flatPlotNo: details.flatPlotNo,
      coordinates
    };
  };

  const locationData = getLocationData();
  console.log('Final extracted locationData:', locationData);
  
  // Prepare address for display
  const getFormattedAddress = () => {
    const parts = [];
    
    if (locationData.flatPlotNo) {
      parts.push(locationData.flatPlotNo);
    }
    
    if (locationData.address) {
      parts.push(locationData.address);
    }
    
    if (locationData.locality) {
      parts.push(locationData.locality);
    }
    
    if (locationData.city) {
      parts.push(locationData.city);
    }
    
    if (locationData.state) {
      parts.push(locationData.state);
    }
    
    if (locationData.pinCode) {
      parts.push(locationData.pinCode);
    }
    
    if (parts.length === 0) {
      // If no specific address components, try to use full address if available
      return property.address || "Address not available";
    }
    
    return parts.join(', ');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-primary" />
          <span>Location</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Map Component - Using diagnostic version */}
        <PropertyLocationMapDiagnostic 
          coordinates={locationData.coordinates}
          address={locationData.address}
          locality={locationData.locality}
          city={locationData.city}
        />
        
        {/* Address and Details */}
        <div className="space-y-4">
          <div className="pt-2">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getFormattedAddress()}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {locationData.landmark && (
              <div className="flex items-start gap-2">
                <LandmarkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Landmark</p>
                  <p className="text-sm">{locationData.landmark}</p>
                </div>
              </div>
            )}
            
            {locationData.locality && (
              <div className="flex items-start gap-2">
                <MapIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Locality</p>
                  <p className="text-sm">{locationData.locality}</p>
                </div>
              </div>
            )}
            
            {locationData.flatPlotNo && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Flat Plot No</p>
                  <p className="text-sm">{locationData.flatPlotNo}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyLocationSection;