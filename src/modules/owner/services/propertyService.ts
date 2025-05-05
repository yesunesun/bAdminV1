// src/modules/owner/services/propertyService.ts
// Version: 6.0.0
// Last Modified: 05-05-2025 17:30 IST
// Purpose: Updated to only support v3 data structure

import { supabase } from '@/lib/supabase';
import { Property, FormData } from '../components/property/PropertyFormTypes';
import { 
  detectDataVersion, 
  DATA_VERSION_V3,
  ensureV3Structure,
  convertToDbFormat
} from '../components/property/wizard/utils/propertyDataAdapter';

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
              isPrimary: img.is_primary,
              displayOrder: img.display_order || 0
            }))
          : [];
        
        // Ensure property_details exists
        if (!property.property_details) {
          property.property_details = {};
        }
        
        // Detect data version 
        const dataVersion = detectDataVersion(property.property_details);
        console.log(`Property ${property.id} has data version: ${dataVersion}`);
        
        // Normalize to v3 structure
        const normalizedDetails = ensureV3Structure(property.property_details);
        
        // Always make sure ID is in the meta section
        normalizedDetails.meta.id = property.id;
        
        // If this is a newly converted property, update it in the database
        if (dataVersion !== DATA_VERSION_V3) {
          // Update in background, don't wait
          this.updatePropertyDetails(property.id, normalizedDetails)
            .catch(err => console.error('Error updating converted property:', err));
        }
        
        return {
          ...property,
          property_details: normalizedDetails,
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
      
      // Process the images
      const images = data.property_images
        ? data.property_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.is_primary,
            displayOrder: img.display_order || 0
          }))
        : [];
      
      // Make sure property_details exists
      if (!data.property_details) {
        console.warn('Property has no property_details, creating empty object');
        data.property_details = {};
      }
      
      // Detect data version
      const dataVersion = detectDataVersion(data.property_details);
      console.log(`Property ${data.id} has data version: ${dataVersion}`);
      
      // Normalize to v3 structure
      const normalizedDetails = ensureV3Structure(data.property_details);
      
      // Always make sure ID is in the meta section
      normalizedDetails.meta.id = data.id;
      
      // If this is a newly converted property, update it in the database
      if (dataVersion !== DATA_VERSION_V3) {
        // Update in background, don't wait
        this.updatePropertyDetails(data.id, normalizedDetails)
          .catch(err => console.error('Error updating converted property:', err));
      }
      
      return {
        ...data,
        property_details: normalizedDetails,
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
      
      // Ensure data is in v3 format
      const v3Data = ensureV3Structure(propertyData);
      
      // Add metadata
      v3Data.meta = v3Data.meta || {
        _version: DATA_VERSION_V3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: status
      };
      
      v3Data.meta.owner_id = userId;
      v3Data.meta.status = status;
      
      // Convert to database format
      const dbPropertyData = convertToDbFormat(v3Data);
      
      // Make sure owner_id is set
      dbPropertyData.owner_id = userId;
      dbPropertyData.status = status;
      dbPropertyData.tags = status === 'published' ? ['public'] : [];
      
      // Explicitly remove id if it's undefined to let the database generate it
      if (dbPropertyData.id === undefined) {
        delete dbPropertyData.id;
      }
      
      console.log('Property database payload:', dbPropertyData);
      
      const { data, error } = await supabase
        .from('properties')
        .insert([dbPropertyData])
        .select();

      if (error) {
        console.error("Database error creating property:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned after property creation");
      }
      
      console.log('Property created successfully, returned data:', data[0]);
      
      // Update the ID in the original v3 data
      v3Data.meta.id = data[0].id;
      
      // Update the full property details in the database
      await this.updatePropertyDetails(data[0].id, v3Data);
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      return {
        ...data[0],
        property_details: v3Data,
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
      
      // Ensure data is in v3 format
      const v3Data = ensureV3Structure(propertyData);
      
      // Update metadata
      v3Data.meta = v3Data.meta || {
        _version: DATA_VERSION_V3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: status || 'draft'
      };
      
      v3Data.meta.id = propertyId;
      v3Data.meta.updated_at = new Date().toISOString();
      if (status) {
        v3Data.meta.status = status;
      }
      
      // Convert to database format
      const dbUpdateData = convertToDbFormat(v3Data);
      
      // Ensure owner_id is not overwritten
      delete dbUpdateData.owner_id;
      
      // If status is provided, include it in the update
      if (status) {
        dbUpdateData.status = status;
        dbUpdateData.tags = status === 'published' ? ['public'] : [];
      }
      
      console.log('Property update payload:', dbUpdateData);

      const { data, error } = await supabase
        .from('properties')
        .update(dbUpdateData)
        .eq('id', propertyId)
        .eq('owner_id', userId) // Security check
        .select(`
          *,
          property_images(*)
        `)
        .single();

      if (error) {
        console.error("Database error updating property:", error);
        throw error;
      }
      
      // Process the images
      const images = data.property_images
        ? data.property_images.map((img: any) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.is_primary,
            displayOrder: img.display_order || 0
          }))
        : [];
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      return {
        ...data,
        property_details: v3Data,
        images
      };
    } catch (error) {
      console.error('Error in updateProperty:', error);
      throw error;
    }
  },

  // Update just the property_details field
  async updatePropertyDetails(
    propertyId: string,
    propertyDetails: any
  ): Promise<void> {
    try {
      console.log(`Updating property_details for property ${propertyId}`);
      
      // Ensure we're using v3 structure
      const v3Data = ensureV3Structure(propertyDetails);
      
      // Update the meta data
      v3Data.meta = v3Data.meta || {};
      v3Data.meta._version = DATA_VERSION_V3;
      v3Data.meta.id = propertyId;
      v3Data.meta.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('properties')
        .update({ 
          property_details: v3Data,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);
      
      if (error) throw error;
      
      // Clear all caches since we don't know which user owns this property
      propertiesCache.clear();
      
    } catch (error) {
      console.error('Error in updatePropertyDetails:', error);
      throw error;
    }
  },

  // Update property status
  async updatePropertyStatus(
    propertyId: string,
    status: 'draft' | 'published',
    userId: string
  ): Promise<void> {
    try {
      console.log(`Updating property ${propertyId} status to ${status}`);
      
      // Get current property data
      const { data: currentProperty, error: fetchError } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', propertyId)
        .single();
        
      if (!fetchError && currentProperty) {
        // Ensure property data is in v3 format
        const v3Data = ensureV3Structure(currentProperty.property_details);
        
        // Update status in meta section
        v3Data.meta.id = propertyId;
        v3Data.meta.status = status;
        v3Data.meta.updated_at = new Date().toISOString();
        
        // Update property with version info and status
        const updateData = {
          status,
          tags: status === 'published' ? ['public'] : [],
          property_details: v3Data,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', propertyId)
          .eq('owner_id', userId);
        
        if (error) throw error;
      } else {
        // Fallback if can't get current property
        const updateData = {
          status,
          tags: status === 'published' ? ['public'] : [],
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('properties')
          .update(updateData)
          .eq('id', propertyId)
          .eq('owner_id', userId);
        
        if (error) throw error;
      }
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
    } catch (error) {
      console.error('Error in updatePropertyStatus:', error);
      throw error;
    }
  },

  // Delete property
  async deleteProperty(propertyId: string, userId: string): Promise<void> {
    try {
      console.log(`Deleting property ${propertyId} for user ${userId}`);
      
      // First, delete all property images (this handles the foreign key constraint)
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId);
      
      if (imagesError) {
        console.error('Error deleting property images:', imagesError);
        throw imagesError;
      }
      
      // Then delete the property
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('owner_id', userId); // Security check
      
      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      console.log(`Property ${propertyId} successfully deleted`);
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      throw error;
    }
  },

  // Admin property deletion
  async adminDeleteProperty(propertyId: string): Promise<void> {
    try {
      console.log(`Admin deleting property ${propertyId}`);
      
      // First, delete all property images (this handles the foreign key constraint)
      const { error: imagesError } = await supabase
        .from('property_images')
        .delete()
        .eq('property_id', propertyId);
      
      if (imagesError) {
        console.error('Error deleting property images:', imagesError);
        throw imagesError;
      }
      
      // Then delete the property without the owner_id check
      // The database policy will ensure only admins can do this
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);
      
      if (error) {
        console.error('Error in admin property deletion:', error);
        throw error;
      }
      
      // Clear all user caches since we don't know which user owned this property
      propertiesCache.clear();
      
      console.log(`Property ${propertyId} successfully deleted by admin`);
    } catch (error) {
      console.error('Error in adminDeleteProperty:', error);
      throw error;
    }
  },

  // Check if user is admin
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('role_id, admin_roles(role_type)')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) return false;
      
      // Check if user has admin role
      const roleType = data.admin_roles?.role_type;
      return roleType === 'admin' || 
             roleType === 'super_admin' || 
             roleType === 'property_moderator';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }
};