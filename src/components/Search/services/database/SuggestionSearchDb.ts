// src/components/Search/services/database/SuggestionSearchDb.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 16:40 IST
// Purpose: Search suggestions database class

import { supabase } from '@/lib/supabase';

/**
 * Search suggestions database class
 * Handles autocomplete and suggestion queries
 */
export class SuggestionSearchDb {
  private readonly maxSuggestions = 5;
  private readonly minQueryLength = 2;

  /**
   * Cache suggestions for performance (simple in-memory cache)
   */
  private suggestionCache = new Map<string, { data: string[]; timestamp: number }>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cached suggestions or fetch new ones
   */
  private async getCachedSuggestions(cacheKey: string, fetcher: () => Promise<string[]>): Promise<string[]> {
    const cached = this.suggestionCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < this.cacheTimeout) {
      console.log('💾 Using cached suggestions for:', cacheKey);
      return cached.data;
    }

    try {
      const data = await fetcher();
      this.suggestionCache.set(cacheKey, { data, timestamp: now });
      return data;
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      return cached?.data || [];
    }
  }

  /**
   * Clear suggestion cache
   */
  clearCache(): void {
    console.log('🗑️ Clearing suggestion cache');
    this.suggestionCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { entries: number; totalMemory: string } {
    const entries = this.suggestionCache.size;
    const estimatedMemory = entries * 100; // Rough estimate in bytes
    return {
      entries,
      totalMemory: `${(estimatedMemory / 1024).toFixed(2)} KB`
    };
  }

  /**
   * Get smart suggestions based on query analysis
   */
  async getSmartSuggestions(query: string, propertyType?: string): Promise<{
    suggestions: string[];
    type: 'title' | 'location' | 'mixed';
    source: string;
  }> {
    if (!query || query.length < this.minQueryLength) {
      return { suggestions: [], type: 'mixed', source: 'none' };
    }

    console.log('🧠 Suggestion Database: Getting smart suggestions for:', query);

    try {
      // Determine suggestion strategy based on query characteristics
      const isLocationQuery = /^(hyd|sec|bang|chen|mumb|delh|pune|kolk)/i.test(query) || 
                             /\b(city|area|location|near|suburb)\b/i.test(query);
      
      const isPropertyTypeQuery = /\b(apartment|villa|house|office|shop|land|plot)\b/i.test(query);

      let suggestions: string[] = [];
      let suggestionType: 'title' | 'location' | 'mixed' = 'mixed';
      let source = 'general';

      if (isLocationQuery) {
        suggestions = await this.getCachedSuggestions(
          `location_${query}`,
          () => this.getLocationSuggestions(query)
        );
        suggestionType = 'location';
        source = 'location-based';
      } else if (propertyType) {
        suggestions = await this.getCachedSuggestions(
          `${propertyType}_${query}`,
          () => this.getPropertyTypeSpecificSuggestions(query, propertyType)
        );
        suggestionType = 'title';
        source = `${propertyType}-specific`;
      } else {
        const combined = await this.getCombinedSuggestions(query);
        suggestions = [...combined.titles, ...combined.locations];
        suggestionType = 'mixed';
        source = 'combined';
      }

      console.log(`✅ Smart suggestions: ${suggestions.length} results (${suggestionType}, ${source})`);
      return { suggestions, type: suggestionType, source };

    } catch (error) {
      console.error('❌ SuggestionSearchDb.getSmartSuggestions error:', error);
      return { suggestions: [], type: 'mixed', source: 'error' };
    }
  }
}

/**
 * Singleton instance for suggestion search database
 */
