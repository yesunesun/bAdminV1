// src/services/search/enhancedSearchService.ts
// Version: 1.0.0
// Last Modified: 09-07-2025 12:00 IST
// Purpose: Enhanced search service with NLP integration

import { SearchFilters, SearchResult } from '@/components/Search/types/search.types';
import { SearchResponse, SearchOptions } from '@/components/Search/services/searchService';
import { searchService } from '@/components/Search/services/searchService';
import { nlpService, NLPParseResult } from './nlpService';

export interface EnhancedSearchResponse extends SearchResponse {
  nlpResult?: NLPParseResult;
  searchMethod: 'nlp' | 'traditional' | 'code' | 'fallback';
  processingTime: number;
}

export interface EnhancedSearchOptions extends SearchOptions {
  enableNLP?: boolean;
  nlpConfidenceThreshold?: number;
  debugMode?: boolean;
}

/**
 * Enhanced Search Service with NLP integration
 * Layers natural language processing on top of existing search infrastructure
 */
export class EnhancedSearchService {
  private originalSearchService: typeof searchService;
  private nlpEnabled: boolean = true;
  private confidenceThreshold: number = 0.6;
  private debugMode: boolean = false;

  constructor() {
    this.originalSearchService = searchService;
    this.initializeSettings();
  }

  /**
   * Initialize settings from configuration
   */
  private async initializeSettings(): Promise<void> {
    try {
      // Load NLP settings from configuration
      this.nlpEnabled = true; // Default enabled
      this.confidenceThreshold = 0.6; // Default threshold
      this.debugMode = process.env.NODE_ENV === 'development';
    } catch (error) {
      console.warn('Could not load NLP settings, using defaults:', error);
    }
  }

  /**
   * Enhanced search with NLP processing
   */
  async search(filters: SearchFilters, options: EnhancedSearchOptions = {}): Promise<EnhancedSearchResponse> {
    const startTime = Date.now();
    
    const searchMethod = this.determineSearchMethod(filters, options);
    
    // Always log for debugging
    console.log('🔍 EnhancedSearchService.search called with:', {
      searchMethod,
      filters,
      options,
      nlpEnabled: this.nlpEnabled,
      nlpReady: nlpService.isReady()
    });
    

    try {
      switch (searchMethod) {
        case 'nlp':
          return await this.performNLPSearch(filters, options, startTime);
        
        case 'code':
          return await this.performCodeSearch(filters, options, startTime);
        
        case 'traditional':
        default:
          return await this.performTraditionalSearch(filters, options, startTime);
      }
    } catch (error) {
      console.error('Enhanced search failed:', error);
      return await this.performFallbackSearch(filters, options, startTime, error);
    }
  }

  /**
   * Determine which search method to use
   */
  private determineSearchMethod(filters: SearchFilters, options: EnhancedSearchOptions): 'nlp' | 'traditional' | 'code' {
    console.log('🔍 Determining search method for query:', filters.searchQuery);
    
    // Check if NLP is disabled
    if (!this.nlpEnabled || options.enableNLP === false) {
      console.log('❌ NLP disabled - nlpEnabled:', this.nlpEnabled, 'options.enableNLP:', options.enableNLP);
      return 'traditional';
    }

    // Check if NLP service is ready
    if (!nlpService.isReady()) {
      console.log('❌ NLP service not ready');
      return 'traditional';
    }

    // Check for property code pattern
    if (this.isPropertyCode(filters.searchQuery)) {
      console.log('🔢 Property code detected');
      return 'code';
    }

    // Check if query appears to be natural language
    const isNL = nlpService.isNaturalLanguage(filters.searchQuery);
    console.log('🔤 Natural language check:', isNL);
    
    if (isNL) {
      console.log('✅ Using NLP search method');
      return 'nlp';
    }

    console.log('📝 Using traditional search method');
    return 'traditional';
  }

