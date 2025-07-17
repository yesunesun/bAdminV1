// src/modules/owner/services/propertyService.ts
// Version: 10.0.0
// Last Modified: 17-07-2025 22:20 IST
// Purpose: Enhanced flow detection, improved flatmate data handling, automatic property code generation, and direct image support

import { supabase } from '@/lib/supabase';
import { FormData } from '../components/property/wizard/types';
import { FLOW_STEPS } from '../components/property/wizard/constants/flows';
import { FlowServiceFactory } from '../components/property/wizard/services/flows/FlowServiceFactory';
import { generatePropertyCode } from '@/lib/utils';

// Cache for properties
const propertiesCache = new Map<string, {data: any[], timestamp: number}>();
const CACHE_EXPIRY = 60000; // 1 minute cache expiry

// Data version for the new structure
const DATA_VERSION = 'v4'; // Updated for direct images

/**
 * Extracts coordinates from property data
 */
const extractCoordinates = (propertyData: any): { latitude: number | null, longitude: number | null } => {
  if (!propertyData || !propertyData.steps) {
    return { latitude: null, longitude: null };
  }

  // Look for coordinates in location-related steps
  const locationSteps = Object.keys(propertyData.steps).filter(stepId => 
    stepId.includes('location') || stepId.includes('_location')
  );

  for (const stepId of locationSteps) {
    const stepData = propertyData.steps[stepId];
    if (stepData && stepData.latitude && stepData.longitude) {
      const lat = parseFloat(stepData.latitude);
      const lng = parseFloat(stepData.longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }
  }

  // Fallback: Look for coordinates in any step
  for (const stepId of Object.keys(propertyData.steps)) {
    const stepData = propertyData.steps[stepId];
    if (stepData && stepData.latitude && stepData.longitude) {
      const lat = parseFloat(stepData.latitude);
      const lng = parseFloat(stepData.longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return { latitude: lat, longitude: lng };
      }
    }
  }

  return { latitude: null, longitude: null };
};

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
  
  // Initialize structure - ONLY with meta, flow, steps, imageFiles
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
    imageFiles: [] // Direct image storage
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
 * Migrates old image structure to new direct image structure
 */
const migrateImageStructure = (propertyData: any): any => {
  if (!propertyData) return propertyData;

  // If already has imageFiles, return as is
  if (propertyData.imageFiles && Array.isArray(propertyData.imageFiles)) {
    return propertyData;
  }

  // Initialize imageFiles array
  const imageFiles = [];

  // Check various old image storage locations
  const imageSources = [
    propertyData.media?.photos?.images,
    propertyData.media?.images,
    propertyData.photos?.images,
    propertyData.images,
    propertyData.steps?.image_upload?.images,
    propertyData.steps?.media?.images
  ];

  for (const source of imageSources) {
    if (Array.isArray(source) && source.length > 0) {
      source.forEach((img, index) => {
        if (img && (img.url || img.dataUrl)) {
          imageFiles.push({
            id: img.id || `migrated_${Date.now()}_${index}`,
            fileName: img.fileName || img.filename || `image_${index}.jpg`,
            url: img.url || img.dataUrl,
            isPrimary: img.isPrimary || img.is_primary || index === 0,
            uploadedAt: img.uploadedAt || img.created_at || new Date().toISOString(),
            fileSize: img.fileSize || img.size || 0,
            displayOrder: img.displayOrder || index
          });
        }
      });
      break; // Use first found source
    }
  }

  // Remove old image structures and add new imageFiles
  const cleanedData = { ...propertyData };
  delete cleanedData.media;
  delete cleanedData.photos;
  delete cleanedData.images;
  
  // Clean steps
  if (cleanedData.steps) {
    Object.keys(cleanedData.steps).forEach(stepKey => {
      if (cleanedData.steps[stepKey]) {
        delete cleanedData.steps[stepKey].images;
        delete cleanedData.steps[stepKey].media;
        delete cleanedData.steps[stepKey].photos;
      }
    });
  }

  cleanedData.imageFiles = imageFiles;
  
  console.log(`Migrated ${imageFiles.length} images to new structure`);
  return cleanedData;
};

/**
 * Organizes property data into the correct structure
 */
const organizePropertyData = (propertyData: any): any => {
  if (!propertyData) return createEmptyPropertyStructure();
  
  const flowCategory = propertyData.flow?.category || 'residential';
  const flowListingType = propertyData.flow?.listingType || 'rent';
  
  console.log(`Organizing property data with flow: ${flowCategory}_${flowListingType}`);
  
  // Migrate image structure first
  const migratedData = migrateImageStructure(propertyData);
  
  // Check if data is already in the new format with steps
  if (migratedData.steps && Object.keys(migratedData.steps).length > 0) {
    return ensureCompleteStructure(migratedData);
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
    const flowService = FlowServiceFactory.getFlowService(migratedData, flowContext);
    const formattedData = flowService.formatData(migratedData);
    return ensureCompleteStructure(formattedData);
  } catch (error) {
    console.error('Error formatting property data:', error);
    
    // Fallback to simple flow service
    try {
      const flowService = FlowServiceFactory.getService(flowCategory, flowListingType);
      const formattedData = flowService.formatData(migratedData);
      return ensureCompleteStructure(formattedData);
    } catch (fallbackError) {
      console.error('Error with fallback flow service:', fallbackError);
      return ensureCompleteStructure(migratedData);
    }
  }
};

/**
 * Ensures the data structure is complete with all required sections
 * ONLY meta, flow, steps, and imageFiles - NO root-level sections
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
  
  // Ensure imageFiles array exists
  if (!result.imageFiles || !Array.isArray(result.imageFiles)) {
    result.imageFiles = [];
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
  delete result.media;
  delete result.photos;
  delete result.images;
  
  return result;
};

/**
 * Gets the primary image URL from imageFiles array
 */
const getPrimaryImageUrl = (imageFiles: any[]): string | null => {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return null;
  }

  // Find primary image
  const primaryImage = imageFiles.find(img => img.isPrimary);
  if (primaryImage && primaryImage.url) {
    return primaryImage.url;
  }

  // Fallback to first image
  const firstImage = imageFiles[0];
  if (firstImage && firstImage.url) {
    return firstImage.url;
  }

  return null;
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
        
        // Get images from new structure
        const images = organizedData.imageFiles || [];
        const primaryImageUrl = getPrimaryImageUrl(images);
        
        return {
          id: property.id,
          owner_id: property.owner_id,
          created_at: property.created_at,
          updated_at: property.updated_at,
          status: property.status || 'draft',
          property_details: organizedData,
          images,
          primaryImageUrl
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
      
      // Get images from new structure
      const images = organizedData.imageFiles || [];
      const primaryImageUrl = getPrimaryImageUrl(images);
      
      return {
        id: data.id,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status || 'draft',
        property_details: organizedData,
        images,
        primaryImageUrl
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
      
      // Extract coordinates from property data
      const coords = extractCoordinates(organizedData);
      
      const propertyRecord = {
        owner_id: userId,
        created_at: now,
        updated_at: now,
        status: status,
        property_details: organizedData,
        coordinates: coords.latitude && coords.longitude ? 
          { lat: coords.latitude, lng: coords.longitude } : null
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
      
      // Generate property code automatically during creation
      try {
        const propertyCode = await generatePropertyCode(data[0].id, { property_details: organizedData });
        organizedData.meta.code = propertyCode;
        organizedData.meta.codeGeneratedAt = new Date().toISOString();
        console.log(`✅ Generated property code for new property ${data[0].id}: ${propertyCode}`);
      } catch (error) {
        console.error('❌ Error generating property code during creation:', error);
      }
      
      // Update the property details to include the ID and code
      await supabase
        .from('properties_v2')
        .update({
          property_details: organizedData,
        })
        .eq('id', data[0].id);
      
      // Clear cache for this user
      propertiesCache.delete(userId);
      
      // Get images from new structure
      const images = organizedData.imageFiles || [];
      const primaryImageUrl = getPrimaryImageUrl(images);
      
      return {
        id: data[0].id,
        owner_id: userId,
        created_at: now,
        updated_at: now,
        status: status,
        property_details: organizedData,
        images,
        primaryImageUrl
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
      // Extract coordinates from property data
      const coords = extractCoordinates(organizedData);
      
      const updateData = {
        updated_at: new Date().toISOString(),
        property_details: organizedData,
        coordinates: coords.latitude && coords.longitude ? 
          { lat: coords.latitude, lng: coords.longitude } : null
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
      
      // Get images from new structure
      const images = organizedData.imageFiles || [];
      const primaryImageUrl = getPrimaryImageUrl(images);
      
      return {
        id: data.id,
        owner_id: data.owner_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        status: data.status,
        property_details: organizedData,
        images,
        primaryImageUrl
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
        // Special handling for imageFiles - replace completely if provided
        else if (key === 'imageFiles' && Array.isArray(source[key])) {
          target[key] = source[key];
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
  },

  /**
   * Generates property codes for existing properties that don't have codes
   * This is a utility function to backfill property codes
   */
  async generateCodesForExistingProperties(userId?: string): Promise<{success: number, errors: number, total: number}> {
    try {
      console.log('🔄 Starting property code generation...');
      
      // Build query to get properties without codes
      let query = supabase
        .from('properties_v2')
        .select('id, property_details')
        .or('property_details->meta->code.is.null,property_details->meta->code.eq.""');
      
      // Filter by user if specified
      if (userId) {
        query = query.eq('owner_id', userId);
      }
      
      const { data: properties, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching properties:', error);
        throw error;
      }
      
      if (!properties || properties.length === 0) {
        console.log('✅ No properties found without codes.');
        return { success: 0, errors: 0, total: 0 };
      }
      
      console.log(`📊 Found ${properties.length} properties without codes. Generating codes...`);
      
      let successCount = 0;
      let errorCount = 0;
      
      // Process properties in batches
      const batchSize = 5;
      for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        
        console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(properties.length / batchSize)}...`);
        
        const promises = batch.map(async (property) => {
          try {
            // Generate code for this property
            const propertyCode = await generatePropertyCode(property.id, property);
            
            // Update the property details with the generated code
            const updatedPropertyDetails = {
              ...property.property_details,
              meta: {
                ...property.property_details.meta,
                code: propertyCode,
                codeGeneratedAt: new Date().toISOString()
              }
            };
            
            // Update the property in the database
            const { error: updateError } = await supabase
              .from('properties_v2')
              .update({
                property_details: updatedPropertyDetails,
                updated_at: new Date().toISOString()
              })
              .eq('id', property.id);
            
            if (updateError) {
              console.error(`❌ Error updating property ${property.id}:`, updateError);
              errorCount++;
            } else {
              console.log(`✅ Generated code for property ${property.id}: ${propertyCode}`);
              successCount++;
            }
          } catch (error) {
            console.error(`❌ Error processing property ${property.id}:`, error);
            errorCount++;
          }
        });
        
        await Promise.all(promises);
        
        // Brief pause between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`\n📊 Property code generation complete!`);
      console.log(`✅ Successfully generated codes for ${successCount} properties`);
      console.log(`❌ Failed to generate codes for ${errorCount} properties`);
      
      // Clear cache if user-specific
      if (userId) {
        propertiesCache.delete(userId);
      }
      
      return {
        success: successCount,
        errors: errorCount,
        total: properties.length
      };
      
    } catch (error) {
      console.error('❌ Error in generateCodesForExistingProperties:', error);
      throw error;
    }
  }
};

// End of file