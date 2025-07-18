// src/components/Search/services/searchService.ts
// Version: 3.0.0
// Last Modified: 2025-07-15
// Purpose: Search service with btService v3 API and Supabase fallback

import { btServiceClient } from './btServiceClient';
import { SearchFilters, SearchResult, SearchResponse, SearchPaginationOptions } from '../types/search.types';
import { supabase } from '../../../lib/supabase';
import { 
  extractFurnishingStatus, 
  extractPreferredTenants, 
  extractParking, 
  extractInternet 
} from '../utils/propertyExtractors';

/**
 * Parse price range string into min and max values
 * @param priceRange - Price range key like 'under-10l', '10l-25l', etc.
 * @returns Object with min and max price values, or null if invalid
 */
const parsePriceRange = (priceRange: string): { min: number | null; max: number | null } | null => {
  if (!priceRange || priceRange === 'any') {
    return { min: null, max: null };
  }

  // Convert lakhs (L) and crores (Cr) to actual numbers
  const priceRanges: Record<string, { min: number | null; max: number | null }> = {
    'under-10l': { min: null, max: 1000000 }, // Under ₹10L
    '10l-25l': { min: 1000000, max: 2500000 }, // ₹10L - ₹25L
    '25l-50l': { min: 2500000, max: 5000000 }, // ₹25L - ₹50L
    '50l-75l': { min: 5000000, max: 7500000 }, // ₹50L - ₹75L
    '75l-1cr': { min: 7500000, max: 10000000 }, // ₹75L - ₹1Cr
    '1cr-2cr': { min: 10000000, max: 20000000 }, // ₹1Cr - ₹2Cr
    '2cr-3cr': { min: 20000000, max: 30000000 }, // ₹2Cr - ₹3Cr
    '3cr-5cr': { min: 30000000, max: 50000000 }, // ₹3Cr - ₹5Cr
    '5cr-10cr': { min: 50000000, max: 100000000 }, // ₹5Cr - ₹10Cr
    'above-10cr': { min: 100000000, max: null } // Above ₹10Cr
  };

  return priceRanges[priceRange] || null;
};

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
   * Search properties with filters using v3 endpoints with Supabase fallback
   */
  async search(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    // Check if btService should be skipped
    const skipBtService = import.meta.env.VITE_SKIP_BTSERVICE === 'true';
    
    if (skipBtService) {
      console.log('⚡ Skipping btService - using Supabase directly');
      return this.searchPropertiesFromSupabase(filters, pagination);
    }
    
    try {
      const response = await btServiceClient.search(filters, pagination);
      
      // ENHANCEMENT: Add property_details to btService results for image extraction
      const enhancedResults = await this.enhanceResultsWithPropertyDetails(response.results);
      
      console.log('✅ SearchService.search (v3) completed:', {
        resultCount: enhancedResults.length,
        totalCount: response.totalCount
      });
      
      return {
        ...response,
        results: enhancedResults
      };
    } catch (error) {
      console.error('❌ SearchService.search (v3) error, falling back to Supabase:', error);
      return this.searchPropertiesFromSupabase(filters, pagination);
    }
  }

  /**
   * Search all property types and combine results (for Buy/Rent with propertyType=any)
   */
  private async searchAllPropertyTypes(
    filters: SearchFilters,
    dbTransactionType: string,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    console.log('🔍 Starting multi-property-type search for:', dbTransactionType);
    
    try {
      const searchPromises = [];
      
      // Search residential properties
      const residentialFilters = { ...filters, selectedPropertyType: 'residential' };
      searchPromises.push(this.searchPropertiesFromSupabase(residentialFilters, pagination));
      
      // Search commercial properties
      const commercialFilters = { ...filters, selectedPropertyType: 'commercial' };
      searchPromises.push(this.searchPropertiesFromSupabase(commercialFilters, pagination));
      
      // Search land properties (only for sale transactions)
      if (dbTransactionType === 'sale') {
        const landFilters = { ...filters, selectedPropertyType: 'land' };
        searchPromises.push(this.searchPropertiesFromSupabase(landFilters, pagination));
      }
      
      // Wait for all searches to complete
      const results = await Promise.all(searchPromises);
      
      // Combine all results
      const combinedResults = [];
      let totalCount = 0;
      
      for (const result of results) {
        combinedResults.push(...result.results);
        totalCount += result.totalCount;
      }
      
      console.log('🔍 Multi-property-type search completed:', {
        residential: results[0]?.results?.length || 0,
        commercial: results[1]?.results?.length || 0,
        land: results[2]?.results?.length || 0,
        totalCombined: combinedResults.length,
        totalCount
      });
      
      return {
        results: combinedResults,
        totalCount,
        page: pagination?.page || 1,
        limit: pagination?.limit || 50
      };
    } catch (error) {
      console.error('❌ Multi-property-type search failed:', error);
      return {
        results: [],
        totalCount: 0,
        page: 1,
        limit: pagination?.limit || 50
      };
    }
  }

  /**
   * Fallback: Search properties directly from Supabase
   */
  private async searchPropertiesFromSupabase(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    // Using Supabase fallback for search
    
    try {
      // When selectedPropertyType is 'any' but we have a specific transaction type,
      // we need to search all property types and combine results
      const needsAllPropertyTypes = filters.selectedPropertyType === 'any' && (filters as any).transactionType !== null;
      
      let rpcFunction = 'search_residential_properties';
      
      // Check selectedPropertyType instead of propertyType
      if (filters.selectedPropertyType === 'commercial') {
        rpcFunction = 'search_commercial_properties';
      } else if (filters.selectedPropertyType === 'land') {
        rpcFunction = 'search_land_properties';
      }
      // pghostel and flatmates are residential properties with specific subtypes
      // so they should use search_residential_properties function

      // Map transaction type: 'rent' stays 'rent', 'buy' becomes 'sale'
      // Note: filters.transactionType comes from the transformation in useSearch.ts
      let dbTransactionType = (filters as any).transactionType === 'buy' ? 'sale' : (filters as any).transactionType;
      
      // Handle pghostel and flatmates property types - these are residential properties with specific subtypes
      if (filters.selectedPropertyType === 'pghostel') {
        dbTransactionType = 'pghostel';
      } else if (filters.selectedPropertyType === 'flatmates') {
        dbTransactionType = 'flatmates';
      }
      
      // Parse price range
      const priceRange = parsePriceRange(filters.selectedPriceRange);
      
      // Debug transaction type filtering
      console.log('🚨 DEBUG p_subtype:', dbTransactionType, 'isNull:', dbTransactionType === null);
      console.log('🚨 DEBUG selectedPropertyType:', filters.selectedPropertyType);
      console.log('🚨 DEBUG actionType from filters:', (filters as any).actionType);
      console.log('🚨 DEBUG needsAllPropertyTypes:', needsAllPropertyTypes);
      
      // If we need to search all property types, do multiple searches and combine results
      if (needsAllPropertyTypes) {
        console.log('🔍 Searching all property types for transaction type:', dbTransactionType);
        return this.searchAllPropertyTypes(filters, dbTransactionType, pagination);
      }
      
      // Build parameters based on the function type
      const baseParams = {
        p_search_query: filters.searchQuery || null,
        p_city: (filters.selectedLocation && filters.selectedLocation !== 'any') ? filters.selectedLocation : null,
        p_property_subtype: filters.selectedSubType !== 'any' ? filters.selectedSubType : null,
        p_min_price: priceRange?.min || null,
        p_max_price: priceRange?.max || null,
        p_area_min: null, // Will be implemented when area filter is added
        p_area_max: null, // Will be implemented when area filter is added
        p_limit: pagination?.limit || 50,
        p_offset: pagination?.offset || 0
      };

      // Build parameters based on the specific function requirements
      let rpcParams;
      
      if (rpcFunction === 'search_land_properties') {
        // Land properties function has different parameters
        rpcParams = {
          p_property_subtype: filters.selectedSubType !== 'any' ? filters.selectedSubType : null,
          p_search_query: filters.searchQuery || null,
          p_min_price: priceRange?.min || null,
          p_max_price: priceRange?.max || null,
          p_city: (filters.selectedLocation && filters.selectedLocation !== 'any') ? filters.selectedLocation : null,
          p_state: null,
          p_area_min: null,
          p_area_max: null,
          p_limit: pagination?.limit || 50,
          p_offset: pagination?.offset || 0
        };
      } else if (rpcFunction === 'search_commercial_properties') {
        // Commercial properties function has these parameters (based on error message)
        rpcParams = {
          p_property_subtype: filters.selectedSubType !== 'any' ? filters.selectedSubType : null,
          p_search_query: filters.searchQuery || null,
          p_state: null,
          p_subtype: dbTransactionType || null,
          p_min_price: priceRange?.min || null,
          p_max_price: priceRange?.max || null
        };
      } else {
        // Residential properties function (original parameters)
        rpcParams = {
          ...baseParams,
          p_subtype: dbTransactionType || null, // This is the transaction type (rent/sale)
          p_bedrooms: filters.selectedBHK ? parseInt(filters.selectedBHK.replace(/[^0-9]/g, '')) : null,
        };
      }

      // Database call with transaction type filtering

      const { data, error } = await supabase.rpc(rpcFunction, rpcParams);

      if (error) {
        console.error('❌ Supabase search fallback error:', error);
        throw error;
      }

      // Process search results

      // First create base results
      const baseResults: SearchResult[] = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        location: `${item.city || ''}, ${item.state || ''}`.trim().replace(/^,\s*|,\s*$/, ''),
        price: item.price || 0,
        propertyType: item.property_type,
        transactionType: item.flow_type?.includes('rent') ? 'rent' : 
                       item.flow_type?.includes('sale') ? 'buy' : 
                       item.subtype === 'sale' ? 'buy' : 'rent',
        subType: item.subtype,
        bhk: item.bedrooms ? `${item.bedrooms}bhk` : null,
        area: item.area || 0,
        ownerName: item.owner_email?.split('@')[0] || 'Owner',
        ownerPhone: '+91 98765 43210', // Default phone
        createdAt: item.created_at,
        status: item.status,
        primary_image: item.primary_image,
        code: null,
        latitude: item.latitude,
        longitude: item.longitude
      })) || [];

      // Now fetch property_details for each result to get additional information
      const results: SearchResult[] = await Promise.all(
        baseResults.map(async (result) => {
          try {
            const { data: propertyData, error: propertyError } = await supabase
              .from('properties_v2')
              .select('property_details')
              .eq('id', result.id)
              .single();

            if (propertyError || !propertyData?.property_details) {
              console.warn(`⚠️  Could not fetch property_details for ${result.id}:`, propertyError);
              return result;
            }

            const propertyDetails = propertyData.property_details;

            // Extract additional fields using our utility functions
            const furnishingStatus = extractFurnishingStatus(propertyDetails);
            const preferredTenants = extractPreferredTenants(propertyDetails);
            const parking = extractParking(propertyDetails);
            const internet = extractInternet(propertyDetails);

            // Extract additional property details

            return {
              ...result,
              furnishingStatus,
              preferredTenants,
              parking,
              internet
            };
          } catch (error) {
            console.warn(`⚠️  Error fetching property_details for ${result.id}:`, error);
            return result;
          }
        })
      );

      // Search completed

      return {
        results,
        totalCount: results.length,
        page: Math.floor((pagination?.offset || 0) / (pagination?.limit || 50)) + 1,
        limit: pagination?.limit || 50
      };
    } catch (error) {
      console.error('❌ Supabase search fallback failed:', error);
      return {
        results: [],
        totalCount: 0,
        page: 1,
        limit: pagination?.limit || 50
      };
    }
  }

  /**
   * Smart search with property code detection using v3 endpoints
   */
  async smartSearch(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    // Check if btService should be skipped
    const skipBtService = import.meta.env.VITE_SKIP_BTSERVICE === 'true';
    
    if (skipBtService) {
      console.log('⚡ Skipping btService - using Supabase directly for smart search');
      const query = filters.searchQuery?.trim();
      if (query && this.isPropertyCode(query)) {
        return this.searchByCodeFromSupabase(query, true);
      }
      return this.searchPropertiesFromSupabase(filters, pagination);
    }
    
    try {
      const response = await btServiceClient.smartSearch(filters, pagination);
      console.log('✅ SearchService.smartSearch (v3) completed:', {
        resultCount: response.results.length,
        totalCount: response.totalCount
      });
      return response;
    } catch (error) {
      console.error('❌ SearchService.smartSearch (v3) error, falling back to Supabase:', error);
      // For API failures, fall back to local property code detection and Supabase
      const query = filters.searchQuery?.trim();
      if (query && this.isPropertyCode(query)) {
        return this.searchByCodeFromSupabase(query, true);
      }
      return this.searchPropertiesFromSupabase(filters, pagination);
    }
  }

  /**
   * Search by property code using v3 endpoints
   */
  async searchByCode(code: string, exact: boolean = true): Promise<SearchResponse> {
    console.log('🔍 SearchService.searchByCode (v3) called with:', { code, exact });
    
    // Check if btService should be skipped
    const skipBtService = import.meta.env.VITE_SKIP_BTSERVICE === 'true';
    
    if (skipBtService) {
      console.log('⚡ Skipping btService - using Supabase directly for code search');
      return this.searchByCodeFromSupabase(code, exact);
    }
    
    try {
      const response = await btServiceClient.searchByCode(code, exact);
      console.log('✅ SearchService.searchByCode (v3) completed:', {
        resultCount: response.results.length,
        totalCount: response.totalCount
      });
      return response;
    } catch (error) {
      console.error('❌ SearchService.searchByCode (v3) error, falling back to Supabase:', error);
      return this.searchByCodeFromSupabase(code, exact);
    }
  }

  /**
   * Get latest properties using v3 endpoints with Supabase fallback
   */
  async getLatestProperties(limit: number = 50, offset: number = 0): Promise<SearchResponse> {
    console.log('📋 SearchService.getLatestProperties (v3) called with:', { limit, offset });
    
    // Check if btService should be skipped
    const skipBtService = import.meta.env.VITE_SKIP_BTSERVICE === 'true';
    
    if (skipBtService) {
      console.log('⚡ Skipping btService - using Supabase directly for latest properties');
      return this.getLatestPropertiesFromSupabase(limit, offset);
    }
    
    try {
      const response = await btServiceClient.getLatestProperties(limit, offset);
      
      // ENHANCEMENT: Add property_details to btService results for image extraction
      const enhancedResults = await this.enhanceResultsWithPropertyDetails(response.results);
      
      console.log('✅ SearchService.getLatestProperties (v3) completed:', {
        resultCount: enhancedResults.length,
        totalCount: response.totalCount
      });
      
      return {
        ...response,
        results: enhancedResults
      };
    } catch (error) {
      console.error('❌ SearchService.getLatestProperties (v3) error, falling back to Supabase:', error);
      return this.getLatestPropertiesFromSupabase(limit, offset);
    }
  }

  /**
   * Enhance btService results with property_details for image extraction (OPTIMIZED)
   */
  private async enhanceResultsWithPropertyDetails(results: SearchResult[]): Promise<SearchResult[]> {
    console.log('🔧 Enhancing btService results with property_details for image extraction');
    console.log('🔧 Input results count:', results.length);
    
    if (results.length === 0) {
      return results;
    }
    
    try {
      // Extract all property IDs
      const propertyIds = results.map(result => result.id);
      
      // Make a single batch query instead of individual queries
      const { data: propertyDetailsData, error: batchError } = await supabase
        .from('properties_v2')
        .select('id, property_details')
        .in('id', propertyIds);

      if (batchError) {
        console.warn('⚠️  Batch query error, returning original results:', batchError);
        return results;
      }

      // Create a map for quick lookup
      const propertyDetailsMap = new Map(
        propertyDetailsData?.map(item => [item.id, item.property_details]) || []
      );

      // Enhance results with property_details
      const enhancedResults = results.map(result => {
        const propertyDetails = propertyDetailsMap.get(result.id);
        
        if (propertyDetails) {
          // console.log(`✅ Enhanced ${result.id} with property_details. Has imageFiles:`, !!(propertyDetails.imageFiles));
          return {
            ...result,
            property_details: propertyDetails
          };
        } else {
          console.warn(`⚠️  No property_details found for ${result.id}`);
          return result;
        }
      });
      
      console.log('✅ Enhanced results with property_details (batch):', enhancedResults.length);
      return enhancedResults;
    } catch (error) {
      console.warn('⚠️  Error in batch enhancement, returning original results:', error);
      return results;
    }
  }

  /**
   * Fallback: Get latest properties directly from Supabase
   */
  private async getLatestPropertiesFromSupabase(limit: number = 50, offset: number = 0): Promise<SearchResponse> {
    console.log('🔄 Using Supabase fallback for getLatestProperties');
    
    try {
      // Get more properties than needed to handle pagination
      const requestLimit = Math.min(limit + offset, 200); // Get up to 200 properties
      
      const { data, error } = await supabase
        .rpc('get_latest_properties', { 
          p_limit: requestLimit
        });

      if (error) {
        console.error('❌ Supabase RPC fallback error:', error);
        throw error;
      }

      const allResults: SearchResult[] = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        location: `${item.city || ''}, ${item.state || ''}`.trim().replace(/^,\s*|,\s*$/, ''),
        price: item.price || 0,
        propertyType: item.property_type,
        transactionType: item.flow_type?.includes('rent') ? 'rent' : 
                       item.flow_type?.includes('sale') ? 'buy' : 
                       item.subtype === 'sale' ? 'buy' : 'rent',
        subType: item.subtype,
        bhk: item.bedrooms ? `${item.bedrooms}bhk` : null,
        area: item.area || 0,
        ownerName: item.owner_email?.split('@')[0] || 'Owner',
        ownerPhone: '+91 98765 43210', // Default phone
        createdAt: item.created_at,
        status: item.status,
        primary_image: item.primary_image,
        code: null,
        latitude: item.latitude,
        longitude: item.longitude
      })) || [];

      // Apply pagination manually since Supabase function doesn't handle offset
      const paginatedResults = allResults.slice(offset, offset + limit);
      const totalCount = data?.[0]?.total_count || allResults.length;

      console.log('✅ RPC fallback completed:', {
        requestedLimit: requestLimit,
        totalResults: allResults.length,
        offset,
        limit,
        returnedCount: paginatedResults.length,
        totalCount
      });

      return {
        results: paginatedResults,
        totalCount: totalCount,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      console.error('❌ RPC fallback failed:', error);
      // Return empty results instead of throwing to maintain UI functionality
      return {
        results: [],
        totalCount: 0,
        page: 1,
        limit
      };
    }
  }

  /**
   * Fallback: Search by property code directly from Supabase
   */
  private async searchByCodeFromSupabase(code: string, exact: boolean = true): Promise<SearchResponse> {
    console.log('🔄 Using Supabase fallback for searchByCode');
    console.log('🔍 SearchByCode parameters:', { code, exact, trimmedCode: code.trim() });
    
    try {
      // Use the appropriate function based on exact flag
      const rpcFunction = exact ? 'search_property_by_code' : 'search_property_by_code_insensitive';
      console.log('🔍 Using RPC function:', rpcFunction);
      
      const { data, error } = await supabase.rpc(rpcFunction, { 
        p_code: code.trim()
      });

      if (error) {
        console.error('❌ Supabase search by code fallback error:', error);
        throw error;
      }

      console.log('🔍 Search by code Raw Data:', {
        rpcFunction,
        dataLength: data?.length || 0,
        data: data,
        code: code
      });

      // First create base results
      const baseResults: SearchResult[] = data?.map((item: any) => ({
        id: item.id,
        title: item.title,
        location: `${item.city || ''}, ${item.state || ''}`.trim().replace(/^,\s*|,\s*$/, ''),
        price: item.price || 0,
        propertyType: item.property_type,
        transactionType: item.flow_type?.includes('rent') ? 'rent' : 
                       item.flow_type?.includes('sale') ? 'buy' : 
                       item.subtype === 'sale' ? 'buy' : 'rent',
        subType: item.subtype,
        bhk: item.bedrooms ? `${item.bedrooms}bhk` : null,
        area: item.area || 0,
        ownerName: item.owner_email?.split('@')[0] || 'Owner',
        ownerPhone: '+91 98765 43210', // Default phone
        createdAt: item.created_at,
        status: item.status,
        primary_image: item.primary_image,
        code: item.code,
        latitude: null, // Property code search doesn't include coordinates
        longitude: null
      })) || [];

      // Now fetch property_details for each result to get additional information
      const results: SearchResult[] = await Promise.all(
        baseResults.map(async (result) => {
          try {
            const { data: propertyData, error: propertyError } = await supabase
              .from('properties_v2')
              .select('property_details')
              .eq('id', result.id)
              .single();

            if (propertyError || !propertyData?.property_details) {
              console.warn(`⚠️  Could not fetch property_details for ${result.id}:`, propertyError);
              return result;
            }

            const propertyDetails = propertyData.property_details;

            // Extract additional fields using our utility functions
            const furnishingStatus = extractFurnishingStatus(propertyDetails);
            const preferredTenants = extractPreferredTenants(propertyDetails);
            const parking = extractParking(propertyDetails);
            const internet = extractInternet(propertyDetails);

            return {
              ...result,
              furnishingStatus,
              preferredTenants,
              parking,
              internet
            };
          } catch (error) {
            console.warn(`⚠️  Error fetching property_details for ${result.id}:`, error);
            return result;
          }
        })
      );

      const finalResponse = {
        results,
        totalCount: results.length,
        page: 1,
        limit: results.length
      };

      console.log('✅ Supabase search by code fallback completed:', {
        code,
        exact,
        resultCount: results.length,
        totalCount: results.length,
        finalResponse: finalResponse,
        sampleResult: results[0] || null
      });

      return finalResponse;
    } catch (error) {
      console.error('❌ Supabase search by code fallback failed:', error);
      return {
        results: [],
        totalCount: 0,
        page: 1,
        limit: 50
      };
    }
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    console.log('💡 SearchService.getSearchSuggestions called with query:', query);
    
    // Check if btService should be skipped
    const skipBtService = import.meta.env.VITE_SKIP_BTSERVICE === 'true';
    
    if (skipBtService) {
      console.log('⚡ Skipping btService - returning empty suggestions');
      return []; // Return empty array when btService is skipped
    }
    
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