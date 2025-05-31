// src/components/Search/hooks/useSearch.ts
// Version: 1.0.0
// Last Modified: 01-06-2025 16:30 IST
// Purpose: Main search hook for managing search state and operations

import { useState, useCallback } from 'react';
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

  const clearResults = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      results: [],
      totalCount: 0,
      error: null
    }));
  }, []);

  return {
    // Search filters
    ...searchFilters,
    
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