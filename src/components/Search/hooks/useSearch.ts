// src/components/Search/hooks/useSearch.ts
// Version: 3.0.0
// Last Modified: 02-06-2025 18:40 IST
// Purpose: Updated to use fixed search service with proper parameter mapping

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
           (!filters.actionType || filters.actionType === 'any') &&
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
      
      // Load default latest properties
      loadLatestProperties();
    }
  }, [wasCleared, areFiltersEmpty]);

  /**
   * Load latest properties as default content
   */
  const loadLatestProperties = useCallback(async () => {
    try {
      setSearchState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      console.log('🏠 Loading latest properties as default content');
      const response = await searchService.getLatestProperties(50);
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        results: response.results,
        totalCount: response.totalCount
      }));

      // Call external callback if provided
      if (onSearchCallback) {
        onSearchCallback(searchFilters.filters);
      }
      
    } catch (error) {
      console.error('Error loading latest properties:', error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load properties',
        results: [],
        totalCount: 0
      }));
    }
  }, [onSearchCallback, searchFilters.filters]);

  /**
   * Enhanced smart search using the fixed search service
   */
  const handleSearch = useCallback(async () => {
    console.log('🔍 Search initiated with filters:', searchFilters.filters);
    
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
      
      // Check if all filters are empty - load latest properties
      if (areFiltersEmpty()) {
        console.log('🏠 No filters applied - loading latest properties');
        response = await searchService.getLatestProperties(50);
      }
      // Check if the search query is exactly a 6-character alphanumeric property code
      else if (query && searchService.isPropertyCode(query)) {
        console.log('🎯 Detected 6-character property code, using smart search');
        response = await searchService.smartSearch(searchFilters.filters, {
          page: 1,
          limit: 50
        });
      } else {
        // Use regular search with proper parameter mapping
        console.log('🔍 Using regular search with proper parameter mapping');
        response = await searchService.search(searchFilters.filters, {
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
  }, [searchFilters.filters, onSearchCallback, areFiltersEmpty]);

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

  /**
   * Search specific property type with proper parameter mapping
   */
  const searchPropertyType = useCallback(async (propertyType: 'residential' | 'commercial' | 'land') => {
    try {
      setSearchState(prev => ({
        ...prev,
        loading: true,
        error: null
      }));

      let response;
      const options = { page: 1, limit: 50 };

      switch (propertyType) {
        case 'residential':
          response = await searchService.searchResidentialProperties(searchFilters.filters, options);
          break;
        case 'commercial':
          response = await searchService.searchCommercialProperties(searchFilters.filters, options);
          break;
        case 'land':
          response = await searchService.searchLandProperties(searchFilters.filters, options);
          break;
        default:
          throw new Error(`Unsupported property type: ${propertyType}`);
      }
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        results: response.results,
        totalCount: response.totalCount
      }));

      return response.results;
      
    } catch (error) {
      console.error(`${propertyType} search error:`, error);
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `${propertyType} search failed`,
        results: [],
        totalCount: 0
      }));
      return [];
    }
  }, [searchFilters.filters]);

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
   * Get search suggestions with 6-character property code support
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

  /**
   * Get popular searches
   */
  const getPopularSearches = useCallback(async (): Promise<string[]> => {
    try {
      return await searchService.getPopularSearches();
    } catch (error) {
      console.error('Error getting popular searches:', error);
      return [];
    }
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
    searchPropertyType, // Search specific property type
    loadLatestProperties, // Load default latest properties
    updateSearchQuery,
    updateLocation,
    clearResults,
    getSearchSuggestions, // Enhanced suggestions with code support
    isValidPropertyCode, // Utility to check if query is valid property code
    getPopularSearches, // Get popular search terms
    
    // Combined state for convenience
    searchState: {
      ...searchState,
      filters: searchFilters.filters
    }
  };
};