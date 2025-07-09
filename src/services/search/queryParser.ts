// src/services/search/queryParser.ts
// Version: 1.0.0
// Last Modified: 09-07-2025 11:00 IST
// Purpose: Specialized query parsing utilities for NLP search

import { EntityMap, PriceEntity, NLPConfig } from './nlpService';

export interface ParsedQuery {
  originalQuery: string;
  cleanedQuery: string;
  tokens: string[];
  entities: EntityMap;
  confidence: number;
  parseErrors: string[];
}

export interface PropertyTypeMatch {
  type: string;
  subType?: string;
  confidence: number;
  matchedKeywords: string[];
}

export interface LocationMatch {
  location: string;
  confidence: number;
  matchedVariations: string[];
}

export interface PriceMatch {
  price: PriceEntity;
  confidence: number;
  matchPattern: string;
}

export interface BHKMatch {
  bhk: string;
  confidence: number;
  matchPattern: string;
}

/**
 * Query Parser - Specialized parsing utilities for natural language queries
 */
export class QueryParser {
  private config: NLPConfig | null = null;

  constructor(config: NLPConfig | null) {
    this.config = config;
  }

  /**
   * Parse a query into structured components
   */
  public parseQuery(query: string): ParsedQuery {
    const result: ParsedQuery = {
      originalQuery: query,
      cleanedQuery: this.cleanQuery(query),
      tokens: [],
      entities: {},
      confidence: 0,
      parseErrors: []
    };

    try {
      // Tokenize the query
      result.tokens = this.tokenize(result.cleanedQuery);

      // Extract entities
      result.entities = this.extractAllEntities(result.cleanedQuery, result.tokens);

      // Calculate confidence
      result.confidence = this.calculateParsingConfidence(result.entities, result.tokens);

    } catch (error) {
      result.parseErrors.push(`Parsing error: ${error.message}`);
    }

    return result;
  }

  /**
   * Clean and normalize query text
   */
  private cleanQuery(query: string): string {
    let cleaned = query.trim();

    // Apply typo corrections if available
    if (this.config?.features.enable_typo_correction) {
      cleaned = this.applyTypoCorrections(cleaned);
    }

    // Normalize whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove extra punctuation but keep hyphens in ranges
    cleaned = cleaned.replace(/[^\w\s\-]/g, ' ');

    return cleaned.toLowerCase();
  }

  /**
   * Tokenize query into words
   */
  private tokenize(query: string): string[] {
    return query.split(/\s+/).filter(token => token.length > 0);
  }

  /**
   * Extract all entities from query
   */
  private extractAllEntities(query: string, tokens: string[]): EntityMap {
    const entities: EntityMap = {};

    // Extract property type with confidence
    const propertyTypeMatch = this.parsePropertyType(query, tokens);
    if (propertyTypeMatch) {
      entities.propertyType = propertyTypeMatch.type;
      if (propertyTypeMatch.subType) {
        entities.subType = propertyTypeMatch.subType;
      }
    }

    // Extract location with confidence
    const locationMatch = this.parseLocation(query, tokens);
    if (locationMatch) {
      entities.location = locationMatch.location;
    }

    // Extract price with confidence
    const priceMatch = this.parsePrice(query, tokens);
    if (priceMatch) {
      entities.price = priceMatch.price;
    }

    // Extract BHK with confidence
    const bhkMatch = this.parseBHK(query, tokens);
    if (bhkMatch) {
      entities.bhk = bhkMatch.bhk;
    }

    // Extract action type
    entities.actionType = this.parseActionType(query, tokens);

    return entities;
  }

  /**
   * Parse property type from query
   */
  public parsePropertyType(query: string, tokens: string[]): PropertyTypeMatch | null {
    if (!this.config) return null;

    const propertyPatterns = this.config.property_patterns;
    
    for (const [propertyType, patterns] of Object.entries(propertyPatterns)) {
      const matchedKeywords: string[] = [];
      let confidence = 0;
      let subType: string | undefined;

      // Check primary keywords
      for (const keyword of patterns.primary_keywords) {
        if (query.includes(keyword)) {
          matchedKeywords.push(keyword);
          confidence += 0.4;
        }
      }

      // Check subtypes
      if (patterns.subtypes) {
        for (const subtype of patterns.subtypes) {
          if (query.includes(subtype)) {
            matchedKeywords.push(subtype);
            subType = subtype;
            confidence += 0.6; // Subtypes are more specific
          }
        }
      }

      if (matchedKeywords.length > 0) {
        return {
          type: propertyType,
          subType,
          confidence: Math.min(confidence, 1.0),
          matchedKeywords
        };
      }
    }

    return null;
  }

