// src/components/Search/hooks/useSearch.ts
// Version: 2.0.0
// Last Modified: 31-01-2025 16:50 IST
// Purpose: Updated to handle actionType instead of transactionType and new filter logic

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
           (!filters.actionType || filters.actionType === 'any') && // CHANGED: from transactionType
           (!filters.selectedPropertyType || filters.selectedPropertyType === 'any') && 
           (!filters.selectedSubType || filters.selectedSubType === 'any') && 
           (!filters.selectedBHK || filters.selectedBHK === 'any') && 
           (!filters.selectedPriceRange || filters.selectedPriceRange === 'any');
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

  /**
   * Transform ActionType to TransactionType for backend compatibility
   */
  const getTransactionTypeFromActionType = (actionType: string): string => {
    switch (actionType) {
      case 'buy':
        return 'buy';
      case 'sell':
        return 'buy'; // Sell is also treated as buy transaction in database
      case 'any':
      default:
        return 'rent'; // Default to rent
    }
  };

  /**
   * Transform filters for backend compatibility
   */
  const transformFiltersForBackend = (filters: SearchFilters) => {
    // Create a compatible filter object for the backend
    return {
      ...filters,
      transactionType: getTransactionTypeFromActionType(filters.actionType)
    };
  };

  /**
   * ENHANCED: Smart search that detects 6-character property codes and uses appropriate search method
   */
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

      let response;
      const query = searchFilters.filters.searchQuery?.trim();
      
      // Transform filters for backend compatibility
      const backendFilters = transformFiltersForBackend(searchFilters.filters);
      
      // Check if the search query is exactly a 6-character alphanumeric property code
      if (query && searchService.isPropertyCode(query)) {
        console.log('🎯 Detected 6-character property code in search, using smart search');
        // Use smart search which tries code search first, then falls back to regular search
        response = await searchService.smartSearch(backendFilters, {
          page: 1,
          limit: 50
        });
      } else {
        // Use regular search for non-code queries
        console.log('🔍 Using regular search (not a 6-character property code)');
        response = await searchService.search(backendFilters, {
          page: 1,
          limit: 50
        });
      }
      
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

  /**
   * Direct property code search method (for exactly 6-character codes)
   */
  const searchByCode = useCallback(async (code: string) => {
    console.log('🔍 Direct property code search:', code);
    
    // Validate that it's exactly 6 characters alphanumeric
    if (!searchService.isPropertyCode(code)) {
      console.warn('⚠️ Invalid property code format. Must be exactly 6 alphanumeric characters.');
      setSearchState(prev => ({
        ...prev,
        error: 'Property code must be exactly 6 alphanumeric characters',
        results: [],
        totalCount: 0
      }));
      return [];
    }
    
    try {
      setSearchState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      const response = await searchService.searchByCode(code, true);
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        results: response.results,
        totalCount: response.totalCount
      }));

      return response.results;
      
    } catch (error) {
      console.error('Code search error:', error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Code search failed',
        results: [],
        totalCount: 0
      }));
      return [];
    }
  }, []);

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

  /**
   * UPDATED: Get search suggestions with 6-character property code support
   */
  const getSearchSuggestions = useCallback(async (query: string): Promise<string[]> => {
    try {
      return await searchService.getSearchSuggestions(query);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }, []);

  /**
   * Check if a query is a valid 6-character property code
   */
  const isValidPropertyCode = useCallback((query: string): boolean => {
    return searchService.isPropertyCode(query);
  }, []);

  return {
    // Search filters (override clearAllFilters with enhanced version)
    ...searchFilters,
    clearAllFilters, // Override with enhanced version
    
    // Search state
    ...searchState,
    
    // Search actions
    handleSearch,
    searchByCode, // Direct code search for 6-character codes
    updateSearchQuery,
    updateLocation,
    clearResults,
    getSearchSuggestions, // Enhanced suggestions with code support
    isValidPropertyCode, // NEW: Utility to check if query is valid property code
    
    // Combined state for convenience
    searchState: {
      ...searchState,
      filters: searchFilters.filters
    }
  };
};