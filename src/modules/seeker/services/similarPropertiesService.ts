// src/modules/seeker/services/similarPropertiesService.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 14:00 IST
// Purpose: Service to fetch similar properties using find_similar_properties database function

import { supabase } from '@/lib/supabase';
import { SearchResult } from '@/components/Search/types/search.types';

// Interface for similar property API response
interface SimilarPropertyAPIResult {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  property_type: string;
  flow_type: string;
  subtype: string;
  title: string;
  price: number;
  city: string;
  state: string;
  area: number;
  owner_email: string;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_unit: string;
  land_type: string | null;
  primary_image: string | null;
  similarity_score: number;
  similarity_factors: any;
}

// Convert API result to SearchResult format for PropertyItem compatibility
const convertToSearchResult = (apiResult: SimilarPropertyAPIResult): SearchResult => {
  // Map flow_type to transaction type
  const transactionType = apiResult.flow_type.includes('sale') ? 'buy' : 'rent';
  
  // Format location string
  const location = [apiResult.city, apiResult.state].filter(Boolean).join(', ');
  
  return {
    id: apiResult.id,
    title: apiResult.title,
    location: location,
    price: apiResult.price,
    propertyType: apiResult.property_type,
    transactionType: transactionType,
    subType: apiResult.subtype,
    bhk: apiResult.bedrooms ? `${apiResult.bedrooms} BHK` : '',
    area: apiResult.area || 0,
    ownerName: apiResult.owner_email || 'Property Owner',
    primary_image: apiResult.primary_image,
    createdAt: apiResult.created_at,
    status: apiResult.status,
    // Additional fields for PropertyItem
    bedrooms: apiResult.bedrooms,
    bathrooms: apiResult.bathrooms,
    city: apiResult.city,
    state: apiResult.state,
    area_unit: apiResult.area_unit,
    similarity_score: apiResult.similarity_score
  };
};

/**
 * Fetch similar properties using the database function
 * @param propertyId - Current property ID to find similar properties for
 * @param limit - Number of similar properties to return (default: 10)
 * @param minSimilarityScore - Minimum similarity score threshold (default: 0.7)
 * @returns Promise<SearchResult[]> - Array of similar properties in SearchResult format
 */
export const fetchSimilarProperties = async (
  propertyId: string,
  limit: number = 10,
  minSimilarityScore: number = 0.7
): Promise<SearchResult[]> => {
  try {
    console.log(`[similarPropertiesService] Fetching similar properties for ${propertyId} with limit=${limit}, similarity=${minSimilarityScore}`);

    // Validate inputs
    if (!propertyId) {
      console.error('[similarPropertiesService] Property ID is required');
      return [];
    }

    if (limit <= 0 || limit > 50) {
      console.warn('[similarPropertiesService] Limit adjusted to valid range (1-50)');
      limit = Math.min(Math.max(limit, 1), 50);
    }

    if (minSimilarityScore < 0 || minSimilarityScore > 1) {
      console.warn('[similarPropertiesService] Similarity score adjusted to valid range (0-1)');
      minSimilarityScore = Math.min(Math.max(minSimilarityScore, 0), 1);
    }

    // Call the database function
    const { data, error } = await supabase.rpc('find_similar_properties', {
      p_property_id: propertyId,
      p_limit: limit,
      p_min_similarity_score: minSimilarityScore
    });

    if (error) {
      console.error('[similarPropertiesService] Database function error:', error);
      throw new Error(`Failed to fetch similar properties: ${error.message}`);
    }

    if (!data || !Array.isArray(data)) {
      console.log('[similarPropertiesService] No similar properties found');
      return [];
    }

    console.log(`[similarPropertiesService] Found ${data.length} similar properties`);

    // Convert API results to SearchResult format
    const similarProperties: SearchResult[] = data.map((item: SimilarPropertyAPIResult) => {
      try {
        return convertToSearchResult(item);
      } catch (conversionError) {
        console.error(`[similarPropertiesService] Error converting property ${item.id}:`, conversionError);
        return null;
      }
    }).filter((property): property is SearchResult => property !== null);

    console.log(`[similarPropertiesService] Successfully processed ${similarProperties.length} similar properties`);

    // Log similarity scores for debugging
    if (similarProperties.length > 0) {
      const scores = similarProperties.map(p => (p as any).similarity_score).filter(Boolean);
      console.log(`[similarPropertiesService] Similarity scores: ${scores.join(', ')}`);
    }

    return similarProperties;

  } catch (error) {
    console.error('[similarPropertiesService] Error fetching similar properties:', error);
    
    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

/**
 * Fetch similar properties with detailed logging for debugging
 * @param propertyId - Current property ID
 * @param limit - Number of results (default: 10)  
 * @param minSimilarityScore - Minimum similarity (default: 0.7)
 * @returns Promise with detailed result information
 */
export const fetchSimilarPropertiesDetailed = async (
  propertyId: string,
  limit: number = 10,
  minSimilarityScore: number = 0.7
) => {
  const startTime = Date.now();
  
  try {
    const results = await fetchSimilarProperties(propertyId, limit, minSimilarityScore);
    const endTime = Date.now();
    
    return {
      success: true,
      data: results,
      count: results.length,
      duration: endTime - startTime,
      parameters: {
        propertyId,
        limit,
        minSimilarityScore
      }
    };
  } catch (error) {
    const endTime = Date.now();
    
    return {
      success: false,
      data: [],
      count: 0,
      duration: endTime - startTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      parameters: {
        propertyId,
        limit,
        minSimilarityScore
      }
    };
  }
};