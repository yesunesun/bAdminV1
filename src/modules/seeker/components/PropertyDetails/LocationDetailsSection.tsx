// src/modules/seeker/components/PropertyDetails/LocationDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 17:00 IST
// Purpose: Reusable component for displaying property location details with map

import React from 'react';
import { Card } from '@/components/ui/card';
import { renderFieldValue } from './utils/dataFormatters';
import PropertyLocationMap from './PropertyLocationMap';

interface LocationDetailsSectionProps {
  location: any;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * LocationDetailsSection Component
 * Displays property location information with integrated map and additional details
 */
const LocationDetailsSection: React.FC<LocationDetailsSectionProps> = ({ 
  location, 
  address, 
  city, 
  state, 
  zipCode 
}) => {
  if (!location && !address) return null;

  // Format location string
  const locationParts = location ? [
    location.address,
    location.area,
    location.city,
    location.state,
    location.pinCode
  ].filter(Boolean) : [];

  const locationString = locationParts.length > 0
    ? locationParts.join(', ')
    : address
      ? [address, city, state, zipCode].filter(Boolean).join(', ')
      : "Location not specified";

  // Extract coordinates from the location object
  const getCoordinates = () => {
    if (!location) return null;

    // Try various coordinate formats
    if (location.latitude && location.longitude) {
      return {
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude)
      };
    }

    if (location.lat && location.lng) {
      return {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lng)
      };
    }

    if (location.coordinates) {
      const lat = location.coordinates.lat || location.coordinates.latitude;
      const lng = location.coordinates.lng || location.coordinates.longitude;

      if (lat && lng) {
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        };
      }
    }

    return null;
  };

  const coordinates = getCoordinates();

  // Fields to exclude from additional details display
  const excludedFields = [
    'latitude', 
    'longitude', 
    'lat', 
    'lng', 
    'coordinates', 
    'address', 
    'area', 
    'city', 
    'state', 
    'pinCode'
  ];

  // Get additional location details
  const additionalDetails = location 
    ? Object.entries(location).filter(([key]) => !excludedFields.includes(key))
    : [];

  return (
    <Card className="p-4 md:p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Location</h2>

      {/* Map Section - Using PropertyLocationMap component */}
      <div className="mb-4 rounded-lg overflow-hidden">
        <PropertyLocationMap
          coordinates={coordinates}
          address={location?.address || address}
          locality={location?.area || location?.locality}
          city={location?.city || city}
        />
      </div>

      {/* Location Address */}
      <p className="text-gray-700 mb-4">{locationString}</p>

      {/* Display additional location details if available */}
      {additionalDetails.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 border-t border-gray-200 pt-4">
          {additionalDetails.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-gray-900">
                {renderFieldValue(value, key)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default LocationDetailsSection;