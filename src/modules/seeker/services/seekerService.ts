// src/modules/seeker/services/seekerService.ts
// Version: 2.2.0
// Last Modified: 03-04-2025 16:30 IST
// Purpose: Added pagination support for property fetching

import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/modules/owner/components/property/types';

export interface PropertyFilters {
  searchQuery?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export const fetchProperties = async (filters: PropertyFilters = {}) => {
  try {
    // Set default pagination values
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 50; // Increased from default to show more properties
    const startIndex = (page - 1) * pageSize;
    
    // Build the query
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          url,
          is_primary,
          display_order
        ),
        profiles:owner_id (
          id,
          email
        )
      `);
    
    // Create a count query to get total results
    let countQuery = supabase
      .from('properties')
      .select('id', { count: 'exact' });
    
    // Apply filters to both queries
    if (filters.searchQuery) {
      const searchFilter = `title.ilike.%${filters.searchQuery}%,address.ilike.%${filters.searchQuery}%,city.ilike.%${filters.searchQuery}%`;
      query = query.or(searchFilter);
      countQuery = countQuery.or(searchFilter);
    }
    
    if (filters.propertyType) {
      query = query.filter('property_details->propertyType', 'ilike', `%${filters.propertyType}%`);
      countQuery = countQuery.filter('property_details->propertyType', 'ilike', `%${filters.propertyType}%`);
    }
    
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
      countQuery = countQuery.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
      countQuery = countQuery.lte('price', filters.maxPrice);
    }
    
    if (filters.bedrooms !== undefined) {
      query = query.gte('bedrooms', filters.bedrooms);
      countQuery = countQuery.gte('bedrooms', filters.bedrooms);
    }
    
    if (filters.bathrooms !== undefined) {
      query = query.gte('bathrooms', filters.bathrooms);
      countQuery = countQuery.gte('bathrooms', filters.bathrooms);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'size_high':
          query = query.order('square_feet', { ascending: false });
          break;
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }
    } else {
      // Default sort by creation date (newest first)
      query = query.order('created_at', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(startIndex, startIndex + pageSize - 1);
    
    // Execute both queries in parallel
    const [dataResult, countResult] = await Promise.all([
      query,
      countQuery
    ]);
    
    if (dataResult.error) {
      console.error('Error fetching properties:', dataResult.error);
      throw dataResult.error;
    }
    
    if (countResult.error) {
      console.error('Error counting properties:', countResult.error);
      throw countResult.error;
    }
    
    const totalCount = countResult.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    console.log(`Fetched ${dataResult.data?.length || 0} properties (page ${page}/${totalPages}, total: ${totalCount})`);
    
    // Process images to ensure consistent sorting
    const processedProperties = (dataResult.data || []).map(property => ({
      ...property,
      property_images: property.property_images
        ? property.property_images.sort((a, b) => {
            // Sort by is_primary first (primary images first)
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            
            // Then sort by display_order if available
            return (a.display_order || 0) - (b.display_order || 0);
          })
        : []
    }));
    
    return { 
      properties: processedProperties,
      totalCount,
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error('Comprehensive property fetch error:', error);
    throw error;
  }
};

// Other functions remain the same
// ... rest of the file remains unchanged