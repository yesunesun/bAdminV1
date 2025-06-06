// src/components/Search/services/searchService.ts
// Version: 11.0.0
// Last Modified: 07-06-2025 15:50 IST
// Purpose: FIXED coordinate propagation - database latitude/longitude now flow to SearchResult objects for map markers

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

// UPDATED: Database result interfaces with primary_image, code, and coordinate fields
interface ResidentialSearchResult {
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
  latitude?: number; // NEW: Coordinate from database
  longitude?: number; // NEW: Coordinate from database
}

interface CommercialSearchResult {
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
  area_unit: string;
  primary_image: string | null;
  code?: string | null;
  latitude?: number; // NEW: Coordinate from database
  longitude?: number; // NEW: Coordinate from database
}

interface LandSearchResult {
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
  area_unit: string;
  land_type: string;
  primary_image: string | null;
  code?: string | null;
  latitude?: number; // NEW: Coordinate from database
  longitude?: number; // NEW: Coordinate from database
}

// Union type for all database results
type DatabaseSearchResult = ResidentialSearchResult | CommercialSearchResult | LandSearchResult;

export class SearchService {
  /**
   * Search property by code using search_property_by_code SQL function
   */
  async searchByCode(code: string, useInsensitiveSearch: boolean = true): Promise<SearchResponse> {
    const searchId = searchPerformanceMonitor.start({} as SearchFilters);
    
    try {
      console.log('🔍 Searching property by code:', code, 'insensitive:', useInsensitiveSearch);
      
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
      
      const searchResults = data || [];
      const totalCount = searchResults[0]?.total_count || searchResults.length;
      
      console.log('📊 Property code search results:', {
        code: trimmedCode,
        resultCount: searchResults.length,
        totalCount: totalCount,
        foundProperty: searchResults.length > 0 ? searchResults[0].title : 'None',
        hasCoordinates: searchResults.length > 0 && searchResults[0].latitude && searchResults[0].longitude ? 'YES' : 'NO'
      });

      // Transform results using the updated transformation logic
      let transformedResults = this.transformDatabaseResults(searchResults);
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      const duration = searchPerformanceMonitor.end(transformedResults.length, totalCount);
      logSearchResults(transformedResults, totalCount, duration);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: 1,
        limit: 50
      };
      
    } catch (error) {
      searchPerformanceMonitor.error(error);
      logSearchError(error, {} as SearchFilters, {});
      throw error;
    }
  }

  /**
   * UPDATED: Check if a search query is exactly a 6-character alphanumeric property code
   * Property codes must be exactly 6 characters: alphanumeric only (e.g., RX0AD8, AB1234, 123ABC)
   */
  isPropertyCode(query: string): boolean {
    if (!query) {
      return false;
    }
    
    const trimmedQuery = query.trim();
    
    // Must be exactly 6 characters
    if (trimmedQuery.length !== 6) {
      console.log(`🔍 Query "${trimmedQuery}" is ${trimmedQuery.length} chars, not 6 - not a property code`);
      return false;
    }
    
    // Must be alphanumeric only (letters and numbers, no special characters)
    const alphanumericPattern = /^[A-Za-z0-9]{6}$/;
    const isValidCode = alphanumericPattern.test(trimmedQuery);
    
    console.log(`🔍 Query "${trimmedQuery}" alphanumeric check: ${isValidCode ? 'PASS' : 'FAIL'} - ${isValidCode ? 'IS' : 'NOT'} a property code`);
    
    return isValidCode;
  }

  /**
   * ENHANCED: Smart search that detects if query is exactly a 6-character property code
   * If it matches the criteria, search by code first, then fall back to regular search
   */
  async smartSearch(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    const query = filters.searchQuery?.trim();
    
    // If query is exactly a 6-character alphanumeric code, try code search first
    if (query && this.isPropertyCode(query)) {
      console.log('🎯 Detected 6-character property code, trying code search first:', query);
      
      try {
        const codeResults = await this.searchByCode(query, true);
        
        // If we found results, return them
        if (codeResults.results.length > 0) {
          console.log('✅ Found property by code, returning results');
          return codeResults;
        }
        
        console.log('ℹ️ No results by code, falling back to regular search');
      } catch (error) {
        console.log('⚠️ Code search failed, falling back to regular search:', error);
      }
    } else if (query) {
      console.log(`🔍 Query "${query}" does not match 6-character property code pattern, using regular search`);
    }
    
    // Fall back to regular search
    return this.search(filters, options);
  }

  /**
   * Get latest properties using get_latest_properties SQL function
   */
  async getLatestProperties(limit: number = 50): Promise<SearchResponse> {
    const searchId = searchPerformanceMonitor.start({} as SearchFilters);
    
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
      
      console.log('📊 Latest properties results:', {
        resultCount: searchResults.length,
        totalCount: totalCount,
        firstResultHasPrimaryImage: searchResults[0]?.primary_image ? 'YES' : 'NO',
        firstResultHasCoordinates: searchResults[0]?.latitude && searchResults[0]?.longitude ? 'YES' : 'NO'
      });

      // Transform results using the updated transformation logic
      let transformedResults = this.transformDatabaseResults(searchResults);
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      const duration = searchPerformanceMonitor.end(transformedResults.length, totalCount);
      logSearchResults(transformedResults, totalCount, duration);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
        page: 1,
        limit: limit
      };
      
    } catch (error) {
      searchPerformanceMonitor.error(error);
      logSearchError(error, {} as SearchFilters, {});
      throw error;
    }
  }

  /**
   * FIXED: Map transaction type and property type to specific database flow types
   * This ensures Buy shows only Sale properties and Rent shows only Rental properties
   */
  private getFlowTypeFromTransactionAndProperty(transactionType: string | null, propertyType: string, subType?: string): string | null {
    console.log('🔄 Mapping transaction and property to flow type:', { transactionType, propertyType, subType });
    
    // Handle special subtypes first
    if (subType === 'pghostel' || subType === 'pg') {
      console.log('✅ PG/Hostel subtype → residential_pghostel');
      return 'residential_pghostel';
    }
    
    if (subType === 'flatmates') {
      console.log('✅ Flatmates subtype → residential_flatmates');
      return 'residential_flatmates';
    }
    
    if (subType === 'coworking') {
      console.log('✅ Coworking subtype → commercial_coworking');
      return 'commercial_coworking';
    }
    
    // If no transaction type specified, return null to search all
    if (!transactionType) {
      console.log('ℹ️ No transaction type specified → search all flow types');
      return null;
    }
    
    // Map transaction type + property type to specific flow types
    if (propertyType === 'residential' || !propertyType || propertyType === 'any') {
      if (transactionType === 'buy') {
        console.log('✅ Buy + Residential → residential_sale');
        return 'residential_sale';
      } else if (transactionType === 'rent') {
        console.log('✅ Rent + Residential → residential_rent');
        return 'residential_rent';
      }
    }
    
    if (propertyType === 'commercial') {
      if (transactionType === 'buy') {
        console.log('✅ Buy + Commercial → commercial_sale');
        return 'commercial_sale';
      } else if (transactionType === 'rent') {
        console.log('✅ Rent + Commercial → commercial_rent');
        return 'commercial_rent';
      }
    }
    
    if (propertyType === 'land') {
      // Land is always for sale (buy)
      console.log('✅ Land property → land_sale');
      return 'land_sale';
    }
    
    // Default fallback
    console.log('⚠️ No specific mapping found, using default');
    return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
  }

  /**
   * Get property subtype for database filtering
   */
  private getPropertySubtype(subtype: string): string | null {
    // Map frontend subtypes to database property types
    const subtypeMapping: Record<string, string> = {
      // Residential subtypes
      'apartment': 'apartment',
      'villa': 'villa',
      'house': 'independent_house',
      'studio': 'studio',
      'duplex': 'duplex',
      'penthouse': 'penthouse',
      'farmhouse': 'farmhouse',
      'independent': 'independent_house',
      
      // Commercial subtypes
      'office_space': 'office_space',
      'shop': 'shop',
      'showroom': 'showroom',
      'godown_warehouse': 'godown_warehouse',
      'industrial_shed': 'industrial_shed',
      'industrial_building': 'industrial_building',
      'other_business': 'other_business',
      'coworking': 'coworking',
      
      // Land subtypes
      'residential_plot': 'residential_plot',
      'commercial_plot': 'commercial_plot',
      'agricultural_land': 'agricultural_land',
      'industrial_land': 'industrial_land'
    };

    return subtypeMapping[subtype] || null;
  }

  /**
   * Main search method with FIXED transaction type filtering
   */
  async search(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
    const searchId = searchPerformanceMonitor.start(filters);
    
    try {
      console.log('🔍 Starting search with filters:', filters);
      console.log('🔧 Search options:', options);
      
      const propertyType = filters.selectedPropertyType || 'residential';
      const transactionType = (filters as any).transactionType; // Get the mapped transaction type
      
      console.log('💡 Transaction type for filtering:', transactionType);
      
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
        propertyType: propertyType,
        transactionType: transactionType,
        firstResultFlowType: searchResults[0]?.flow_type,
        firstResultHasPrimaryImage: searchResults[0]?.primary_image ? 'YES' : 'NO',
        firstResultHasCoordinates: searchResults[0]?.latitude && searchResults[0]?.longitude ? 'YES' : 'NO'
      });

      // Transform results using the updated transformation logic
      let transformedResults = this.transformDatabaseResults(searchResults);
      transformedResults = SearchFallbackService.enhanceSearchResults(transformedResults);
      
      const duration = searchPerformanceMonitor.end(transformedResults.length, totalCount);
      logSearchResults(transformedResults, totalCount, duration);
      
      return {
        results: transformedResults,
        totalCount: totalCount,
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
   * FIXED: Call the appropriate property-specific search function with transaction type filtering
   */
  private async callPropertySpecificSearch(
    propertyType: string, 
    filters: SearchFilters, 
    options: SearchOptions
  ) {
    const searchParams = this.buildSearchParams(filters, options);
    
    console.log('📡 Calling database search with params:', searchParams);
    
    switch (propertyType) {
      case 'residential':
        console.log('🏠 Calling search_residential_properties with params:', searchParams);
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
        console.log('🏢 Calling search_commercial_properties with params:', searchParams);
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
        console.log('🌍 Calling search_land_properties with params:', searchParams);
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
        console.log('🏠 Defaulting to search_residential_properties');
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
  }

  /**
   * FIXED: Search all property types with proper p_subtype filtering for Buy/Rent
   * This method now ensures that when "Rent + Any" is selected, only rental properties are returned
   */
  private async searchAllPropertyTypes(filters: SearchFilters, options: SearchOptions): Promise<DatabaseSearchResult[]> {
    const searchParams = this.buildSearchParams(filters, options);
    const limit = Math.floor((searchParams.p_limit || 50) / 3);
    
    console.log('🌐 Searching all property types with CRITICAL p_subtype filter:', { 
      p_subtype: searchParams.p_subtype,
      note: 'This p_subtype will be passed to ALL property searches to ensure Buy/Rent filtering works'
    });
    
    try {
      // FIXED: Pass p_subtype to all three searches to ensure Buy/Rent filtering works for "Any" property type
      const [residentialResult, commercialResult, landResult] = await Promise.allSettled([
        supabase.rpc('search_residential_properties', {
          p_subtype: searchParams.p_subtype, // CRITICAL: Pass rent/sale filter
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
          p_subtype: searchParams.p_subtype, // CRITICAL: Pass rent/sale filter
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
        // CONDITIONAL: Only search land properties if Buy is selected (land is only for sale)
        ...(searchParams.p_subtype === 'sale' || !searchParams.p_subtype ? [
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
        ] : [])
      ]);

      let combinedResults: DatabaseSearchResult[] = [];
      let totalCount = 0;

      if (residentialResult.status === 'fulfilled' && residentialResult.value.data) {
        const resData = residentialResult.value.data;
        combinedResults.push(...resData);
        totalCount += resData[0]?.total_count || 0;
        console.log(`🏠 Residential results: ${resData.length} (with p_subtype: ${searchParams.p_subtype})`);
      }

      if (commercialResult.status === 'fulfilled' && commercialResult.value.data) {
        const comData = commercialResult.value.data;
        combinedResults.push(...comData);
        totalCount += comData[0]?.total_count || 0;
        console.log(`🏢 Commercial results: ${comData.length} (with p_subtype: ${searchParams.p_subtype})`);
      }

      // Only process land results if they were searched (Buy or Any)
      if (landResult && landResult.status === 'fulfilled' && landResult.value.data) {
        const landData = landResult.value.data;
        combinedResults.push(...landData);
        totalCount += landData[0]?.total_count || 0;
        console.log(`🌍 Land results: ${landData.length} (only searched for Buy/Any)`);
      } else if (searchParams.p_subtype === 'rent') {
        console.log(`🌍 Land results: 0 (skipped for Rent filter - land is only for sale)`);
      }

      // Sort by created_at desc
      combinedResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Set total count on first result for consistency
      if (combinedResults.length > 0) {
        combinedResults[0].total_count = totalCount;
      }

      console.log(`📊 FINAL searchAllPropertyTypes results: ${combinedResults.length} total properties (p_subtype: ${searchParams.p_subtype})`);
      
      return combinedResults;
      
    } catch (error) {
      console.error('Error in searchAllPropertyTypes:', error);
      throw error;
    }
  }

  /**
   * FIXED: Build search parameters with correct p_subtype mapping for database functions
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

    // FIXED: Set p_subtype based on transactionType and special property types
    const transactionType = (filters as any).transactionType;
    
    // Handle special property types first (they override transaction type)
    if (filters.selectedPropertyType === 'pghostel' || filters.selectedSubType === 'pghostel') {
      params.p_subtype = 'pghostel';
      console.log('✅ PG/Hostel property → p_subtype = "pghostel"');
    } else if (filters.selectedPropertyType === 'flatmates' || filters.selectedSubType === 'flatmates') {
      params.p_subtype = 'flatmates';
      console.log('✅ Flatmates property → p_subtype = "flatmates"');
    } else if (transactionType) {
      // Handle regular Buy/Rent for other property types
      if (transactionType === 'buy') {
        params.p_subtype = 'sale';  // Buy = Sale properties
        console.log('✅ Buy filter → p_subtype = "sale"');
      } else if (transactionType === 'rent') {
        params.p_subtype = 'rent';  // Rent = Rental properties
        console.log('✅ Rent filter → p_subtype = "rent"');
      }
      // If transactionType is null (Any), don't set p_subtype to search all
    }

    // Handle special subtypes that override transaction type (legacy support)
    if (filters.selectedSubType && filters.selectedSubType !== 'any') {
      if (filters.selectedSubType === 'pghostel') {
        params.p_subtype = 'pghostel';
        console.log('✅ PG/Hostel subtype → p_subtype = "pghostel"');
      } else if (filters.selectedSubType === 'flatmates') {
        params.p_subtype = 'flatmates';
        console.log('✅ Flatmates subtype → p_subtype = "flatmates"');
      }
    }

    // Add property subtype parameter for more specific filtering
    if (filters.selectedSubType && filters.selectedSubType !== 'any') {
      const propertySubtype = this.getPropertySubtype(filters.selectedSubType);
      if (propertySubtype) {
        params.p_property_subtype = propertySubtype;
        console.log('🔍 Property subtype parameter:', propertySubtype);
      }
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
   * CRITICAL FIX: Transform database results to SearchResult format with coordinate propagation
   */
  private transformDatabaseResults(dbResults: DatabaseSearchResult[]): SearchResult[] {
    return dbResults.map(dbResult => {
      const transactionType = this.extractTransactionType(dbResult.flow_type);
      const displaySubtype = this.extractDisplaySubtype(dbResult.flow_type, dbResult.subtype, dbResult.title);
      
      // Type-safe property extraction
      const bedrooms = 'bedrooms' in dbResult ? dbResult.bedrooms : null;
      const bathrooms = 'bathrooms' in dbResult ? dbResult.bathrooms : null;
      const bhk = bedrooms && bedrooms > 0 ? `${bedrooms}bhk` : null;
      
      const price = dbResult.price && dbResult.price > 0 ? dbResult.price : 0;
      const area = dbResult.area && dbResult.area > 0 ? dbResult.area : 0;
      
      // Extract primary_image from database result
      const primaryImage = dbResult.primary_image || null;
      
      // Extract property code from database result
      const propertyCode = dbResult.code || null;
      
      // CRITICAL FIX: Extract and propagate coordinate data from database
      const latitude = dbResult.latitude || null;
      const longitude = dbResult.longitude || null;
      
      console.log(`🗺️ Transforming property ${dbResult.id}: flow_type = ${dbResult.flow_type}, transaction = ${transactionType}, coordinates = ${latitude && longitude ? `(${latitude}, ${longitude})` : 'NONE'}, primary_image = ${primaryImage}, code = ${propertyCode}`);
      
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
        status: dbResult.status || 'active',
        primary_image: primaryImage,
        code: propertyCode,
        // CRITICAL FIX: Include coordinate data for map marker rendering
        latitude: latitude,
        longitude: longitude
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
      return 'apartment';
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
   * UPDATED: Get search suggestions with 6-character property code support
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];
    
    try {
      const suggestions: string[] = [];
      
      // If query looks like a 6-character property code, suggest code-based search
      if (this.isPropertyCode(query)) {
        suggestions.push(`Search by code: ${query.toUpperCase()}`);
      }
      
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
        
        suggestions.push(...titleSuggestions);
      }

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