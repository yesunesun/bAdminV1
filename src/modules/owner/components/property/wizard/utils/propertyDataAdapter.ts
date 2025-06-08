// src/modules/owner/components/property/wizard/utils/propertyDataAdapter.ts
// Version: 4.3.0
// Last Modified: 18-05-2025 11:45 IST
// Purpose: Fix steps initialization based on flow type without causing re-renders

import { FLOW_TYPES, FLOW_STEPS } from '../constants/flows';

/**
 * Data structure version constants
 */
export const DATA_VERSION_V3 = 'v3';
export const CURRENT_DATA_VERSION = DATA_VERSION_V3;

/**
 * Detects the version of property data structure
 * @param data Property data to check
 * @returns Version string (v3)
 */
export const detectDataVersion = (data: any): string => {
  if (!data) return CURRENT_DATA_VERSION;
  
  // If there's explicit version in meta, use that
  if (data.meta && data.meta._version) {
    return data.meta._version;
  }
  
  // Check for v3 structure (meta, flow, steps sections)
  if (data.meta && data.flow && data.steps) {
    return DATA_VERSION_V3;
  }
  
  // Default to v3
  return CURRENT_DATA_VERSION;
};

/**
 * Detects specialized property types from data
 */
export const detectSpecializedPropertyType = (data: any): {
  isCoworking: boolean;
  isPGHostel: boolean;
  isFlatmate: boolean;
  isLand: boolean;
} => {
  if (!data) {
    return {
      isCoworking: false,
      isPGHostel: false,
      isFlatmate: false,
      isLand: false
    };
  }
  
  // For v3 format
  if (data.flow) {
    return {
      isCoworking: data.flow.listingType === 'coworking' || data.flow.flowType === FLOW_TYPES.COMMERCIAL_COWORKING,
      isPGHostel: data.flow.listingType === 'pghostel' || data.flow.flowType === FLOW_TYPES.RESIDENTIAL_PGHOSTEL,
      isFlatmate: data.flow.listingType === 'flatmates' || data.flow.flowType === FLOW_TYPES.RESIDENTIAL_FLATMATES,
      isLand: data.flow.category === 'land' || data.flow.flowType === FLOW_TYPES.LAND_SALE
    };
  }
  
  // Default if structure is unclear
  return {
    isCoworking: false,
    isPGHostel: false,
    isFlatmate: false,
    isLand: false
  };
};

/**
 * Determines the appropriate flow type based on category and listing type
 * @param category Property category (residential, commercial, land)
 * @param listingType Listing type (rent, sale, pghostel, flatmates, coworking)
 * @returns Flow type key from FLOW_TYPES
 */
export const determineFlowType = (
  category: string = '',
  listingType: string = ''
): string => {
  const normalizedCategory = (category || '').toLowerCase();
  const normalizedListingType = (listingType || '').toLowerCase();
  
  // Map to the appropriate flow type
  if (normalizedCategory === 'residential') {
    if (normalizedListingType === 'rent') return FLOW_TYPES.RESIDENTIAL_RENT;
    if (normalizedListingType === 'sale') return FLOW_TYPES.RESIDENTIAL_SALE;
    if (normalizedListingType === 'flatmates') return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    if (normalizedListingType === 'pghostel') return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
  } else if (normalizedCategory === 'commercial') {
    if (normalizedListingType === 'rent') return FLOW_TYPES.COMMERCIAL_RENT;
    if (normalizedListingType === 'sale') return FLOW_TYPES.COMMERCIAL_SALE;
    if (normalizedListingType === 'coworking') return FLOW_TYPES.COMMERCIAL_COWORKING;
  } else if (normalizedCategory === 'land') {
    return FLOW_TYPES.LAND_SALE;
  }
  
  // Handle the case of empty or invalid inputs
  if (!normalizedCategory && !normalizedListingType) {
    return FLOW_TYPES.DEFAULT;
  }
  
  // Special handling for just listingType
  if (!normalizedCategory) {
    if (normalizedListingType === 'rent') return FLOW_TYPES.RESIDENTIAL_RENT;
    if (normalizedListingType === 'sale') return FLOW_TYPES.RESIDENTIAL_SALE;
    if (normalizedListingType === 'flatmates') return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    if (normalizedListingType === 'pghostel') return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    if (normalizedListingType === 'coworking') return FLOW_TYPES.COMMERCIAL_COWORKING;
  }
  
  // Fallback to default flow
  return FLOW_TYPES.DEFAULT;
};

/**
 * Normalizes category and listing type based on flow type for consistency
 * @param flowType The flow type from FLOW_TYPES
 * @returns Normalized category and listing type
 */
export const normalizeFlowValues = (
  flowType: string
): { category: string, listingType: string } => {
  switch(flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
      return { category: 'residential', listingType: 'rent' };
    
    case FLOW_TYPES.RESIDENTIAL_SALE:
      return { category: 'residential', listingType: 'sale' };
      
    case FLOW_TYPES.RESIDENTIAL_FLATMATES:
      return { category: 'residential', listingType: 'flatmates' };
      
    case FLOW_TYPES.RESIDENTIAL_PGHOSTEL:
      return { category: 'residential', listingType: 'pghostel' };
      
    case FLOW_TYPES.COMMERCIAL_RENT:
      return { category: 'commercial', listingType: 'rent' };
      
    case FLOW_TYPES.COMMERCIAL_SALE:
      return { category: 'commercial', listingType: 'sale' };
      
    case FLOW_TYPES.COMMERCIAL_COWORKING:
      return { category: 'commercial', listingType: 'coworking' };
      
    case FLOW_TYPES.LAND_SALE:
      return { category: 'land', listingType: 'sale' };
      
    default:
      return { category: 'residential', listingType: 'rent' };
  }
};

