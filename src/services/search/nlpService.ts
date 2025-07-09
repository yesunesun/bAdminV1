// src/services/search/nlpService.ts
// Version: 1.0.0
// Last Modified: 09-07-2025 10:30 IST
// Purpose: Natural Language Processing service for search queries

import { SearchFilters } from '@/components/Search/types/search.types';
import ConfigLoader from './configLoader';

// NLP-specific types
export interface NLPParseResult {
  query: string;
  originalQuery: string;
  entities: EntityMap;
  intent: QueryIntent;
  confidence: number;
  filters: Partial<SearchFilters>;
  processingTime: number;
  fallbackReason?: string;
}

export interface EntityMap {
  propertyType?: string;
  subType?: string;
  bhk?: string;
  location?: string;
  price?: PriceEntity;
  actionType?: string;
  amenities?: string[];
  area?: AreaEntity;
}

export interface PriceEntity {
  min?: number;
  max?: number;
  unit: 'lakh' | 'crore';
  range?: string;
  originalText: string;
}

export interface AreaEntity {
  min?: number;
  max?: number;
  unit: string;
  originalText: string;
}

export interface QueryIntent {
  type: 'search' | 'filter' | 'compare' | 'question';
  confidence: number;
  keywords: string[];
}

export interface NLPConfig {
  enabled: boolean;
  confidence_threshold: number;
  fallback_timeout: number;
  debug_mode: boolean;
  intent_patterns: {
    search_intents: string[];
    location_indicators: string[];
    price_indicators: string[];
  };
  property_patterns: {
    [key: string]: {
      primary_keywords: string[];
      subtypes?: string[];
      bhk_patterns?: string[];
    };
  };
  location_mapping: {
    [key: string]: string[];
  };
  price_patterns: {
    units: {
      lakhs: string[];
      crores: string[];
    };
    range_indicators: {
      under: string[];
      above: string[];
      between: string[];
    };
    standard_ranges: {
      [key: string]: {
        min: number;
        max: number | null;
        unit: string;
        display: string;
      };
    };
  };
  action_patterns: {
    buy: string[];
    rent: string[];
  };
  typo_corrections: {
    common_typos: {
      [key: string]: string;
    };
  };
  processing: {
    case_sensitive: boolean;
    fuzzy_matching: boolean;
    fuzzy_threshold: number;
    max_processing_time: number;
    enable_caching: boolean;
    cache_size: number;
    min_query_length: number;
    max_query_length: number;
  };
  features: {
    enable_typo_correction: boolean;
    enable_fuzzy_location_matching: boolean;
    enable_price_range_inference: boolean;
    enable_synonym_expansion: boolean;
  };
}

// NLP Service Class
export class NLPService {
  private config: NLPConfig | null = null;
  private cache = new Map<string, NLPParseResult>();
  private initialized = false;

  constructor() {
    // Initialize config asynchronously
    this.initializeConfig().then(() => {
      console.log('🎯 NLP Service constructor completed');
    }).catch(error => {
      console.error('🚨 NLP Service constructor failed:', error);
    });
  }

  /**
   * Initialize NLP configuration from YAML file
   */
  private async initializeConfig(): Promise<void> {
    try {
      console.log('🔧 Initializing NLP config...');
      this.config = await ConfigLoader.loadNLPConfig();
      console.log('✅ NLP config loaded:', {
        enabled: this.config?.enabled,
        hasConfig: !!this.config
      });
      this.initialized = true;
    } catch (error) {
      console.error('🚨 Failed to initialize NLP config:', error);
      this.config = null;
    }
  }


