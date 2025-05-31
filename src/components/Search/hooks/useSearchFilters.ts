// src/components/Search/hooks/useSearchFilters.ts
// Version: 2.0.0
// Last Modified: 31-01-2025 16:45 IST
// Purpose: Updated hook to handle Action Type logic and conditional dropdowns

import { useState, useCallback } from 'react';
import { SearchFilters, FilterType } from '../types/search.types';
import { 
  ACTION_TYPES,
  getAvailablePropertyTypes,
  getSubtypesForProperty,
  BHK_TYPES,
  PRICE_RANGES,
  TELANGANA_LOCATIONS,
  COWORKING_SUBTYPES
} from '../constants/searchConstants';

const initialFilters: SearchFilters = {
  searchQuery: '',
  selectedLocation: 'any',
  actionType: 'any', // CHANGED: from transactionType to actionType
  selectedPropertyType: 'any',
  selectedSubType: 'any',
  selectedBHK: 'any',
  selectedPriceRange: 'any'
};

export const useSearchFilters = () => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const updateFilter = useCallback((filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      
      // Handle dependent filter resets based on new logic
      if (filterType === 'actionType') {
        // When action type changes, reset property type and dependent filters
        // Land is only available for Sell
        if (value !== 'sell' && newFilters.selectedPropertyType === 'land') {
          newFilters.selectedPropertyType = 'any';
          newFilters.selectedSubType = 'any';
          newFilters.selectedBHK = 'any';
        }
      }
      
      if (filterType === 'selectedPropertyType') {
        // Reset dependent filters when property type changes
        newFilters.selectedSubType = 'any';
        newFilters.selectedBHK = 'any';
        
        // If "Any" is selected, reset subtype and BHK
        if (value === 'any' || value === '') {
          newFilters.selectedSubType = 'any';
          newFilters.selectedBHK = 'any';
        }
        
        // If not residential, reset BHK
        if (value !== 'residential') {
          newFilters.selectedBHK = 'any';
        }
        
        // If PG/Hostel or Flatmates, reset BHK as it's not applicable
        if (value === 'pghostel' || value === 'flatmates') {
          newFilters.selectedBHK = 'any';
        }
      }
      
      if (filterType === 'selectedSubType') {
        // If subtype changes and it's coworking, no special reset needed
        // For other subtypes, BHK logic is handled by property type
      }
      
      return newFilters;
    });
  }, []);

  const clearFilter = useCallback((filterType: FilterType) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (filterType) {
        case 'actionType':
          newFilters.actionType = 'any';
          // If clearing action type and land was selected, reset property type
          if (newFilters.selectedPropertyType === 'land') {
            newFilters.selectedPropertyType = 'any';
            newFilters.selectedSubType = 'any';
            newFilters.selectedBHK = 'any';
          }
          break;
        case 'propertyType':
          newFilters.selectedPropertyType = 'any';
          newFilters.selectedSubType = 'any';
          newFilters.selectedBHK = 'any';
          break;
        case 'subType':
          newFilters.selectedSubType = 'any';
          break;
        case 'bhkType':
          newFilters.selectedBHK = 'any';
          break;
        case 'priceRange':
          newFilters.selectedPriceRange = 'any';
          break;
        case 'location':
          newFilters.selectedLocation = 'any';
          break;
      }
      
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const getSubTypes = useCallback(() => {
    // Check if coworking is selected for special case
    const isCoworkingSelected = filters.selectedSubType === 'coworking';
    
    return getSubtypesForProperty(
      filters.selectedPropertyType, 
      filters.actionType, 
      isCoworkingSelected
    );
  }, [filters.selectedPropertyType, filters.actionType, filters.selectedSubType]);

  const getSubtypeLabel = useCallback(() => {
    if (filters.selectedPropertyType === 'pghostel' || filters.selectedPropertyType === 'flatmates') {
      return 'Room Type';
    }
    if (filters.selectedPropertyType === 'commercial' && filters.selectedSubType === 'coworking') {
      return 'Space Type';
    }
    return 'Subtype';
  }, [filters.selectedPropertyType, filters.selectedSubType]);

  const hasActiveFilters = useCallback(() => {
    return (filters.actionType && filters.actionType !== 'any') || 
           (filters.selectedPropertyType && filters.selectedPropertyType !== 'any') || 
           (filters.selectedSubType && filters.selectedSubType !== 'any') || 
           (filters.selectedBHK && filters.selectedBHK !== 'any') || 
           (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') || 
           (filters.selectedLocation && filters.selectedLocation !== 'any');
  }, [filters]);

  const getFilterDisplayValue = useCallback((filterType: FilterType, value: string) => {
    if (!value || value === 'any') return '';
    
    switch (filterType) {
      case 'actionType':
        return ACTION_TYPES[value as keyof typeof ACTION_TYPES] || value;
      case 'propertyType':
        const availableTypes = getAvailablePropertyTypes(filters.actionType);
        return availableTypes[value as keyof typeof availableTypes]?.label || value;
      case 'subType':
        return getSubTypes()[value] || value;
      case 'bhkType':
        return BHK_TYPES[value as keyof typeof BHK_TYPES] || value;
      case 'priceRange':
        return PRICE_RANGES[value as keyof typeof PRICE_RANGES] || value;
      case 'location':
        return value === 'any' ? 'Any Location' : (TELANGANA_LOCATIONS[value as keyof typeof TELANGANA_LOCATIONS] || value);
      default:
        return value;
    }
  }, [getSubTypes, filters.actionType]);

  return {
    filters,
    updateFilter,
    clearFilter,
    clearAllFilters,
    getSubTypes,
    getSubtypeLabel,
    hasActiveFilters: hasActiveFilters(),
    getFilterDisplayValue
  };
};