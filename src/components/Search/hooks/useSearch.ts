// src/components/Search/hooks/useSearch.ts
// Version: 1.1.0
// Last Modified: 01-06-2025 15:00 IST
// Purpose: Added auto-search on clear all filters to revert to default results

import { useState, useCallback, useEffect } from 'react';
import { SearchFilters, SearchResult, SearchState } from '../types/search.types';
import { useSearchFilters } from './useSearchFilters';
import { searchService } from '../services/searchService';

export const useSearch = (onSearchCallback?: (filters: SearchFilters) => void) => {
  const searchFilters = useSearchFilters();
  
  const [searchState, setSearchState] = useState<Omit<SearchState, 'filters'>>({
    results: [],
    loading: false,
    error: null,
    totalCount: 0
  });

  // Track if filters were just cleared to trigger default search
  const [wasCleared, setWasCleared] = useState(false);

  // Check if all filters are empty/default
  const areFiltersEmpty = useCallback(() => {
    const { filters } = searchFilters;
    return !filters.searchQuery && 
           (!filters.selectedLocation || filters.selectedLocation === 'any') &&
           !filters.transactionType && 
           !filters.selectedPropertyType && 
           !filters.selectedSubType && 
           !filters.selectedBHK && 
           !filters.selectedPriceRange;
  }, [searchFilters.filters]);

  // Auto-trigger search when filters are cleared to load default results
  useEffect(() => {
    if (wasCleared && areFiltersEmpty()) {
      console.log('🔄 Filters cleared - loading default latest properties...');
      
      // Reset the wasCleared flag
      setWasCleared(false);
      
      // Trigger the callback to load default results
      if (onSearchCallback) {
        // Call with empty filters to signal loading default results
        onSearchCallback(searchFilters.filters);
      }
    }
  }, [wasCleared, areFiltersEmpty, onSearchCallback, searchFilters.filters]);

  const handleSearch = useCallback(async () => {
    console.log('Search initiated with:', searchFilters.filters);
    
    // Call external callback if provided
    if (onSearchCallback) {
      onSearchCallback(searchFilters.filters);
    }
    
    try {
      setSearchState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      // Call the search service
      const response = await searchService.search(searchFilters.filters, {
        page: 1,
        limit: 50
      });
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        results: response.results,
        totalCount: response.totalCount
      }));
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed',
        results: [],
        totalCount: 0
      }));
    }
  }, [searchFilters.filters, onSearchCallback]);

  const updateSearchQuery = useCallback((query: string) => {
    searchFilters.updateFilter('searchQuery', query);
  }, [searchFilters]);

  const updateLocation = useCallback((location: string) => {
    searchFilters.updateFilter('selectedLocation', location);
  }, [searchFilters]);

  // Enhanced clearAllFilters that triggers default search
  const clearAllFilters = useCallback(() => {
    console.log('🧹 Clearing all filters...');
    searchFilters.clearAllFilters();
    setWasCleared(true); // Flag that filters were cleared
  }, [searchFilters]);

  const clearResults = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      results: [],
      totalCount: 0,
      error: null
    }));
  }, []);

  return {
    // Search filters (override clearAllFilters with enhanced version)
    ...searchFilters,
    clearAllFilters, // Override with enhanced version
    
    // Search state
    ...searchState,
    
    // Search actions
    handleSearch,
    updateSearchQuery,
    updateLocation,
    clearResults,
    
    // Combined state for convenience
    searchState: {
      ...searchState,
      filters: searchFilters.filters
    }
  };
};