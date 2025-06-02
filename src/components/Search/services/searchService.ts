// src/components/Search/services/searchService.ts
// Version: 10.2.0
// Last Modified: 02-06-2025 15:45 IST
// Purpose: Fixed Buy/Rent filtering by properly mapping transactionType to database flow types

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
}

// Union type for all database results
type DatabaseSearchResult = ResidentialSearchResult | CommercialSearchResult | LandSearchResult;

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
   * DEPRECATED: Old mapping function - replaced by getFlowTypeFromTransactionAndProperty
   */
  private mapSubtypeToFlowType(propertyType: string, subtype: string, transactionType: string): string | null {
    console.log('⚠️ Using deprecated mapSubtypeToFlowType - should use getFlowTypeFromTransactionAndProperty');
    return this.getFlowTypeFromTransactionAndProperty(transactionType, propertyType, subtype);
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
   * SIMPLIFIED: Get effective subtype - just pass through the special cases
   */
  private getEffectiveSubtype(filters: SearchFilters): string | null {
    // Only handle special subtypes, let the database handle transaction type filtering
    if (filters.selectedSubType === 'pghostel') {
      return 'pghostel';
    } else if (filters.selectedSubType === 'flatmates') {
      return 'flatmates';
    }
    
    // For everything else, return null and let buildSearchParams handle the transaction type
    return null;
  }

  /**
   * Main search method with FIXED transaction type filtering
   */
  async searchLandProperties(filters: SearchFilters, options: SearchOptions = {}): Promise<SearchResponse> {
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
      console.error('💥 Land search error:', error);
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
   * SIMPLIFIED: Search all property types with correct p_subtype parameter
   */
  private async searchAllPropertyTypes(filters: SearchFilters, options: SearchOptions): Promise<DatabaseSearchResult[]> {
    const searchParams = this.buildSearchParams(filters, options);
    const limit = Math.floor((searchParams.p_limit || 50) / 3);
    
    console.log('🌐 Searching all property types with params:', { p_subtype: searchParams.p_subtype });
    
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
   * FIXED: Build search parameters with correct p_subtype mapping for database functions
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
        console.log('💰 Land price range filter applied:', priceRange);
      }
    }

    // Area range filter (if we add area filter support in the future)
    // Land properties commonly use area filters
    // TODO: Add area filter support to SearchFilters interface
    /*
    if (filters.selectedAreaRange && filters.selectedAreaRange !== 'any') {
      const areaRange = this.parseAreaRange(filters.selectedAreaRange);
      if (areaRange) {
        params.p_area_min = areaRange.min;
        params.p_area_max = areaRange.max;
        console.log('📐 Land area range filter applied:', areaRange);
      }
    }
    */

    console.log('🔧 Final land search parameters:', params);
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
      
      console.log(`🖼️ Transforming property ${dbResult.id}: flow_type = ${dbResult.flow_type}, transaction = ${transactionType}, primary_image = ${primaryImage}, code = ${propertyCode}`);
      
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