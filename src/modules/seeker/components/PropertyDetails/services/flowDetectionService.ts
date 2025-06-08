// src/modules/seeker/components/PropertyDetails/services/flowDetectionService.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 16:35 IST
// Purpose: Service for detecting and managing property flow types

/**
 * Flow type display name mappings
 */
const FLOW_DISPLAY_NAMES: { [key: string]: string } = {
  'residential_rent': 'Residential Rent',
  'residential_sale': 'Residential Sale',
  'residential_flatmates': 'Flatmates',
  'residential_pghostel': 'PG/Hostel',
  'commercial_rent': 'Commercial Rent',
  'commercial_sale': 'Commercial Sale',
  'commercial_coworking': 'Coworking Space',
  'land_sale': 'Land/Plot Sale'
};

/**
 * Get display name for flow types
 * @param flowType - Flow type identifier
 * @returns Human-readable flow type name
 */
export const getFlowTypeDisplayName = (flowType: string): string => {
  return FLOW_DISPLAY_NAMES[flowType] || flowType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

/**
 * Detect flow type from property data using multiple strategies
 * @param property - Property object containing details and metadata
 * @returns Detected flow type string
 */
export const detectFlowType = (property: any): string => {
  // Parse property_details if it's a string
  let details = property.property_details;
  if (typeof details === 'string') {
    try {
      details = JSON.parse(details);
    } catch (e) {
      details = {};
    }
  } else if (!details) {
    details = {};
  }

  // Try to get flow type from various locations
  const flowType =
    // From flow object in property_details
    details.flow?.flowType ||
    // From direct property_details
    details.flowType ||
    // From property level
    property.flow_type ||
    property.flowType ||
    // From steps (look for step patterns to infer flow)
    detectFlowTypeFromSteps(details.steps) ||
    // Fallback based on property characteristics
    detectFlowTypeFromCharacteristics(details);

  console.log('[FlowDetectionService] Detected flow type:', flowType);
  return flowType;
};

/**
 * Detect flow type from step naming patterns
 * @param steps - Steps object from property details
 * @returns Flow type string or null if not detected
 */
const detectFlowTypeFromSteps = (steps: any): string | null => {
  if (!steps) return null;

  const stepKeys = Object.keys(steps);
  const firstStepKey = stepKeys[0];

  if (firstStepKey) {
    // Extract flow type from step naming pattern
    if (firstStepKey.includes('res_pg_')) return 'residential_pghostel';
    if (firstStepKey.includes('res_flat_')) return 'residential_flatmates';
    if (firstStepKey.includes('res_rent_')) return 'residential_rent';
    if (firstStepKey.includes('res_sale_')) return 'residential_sale';
    if (firstStepKey.includes('com_rent_')) return 'commercial_rent';
    if (firstStepKey.includes('com_sale_')) return 'commercial_sale';
    if (firstStepKey.includes('com_cow_')) return 'commercial_coworking';
    if (firstStepKey.includes('land_sale_')) return 'land_sale';
  }

  return null;
};

/**
 * Detect flow type from property characteristics
 * @param details - Property details object
 * @returns Flow type string
 */
const detectFlowTypeFromCharacteristics = (details: any): string => {
  // Check for PG/Hostel indicators
  if (details.pgDetails ||
    Object.keys(details.steps || {}).some(key => key.includes('pg_details'))) {
    return 'residential_pghostel';
  }

  // Check for Flatmates indicators  
  if (details.flatmateDetails ||
    Object.keys(details.steps || {}).some(key => key.includes('flatmate'))) {
    return 'residential_flatmates';
  }

  // Check for Coworking indicators
  if (details.coworkingDetails ||
    Object.keys(details.steps || {}).some(key => key.includes('coworking'))) {
    return 'commercial_coworking';
  }

  // Check for Land indicators
  if (details.landDetails ||
    details.basicDetails?.propertyType === 'Land' ||
    Object.keys(details.steps || {}).some(key => key.includes('land'))) {
    return 'land_sale';
  }

  // Default to residential rent
  return 'residential_rent';
};

/**
 * Check if property is a sale type
 * @param flowType - Flow type string
 * @returns Boolean indicating if it's a sale property
 */
export const isSaleProperty = (flowType: string): boolean => {
  return flowType.includes('sale');
};

/**
 * Check if property is a specific flow type
 * @param flowType - Flow type to check
 * @param targetType - Target flow type to match
 * @returns Boolean indicating if flow types match
 */
export const isFlowType = (flowType: string, targetType: string): boolean => {
  return flowType === targetType;
};

/**
 * Get flow category (residential, commercial, land)
 * @param flowType - Flow type string
 * @returns Flow category string
 */
export const getFlowCategory = (flowType: string): string => {
  return flowType.split('_')[0] || 'residential';
};

/**
 * Get listing type (rent, sale)
 * @param flowType - Flow type string
 * @returns Listing type string
 */
export const getListingType = (flowType: string): string => {
  return flowType.includes('sale') ? 'sale' : 'rent';
};