  /**
   * Check if the query appears to be natural language
   */
  public isNaturalLanguage(query: string): boolean {
    if (!this.config || !this.config.enabled) {
      console.log('❌ isNaturalLanguage: No config or not enabled');
      return false;
    }
    
    const trimmedQuery = query.trim();
    console.log('🔤 Checking natural language for:', trimmedQuery);
    
    // Check minimum length (default to 2 if not configured)
    const minLength = this.config.processing?.min_query_length || 2;
    if (trimmedQuery.length < minLength) {
      console.log('❌ Query too short:', trimmedQuery.length, '<', minLength);
      return false;
    }
    
    // Check if it's a property code (6 alphanumeric characters)
    const propertyCodePattern = /^[A-Za-z0-9]{6}$/;
    if (propertyCodePattern.test(trimmedQuery)) {
      console.log('❌ Detected as property code');
      return false;
    }
    
    // Check for natural language indicators
    const lowerQuery = trimmedQuery.toLowerCase();
    const hasNaturalLanguageIndicators = [
      ...this.config.intent_patterns.search_intents,
      ...this.config.intent_patterns.location_indicators,
      ...this.config.intent_patterns.price_indicators
    ].some(indicator => lowerQuery.includes(indicator));
    
    // Check for conversational patterns
    const conversationalPatterns = [
      /\b(looking for|find me|show me|i want|i need|help me)\b/i,
      /\b(in|at|near|around)\s+\w+/i,
      /\b(under|above|between)\s+\d+/i,
      /\b\d+\s*(bhk|bedroom)/i
    ];
    
    const hasConversationalPattern = conversationalPatterns.some(pattern => 
      pattern.test(lowerQuery)
    );
    
    const isNatural = hasNaturalLanguageIndicators || hasConversationalPattern;
    console.log('✅ Natural language check results:', {
      hasNaturalLanguageIndicators,
      hasConversationalPattern,
      isNatural
    });
    
    return isNatural;
  }

  /**
   * Parse natural language query into structured filters
   */
  public async parseQuery(query: string): Promise<NLPParseResult> {
    const startTime = Date.now();
    
    console.log('🔍 NLP parseQuery called with:', query);
    console.log('🔧 NLP config enabled:', this.config?.enabled);
    console.log('🔧 NLP service initialized:', this.initialized);
    
    // Check cache first (disabled for debugging)
    // if (this.config?.processing?.enable_caching && this.cache.has(query)) {
    //   console.log('📋 Returning cached result for:', query);
    //   const cached = this.cache.get(query)!;
    //   return { ...cached, processingTime: Date.now() - startTime };
    // }
    
    // Initialize default result
    const result: NLPParseResult = {
      query: query.trim(),
      originalQuery: query,
      entities: {},
      intent: { type: 'search', confidence: 0.5, keywords: [] },
      confidence: 0,
      filters: {},
      processingTime: 0,
      fallbackReason: undefined
    };
    
    if (!this.config || !this.config.enabled) {
      console.log('❌ NLP service not enabled or no config');
      result.fallbackReason = 'NLP service not enabled';
      result.processingTime = Date.now() - startTime;
      return result;
    }
    
    const isNaturalLang = this.isNaturalLanguage(query);
    console.log('🔤 Is natural language:', isNaturalLang);
    
    if (!isNaturalLang) {
      console.log('❌ Query not recognized as natural language');
      result.fallbackReason = 'Query does not appear to be natural language';
      result.processingTime = Date.now() - startTime;
      return result;
    }
    
    try {
      // Apply typo correction if enabled
      let processedQuery = query;
      if (this.config.features.enable_typo_correction) {
        processedQuery = this.applyTypoCorrection(processedQuery);
      }
      
      // Extract entities
      result.entities = await this.extractEntities(processedQuery);
      console.log('🎯 Extracted entities:', result.entities);
      
      // Determine intent
      result.intent = this.determineIntent(processedQuery);
      console.log('🎭 Determined intent:', result.intent);
      
      // Convert entities to search filters
      result.filters = this.entitiesToFilters(result.entities);
      console.log('🔧 Generated filters:', result.filters);
      
      // Calculate overall confidence
      result.confidence = this.calculateConfidence(result.entities, result.intent);
      
      // Cache result if enabled
      if (this.config.processing.enable_caching) {
        this.cache.set(query, result);
        
        // Maintain cache size limit
        if (this.cache.size > this.config.processing.cache_size) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
      }
      
    } catch (error) {
      console.error('NLP parsing error:', error);
      result.fallbackReason = 'Parsing error occurred';
    }
    
    result.processingTime = Date.now() - startTime;
    return result;
  }