  /**
   * Perform NLP-enhanced search
   */
  private async performNLPSearch(
    filters: SearchFilters, 
    options: EnhancedSearchOptions, 
    startTime: number
  ): Promise<EnhancedSearchResponse> {
    
    console.log('🧠 Starting NLP search for query:', filters.searchQuery);
    
    // Parse the natural language query
    const nlpResult = await nlpService.parseQuery(filters.searchQuery);
    
    // Always log for debugging
    console.log('🧠 NLP parsing result:', nlpResult);

    // Check if NLP parsing confidence is sufficient
    const confidenceThreshold = options.nlpConfidenceThreshold || this.confidenceThreshold;
    
    console.log(`🎯 NLP confidence: ${nlpResult.confidence}, threshold: ${confidenceThreshold}`);
    
    if (nlpResult.confidence < confidenceThreshold) {
      console.log(`⚠️  NLP confidence ${nlpResult.confidence} below threshold ${confidenceThreshold}, falling back to traditional search`);
      return await this.performTraditionalSearch(filters, options, startTime);
    }

    // Merge NLP-derived filters with existing filters
    const enhancedFilters = this.mergeFilters(filters, nlpResult.filters);
    
    console.log('🔄 Enhanced filters:', enhancedFilters);

    // Execute search with enhanced filters
    console.log('🔍 Executing search with enhanced filters...');
    const searchResponse = await this.originalSearchService.search(enhancedFilters, options);
    
    console.log('📊 Search response:', {
      resultsCount: searchResponse.results.length,
      totalCount: searchResponse.totalCount
    });
    
    const processingTime = Date.now() - startTime;
    
    return {
      ...searchResponse,
      nlpResult,
      searchMethod: 'nlp',
      processingTime
    };
  }

  /**
   * Perform traditional search (existing functionality)
   */
  private async performTraditionalSearch(
    filters: SearchFilters,
    options: EnhancedSearchOptions,
    startTime: number
  ): Promise<EnhancedSearchResponse> {
    
    const searchResponse = await this.originalSearchService.search(filters, options);
    const processingTime = Date.now() - startTime;
    
    return {
      ...searchResponse,
      searchMethod: 'traditional',
      processingTime
    };
  }

  /**
   * Perform property code search
   */
  private async performCodeSearch(
    filters: SearchFilters,
    options: EnhancedSearchOptions,
    startTime: number
  ): Promise<EnhancedSearchResponse> {
    
    const searchResponse = await this.originalSearchService.smartSearch(filters, options);
    const processingTime = Date.now() - startTime;
    
    return {
      ...searchResponse,
      searchMethod: 'code',
      processingTime
    };
  }

