// src/components/Search/services/btServiceClient.ts
// Version: 1.0.0
// Last Modified: 2025-07-10
// Purpose: btService API client for search functionality

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
    this.timeout = config.timeout || 60000; // 60 seconds - increased for better reliability
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 2000; // 2 seconds - increased delay between retries
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

      // Extract data from btService response format {success: true, data: {results, totalCount}}
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
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
   * Search properties with filters
   */
  async search(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (pagination?.page) {
      queryParams.append('page', pagination.page.toString());
    }
    if (pagination?.limit) {
      queryParams.append('limit', pagination.limit.toString());
    }

    const endpoint = `/api/search?${queryParams.toString()}`;
    
    return this.makeRequest<SearchResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        filters,
        options: pagination
      }),
    });
  }

  /**
   * Smart search (detects property codes)
   */
  async smartSearch(
    filters: SearchFilters,
    pagination?: SearchPaginationOptions
  ): Promise<SearchResponse> {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (pagination?.page) {
      queryParams.append('page', pagination.page.toString());
    }
    if (pagination?.limit) {
      queryParams.append('limit', pagination.limit.toString());
    }

    const endpoint = `/api/search/smart?${queryParams.toString()}`;
    
    return this.makeRequest<SearchResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        filters,
        options: pagination
      }),
    });
  }

  /**
   * Search by property code
   */
  async searchByCode(code: string, exact: boolean = true): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({
      exact: exact.toString()
    });

    const endpoint = `/api/search/code/${code}?${queryParams.toString()}`;
    
    return this.makeRequest<SearchResponse>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * Get latest properties
   */
  async getLatestProperties(limit: number = 50, offset: number = 0): Promise<SearchResponse> {
    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });

    const endpoint = `/api/search/latest?${queryParams.toString()}`;
    
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
   * Check if a query is a valid property code
   */
  isPropertyCode(query: string): boolean {
    // Property codes are exactly 6 alphanumeric characters
    return /^[A-Za-z0-9]{6}$/.test(query.trim());
  }
}

// Default configuration
const defaultConfig: BtServiceConfig = {
  baseUrl: import.meta.env.VITE_BTSERVICE_URL || 'http://localhost:3001',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Export singleton instance
export const btServiceClient = new BtServiceClient(defaultConfig);

// Export class for testing and custom configurations
export type { BtServiceConfig };
export default BtServiceClient;