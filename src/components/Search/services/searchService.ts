// src/components/Search/services/searchService.ts
// Version: 2.0.0
// Last Modified: 2025-07-10
// Purpose: Search service using btService API (replaced local implementation)

import { btServiceClient } from './btServiceClient';
import { SearchFilters, SearchResult, SearchResponse, SearchPaginationOptions } from '../types/search.types';

/**
 * Search service interface - maintains compatibility with existing code
 */
export interface SearchService {
  search(filters: SearchFilters, pagination?: SearchPaginationOptions): Promise<SearchResponse>;
  smartSearch(filters: SearchFilters, pagination?: SearchPaginationOptions): Promise<SearchResponse>;
  searchByCode(code: string, exact?: boolean): Promise<SearchResponse>;
  getLatestProperties(limit?: number, offset?: number): Promise<SearchResponse>;
  getSearchSuggestions(query: string): Promise<string[]>;
  isPropertyCode(query: string): boolean;
}

/**
 * btService-based search service implementation
 */
class BtSearchService implements SearchService {
  
  /**
   * Search properties with filters
   */
  async search(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    console.log('🔍 SearchService.search called with:', { filters, pagination });
    
    try {
      const response = await btServiceClient.search(filters, pagination);
      console.log('✅ SearchService.search completed:', {
        resultCount: response.results.length,
        totalCount: response.totalCount
      });
      return response;
    } catch (error) {
      console.error('❌ SearchService.search error:', error);
      throw error;
    }
  }

  /**
   * Smart search with property code detection
   */
  async smartSearch(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    console.log('🎯 SearchService.smartSearch called with:', { filters, pagination });
    
    try {
      const response = await btServiceClient.smartSearch(filters, pagination);
      console.log('✅ SearchService.smartSearch completed:', {
        resultCount: response.results.length,
        totalCount: response.totalCount
      });
      return response;
    } catch (error) {
      console.error('❌ SearchService.smartSearch error:', error);
      throw error;
    }
  }

  /**
   * Search by property code
   */
  async searchByCode(code: string, exact: boolean = true): Promise<SearchResponse> {
    console.log('🔍 SearchService.searchByCode called with:', { code, exact });
    
    try {
      const response = await btServiceClient.searchByCode(code, exact);
      console.log('✅ SearchService.searchByCode completed:', {
        resultCount: response.results.length,
        totalCount: response.totalCount
      });
      return response;
    } catch (error) {
      console.error('❌ SearchService.searchByCode error:', error);
      throw error;
    }
  }

  /**
   * Get latest properties
   */
  async getLatestProperties(limit: number = 50, offset: number = 0): Promise<SearchResponse> {
    console.log('📋 SearchService.getLatestProperties called with:', { limit, offset });
    
    try {
      const response = await btServiceClient.getLatestProperties(limit, offset);
      console.log('✅ SearchService.getLatestProperties completed:', {
        resultCount: response.results.length,
        totalCount: response.totalCount
      });
      return response;
    } catch (error) {
      console.error('❌ SearchService.getLatestProperties error:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    console.log('💡 SearchService.getSearchSuggestions called with query:', query);
    
    try {
      const suggestions = await btServiceClient.getSearchSuggestions(query);
      console.log('✅ SearchService.getSearchSuggestions completed:', {
        suggestionCount: suggestions.length
      });
      return suggestions;
    } catch (error) {
      console.error('❌ SearchService.getSearchSuggestions error:', error);
      return []; // Return empty array on error to maintain UI functionality
    }
  }

  /**
   * Check if query is a valid property code
   */
  isPropertyCode(query: string): boolean {
    return btServiceClient.isPropertyCode(query);
  }
}

// Export singleton instance
export const searchService = new BtSearchService();

// Export class for testing
export { BtSearchService };