// src/components/Search/services/searchService/database/searchDatabase.ts
// Version: 2.0.0
// Last Modified: 02-06-2025 16:45 IST
// Purpose: Database interaction layer for SearchService - Refactored with modular classes

import { supabase } from '@/lib/supabase';
import { SearchFilters, SearchOptions, DatabaseSearchResult, DatabaseCallResult, SearchParams } from '../types/searchService.types';
import { buildSearchParams } from '../utils/paramUtils';

// Import new modular database classes
import { PropertyTypeSearchDbFactory, residentialSearchDb, commercialSearchDb, landSearchDb } from '../../database/PropertyTypeSearchDb';
import { codeSearchDb } from '../../database/CodeSearchDb';
import { suggestionSearchDb } from '../../database/SuggestionSearchDb';

/**
 * LEGACY FUNCTIONS - Maintained for backward compatibility
 * These functions now delegate to the new modular classes
 */

/**
 * Search property by code using search_property_by_code SQL function
 * @deprecated Use codeSearchDb.smartCodeSearch() instead
 */
export const searchByCodeDb = async (code: string, useInsensitiveSearch: boolean = true): Promise<DatabaseSearchResult[]> => {
  console.log('⚠️ searchByCodeDb: Using legacy function, consider migrating to codeSearchDb');
  
  if (useInsensitiveSearch) {
    return await codeSearchDb.searchByCodeInsensitive(code);
  } else {
    return await codeSearchDb.searchByCode(code);
  }
};

/**
 * Get latest properties using get_latest_properties SQL function
 */
export const getLatestPropertiesDb = async (limit: number = 50): Promise<DatabaseSearchResult[]> => {
  console.log('🏠 Database: Getting latest properties with limit:', limit);
  
  const { data, error } = await supabase.rpc('get_latest_properties', {
    p_limit: limit
  });
  
  if (error) {
    console.error('❌ get_latest_properties error:', error);
    throw new Error(`Failed to get latest properties: ${error.message}`);
  }
  
  return data || [];
};

/**
 * Call the appropriate property-specific search function with updated parameters
 * @deprecated Use PropertyTypeSearchDbFactory.getInstance() instead
 */
export const callPropertySpecificSearchDb = async (
  propertyType: string, 
  filters: SearchFilters, 
  options: SearchOptions
): Promise<DatabaseCallResult> => {
  console.log('⚠️ callPropertySpecificSearchDb: Using legacy function, consider migrating to PropertyTypeSearchDbFactory');
  
  // Delegate to new modular classes
  const searchDb = PropertyTypeSearchDbFactory.getInstance(propertyType);
  return await searchDb.search(filters, options);
};

/**
 * Search all property types and combine results with updated parameters
 * @deprecated Use PropertyTypeSearchDbFactory.getAllInstances() instead
 */
export const searchAllPropertyTypesDb = async (filters: SearchFilters, options: SearchOptions): Promise<DatabaseSearchResult[]> => {
  console.log('⚠️ searchAllPropertyTypesDb: Using legacy function, consider migrating to PropertyTypeSearchDbFactory');
  
  const searchParams = buildSearchParams(filters, options);
  const limit = Math.floor((searchParams.p_limit || 50) / 3);
  
  try {
    // Use new modular classes
    const dbInstances = PropertyTypeSearchDbFactory.getAllInstances();
    
    const [residentialResults, commercialResults, landResults] = await Promise.allSettled([
      dbInstances.residential.searchWithLimit(filters, limit),
      dbInstances.commercial.searchWithLimit(filters, limit),
      dbInstances.land.searchWithLimit(filters, limit)
    ]);

    let combinedResults: DatabaseSearchResult[] = [];
    let totalCount = 0;

    if (residentialResults.status === 'fulfilled') {
      combinedResults.push(...residentialResults.value);
      totalCount += residentialResults.value[0]?.total_count || 0;
    } else {
      console.error('❌ Residential search failed:', residentialResults.reason);
    }

    if (commercialResults.status === 'fulfilled') {
      combinedResults.push(...commercialResults.value);
      totalCount += commercialResults.value[0]?.total_count || 0;
    } else {
      console.error('❌ Commercial search failed:', commercialResults.reason);
    }

    if (landResults.status === 'fulfilled') {
      combinedResults.push(...landResults.value);
      totalCount += landResults.value[0]?.total_count || 0;
    } else {
      console.error('❌ Land search failed:', landResults.reason);
    }

    // Sort by created_at desc
    combinedResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Set total count on first result for consistency
    if (combinedResults.length > 0) {
      combinedResults[0].total_count = totalCount;
    }

    console.log(`✅ Combined search: ${combinedResults.length} results from all property types`);
    return combinedResults;
    
  } catch (error) {
    console.error('❌ Error in searchAllPropertyTypesDb:', error);
    throw error;
  }
};

