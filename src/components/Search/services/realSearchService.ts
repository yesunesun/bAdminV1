// src/components/Search/services/realSearchService.ts
// Version: 2.0.0
// Last Modified: 01-06-2025 17:30 IST
// Purpose: Real database search service using Supabase and PostgreSQL functions

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
}

export class RealSearchService {
  /**
   * Main search method using unified database query
   */
  async search(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    try {
      console.log('🔍 Starting database search with filters:', filters);
      
      // Build search parameters
      const searchParams = this.buildSearchParams(filters, options);
      
      // Call the unified search function
      const { data, error } = await supabase.rpc('search_properties_unified', searchParams);
      
      if (error) {
        console.error('❌ Database search error:', error);
        throw new Error(`Search failed: ${error.message}`);
      }

      console.log('✅ Database search completed:', {
        resultCount: data?.length || 0,
        totalCount: data?.[0]?.total_count || 0
      });

      // Transform database results to SearchResult format
      const transformedResults = this.transformDatabaseResults(data || []);
      
      return {
        results: transformedResults,
        totalCount: data?.[0]?.total_count || 0,
        page: options.page || 1,
        limit: options.limit || 50
      };
      
    } catch (error) {
      console.error('💥 Search service error:', error);
      throw error;
    }
  }

  /**
   * Build search parameters for the database function
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
      // Map location key to city name for database search
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

    // Property type filters
    if (filters.selectedPropertyType && filters.selectedPropertyType !== 'any') {
      params.p_property_type = filters.selectedPropertyType;
    }

    // Subtype filter (maps to transaction type or specific subtype)
    if (filters.selectedSubType && filters.selectedSubType !== 'any') {
      params.p_subtype = filters.selectedSubType;
    }

    // Transaction type mapping to subtype
    if (filters.transactionType && filters.transactionType !== 'any') {
      params.p_subtype = filters.transactionType; // 'buy' or 'rent'
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

    console.log('🔧 Built search parameters:', params);
    return params;
  }

  /**
   * Transform database results to SearchResult format
   */
  private transformDatabaseResults(dbResults: DatabaseSearchResult[]): SearchResult[] {
    return dbResults.map(dbResult => {
      // Determine transaction type from flow_type
      const transactionType = this.extractTransactionType(dbResult.flow_type);
      
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
        ownerPhone: '+91 98765 43210', // Default phone (not in DB result)
        createdAt: dbResult.created_at,
        status: dbResult.status || 'active'
      } as SearchResult;
    });
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
    
    // Extract name from email (before @)
    const namePart = email.split('@')[0];
    
    // Convert to proper name format
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
      // Search in property titles for suggestions
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
    // For now, return static popular searches
    // In future, this could be based on search analytics
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
    // Future implementation: save to user search history table
    console.log('📝 Search saved for future implementation:', filters);
  }
}

// Create and export singleton instance
const realSearchService = new RealSearchService();
export { realSearchService as searchService };
export default realSearchService;