// src/components/Search/hooks/useEnhancedSearch.ts
// Version: 1.0.0
// Last Modified: 09-07-2025 12:30 IST
// Purpose: Enhanced search hook with NLP integration

import { useState, useCallback, useEffect } from 'react';
import { SearchFilters, SearchResult, SearchState } from '../types/search.types';
import { useSearchFilters } from './useSearchFilters';
import { enhancedSearchService, EnhancedSearchResponse } from '@/services/search/enhancedSearchService';
import { NLPParseResult } from '@/services/search/nlpService';

export interface EnhancedSearchState extends Omit<SearchState, 'filters'> {
  nlpResult?: NLPParseResult;
  searchMethod?: 'nlp' | 'traditional' | 'code' | 'fallback';
  processingTime?: number;
  nlpConfidence?: number;
}

export const useEnhancedSearch = (onSearchCallback?: (filters: SearchFilters) => void) => {
  const searchFilters = useSearchFilters();
  
  const [searchState, setSearchState] = useState<EnhancedSearchState>({
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
      
      // Trigger the callback to load default results
      if (onSearchCallback) {
        onSearchCallback(searchFilters.filters);
      }
    }
  }, [wasCleared, areFiltersEmpty, onSearchCallback, searchFilters.filters]);

  const handleSearch = useCallback(async (customFilters?: SearchFilters) => {
    console.log('🚀 Enhanced search handleSearch called');
    const filtersToUse = customFilters || searchFilters.filters;
    console.log('📋 Filters being used:', filtersToUse);
    console.log('🔍 Enhanced search service available:', !!enhancedSearchService);
    
    // Set loading state
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      // Check if we should load default results (no filters)
      if (areFiltersEmpty() && !filtersToUse.searchQuery) {
        console.log('🏠 Loading default latest properties...');
        console.log('🔍 Calling getLatestProperties...');
        const defaultResults = await enhancedSearchService.getLatestProperties(50, 0);
        console.log('📊 Default results:', {
          resultsCount: defaultResults.results?.length || 0,
          totalCount: defaultResults.totalCount
        });
        
        setSearchState(prev => ({
          ...prev,
          results: defaultResults.results,
          totalCount: defaultResults.totalCount,
          loading: false,
          searchMethod: 'traditional'
        }));
        
        return;
      }

      // Perform enhanced search with NLP
      console.log('🔍 Calling enhancedSearchService.search...');
      const enhancedResponse: EnhancedSearchResponse = await enhancedSearchService.search(filtersToUse, {
        enableNLP: true,
        debugMode: process.env.NODE_ENV === 'development'
      });

      console.log('📊 Enhanced search response:', {
        resultsCount: enhancedResponse.results?.length || 0,
        totalCount: enhancedResponse.totalCount,
        searchMethod: enhancedResponse.searchMethod,
        nlpResult: enhancedResponse.nlpResult,
        processingTime: enhancedResponse.processingTime
      });

      // Update state with enhanced results
      setSearchState(prev => ({
        ...prev,
        results: enhancedResponse.results,
        totalCount: enhancedResponse.totalCount,
        loading: false,
        nlpResult: enhancedResponse.nlpResult,
        searchMethod: enhancedResponse.searchMethod,
        processingTime: enhancedResponse.processingTime,
        nlpConfidence: enhancedResponse.nlpResult?.confidence
      }));

      // Log search method for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Enhanced search completed:', {
          method: enhancedResponse.searchMethod,
          resultsCount: enhancedResponse.results.length,
          processingTime: enhancedResponse.processingTime,
          nlpConfidence: enhancedResponse.nlpResult?.confidence
        });
      }

    } catch (error) {
      console.error('Enhanced search failed:', error);
      setSearchState(prev => ({
        ...prev,
        error: error.message || 'Search failed',
        loading: false,
        results: [],
        totalCount: 0
      }));
    }
  }, [searchFilters.filters, areFiltersEmpty]);

  const handleSmartSearch = useCallback(async (customFilters?: SearchFilters) => {
    const filtersToUse = customFilters || searchFilters.filters;
    
    setSearchState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const enhancedResponse = await enhancedSearchService.smartSearch(filtersToUse, {
        enableNLP: true,
        debugMode: process.env.NODE_ENV === 'development'
      });

      setSearchState(prev => ({
        ...prev,
        results: enhancedResponse.results,
        totalCount: enhancedResponse.totalCount,
        loading: false,
        nlpResult: enhancedResponse.nlpResult,
        searchMethod: enhancedResponse.searchMethod,
        processingTime: enhancedResponse.processingTime,
        nlpConfidence: enhancedResponse.nlpResult?.confidence
      }));

    } catch (error) {
      console.error('Smart search failed:', error);
      setSearchState(prev => ({
        ...prev,
        error: error.message || 'Search failed',
        loading: false,
        results: [],
        totalCount: 0
      }));
    }
  }, [searchFilters.filters]);

  const clearFilters = useCallback(() => {
    searchFilters.clearFilters();
    setWasCleared(true);
  }, [searchFilters]);

  // Get NLP parsing result for current query
  const parseCurrentQuery = useCallback(async (): Promise<NLPParseResult | null> => {
    if (!searchFilters.filters.searchQuery) {
      return null;
    }

    try {
      return await enhancedSearchService.parseQuery(searchFilters.filters.searchQuery);
    } catch (error) {
      console.error('Failed to parse query:', error);
      return null;
    }
  }, [searchFilters.filters.searchQuery]);

  // Get search suggestions with NLP context
  const getSearchSuggestions = useCallback(async (query: string): Promise<string[]> => {
    try {
      return await enhancedSearchService.getSearchSuggestions(query, 5);
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }, []);

  // Check if NLP is enabled and ready
  const isNLPEnabled = useCallback(() => {
    return enhancedSearchService.isNLPEnabled();
  }, []);

  // Get NLP service statistics
  const getNLPStats = useCallback(() => {
    return enhancedSearchService.getSearchStats();
  }, []);

  return {
    // Search state
    ...searchState,
    
    // Search filters
    filters: searchFilters.filters,
    
    // Search actions
    handleSearch,
    handleSmartSearch,
    clearFilters,
    
    // Filter actions
    updateFilter: searchFilters.updateFilter,
    clearFilter: searchFilters.clearFilter,
    
    // Additional filter methods from useSearchFilters
    getSubTypes: searchFilters.getSubTypes,
    getSubtypeLabel: searchFilters.getSubtypeLabel,
    hasActiveFilters: searchFilters.hasActiveFilters,
    getFilterDisplayValue: searchFilters.getFilterDisplayValue,
    clearAllFilters: searchFilters.clearAllFilters,
    
    // Additional search methods for compatibility
    updateLocation: (value: string) => searchFilters.updateFilter('selectedLocation', value),
    updateSearchQuery: (value: string) => searchFilters.updateFilter('searchQuery', value),
    clearResults: () => setSearchState(prev => ({ ...prev, results: [], totalCount: 0 })),
    isValidPropertyCode: (query: string) => /^[A-Za-z0-9]{6}$/.test(query.trim()),
    
    // NLP-specific functions
    parseCurrentQuery,
    getSearchSuggestions,
    isNLPEnabled,
    getNLPStats,
    
    // Utility functions
    areFiltersEmpty,
    
    // Enhanced search info
    isUsingNLP: searchState.searchMethod === 'nlp',
    isUsingCodeSearch: searchState.searchMethod === 'code',
    nlpConfidence: searchState.nlpConfidence,
    processingTime: searchState.processingTime,
    
    // Combined state for convenience
    searchState: {
      ...searchState,
      filters: searchFilters.filters
    }
  };
};

export default useEnhancedSearch;