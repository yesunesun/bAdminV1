// src/components/Search/services/searchService.ts
// Version: 7.0.0
// Last Modified: 01-06-2025 21:15 IST
// Purpose: Fixed apartment subtype filtering to properly filter by property subtype, not just flow type

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
   * Map frontend subtypes to database flow types
   */
  private mapSubtypeToFlowType(propertyType: string, subtype: string, transactionType: string): string | null {
    console.log('🔄 Mapping subtype to flow type:', { propertyType, subtype, transactionType });
    
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
          return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
        default:
          return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
      }
    } else if (propertyType === 'commercial') {
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
      return 'land_sale';
    } else if (propertyType === 'pghostel') {
      return 'residential_pghostel';
    } else if (propertyType === 'flatmates') {
      return 'residential_flatmates';
    }
    
    return 'residential_rent';
  }

  /**
   * Check if property subtype matches selected filter
   * This is the key method to filter apartments vs villas vs houses
   */
  private doesPropertyMatchSubtype(property: DatabaseSearchResult, selectedSubtype: string): boolean {
    if (!selectedSubtype || selectedSubtype === 'any') {
      return true; // No subtype filter applied
    }

    // For PG/Hostel and Flatmates, the flow type itself is the filter
    if (selectedSubtype === 'pghostel' || selectedSubtype === 'flatmates') {
      return property.flow_type.includes(selectedSubtype);
    }

    // For regular residential properties, we need to check the property details
    // Since we don't have property_details in the search result, we'll use title-based matching
    const title = property.title?.toLowerCase() || '';
    
    const subtypePatterns: Record<string, string[]> = {
      'apartment': ['apartment', 'flat', 'aprt', 'apt'],
      'villa': ['villa', 'independent villa'],
      'house': ['house', 'independent house', 'individual house'],
      'studio': ['studio'],
      'duplex': ['duplex'],
      'penthouse': ['penthouse'],
      'farmhouse': ['farmhouse', 'farm house'],
      'independent': ['independent', 'individual']
    };

    const patterns = subtypePatterns[selectedSubtype] || [];
    return patterns.some(pattern => title.includes(pattern));
  }

  /**
   * Enhanced method to get effective subtype considering property-level filtering
   */
  private getEffectiveSubtype(filters: SearchFilters): string | null {
    const propertyType = filters.selectedPropertyType || 'residential';
    const transactionType = filters.transactionType || 'rent';
    const selectedSubType = filters.selectedSubType;

    console.log('🎯 Getting effective subtype:', { propertyType, transactionType, selectedSubType });

    // For PG/Hostel and Flatmates, use the specific flow type
    if (selectedSubType === 'pghostel' || selectedSubType === 'flatmates') {
      const mappedFlowType = this.mapSubtypeToFlowType(propertyType, selectedSubType, transactionType);
      console.log('✅ Using special subtype mapping:', selectedSubType, '->', mappedFlowType);
      return mappedFlowType;
    }

    // For regular residential properties, just use the base flow type
    // We'll do property-level filtering in post-processing
    if (transactionType && transactionType !== 'any') {
      const mappedFlowType = this.mapSubtypeToFlowType(propertyType, 'default', transactionType);
      console.log('✅ Using transaction type mapping:', transactionType, '->', mappedFlowType);
      return mappedFlowType;
    }

    console.log('ℹ️ No specific subtype filter applied');
    return null;
  }

  /**
   * Main search method with post-processing subtype filtering
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
        searchResults = await this.searchAllPropertyTypes(filters, options);
        totalCount = searchResults[0]?.total_count || 0;
      } else {
        const { data, error } = await this.callPropertySpecificSearch(propertyType, filters, options);
        
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
        propertyType: propertyType
      });

      // CRITICAL: Apply subtype filtering at application level
      const filteredResults = this.applySubtypeFiltering(searchResults, filters);
      console.log('🎯 After subtype filtering:', {
        originalCount: searchResults.length,
        filteredCount: filteredResults.length,
        selectedSubtype: filters.selectedSubType
      });

      // Transform filtered results
      let transformedResults = this.transformDatabaseResults(filteredResults);
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      // Adjust total count based on filtering
      const adjustedTotalCount = filteredResults.length;
      
      const duration = searchPerformanceMonitor.end(transformedResults.length, adjustedTotalCount);
      logSearchResults(transformedResults, adjustedTotalCount, duration);
      
      return {
        results: transformedResults,
        totalCount: adjustedTotalCount,
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
   * NEW: Apply subtype filtering to search results
   * This is where we filter apartments vs villas vs houses
   */
  private applySubtypeFiltering(results: DatabaseSearchResult[], filters: SearchFilters): DatabaseSearchResult[] {
    const selectedSubtype = filters.selectedSubType;
    
    if (!selectedSubtype || selectedSubtype === 'any') {
      console.log('ℹ️ No subtype filtering applied');
      return results;
    }

    console.log('🔍 Applying subtype filter:', selectedSubtype);
    
    const filteredResults = results.filter(property => 
      this.doesPropertyMatchSubtype(property, selectedSubtype)
    );

    console.log('📋 Subtype filtering results:', {
      subtype: selectedSubtype,
      originalCount: results.length,
      filteredCount: filteredResults.length,
      removedCount: results.length - filteredResults.length
    });

    return filteredResults;
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
    const limit = Math.floor((searchParams.p_limit || 50) / 3);
    
    try {
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
   * Build search parameters for database functions
   */
  private buildSearchParams(filters: SearchFilters, options: SearchOptions): Record<string, any> {
    const params: Record<string, any> = {
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

    // Get effective subtype for database filtering
    const effectiveSubtype = this.getEffectiveSubtype(filters);
    if (effectiveSubtype) {
      params.p_subtype = effectiveSubtype;
      console.log('🎯 Database subtype parameter:', effectiveSubtype);
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
   * Transform database results to SearchResult format
   */
  private transformDatabaseResults(dbResults: DatabaseSearchResult[]): SearchResult[] {
    return dbResults.map(dbResult => {
      const transactionType = this.extractTransactionType(dbResult.flow_type);
      const displaySubtype = this.extractDisplaySubtype(dbResult.flow_type, dbResult.subtype, dbResult.title);
      const bhk = dbResult.bedrooms && dbResult.bedrooms > 0 ? `${dbResult.bedrooms}bhk` : null;
      const price = dbResult.price && dbResult.price > 0 ? dbResult.price : 0;
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
   * Enhanced display subtype extraction with title-based detection
   */
  private extractDisplaySubtype(flowType: string, subtype: string | null, title: string | null): string {
    // If we have a specific subtype, use it
    if (subtype && subtype !== flowType) {
      return subtype;
    }

    // Try to detect subtype from title for better display
    const titleLower = title?.toLowerCase() || '';
    
    if (titleLower.includes('villa')) {
      return 'villa';
    } else if (titleLower.includes('independent') || titleLower.includes('house')) {
      return 'house';
    } else if (titleLower.includes('duplex')) {
      return 'duplex';
    } else if (titleLower.includes('penthouse')) {
      return 'penthouse';
    } else if (titleLower.includes('studio')) {
      return 'studio';
    } else if (titleLower.includes('farmhouse')) {
      return 'farmhouse';
    }

    // Extract from flow_type as fallback
    if (flowType.includes('residential_rent') || flowType.includes('residential_sale')) {
      return 'apartment'; // Default residential to apartment
    } else if (flowType.includes('residential_pghostel')) {
      return 'pghostel';
    } else if (flowType.includes('residential_flatmates')) {
      return 'flatmates';
    } else if (flowType.includes('commercial_rent') || flowType.includes('commercial_sale')) {
      return 'office_space';
    } else if (flowType.includes('commercial_coworking')) {
      return 'coworking';
    } else if (flowType.includes('land_sale')) {
      return 'residential_plot';
    }

    return flowType;
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
    return 'rent';
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