  /**
   * Extract entities from query
   */
  private async extractEntities(query: string): Promise<EntityMap> {
    const entities: EntityMap = {};
    
    if (!this.config) return entities;
    
    const lowerQuery = query.toLowerCase();
    
    // Extract property type
    entities.propertyType = this.extractPropertyType(lowerQuery);
    
    // Extract BHK
    entities.bhk = this.extractBHK(lowerQuery);
    
    // Extract location
    entities.location = this.extractLocation(lowerQuery);
    
    // Extract price
    entities.price = this.extractPrice(lowerQuery);
    
    // Extract action type
    entities.actionType = this.extractActionType(lowerQuery);
    
    return entities;
  }

  /**
   * Extract property type from query
   */
  private extractPropertyType(query: string): string | undefined {
    if (!this.config) return undefined;
    
    for (const [propertyType, patterns] of Object.entries(this.config.property_patterns)) {
      for (const keyword of patterns.primary_keywords) {
        if (query.includes(keyword)) {
          return propertyType;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Extract BHK from query
   */
  private extractBHK(query: string): string | undefined {
    if (!this.config) return undefined;
    
    const bhkPatterns = this.config.property_patterns.residential?.bhk_patterns || [];
    
    for (const pattern of bhkPatterns) {
      if (query.includes(pattern)) {
        return pattern.replace(/\s+/g, '');
      }
    }
    
    return undefined;
  }

  /**
   * Extract location from query
   */
  private extractLocation(query: string): string | undefined {
    if (!this.config) return undefined;
    
    for (const [location, variations] of Object.entries(this.config.location_mapping)) {
      for (const variation of variations) {
        if (query.includes(variation)) {
          return location;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Extract price information from query
   */
  private extractPrice(query: string): PriceEntity | undefined {
    if (!this.config) return undefined;
    
    const pricePatterns = this.config.price_patterns;
    
    // Look for price patterns like "50l", "5-6l", "under 50l", etc.
    const priceRegex = /(\d+(?:\.\d+)?)\s*([lcr]+|lakh|lakhs|crore|crores)/gi;
    const rangeRegex = /(under|above|between)\s+(\d+(?:\.\d+)?)\s*([lcr]+|lakh|lakhs|crore|crores)/gi;
    const betweenRegex = /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*([lcr]+|lakh|lakhs|crore|crores)/gi;
    
    let match;
    
    // Check for range patterns first
    if ((match = rangeRegex.exec(query)) !== null) {
      const [fullMatch, rangeType, amount, unit] = match;
      const normalizedUnit = this.normalizeUnit(unit);
      const numericAmount = parseFloat(amount);
      
      return {
        min: rangeType === 'above' ? numericAmount : undefined,
        max: rangeType === 'under' ? numericAmount : undefined,
        unit: normalizedUnit,
        originalText: fullMatch
      };
    }
    
    // Check for between patterns
    if ((match = betweenRegex.exec(query)) !== null) {
      const [fullMatch, minAmount, maxAmount, unit] = match;
      const normalizedUnit = this.normalizeUnit(unit);
      
      return {
        min: parseFloat(minAmount),
        max: parseFloat(maxAmount),
        unit: normalizedUnit,
        originalText: fullMatch
      };
    }
    
    // Check for simple price patterns
    if ((match = priceRegex.exec(query)) !== null) {
      const [fullMatch, amount, unit] = match;
      const normalizedUnit = this.normalizeUnit(unit);
      
      return {
        min: parseFloat(amount),
        max: parseFloat(amount),
        unit: normalizedUnit,
        originalText: fullMatch
      };
    }
    
    return undefined;
  }

  /**
   * Normalize price unit
   */
  private normalizeUnit(unit: string): 'lakh' | 'crore' {
    const lowerUnit = unit.toLowerCase();
    if (lowerUnit.includes('cr') || lowerUnit.includes('crore')) {
      return 'crore';
    }
    return 'lakh';
  }

  /**
   * Extract action type from query
   */
  private extractActionType(query: string): string | undefined {
    if (!this.config) return undefined;
    
    for (const [actionType, keywords] of Object.entries(this.config.action_patterns)) {
      for (const keyword of keywords) {
        if (query.includes(keyword)) {
          return actionType;
        }
      }
    }
    
    return undefined;
  }

  /**
   * Determine query intent
   */
  private determineIntent(query: string): QueryIntent {
    if (!this.config) {
      return { type: 'search', confidence: 0.5, keywords: [] };
    }
    
    const lowerQuery = query.toLowerCase();
    const searchIntents = this.config.intent_patterns.search_intents;
    
    const foundKeywords = searchIntents.filter(intent => 
      lowerQuery.includes(intent)
    );
    
    return {
      type: 'search',
      confidence: foundKeywords.length > 0 ? 0.8 : 0.5,
      keywords: foundKeywords
    };
  }

  /**
   * Convert entities to search filters
   */
  private entitiesToFilters(entities: EntityMap): Partial<SearchFilters> {
    const filters: Partial<SearchFilters> = {};
    
    if (entities.propertyType) {
      filters.selectedPropertyType = entities.propertyType;
    }
    
    if (entities.bhk) {
      filters.selectedBHK = entities.bhk;
    }
    
    if (entities.location) {
      filters.selectedLocation = entities.location;
    }
    
    if (entities.actionType) {
      filters.actionType = entities.actionType;
    }
    
    if (entities.price) {
      filters.selectedPriceRange = this.priceToRange(entities.price);
    }
    
    return filters;
  }

  /**
   * Convert price entity to price range string
   */
  private priceToRange(price: PriceEntity): string {
    if (!this.config) return '';
    
    const standardRanges = this.config.price_patterns.standard_ranges;
    
    // Find matching standard range
    for (const [rangeKey, rangeConfig] of Object.entries(standardRanges)) {
      const rangeMin = rangeConfig.unit === 'crore' ? rangeConfig.min * 100 : rangeConfig.min;
      const rangeMax = rangeConfig.max ? (rangeConfig.unit === 'crore' ? rangeConfig.max * 100 : rangeConfig.max) : null;
      
      const priceMin = price.unit === 'crore' ? (price.min || 0) * 100 : (price.min || 0);
      const priceMax = price.max ? (price.unit === 'crore' ? price.max * 100 : price.max) : null;
      
      if (rangeMax === null) {
        // Handle "above" ranges
        if (priceMin >= rangeMin) {
          return rangeConfig.display;
        }
      } else {
        // Handle bounded ranges
        if (priceMin >= rangeMin && (priceMax === null || priceMax <= rangeMax)) {
          return rangeConfig.display;
        }
      }
    }
    
    return '';
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(entities: EntityMap, intent: QueryIntent): number {
    let confidence = 0;
    let factors = 0;
    
    // Entity confidence factors
    if (entities.propertyType) { confidence += 0.3; factors++; }
    if (entities.location) { confidence += 0.25; factors++; }
    if (entities.price) { confidence += 0.2; factors++; }
    if (entities.bhk) { confidence += 0.15; factors++; }
    if (entities.actionType) { confidence += 0.1; factors++; }
    
    // Intent confidence
    confidence += intent.confidence * 0.2;
    factors++;
    
    return factors > 0 ? Math.min(confidence, 1.0) : 0;
  }

  /**
   * Apply typo correction to query
   */
  private applyTypoCorrection(query: string): string {
    if (!this.config?.features.enable_typo_correction) return query;
    
    let correctedQuery = query;
    
    for (const [typo, correction] of Object.entries(this.config.typo_corrections.common_typos)) {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      correctedQuery = correctedQuery.replace(regex, correction);
    }
    
    return correctedQuery;
  }

  /**
   * Check if NLP service is ready
   */
  public isReady(): boolean {
    const ready = this.initialized && this.config !== null && this.config.enabled;
    console.log('🔍 NLP Service Ready Check:', {
      initialized: this.initialized,
      hasConfig: this.config !== null,
      enabled: this.config?.enabled,
      ready
    });
    return ready;
  }

  /**
   * Get current configuration
   */
  public getConfig(): NLPConfig | null {
    return this.config;
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const nlpService = new NLPService();
export default nlpService;