  /**
   * Perform fallback search when errors occur
   */
  private async performFallbackSearch(
    filters: SearchFilters,
    options: EnhancedSearchOptions,
    startTime: number,
    error: any
  ): Promise<EnhancedSearchResponse> {
    
    console.error('Performing fallback search due to error:', error);
    
    try {
      const searchResponse = await this.originalSearchService.search(filters, options);
      const processingTime = Date.now() - startTime;
      
      return {
        ...searchResponse,
        searchMethod: 'fallback',
        processingTime
      };
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      
      // Return empty results if everything fails
      return {
        results: [],
        totalCount: 0,
        page: 1,
        limit: options.limit || 25,
        searchMethod: 'fallback',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Merge original filters with NLP-derived filters
   */
  private mergeFilters(originalFilters: SearchFilters, nlpFilters: Partial<SearchFilters>): SearchFilters {
    const merged: SearchFilters = { ...originalFilters };
    
    // Apply NLP-derived filters only if original filters don't have values
    if (nlpFilters.selectedPropertyType && !originalFilters.selectedPropertyType) {
      merged.selectedPropertyType = nlpFilters.selectedPropertyType;
    }
    
    if (nlpFilters.selectedBHK && !originalFilters.selectedBHK) {
      merged.selectedBHK = nlpFilters.selectedBHK;
    }
    
    if (nlpFilters.selectedLocation && !originalFilters.selectedLocation) {
      merged.selectedLocation = nlpFilters.selectedLocation;
    }
    
    if (nlpFilters.selectedPriceRange && !originalFilters.selectedPriceRange) {
      merged.selectedPriceRange = nlpFilters.selectedPriceRange;
    }
    
    if (nlpFilters.actionType && !originalFilters.actionType) {
      merged.actionType = nlpFilters.actionType;
    }
    
    if (nlpFilters.selectedSubType && !originalFilters.selectedSubType) {
      merged.selectedSubType = nlpFilters.selectedSubType;
    }
    
    // Keep original search query for database search
    // The NLP parsing is used for filter enhancement, not query replacement
    
    return merged;
  }

  /**
   * Check if query is a property code
   */
  private isPropertyCode(query: string): boolean {
    if (!query) return false;
    
    // Property codes are 6 alphanumeric characters
    const propertyCodePattern = /^[A-Za-z0-9]{6}$/;
    return propertyCodePattern.test(query.trim());
  }

  /**
   * Get latest properties (delegate to original service)
   */
  async getLatestProperties(limit: number = 50, offset: number = 0): Promise<SearchResponse> {
    return this.originalSearchService.getLatestProperties(limit, offset);
  }

  /**
   * Smart search with NLP enhancement
   */
  async smartSearch(filters: SearchFilters, options: EnhancedSearchOptions = {}): Promise<EnhancedSearchResponse> {
    const startTime = Date.now();
    
    // If it's a property code, use code search
    if (this.isPropertyCode(filters.searchQuery)) {
      return await this.performCodeSearch(filters, options, startTime);
    }
    
    // Otherwise use enhanced search
    return await this.search(filters, options);
  }

  /**
   * Get search suggestions with NLP context
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    const suggestions: string[] = [];
    
    try {
      // Get NLP parsing for context
      if (nlpService.isNaturalLanguage(query)) {
        const nlpResult = await nlpService.parseQuery(query);
        
        // Generate suggestions based on NLP understanding
        if (nlpResult.entities.propertyType) {
          suggestions.push(`${nlpResult.entities.propertyType} properties`);
        }
        
        if (nlpResult.entities.location) {
          suggestions.push(`Properties in ${nlpResult.entities.location}`);
        }
        
        if (nlpResult.entities.bhk) {
          suggestions.push(`${nlpResult.entities.bhk} properties`);
        }
        
        if (nlpResult.entities.price) {
          suggestions.push(`Properties under ${nlpResult.entities.price.originalText}`);
        }
      }
      
      // Fill remaining suggestions with traditional suggestions
      // This would typically come from a suggestion service
      const remainingSlots = limit - suggestions.length;
      if (remainingSlots > 0) {
        const traditionalSuggestions = await this.getTraditionalSuggestions(query, remainingSlots);
        suggestions.push(...traditionalSuggestions);
      }
      
    } catch (error) {
      console.error('Error getting NLP suggestions:', error);
      return this.getTraditionalSuggestions(query, limit);
    }
    
    return suggestions.slice(0, limit);
  }

  /**
   * Get traditional search suggestions
   */
  private async getTraditionalSuggestions(query: string, limit: number): Promise<string[]> {
    // This would typically call the existing suggestion service
    // For now, return some basic suggestions
    return [
      `${query} properties`,
      `${query} for rent`,
      `${query} for sale`,
      `${query} apartments`,
      `${query} houses`
    ].slice(0, limit);
  }

  /**
   * Get NLP parsing result for a query (for debugging/UI feedback)
   */
  async parseQuery(query: string): Promise<NLPParseResult | null> {
    try {
      if (!nlpService.isReady()) {
        return null;
      }
      
      return await nlpService.parseQuery(query);
    } catch (error) {
      console.error('Error parsing query:', error);
      return null;
    }
  }

  /**
   * Check if NLP is enabled and ready
   */
  isNLPEnabled(): boolean {
    return this.nlpEnabled && nlpService.isReady();
  }

  /**
   * Get NLP service configuration
   */
  getNLPConfig() {
    return nlpService.getConfig();
  }

  /**
   * Enable/disable NLP processing
   */
  setNLPEnabled(enabled: boolean): void {
    this.nlpEnabled = enabled;
  }

  /**
   * Set confidence threshold for NLP processing
   */
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Clear NLP cache
   */
  clearNLPCache(): void {
    nlpService.clearCache();
  }

  /**
   * Get search statistics
   */
  getSearchStats(): {
    nlpEnabled: boolean;
    nlpReady: boolean;
    confidenceThreshold: number;
    cacheConfig: any;
  } {
    return {
      nlpEnabled: this.nlpEnabled,
      nlpReady: nlpService.isReady(),
      confidenceThreshold: this.confidenceThreshold,
      cacheConfig: nlpService.getConfig()?.processing || null
    };
  }
}

// Export singleton instance
export const enhancedSearchService = new EnhancedSearchService();
export default enhancedSearchService;