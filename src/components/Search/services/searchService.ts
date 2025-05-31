// src/components/Search/services/searchService.ts
// Version: 6.0.0
// Last Modified: 01-06-2025 20:45 IST
// Purpose: Enhanced subtype filtering with proper apartment support for residential properties

import { SearchFilters, SearchResult } from '../types/search.types';
import { supabase } from '@/lib/supabase';
import SearchFallbackService from './searchFallbackService';
import { 
  logSearchParams, 
  logSearchResults, 
  logSearchError, 
  validateSearchParams,
  searchPerformanceMonitor 
} from '../utils/searchDebugUtils';

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Database result interface matching the PostgreSQL function return
interface DatabaseSearchResult {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  property_type: string;
  flow_type: string;
  subtype: string;
  total_count: number;
  title: string;
  price: number;
  city: string;
  state: string;
  area: number;
  owner_email: string;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_unit: string;
  land_type: string | null;
}

export class SearchService {
  /**
   * Enhanced mapping of frontend subtypes to database flow types
   * This handles the new apartment subtype properly
   */
  private mapSubtypeToFlowType(propertyType: string, subtype: string, transactionType: string): string | null {
    console.log('🔄 Mapping subtype:', { propertyType, subtype, transactionType });
    
    if (propertyType === 'residential') {
      // Handle special residential subtypes that have their own flow types
      switch (subtype) {
        case 'pghostel':
        case 'pg':
          return 'residential_pghostel';
        case 'flatmates':
          return 'residential_flatmates';
        case 'apartment':
        case 'villa':
        case 'house':
        case 'studio':
        case 'duplex':
        case 'penthouse':
        case 'farmhouse':
        case 'independent':
          // For regular residential subtypes, use transaction type to determine flow
          // The specific subtype filtering will be handled by property search query
          return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
        default:
          // Default residential flow based on transaction type
          return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
      }
    } else if (propertyType === 'commercial') {
      // Handle commercial subtypes
      switch (subtype) {
        case 'coworking':
          return 'commercial_coworking';
        case 'office_space':
        case 'shop':
        case 'showroom':
        case 'godown_warehouse':
        case 'industrial_shed':
        case 'industrial_building':
        case 'other_business':
          return transactionType === 'buy' ? 'commercial_sale' : 'commercial_rent';
        default:
          return transactionType === 'buy' ? 'commercial_sale' : 'commercial_rent';
      }
    } else if (propertyType === 'land') {
      // Land is typically only for sale
      return 'land_sale';
    } else if (propertyType === 'pghostel') {
      return 'residential_pghostel';
    } else if (propertyType === 'flatmates') {
      return 'residential_flatmates';
    }
    
    // Fallback to residential rent
    return 'residential_rent';
  }

  /**
   * NEW: Get property subtype filter for search query
   * This handles filtering by specific property types like "apartment" vs "villa"
   */
  private getPropertySubtypeFilter(filters: SearchFilters): string | null {
    const propertyType = filters.selectedPropertyType || 'residential';
    const selectedSubType = filters.selectedSubType;

    // Only apply subtype filter for regular residential properties
    if (propertyType === 'residential' && selectedSubType && selectedSubType !== 'any') {
      // Map frontend subtypes to database property types
      const subtypeMapping: Record<string, string[]> = {
        'apartment': ['apartment', 'flat', 'Apartment', 'Flat'],
        'villa': ['villa', 'Villa'],
        'house': ['house', 'independent house', 'House', 'Independent House'],
        'studio': ['studio', 'Studio'],
        'duplex': ['duplex', 'Duplex'],
        'penthouse': ['penthouse', 'Penthouse'],
        'farmhouse': ['farmhouse', 'Farmhouse'],
        'independent': ['independent', 'independent house', 'Independent', 'Independent House']
      };

      const searchTerms = subtypeMapping[selectedSubType];
      if (searchTerms && searchTerms.length > 0) {
        // Return the first search term for property type filtering
        return searchTerms[0];
      }
    }

    return null;
  }

