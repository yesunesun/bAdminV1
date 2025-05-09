// src/modules/owner/services/propertyService.ts
// Version: 8.2.0
// Last Modified: 09-05-2025 18:30 IST
// Purpose: Fixed issue with flow listingType preservation in property saving

import { supabase } from '@/lib/supabase';
import { FormData } from '../components/property/wizard/types';
import { 
  FLOW_TYPES,
  FLOW_STEPS,
  STEP_FIELD_MAPPINGS
} from '../components/property/wizard/constants/flows';

// Cache for properties to avoid redundant fetches
const propertiesCache = new Map<string, {data: any[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

// Keep the data version as v3 since it's still in development
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
  
  // Validate and ensure correct listingType, especially for Sale properties
  if (flowListingType.toLowerCase().includes('sale') || flowListingType.toLowerCase().includes('sell')) {
    flowListingType = 'sale';
    console.log('Enforcing SALE listing type in empty structure');
  }
  
  // Create base structure with new format
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
    steps: {}, // Initialize empty steps object
    media: {
      photos: {
        images: []
      },
      videos: {
        urls: []
      }
    }
  };
  
  // Get steps for this flow type
  const flowKey = `${flowCategory}_${flowListingType}`;
  const stepsArray = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
  
  // Create step objects inside the steps container
  stepsArray.forEach(step => {
    if (step !== 'media' && step !== 'review') { // Skip media and review
      structure.steps[step] = {};
    }
  });
  
  return structure;
};

/**
 * Organizes property data into the correct structure
 * @param propertyData Raw property data to organize
 */
const organizePropertyData = (propertyData: any): any => {
  if (!propertyData) return createEmptyPropertyStructure();
  
  // Preserve the original flow information, especially for Sale properties
  const flowCategory = propertyData.flow?.category || 'residential';
  const flowListingType = propertyData.flow?.listingType || 'rent';
  
  console.log(`Organizing property data with flow: ${flowCategory}_${flowListingType}`);
  
  // Check if the data already has the steps structure
  if (propertyData.steps) {
    // Already has steps structure, just ensure complete structure
    return ensureCompleteStructure(propertyData);
  }
  
  // Create a new structure since we don't need backward compatibility
  return createEmptyPropertyStructure(flowCategory, flowListingType);
};

/**
 * Ensures the data structure is complete with all required sections
 */
const ensureCompleteStructure = (data: any): any => {
  if (!data) return createEmptyPropertyStructure();
  
  // Clone the data to avoid mutations
  const result = JSON.parse(JSON.stringify(data));
  
  // Preserve the original flow information, especially for Sale properties
  const flowCategory = result.flow?.category || 'residential';
  let flowListingType = result.flow?.listingType || 'rent';
  
  // Validate and ensure correct listingType for Sale properties
  if (flowListingType.toLowerCase().includes('sale') || flowListingType.toLowerCase().includes('sell')) {
    flowListingType = 'sale';
    console.log('Preserving SALE listing type in structure');
  }
  
  // Ensure meta section exists
  if (!result.meta) {
    result.meta = {
      _version: DATA_VERSION,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    };
  } else {
    // Ensure version is set
    result.meta._version = DATA_VERSION;
  }
  
  // Ensure flow section exists and preserves the correct listingType
  if (!result.flow) {
    result.flow = {
      category: flowCategory,
      listingType: flowListingType
    };
  } else {
    // Ensure the listingType is preserved, especially for Sale properties
    if (flowListingType === 'sale') {
      result.flow.listingType = 'sale';
    }
  }
  
  // Ensure steps section exists
  if (!result.steps) {
    result.steps = {};
    
    // Initialize steps based on flow type
    const flowKey = `${flowCategory}_${flowListingType}`;
    const stepsArray = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
    
    stepsArray.forEach(step => {
      if (step !== 'media' && step !== 'review') {
        result.steps[step] = {};
      }
    });
  }
  
  // Ensure media section exists with photos and videos
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
  
  return result;
};

export const propertyService = {
  /**
   * Fetches all properties for a user with caching
   */
  async getUserProperties(userId: string, forceRefresh = false): Promise<any[]> {
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
      
      // IMPORTANT: Ensure flow information is preserved correctly, especially for Sale properties
      if (propertyData.flow?.listingType === 'sale' || 
          (propertyData.flow?.listingType || '').toLowerCase().includes('sale') ||
          (propertyData.flow?.listingType || '').toLowerCase().includes('sell')) {
        console.log('Preserving SALE listing type in createProperty');
        organizedData.flow.listingType = 'sale';
      }
      
      // Log the final flow information before saving
      console.log('Creating property with flow:', {
        category: organizedData.flow.category,
        listingType: organizedData.flow.listingType
      });
      
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
      
      // IMPORTANT: Ensure flow information is preserved correctly, especially for Sale properties
      if (propertyData.flow?.listingType === 'sale' || 
          (propertyData.flow?.listingType || '').toLowerCase().includes('sale') ||
          (propertyData.flow?.listingType || '').toLowerCase().includes('sell')) {
        console.log('Preserving SALE listing type in updateProperty');
        organizedData.flow.listingType = 'sale';
      }
      
      // Log the final flow information before updating
      console.log('Updating property with flow:', {
        category: organizedData.flow.category,
        listingType: organizedData.flow.listingType
      });
      
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
      
      // IMPORTANT: Ensure flow information is preserved correctly, especially for Sale properties
      if (propertyDetails.flow?.listingType === 'sale' || 
          (propertyDetails.flow?.listingType || '').toLowerCase().includes('sale') ||
          (propertyDetails.flow?.listingType || '').toLowerCase().includes('sell')) {
        console.log('Preserving SALE listing type in updatePropertyDetails');
        organizedData.flow.listingType = 'sale';
      }
      
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
    
    // Special handling for flow section to ensure listingType is preserved
    if (newData.flow) {
      if (!result.flow) result.flow = {};
      
      // Preserve category if it exists
      if (newData.flow.category) {
        result.flow.category = newData.flow.category;
      }
      
      // IMPORTANT: Ensure Sale listingType is preserved during merge
      if (newData.flow.listingType === 'sale' || 
          (newData.flow.listingType || '').toLowerCase().includes('sale') ||
          (newData.flow.listingType || '').toLowerCase().includes('sell')) {
        result.flow.listingType = 'sale';
        console.log('Preserving SALE listing type in merge');
      } else if (newData.flow.listingType) {
        result.flow.listingType = newData.flow.listingType;
      }
    }
    
    // Special handling for steps section to ensure full merging
    if (newData.steps && result.steps) {
      Object.keys(newData.steps).forEach(stepKey => {
        if (!result.steps[stepKey]) {
          result.steps[stepKey] = {};
        }
        
        deepMerge(result.steps[stepKey], newData.steps[stepKey]);
      });
    }
    
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