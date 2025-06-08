// src/modules/seeker/pages/AllProperties/utils/propertyUtils.ts
// Version: 2.0.0
// Last Modified: 25-05-2025 17:30 IST
// Purpose: Fixed property flow detection for V2 data structure with accurate type mapping

import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { FLOW_TYPES } from '@/modules/owner/components/property/wizard/constants/flows';

/**
 * Determines the property flow type from property data
 * Works with both temp_property_listing (has flow_type column) and properties_v2 (flow in property_details)
 * @param property The property object containing property_details
 * @returns The flow identifier string (e.g., "residential_rent")
 */
export function getPropertyFlow(property: PropertyType): string {
  if (!property) {
    console.warn('getPropertyFlow: No property provided');
    return FLOW_TYPES.RESIDENTIAL_RENT;
  }
  
  // PRIORITY 1: Check if flow_type is stored at the root level (from temp_property_listing table)
  if (property.flow_type && typeof property.flow_type === 'string') {
    const flowType = property.flow_type.toLowerCase();
    const validFlowTypes = Object.values(FLOW_TYPES);
    if (validFlowTypes.includes(flowType)) {
      return flowType;
    }
  }
  
  // PRIORITY 2: Check property_details if available (from properties_v2 table)
  if (!property.property_details) {
    console.log(`getPropertyFlow: No property_details for property ${property.id}, trying to infer from basic fields`);
    return inferFlowFromBasicFields(property);
  }
  
  const details = property.property_details;
  
  // PRIORITY 3: Try to get flow type from property_details.flow.flowType (V2 structure)
  if (details.flow?.flowType) {
    const flowType = details.flow.flowType.toLowerCase();
    const validFlowTypes = Object.values(FLOW_TYPES);
    if (validFlowTypes.includes(flowType)) {
      console.log(`getPropertyFlow: Found flow type in property_details.flow.flowType: ${flowType}`);
      return flowType;
    }
  }
  
  // PRIORITY 4: Try alternative flow field locations in property_details
  if (details.flowType) {
    const flowType = details.flowType.toLowerCase();
    const validFlowTypes = Object.values(FLOW_TYPES);
    if (validFlowTypes.includes(flowType)) {
      console.log(`getPropertyFlow: Found flow type in property_details.flowType: ${flowType}`);
      return flowType;
    }
  }
  
  // PRIORITY 5: Try to detect from steps structure (V2 structure)
  if (details.steps && Object.keys(details.steps).length > 0) {
    const stepKeys = Object.keys(details.steps);
    console.log(`getPropertyFlow: Analyzing step keys for property ${property.id}:`, stepKeys);
    
    // Check for residential patterns
    if (stepKeys.some(key => key.includes('res_rent'))) {
      console.log(`getPropertyFlow: Detected residential_rent from steps`);
      return FLOW_TYPES.RESIDENTIAL_RENT;
    }
    if (stepKeys.some(key => key.includes('res_sale'))) {
      console.log(`getPropertyFlow: Detected residential_sale from steps`);
      return FLOW_TYPES.RESIDENTIAL_SALE;
    }
    if (stepKeys.some(key => key.includes('res_pg'))) {
      console.log(`getPropertyFlow: Detected residential_pghostel from steps`);
      return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    }
    if (stepKeys.some(key => key.includes('res_flat'))) {
      console.log(`getPropertyFlow: Detected residential_flatmates from steps`);
      return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    }
    
    // Check for commercial patterns
    if (stepKeys.some(key => key.includes('com_rent'))) {
      console.log(`getPropertyFlow: Detected commercial_rent from steps`);
      return FLOW_TYPES.COMMERCIAL_RENT;
    }
    if (stepKeys.some(key => key.includes('com_sale'))) {
      console.log(`getPropertyFlow: Detected commercial_sale from steps`);
      return FLOW_TYPES.COMMERCIAL_SALE;
    }
    if (stepKeys.some(key => key.includes('com_cow'))) {
      console.log(`getPropertyFlow: Detected commercial_coworking from steps`);
      return FLOW_TYPES.COMMERCIAL_COWORKING;
    }
    
    // Check for land patterns
    if (stepKeys.some(key => key.includes('land_sale'))) {
      console.log(`getPropertyFlow: Detected land_sale from steps`);
      return FLOW_TYPES.LAND_SALE;
    }
  }
  
  // PRIORITY 6: Try legacy detection (for backward compatibility with old data)
  const legacyFlow = detectLegacyFlow(details);
  if (legacyFlow !== "unknown") {
    console.log(`getPropertyFlow: Detected flow from legacy data: ${legacyFlow}`);
    return legacyFlow;
  }
  
  // PRIORITY 7: Last resort - try to infer from basic property fields
  const basicFlow = inferFlowFromBasicFields(property);
  if (basicFlow !== "unknown") {
    console.log(`getPropertyFlow: Inferred flow from basic fields: ${basicFlow}`);
    return basicFlow;
  }
  
  // Log warning with detailed information for debugging
  console.warn(`Could not determine flow for property ${property.id}. Using default: ${FLOW_TYPES.RESIDENTIAL_RENT}`, {
    property_id: property.id,
    has_property_details: !!property.property_details,
    flow_in_details: property.property_details?.flow,
    flowType_in_details: property.property_details?.flowType,
    root_flow_type: property.flow_type,
    available_steps: property.property_details?.steps ? Object.keys(property.property_details.steps) : 'no steps',
    step_count: property.property_details?.steps ? Object.keys(property.property_details.steps).length : 0,
    basic_fields: {
      title: property.title,
      description: property.description ? property.description.substring(0, 100) + '...' : 'no description'
    }
  });
  
  // Default to residential rent if we can't determine anything
  return FLOW_TYPES.RESIDENTIAL_RENT;
}

