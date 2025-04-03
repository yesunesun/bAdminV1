// src/modules/properties/hooks/usePropertyMapData.ts
// Version: 2.1.0
// Last Modified: 03-04-2025 14:45 IST
// Purpose: Fixed coordinate validation and hover state debugging

import { useState, useEffect, useCallback } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { fetchProperties, PropertyFilters } from '@/modules/seeker/services/seekerService';

// Popular locations for search suggestions
const POPULAR_LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"
];

// Maximum number of recent searches to keep
const MAX_RECENT_SEARCHES = 10;

// Coordinate validation helper
const hasValidCoordinates = (property: PropertyType): boolean => {
  try {
    const lat = parseFloat(property.property_details?.latitude || '0');
    const lng = parseFloat(property.property_details?.longitude || '0');
    
    return (
      !isNaN(lat) && 
      !isNaN(lng) && 
      lat !== 0 && 
      lng !== 0 && 
      lat >= -90 && 
      lat <= 90 && 
      lng >= -180 && 
      lng <= 180
    );
  } catch (error) {
    console.error(`Coordinate validation error for property ${property.id}:`, error);
    return false;
  }
};

export const usePropertyMapData = () => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyType | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchLocations, setSearchLocations] = useState<string[]>(POPULAR_LOCATIONS);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);
  
  // Save search query to recent searches when changed
  useEffect(() => {
    if (searchQuery && searchQuery.trim().length > 2) {
      // Add to recent searches
      setRecentSearches(prev => {
        const newSearches = [
          searchQuery,
          ...prev.filter(s => s.toLowerCase() !== searchQuery.toLowerCase())
        ].slice(0, MAX_RECENT_SEARCHES);
        
        // Save to localStorage
        localStorage.setItem('recentSearches', JSON.stringify(newSearches));
        
        return newSearches;
      });
    }
  }, [searchQuery]);
  
  // Fetch properties based on filters and search query
  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const appliedFilters: PropertyFilters = {
          ...filters,
          searchQuery: searchQuery || undefined,
          propertyType: selectedPropertyType !== 'all' ? selectedPropertyType : undefined
        };
        
        const { properties: fetchedProperties } = await fetchProperties(appliedFilters);
        
        // Filter properties with valid coordinates for map display
        const validProperties = fetchedProperties.filter((property) => {
          const isValid = hasValidCoordinates(property);
          
          if (!isValid) {
            console.warn(`Property ${property.id} excluded from map due to invalid coordinates:`, {
              latitude: property.property_details?.latitude,
              longitude: property.property_details?.longitude
            });
          }
          
          return isValid;
        });
        
        console.log(`Fetched ${fetchedProperties.length} properties, ${validProperties.length} have valid coordinates`);
        
        setProperties(validProperties as unknown as PropertyType[]);
        
        // Update location suggestions based on fetched properties
        if (fetchedProperties.length > 0) {
          const locations = new Set<string>();
          
          // Extract locations from properties
          fetchedProperties.forEach(property => {
            if (property.city) locations.add(property.city);
            if (property.address) {
              // Extract locality or area from address
              const parts = property.address.split(',');
              if (parts.length > 1) {
                locations.add(parts[0].trim());
              }
            }
          });
          
          // Combine with popular locations
          const combinedLocations = [...Array.from(locations), ...POPULAR_LOCATIONS];
          
          // Remove duplicates and limit to top 10
          setSearchLocations([...new Set(combinedLocations)].slice(0, 10));
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProperties();
  }, [filters, searchQuery, selectedPropertyType]);
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSelectedPropertyType('all');
  };
  
  // Update property type filter
  const handlePropertyTypeChange = (type: string) => {
    setSelectedPropertyType(type);
  };
  
  // Handle property hover states with improved debugging
  const handlePropertyHover = useCallback((propertyId: string, isHovering: boolean) => {
    console.log(`Property hover: ${propertyId}, isHovering: ${isHovering}`);
    setHoveredProperty(isHovering ? propertyId : null);
  }, []);
  
  // Log hover state changes for debugging
  useEffect(() => {
    console.log('Current hoveredProperty state:', hoveredProperty);
  }, [hoveredProperty]);
  
  return {
    properties,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    selectedPropertyType,
    hoveredProperty,
    activeProperty,
    setActiveProperty,
    handleResetFilters,
    handlePropertyTypeChange,
    handlePropertyHover,
    recentSearches,
    searchLocations
  };
};