// src/modules/seeker/services/recommendationService.ts
// Version: 1.0.0
// Created: 13-07-2025
// Purpose: Property recommendation simulation with premium/sponsored features

import { PropertyType } from '@/modules/owner/components/property/types';
import { SearchResult } from '@/components/Search/types/search.types';

export interface RecommendationEngine {
  getRecommendedProperties(
    userHistory: PropertyType[], 
    currentProperty?: PropertyType,
    limit?: number
  ): PropertyType[];
  
  getPremiumProperties(
    properties: PropertyType[],
    premiumRatio?: number
  ): PropertyType[];
  
  getSponsoredProperties(
    location?: string,
    propertyType?: string,
    limit?: number
  ): PropertyType[];
  
  enhancePropertiesWithRecommendations(
    properties: PropertyType[],
    options?: RecommendationOptions
  ): EnhancedProperty[];
}

export interface RecommendationOptions {
  includePremium?: boolean;
  includeSponsored?: boolean;
  premiumRatio?: number; // Percentage of premium properties (0-100)
  sponsoredLimit?: number;
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  preferredLocations?: string[];
  preferredPriceRange?: [number, number];
  preferredPropertyTypes?: string[];
  recentlyViewed?: string[];
  favoriteProperties?: string[];
}

export interface EnhancedProperty extends PropertyType {
  recommendation_score?: number;
  is_premium?: boolean;
  is_sponsored?: boolean;
  premium_badge?: string;
  recommendation_reason?: string;
  similarity_score?: number;
}

export interface PremiumPropertyConfig {
  badge_text: string;
  priority_score: number;
  visibility_boost: number;
  styling_class: string;
}

export class PropertyRecommendationService implements RecommendationEngine {
  
  // Premium property configurations
  private static readonly PREMIUM_CONFIGS: Record<string, PremiumPropertyConfig> = {
    featured: {
      badge_text: 'Featured',
      priority_score: 100,
      visibility_boost: 1.5,
      styling_class: 'premium-featured'
    },
    verified: {
      badge_text: 'Verified',
      priority_score: 80,
      visibility_boost: 1.3,
      styling_class: 'premium-verified'
    },
    sponsored: {
      badge_text: 'Sponsored',
      priority_score: 90,
      visibility_boost: 1.4,
      styling_class: 'premium-sponsored'
    },
    premium: {
      badge_text: 'Premium',
      priority_score: 95,
      visibility_boost: 1.6,
      styling_class: 'premium-listing'
    }
  };

  // Simulated premium property IDs (in real app, this would come from database)
  private static readonly SIMULATED_PREMIUM_IDS = new Set([
    'prop_001', 'prop_005', 'prop_012', 'prop_018', 'prop_023',
    'prop_031', 'prop_042', 'prop_056', 'prop_067', 'prop_074'
  ]);

  // Simulated sponsored property configurations
  private static readonly SIMULATED_SPONSORED_CONFIGS = [
    { location: 'gachibowli', propertyType: 'residential', weight: 0.8 },
    { location: 'hitech city', propertyType: 'commercial', weight: 0.9 },
    { location: 'madhapur', propertyType: 'residential', weight: 0.7 },
    { location: 'kondapur', propertyType: 'residential', weight: 0.6 },
    { location: 'financial district', propertyType: 'commercial', weight: 0.8 }
  ];

