// src/components/Search/hooks/useSearch.ts
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Main search hook for managing search state and operations

import { useState, useCallback } from 'react';
import { SearchFilters, SearchResult, SearchState } from '../types/search.types';
import { useSearchFilters } from './useSearchFilters';

export const useSearch = (onSearchCallback?: (filters: SearchFilters) => void) => {
  const searchFilters = useSearchFilters();
  
  const [searchState, setSearchState] = useState<Omit<SearchState, 'filters'>>({
    results: [],
    loading: false,
    error: null,
    totalCount: 0
  });

  const handleSearch = useCallback(() => {
    console.log('Search initiated with:', searchFilters.filters);
    
    // Call external callback if provided
    if (onSearchCallback) {
      onSearchCallback(searchFilters.filters);
    }
    
    // Here you would typically call your search service
    // For now, we'll just log the search parameters
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    // Simulate API call
    setTimeout(() => {
      setSearchState(prev => ({
        ...prev,
        loading: false,
        results: [], // This would be populated by actual search results
        totalCount: 0
      }));
    }, 500);
  }, [searchFilters.filters, onSearchCallback]);

  const updateSearchQuery = useCallback((query: string) => {
    searchFilters.updateFilter('searchQuery', query);
  }, [searchFilters]);

  const updateLocation = useCallback((location: string) => {
    searchFilters.updateFilter('selectedLocation', location);
  }, [searchFilters]);

  return {
    // Search filters
    ...searchFilters,
    
    // Search state
    ...searchState,
    
    // Search actions
    handleSearch,
    updateSearchQuery,
    updateLocation,
    
    // Combined state for convenience
    searchState: {
      ...searchState,
      filters: searchFilters.filters
    }
  };
};