// src/modules/properties/hooks/usePropertyMapData.ts
// Version: 2.0.0
// Last Modified: 02-04-2025 17:20 IST
// Purpose: Enhanced hook with recent searches and location suggestions

import { useState, useEffect } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { fetchProperties, PropertyFilters } from '@/modules/seeker/services/seekerService';

// Popular locations for search suggestions
const POPULAR_LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", 
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat"
];

// Maximum number of recent searches to keep
const MAX_RECENT_SEARCHES = 10;

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
       setProperties(fetchedProperties as unknown as PropertyType[]);
       
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
 
 // Handle property hover states
 const handlePropertyHover = (propertyId: string, isHovering: boolean) => {
   setHoveredProperty(isHovering ? propertyId : null);
 };
 
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