  /**
   * Parse location from query
   */
  public parseLocation(query: string, tokens: string[]): LocationMatch | null {
    if (!this.config) return null;

    const locationMapping = this.config.location_mapping;
    
    for (const [location, variations] of Object.entries(locationMapping)) {
      const matchedVariations: string[] = [];
      let confidence = 0;

      for (const variation of variations) {
        if (query.includes(variation)) {
          matchedVariations.push(variation);
          // Exact match gets higher confidence
          confidence += variation === location ? 1.0 : 0.8;
        }
      }

      if (matchedVariations.length > 0) {
        return {
          location,
          confidence: Math.min(confidence, 1.0),
          matchedVariations
        };
      }
    }

    // Fuzzy matching for unknown locations
    if (this.config.features.enable_fuzzy_location_matching) {
      const locationIndicators = this.config.intent_patterns.location_indicators;
      
      for (const indicator of locationIndicators) {
        const indicatorIndex = query.indexOf(indicator);
        if (indicatorIndex !== -1) {
          // Extract word after location indicator
          const afterIndicator = query.substring(indicatorIndex + indicator.length).trim();
          const possibleLocation = afterIndicator.split(' ')[0];
          
          if (possibleLocation && possibleLocation.length > 2) {
            return {
              location: possibleLocation,
              confidence: 0.5, // Lower confidence for fuzzy matches
              matchedVariations: [possibleLocation]
            };
          }
        }
      }
    }

    return null;
  }

  /**
   * Parse price information from query
   */
  public parsePrice(query: string, tokens: string[]): PriceMatch | null {
    if (!this.config) return null;

    const pricePatterns = this.config.price_patterns;
    
    // Complex price patterns
    const patterns = [
      {
        // Range patterns: "between 5-6l", "5 to 6 lakhs"
        regex: /(?:between\s+)?(\d+(?:\.\d+)?)\s*[-to]\s*(\d+(?:\.\d+)?)\s*([lcr]+|lakh|lakhs|crore|crores)/gi,
        type: 'range',
        confidence: 0.9
      },
      {
        // Under patterns: "under 50l", "below 50 lakhs"
        regex: /(under|below|less than|upto|up to)\s+(\d+(?:\.\d+)?)\s*([lcr]+|lakh|lakhs|crore|crores)/gi,
        type: 'max',
        confidence: 0.85
      },
      {
        // Above patterns: "above 1cr", "over 1 crore"
        regex: /(above|over|more than|starting from)\s+(\d+(?:\.\d+)?)\s*([lcr]+|lakh|lakhs|crore|crores)/gi,
        type: 'min',
        confidence: 0.85
      },
      {
        // Simple price: "50l", "5 crores"
        regex: /(\d+(?:\.\d+)?)\s*([lcr]+|lakh|lakhs|crore|crores)/gi,
        type: 'exact',
        confidence: 0.7
      }
    ];

    for (const pattern of patterns) {
      const matches = Array.from(query.matchAll(pattern.regex));
      
      for (const match of matches) {
        const price = this.extractPriceFromMatch(match, pattern.type);
        if (price) {
          return {
            price,
            confidence: pattern.confidence,
            matchPattern: pattern.type
          };
        }
      }
    }

    return null;
  }

  /**
   * Extract price entity from regex match
   */
  private extractPriceFromMatch(match: RegExpMatchArray, type: string): PriceEntity | null {
    const fullMatch = match[0];
    
    switch (type) {
      case 'range':
        const [, minStr, maxStr, unit] = match;
        return {
          min: parseFloat(minStr),
          max: parseFloat(maxStr),
          unit: this.normalizeUnit(unit),
          originalText: fullMatch
        };
      
      case 'max':
        const [, , maxVal, maxUnit] = match;
        return {
          max: parseFloat(maxVal),
          unit: this.normalizeUnit(maxUnit),
          originalText: fullMatch
        };
      
      case 'min':
        const [, , minVal, minUnit] = match;
        return {
          min: parseFloat(minVal),
          unit: this.normalizeUnit(minUnit),
          originalText: fullMatch
        };
      
      case 'exact':
        const [, exactVal, exactUnit] = match;
        const amount = parseFloat(exactVal);
        return {
          min: amount,
          max: amount,
          unit: this.normalizeUnit(exactUnit),
          originalText: fullMatch
        };
      
      default:
        return null;
    }
  }