/**
 * Infer flow from basic property fields when property_details is not available
 */
function inferFlowFromBasicFields(property: PropertyType): string {
  // Check title and description for keywords
  const title = (property.title || '').toLowerCase();
  const description = (property.description || '').toLowerCase();
  const text = `${title} ${description}`;
  
  // Check for PG/Hostel keywords
  if (text.includes('pg') || text.includes('hostel') || text.includes('paying guest')) {
    return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
  }
  
  // Check for flatmate keywords
  if (text.includes('flatmate') || text.includes('roommate') || text.includes('shared accommodation')) {
    return FLOW_TYPES.RESIDENTIAL_FLATMATES;
  }
  
  // Check for coworking keywords
  if (text.includes('coworking') || text.includes('cowork') || text.includes('shared office')) {
    return FLOW_TYPES.COMMERCIAL_COWORKING;
  }
  
  // Check for land keywords
  if (text.includes('land') || text.includes('plot') || text.includes('agricultural')) {
    return FLOW_TYPES.LAND_SALE;
  }
  
  // Check for commercial keywords
  const isCommercial = text.includes('office') || text.includes('shop') || 
                      text.includes('commercial') || text.includes('warehouse') ||
                      text.includes('showroom') || text.includes('retail');
  
  // Check for sale/rent keywords
  const isSale = text.includes('sale') || text.includes('sell') || text.includes('buy');
  const isRent = text.includes('rent') || text.includes('lease') || text.includes('rental');
  
  if (isCommercial) {
    return isSale ? FLOW_TYPES.COMMERCIAL_SALE : FLOW_TYPES.COMMERCIAL_RENT;
  } else {
    return isSale ? FLOW_TYPES.RESIDENTIAL_SALE : FLOW_TYPES.RESIDENTIAL_RENT;
  }
}
function detectLegacyFlow(details: any): string {
  // Try to derive from old structure
  const category = details.propertyCategory?.toLowerCase();
  const listingType = details.listingType?.toLowerCase();
  const propertyType = details.propertyType?.toLowerCase();
  
  // Handle special cases first
  if (propertyType?.includes('pg') || propertyType?.includes('hostel')) {
    return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
  }
  
  if (listingType === 'flatmates' || propertyType?.includes('flatmate')) {
    return FLOW_TYPES.RESIDENTIAL_FLATMATES;
  }
  
  if (listingType === 'coworking' || propertyType?.includes('coworking')) {
    return FLOW_TYPES.COMMERCIAL_COWORKING;
  }
  
  // Standard combinations
  if (category === 'residential') {
    if (listingType === 'rent' || listingType === 'lease') {
      return FLOW_TYPES.RESIDENTIAL_RENT;
    } else if (listingType === 'sale' || listingType === 'sell') {
      return FLOW_TYPES.RESIDENTIAL_SALE;
    }
  } else if (category === 'commercial') {
    if (listingType === 'rent' || listingType === 'lease') {
      return FLOW_TYPES.COMMERCIAL_RENT;
    } else if (listingType === 'sale' || listingType === 'sell') {
      return FLOW_TYPES.COMMERCIAL_SALE;
    }
  } else if (category === 'land') {
    return FLOW_TYPES.LAND_SALE;
  }
  
  return "unknown";
}

/**
 * Returns a more user-friendly label for the property flow
 * @param flowType The flow identifier string
 * @returns A formatted label for display
 */
export function getFlowLabel(flowType: string): string {
  const flowLabels: Record<string, string> = {
    [FLOW_TYPES.RESIDENTIAL_RENT]: "Residential Rent",
    [FLOW_TYPES.RESIDENTIAL_SALE]: "Residential Sale", 
    [FLOW_TYPES.RESIDENTIAL_FLATMATES]: "Flatmates",
    [FLOW_TYPES.RESIDENTIAL_PGHOSTEL]: "PG/Hostel",
    [FLOW_TYPES.COMMERCIAL_RENT]: "Commercial Rent",
    [FLOW_TYPES.COMMERCIAL_SALE]: "Commercial Sale",
    [FLOW_TYPES.COMMERCIAL_COWORKING]: "Coworking",
    [FLOW_TYPES.LAND_SALE]: "Land Sale",
    "unknown": "Unknown Type"
  };
  
  return flowLabels[flowType] || flowType;
}

/**
 * Extract property type from flow (Residential, Commercial, Land)
 * @param flowType The flow identifier string
 * @returns The property type
 */
export function getPropertyTypeFromFlow(flowType: string): string {
  if (flowType.startsWith('residential_')) return 'Residential';
  if (flowType.startsWith('commercial_')) return 'Commercial';
  if (flowType.startsWith('land_')) return 'Land';
  return 'Unknown';
}

/**
 * Extract listing type from flow (Rent, Sale, PG/Hostel, etc.)
 * @param flowType The flow identifier string
 * @returns The listing type
 */
export function getListingTypeFromFlow(flowType: string): string {
  const listingTypeMap: Record<string, string> = {
    [FLOW_TYPES.RESIDENTIAL_RENT]: "Rent",
    [FLOW_TYPES.RESIDENTIAL_SALE]: "Sale",
    [FLOW_TYPES.RESIDENTIAL_FLATMATES]: "Flatmates",
    [FLOW_TYPES.RESIDENTIAL_PGHOSTEL]: "PG/Hostel",
    [FLOW_TYPES.COMMERCIAL_RENT]: "Rent",
    [FLOW_TYPES.COMMERCIAL_SALE]: "Sale",
    [FLOW_TYPES.COMMERCIAL_COWORKING]: "Coworking",
    [FLOW_TYPES.LAND_SALE]: "Sale"
  };
  
  return listingTypeMap[flowType] || 'Unknown';
}