  /**
   * Get effective subtype for database query
   * This determines what subtype parameter to send to the database
   */
  private getEffectiveSubtype(filters: SearchFilters): string | null {
    const propertyType = filters.selectedPropertyType || 'residential';
    const transactionType = filters.transactionType || 'rent';
    const selectedSubType = filters.selectedSubType;

    console.log('🎯 Getting effective subtype:', { propertyType, transactionType, selectedSubType });

    // Priority 1: If specific subtype is selected, use it
    if (selectedSubType && selectedSubType !== 'any') {
      const mappedFlowType = this.mapSubtypeToFlowType(propertyType, selectedSubType, transactionType);
      console.log('✅ Using selected subtype mapping:', selectedSubType, '->', mappedFlowType);
      return mappedFlowType;
    }

    // Priority 2: If only transaction type is selected, use base flow type
    if (transactionType && transactionType !== 'any') {
      const mappedFlowType = this.mapSubtypeToFlowType(propertyType, 'default', transactionType);
      console.log('✅ Using transaction type mapping:', transactionType, '->', mappedFlowType);
      return mappedFlowType;
    }

    // Priority 3: Default to null (no subtype filter)
    console.log('ℹ️ No specific subtype filter applied');
    return null;
  }

  /**
   * Main search method using property type specific database functions
   */
  async search(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    // Start performance monitoring
    const searchId = searchPerformanceMonitor.start(filters);
    
    try {
      console.log('🔍 Starting search with filters:', filters);
      console.log('🔧 Search options:', options);
      
      // Determine which database function to call based on property type
      const propertyType = filters.selectedPropertyType || 'residential';
      
      let searchResults: DatabaseSearchResult[] = [];
      let totalCount = 0;
      
      if (propertyType === 'any' || !propertyType) {
        // Search all property types
        searchResults = await this.searchAllPropertyTypes(filters, options);
        totalCount = searchResults[0]?.total_count || 0;
      } else {
        // Search specific property type
        const { data, error } = await this.callPropertySpecificSearch(propertyType, filters, options);
        
        if (error) {
          console.error('❌ Database search error:', error);
          throw new Error(`Database search failed: ${error.message}`);
        }
        
        searchResults = data || [];
        totalCount = searchResults[0]?.total_count || 0;
      }

      console.log('✅ Database search completed:', {
        resultCount: searchResults.length,
        totalCount: totalCount,
        propertyType: propertyType
      });

      // Transform database results to SearchResult format
      let transformedResults = this.transformDatabaseResults(searchResults);
      
      // Enhance results with fallback data for missing values
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      // Log results and performance
      const duration = searchPerformanceMonitor.end(transformedResults.length, totalCount);
      logSearchResults(transformedResults, totalCount, duration);
      
      return {
        results: transformedResults,
        totalCount,
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
   * Call the appropriate property-specific search function
   */
  private async callPropertySpecificSearch(
    propertyType: string, 
    filters: SearchFilters, 
    options: SearchOptions
  ) {
    const searchParams = this.buildSearchParams(filters, options);
    
    switch (propertyType) {
      case 'residential':
        console.log('🏠 Calling search_residential_properties with params:', searchParams);
        return await supabase.rpc('search_residential_properties', {
          p_subtype: searchParams.p_subtype,
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
        console.log('🏢 Calling search_commercial_properties with params:', searchParams);
        return await supabase.rpc('search_commercial_properties', {
          p_subtype: searchParams.p_subtype,
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
        console.log('🌍 Calling search_land_properties with params:', searchParams);
        return await supabase.rpc('search_land_properties', {
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
        console.log('🏠 Defaulting to search_residential_properties');
        return await supabase.rpc('search_residential_properties', {
          p_subtype: searchParams.p_subtype,
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
  }

  /**
   * Search all property types and combine results
   */
  private async searchAllPropertyTypes(filters: SearchFilters, options: SearchOptions): Promise<DatabaseSearchResult[]> {
    const searchParams = this.buildSearchParams(filters, options);
    const limit = Math.floor((searchParams.p_limit || 50) / 3); // Divide among property types
    
    try {
      // Search all property types in parallel
      const [residentialResult, commercialResult, landResult] = await Promise.allSettled([
        supabase.rpc('search_residential_properties', {
          p_subtype: searchParams.p_subtype,
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

      // Combine successful results
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
      console.error('Error in searchAllPropertyTypes:', error);
      throw error;
    }
  }

  /**
   * Enhanced search parameter building with improved subtype handling
   */
  private buildSearchParams(filters: SearchFilters, options: SearchOptions): Record<string, any> {
    const params: Record<string, any> = {
      // Basic search parameters
      p_search_query: filters.searchQuery || null,
      p_limit: options.limit || 50,
      p_offset: ((options.page || 1) - 1) * (options.limit || 50),
      p_sort_by: options.sortBy || 'created_at',
      p_sort_order: (options.sortOrder || 'desc').toUpperCase(),
    };

    // Location filters
    if (filters.selectedLocation && filters.selectedLocation !== 'any') {
      const locationMapping: Record<string, string> = {
        'hyderabad': 'Hyderabad',
        'secunderabad': 'Secunderabad',
        'warangal': 'Warangal',
        'nizamabad': 'Nizamabad',
        'karimnagar': 'Karimnagar',
        'khammam': 'Khammam',
        'mahbubnagar': 'Mahbubnagar',
        'nalgonda': 'Nalgonda',
        'adilabad': 'Adilabad',
        'medak': 'Medak',
        'rangareddy': 'Rangareddy',
        'sangareddy': 'Sangareddy',
        'siddipet': 'Siddipet',
        'vikarabad': 'Vikarabad'
      };
      
      params.p_city = locationMapping[filters.selectedLocation] || filters.selectedLocation;
      params.p_state = 'Telangana';
    }

    // ENHANCED: Proper subtype mapping using new method
    const effectiveSubtype = this.getEffectiveSubtype(filters);
    if (effectiveSubtype) {
      params.p_subtype = effectiveSubtype;
      console.log('🎯 Final subtype parameter:', effectiveSubtype);
    }

    // NEW: Add property subtype filter to search query for specific filtering
    const propertySubtypeFilter = this.getPropertySubtypeFilter(filters);
    if (propertySubtypeFilter && !params.p_search_query) {
      // If no search query exists, use the property subtype as search query
      params.p_search_query = propertySubtypeFilter;
      console.log('🏠 Property subtype filter applied to search query:', propertySubtypeFilter);
    } else if (propertySubtypeFilter && params.p_search_query) {
      // If search query exists, append the property subtype
      params.p_search_query = `${params.p_search_query} ${propertySubtypeFilter}`;
      console.log('🏠 Property subtype filter appended to search query:', params.p_search_query);
    }

    // BHK filter (bedrooms) - only for residential properties
    if (filters.selectedBHK && filters.selectedBHK !== 'any' && filters.selectedPropertyType === 'residential') {
      const bhkNumber = this.extractBHKNumber(filters.selectedBHK);
      if (bhkNumber) {
        params.p_bedrooms = bhkNumber;
        console.log('🏠 BHK filter applied:', bhkNumber);
      }
    }

    // Price range filter
    if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') {
      const priceRange = this.parsePriceRange(filters.selectedPriceRange);
      if (priceRange) {
        params.p_min_price = priceRange.min;
        params.p_max_price = priceRange.max;
        console.log('💰 Price range filter applied:', priceRange);
      }
    }

    console.log('🔧 Final search parameters:', params);
    return params;
  }

  /**
   * Transform database results to SearchResult format with enhanced property type handling
   */
  private transformDatabaseResults(dbResults: DatabaseSearchResult[]): SearchResult[] {
    return dbResults.map(dbResult => {
      // Determine transaction type from flow_type
      const transactionType = this.extractTransactionType(dbResult.flow_type);
      
      // Extract subtype from flow_type for better display
      const displaySubtype = this.extractDisplaySubtype(dbResult.flow_type, dbResult.subtype);
      
      // Format BHK with proper fallback
      const bhk = dbResult.bedrooms && dbResult.bedrooms > 0 ? `${dbResult.bedrooms}bhk` : null;
      
      // Ensure we have valid prices
      const price = dbResult.price && dbResult.price > 0 ? dbResult.price : 0;
      
      // Ensure we have valid area
      const area = dbResult.area && dbResult.area > 0 ? dbResult.area : 0;
      
      return {
        id: dbResult.id,
        title: dbResult.title || 'Property Listing',
        location: this.formatLocation(dbResult.city, dbResult.state),
        price: price,
        propertyType: dbResult.property_type,
        transactionType: transactionType,
        subType: displaySubtype,
        bhk: bhk,
        area: area,
        ownerName: this.extractOwnerName(dbResult.owner_email),
        ownerPhone: '+91 98765 43210',
        createdAt: dbResult.created_at,
        status: dbResult.status || 'active'
      } as SearchResult;
    });
  }

  /**
   * Extract display subtype from flow_type for better UI representation
   */
  private extractDisplaySubtype(flowType: string, subtype: string | null): string {
    // If we have a specific subtype, use it
    if (subtype && subtype !== flowType) {
      return subtype;
    }

    // Extract from flow_type
    if (flowType.includes('residential_rent')) {
      return 'apartment'; // Default residential rent to apartment
    } else if (flowType.includes('residential_sale')) {
      return 'apartment'; // Default residential sale to apartment  
    } else if (flowType.includes('residential_pghostel')) {
      return 'pghostel';
    } else if (flowType.includes('residential_flatmates')) {
      return 'flatmates';
    } else if (flowType.includes('commercial_rent')) {
      return 'office_space';
    } else if (flowType.includes('commercial_sale')) {
      return 'office_space';
    } else if (flowType.includes('commercial_coworking')) {
      return 'coworking';
    } else if (flowType.includes('land_sale')) {
      return 'residential_plot';
    }

    return flowType; // Fallback to flow_type
  }

  /**
   * Extract transaction type from flow_type
   */
  private extractTransactionType(flowType: string): string {
    if (flowType.includes('sale') || flowType.includes('buy')) {
      return 'buy';
    } else if (flowType.includes('rent') || flowType.includes('rental')) {
      return 'rent';
    }
    return 'rent'; // default
  }

  /**
   * Format location from city and state
   */
  private formatLocation(city: string | null, state: string | null): string {
    if (city && state) {
      return `${city}, ${state}`;
    } else if (city) {
      return city;
    } else if (state) {
      return state;
    }
    return 'Location not specified';
  }

  /**
   * Extract owner name from email
   */
  private extractOwnerName(email: string | null): string {
    if (!email) return 'Property Owner';
    
    const namePart = email.split('@')[0];
    return namePart
      .replace(/[._]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ') || 'Property Owner';
  }

  /**
   * Extract BHK number from BHK string
   */
  private extractBHKNumber(bhkString: string): number | null {
    const match = bhkString.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Parse price range string to min/max values
   */
  private parsePriceRange(priceRange: string): { min: number; max: number } | null {
    const ranges: Record<string, { min: number; max: number }> = {
      'under-10l': { min: 0, max: 1000000 },
      '10l-25l': { min: 1000000, max: 2500000 },
      '25l-50l': { min: 2500000, max: 5000000 },
      '50l-75l': { min: 5000000, max: 7500000 },
      '75l-1cr': { min: 7500000, max: 10000000 },
      '1cr-2cr': { min: 10000000, max: 20000000 },
      '2cr-3cr': { min: 20000000, max: 30000000 },
      '3cr-5cr': { min: 30000000, max: 50000000 },
      '5cr-10cr': { min: 50000000, max: 100000000 },
      'above-10cr': { min: 100000000, max: 999999999 }
    };

    return ranges[priceRange] || null;
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    
    try {
      const { data, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .ilike('property_details->flow->>title', `%${query}%`)
        .limit(5);

      if (error) {
        console.error('Error getting suggestions:', error);
        return [];
      }

      return data
        .map(item => item.property_details?.flow?.title)
        .filter(Boolean)
        .slice(0, 5);
        
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

// Create and export singleton instance
const searchServiceInstance = new SearchService();
export { searchServiceInstance as searchService };
export default searchServiceInstance;