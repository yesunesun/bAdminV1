// src/modules/seeker/pages/AllProperties/hooks/usePropertyFilters.ts
// Version: 1.0.0
// Last Modified: 05-04-2025 22:40 IST
// Purpose: Hook to manage property filters

import { useState, useEffect } from 'react';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';

export type Filters = {
  coordinatesFilter: 'all' | 'available' | 'notAvailable';
  ownerFilter: string;
};

export const usePropertyFilters = (properties: PropertyType[]) => {
  const [filters, setFilters] = useState<Filters>({
    coordinatesFilter: 'all',
    ownerFilter: '',
  });
  
  const [filteredProperties, setFilteredProperties] = useState<PropertyType[]>([]);

  // Apply filters whenever properties or filter values change
  useEffect(() => {
    let result = [...properties];
    
    // Apply coordinates filter
    if (filters.coordinatesFilter !== 'all') {
      result = result.filter(property => {
        const hasCoords = hasCoordinates(property);
        return filters.coordinatesFilter === 'available' ? hasCoords : !hasCoords;
      });
    }
    
    // Apply owner filter
    if (filters.ownerFilter) {
      result = result.filter(property => 
        property.profiles && property.profiles.id === filters.ownerFilter
      );
    }
    
    setFilteredProperties(result);
  }, [properties, filters]);

  // Reset filters
  const resetFilters = () => {
    setFilters({
      coordinatesFilter: 'all',
      ownerFilter: '',
    });
  };

  return {
    filters,
    setFilters,
    filteredProperties,
    resetFilters
  };
};

// Enhanced function to check if a property has coordinates
const hasCoordinates = (property: PropertyType) => {
  // Check all possible locations where coordinates might be stored
  
  // Check in property_details.coordinates
  if (property.property_details?.coordinates) {
    const lat = property.property_details.coordinates.lat;
    const lng = property.property_details.coordinates.lng;
    if (lat !== undefined && lng !== undefined) {
      // Ensure lat and lng are numbers
      const parsedLat = parseFloat(lat as any);
      const parsedLng = parseFloat(lng as any);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return true;
      }
    }
  }
  
  // Check in property_details.location.coordinates
  if (property.property_details?.location?.coordinates) {
    const lat = property.property_details.location.coordinates.lat;
    const lng = property.property_details.location.coordinates.lng;
    if (lat !== undefined && lng !== undefined) {
      const parsedLat = parseFloat(lat as any);
      const parsedLng = parseFloat(lng as any);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return true;
      }
    }
  }
  
  // Check in property_details.mapCoordinates
  if (property.property_details?.mapCoordinates) {
    const lat = property.property_details.mapCoordinates.lat;
    const lng = property.property_details.mapCoordinates.lng;
    if (lat !== undefined && lng !== undefined) {
      const parsedLat = parseFloat(lat as any);
      const parsedLng = parseFloat(lng as any);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return true;
      }
    }
  }
  
  // Check for latitude and longitude directly in property_details
  if (property.property_details?.latitude !== undefined && 
      property.property_details?.longitude !== undefined) {
    const lat = property.property_details.latitude;
    const lng = property.property_details.longitude;
    const parsedLat = parseFloat(lat as any);
    const parsedLng = parseFloat(lng as any);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      return true;
    }
  }
  
  // Check for lat and lng directly in property_details
  if (property.property_details?.lat !== undefined && 
      property.property_details?.lng !== undefined) {
    const lat = property.property_details.lat;
    const lng = property.property_details.lng;
    const parsedLat = parseFloat(lat as any);
    const parsedLng = parseFloat(lng as any);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      return true;
    }
  }
  
  return false;
};