  /**
   * Parse BHK information from query
   */
  public parseBHK(query: string, tokens: string[]): BHKMatch | null {
    if (!this.config) return null;

    const bhkPatterns = this.config.property_patterns.residential?.bhk_patterns || [];
    
    // Direct BHK patterns
    for (const pattern of bhkPatterns) {
      if (query.includes(pattern)) {
        return {
          bhk: pattern.replace(/\s+/g, ''),
          confidence: 0.9,
          matchPattern: 'direct'
        };
      }
    }

    // Numeric BHK patterns: "3 bedroom", "2 bed"
    const numericPatterns = [
      { regex: /(\d+)\s*(?:bhk|bedroom|bed)/gi, confidence: 0.8 },
      { regex: /(\d+)\s*(?:br|bd)/gi, confidence: 0.7 }
    ];

    for (const pattern of numericPatterns) {
      const matches = Array.from(query.matchAll(pattern.regex));
      
      for (const match of matches) {
        const [, numStr] = match;
        const num = parseInt(numStr);
        
        if (num >= 1 && num <= 5) {
          const bhk = num >= 4 ? '4plus' : `${num}bhk`;
          return {
            bhk,
            confidence: pattern.confidence,
            matchPattern: 'numeric'
          };
        }
      }
    }

    return null;
  }

  /**
   * Parse action type from query
   */
  public parseActionType(query: string, tokens: string[]): string | undefined {
    if (!this.config) return undefined;

    const actionPatterns = this.config.action_patterns;
    
    // Check for buy patterns
    for (const keyword of actionPatterns.buy) {
      if (query.includes(keyword)) {
        return 'buy';
      }
    }

    // Check for rent patterns
    for (const keyword of actionPatterns.rent) {
      if (query.includes(keyword)) {
        return 'rent';
      }
    }

    return undefined;
  }

  /**
   * Normalize price unit to standard format
   */
  private normalizeUnit(unit: string): 'lakh' | 'crore' {
    const lowerUnit = unit.toLowerCase();
    
    if (lowerUnit.includes('cr') || lowerUnit.includes('crore')) {
      return 'crore';
    }
    
    return 'lakh';
  }

  /**
   * Apply typo corrections to query
   */
  private applyTypoCorrections(query: string): string {
    if (!this.config?.typo_corrections) return query;

    let corrected = query;
    
    for (const [typo, correction] of Object.entries(this.config.typo_corrections.common_typos)) {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      corrected = corrected.replace(regex, correction);
    }

    return corrected;
  }

  /**
   * Calculate parsing confidence based on extracted entities
   */
  private calculateParsingConfidence(entities: EntityMap, tokens: string[]): number {
    let confidence = 0;
    let factors = 0;

    // Entity confidence weights
    const weights = {
      propertyType: 0.3,
      location: 0.25,
      price: 0.2,
      bhk: 0.15,
      actionType: 0.1
    };

    for (const [entityType, weight] of Object.entries(weights)) {
      if (entities[entityType as keyof EntityMap]) {
        confidence += weight;
        factors++;
      }
    }

    // Boost confidence for multi-entity queries
    if (factors > 2) {
      confidence *= 1.1;
    }

    // Reduce confidence for very short queries
    if (tokens.length < 3) {
      confidence *= 0.8;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Validate parsed entities
   */
  public validateEntities(entities: EntityMap): string[] {
    const errors: string[] = [];

    // Validate property type
    if (entities.propertyType && this.config) {
      const validTypes = Object.keys(this.config.property_patterns);
      if (!validTypes.includes(entities.propertyType)) {
        errors.push(`Invalid property type: ${entities.propertyType}`);
      }
    }

    // Validate BHK
    if (entities.bhk) {
      const validBHKs = ['1bhk', '2bhk', '3bhk', '4bhk', '4plus'];
      if (!validBHKs.includes(entities.bhk)) {
        errors.push(`Invalid BHK: ${entities.bhk}`);
      }
    }

    // Validate price
    if (entities.price) {
      const { min, max, unit } = entities.price;
      if (min !== undefined && min < 0) {
        errors.push('Price cannot be negative');
      }
      if (max !== undefined && max < 0) {
        errors.push('Price cannot be negative');
      }
      if (min !== undefined && max !== undefined && min > max) {
        errors.push('Minimum price cannot be greater than maximum price');
      }
      if (!['lakh', 'crore'].includes(unit)) {
        errors.push(`Invalid price unit: ${unit}`);
      }
    }

    // Validate action type
    if (entities.actionType) {
      const validActions = ['buy', 'rent'];
      if (!validActions.includes(entities.actionType)) {
        errors.push(`Invalid action type: ${entities.actionType}`);
      }
    }

    return errors;
  }

  /**
   * Get parsing statistics
   */
  public getParsingStats(entities: EntityMap): {
    entitiesFound: number;
    entityTypes: string[];
    completeness: number;
  } {
    const entityTypes = Object.keys(entities).filter(key => entities[key as keyof EntityMap] !== undefined);
    const maxPossibleEntities = 5; // propertyType, location, price, bhk, actionType

    return {
      entitiesFound: entityTypes.length,
      entityTypes,
      completeness: entityTypes.length / maxPossibleEntities
    };
  }
}

// Export utility functions
export const createQueryParser = (config: NLPConfig | null): QueryParser => {
  return new QueryParser(config);
};

export default QueryParser;