  /**
   * Generate recommended properties based on user history and preferences
   */
  getRecommendedProperties(
    userHistory: PropertyType[], 
    currentProperty?: PropertyType,
    limit: number = 10
  ): PropertyType[] {
    if (userHistory.length === 0) {
      return [];
    }

    // Analyze user preferences from history
    const preferences = this.analyzeUserPreferences(userHistory);
    
    // Score properties based on similarity to user preferences
    const scoredProperties = userHistory.map(property => ({
      property,
      score: this.calculateRecommendationScore(property, preferences, currentProperty)
    }));

    // Sort by score and return top recommendations
    return scoredProperties
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.property,
        recommendation_score: item.score,
        recommendation_reason: this.generateRecommendationReason(item.property, preferences)
      }));
  }

  /**
   * Identify and mark premium properties from a list
   */
  getPremiumProperties(
    properties: PropertyType[],
    premiumRatio: number = 20
  ): PropertyType[] {
    const premiumCount = Math.ceil(properties.length * (premiumRatio / 100));
    
    // Simulate premium properties selection
    const premiumProperties = properties
      .filter(property => 
        PropertyRecommendationService.SIMULATED_PREMIUM_IDS.has(property.id) ||
        this.shouldBePremium(property)
      )
      .slice(0, premiumCount);

    return premiumProperties.map(property => ({
      ...property,
      is_premium: true,
      premium_badge: this.determinePremiumBadge(property),
      featured: true // Set the existing featured flag
    }));
  }

  /**
   * Generate sponsored properties for specific contexts
   */
  getSponsoredProperties(
    location?: string,
    propertyType?: string,
    limit: number = 3
  ): PropertyType[] {
    // Find relevant sponsored configurations
    const relevantConfigs = PropertyRecommendationService.SIMULATED_SPONSORED_CONFIGS
      .filter(config => {
        const locationMatch = !location || config.location.toLowerCase().includes(location.toLowerCase());
        const typeMatch = !propertyType || config.propertyType === propertyType;
        return locationMatch && typeMatch;
      })
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);

    // Generate simulated sponsored properties
    return relevantConfigs.map((config, index) => ({
      id: `sponsored_${Date.now()}_${index}`,
      title: `Premium ${config.propertyType} in ${config.location}`,
      price: this.generateSponsoredPrice(config.propertyType),
      location: config.location,
      property_type: config.propertyType,
      is_sponsored: true,
      premium_badge: 'Sponsored',
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'published' as const,
      property_details: {
        meta: { _version: 'v3', status: 'published' },
        flow: { 
          category: config.propertyType,
          listingType: 'rent'
        }
      }
    })) as PropertyType[];
  }

  /**
   * Enhance properties with recommendation data and premium features
   */
  enhancePropertiesWithRecommendations(
    properties: PropertyType[],
    options: RecommendationOptions = {}
  ): EnhancedProperty[] {
    const {
      includePremium = true,
      includeSponsored = true,
      premiumRatio = 15,
      sponsoredLimit = 3,
      userPreferences
    } = options;

    let enhancedProperties: EnhancedProperty[] = [...properties];

    // Add premium markings
    if (includePremium) {
      enhancedProperties = enhancedProperties.map(property => {
        const isPremium = PropertyRecommendationService.SIMULATED_PREMIUM_IDS.has(property.id) ||
                         this.shouldBePremium(property);
        
        if (isPremium) {
          return {
            ...property,
            is_premium: true,
            premium_badge: this.determinePremiumBadge(property),
            featured: true
          };
        }
        
        return property;
      });
    }

    // Add recommendation scores if user preferences available
    if (userPreferences) {
      enhancedProperties = enhancedProperties.map(property => ({
        ...property,
        recommendation_score: this.calculateRecommendationScore(property, userPreferences),
        similarity_score: this.calculateSimilarityScore(property, userPreferences)
      }));
    }

    // Insert sponsored properties at strategic positions
    if (includeSponsored && sponsoredLimit > 0) {
      const sponsoredProperties = this.getSponsoredProperties(
        undefined, // Will match any location
        undefined, // Will match any property type
        sponsoredLimit
      ).map(property => ({
        ...property,
        is_sponsored: true
      }));

      // Insert sponsored properties at strategic positions (every 5-7 properties)
      sponsoredProperties.forEach((sponsoredProperty, index) => {
        const insertPosition = Math.min(
          (index + 1) * 6,
          enhancedProperties.length
        );
        enhancedProperties.splice(insertPosition, 0, sponsoredProperty);
      });
    }

    // Sort by premium/sponsored status and recommendation score
    return enhancedProperties.sort((a, b) => {
      // Premium and sponsored properties get priority
      const aPriority = (a.is_premium ? 100 : 0) + (a.is_sponsored ? 90 : 0);
      const bPriority = (b.is_premium ? 100 : 0) + (b.is_sponsored ? 90 : 0);
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }
      
      // Then sort by recommendation score
      const aScore = a.recommendation_score || 0;
      const bScore = b.recommendation_score || 0;
      
      if (aScore !== bScore) {
        return bScore - aScore;
      }
      
      // Finally sort by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  // Private helper methods

  private analyzeUserPreferences(userHistory: PropertyType[]): UserPreferences {
    const locations = userHistory.map(p => p.location || p.city).filter(Boolean);
    const prices = userHistory.map(p => p.price).filter(p => p > 0);
    const propertyTypes = userHistory.map(p => p.property_type).filter(Boolean);

    return {
      preferredLocations: [...new Set(locations)],
      preferredPriceRange: prices.length > 0 ? [
        Math.min(...prices) * 0.8,
        Math.max(...prices) * 1.2
      ] : undefined,
      preferredPropertyTypes: [...new Set(propertyTypes)],
      recentlyViewed: userHistory.slice(-10).map(p => p.id)
    };
  }

  private calculateRecommendationScore(
    property: PropertyType,
    preferences: UserPreferences,
    currentProperty?: PropertyType
  ): number {
    let score = 0;

    // Location similarity
    if (preferences.preferredLocations?.length) {
      const propertyLocation = (property.location || property.city || '').toLowerCase();
      const locationMatch = preferences.preferredLocations.some(loc => 
        propertyLocation.includes(loc.toLowerCase()) || loc.toLowerCase().includes(propertyLocation)
      );
      if (locationMatch) score += 30;
    }

    // Price range compatibility
    if (preferences.preferredPriceRange && property.price > 0) {
      const [minPrice, maxPrice] = preferences.preferredPriceRange;
      if (property.price >= minPrice && property.price <= maxPrice) {
        score += 25;
      } else if (property.price <= maxPrice * 1.1) {
        score += 15; // Slightly above budget but still relevant
      }
    }

    // Property type match
    if (preferences.preferredPropertyTypes?.includes(property.property_type)) {
      score += 20;
    }

    // Recently viewed boost
    if (preferences.recentlyViewed?.includes(property.id)) {
      score += 10;
    }

    // Current property similarity (if viewing a specific property)
    if (currentProperty) {
      if (property.property_type === currentProperty.property_type) score += 15;
      if (property.location === currentProperty.location) score += 20;
      
      const priceDiff = Math.abs(property.price - currentProperty.price) / currentProperty.price;
      if (priceDiff < 0.2) score += 10; // Similar price range
    }

    return Math.min(score, 100); // Cap at 100
  }

  private calculateSimilarityScore(property: PropertyType, preferences: UserPreferences): number {
    let similarity = 0;
    let factors = 0;

    // Location similarity
    if (preferences.preferredLocations?.length) {
      const propertyLocation = (property.location || property.city || '').toLowerCase();
      const hasLocationMatch = preferences.preferredLocations.some(loc => 
        propertyLocation.includes(loc.toLowerCase())
      );
      similarity += hasLocationMatch ? 1 : 0;
      factors++;
    }

    // Property type similarity
    if (preferences.preferredPropertyTypes?.length) {
      const hasTypeMatch = preferences.preferredPropertyTypes.includes(property.property_type);
      similarity += hasTypeMatch ? 1 : 0;
      factors++;
    }

    // Price range similarity
    if (preferences.preferredPriceRange && property.price > 0) {
      const [minPrice, maxPrice] = preferences.preferredPriceRange;
      const priceInRange = property.price >= minPrice && property.price <= maxPrice;
      similarity += priceInRange ? 1 : 0;
      factors++;
    }

    return factors > 0 ? (similarity / factors) * 100 : 0;
  }

  private shouldBePremium(property: PropertyType): boolean {
    // Simulate premium property selection based on property characteristics
    const hasHighPrice = property.price > 5000000; // Above 50L for sales or 50k for rent
    const isRecentlyListed = property.created_at && 
      new Date(property.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const hasGoodLocation = property.location && 
      ['gachibowli', 'hitech city', 'madhapur', 'banjara hills', 'jubilee hills']
        .some(loc => property.location!.toLowerCase().includes(loc));

    return hasHighPrice || isRecentlyListed || hasGoodLocation;
  }

  private determinePremiumBadge(property: PropertyType): string {
    if (property.price > 10000000) return 'Premium';
    if (property.location?.toLowerCase().includes('banjara hills') || 
        property.location?.toLowerCase().includes('jubilee hills')) return 'Featured';
    if (property.created_at && 
        new Date(property.created_at) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
      return 'New';
    }
    return 'Verified';
  }

  private generateRecommendationReason(property: PropertyType, preferences: UserPreferences): string {
    const reasons = [];

    if (preferences.preferredLocations?.some(loc => 
      property.location?.toLowerCase().includes(loc.toLowerCase()))) {
      reasons.push('in your preferred location');
    }

    if (preferences.preferredPropertyTypes?.includes(property.property_type)) {
      reasons.push('matches your property type preference');
    }

    if (preferences.preferredPriceRange && property.price > 0) {
      const [minPrice, maxPrice] = preferences.preferredPriceRange;
      if (property.price >= minPrice && property.price <= maxPrice) {
        reasons.push('within your budget');
      }
    }

    if (reasons.length === 0) {
      return 'similar to properties you\'ve viewed';
    }

    return `Recommended because it ${reasons.join(' and ')}`;
  }

  private generateSponsoredPrice(propertyType: string): number {
    // Generate realistic prices for sponsored properties
    const baseRanges = {
      residential: { min: 15000, max: 75000 },
      commercial: { min: 25000, max: 150000 },
      land: { min: 5000000, max: 50000000 }
    };

    const range = baseRanges[propertyType as keyof typeof baseRanges] || baseRanges.residential;
    return Math.floor(Math.random() * (range.max - range.min) + range.min);
  }
}

// Export singleton instance
export const recommendationService = new PropertyRecommendationService();

// Utility functions for components
export const isPropertyPremium = (property: PropertyType | EnhancedProperty): boolean => {
  return (property as EnhancedProperty).is_premium === true || 
         PropertyRecommendationService.SIMULATED_PREMIUM_IDS.has(property.id) ||
         property.featured === true;
};

export const isPropertySponsored = (property: PropertyType | EnhancedProperty): boolean => {
  return (property as EnhancedProperty).is_sponsored === true ||
         property.id.startsWith('sponsored_');
};

export const getPremiumBadgeText = (property: PropertyType | EnhancedProperty): string => {
  if ((property as EnhancedProperty).premium_badge) {
    return (property as EnhancedProperty).premium_badge!;
  }
  
  if (isPropertySponsored(property)) return 'Sponsored';
  if (isPropertyPremium(property)) return 'Featured';
  
  return '';
};

export const getPremiumBadgeStyle = (property: PropertyType | EnhancedProperty): string => {
  const badgeText = getPremiumBadgeText(property);
  
  const styleMap: Record<string, string> = {
    'Sponsored': 'bg-orange-500/90 text-white border-orange-400',
    'Premium': 'bg-purple-500/90 text-white border-purple-400',
    'Featured': 'bg-blue-500/90 text-white border-blue-400',
    'Verified': 'bg-green-500/90 text-white border-green-400',
    'New': 'bg-emerald-500/90 text-white border-emerald-400'
  };
  
  return styleMap[badgeText] || 'bg-gray-500/90 text-white border-gray-400';
};