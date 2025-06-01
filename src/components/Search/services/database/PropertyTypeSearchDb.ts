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