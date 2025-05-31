// src/components/Search/services/searchService/database/searchDatabase.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 14:50 IST
// Purpose: Database interaction layer for SearchService

import { supabase } from '@/lib/supabase';
import { SearchFilters, SearchOptions, DatabaseSearchResult, DatabaseCallResult, SearchParams } from '../types/searchService.types';
import { buildSearchParams } from '../utils/paramUtils';

/**
 * Search property by code using search_property_by_code SQL function
 */
export const searchByCodeDb = async (code: string, useInsensitiveSearch: boolean = true): Promise<DatabaseSearchResult[]> => {
  console.log('🔍 Database: Searching property by code:', code, 'insensitive:', useInsensitiveSearch);
  
  // Validate input
  if (!code || code.trim() === '') {
    throw new Error('Property code cannot be empty');
  }

  const trimmedCode = code.trim();
  
  // Choose the appropriate function based on case sensitivity
  const functionName = useInsensitiveSearch 
    ? 'search_property_by_code_insensitive' 
    : 'search_property_by_code';
  
  const { data, error } = await supabase.rpc(functionName, {
    p_code: trimmedCode
  });
  
  if (error) {
    console.error('❌ search_property_by_code error:', error);
    throw new Error(`Failed to search property by code: ${error.message}`);
  }
  
  return data || [];
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
 */
export const callPropertySpecificSearchDb = async (
  propertyType: string, 
  filters: SearchFilters, 
  options: SearchOptions
): Promise<DatabaseCallResult> => {
  const searchParams = buildSearchParams(filters, options);
  
  switch (propertyType) {
    case 'residential':
      console.log('🏠 Database: Calling search_residential_properties with params:', searchParams);
      return await supabase.rpc('search_residential_properties', {
        p_subtype: searchParams.p_subtype,
        p_property_subtype: searchParams.p_property_subtype,
        p_search_query: searchParams.p_search_query,
        p_city: searchParams.p_city,
        p_state: searchParams.p_state,
        p_min_price: searchParams.p_min_price,
        p_max_price: searchParams.p_max_price,
        p_bedrooms: searchParams.p_bedrooms,
        p_bathrooms: searchParams.p_bathrooms,
        p_area_min: searchParams.p_area_min,
        p_area_max: searchParams.p_area_max,
        p_limit: searchParams.p_limit,
        p_offset: searchParams.p_offset
      });
      
    case 'commercial':
      console.log('🏢 Database: Calling search_commercial_properties with params:', searchParams);
      return await supabase.rpc('search_commercial_properties', {
        p_subtype: searchParams.p_subtype,
        p_property_subtype: searchParams.p_property_subtype,
        p_search_query: searchParams.p_search_query,
        p_min_price: searchParams.p_min_price,
        p_max_price: searchParams.p_max_price,
        p_city: searchParams.p_city,
        p_state: searchParams.p_state,
        p_area_min: searchParams.p_area_min,
        p_area_max: searchParams.p_area_max,
        p_limit: searchParams.p_limit,
        p_offset: searchParams.p_offset
      });
      
    case 'land':
      console.log('🌍 Database: Calling search_land_properties with params:', searchParams);
      return await supabase.rpc('search_land_properties', {
        p_property_subtype: searchParams.p_property_subtype,
        p_search_query: searchParams.p_search_query,
        p_min_price: searchParams.p_min_price,
        p_max_price: searchParams.p_max_price,
        p_city: searchParams.p_city,
        p_state: searchParams.p_state,
        p_area_min: searchParams.p_area_min,
        p_area_max: searchParams.p_area_max,
        p_limit: searchParams.p_limit,
        p_offset: searchParams.p_offset
      });
      
    default:
      console.log('🏠 Database: Defaulting to search_residential_properties');
      return await supabase.rpc('search_residential_properties', {
        p_subtype: searchParams.p_subtype,
        p_property_subtype: searchParams.p_property_subtype,
        p_search_query: searchParams.p_search_query,
        p_city: searchParams.p_city,
        p_state: searchParams.p_state,
        p_min_price: searchParams.p_min_price,
        p_max_price: searchParams.p_max_price,
        p_bedrooms: searchParams.p_bedrooms,
        p_bathrooms: searchParams.p_bathrooms,
        p_area_min: searchParams.p_area_min,
        p_area_max: searchParams.p_area_max,
        p_limit: searchParams.p_limit,
        p_offset: searchParams.p_offset
      });
  }
};

/**
 * Search all property types and combine results with updated parameters
 */
export const searchAllPropertyTypesDb = async (filters: SearchFilters, options: SearchOptions): Promise<DatabaseSearchResult[]> => {
  const searchParams = buildSearchParams(filters, options);
  const limit = Math.floor((searchParams.p_limit || 50) / 3);
  
  try {
    const [residentialResult, commercialResult, landResult] = await Promise.allSettled([
      supabase.rpc('search_residential_properties', {
        p_subtype: searchParams.p_subtype,
        p_property_subtype: searchParams.p_property_subtype,
        p_search_query: searchParams.p_search_query,
        p_city: searchParams.p_city,
        p_state: searchParams.p_state,
        p_min_price: searchParams.p_min_price,
        p_max_price: searchParams.p_max_price,
        p_bedrooms: searchParams.p_bedrooms,
        p_bathrooms: searchParams.p_bathrooms,
        p_area_min: searchParams.p_area_min,
        p_area_max: searchParams.p_area_max,
        p_limit: limit,
        p_offset: 0
      }),
      supabase.rpc('search_commercial_properties', {
        p_subtype: searchParams.p_subtype,
        p_property_subtype: searchParams.p_property_subtype,
        p_search_query: searchParams.p_search_query,
        p_min_price: searchParams.p_min_price,
        p_max_price: searchParams.p_max_price,
        p_city: searchParams.p_city,
        p_state: searchParams.p_state,
        p_area_min: searchParams.p_area_min,
        p_area_max: searchParams.p_area_max,
        p_limit: limit,
        p_offset: 0
      }),
      supabase.rpc('search_land_properties', {
        p_property_subtype: searchParams.p_property_subtype,
        p_search_query: searchParams.p_search_query,
        p_min_price: searchParams.p_min_price,
        p_max_price: searchParams.p_max_price,
        p_city: searchParams.p_city,
        p_state: searchParams.p_state,
        p_area_min: searchParams.p_area_min,
        p_area_max: searchParams.p_area_max,
        p_limit: limit,
        p_offset: 0
      })
    ]);

    let combinedResults: DatabaseSearchResult[] = [];
    let totalCount = 0;

    if (residentialResult.status === 'fulfilled' && residentialResult.value.data) {
      combinedResults.push(...residentialResult.value.data);
      totalCount += residentialResult.value.data[0]?.total_count || 0;
    }

    if (commercialResult.status === 'fulfilled' && commercialResult.value.data) {
      combinedResults.push(...commercialResult.value.data);
      totalCount += commercialResult.value.data[0]?.total_count || 0;
    }

    if (landResult.status === 'fulfilled' && landResult.value.data) {
      combinedResults.push(...landResult.value.data);
      totalCount += landResult.value.data[0]?.total_count || 0;
    }

    // Sort by created_at desc
    combinedResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Set total count on first result for consistency
    if (combinedResults.length > 0) {
      combinedResults[0].total_count = totalCount;
    }

    return combinedResults;
    
  } catch (error) {
    console.error('Error in searchAllPropertyTypesDb:', error);
    throw error;
  }
};

/**
 * Get search suggestions with 6-character property code support
 */
export const getSearchSuggestionsDb = async (query: string): Promise<string[]> => {
  if (query.length < 2) return [];
  
  try {
    // Get title-based suggestions
    const { data, error } = await supabase
      .from('properties_v2')
      .select('property_details')
      .ilike('property_details->flow->>title', `%${query}%`)
      .limit(5);

    if (!error && data) {
      const titleSuggestions = data
        .map(item => item.property_details?.flow?.title)
        .filter(Boolean)
        .slice(0, 4); // Leave space for code suggestion
      
      return titleSuggestions;
    }

    return [];
      
};