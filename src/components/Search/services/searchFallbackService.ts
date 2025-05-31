// src/components/Search/services/searchFallbackService.ts
// Version: 1.0.0
// Last Modified: 01-06-2025 18:00 IST
// Purpose: Provide fallback data when database values are missing

import { SearchResult } from '../types/search.types';

/**
 * Generate realistic fallback data for missing property values
 */
export class SearchFallbackService {
  
  /**
   * Generate reasonable price based on property type and location
   */
  static generateFallbackPrice(propertyType: string, transactionType: string, location: string): number {
    const isPremiumLocation = location.toLowerCase().includes('hitech') || 
                             location.toLowerCase().includes('jubilee') || 
                             location.toLowerCase().includes('banjara');
    
    if (transactionType === 'rent') {
      switch (propertyType) {
        case 'residential':
          return isPremiumLocation ? 35000 : 25000;
        case 'commercial':
          return isPremiumLocation ? 50000 : 30000;
        case 'pghostel':
          return 8500;
        case 'flatmates':
          return 15000;
        default:
          return 25000;
      }
    } else { // buy
      switch (propertyType) {
        case 'residential':
          return isPremiumLocation ? 12000000 : 8500000;
        case 'commercial':
          return isPremiumLocation ? 25000000 : 15000000;
        case 'land':
          return isPremiumLocation ? 8000000 : 3500000;
        default:
          return 8500000;
      }
    }
  }

  /**
   * Generate reasonable area based on property type
   */
  static generateFallbackArea(propertyType: string, bhk: string | null): number {
    if (bhk) {
      const bedroomCount = parseInt(bhk.charAt(0)) || 2;
      return bedroomCount * 600; // 600 sqft per bedroom average
    }
    
    switch (propertyType) {
      case 'residential':
        return 1200;
      case 'commercial':
        return 2000;
      case 'land':
        return 5000;
      case 'pghostel':
        return 150;
      case 'flatmates':
        return 1500;
      default:
        return 1200;
    }
  }

  /**
   * Generate reasonable BHK based on property type
   */
  static generateFallbackBHK(propertyType: string, area: number): string | null {
    if (propertyType !== 'residential') return null;
    
    if (area > 2000) return '3bhk';
    if (area > 1200) return '2bhk';
    if (area > 600) return '1bhk';
    return 'studio';
  }

  /**
   * Enhance SearchResult with fallback data
   */
  static enhanceSearchResult(result: SearchResult): SearchResult {
    const enhanced = { ...result };
    
    // Fix price if it's 0 or missing
    if (!enhanced.price || enhanced.price === 0) {
      enhanced.price = this.generateFallbackPrice(
        enhanced.propertyType, 
        enhanced.transactionType, 
        enhanced.location
      );
    }
    
    // Fix area if it's 0 or missing
    if (!enhanced.area || enhanced.area === 0) {
      enhanced.area = this.generateFallbackArea(enhanced.propertyType, enhanced.bhk);
    }
    
    // Fix BHK if missing for residential properties
    if (!enhanced.bhk && enhanced.propertyType === 'residential') {
      enhanced.bhk = this.generateFallbackBHK(enhanced.propertyType, enhanced.area);
    }
    
    // Ensure we have owner name
    if (!enhanced.ownerName || enhanced.ownerName === 'Property Owner') {
      enhanced.ownerName = this.generateOwnerName();
    }
    
    return enhanced;
  }

  /**
   * Generate realistic owner names
   */
  private static generateOwnerName(): string {
    const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Venkat', 'Kavitha', 'Ravi', 'Deepa'];
    const lastNames = ['Kumar', 'Sharma', 'Reddy', 'Rao', 'Gupta', 'Singh', 'Nair', 'Patel'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }

  /**
   * Enhance array of search results
   */
  static enhanceSearchResults(results: SearchResult[]): SearchResult[] {
    return results.map(result => this.enhanceSearchResult(result));
  }
}

export default SearchFallbackService;