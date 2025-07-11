// src/components/Search/hooks/useSearch.ts
// Version: 2.1.0
// Last Modified: 02-06-2025 15:30 IST
// Purpose: Fixed Buy/Rent filter logic to properly handle action type mapping and search across all transaction types

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const pageSize = 10; // Reduced for testing pagination

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
      
      // Trigger the callback to load default results
      if (onSearchCallback) {
        // Call with empty filters to signal loading default results
        onSearchCallback(searchFilters.filters);
      }
    }
  }, [wasCleared, areFiltersEmpty, onSearchCallback, searchFilters.filters]);

  /**
   * FIXED: Transform ActionType to TransactionType for backend compatibility
   * Now properly handles 'any' action type to search across all transaction types
   */
  const getTransactionTypeFromActionType = (actionType: string): string | null => {
    console.log('🔄 Mapping actionType to transactionType:', actionType);
    
    switch (actionType) {
      case 'buy':
        console.log('✅ ActionType "buy" → TransactionType "buy"');
        return 'buy';
      case 'rent':
        console.log('✅ ActionType "rent" → TransactionType "rent"');
        return 'rent';
      case 'any':
      default:
        console.log('✅ ActionType "any" → TransactionType null (search all types)');
        return null; // FIXED: Return null for 'any' to search across all transaction types
    }
  };

  /**
   * UPDATED: Transform filters for backend compatibility with improved logic
   */
  const transformFiltersForBackend = (filters: SearchFilters) => {
    const transactionType = getTransactionTypeFromActionType(filters.actionType);
    
    console.log('🔧 Transforming filters for backend:', {
      original_actionType: filters.actionType,
      mapped_transactionType: transactionType,
      selectedPropertyType: filters.selectedPropertyType,
      selectedSubType: filters.selectedSubType
    });
    
    // Create a compatible filter object for the backend
    const backendFilters = {
      ...filters,
      transactionType: transactionType // This can now be null for 'any'
    };
    
    // FIXED: Remove actionType from backend filters since backend uses transactionType
    delete (backendFilters as any).actionType;
    
    return backendFilters;
  };

  /**
   * ENHANCED: Smart search that detects 6-character property codes and uses appropriate search method
   * Now with improved Buy/Rent filter handling
   */
  const handleSearch = useCallback(async () => {
    console.log('🔍 useSearch.handleSearch: Search initiated with actionType:', searchFilters.filters.actionType);
    console.log('📋 useSearch.handleSearch: Full search filters:', searchFilters.filters);
    
    // Call external callback if provided
    if (onSearchCallback) {
      console.log('🔄 useSearch.handleSearch: Calling external onSearchCallback...');
      onSearchCallback(searchFilters.filters);
    } else {
      console.log('⚠️ useSearch.handleSearch: No external onSearchCallback provided');
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
      
      console.log('🎯 Backend filters after transformation:', backendFilters);
      
      // Check if the search query is exactly a 6-character alphanumeric property code
      if (query && searchService.isPropertyCode(query)) {
        console.log('🎯 Detected 6-character property code in search, using smart search');
        // Use smart search which tries code search first, then falls back to regular search
        response = await searchService.smartSearch(backendFilters, {
          page: 1,
          limit: pageSize
        });
      } else {
        // ENHANCED: Handle 'any' action type by searching across all property types if no specific transaction type
        if (!backendFilters.transactionType && (!backendFilters.selectedPropertyType || backendFilters.selectedPropertyType === 'any')) {
          console.log('🌐 Action type is "any" and no specific property type - using getLatestProperties');
          response = await searchService.getLatestProperties(pageSize, 0);
        } else {
          console.log('🔍 Using regular search with specific filters');
          response = await searchService.search(backendFilters, {
            page: 1,
            limit: pageSize
          });
        }
      }
      
      console.log('📊 Search completed:', {
        resultCount: response.results.length,
        totalCount: response.totalCount,
        hasResults: response.results.length > 0
      });
      
      setSearchState(prev => ({
        ...prev,
        loading: false,
        results: response.results,
        totalCount: response.totalCount
      }));

      // Reset pagination when doing a new search
      setCurrentPage(1);
      
    } catch (error) {
      console.error('❌ Search error:', error);
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
    setCurrentPage(1); // Reset pagination when filters are cleared
  }, [searchFilters]);

  const clearResults = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      results: [],
      totalCount: 0,
      error: null
    }));
    setCurrentPage(1); // Reset pagination when results are cleared
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

  /**
   * Load more results for pagination
   */
  const loadMoreResults = useCallback(async () => {
    if (isLoadingMore || searchState.results.length >= searchState.totalCount) {
      return;
    }

    console.log('📄 Loading more results, current page:', currentPage);
    
    try {
      setIsLoadingMore(true);
      
      const nextPage = currentPage + 1;
      const query = searchFilters.filters.searchQuery?.trim();
      const backendFilters = transformFiltersForBackend(searchFilters.filters);
      
      let response;
      
      // Use the same logic as handleSearch for consistency
      if (query && searchService.isPropertyCode(query)) {
        console.log('🎯 Loading more with property code search');
        response = await searchService.smartSearch(backendFilters, {
          page: nextPage,
          limit: pageSize
        });
      } else {
        if (!backendFilters.transactionType && (!backendFilters.selectedPropertyType || backendFilters.selectedPropertyType === 'any')) {
          console.log('🌐 Loading more with getLatestProperties');
          // For latest properties, use offset-based pagination
          const offset = currentPage * pageSize;
          response = await searchService.getLatestProperties(pageSize, offset);
        } else {
          console.log('🔍 Loading more with regular search');
          response = await searchService.search(backendFilters, {
            page: nextPage,
            limit: pageSize
          });
        }
      }
      
      console.log('📊 Load more completed:', {
        newResultCount: response.results.length,
        totalResults: searchState.results.length + response.results.length,
        totalCount: response.totalCount
      });
      
      setSearchState(prev => ({
        ...prev,
        results: [...prev.results, ...response.results],
        totalCount: response.totalCount
      }));
      
      setCurrentPage(nextPage);
      
    } catch (error) {
      console.error('❌ Load more error:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoadingMore, searchState.results.length, searchState.totalCount, searchFilters.filters, pageSize]);

  /**
   * Check if more results can be loaded
   */
  const canLoadMore = useCallback(() => {
    return searchState.results.length < searchState.totalCount && !isLoadingMore;
  }, [searchState.results.length, searchState.totalCount, isLoadingMore]);

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
    
    // Pagination actions
    loadMoreResults,
    canLoadMore,
    isLoadingMore,
    currentPage,
    
    // Combined state for convenience
    searchState: {
      ...searchState,
      filters: searchFilters.filters
    }
  };
};