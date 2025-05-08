// src/modules/seeker/components/PropertyDetails/PropertyLocationSection.tsx
// Version: 2.0.0
// Last Modified: 08-05-2025 22:30 IST
// Purpose: Simplified wrapper for PropertyLocationMap with direct coordinate handling

import React from 'react';
import PropertyLocationMap from './PropertyLocationMap';

interface PropertyLocationSectionProps {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number } | null;
  latitude?: number;
  longitude?: number;
}

const PropertyLocationSection: React.FC<PropertyLocationSectionProps> = ({
  address,
  city,
  state,
  zipCode,
  coordinates,
  latitude,
  longitude
}) => {
  // Combine coordinates from different sources
  const mapCoordinates = coordinates || 
    (latitude !== undefined && longitude !== undefined ? 
      { lat: latitude, lng: longitude } : 
      null);
  
  return (
    <PropertyLocationMap 
      address={address}
      city={city}
      state={state}
      zipCode={zipCode}
      coordinates={mapCoordinates}
    />
  );
};

export default PropertyLocationSection;