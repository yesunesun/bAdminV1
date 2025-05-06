// src/modules/owner/services/propertyService.ts
// Version: 8.0.0
// Last Modified: 06-05-2025 21:00 IST
// Purpose: Updated to support properties_v2 table with JSONB storage using flow-based steps

import { supabase } from '@/lib/supabase';
import { Property, FormData } from '../components/property/PropertyFormTypes';
import { 
  FLOW_TYPES,
  FLOW_STEPS,
  STEP_FIELD_MAPPINGS
} from '../components/property/wizard/constants/flows';

// Cache for properties to avoid redundant fetches
const propertiesCache = new Map<string, {data: Property[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

// Constants
const DATA_VERSION = 'v3';

/**
 * Creates a clean property data structure based on flow type
 * @param flowCategory Category of the property (residential, commercial, land)
 * @param flowListingType Type of listing (rent, sale, flatmates, etc.)
 */
const createEmptyPropertyStructure = (
  flowCategory: string = 'residential',
  flowListingType: string = 'rent'
): any => {
  // Set current timestamp
  const now = new Date().toISOString();
  
  // Create base structure
  const structure: any = {
    meta: {
      _version: DATA_VERSION,
      created_at: now,
      updated_at: now,
      status: 'draft'
    },
    flow: {
      category: flowCategory,
      listingType: flowListingType
    },
    media: {
      photos: {
        images: []
      }
    }
  };
  
  // Get steps for this flow type
  const flowKey = `${flowCategory}_${flowListingType}`;
  const steps = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
  
  // Create step objects
  steps.forEach(step => {
    if (step !== 'media') { // media is already at root level
      structure[step] = {};
    }
  });
  
  return structure;
};

/**
 * Organizes property data into the correct structure based on flow type
 * @param propertyData Raw property data to organize
 */
const organizePropertyData = (propertyData: any): any => {
  if (!propertyData) return createEmptyPropertyStructure();
  
  // Determine flow type
  let flowCategory = 'residential';
  let flowListingType = 'rent';
  
  // Get flow info from existing data if available
  if (propertyData.flow) {
    flowCategory = propertyData.flow.category || 'residential';
    flowListingType = propertyData.flow.listingType || 'rent';
  }
  
  // Create clean structure based on flow type
  const organizedData = createEmptyPropertyStructure(flowCategory, flowListingType);
  
  // Preserve meta data if exists
  if (propertyData.meta) {
    organizedData.meta = { ...propertyData.meta };
    // Ensure version is set
    organizedData.meta._version = DATA_VERSION;
  }
  
  // Preserve flow data if exists
  if (propertyData.flow) {
    organizedData.flow = { ...propertyData.flow };
  }
  
  // Preserve media if exists
  if (propertyData.media) {
    organizedData.media = { ...propertyData.media };
  }
  
  // Get flow steps
  const flowKey = `${flowCategory}_${flowListingType}`;
  const steps = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
  
  // Process each step
  steps.forEach(step => {
    if (step === 'media') return; // Skip media as it's handled separately
    
    // Copy step data if it exists
    if (propertyData[step]) {
      organizedData[step] = { ...propertyData[step] };
    }
    
    // Get field mappings for this step
    const fieldMappings = STEP_FIELD_MAPPINGS[step] || [];
    
    // Move fields from root to correct step
    fieldMappings.forEach(field => {
      if (propertyData[field] !== undefined) {
        organizedData[step][field] = propertyData[field];
      }
    });
  });
  
  // Clean up by removing empty objects
  Object.keys(organizedData).forEach(key => {
    if (key !== 'meta' && key !== 'flow' && key !== 'media' && 
        Object.keys(organizedData[key]).length === 0) {
      delete organizedData[key];
    }
  });
  
  return organizedData;
};

export const propertyService = {
  /**
   * Fetches all properties for a user with caching
   */
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
      
      // Fetch from properties_v2 table
      const { data, error } = await supabase
        .from('properties_v2')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Found properties in properties_v2:', data?.length || 0);
      
      // Format the properties data
      const formattedProperties = (data || []).map(property => {
        // Organize property data
        const organizedData = organizePropertyData(property.property_details);
        
        // Ensure IDs are set
        organizedData.meta.id = property.id;
        organizedData.meta.owner_id = property.owner_id;
        
        // Get images
        const images = organizedData.media?.photos?.images || [];
        
        return {
          id: property.id,
          owner_id: property.owner_id,
          created_at: property.created_at,
          updated_at: property.updated_at,
          status: property.status || 'draft',
          property_details: organizedData,
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

  /**
   * Fetches a single property by ID
   */
  async getPropertyById(id: string): Promise<Property> {
    try {
      console.log('Fetching property with ID:', id);
      
      const { data, error } = await supabase
        .from('properties_v2')
        .select('*')
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
      
      // Organize property data
      const organizedData = organizePropertyData(data.property_details);
      
      // Ensure IDs are set
      organizedData.meta.id = data.id;
      organizedData.meta.owner_id = data.owner_id;
      
      // Get images
      const images = organizedData.media?.photos?.images || [];
      
      return {
        id: data.id,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status || 'draft',
        property_details: organizedData,
        images
      };
    } catch (error) {
      console.error('Error in getPropertyById:', error);
      throw error;
    }
  },

  /**
   * Creates a new property
   */
  async createProperty(propertyData: FormData, userId: string, status: 'draft' | 'published' = 'draft'): Promise<Property> {
    try {
      console.log('Creating property with status:', status);
      
      // Organize property data
      const organizedData = organizePropertyData(propertyData);
      
      // Set metadata
      organizedData.meta.owner_id = userId;
      organizedData.meta.status = status;
      
      // Create in properties_v2 table
      const now = new Date().toISOString();
      
      const propertyRecord = {
        owner_id: userId,
        created_at: now,
        updated_at: now,
        status: status,
        property_details: organizedData
      };
      
      const { data, error } = await supabase
        .from('properties_v2')
        .insert([propertyRecord])
        .select();

      if (error) {
        console.error("Database error creating property:", error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error("No data returned after property creation");
      }
      
      console.log('Property created successfully in properties_v2, returned data:', data[0]);
      
      // Update the ID in the property details
      organizedData.meta.id = data[0].id;
      
      // Update the property details to include the ID
      await supabase
        .from('properties_v2')
        .update({
          property_details: organizedData,
        })
        .eq('id', data[0].id);
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      // Get images
      const images = organizedData.media?.photos?.images || [];
      
      return {
        id: data[0].id,
        owner_id: userId,
        created_at: now,
        updated_at: now,
        status: status,
        property_details: organizedData,
        images
      };
    } catch (error) {
      console.error('Error in createProperty:', error);
      throw error;
    }
  },

  /**
   * Updates an existing property
   */
  async updateProperty(
    propertyId: string,
    propertyData: FormData,
    userId: string,
    status?: 'draft' | 'published'
  ): Promise<Property> {
    try {
      console.log('Updating property:', propertyId);
      
      // Get current property data to merge with updates
      const { data: currentProperty, error: fetchError } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .eq('owner_id', userId)
        .single();
      
      // Start with clean data
      let mergedData = propertyData;
      
      // If we have current property data, merge it with new data
      if (!fetchError && currentProperty && currentProperty.property_details) {
        // Deep merge current and new data
        mergedData = this.mergePropertyData(currentProperty.property_details, propertyData);
      }
      
      // Organize the merged data
      const organizedData = organizePropertyData(mergedData);
      
      // Ensure metadata is set correctly
      organizedData.meta.id = propertyId;
      organizedData.meta.owner_id = userId;
      organizedData.meta.updated_at = new Date().toISOString();
      if (status) {
        organizedData.meta.status = status;
      }
      
      // Update in properties_v2 table
      const updateData = {
        updated_at: new Date().toISOString(),
        property_details: organizedData
      };
      
      if (status) {
        updateData.status = status;
      }
      
      const { data, error } = await supabase
        .from('properties_v2')
        .update(updateData)
        .eq('id', propertyId)
        .eq('owner_id', userId) // Security check
        .select()
        .single();

      if (error) {
        console.error("Database error updating property:", error);
        throw error;
      }
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      // Get images
      const images = organizedData.media?.photos?.images || [];
      
      return {
        id: data.id,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        property_details: organizedData,
        images
      };
    } catch (error) {
      console.error('Error in updateProperty:', error);
      throw error;
    }
  },

  /**
   * Updates just the property details
   */
  async updatePropertyDetails(
    propertyId: string,
    propertyDetails: any
  ): Promise<void> {
    try {
      console.log(`Updating property_details for property ${propertyId}`);
      
      // Organize property data
      const organizedData = organizePropertyData(propertyDetails);
      
      // Ensure metadata is set
      organizedData.meta.id = propertyId;
      organizedData.meta.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('properties_v2')
        .update({ 
          property_details: organizedData,
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

  /**
   * Updates property status
   */
  async updatePropertyStatus(
    propertyId: string,
    status: 'draft' | 'published',
    userId: string
  ): Promise<void> {
    try {
      console.log(`Updating property ${propertyId} status to ${status}`);
      
      // Get current property data
      const { data: currentProperty, error: fetchError } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .eq('owner_id', userId)
        .single();
        
      if (!fetchError && currentProperty) {
        // Organize property data
        const organizedData = organizePropertyData(currentProperty.property_details);
        
        // Update status in meta section
        organizedData.meta.id = propertyId;
        organizedData.meta.status = status;
        organizedData.meta.updated_at = new Date().toISOString();
        
        // Update property with version info and status
        const updateData = {
          status,
          property_details: organizedData,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('properties_v2')
          .update(updateData)
          .eq('id', propertyId)
          .eq('owner_id', userId);
        
        if (error) throw error;
      } else {
        // Fallback if can't get current property
        const updateData = {
          status,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('properties_v2')
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

  /**
   * Deletes a property
   */
  async deleteProperty(propertyId: string, userId: string): Promise<void> {
    try {
      console.log(`Deleting property ${propertyId} for user ${userId}`);
      
      const { error } = await supabase
        .from('properties_v2')
        .delete()
        .eq('id', propertyId)
        .eq('owner_id', userId);
      
      if (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
      
      console.log(`Property ${propertyId} successfully deleted from properties_v2`);
      propertiesCache.delete(userId);
      
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      throw error;
    }
  },

  /**
   * Admin property deletion
   */
  async adminDeleteProperty(propertyId: string): Promise<void> {
    try {
      console.log(`Admin deleting property ${propertyId}`);
      
      const { error } = await supabase
        .from('properties_v2')
        .delete()
        .eq('id', propertyId);
      
      if (error) {
        console.error('Error in admin property deletion:', error);
        throw error;
      }
      
      console.log(`Property ${propertyId} successfully deleted from properties_v2 by admin`);
      propertiesCache.clear();
      
    } catch (error) {
      console.error('Error in adminDeleteProperty:', error);
      throw error;
    }
  },

  /**
   * Check if user is admin
   */
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
  },

  /**
   * Helper method to deep merge property data
   */
  mergePropertyData(oldData: any, newData: any): any {
    // Start with a clone of old data
    const result = JSON.parse(JSON.stringify(oldData));
    
    // Helper function for deep merging
    const deepMerge = (target: any, source: any) => {
      if (!source) return target;
      
      Object.keys(source).forEach(key => {
        // Skip if undefined
        if (source[key] === undefined) return;
        
        // If both are objects and not arrays, recursively merge
        if (
          source[key] && 
          typeof source[key] === 'object' && 
          !Array.isArray(source[key]) &&
          target[key] && 
          typeof target[key] === 'object' && 
          !Array.isArray(target[key])
        ) {
          deepMerge(target[key], source[key]);
        }
        // Otherwise replace with source value
        else {
          target[key] = source[key];
        }
      });
    };
    
    // Merge at top level
    deepMerge(result, newData);
    
    // Special handling for meta section
    if (newData.meta) {
      if (!result.meta) result.meta = {};
      result.meta = { ...result.meta, ...newData.meta };
      result.meta._version = DATA_VERSION;
      result.meta.updated_at = new Date().toISOString();
    }
    
    return result;
  }
};