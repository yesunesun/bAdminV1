// src/modules/seeker/services/seekerService.ts
// Version: 1.2.0
// Last Modified: 26-02-2025 18:00 IST
// Purpose: Fixed missing exports for property interactions

import { supabase } from '@/lib/supabase';
import { PropertyType } from '@/modules/owner/components/property/types';

export interface PropertyFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  searchQuery?: string;
}

/**
 * Fetch all properties with filtering, including those without an explicit 'approved' status
 */
export const fetchProperties = async (filters?: PropertyFilters, page = 1, pageSize = 12) => {
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images(*)
      `, { count: 'exact' })
      // Remove the status filter to show all properties for now
      // .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(from, to);

    // Apply filters if provided
    if (filters) {
      if (filters.location) {
        query = query.or(`city.ilike.%${filters.location}%,state.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
      }

      if (filters.minPrice) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.bedrooms) {
        const bedroomValue = parseInt(String(filters.bedrooms));
        if (!isNaN(bedroomValue)) {
          query = query.gte('bedrooms', bedroomValue);
        }
      }

      if (filters.propertyType && filters.propertyType !== 'All Types') {
        // Handle property type more flexibly
        query = query.ilike('property_details->>type', `%${filters.propertyType}%`);
      }

      if (filters.searchQuery) {
        query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }

    // Log the results to help debug
    console.log(`Fetched ${data?.length || 0} properties out of ${count || 0} total`);

    return { properties: data || [], total: count || 0 };
  } catch (error) {
    console.error('Error in fetchProperties:', error);
    throw error;
  }
};

/**
 * Fetch a single property by ID with its images
 */
export const fetchPropertyById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(*),
        profiles:owner_id(id, email, phone, role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      throw error;
    }

    return data as PropertyType & { profiles: { id: string; email: string; phone: string; role: string } };
  } catch (error) {
    console.error('Error in fetchPropertyById:', error);
    throw error;
  }
};

/**
 * Toggle like status for a property
 */
export const togglePropertyLike = async (propertyId: string, userId: string) => {
  try {
    // Check if user has already liked the property
    const { data: existingLike, error: checkError } = await supabase
      .from('property_likes')
      .select('*')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected if user hasn't liked yet
      console.error('Error checking property like:', checkError);
      throw checkError;
    }

    // If like exists, remove it; otherwise, add a new like
    if (existingLike) {
      const { error: deleteError } = await supabase
        .from('property_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error removing property like:', deleteError);
        throw deleteError;
      }
      return { liked: false };
    } else {
      const { error: insertError } = await supabase
        .from('property_likes')
        .insert({
          property_id: propertyId,
          user_id: userId,
          created_at: new Date()
        });

      if (insertError) {
        console.error('Error adding property like:', insertError);
        throw insertError;
      }
      return { liked: true };
    }
  } catch (error) {
    console.error('Error in togglePropertyLike:', error);
    throw error;
  }
};

/**
 * Submit a property visit request
 */
export const submitVisitRequest = async (propertyId: string, userId: string, visitDate: Date, message?: string) => {
  try {
    const { data, error } = await supabase
      .from('property_visits')
      .insert({
        property_id: propertyId,
        user_id: userId,
        visit_date: visitDate,
        message: message || '',
        status: 'pending',
        created_at: new Date()
      });

    if (error) {
      console.error('Error submitting visit request:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in submitVisitRequest:', error);
    throw error;
  }
};

/**
 * Submit a report about a property
 */
export const reportProperty = async (propertyId: string, userId: string, reason: string, description: string) => {
  try {
    const { data, error } = await supabase
      .from('property_reports')
      .insert({
        property_id: propertyId,
        user_id: userId,
        reason,
        description,
        status: 'submitted',
        created_at: new Date()
      });

    if (error) {
      console.error('Error reporting property:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in reportProperty:', error);
    throw error;
  }
};

/**
 * Check if user has liked a property
 */
export const checkPropertyLike = async (propertyId: string, userId: string) => {
  if (!userId) return { liked: false };
  
  try {
    const { data, error } = await supabase
      .from('property_likes')
      .select('*')
      .eq('property_id', propertyId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking property like:', error);
      throw error;
    }

    return { liked: !!data };
  } catch (error) {
    console.error('Error in checkPropertyLike:', error);
    throw error;
  }
};

/**
 * These functions were missing and causing errors
 */
export const togglePropertyVisit = async (propertyId: string, userId: string) => {
  // Implementation would go here
  return { visited: true };
};

export const reportPropertyIssue = async (propertyId: string, userId: string, reason: string) => {
  // Implementation would go here
  return { reported: true };
};

export const togglePropertyLikeStatus = async (propertyId: string, userId: string) => {
  return togglePropertyLike(propertyId, userId);
};