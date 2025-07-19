// src/components/Search/services/nlpService.ts
// Version: 1.0.0
// Purpose: NLP service client for btService integration - natural language query processing

export interface NLPEntity {
  location?: string;
  propertyType?: string;
  subType?: string;
  bhk?: string;
  priceRange?: string;
  transactionType?: string;
  area?: string;
  keywords?: string[];
  confidence?: number;
}

export interface NLPResponse {
  success: boolean;
  data: {
    preprocessedQuery: string;
    entities: NLPEntity;
    mappedFilters: Record<string, any>;
    processingTime: number;
    fallbackUsed: boolean;
    confidence: number;
  };
  error?: string;
}

export interface NLPQuerySuggestion {
  text: string;
  type: 'entity' | 'completion' | 'correction';
  confidence: number;
}

class NLPService {
  private baseURL: string;
  private timeout: number = 5000; // 5 second timeout

  constructor() {
    // Use btService endpoint - will be configurable via environment
    // In browser environment, use import.meta.env for Vite
    this.baseURL = import.meta.env?.VITE_BTSERVICE_URL || 'http://localhost:3001';
    console.log('🔧 NLP Service initialized with baseURL:', this.baseURL);
  }

  /**
   * Check if a query should use NLP processing
   * NLP is triggered for natural language patterns, not simple property codes
   */
  shouldUseNLP(query: string): boolean {
    console.log('🔍 NLP shouldUseNLP called with:', { query, type: typeof query, length: query?.length });
    
    if (!query || query.trim().length < 3) {
      console.log('❌ NLP rejected: too short or empty');
      return false;
    }

    const cleanQuery = query.trim().toLowerCase();
    console.log('🔍 NLP cleanQuery:', { cleanQuery, length: cleanQuery.length });

    // Don't use NLP for simple property codes (6 alphanumeric chars)
    if (/^[a-z0-9]{6}$/i.test(cleanQuery)) {
      console.log('❌ NLP rejected: property code detected');
      return false;
    }

    // Don't use NLP for very short queries
    if (cleanQuery.length < 5) {
      console.log('❌ NLP rejected: length < 5');
      return false;
    }

    // Use NLP for natural language patterns
    const nlpPatterns = [
      /\b(in|at|near|around|close to)\b/,  // Location prepositions
      /(bhk|bedroom|room)/,                // BHK patterns (removed word boundary for "3bhk")
      /\b(under|below|above|between)\b/,   // Price patterns
      /\b(for rent|for sale|to buy)\b/,    // Transaction patterns
      /(apartment|house|flat|villa|plot)/,  // Property types (removed word boundary)
      /\b(need|want|looking|search)\b/,    // Intent words
      /\s+/                                // Multiple words
    ];

    const patternResults = nlpPatterns.map((pattern, index) => {
      const result = pattern.test(cleanQuery);
      const patternNames = ['location', 'bhk', 'price', 'transaction', 'property', 'intent', 'multiword'];
      console.log(`🔍 Pattern ${patternNames[index]}: ${result}`);
      return result;
    });

    const shouldUse = nlpPatterns.some(pattern => pattern.test(cleanQuery));
    console.log('🎯 NLP shouldUseNLP result:', { shouldUse, patternResults });
    
    return shouldUse;
  }

  /**
   * Process a natural language query using btService NLP endpoint
   */
  async processQuery(query: string): Promise<NLPResponse> {
    console.log('🧠 NLP Service: Processing query:', query);
    
    try {
      const startTime = Date.now();
      
      // Call btService NLP parse endpoint
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseURL}/api/v3/search/parse?query=${encodedQuery}`;
      
      console.log('🔗 NLP Service: Calling endpoint:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      const processingTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`NLP service responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ NLP Service: Response received:', {
        processingTime,
        success: data.success,
        entitiesFound: data.data?.entities ? Object.keys(data.data.entities).filter(k => data.data.entities[k]).length : 0
      });

      return {
        success: true,
        data: {
          preprocessedQuery: data.data?.preprocessedQuery || query,
          entities: data.data?.entities || {},
          mappedFilters: data.data?.mappedFilters || {},
          processingTime: data.data?.processingTime || processingTime,
          fallbackUsed: data.data?.fallbackUsed || false,
          confidence: data.data?.entities?.confidence || 0
        }
      };

    } catch (error) {
      console.error('❌ NLP Service: Error processing query:', error);
      
      return {
        success: false,
        data: {
          preprocessedQuery: query,
          entities: {},
          mappedFilters: {},
          processingTime: 0,
          fallbackUsed: true,
          confidence: 0
        },
        error: error instanceof Error ? error.message : 'NLP processing failed'
      };
    }
  }

  /**
   * Get NLP-enhanced search suggestions
   */
  async getSuggestions(query: string): Promise<NLPQuerySuggestion[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `${this.baseURL}/api/v3/search/nlp-suggestions?query=${encodedQuery}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(3000) // Shorter timeout for suggestions
      });

      if (!response.ok) {
        console.warn('NLP suggestions service unavailable, falling back to basic suggestions');
        return [];
      }

      const data = await response.json();
      
      return data.suggestions || [];

    } catch (error) {
      console.warn('NLP suggestions failed:', error);
      return [];
    }
  }

  /**
   * Extract key information from NLP entities for display
   */
  extractDisplayInfo(entities: NLPEntity): {
    location?: string;
    propertyType?: string;
    bhk?: string;
    priceRange?: string;
    transactionType?: string;
    keywords?: string[];
    confidence: number;
  } {
    return {
      location: entities.location,
      propertyType: entities.propertyType,
      bhk: entities.bhk,
      priceRange: entities.priceRange,
      transactionType: entities.transactionType,
      keywords: entities.keywords || [],
      confidence: entities.confidence || 0
    };
  }

  /**
   * Convert NLP entities to SearchFilters format
   */
  entitiesToFilters(entities: NLPEntity, originalQuery: string): Record<string, any> {
    const filters: Record<string, any> = {};

    // Map entities to filter format
    if (entities.location) {
      filters.selectedLocation = entities.location;
    }

    if (entities.propertyType) {
      filters.selectedPropertyType = entities.propertyType;
    }

    if (entities.subType) {
      filters.selectedSubType = entities.subType;
    }

    if (entities.bhk) {
      filters.selectedBHK = entities.bhk;
    }

    if (entities.priceRange) {
      filters.selectedPriceRange = entities.priceRange;
    }

    if (entities.transactionType) {
      filters.actionType = entities.transactionType;
    }

    // Always include the original query for fallback search
    filters.searchQuery = originalQuery;

    return filters;
  }

  /**
   * Check if NLP service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      
      return response.ok;
    } catch (error) {
      console.warn('NLP service health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const nlpService = new NLPService();
export default nlpService;