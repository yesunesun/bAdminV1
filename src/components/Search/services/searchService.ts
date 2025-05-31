// src/components/Search/services/searchService.ts
// Version: 10.1.0
// Last Modified: 02-06-2025 10:15 IST
// Purpose: Updated property code detection to only trigger for 6-character alphanumeric codes

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

// UPDATED: Database result interfaces with primary_image and code fields
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
  code?: string | null; // ADDED: Property code from meta.code
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
  code?: string | null; // ADDED: Property code from meta.code
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
  code?: string | null; // ADDED: Property code from meta.code
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
        foundProperty: searchResults.length > 0 ? searchResults[0].title : 'None'
      });

      // Transform results using the same transformation logic
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
        firstResultHasPrimaryImage: searchResults[0]?.primary_image ? 'YES' : 'NO'
      });

      // Transform results using the same transformation logic
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
   * Check if property subtype matches selected filter
   */
  private doesPropertyMatchSubtype(property: DatabaseSearchResult, selectedSubtype: string): boolean {
    if (!selectedSubtype || selectedSubtype === 'any') {
      return true; // No subtype filter applied
    }

    // For PG/Hostel and Flatmates, the flow type itself is the filter
    if (selectedSubtype === 'pghostel' || selectedSubtype === 'flatmates') {
      return property.flow_type.includes(selectedSubtype);
    }

    // For regular properties, we now rely on the database-level filtering
    return true;
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

    // For regular properties, just use the base flow type
    if (transactionType && transactionType !== 'any') {
      const mappedFlowType = this.mapSubtypeToFlowType(propertyType, 'default', transactionType);
      console.log('✅ Using transaction type mapping:', transactionType, '->', mappedFlowType);
      return mappedFlowType;
    }

    console.log('ℹ️ No specific subtype filter applied');
    return null;
  }

  /**
   * Main search method with updated database function calls
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
        propertyType: propertyType,
        firstResultHasPrimaryImage: searchResults[0]?.primary_image ? 'YES' : 'NO'
      });

      // Transform results
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
   * Call the appropriate property-specific search function with updated parameters
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
   * Search all property types and combine results with updated parameters
   */
  private async searchAllPropertyTypes(filters: SearchFilters, options: SearchOptions): Promise<DatabaseSearchResult[]> {
    const searchParams = this.buildSearchParams(filters, options);
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
      console.error('Error in searchAllPropertyTypes:', error);
      throw error;
    }
  }

  /**
   * Build search parameters for database functions with p_property_subtype
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

    // Add property subtype parameter for database-level filtering
    if (filters.selectedSubType && filters.selectedSubType !== 'any') {
      const propertySubtype = this.getPropertySubtype(filters.selectedSubType);
      if (propertySubtype) {
        params.p_property_subtype = propertySubtype;
        console.log('🔍 Database property subtype parameter:', propertySubtype);
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
   * Transform database results to SearchResult format with primary_image and code
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
      
      console.log(`🖼️ Transforming property ${dbResult.id}: primary_image = ${primaryImage}, code = ${propertyCode}`);
      
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
        code: propertyCode
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