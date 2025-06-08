// src/modules/seeker/hooks/usePropertyMapData.ts
// Version: 3.1.0
// Last Modified: 09-05-2025 16:20 IST
// Purpose: Updated to support properties_v2 table with improved debugging

import { useState, useEffect, useCallback } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { fetchPropertiesForMap, PropertyFilters, debugTableSchema } from '../services/seekerService';

// Popular locations for search suggestions
const POPULAR_LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"
];

// Maximum number of recent searches to keep
const MAX_RECENT_SEARCHES = 10;

// Page size for pagination (changed from 10 to 9 to match initial view)
const PAGE_SIZE = 25;

// Helper to safely get nested property value
const getNestedValue = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : defaultValue;
    }, obj);
  } catch (e) {
    console.error(`Error getting nested value for path ${path}:`, e);
    return defaultValue;
  }
};

// Enhanced coordinate validation helper for properties_v2 format
const hasValidCoordinates = (property: PropertyType): boolean => {
  try {
    // Debug the property structure to help diagnose coordinate problems
    console.debug(`Checking coordinates for property ${property.id}`);
    
    // Check all possible coordinate formats in properties_v2 structure
    
    // 1. Check direct latitude/longitude properties added during processing
    if (property.latitude !== undefined && property.longitude !== undefined) {
      const lat = parseFloat(String(property.latitude));
      const lng = parseFloat(String(property.longitude));
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.debug(`Valid coordinates found in direct latitude/longitude: ${lat}, ${lng}`);
        return true;
      }
    }
    
    // 2. Check property_details.location.coordinates (v2 format)
    const locationCoords = getNestedValue(property, 'property_details.location.coordinates', null);
    if (locationCoords) {
      // Check lat/lng format
      const lat = parseFloat(String(getNestedValue(locationCoords, 'lat', NaN) || getNestedValue(locationCoords, 'latitude', NaN)));
      const lng = parseFloat(String(getNestedValue(locationCoords, 'lng', NaN) || getNestedValue(locationCoords, 'longitude', NaN)));
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.debug(`Valid coordinates found in property_details.location.coordinates: ${lat}, ${lng}`);
        return true;
      }
    }
    
    // 3. Check property_details.coordinates
    const directCoords = getNestedValue(property, 'property_details.coordinates', null);
    if (directCoords) {
      // Check lat/lng format
      const lat = parseFloat(String(getNestedValue(directCoords, 'lat', NaN) || getNestedValue(directCoords, 'latitude', NaN)));
      const lng = parseFloat(String(getNestedValue(directCoords, 'lng', NaN) || getNestedValue(directCoords, 'longitude', NaN)));
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        console.debug(`Valid coordinates found in property_details.coordinates: ${lat}, ${lng}`);
        return true;
      }
    }
    
    // For debugging - if we got here, no valid coordinates were found
    console.debug(`No valid coordinates found for property ${property.id}`);
    
    // For initial phase, return true for all properties to get them to show up in the list
    // We can remove this later once coordinate issues are resolved
    console.debug(`Temporarily allowing property ${property.id} without coordinates`);
    return true;
  } catch (error) {
    console.error(`Coordinate validation error for property ${property.id}:`, error);
    // For initial phase, allow even on error
    return true;
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
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  
  // Check if properties_v2 table exists on component mount
  useEffect(() => {
    const checkTable = async () => {
      try {
        const schemaInfo = await debugTableSchema('properties_v2');
        console.log('properties_v2 table check:', schemaInfo);
      } catch (error) {
        console.error('Error checking properties_v2 table:', error);
      }
    };
    
    checkTable();
  }, []);
  
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
  
  // Initial load of properties
  useEffect(() => {
    const loadInitialProperties = async () => {
      // Reset pagination and properties when filters change
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
          pageSize: PAGE_SIZE
        };
        
        console.log('Initial load - applied filters:', appliedFilters);
        const result = await fetchPropertiesForMap(appliedFilters);
        
        // Ensure we're consistently handling the object return format
        const propertiesArray = result.properties || [];
        const totalCountValue = result.totalCount || 0;
        
        console.log(`Initial load: Fetched ${propertiesArray.length} properties (before coordinate filtering). Total available: ${totalCountValue}`);
        
        // Filter valid properties - using relaxed validation initially
        const validProperties = propertiesArray;
        
        console.log(`Initial load: Setting ${validProperties.length} properties to state`);
        
        setProperties(validProperties);
        setTotalCount(totalCountValue);
        setHasMore(validProperties.length > 0 && validProperties.length < totalCountValue);
        
        // Update location suggestions based on fetched properties
        if (propertiesArray.length > 0) {
          const locations = new Set<string>();
          
          // Extract locations from properties
          propertiesArray.forEach(property => {
            if (property.city) locations.add(property.city);
            
            // Try to extract city from property_details.location
            const cityFromDetails = getNestedValue(property, 'property_details.location.city', null);
            if (cityFromDetails) locations.add(cityFromDetails);
            
            // Try to extract address 
            const address = property.address || getNestedValue(property, 'property_details.location.address', null);
            if (address) {
              // Extract locality or area from address
              const parts = address.split(',');
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
        console.error('Error loading initial properties:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialProperties();
  }, [filters, searchQuery, selectedPropertyType]);
  
  // Load more properties function
  const loadMoreProperties = useCallback(async () => {
    // Don't load more if already loading or all loaded
    if (loadingMore || loading || !hasMore || currentPage >= totalPages) {
      console.log(`Skipping loadMore: loadingMore=${loadingMore}, loading=${loading}, hasMore=${hasMore}, currentPage=${currentPage}, totalPages=${totalPages}`);
      return;
    }
    
    setLoadingMore(true);
    console.log(`Loading more properties: page ${currentPage + 1} of ${totalPages}, loaded=${properties.length}, total=${totalCount}`);
    
    try {
      const nextPage = currentPage + 1;
      
      const appliedFilters: PropertyFilters = {
        ...filters,
        searchQuery: searchQuery || undefined,
        propertyType: selectedPropertyType !== 'all' ? selectedPropertyType : undefined,
        page: nextPage,
        pageSize: PAGE_SIZE
      };
      
      console.log('Load More - applied filters:', appliedFilters);
      const result = await fetchPropertiesForMap(appliedFilters);
      
      // Ensure we're consistently handling the object return format
      const propertiesArray = result.properties || [];
      const totalCountValue = result.totalCount || 0;
      
      console.log(`Page ${nextPage}: Fetched ${propertiesArray.length} properties`);
      
      if (propertiesArray.length === 0) {
        console.log("No new properties found");
        setHasMore(false);
      } else {
        // Add new properties to existing list, ensuring no duplicates
        setProperties(prevProperties => {
          const existingIds = new Set(prevProperties.map(p => p.id));
          const uniqueNewProperties = propertiesArray.filter(p => !existingIds.has(p.id));
          
          console.log(`Adding ${uniqueNewProperties.length} unique new properties to existing ${prevProperties.length}`);
          
          return [...prevProperties, ...uniqueNewProperties];
        });
        
        // Check if there are more pages
        const hasMorePages = nextPage < Math.ceil(totalCountValue / PAGE_SIZE);
        setHasMore(hasMorePages);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more properties:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [
    currentPage,
    filters,
    hasMore,
    loading,
    loadingMore,
    properties.length,
    searchQuery,
    selectedPropertyType,
    totalCount,
    totalPages
  ]);
  
  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setSelectedPropertyType('all');
  }, []);
  
  // Update property type filter
  const handlePropertyTypeChange = useCallback((type: string) => {
    setSelectedPropertyType(type);
  }, []);
  
  // Handle property hover states
  const handlePropertyHover = useCallback((propertyId: string, isHovering: boolean) => {
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
    totalCount,
    pagination: {
      page: currentPage,
      totalPages,
      totalProperties: totalCount,
      nextPage: loadMoreProperties,
      prevPage: () => {}, // Not implemented as UI doesn't use it
      goToPage: () => {}, // Not implemented as UI doesn't use it
    }
  };
};