// src/components/Search/services/btServiceClient.ts
// Version: 3.0.0
// Last Modified: 2025-07-15
// Purpose: btService v3 API client for search functionality

import { SearchFilters, SearchResult, SearchResponse, SearchPaginationOptions } from '../types/search.types';

export interface BtServiceConfig {
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class BtServiceClient {
  private baseUrl: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: BtServiceConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 5000; // 5 seconds - fast timeout for better UX
    this.retryAttempts = config.retryAttempts || 1; // Single attempt to fail fast
    this.retryDelay = config.retryDelay || 1000; // 1 second delay
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`🌐 btService API Request [Attempt ${attempt}]:`, {
        url,
        method: options.method || 'GET',
        body: options.body ? JSON.parse(options.body as string) : undefined
      });

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Accept-Encoding': 'identity', // Disable compression to fix ERR_CONTENT_DECODING_FAILED
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();
      
      console.log(`✅ btService API Response [Attempt ${attempt}]:`, {
        status: response.status,
        success: apiResponse.success,
        hasResults: apiResponse.data?.results ? apiResponse.data.results.length : 'N/A'
      });

      // Extract data from btService response format
      if (apiResponse.success && apiResponse.data) {
        // Handle v3 endpoints that return raw arrays vs structured responses
        if (Array.isArray(apiResponse.data)) {
          // v3 endpoints return raw arrays - transform to expected format
          const rawResults = apiResponse.data;
          const totalCount = rawResults.length > 0 ? rawResults[0].total_count || rawResults.length : 0;
          
          // Transform raw data to SearchResult format
          const transformedResults = rawResults.map((item: any) => ({
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
            code: item.code || null,
            latitude: item.latitude,
            longitude: item.longitude
          }));
          
          return {
            results: transformedResults,
            totalCount: totalCount,
            page: 1, // v3 endpoints don't provide pagination info
            limit: transformedResults.length
          };
        } else {
          // Regular structured response (v1/v2 endpoints)
          return apiResponse.data;
        }
      } else {
        throw new Error(apiResponse.error || 'API request failed');
      }

    } catch (error) {
      clearTimeout(timeoutId);
      
      const isNetworkError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('Network request failed') ||
         error.message.includes('AbortError'));
      
      console.error(`❌ btService API Error [Attempt ${attempt}]:`, {
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        isNetworkError,
        willRetry: attempt < this.retryAttempts
      });

      if (attempt < this.retryAttempts) {
        // Longer delay for network errors
        const delay = isNetworkError ? this.retryDelay * 2 : this.retryDelay;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest<T>(endpoint, options, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }

  /**
   * Search properties with filters (v3 endpoint)
   */
  async search(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    const endpoint = `/api/v3/search/search-all-properties`;
    
    // Transform filters to v3 format
    const v3Params = this.transformFiltersToV3Format(filters, pagination);
    
    return this.makeRequest<SearchResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(v3Params),
    });
  }

  /**
   * Smart search (detects property codes) - v3 endpoint
   */
  async smartSearch(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    const endpoint = `/api/v3/search/smart`;
    
    // Transform filters to v3 format
    const v3Params = this.transformFiltersToV3Format(filters, pagination);
    
    return this.makeRequest<SearchResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(v3Params),
    });
  }

  /**
   * Search by property code - v3 endpoint
   */
  async searchByCode(code: string, exact: boolean = true): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({
      exact: exact.toString()
    });

    const endpoint = `/api/v3/search/code/${code}?${queryParams.toString()}`;
    
    return this.makeRequest<SearchResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get latest properties - v3 endpoint
   */
  async getLatestProperties(limit: number = 50, offset: number = 0): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const endpoint = `/api/v3/search/latest?${queryParams.toString()}`;
    
    return this.makeRequest<SearchResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    const queryParams = new URLSearchParams({
      q: query
    });

    const endpoint = `/api/search/suggestions?${queryParams.toString()}`;
    
    const response = await this.makeRequest<{ suggestions: string[] }>(endpoint, {
      method: 'GET',
    });

    return response.suggestions;
  }

  /**
   * Validate property code using v3 endpoint
   */
  async validatePropertyCode(code: string): Promise<boolean> {
    try {
      const endpoint = `/api/v3/search/validate-code/${code}`;
      const response = await this.makeRequest<{ isValid: boolean }>(endpoint, {
        method: 'GET',
      });
      return response.isValid;
    } catch (error) {
      console.error('Property code validation error:', error);
      return false;
    }
  }

  /**
   * Transform btAdmin filters to v3 API format
   */
  private transformFiltersToV3Format(filters: SearchFilters, pagination?: SearchPaginationOptions) {
    // Parse price range
    const parsePriceRange = (priceRange: string): { min: number | null; max: number | null } | null => {
      if (!priceRange || priceRange === 'any') {
        return { min: null, max: null };
      }

      const priceRanges: Record<string, { min: number | null; max: number | null }> = {
        'under-10l': { min: null, max: 1000000 },
        '10l-25l': { min: 1000000, max: 2500000 },
        '25l-50l': { min: 2500000, max: 5000000 },
        '50l-75l': { min: 5000000, max: 7500000 },
        '75l-1cr': { min: 7500000, max: 10000000 },
        '1cr-2cr': { min: 10000000, max: 20000000 },
        '2cr-3cr': { min: 20000000, max: 30000000 },
        '3cr-5cr': { min: 30000000, max: 50000000 },
        '5cr-10cr': { min: 50000000, max: 100000000 },
        'above-10cr': { min: 100000000, max: null }
      };

      return priceRanges[priceRange] || null;
    };

    // Get transaction type from filters (added by useSearch transformation)
    const transactionType = (filters as any).transactionType;
    
    // Handle special property types: pghostel and flatmates
    let p_property_type = null;
    let p_subtype = null;
    
    if (filters.selectedPropertyType === 'pghostel') {
      // PG/Hostel is stored as residential with pghostel subtype
      p_property_type = 'residential';
      p_subtype = 'pghostel';
    } else if (filters.selectedPropertyType === 'flatmates') {
      // Flatmates is stored as residential with flatmates subtype
      p_property_type = 'residential';
      p_subtype = 'flatmates';
    } else {
      // Regular property types
      p_property_type = (filters.selectedPropertyType && filters.selectedPropertyType !== 'any') ? filters.selectedPropertyType : null;
      
      // Map transaction type to p_subtype only if not already used for property subtype
      if (transactionType === 'buy') {
        p_subtype = 'sale'; // Buy transactions are stored as 'sale' in database
      } else if (transactionType === 'rent') {
        p_subtype = 'rent';
      }
      // If transactionType is null or 'any', p_subtype stays null to search all
    }

    const priceRange = parsePriceRange(filters.selectedPriceRange);

    console.log('🔧 V3 Parameter Transformation:', {
      actionType: filters.actionType,
      transactionType: transactionType,
      selectedPropertyType: filters.selectedPropertyType,
      mapped_p_property_type: p_property_type,
      mapped_p_subtype: p_subtype,
      selectedSubType: filters.selectedSubType
    });

    return {
      p_search_query: filters.searchQuery || null,
      p_city: (filters.selectedLocation && filters.selectedLocation !== 'any') ? filters.selectedLocation : null,
      p_state: null, // Not currently used in btAdmin
      p_property_type: p_property_type,
      p_subtype: p_subtype, // Either property subtype (pghostel/flatmates) or transaction type (sale/rent)
      p_property_subtype: (filters.selectedSubType && filters.selectedSubType !== 'any') ? filters.selectedSubType : null,
      p_min_price: priceRange?.min || null,
      p_max_price: priceRange?.max || null,
      p_bedrooms: filters.selectedBHK ? parseInt(filters.selectedBHK.replace(/[^0-9]/g, '')) : null,
      p_bathrooms: null, // Not currently used in btAdmin
      p_area_min: null, // Not currently used in btAdmin
      p_area_max: null, // Not currently used in btAdmin
      p_limit: pagination?.limit || 50,
      p_offset: pagination?.offset || 0
    };
  }

  /**
   * Check if a query is a valid property code (local validation)
   */
  isPropertyCode(query: string): boolean {
    // Property codes are exactly 6 alphanumeric characters
    return /^[A-Za-z0-9]{6}$/.test(query.trim());
  }
}

// Default configuration
const defaultConfig: BtServiceConfig = {
  baseUrl: import.meta.env.VITE_BTSERVICE_URL?.trim() || 'https://foth5qlfc8.execute-api.us-east-1.amazonaws.com/prod',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Export singleton instance
export const btServiceClient = new BtServiceClient(defaultConfig);

// Export class for testing and custom configurations
export type { BtServiceConfig };
export default BtServiceClient;