// src/components/Search/services/searchService.ts
// Version: 2.1.0
// Last Modified: 2025-07-11
// Purpose: Search service with btService API and Supabase fallback

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
   * Search properties with filters and fallback to Supabase
   */
  async search(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    console.log('🔍 SearchService.search called with:', { filters, pagination });
    
    // Temporarily disable btService to clean up console - go directly to Supabase fallback
    console.log('🔄 Using Supabase directly (btService temporarily disabled)');
    return this.searchPropertiesFromSupabase(filters, pagination);
    
    // TODO: Re-enable btService when compression issues are resolved
    // try {
    //   const response = await btServiceClient.search(filters, pagination);
    //   console.log('✅ SearchService.search completed:', {
    //     resultCount: response.results.length,
    //     totalCount: response.totalCount
    //   });
    //   return response;
    // } catch (error) {
    //   console.error('❌ SearchService.search error, falling back to Supabase:', error);
    //   return this.searchPropertiesFromSupabase(filters, pagination);
    // }
  }

  /**
   * Fallback: Search properties directly from Supabase
   */
  private async searchPropertiesFromSupabase(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    console.log('🔄 Using Supabase fallback for search');
    console.log('🔍 DEBUG: Raw filters received:', filters);
    
    try {
      let rpcFunction = 'search_residential_properties';
      
      // Check selectedPropertyType instead of propertyType
      if (filters.selectedPropertyType === 'commercial') {
        rpcFunction = 'search_commercial_properties';
      } else if (filters.selectedPropertyType === 'land') {
        rpcFunction = 'search_land_properties';
      }

      // Map transaction type: 'rent' stays 'rent', 'buy' becomes 'sale'
      // Note: filters.transactionType comes from the transformation in useSearch.ts
      const dbTransactionType = (filters as any).transactionType === 'buy' ? 'sale' : (filters as any).transactionType;
      
      // Parse price range
      const priceRange = parsePriceRange(filters.selectedPriceRange);
      console.log('🔍 Price Range Debug:', {
        selectedPriceRange: filters.selectedPriceRange,
        parsedPriceRange: priceRange
      });
      
      console.log('🔍 Search Debug:', {
        originalFilters: filters,
        rpcFunction,
        dbTransactionType,
        selectedPropertyType: filters.selectedPropertyType,
        actionType: filters.actionType,
        hasTransactionType: 'transactionType' in filters,
        transactionTypeValue: (filters as any).transactionType
      });
      
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

      console.log('🔍 Database Call Debug:', {
        rpcFunction,
        rpcParams,
        dbTransactionType,
        queryParameters: rpcParams
      });
      
      console.log('🔍 Detailed RPC Parameters:', JSON.stringify(rpcParams, null, 2));

      const { data, error } = await supabase.rpc(rpcFunction, rpcParams);

      if (error) {
        console.error('❌ Supabase search fallback error:', error);
        throw error;
      }

      console.log('🔍 Search Raw Data:', {
        dataLength: data?.length || 0,
        firstItem: data?.[0],
        sampleFlowTypes: data?.slice(0, 3).map((item: any) => ({
          id: item.id,
          flow_type: item.flow_type,
          subtype: item.subtype,
          title: item.title
        }))
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

            // Log extracted data for debugging (remove in production)
            console.log(`🔍 [PropertyExtractors] Property ${result.id}:`, {
              furnishingStatus,
              preferredTenants,
              parking,
              internet
            });

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

      console.log('✅ Supabase search fallback completed:', {
        resultCount: results.length,
        totalCount: results.length
      });

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
   * Get latest properties with fallback to Supabase
   */
  async getLatestProperties(limit: number = 50, offset: number = 0): Promise<SearchResponse> {
    console.log('📋 SearchService.getLatestProperties called with:', { limit, offset });
    
    // Temporarily disable btService to clean up console - go directly to Supabase fallback
    console.log('🔄 Using Supabase directly (btService temporarily disabled)');
    return this.getLatestPropertiesFromSupabase(limit, offset);
    
    // TODO: Re-enable btService when compression issues are resolved
    // try {
    //   const response = await btServiceClient.getLatestProperties(limit, offset);
    //   console.log('✅ SearchService.getLatestProperties completed:', {
    //     resultCount: response.results.length,
    //     totalCount: response.totalCount
    //   });
    //   return response;
    // } catch (error) {
    //   console.error('❌ SearchService.getLatestProperties error, falling back to Supabase:', error);
    //   return this.getLatestPropertiesFromSupabase(limit, offset);
    // }
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
        console.error('❌ Supabase fallback error:', error);
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

      console.log('✅ Supabase fallback completed:', {
        requestedLimit: requestLimit,
        totalResults: allResults.length,
        offset,
        limit,
        returnedCount: paginatedResults.length,
        totalCount,
        sampleFlowTypes: data?.slice(0, 3).map((item: any) => ({
          id: item.id,
          flow_type: item.flow_type,
          subtype: item.subtype,
          title: item.title
        }))
      });

      return {
        results: paginatedResults,
        totalCount: totalCount,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      console.error('❌ Supabase fallback failed:', error);
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