export const suggestionSearchDb = new SuggestionSearchDb();
   * Get title-based search suggestions
   */
  async getTitleSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < this.minQueryLength) {
      return [];
    }

    console.log('💡 Suggestion Database: Getting title suggestions for:', query);

    try {
      const { data, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .ilike('property_details->flow->>title', `%${query}%`)
        .limit(this.maxSuggestions);

      if (error) {
        console.error('❌ Error getting title suggestions:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      const suggestions = data
        .map(item => item.property_details?.flow?.title)
        .filter((title): title is string => Boolean(title))
        .filter((title, index, array) => array.indexOf(title) === index) // Remove duplicates
        .slice(0, this.maxSuggestions);

      console.log(`✅ Suggestion Database: Found ${suggestions.length} title suggestions`);
      return suggestions;

    } catch (error) {
      console.error('❌ SuggestionSearchDb.getTitleSuggestions error:', error);
      return [];
    }
  }

  /**
   * Get location-based search suggestions
   */
  async getLocationSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < this.minQueryLength) {
      return [];
    }

    console.log('📍 Suggestion Database: Getting location suggestions for:', query);

    try {
      // Search in multiple location fields
      const { data, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .or(`property_details->steps->res_rent_location->>city.ilike.%${query}%,property_details->steps->res_sale_location->>city.ilike.%${query}%,property_details->steps->com_rent_location->>city.ilike.%${query}%,property_details->steps->com_sale_location->>city.ilike.%${query}%,property_details->steps->land_sale_location->>city.ilike.%${query}%`)
        .limit(this.maxSuggestions * 2); // Get more to account for filtering

      if (error) {
        console.error('❌ Error getting location suggestions:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      const locationSet = new Set<string>();

      data.forEach(item => {
        const details = item.property_details;
        if (details?.steps) {
          // Extract cities from various step types
          const steps = details.steps;
          const cityFields = [
            steps.res_rent_location?.city,
            steps.res_sale_location?.city,
            steps.res_flat_location?.city,
            steps.res_pg_location?.city,
            steps.com_rent_location?.city,
            steps.com_sale_location?.city,
            steps.com_cow_location?.city,
            steps.land_sale_location?.city,
            steps.land_location?.city
          ];

          cityFields.forEach(city => {
            if (city && typeof city === 'string' && city.toLowerCase().includes(query.toLowerCase())) {
              locationSet.add(city);
            }
          });
        }
      });

      const suggestions = Array.from(locationSet)
        .sort()
        .slice(0, this.maxSuggestions);

      console.log(`✅ Suggestion Database: Found ${suggestions.length} location suggestions`);
      return suggestions;

    } catch (error) {
      console.error('❌ SuggestionSearchDb.getLocationSuggestions error:', error);
      return [];
    }
  }

  /**
   * Get combined search suggestions (titles + locations)
   */
  async getCombinedSuggestions(query: string): Promise<{ titles: string[]; locations: string[] }> {
    if (!query || query.length < this.minQueryLength) {
      return { titles: [], locations: [] };
    }

    console.log('🔗 Suggestion Database: Getting combined suggestions for:', query);

    try {
      const [titleSuggestions, locationSuggestions] = await Promise.all([
        this.getTitleSuggestions(query),
        this.getLocationSuggestions(query)
      ]);

      const result = {
        titles: titleSuggestions.slice(0, 3), // Limit titles to make room for locations
        locations: locationSuggestions.slice(0, 2) // Limit locations
      };

      console.log(`✅ Combined suggestions: ${result.titles.length} titles, ${result.locations.length} locations`);
      return result;

    } catch (error) {
      console.error('❌ SuggestionSearchDb.getCombinedSuggestions error:', error);
      return { titles: [], locations: [] };
    }
  }

  /**
   * Get popular search terms based on property titles
   */
  async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
    console.log('🔥 Suggestion Database: Getting popular search terms');

    try {
      const { data, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .not('property_details->flow->title', 'is', null)
        .limit(100); // Sample recent properties

      if (error) {
        console.error('❌ Error getting popular terms:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      // Extract keywords from titles
      const wordFrequency = new Map<string, number>();

      data.forEach(item => {
        const title = item.property_details?.flow?.title;
        if (title && typeof title === 'string') {
          // Extract meaningful words (ignore common words)
          const words = title
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter(word => !['the', 'and', 'for', 'rent', 'sale', 'bhk', 'apartment', 'house', 'property'].includes(word));

          words.forEach(word => {
            wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
          });
        }
      });

      // Sort by frequency and return top terms
      const popularTerms = Array.from(wordFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word]) => word);

      console.log(`✅ Found ${popularTerms.length} popular search terms`);
      return popularTerms;

    } catch (error) {
      console.error('❌ SuggestionSearchDb.getPopularSearchTerms error:', error);
      return [];
    }
  }

  /**
   * Get property type specific suggestions
   */
  async getPropertyTypeSpecificSuggestions(query: string, propertyType: string): Promise<string[]> {
    if (!query || query.length < this.minQueryLength) {
      return [];
    }

    console.log(`🏗️ Suggestion Database: Getting ${propertyType} specific suggestions for:`, query);

    try {
      let flowTypeFilter = '';
      switch (propertyType) {
        case 'residential':
          flowTypeFilter = 'residential_%';
          break;
        case 'commercial':
          flowTypeFilter = 'commercial_%';
          break;
        case 'land':
          flowTypeFilter = 'land_%';
          break;
        default:
          return this.getTitleSuggestions(query);
      }

      const { data, error } = await supabase
        .from('properties_v2')
        .select('property_details')
        .ilike('property_details->flow->>title', `%${query}%`)
        .ilike('property_details->flow->>flowType', flowTypeFilter)
        .limit(this.maxSuggestions);

      if (error) {
        console.error(`❌ Error getting ${propertyType} suggestions:`, error);
        return [];
      }

      if (!data) {
        return [];
      }

      const suggestions = data
        .map(item => item.property_details?.flow?.title)
        .filter((title): title is string => Boolean(title))
        .filter((title, index, array) => array.indexOf(title) === index)
        .slice(0, this.maxSuggestions);

      console.log(`✅ Found ${suggestions.length} ${propertyType} specific suggestions`);
      return suggestions;

    } catch (error) {
      console.error(`❌ SuggestionSearchDb.getPropertyTypeSpecificSuggestions error for ${propertyType}:`, error);
      return [];
    }
  }

  /**