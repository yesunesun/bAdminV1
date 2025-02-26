// src/modules/owner/services/propertyService.ts
// Version: 4.1.0
// Last Modified: 26-02-2025 18:30 IST
// Purpose: Enhanced property service with improved data handling

import { supabase } from '@/lib/supabase';
import { Property, FormData } from '../components/property/PropertyFormTypes';

// Cache for properties to avoid redundant fetches
const propertiesCache = new Map<string, {data: Property[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

export const propertyService = {
  // Fetch a user's properties with caching
  async getUserProperties(userId: string, forceRefresh = false): Promise<Property[]> {
    // Check cache first if not forcing refresh
    const now = Date.now();
    const cachedData = propertiesCache.get(userId);
    
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      console.log('Returning cached properties for user:', userId);
      return cachedData.data;
    }
    
    try {
      console.log('Fetching properties for user:', userId);
      
      // Fetch properties and images in a single query using inner join
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*)
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Found properties:', data?.length || 0);
      
      // Format the properties data
      const formattedProperties = (data || []).map(property => {
        // Process images
        const images = property.property_images
          ? property.property_images.map((img: any) => ({
              id: img.id,
              url: img.url,
              type: img.is_primary ? 'primary' : 'additional',
            }))
          : [];
        
        return {
          ...property,
          images
        };
      });
      
      // Update cache
      propertiesCache.set(userId, {
        data: formattedProperties,
        timestamp: now
      });
      
      return formattedProperties;
    } catch (error) {
      console.error('Error in getUserProperties:', error);
      throw error;
    }
  },

  // Fetch a single property by ID
  async getPropertyById(id: string): Promise<Property> {
    try {
      console.log('Fetching property with ID:', id);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Database error fetching property:', error);
        throw error;
      }
      
      if (!data) {
        console.error('No property found with ID:', id);
        throw new Error('Property not found');
      }
      
      console.log('Property data found:', {
        id: data.id,
        title: data.title,
        status: data.status,
        imageCount: data.property_images?.length || 0
      });

      // Process the images
      const images = data.property_images
        ? data.property_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            type: img.is_primary ? 'primary' : 'additional',
          }))
        : [];
      
      // Make sure property_details exists
      if (!data.property_details) {
        console.warn('Property has no property_details, creating empty object');
        data.property_details = {};
      }
      
      // Ensure required properties exist
      if (!data.property_details.propertyType) {
        // Try to derive from title if available
        if (data.title && data.title.includes(' in ')) {
          const parts = data.title.split(' in ');
          if (parts[0].includes(' ')) {
            data.property_details.propertyType = parts[0].split(' ').slice(1).join(' ');
          }
        }
      }
      
      // Set defaults for any missing fields that are required
      data.property_details.listingType = data.property_details.listingType || 'rent';
      
      return {
        ...data,
        images
      };
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  },

  // Create a new property
  async createProperty(propertyData: FormData, userId: string, status: 'draft' | 'published' = 'draft'): Promise<Property> {
    try {
      console.log('Creating property with status:', status);
      
      const dbPropertyData = {
        owner_id: userId,
        title: propertyData.title || `${propertyData.bhkType} ${propertyData.propertyType} in ${propertyData.locality}`,
        description: propertyData.description || '',
        price: parseFloat(propertyData.rentAmount) || 0,
        bedrooms: propertyData.bhkType ? parseInt(propertyData.bhkType.split(' ')[0]) : 0,
        bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : 0,
        square_feet: propertyData.builtUpArea ? parseFloat(propertyData.builtUpArea) : null,
        address: propertyData.address || '',
        city: propertyData.locality,
        state: 'Telangana',
        zip_code: propertyData.pinCode || '',
        status,
        property_details: propertyData,
        tags: status === 'published' ? ['public'] : []
      };
      
      const { data, error } = await supabase
        .from('properties')
        .insert([dbPropertyData])
        .select()
        .single();

      if (error) throw error;
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      return {
        ...data,
        images: []
      };
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  },

  // Update an existing property
  async updateProperty(
    propertyId: string,
    propertyData: FormData,
    userId: string,
    status?: 'draft' | 'published'
  ): Promise<Property> {
    try {
      console.log('Updating property:', propertyId);
      
      const updateData: any = {
        title: propertyData.title || `${propertyData.bhkType} ${propertyData.propertyType} in ${propertyData.locality}`,
        description: propertyData.description || '',
        price: parseFloat(propertyData.rentAmount) || 0,
        bedrooms: propertyData.bhkType ? parseInt(propertyData.bhkType.split(' ')[0]) : 0,
        bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms) : 0,
        square_feet: propertyData.builtUpArea ? parseFloat(propertyData.builtUpArea) : null,
        address: propertyData.address || '',
        city: propertyData.locality,
        state: 'Telangana',
        zip_code: propertyData.pinCode || '',
        property_details: propertyData,
      };

      // Only update status if provided
      if (status) {
        updateData.status = status;
        updateData.tags = status === 'published' ? ['public'] : [];
      }

      const { data, error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .eq('owner_id', userId) // Security check
        .select(`
          *,
          property_images(*)
        `)
        .single();

      if (error) throw error;
      
      // Process the images
      const images = data.property_images
        ? data.property_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            type: img.is_primary ? 'primary' : 'additional',
          }))
        : [];
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      return {
        ...data,
        images
      };
    } catch (error) {
      console.error('Error in updateProperty:', error);
      throw error;
    }
  },

  // Delete a property
  async deleteProperty(id: string, userId: string): Promise<void> {
    try {
      console.log('Deleting property:', id);
      
      // First, delete associated images
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', id);
        
      if (imagesError) {
        console.error('Error deleting property images:', imagesError);
        // Continue anyway to try to delete the property
      }
      
      // Then delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('owner_id', userId); // Security check

      if (error) throw error;
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      console.log('Property deleted successfully');
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      throw error;
    }
  },

  // Update property status
  async updatePropertyStatus(propertyId: string, status: 'draft' | 'published', userId: string): Promise<void> {
    try {
      console.log('Updating property status:', { propertyId, status });
      
      const tags = status === 'published' ? ['public'] : [];
      
      const { error } = await supabase
        .from('properties')
        .update({ 
          status,
          tags
        })
        .eq('id', propertyId)
        .eq('owner_id', userId); // Security check

      if (error) throw error;
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      console.log('Property status updated successfully');
    } catch (error) {
      console.error('Error in updatePropertyStatus:', error);
      throw error;
    }
  },
  
  // Get property statistics for user dashboard
  async getPropertyStats(userId: string) {
    try {
      console.log('Fetching property stats for user:', userId);
      
      // Get total counts by status
      const { data: statusData, error: statusError } = await supabase
        .from('properties')
        .select('status, count')
        .eq('owner_id', userId)
        .group('status');

      if (statusError) throw statusError;

      // Process counts by status
      const counts = {
        total: 0,
        published: 0,
        draft: 0,
        archived: 0,
        views: 0,
        inquiries: 0,
      };

      statusData.forEach((item) => {
        if (item.status === 'published') counts.published = item.count;
        if (item.status === 'draft') counts.draft = item.count;
        if (item.status === 'archived') counts.archived = item.count;
        counts.total += item.count;
      });

      // TODO: Implement views and inquiries when those features are added

      return counts;
    } catch (error) {
      console.error('Error getting property stats:', error);
      throw error;
    }
  }
};