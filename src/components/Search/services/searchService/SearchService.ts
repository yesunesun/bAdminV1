// src/components/Search/services/searchService/SearchService.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 15:00 IST
// Purpose: Core SearchService class - refactored for modularity

import { SearchFilters, SearchOptions, SearchResponse, DatabaseSearchResult } from './types/searchService.types';
import { 
  searchByCodeDb, 
  getLatestPropertiesDb, 
  callPropertySpecificSearchDb, 
  searchAllPropertyTypesDb, 
  getSearchSuggestionsDb 
} from './database/searchDatabase';
import { transformDatabaseResults } from './utils/transformUtils';
import SearchFallbackService from '../searchFallbackService';
import { 
  logSearchParams, 
  logSearchResults, 
  logSearchError, 
  validateSearchParams,
  searchPerformanceMonitor 
} from '../../utils/searchDebugUtils';

export class SearchService {
  /**
   * Search property by code using search_property_by_code SQL function
   */
  async searchByCode(code: string, useInsensitiveSearch: boolean = true): Promise<SearchResponse> {
    const searchId = searchPerformanceMonitor.start({} as SearchFilters);
    
    try {
      console.log('🔍 Searching property by code:', code, 'insensitive:', useInsensitiveSearch);
      
      const searchResults = await searchByCodeDb(code, useInsensitiveSearch);
      const totalCount = searchResults[0]?.total_count || searchResults.length;
      
      console.log('📊 Property code search results:', {
        code: code.trim(),
        resultCount: searchResults.length,
        totalCount: totalCount,
        foundProperty: searchResults.length > 0 ? searchResults[0].title : 'None'
      });

      // Transform results using the same transformation logic
      let transformedResults = transformDatabaseResults(searchResults);
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      const duration = searchPerformanceMonitor.end(transformedResults.length, totalCount);
      logSearchResults(transformedResults, totalCount, duration);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: 1,
        limit: 50
      };
      
    } catch (error) {
      searchPerformanceMonitor.error(error);
      logSearchError(error, {} as SearchFilters, {});
      throw error;
    }
  }

  /**
   * Check if a search query is exactly a 6-character alphanumeric property code
   * Property codes must be exactly 6 characters: alphanumeric only (e.g., RX0AD8, AB1234, 123ABC)
   */
  isPropertyCode(query: string): boolean {
    if (!query) {
      return false;
    }
    
    const trimmedQuery = query.trim();
    
    // Must be exactly 6 characters
    if (trimmedQuery.length !== 6) {
      console.log(`🔍 Query "${trimmedQuery}" is ${trimmedQuery.length} chars, not 6 - not a property code`);
      return false;
    }
    
    // Must be alphanumeric only (letters and numbers, no special characters)
    const alphanumericPattern = /^[A-Za-z0-9]{6}$/;
    const isValidCode = alphanumericPattern.test(trimmedQuery);
    
    console.log(`🔍 Query "${trimmedQuery}" alphanumeric check: ${isValidCode ? 'PASS' : 'FAIL'} - ${isValidCode ? 'IS' : 'NOT'} a property code`);
    
    return isValidCode;
  }

  /**
   * Smart search that detects if query is exactly a 6-character property code
   * If it matches the criteria, search by code first, then fall back to regular search
   */
  async smartSearch(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    const query = filters.searchQuery?.trim();
    
    // If query is exactly a 6-character alphanumeric code, try code search first
    if (query && this.isPropertyCode(query)) {
      console.log('🎯 Detected 6-character property code, trying code search first:', query);
      
      try {
        const codeResults = await this.searchByCode(query, true);
        
        // If we found results, return them
        if (codeResults.results.length > 0) {
          console.log('✅ Found property by code, returning results');
          return codeResults;
        }
        
        console.log('ℹ️ No results by code, falling back to regular search');
      } catch (error) {
        console.log('⚠️ Code search failed, falling back to regular search:', error);
      }
    } else if (query) {
      console.log(`🔍 Query "${query}" does not match 6-character property code pattern, using regular search`);
    }
    
    // Fall back to regular search
    return this.search(filters, options);
  }

  /**
   * Get latest properties using get_latest_properties SQL function
   */
  async getLatestProperties(limit: number = 50): Promise<SearchResponse> {
    const searchId = searchPerformanceMonitor.start({} as SearchFilters);
    
    try {
      console.log('🏠 Getting latest properties with limit:', limit);
      
      const searchResults = await getLatestPropertiesDb(limit);
      const totalCount = searchResults[0]?.total_count || searchResults.length;
      
      console.log('📊 Latest properties results:', {
        resultCount: searchResults.length,
        totalCount: totalCount,
        firstResultHasPrimaryImage: searchResults[0]?.primary_image ? 'YES' : 'NO'
      });

      // Transform results using the same transformation logic
      let transformedResults = transformDatabaseResults(searchResults);
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      const duration = searchPerformanceMonitor.end(transformedResults.length, totalCount);
      logSearchResults(transformedResults, totalCount, duration);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: 1,
        limit: limit
      };
      
    } catch (error) {
      searchPerformanceMonitor.error(error);
      logSearchError(error, {} as SearchFilters, {});
      throw error;
    }
  }

  /**
   * Main search method with updated database function calls
   */
  async search(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    const searchId = searchPerformanceMonitor.start(filters);
    
    try {
      console.log('🔍 Starting search with filters:', filters);
      console.log('🔧 Search options:', options);
      
      const propertyType = filters.selectedPropertyType || 'residential';
      
      let searchResults: DatabaseSearchResult[] = [];
      let totalCount = 0;
      
      if (propertyType === 'any' || !propertyType) {
        searchResults = await searchAllPropertyTypesDb(filters, options);
        totalCount = searchResults[0]?.total_count || 0;
      } else {
        const { data, error } = await callPropertySpecificSearchDb(propertyType, filters, options);
        
        if (error) {
          console.error('❌ Database search error:', error);
          throw new Error(`Database search failed: ${error.message}`);
        }
        
        searchResults = data || [];
        totalCount = searchResults[0]?.total_count || 0;
      }

      console.log('📊 Raw database results:', {
        resultCount: searchResults.length,
        totalCount: totalCount,
        propertyType: propertyType,
        firstResultHasPrimaryImage: searchResults[0]?.primary_image ? 'YES' : 'NO'
      });

      // Transform results
      let transformedResults = transformDatabaseResults(searchResults);
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      const duration = searchPerformanceMonitor.end(transformedResults.length, totalCount);
      logSearchResults(transformedResults, totalCount, duration);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: options.page || 1,
        limit: options.limit || 50
      };
      
    } catch (error) {
      searchPerformanceMonitor.error(error);
      logSearchError(error, filters, {});
      throw error;
    }
  }

  /**
   * Get search suggestions with 6-character property code support
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    
    try {
      const suggestions: string[] = [];
      
      // If query looks like a 6-character property code, suggest code-based search
      if (this.isPropertyCode(query)) {
        suggestions.push(`Search by code: ${query.toUpperCase()}`);
      }
      
      // Get title-based suggestions
      const titleSuggestions = await getSearchSuggestionsDb(query);
      suggestions.push(...titleSuggestions);

      return suggestions.slice(0, 5);
        
    } catch (error) {
      console.error('Error in getSearchSuggestions:', error);
      return [];
    }
  }

  /**
   * Get popular searches
   */
  async getPopularSearches(): Promise<string[]> {
    return [
      'Apartments in Hitech City',
      'Villas in Jubilee Hills', 
      'Commercial spaces in Gachibowli',
      'PG in Kukatpally',
      'Land in Shamshabad'
    ];
  }

  /**
   * Save search for user history (future implementation)
   */
  async saveSearch(filters: SearchFilters): Promise<void> {
    console.log('📝 Search saved for future implementation:', filters);
  }
}