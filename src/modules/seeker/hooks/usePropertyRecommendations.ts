// src/modules/seeker/hooks/usePropertyRecommendations.ts
// Version: 1.0.0
// Created: 13-07-2025
// Purpose: Hook for integrating property recommendations and premium features

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { SearchResult } from '@/components/Search/types/search.types';
import { 
  recommendationService, 
  EnhancedProperty, 
  RecommendationOptions,
  UserPreferences 
} from '../services/recommendationService';
import { useAuth } from '@/contexts/AuthContext';
import { useVisitedProperties } from '@/contexts/VisitedPropertiesContext';
import { useFavorites } from '@/contexts/FavoritesContext';

export interface UsePropertyRecommendationsProps {
  properties: PropertyType[] | SearchResult[];
  enabled?: boolean;
  options?: RecommendationOptions;
}

export interface UsePropertyRecommendationsReturn {
  enhancedProperties: EnhancedProperty[];
  recommendedProperties: PropertyType[];
  premiumProperties: PropertyType[];
  sponsoredProperties: PropertyType[];
  isProcessing: boolean;
  userPreferences: UserPreferences | null;
  refreshRecommendations: () => void;
}

export const usePropertyRecommendations = ({
  properties,
  enabled = true,
  options = {}
}: UsePropertyRecommendationsProps): UsePropertyRecommendationsReturn => {
  
  const { user } = useAuth();
  const { visitedProperties } = useVisitedProperties();
  const { favorites } = useFavorites();
  
  // State for processed properties
  const [enhancedProperties, setEnhancedProperties] = useState<EnhancedProperty[]>([]);
  const [recommendedProperties, setRecommendedProperties] = useState<PropertyType[]>([]);
  const [premiumProperties, setPremiumProperties] = useState<PropertyType[]>([]);
  const [sponsoredProperties, setSponsoredProperties] = useState<PropertyType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Build user preferences from context data
  const userPreferences = useMemo((): UserPreferences | null => {
    if (!user || !enabled) return null;
    
    // Extract preferences from visited properties
    const visitedPropertiesArray = visitedProperties ? Array.from(visitedProperties.values()) : [];
    const locations = visitedPropertiesArray.map(p => p.location).filter(Boolean);
    const propertyTypes = visitedPropertiesArray.map(p => p.propertyType).filter(Boolean);
    const prices = visitedPropertiesArray.map(p => p.price).filter(p => p > 0);
    
    return {
      preferredLocations: [...new Set(locations)],
      preferredPropertyTypes: [...new Set(propertyTypes)],
      preferredPriceRange: prices.length > 0 ? [
        Math.min(...prices) * 0.8,
        Math.max(...prices) * 1.2
      ] : undefined,
      recentlyViewed: visitedPropertiesArray.slice(-10).map(p => p.id),
      favoriteProperties: favorites ? favorites.map(f => f.id) : []
    };
  }, [user, enabled, visitedProperties, favorites]);
  
  // Process properties with recommendations and premium features
  const processProperties = useCallback(async () => {
    if (!enabled || properties.length === 0) {
      setEnhancedProperties([]);
      setRecommendedProperties([]);
      setPremiumProperties([]);
      setSponsoredProperties([]);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Convert SearchResult to PropertyType format if needed
      const normalizedProperties: PropertyType[] = properties.map(property => {
        if ('transactionType' in property && !('property_details' in property)) {
          // Convert SearchResult to PropertyType format
          const searchResult = property as SearchResult;
          return {
            id: searchResult.id,
            title: searchResult.title || '',
            price: searchResult.price || 0,
            location: searchResult.location || '',
            property_type: searchResult.propertyType || 'residential',
            created_at: (searchResult as any).createdAt || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: (searchResult as any).status || 'published',
            property_details: {
              meta: { _version: 'v3', status: 'published' },
              flow: {
                category: searchResult.propertyType || 'residential',
                listingType: searchResult.transactionType === 'buy' ? 'sale' : 'rent'
              }
            },
            featured: (searchResult as any).featured || false
          } as PropertyType;
        }
        return property as PropertyType;
      });
      
      // Enhanced recommendation options with user preferences
      const enhancedOptions: RecommendationOptions = {
        includePremium: true,
        includeSponsored: true,
        premiumRatio: 15,
        sponsoredLimit: 3,
        userPreferences: userPreferences || undefined,
        ...options
      };
      
      // Get enhanced properties with recommendations and premium features
      const enhanced = recommendationService.enhancePropertiesWithRecommendations(
        normalizedProperties,
        enhancedOptions
      );
      
      // Get specific recommendations if user has history
      let recommended: PropertyType[] = [];
      if (userPreferences && visitedProperties && (visitedProperties?.size || 0) > 0) {
        const visitedArray = Array.from(visitedProperties.values()).map(visited => ({
          id: visited.id,
          title: visited.title,
          price: visited.price,
          location: visited.location,
          property_type: visited.propertyType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: 'published' as const,
          property_details: {
            meta: { _version: 'v3', status: 'published' },
            flow: {
              category: visited.propertyType,
              listingType: 'rent'
            }
          }
        })) as PropertyType[];
        
        recommended = recommendationService.getRecommendedProperties(
          visitedArray,
          undefined,
          10
        );
      }
      
      // Get premium and sponsored properties
      const premium = recommendationService.getPremiumProperties(normalizedProperties, 20);
      const sponsored = recommendationService.getSponsoredProperties(
        userPreferences?.preferredLocations?.[0],
        userPreferences?.preferredPropertyTypes?.[0],
        3
      );
      
      // Update state
      setEnhancedProperties(enhanced);
      setRecommendedProperties(recommended);
      setPremiumProperties(premium);
      setSponsoredProperties(sponsored);
      
    } catch (error) {
      console.error('Error processing property recommendations:', error);
      // Fallback to original properties without enhancement
      setEnhancedProperties(properties as EnhancedProperty[]);
      setRecommendedProperties([]);
      setPremiumProperties([]);
      setSponsoredProperties([]);
    } finally {
      setIsProcessing(false);
    }
  }, [enabled, properties, userPreferences, visitedProperties?.size || 0, options]);
  
  // Process properties when dependencies change
  useEffect(() => {
    const timeoutId = setTimeout(processProperties, 100);
    return () => clearTimeout(timeoutId);
  }, [processProperties]);
  
  // Refresh function for manual updates
  const refreshRecommendations = useCallback(() => {
    processProperties();
  }, [processProperties]);
  
  return {
    enhancedProperties,
    recommendedProperties,
    premiumProperties,
    sponsoredProperties,
    isProcessing,
    userPreferences,
    refreshRecommendations
  };
};

// Utility hook for getting recommendation statistics
export const useRecommendationStats = (enhancedProperties: EnhancedProperty[]) => {
  return useMemo(() => {
    const totalProperties = enhancedProperties.length;
    const premiumCount = enhancedProperties.filter(p => p.is_premium).length;
    const sponsoredCount = enhancedProperties.filter(p => p.is_sponsored).length;
    const recommendedCount = enhancedProperties.filter(p => 
      p.recommendation_score && p.recommendation_score > 50
    ).length;
    
    return {
      totalProperties,
      premiumCount,
      sponsoredCount,
      recommendedCount,
      premiumPercentage: totalProperties > 0 ? (premiumCount / totalProperties) * 100 : 0,
      sponsoredPercentage: totalProperties > 0 ? (sponsoredCount / totalProperties) * 100 : 0,
      recommendedPercentage: totalProperties > 0 ? (recommendedCount / totalProperties) * 100 : 0
    };
  }, [enhancedProperties]);
};