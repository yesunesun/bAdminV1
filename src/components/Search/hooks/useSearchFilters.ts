// src/components/Search/hooks/useSearchFilters.ts
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Hook for managing search filters logic

import { useState, useCallback } from 'react';
import { SearchFilters, FilterType } from '../types/search.types';
import { 
  PROPERTY_TYPES, 
  COWORKING_SUBTYPES,
  TRANSACTION_TYPES,
  BHK_TYPES,
  PRICE_RANGES,
  TELANGANA_LOCATIONS
} from '../constants/searchConstants';

const initialFilters: SearchFilters = {
  searchQuery: '',
  selectedLocation: 'any',
  transactionType: '',
  selectedPropertyType: '',
  selectedSubType: '',
  selectedBHK: '',
  selectedPriceRange: ''
};

export const useSearchFilters = () => {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  const updateFilter = useCallback((filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      
      // Handle dependent filter resets
      if (filterType === 'selectedPropertyType') {
        newFilters.selectedSubType = '';
        newFilters.selectedBHK = '';
        
        // If "Any Type" is selected, also reset subtype and BHK to "Any"
        if (value === 'any') {
          newFilters.selectedSubType = 'any';
          newFilters.selectedBHK = 'any';
        }
      }
      
      return newFilters;
    });
  }, []);

  const clearFilter = useCallback((filterType: FilterType) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      switch (filterType) {
        case 'transactionType':
          newFilters.transactionType = '';
          break;
        case 'propertyType':
          newFilters.selectedPropertyType = '';
          newFilters.selectedSubType = '';
          newFilters.selectedBHK = '';
          break;
        case 'subType':
          newFilters.selectedSubType = '';
          break;
        case 'bhkType':
          newFilters.selectedBHK = '';
          break;
        case 'priceRange':
          newFilters.selectedPriceRange = '';
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
    if (!filters.selectedPropertyType) {
      return {};
    }
    
    // Special case for coworking space
    if (filters.selectedPropertyType === 'commercial' && filters.selectedSubType === 'coworking') {
      return COWORKING_SUBTYPES;
    }
    
    // For PG/Hostel and Flatmates, return room types
    if (filters.selectedPropertyType === 'pghostel' || filters.selectedPropertyType === 'flatmates') {
      return PROPERTY_TYPES[filters.selectedPropertyType].subtypes;
    }
    
    // Default case
    if (PROPERTY_TYPES[filters.selectedPropertyType as keyof typeof PROPERTY_TYPES]) {
      return PROPERTY_TYPES[filters.selectedPropertyType as keyof typeof PROPERTY_TYPES].subtypes;
    }
    
    return {};
  }, [filters.selectedPropertyType, filters.selectedSubType]);

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
    return filters.transactionType || 
           filters.selectedPropertyType || 
           filters.selectedSubType || 
           filters.selectedBHK || 
           filters.selectedPriceRange || 
           (filters.selectedLocation && filters.selectedLocation !== 'any');
  }, [filters]);

  const getFilterDisplayValue = useCallback((filterType: FilterType, value: string) => {
    switch (filterType) {
      case 'transactionType':
        return TRANSACTION_TYPES[value as keyof typeof TRANSACTION_TYPES];
      case 'propertyType':
        return PROPERTY_TYPES[value as keyof typeof PROPERTY_TYPES]?.label;
      case 'subType':
        return getSubTypes()[value];
      case 'bhkType':
        return BHK_TYPES[value as keyof typeof BHK_TYPES];
      case 'priceRange':
        return PRICE_RANGES[value as keyof typeof PRICE_RANGES];
      case 'location':
        return value === 'any' ? 'Any Location' : TELANGANA_LOCATIONS[value as keyof typeof TELANGANA_LOCATIONS];
      default:
        return value;
    }
  }, [getSubTypes]);

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