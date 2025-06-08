// src/modules/seeker/pages/AllProperties/hooks/useCoordinatesUtils.ts
// Version: 1.0.1
// Last Modified: 06-04-2025 23:05 IST
// Purpose: Simplified check for coordinates

import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';

export const useCoordinatesUtils = () => {
  // Helper to safely format coordinate numbers
  const formatCoordinate = (value: any): string => {
    // Check if the value is a valid number
    if (value === null || value === undefined) {
      return "N/A";
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      return "N/A";
    }
    
    return num.toFixed(6);
  };

  // Simple function to check if a property has coordinates
  const hasCoordinates = (property: PropertyType) => {
    // First check the expected format after our update
    if (property.property_details?.coordinates) {
      const { lat, lng } = property.property_details.coordinates;
      if (typeof lat === 'number' && typeof lng === 'number') {
        return true;
      }
    }
    
    // Check all possible fallback locations
    const details = property.property_details || {};
    
    // Check each possible coordinates format
    if (details.mapCoordinates?.lat && details.mapCoordinates?.lng) return true;
    if (details.lat && details.lng) return true;
    if (details.latitude && details.longitude) return true;
    if (details.location?.coordinates?.lat && details.location?.coordinates?.lng) return true;
    
    return false;
  };

  // Function to get coordinates display text
  const getCoordinatesDisplay = (property: PropertyType) => {
    const details = property.property_details || {};
    
    // First check the expected format after our update
    if (details.coordinates?.lat && details.coordinates?.lng) {
      return `${formatCoordinate(details.coordinates.lat)}, ${formatCoordinate(details.coordinates.lng)}`;
    }
    
    // Check all possible fallback locations
    if (details.mapCoordinates?.lat && details.mapCoordinates?.lng) {
      return `${formatCoordinate(details.mapCoordinates.lat)}, ${formatCoordinate(details.mapCoordinates.lng)}`;
    }
    
    if (details.lat && details.lng) {
      return `${formatCoordinate(details.lat)}, ${formatCoordinate(details.lng)}`;
    }
    
    if (details.latitude && details.longitude) {
      return `${formatCoordinate(details.latitude)}, ${formatCoordinate(details.longitude)}`;
    }
    
    if (details.location?.coordinates?.lat && details.location?.coordinates?.lng) {
      return `${formatCoordinate(details.location.coordinates.lat)}, ${formatCoordinate(details.location.coordinates.lng)}`;
    }
    
    return "No coordinates available";
  };

  return {
    formatCoordinate,
    hasCoordinates,
    getCoordinatesDisplay,
  };
};