// src/components/Search/services/searchService.ts
// Version: 3.0.0
// Last Modified: 02-06-2025 18:30 IST
// Purpose: Fixed search service with proper parameter mapping for residential and commercial properties

import { SearchFilters, SearchResult } from '../types/search.types';
import { supabase } from '@/lib/supabase';

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
  primary_image: string | null;
  code?: string | null;
}

export class SearchService {
  /**
   * Search property by code using search_property_by_code SQL function
   */
  async searchByCode(code: string, useInsensitiveSearch: boolean = true): Promise<SearchResponse> {
    try {
      console.log('🔍 Searching property by code:', code, 'insensitive:', useInsensitiveSearch);
      
      const functionName = useInsensitiveSearch ? 'search_property_by_code_insensitive' : 'search_property_by_code';
      const { data, error } = await supabase.rpc(functionName, { p_code: code.trim() });
      
      if (error) {
        console.error('❌ Property code search error:', error);
        throw new Error(`Code search failed: ${error.message}`);
      }

      const searchResults = data || [];
      const totalCount = searchResults[0]?.total_count || searchResults.length;
      
      console.log('📊 Property code search results:', {
        code: code.trim(),
        resultCount: searchResults.length,
        totalCount: totalCount,
        foundProperty: searchResults.length > 0 ? searchResults[0].title : 'None'
      });

      const transformedResults = this.transformDatabaseResults(searchResults);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: 1,
        limit: 50
      };
      
    } catch (error) {
      console.error('💥 Property code search error:', error);
      throw error;
    }
  }

  /**
   * Check if a search query is exactly a 6-character alphanumeric property code
   */
  isPropertyCode(query: string): boolean {
    if (!query) return false;
    
    const trimmedQuery = query.trim();
    if (trimmedQuery.length !== 6) return false;
    
    const alphanumericPattern = /^[A-Za-z0-9]{6}$/;
    return alphanumericPattern.test(trimmedQuery);
  }

  /**
   * Search residential properties using proper parameter mapping
   */
  async searchResidentialProperties(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      console.log('🏠 Searching residential properties with filters:', filters);
      
      // Build parameters according to search_residential_properties function signature
      const params = this.buildResidentialSearchParams(filters, options);
      console.log('🔧 Residential search parameters:', params);
      
      const { data, error } = await supabase.rpc('search_residential_properties', params);
      
      if (error) {
        console.error('❌ Residential search error:', error);
        throw new Error(`Residential search failed: ${error.message}`);
      }

      const searchResults = data || [];
      const totalCount = searchResults[0]?.total_count || 0;
      
      console.log('📊 Residential search results:', {
        resultCount: searchResults.length,
        totalCount: totalCount,
        params: params
      });

      const transformedResults = this.transformDatabaseResults(searchResults);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: options.page || 1,
        limit: options.limit || 50
      };
      
    } catch (error) {
      console.error('💥 Residential search error:', error);
      throw error;
    }
  }

  /**
   * Search commercial properties using proper parameter mapping
   */
  async searchCommercialProperties(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      console.log('🏢 Searching commercial properties with filters:', filters);
      
      // Build parameters according to search_commercial_properties function signature
      const params = this.buildCommercialSearchParams(filters, options);
      console.log('🔧 Commercial search parameters:', params);
      
      const { data, error } = await supabase.rpc('search_commercial_properties', params);
      
      if (error) {
        console.error('❌ Commercial search error:', error);
        throw new Error(`Commercial search failed: ${error.message}`);
      }

      const searchResults = data || [];
      const totalCount = searchResults[0]?.total_count || 0;
      
      console.log('📊 Commercial search results:', {
        resultCount: searchResults.length,
        totalCount: totalCount,
        params: params
      });

      const transformedResults = this.transformDatabaseResults(searchResults);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: options.page || 1,
        limit: options.limit || 50
      };
      
    } catch (error) {
      console.error('💥 Commercial search error:', error);
      throw error;
    }
  }

  /**
   * Search land properties
   */
  async searchLandProperties(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      console.log('🌍 Searching land properties with filters:', filters);
      
      // Build parameters according to search_land_properties function signature
      const params = this.buildLandSearchParams(filters, options);
      console.log('🔧 Land search parameters:', params);
      
      const { data, error } = await supabase.rpc('search_land_properties', params);
      
      if (error) {
        console.error('❌ Land search error:', error);
        throw new Error(`Land search failed: ${error.message}`);
      }

      const searchResults = data || [];
      const totalCount = searchResults[0]?.total_count || 0;
      
      console.log('📊 Land search results:', {
        resultCount: searchResults.length,
        totalCount: totalCount,
        params: params
      });

      const transformedResults = this.transformDatabaseResults(searchResults);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: options.page || 1,
        limit: options.limit || 50
      };
      
    } catch (error) {
      console.error('💥 Land search error:', error);
      throw error;
    }
  }

  /**
   * Build parameters for residential property search
   */
  private buildResidentialSearchParams(filters: SearchFilters, options: SearchOptions): Record<string, any> {
    const params: Record<string, any> = {
      p_limit: options.limit || 50,
      p_offset: ((options.page || 1) - 1) * (options.limit || 50)
    };

    // Search query
    if (filters.searchQuery?.trim()) {
      params.p_search_query = filters.searchQuery.trim();
    }

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

    // Map action type to subtype (transaction type)
    if (filters.actionType && filters.actionType !== 'any') {
      if (filters.selectedPropertyType === 'pghostel') {
        params.p_subtype = 'pghostel';
      } else if (filters.selectedPropertyType === 'flatmates') {
        params.p_subtype = 'flatmates';
      } else {
        // Regular residential properties
        switch (filters.actionType) {
          case 'buy':
          case 'sell':
            params.p_subtype = 'sale';
            break;
          case 'rent':
            params.p_subtype = 'rent';
            break;
        }
      }
    }

    // Property subtype (villa, apartment, etc.)
    if (filters.selectedSubType && filters.selectedSubType !== 'any') {
      const propertySubtypeMapping: Record<string, string> = {
        'apartment': 'apartment',
        'independent_house': 'independent_house',
        'villa': 'villa',
        'penthouse': 'penthouse',
        'studio_apartment': 'studio_apartment',
        'service_apartment': 'service_apartment',
        'single_sharing': 'single_sharing',
        'double_sharing': 'double_sharing',
        'triple_sharing': 'triple_sharing',
        'four_sharing': 'four_sharing',
        'dormitory': 'dormitory'
      };
      
      if (propertySubtypeMapping[filters.selectedSubType]) {
        params.p_property_subtype = propertySubtypeMapping[filters.selectedSubType];
      }
    }

    // BHK filter (bedrooms)
    if (filters.selectedBHK && filters.selectedBHK !== 'any') {
      const bhkNumber = this.extractBHKNumber(filters.selectedBHK);
      if (bhkNumber) {
        params.p_bedrooms = bhkNumber;
      }
    }

    // Price range filter
    if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') {
      const priceRange = this.parsePriceRange(filters.selectedPriceRange);
      if (priceRange) {
        params.p_min_price = priceRange.min;
        params.p_max_price = priceRange.max;
      }
    }

    return params;
  }

  /**
   * Build parameters for commercial property search
   */
  private buildCommercialSearchParams(filters: SearchFilters, options: SearchOptions): Record<string, any> {
    const params: Record<string, any> = {
      p_limit: options.limit || 50,
      p_offset: ((options.page || 1) - 1) * (options.limit || 50)
    };

    // Search query
    if (filters.searchQuery?.trim()) {
      params.p_search_query = filters.searchQuery.trim();
    }

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

    // Map action type to subtype for commercial
    if (filters.actionType && filters.actionType !== 'any') {
      if (filters.selectedSubType === 'coworking' || 
          ['private_office', 'dedicated_desk', 'hot_desk', 'meeting_room', 'conference_room', 'event_space', 'virtual_office'].includes(filters.selectedSubType)) {
        params.p_subtype = 'coworking';
      } else {
        switch (filters.actionType) {
          case 'buy':
          case 'sell':
            params.p_subtype = 'sale';
            break;
          case 'rent':
            params.p_subtype = 'rent';
            break;
        }
      }
    }

    // Property subtype for commercial
    if (filters.selectedSubType && filters.selectedSubType !== 'any') {
      const commercialSubtypeMapping: Record<string, string> = {
        'office_space': 'office_space',
        'shop': 'shop',
        'showroom': 'showroom',
        'godown_warehouse': 'godown_warehouse',
        'industrial_shed': 'industrial_shed',
        'industrial_building': 'industrial_building',
        'other_business': 'other_business',
        'private_office': 'private_office',
        'dedicated_desk': 'dedicated_desk',
        'hot_desk': 'hot_desk',
        'meeting_room': 'meeting_room',
        'conference_room': 'conference_room',
        'event_space': 'event_space',
        'virtual_office': 'virtual_office'
      };
      
      if (commercialSubtypeMapping[filters.selectedSubType]) {
        params.p_property_subtype = commercialSubtypeMapping[filters.selectedSubType];
      }
    }

    // Price range filter
    if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') {
      const priceRange = this.parsePriceRange(filters.selectedPriceRange);
      if (priceRange) {
        params.p_min_price = priceRange.min;
        params.p_max_price = priceRange.max;
      }
    }

    return params;
  }

  /**
   * Build parameters for land property search
   */
  private buildLandSearchParams(filters: SearchFilters, options: SearchOptions): Record<string, any> {
    const params: Record<string, any> = {
      p_limit: options.limit || 50,
      p_offset: ((options.page || 1) - 1) * (options.limit || 50)
    };

    // Search query
    if (filters.searchQuery?.trim()) {
      params.p_search_query = filters.searchQuery.trim();
    }

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

    // Land is typically only for sale
    params.p_subtype = 'sale';

    // Property subtype for land
    if (filters.selectedSubType && filters.selectedSubType !== 'any') {
      const landSubtypeMapping: Record<string, string> = {
        'residential_plot': 'residential_plot',
        'commercial_plot': 'commercial_plot',
        'agricultural_land': 'agricultural_land',
        'industrial_land': 'industrial_land',
        'mixed_use_land': 'mixed_use_land'
      };
      
      if (landSubtypeMapping[filters.selectedSubType]) {
        params.p_property_subtype = landSubtypeMapping[filters.selectedSubType];
      }
    }

    // Price range filter
    if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') {
      const priceRange = this.parsePriceRange(filters.selectedPriceRange);
      if (priceRange) {
        params.p_min_price = priceRange.min;
        params.p_max_price = priceRange.max;
      }
    }

    return params;
  }

  /**
   * Main search method with proper routing to property-specific functions
   */
  async search(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      console.log('🔍 Starting search with filters:', filters);
      
      const propertyType = filters.selectedPropertyType || 'residential';
      
      // Route to appropriate search function based on property type
      switch (propertyType) {
        case 'residential':
        case 'pghostel':
        case 'flatmates':
          return await this.searchResidentialProperties(filters, options);
          
        case 'commercial':
          return await this.searchCommercialProperties(filters, options);
          
        case 'land':
          return await this.searchLandProperties(filters, options);
          
        case 'any':
        default:
          // Search all property types and combine results
          return await this.searchAllPropertyTypes(filters, options);
      }
      
    } catch (error) {
      console.error('💥 Search error:', error);
      throw error;
    }
  }

  /**
   * Smart search that detects property codes and uses appropriate search method
   */
  async smartSearch(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    const query = filters.searchQuery?.trim();
    
    // If query is exactly a 6-character alphanumeric code, try code search first
    if (query && this.isPropertyCode(query)) {
      console.log('🎯 Detected 6-character property code, trying code search first:', query);
      
      try {
        const codeResults = await this.searchByCode(query, true);
        
        if (codeResults.results.length > 0) {
          console.log('✅ Found property by code, returning results');
          return codeResults;
        }
        
        console.log('ℹ️ No results by code, falling back to regular search');
      } catch (error) {
        console.log('⚠️ Code search failed, falling back to regular search:', error);
      }
    }
    
    // Fall back to regular search
    return this.search(filters, options);
  }

  /**
   * Search all property types and combine results
   */
  async searchAllPropertyTypes(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      console.log('🌐 Searching all property types');
      
      const limit = Math.floor((options.limit || 50) / 3);
      const limitedOptions = { ...options, limit };
      
      const [residentialResults, commercialResults, landResults] = await Promise.allSettled([
        this.searchResidentialProperties(filters, limitedOptions),
        this.searchCommercialProperties(filters, limitedOptions),
        this.searchLandProperties(filters, limitedOptions)
      ]);

      let combinedResults: SearchResult[] = [];
      let totalCount = 0;

      if (residentialResults.status === 'fulfilled') {
        combinedResults.push(...residentialResults.value.results);
        totalCount += residentialResults.value.totalCount;
      } else {
        console.error('❌ Residential search failed:', residentialResults.reason);
      }

      if (commercialResults.status === 'fulfilled') {
        combinedResults.push(...commercialResults.value.results);
        totalCount += commercialResults.value.totalCount;
      } else {
        console.error('❌ Commercial search failed:', commercialResults.reason);
      }

      if (landResults.status === 'fulfilled') {
        combinedResults.push(...landResults.value.results);
        totalCount += landResults.value.totalCount;
      } else {
        console.error('❌ Land search failed:', landResults.reason);
      }

      // Sort by created_at desc
      combinedResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      console.log(`✅ Combined search: ${combinedResults.length} results from all property types`);
      
      return {
        results: combinedResults,
        totalCount: totalCount,
        page: options.page || 1,
        limit: options.limit || 50
      };
      
    } catch (error) {
      console.error('❌ Error in searchAllPropertyTypes:', error);
      throw error;
    }
  }

  /**
   * Get latest properties using get_latest_properties SQL function
   */
  async getLatestProperties(limit: number = 50): Promise<SearchResponse> {
    try {
      console.log('🏠 Getting latest properties with limit:', limit);
      
      const { data, error } = await supabase.rpc('get_latest_properties', {
        p_limit: limit
      });
      
      if (error) {
        console.error('❌ get_latest_properties error:', error);
        throw new Error(`Failed to get latest properties: ${error.message}`);
      }
      
      const searchResults = data || [];
      const totalCount = searchResults[0]?.total_count || searchResults.length;
      
      const transformedResults = this.transformDatabaseResults(searchResults);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: 1,
        limit: limit
      };
      
    } catch (error) {
      console.error('💥 Latest properties error:', error);
      throw error;
    }
  }

  /**
   * Transform database results to SearchResult format
   */
  private transformDatabaseResults(dbResults: DatabaseSearchResult[]): SearchResult[] {
    return dbResults.map(dbResult => {
      // Determine transaction type from flow_type or subtype
      const transactionType = this.extractTransactionType(dbResult.flow_type, dbResult.subtype);
      
      // Format BHK
      const bhk = dbResult.bedrooms ? `${dbResult.bedrooms}bhk` : null;
      
      return {
        id: dbResult.id,
        title: dbResult.title || 'Property Listing',
        location: this.formatLocation(dbResult.city, dbResult.state),
        price: dbResult.price || 0,
        propertyType: dbResult.property_type,
        transactionType: transactionType,
        subType: dbResult.subtype || dbResult.property_type,
        bhk: bhk,
        area: dbResult.area || 0,
        ownerName: this.extractOwnerName(dbResult.owner_email),
        ownerPhone: '+91 98765 43210',
        createdAt: dbResult.created_at,
        status: dbResult.status || 'active',
        primary_image: dbResult.primary_image,
        code: dbResult.code
      } as SearchResult;
    });
  }

  /**
   * Extract transaction type from flow_type and subtype
   */
  private extractTransactionType(flowType: string, subtype: string): string {
    // Check subtype first (more reliable)
    if (subtype === 'sale' || subtype === 'buy') {
      return 'buy';
    } else if (subtype === 'rent' || subtype === 'rental') {
      return 'rent';
    } else if (subtype === 'pghostel' || subtype === 'flatmates') {
      return 'rent'; // PG and flatmates are rental-based
    }
    
    // Fallback to flow_type
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
   * Get search suggestions with property code support
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    
    try {
      const suggestions: string[] = [];
      
      // If query looks like a property code, suggest code-based search
      if (this.isPropertyCode(query)) {
        suggestions.push(`Search by code: ${query.toUpperCase()}`);
      }
      
      // Get title-based suggestions
      const { data, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .ilike('property_details->flow->>title', `%${query}%`)
        .limit(5);

      if (error) {
        console.error('Error getting suggestions:', error);
        return suggestions;
      }

      const titleSuggestions = data
        .map(item => item.property_details?.flow?.title)
        .filter(Boolean)
        .slice(0, 5);
        
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
}

// Create and export singleton instance
const searchService = new SearchService();
export { searchService };
export default searchService;