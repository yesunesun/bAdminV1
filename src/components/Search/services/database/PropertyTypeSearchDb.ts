// src/components/Search/services/database/PropertyTypeSearchDb.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 16:30 IST
// Purpose: Modular property type-specific database search classes

import { supabase } from '@/lib/supabase';
import { SearchFilters, SearchOptions, DatabaseSearchResult, DatabaseCallResult, SearchParams } from '../searchService/types/searchService.types';
import { buildSearchParams } from '../searchService/utils/paramUtils';

/**
 * Base class for property type searches with common functionality
 */
abstract class BasePropertySearchDb {
  protected abstract getPropertyType(): string;
  
  /**
   * Log search parameters for debugging
   */
  protected logSearchParams(params: SearchParams): void {
    console.log(`🔍 ${this.getPropertyType()} Database: Search params:`, params);
  }

  /**
   * Handle database errors consistently
   */
  protected handleDatabaseError(error: any, operation: string): never {
    console.error(`❌ ${this.getPropertyType()} Database Error in ${operation}:`, error);
    throw new Error(`Failed to ${operation} for ${this.getPropertyType()} properties: ${error.message}`);
  }

  /**
   * Validate search results
   */
  protected validateResults(data: any): DatabaseSearchResult[] {
    if (!data || !Array.isArray(data)) {
      console.warn(`⚠️ ${this.getPropertyType()}: No valid results returned`);
      return [];
    }
    console.log(`✅ ${this.getPropertyType()}: Found ${data.length} results`);
    return data;
  }
}

/**
 * Residential property search database class
 */
export class ResidentialSearchDb extends BasePropertySearchDb {
  protected getPropertyType(): string {
    return 'Residential';
  }

