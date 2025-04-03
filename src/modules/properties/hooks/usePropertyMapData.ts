// src/modules/properties/hooks/usePropertyMapData.ts
// Version: 2.2.0
// Last Modified: 03-04-2025 16:45 IST
// Purpose: Added pagination support and property loading state for map view

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
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPropertyType, setSelectedPropertyType] = useState<string>('all');
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyType | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchLocations, setSearchLocations] = useState<string[]>(POPULAR_LOCATIONS);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
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
      // Reset pagination when filters change
      setCurrentPage(1);
      setProperties([]);
      setLoading(true);
      setHasMore(true);
      
      try {
        const appliedFilters: PropertyFilters = {
          ...filters,
          searchQuery: searchQuery || undefined,
          propertyType: selectedPropertyType !== 'all' ? selectedPropertyType : undefined,
          page: 1,
          pageSize: 50
        };
        
        const result = await fetchProperties(appliedFilters);
        
        // Filter properties with valid coordinates for map display
        const validProperties = result.properties.filter(hasValidCoordinates);
        
        console.log(`Fetched ${result.properties.length} properties, ${validProperties.length} have valid coordinates. Total: ${result.totalCount}`);
        
        setProperties(validProperties);
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
        setHasMore(result.currentPage < result.totalPages);
        
        // Update location suggestions based on fetched properties
        if (result.properties.length > 0) {
          const locations = new Set<string>();
          
          // Extract locations from properties
          result.properties.forEach(property => {
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
  
  // Load more properties function
  const loadMoreProperties = useCallback(async () => {
    // Don't load more if we're already at the last page
    if (!hasMore || loadingMore) return;
    
    setLoadingMore(true);
    
    try {
      const nextPage = currentPage + 1;
      
      const appliedFilters: PropertyFilters = {
        ...filters,
        searchQuery: searchQuery || undefined,
        propertyType: selectedPropertyType !== 'all' ? selectedPropertyType : undefined,
        page: nextPage,
        pageSize: 50
      };
      
      const result = await fetchProperties(appliedFilters);
      
      // Filter properties with valid coordinates
      const validNewProperties = result.properties.filter(hasValidCoordinates);
      
      console.log(`Loaded more: ${result.properties.length} properties on page ${nextPage}, ${validNewProperties.length} have valid coordinates`);
      
      // Add new properties to existing ones
      setProperties(prevProperties => [...prevProperties, ...validNewProperties]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } catch (error) {
      console.error('Error loading more properties:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    currentPage, 
    filters, 
    hasMore, 
    loadingMore, 
    searchQuery, 
    selectedPropertyType
  ]);
  
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
  
  return {
    properties,
    loading,
    loadingMore,
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
    searchLocations,
    loadMoreProperties,
    hasMore,
    totalCount
  };
};