/**
 * Creates a new clean property data structure in v3 format with the new steps-based approach
 * @param category Property category (residential, commercial, land)
 * @param listingType Listing type (rent, sale, pghostel, flatmates, coworking)
 * @returns New v3 property data structure with steps for the appropriate flow
 */
export const createNewPropertyData = (
  category: string = '',
  listingType: string = ''
): any => {
  const now = new Date().toISOString();
  
  // Determine the flow type based on category and listing type
  const flowType = determineFlowType(category, listingType);
  
  // Normalize category and listing type to ensure consistency with flowType
  const normalizedValues = normalizeFlowValues(flowType);
  
  // Get the appropriate steps for this flow type
  const flowStepsKey = flowType.toLowerCase();
  const flowSteps = FLOW_STEPS[flowStepsKey] || FLOW_STEPS.default;
  
  // Build the v3 structure with steps
  const result = {
    meta: {
      _version: CURRENT_DATA_VERSION,
      created_at: now,
      updated_at: now,
      status: 'draft'
    },
    flow: {
      category: normalizedValues.category,
      listingType: normalizedValues.listingType,
      flowType: flowType
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
  
  // Initialize each step with empty object (excluding review steps)
  flowSteps.forEach(stepId => {
    if (!stepId.includes('_review')) {
      result.steps[stepId] = {};
    }
  });
  
  return result;
};

/**
 * Ensures the property data follows the v3 structure
 * @param data Property data that might need structural cleaning
 * @returns Clean v3 data
 */
export const ensureV3Structure = (data: any): any => {
  if (!data) return createNewPropertyData();
  
  // Clone the data to avoid mutations
  const result = JSON.parse(JSON.stringify(data));
  
  // Determine flow type - read it directly or derive it
  const flowType = result.flow?.flowType || determineFlowType(result.flow?.category, result.flow?.listingType);
  const normalizedValues = normalizeFlowValues(flowType);
  
  // Update flow values to ensure consistency
  if (!result.flow) {
    result.flow = {
      category: normalizedValues.category,
      listingType: normalizedValues.listingType,
      flowType: flowType
    };
  } else {
    result.flow.category = normalizedValues.category;
    result.flow.listingType = normalizedValues.listingType;
    result.flow.flowType = flowType;
  }
  
  // Ensure meta section exists
  if (!result.meta) {
    result.meta = {
      _version: CURRENT_DATA_VERSION,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    };
  } else {
    result.meta._version = CURRENT_DATA_VERSION;
    result.meta.updated_at = new Date().toISOString();
  }
  
  // If no steps, create an empty steps object
  if (!result.steps) {
    result.steps = {};
  }
  
  // Get the expected steps for this flow type
  const flowStepsKey = flowType.toLowerCase();
  const expectedSteps = FLOW_STEPS[flowStepsKey] || FLOW_STEPS.default;
  
  // Check if we need to rebuild steps
  let needsRebuild = false;
  
  // Check if any expected steps are missing
  for (const stepId of expectedSteps) {
    if (!stepId.includes('_review') && !result.steps[stepId]) {
      needsRebuild = true;
      break;
    }
  }
  
  // If steps need to be rebuilt, create new ones
  if (needsRebuild) {
    // Create fresh steps
    const newSteps = {};
    
    // Initialize each expected step
    expectedSteps.forEach(stepId => {
      if (!stepId.includes('_review')) {
        newSteps[stepId] = {};
      }
    });
    
    result.steps = newSteps;
  }
  
  // Ensure media section exists
  if (!result.media) {
    result.media = {
      photos: { images: [] },
      videos: { urls: [] }
    };
  } else {
    if (!result.media.photos) result.media.photos = { images: [] };
    if (!result.media.videos) result.media.videos = { urls: [] };
  }
  
  return result;
};

/**
 * Converts the v3 structure to database format
 * @param data Property data to convert
 * @returns Object ready for database insertion
 */
export const convertToDbFormat = (data: any): any => {
  if (!data) return {};
  
  // Ensure data is in v3 format
  const cleanData = ensureV3Structure(data);
  
  // Extract title and location based on flow type
  let title = "";
  let address = "";
  let city = "";
  let state = "";
  let zipCode = "";
  let price = 0;
  
  // Try to extract data from steps regardless of flow type
  for (const stepId in cleanData.steps) {
    const step = cleanData.steps[stepId];
    if (step) {
      // Title might be in any step with a title field
      if (step.title && !title) {
        title = step.title;
      }
      
      // Location info might be in any location step
      if (stepId.includes('_location')) {
        address = step.address || address;
        city = step.city || city;
        state = step.state || state;
        zipCode = step.pinCode || zipCode;
      }
      
      // Price info might be in rental or sale details
      if (stepId.includes('_rental') && step.rentAmount) {
        price = step.rentAmount;
      } else if (stepId.includes('_sale_details') && step.expectedPrice) {
        price = step.expectedPrice;
      }
    }
  }
  
  // Create a database-ready object with essential fields at root level
  const dbData: any = {
    title: title,
    address: address,
    city: city,
    state: state,
    zip_code: zipCode,
    price: price,
    status: cleanData.meta.status || "draft"
  };
  
  // Add property ID if it exists in metadata
  if (cleanData.meta.id) {
    dbData.id = cleanData.meta.id;
  }
  
  // Add owner ID if it exists in metadata
  if (cleanData.meta.owner_id) {
    dbData.owner_id = cleanData.meta.owner_id;
  }
  
  // Store the full property details in the JSON field
  dbData.property_details = cleanData;
  
  return dbData;
};