// src/modules/owner/services/propertyService.ts
// Version: 9.2.0
// Last Modified: 18-05-2025 17:50 IST
// Purpose: Enhanced flow detection and improved flatmate data handling

import { supabase } from '@/lib/supabase';
import { FormData } from '../components/property/wizard/types';
import { FLOW_STEPS } from '../components/property/wizard/constants/flows';
import { FlowServiceFactory } from '../components/property/wizard/services/flows/FlowServiceFactory';

// Cache for properties
const propertiesCache = new Map<string, {data: any[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

// Data version for the new structure
const DATA_VERSION = 'v3';

/**
 * Creates a clean property data structure based on flow type
 */
const createEmptyPropertyStructure = (
  flowCategory: string = 'residential',
  flowListingType: string = 'rent'
): any => {
  const now = new Date().toISOString();
  
  // Get flow-specific steps
  const flowKey = `${flowCategory}_${flowListingType}`;
  const flowSteps = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
  
  // Initialize structure - ONLY with meta, flow, steps, and media
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
    steps: {},
    media: {
      photos: {
        images: []
      },
      videos: {
        urls: []
      }
    }
  };
  
  // Initialize each step with empty object (excluding review step)
  flowSteps.forEach(stepId => {
    if (!stepId.includes('_review')) {
      structure.steps[stepId] = {};
    }
  });
  
  return structure;
};

/**
 * Organizes property data into the correct structure
 */
const organizePropertyData = (propertyData: any): any => {
  if (!propertyData) return createEmptyPropertyStructure();
  
  const flowCategory = propertyData.flow?.category || 'residential';
  const flowListingType = propertyData.flow?.listingType || 'rent';
  
  console.log(`Organizing property data with flow: ${flowCategory}_${flowListingType}`);
  
  // Check if data is already in the new format with steps
  if (propertyData.steps && Object.keys(propertyData.steps).length > 0) {
    return ensureCompleteStructure(propertyData);
  }
  
  // Create flow context for proper detection
  const flowContext = {
    urlPath: window.location.pathname,
    adType: `${flowCategory}_${flowListingType}`,
    category: flowCategory,
    listingType: flowListingType
  };
  
  // Use FlowServiceFactory to convert legacy data to new format
  try {
    const flowService = FlowServiceFactory.getFlowService(propertyData, flowContext);
    const formattedData = flowService.formatData(propertyData);
    return ensureCompleteStructure(formattedData);
  } catch (error) {
    console.error('Error formatting property data:', error);
    
    // Fallback to simple flow service
    try {
      const flowService = FlowServiceFactory.getService(flowCategory, flowListingType);
      const formattedData = flowService.formatData(propertyData);
      return ensureCompleteStructure(formattedData);
    } catch (fallbackError) {
      console.error('Error with fallback flow service:', fallbackError);
      return ensureCompleteStructure(propertyData);
    }
  }
};

/**
 * Ensures the data structure is complete with all required sections
 * ONLY meta, flow, steps, and media - NO root-level sections
 */
const ensureCompleteStructure = (data: any): any => {
  if (!data) return createEmptyPropertyStructure();
  
  // Clone the data to avoid mutations
  const result = JSON.parse(JSON.stringify(data));
  
  const flowCategory = result.flow?.category || 'residential';
  const flowListingType = result.flow?.listingType || 'rent';
  
  // Get flow-specific steps
  const flowKey = `${flowCategory}_${flowListingType}`;
  const flowSteps = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
  
  // Ensure meta section exists
  if (!result.meta) {
    result.meta = {
      _version: DATA_VERSION,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    };
  } else {
    result.meta._version = DATA_VERSION;
    result.meta.updated_at = new Date().toISOString();
  }
  
  // Ensure flow section exists
  if (!result.flow) {
    result.flow = {
      category: flowCategory,
      listingType: flowListingType
    };
  }
  
  // Ensure steps section exists with all required steps (excluding review)
  if (!result.steps) {
    result.steps = {};
  }
  
  flowSteps.forEach(stepId => {
    if (!stepId.includes('_review') && !result.steps[stepId]) {
      result.steps[stepId] = {};
    }
  });
  
  // Special handling for flatmate details to ensure data is preserved
  if (result.flow.listingType === 'flatmates' && result.flatmate_details) {
    const flatmateStepId = flowSteps.find(step => step.includes('_flatmate_details'));
    if (flatmateStepId && (!result.steps[flatmateStepId] || Object.keys(result.steps[flatmateStepId]).length === 0)) {
      result.steps[flatmateStepId] = { ...result.flatmate_details };
    }
  }
  
  // Ensure media section exists
  if (!result.media) {
    result.media = {
      photos: { images: [] },
      videos: { urls: [] }
    };
  } else {
    if (!result.media.photos) {
      result.media.photos = { images: [] };
    }
    if (!result.media.videos) {
      result.media.videos = { urls: [] };
    }
  }
  
  // Remove any old root-level sections to keep output clean
  delete result.details;
  delete result.location;
  delete result.rental;
  delete result.sale;
  delete result.features;
  delete result.flatmate_details;
  delete result.pg_details;
  delete result.coworking;
  delete result.land_features;
  delete result.basicDetails;
  delete result.rentalInfo;
  delete result.saleInfo;
  delete result.commercial_details;
  
  return result;
};

export const propertyService = {
  /**
   * Fetches all properties for a user with caching
   */
  async getUserProperties(userId: string, forceRefresh = false): Promise<any[]> {
    const now = Date.now();
    const cachedData = propertiesCache.get(userId);
    
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_EXPIRY) {
      console.log('Returning cached properties for user:', userId);
      return cachedData.data;
    }
    
    try {
      console.log('Fetching properties for user:', userId);
      
      const { data, error } = await supabase
        .from('properties_v2')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Found properties in properties_v2:', data?.length || 0);
      
      // Format the properties data
      const formattedProperties = (data || []).map(property => {
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
  async getPropertyById(id: string): Promise<any> {
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
  async createProperty(propertyData: FormData, userId: string, status: 'draft' | 'published' = 'draft'): Promise<any> {
    try {
      console.log('Creating property with status:', status);
      
      // Organize property data
      const organizedData = organizePropertyData(propertyData);
      
      // Set metadata
      organizedData.meta.owner_id = userId;
      organizedData.meta.status = status;
      
      // Ensure flow information is correct
      if (propertyData.flow) {
        organizedData.flow = propertyData.flow;
      }
      
      console.log('Creating property with flow:', organizedData.flow);
      
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
      
      console.log('Property created successfully in properties_v2');
      
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
  ): Promise<any> {
    try {
      console.log('Updating property:', propertyId);
      
      // Get current property data to merge with updates
      const { data: currentProperty, error: fetchError } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .eq('owner_id', userId)
        .single();
      
      let mergedData = propertyData;
      
      // Merge current and new data
      if (!fetchError && currentProperty?.property_details) {
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
      
      // Ensure flow information is correct
      if (propertyData.flow) {
        organizedData.flow = propertyData.flow;
      }
      
      console.log('Updating property with flow:', organizedData.flow);
      
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
        .eq('owner_id', userId)
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
   * Helper method to deep merge property data
   */
  mergePropertyData(oldData: any, newData: any): any {
    // Start with a clone of old data
    const result = JSON.parse(JSON.stringify(oldData));
    
    // Helper function for deep merging
    const deepMerge = (target: any, source: any) => {
      if (!source) return target;
      
      Object.keys(source).forEach(key => {
        if (source[key] === undefined) return;
        
        // Special handling for steps section
        if (key === 'steps' && target[key] && source[key]) {
          Object.keys(source[key]).forEach(stepKey => {
            if (!target[key][stepKey]) {
              target[key][stepKey] = {};
            }
            deepMerge(target[key][stepKey], source[key][stepKey]);
          });
        }
        // If both are objects and not arrays, recursively merge
        else if (
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
    
    // Ensure proper structure
    if (result.meta) {
      result.meta._version = DATA_VERSION;
      result.meta.updated_at = new Date().toISOString();
    }
    
    return result;
  }
};