  /**
   * Search residential properties using search_residential_properties SQL function
   */
  async search(filters: SearchFilters, options: SearchOptions): Promise<DatabaseCallResult> {
    const searchParams = buildSearchParams(filters, options);
    this.logSearchParams(searchParams);

    try {
      const result = await supabase.rpc('search_residential_properties', {
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

      if (result.error) {
        this.handleDatabaseError(result.error, 'search residential properties');
      }

      return {
        data: this.validateResults(result.data),
        error: result.error
      };
    } catch (error) {
      this.handleDatabaseError(error, 'search residential properties');
    }
  }

  /**
   * Search with custom limit for mixed searches
   */
  async searchWithLimit(filters: SearchFilters, limit: number): Promise<DatabaseSearchResult[]> {
    const searchParams = buildSearchParams(filters, { ...filters, limit, page: 1 });
    
    console.log(`🏠 Residential Database: Custom limit search with limit: ${limit}`);

    try {
      const { data, error } = await supabase.rpc('search_residential_properties', {
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
      });

      if (error) {
        this.handleDatabaseError(error, 'search residential properties with custom limit');
      }

      return this.validateResults(data);
    } catch (error) {
      this.handleDatabaseError(error, 'search residential properties with custom limit');
    }
  }

  /**
   * SPECIALIZED SEARCH METHODS FOR FLATMATES AND PG/HOSTEL
   */

  /**
   * Search flatmates properties with specialized filters
   */
  async searchFlatmates(options: {
    city?: string;
    genderPreference?: 'boys' | 'girls' | 'family';
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    keywords?: string;
    limit?: number;
    offset?: number;
  }): Promise<DatabaseSearchResult[]> {
    console.log('🏠 Residential Database: Searching flatmates with options:', options);

    try {
      const { data, error } = await supabase.rpc('search_residential_properties', {
        p_subtype: 'flatmates', // Fixed subtype for flatmates
        p_property_subtype: options.genderPreference || null,
        p_search_query: options.keywords || null,
        p_city: options.city || null,
        p_state: options.city ? 'Telangana' : null,
        p_min_price: options.minPrice || null,
        p_max_price: options.maxPrice || null,
        p_bedrooms: options.bedrooms || null,
        p_bathrooms: null,
        p_area_min: null,
        p_area_max: null,
        p_limit: options.limit || 20,
        p_offset: options.offset || 0
      });

      if (error) {
        this.handleDatabaseError(error, 'search flatmates properties');
      }

      const results = this.validateResults(data);
      console.log(`✅ Flatmates search: Found ${results.length} properties`);
      return results;
    } catch (error) {
      this.handleDatabaseError(error, 'search flatmates properties');
    }
  }

  /**
   * Search PG/Hostel properties with specialized filters
   */
  async searchPGHostel(options: {
    city?: string;
    genderPreference?: 'boys' | 'girls' | 'family' | 'student' | 'executive';
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[]; // ['food', 'wifi', 'AC', 'laundry', 'security', 'parking']
    accommodationType?: 'single' | 'double' | 'triple' | 'dormitory';
    limit?: number;
    offset?: number;
  }): Promise<DatabaseSearchResult[]> {
    console.log('🏨 Residential Database: Searching PG/Hostel with options:', options);

    try {
      // Build search query from amenities and accommodation type
      let searchQuery = '';
      if (options.amenities && options.amenities.length > 0) {
        searchQuery += options.amenities.join(' ');
      }
      if (options.accommodationType) {
        searchQuery += ` ${options.accommodationType} sharing`;
      }

      const { data, error } = await supabase.rpc('search_residential_properties', {
        p_subtype: 'pghostel', // Fixed subtype for PG/Hostel
        p_property_subtype: options.genderPreference || null,
        p_search_query: searchQuery.trim() || null,
        p_city: options.city || null,
        p_state: options.city ? 'Telangana' : null,
        p_min_price: options.minPrice || null,
        p_max_price: options.maxPrice || null,
        p_bedrooms: null, // PG rooms don't typically use bedroom count
        p_bathrooms: null,
        p_area_min: null,
        p_area_max: null,
        p_limit: options.limit || 20,
        p_offset: options.offset || 0
      });

      if (error) {
        this.handleDatabaseError(error, 'search PG/Hostel properties');
      }

      const results = this.validateResults(data);
      console.log(`✅ PG/Hostel search: Found ${results.length} properties`);
      return results;
    } catch (error) {
      this.handleDatabaseError(error, 'search PG/Hostel properties');
    }
  }

  /**
   * Search budget-friendly student accommodation (PG/Hostel under ₹10,000)
   */
  async searchStudentAccommodation(options: {
    city?: string;
    gender?: 'boys' | 'girls';
    maxBudget?: number;
    nearCollege?: boolean;
    limit?: number;
  }): Promise<DatabaseSearchResult[]> {
    console.log('🎓 Residential Database: Searching student accommodation with options:', options);

    const searchKeywords = [];
    if (options.nearCollege) {
      searchKeywords.push('college', 'university', 'student');
    }

    return await this.searchPGHostel({
      city: options.city,
      genderPreference: options.gender || 'student',
      maxPrice: options.maxBudget || 10000,
      amenities: ['wifi'], // Students typically need internet
      limit: options.limit || 15
    });
  }

  /**
   * Search professional accommodation (working professionals)
   */
  async searchProfessionalAccommodation(options: {
    city?: string;
    type: 'flatmates' | 'pghostel';
    gender?: 'boys' | 'girls' | 'family';
    minPrice?: number;
    maxPrice?: number;
    furnished?: boolean;
    limit?: number;
  }): Promise<DatabaseSearchResult[]> {
    console.log('💼 Residential Database: Searching professional accommodation with options:', options);

    const searchKeywords = ['working professional'];
    if (options.furnished) {
      searchKeywords.push('furnished');
    }

    if (options.type === 'flatmates') {
      return await this.searchFlatmates({
        city: options.city,
        genderPreference: options.gender,
        minPrice: options.minPrice || 12000,
        maxPrice: options.maxPrice || 30000,
        keywords: searchKeywords.join(' '),
        limit: options.limit || 20
      });
    } else {
      return await this.searchPGHostel({
        city: options.city,
        genderPreference: options.gender || 'executive',
        minPrice: options.minPrice || 15000,
        maxPrice: options.maxPrice || 35000,
        amenities: ['wifi', 'food'],
        limit: options.limit || 20
      });
    }
  }
}

/**
 * Commercial property search database class
 */
export class CommercialSearchDb extends BasePropertySearchDb {
  protected getPropertyType(): string {
    return 'Commercial';
  }

  /**
   * Search commercial properties using search_commercial_properties SQL function
   */
  async search(filters: SearchFilters, options: SearchOptions): Promise<DatabaseCallResult> {
    const searchParams = buildSearchParams(filters, options);
    this.logSearchParams(searchParams);

    try {
      const result = await supabase.rpc('search_commercial_properties', {
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

      if (result.error) {
        this.handleDatabaseError(result.error, 'search commercial properties');
      }

      return {
        data: this.validateResults(result.data),
        error: result.error
      };
    } catch (error) {
      this.handleDatabaseError(error, 'search commercial properties');
    }
  }

  /**
   * Search with custom limit for mixed searches
   */
  async searchWithLimit(filters: SearchFilters, limit: number): Promise<DatabaseSearchResult[]> {
    const searchParams = buildSearchParams(filters, { ...filters, limit, page: 1 });
    
    console.log(`🏢 Commercial Database: Custom limit search with limit: ${limit}`);

    try {
      const { data, error } = await supabase.rpc('search_commercial_properties', {
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
      });

      if (error) {
        this.handleDatabaseError(error, 'search commercial properties with custom limit');
      }

      return this.validateResults(data);
    } catch (error) {
      this.handleDatabaseError(error, 'search commercial properties with custom limit');
    }
  }
}

/**
 * Land property search database class
 */
export class LandSearchDb extends BasePropertySearchDb {
  protected getPropertyType(): string {
    return 'Land';
  }

  /**
   * Search land properties using search_land_properties SQL function
   */
  async search(filters: SearchFilters, options: SearchOptions): Promise<DatabaseCallResult> {
    const searchParams = buildSearchParams(filters, options);
    this.logSearchParams(searchParams);

    try {
      const result = await supabase.rpc('search_land_properties', {
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

      if (result.error) {
        this.handleDatabaseError(result.error, 'search land properties');
      }

      return {
        data: this.validateResults(result.data),
        error: result.error
      };
    } catch (error) {
      this.handleDatabaseError(error, 'search land properties');
    }
  }

  /**
   * Search with custom limit for mixed searches
   */
  async searchWithLimit(filters: SearchFilters, limit: number): Promise<DatabaseSearchResult[]> {
    const searchParams = buildSearchParams(filters, { ...filters, limit, page: 1 });
    
    console.log(`🌍 Land Database: Custom limit search with limit: ${limit}`);

    try {
      const { data, error } = await supabase.rpc('search_land_properties', {
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
      });

      if (error) {
        this.handleDatabaseError(error, 'search land properties with custom limit');
      }

      return this.validateResults(data);
    } catch (error) {
      this.handleDatabaseError(error, 'search land properties with custom limit');
    }
  }
}

/**
 * Factory class to get appropriate property search database instance
 */
export class PropertyTypeSearchDbFactory {
  private static instances: Map<string, BasePropertySearchDb> = new Map();

  /**
   * Get property search database instance for given property type
   */
  static getInstance(propertyType: string): BasePropertySearchDb {
    if (!this.instances.has(propertyType)) {
      switch (propertyType) {
        case 'residential':
          this.instances.set(propertyType, new ResidentialSearchDb());
          break;
        case 'commercial':
          this.instances.set(propertyType, new CommercialSearchDb());
          break;
        case 'land':
          this.instances.set(propertyType, new LandSearchDb());
          break;
        default:
          console.warn(`⚠️ Unknown property type: ${propertyType}, defaulting to residential`);
          this.instances.set(propertyType, new ResidentialSearchDb());
      }
    }

    return this.instances.get(propertyType)!;
  }

  /**
   * Get all property type search instances
   */
  static getAllInstances(): { residential: ResidentialSearchDb; commercial: CommercialSearchDb; land: LandSearchDb } {
    return {
      residential: this.getInstance('residential') as ResidentialSearchDb,
      commercial: this.getInstance('commercial') as CommercialSearchDb,
      land: this.getInstance('land') as LandSearchDb
    };
  }
}

/**
 * Convenience exports for individual classes
 */
export const residentialSearchDb = new ResidentialSearchDb();
export const commercialSearchDb = new CommercialSearchDb();
export const landSearchDb = new LandSearchDb();