/**
 * Get search suggestions with 6-character property code support
 * @deprecated Use suggestionSearchDb.getSmartSuggestions() instead
 */
export const getSearchSuggestionsDb = async (query: string): Promise<string[]> => {
  console.log('⚠️ getSearchSuggestionsDb: Using legacy function, consider migrating to suggestionSearchDb');
  
  if (query.length < 2) return [];
  
  try {
    // Use new suggestion search database
    const smartSuggestions = await suggestionSearchDb.getSmartSuggestions(query);
    return smartSuggestions.suggestions;
      
  } catch (error) {
    console.error('❌ Error in getSearchSuggestionsDb:', error);
    return [];
  }
};

/**
 * NEW ENHANCED FUNCTIONS - Using modular classes
 */

/**
 * Enhanced property search with better error handling and performance
 */
export const enhancedPropertySearch = async (
  propertyType: string,
  filters: SearchFilters,
  options: SearchOptions
): Promise<DatabaseCallResult> => {
  console.log('🚀 Enhanced property search for:', propertyType);
  
  try {
    const searchDb = PropertyTypeSearchDbFactory.getInstance(propertyType);
    const result = await searchDb.search(filters, options);
    
    console.log(`✅ Enhanced search completed: ${result.data?.length || 0} results`);
    return result;
    
  } catch (error) {
    console.error('❌ Enhanced property search error:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown search error')
    };
  }
};

/**
 * Enhanced code search with validation and smart fallback
 */
export const enhancedCodeSearch = async (code: string): Promise<DatabaseSearchResult[]> => {
  console.log('🏷️ Enhanced code search for:', code);
  
  try {
    // Validate code format first
    if (!codeSearchDb.isValidPropertyCode(code)) {
      console.warn('⚠️ Invalid property code format:', code);
      return [];
    }
    
    // Use smart code search
    const results = await codeSearchDb.smartCodeSearch(code);
    console.log(`✅ Enhanced code search completed: ${results.length} results`);
    return results;
    
  } catch (error) {
    console.error('❌ Enhanced code search error:', error);
    return [];
  }
};

/**
 * Enhanced suggestions with caching and smart categorization
 */
export const enhancedSuggestionSearch = async (
  query: string,
  propertyType?: string,
  options: { includeLocations?: boolean; includePopular?: boolean } = {}
): Promise<{
  suggestions: string[];
  type: 'title' | 'location' | 'mixed';
  source: string;
  cached: boolean;
}> => {
  console.log('💡 Enhanced suggestion search for:', query);
  
  try {
    const smartSuggestions = await suggestionSearchDb.getSmartSuggestions(query, propertyType);
    
    console.log(`✅ Enhanced suggestions completed: ${smartSuggestions.suggestions.length} results`);
    return {
      ...smartSuggestions,
      cached: false // Note: We could enhance this to track cache hits
    };
    
  } catch (error) {
    console.error('❌ Enhanced suggestion search error:', error);
    return {
      suggestions: [],
      type: 'mixed',
      source: 'error',
      cached: false
    };
  }
};

/**
 * Performance monitoring function
 */
export const getDatabasePerformanceStats = async (): Promise<{
  codeSearchStats: { totalPropertiesWithCodes: number; uniqueCodes: number };
  suggestionCacheStats: { entries: number; totalMemory: string };
  dbConnectionHealth: boolean;
}> => {
  console.log('📊 Getting database performance statistics');
  
  try {
    const [codeStats, cacheStats] = await Promise.all([
      codeSearchDb.getCodeSearchStats(),
      Promise.resolve(suggestionSearchDb.getCacheStats())
    ]);
    
    // Simple DB health check
    const { data: healthCheck } = await supabase
      .from('properties_v2')
      .select('id')
      .limit(1);
    
    return {
      codeSearchStats: codeStats,
      suggestionCacheStats: cacheStats,
      dbConnectionHealth: !!healthCheck
    };
    
  } catch (error) {
    console.error('❌ Error getting performance stats:', error);
    return {
      codeSearchStats: { totalPropertiesWithCodes: 0, uniqueCodes: 0 },
      suggestionCacheStats: { entries: 0, totalMemory: '0 KB' },
      dbConnectionHealth: false
    };
  }
};

/**
 * Utility function to clear all caches
 */
export const clearAllCaches = (): void => {
  console.log('🗑️ Clearing all database caches');
  suggestionSearchDb.clearCache();
};

/**
 * Export modular database instances for direct use
 */
export {
  // Modular database classes
  PropertyTypeSearchDbFactory,
  residentialSearchDb,
  commercialSearchDb,
  landSearchDb,
  codeSearchDb,
  suggestionSearchDb,
  
  // Enhanced functions
  enhancedPropertySearch,
  enhancedCodeSearch,
  enhancedSuggestionSearch
};