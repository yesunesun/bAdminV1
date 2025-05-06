// src/modules/owner/components/property/wizard/constants/flows.ts
// Version: 5.0.0
// Last Modified: 07-05-2025 21:30 IST
// Purpose: Updated flow definitions to match correct step sequences

/**
 * Available flow types
 */
export const FLOW_TYPES = {
  // Residential flows
  RESIDENTIAL_RENT: 'residential_rent',
  RESIDENTIAL_SALE: 'residential_sale',
  RESIDENTIAL_FLATMATES: 'residential_flatmates',
  RESIDENTIAL_PGHOSTEL: 'residential_pghostel',
  
  // Commercial flows
  COMMERCIAL_RENT: 'commercial_rent',
  COMMERCIAL_SALE: 'commercial_sale',
  COMMERCIAL_COWORKING: 'commercial_coworking',
  
  // Land flows
  LAND_SALE: 'land_sale',
  
  // Default flow (fallback)
  DEFAULT: 'residential_rent'
};

/**
 * Step definitions for each flow type
 * These define the exact JSON object keys that will be used in the database
 */
export const FLOW_STEPS = {
  // Residential flows
  residential_rent: [
    'details',
    'location',
    'rental',
    'features',
    'review'
  ],
  
  residential_sale: [
    'details',
    'location',
    'sale',
    'features',
    'review'
  ],
  
  residential_flatmates: [
    'room_details',
    'location',
    'flatmate_details',
    'features',
    'review'
  ],
  
  residential_pghostel: [
    'room_details',
    'location',
    'pg_details',
    'features',
    'review'
  ],
  
  // Commercial flows
  commercial_rent: [
    'commercial_basics',
    'location',
    'rental',
    'features',
    'review'
  ],
  
  commercial_sale: [
    'commercial_basics',
    'location',
    'commercial_sale',
    'features',
    'review'
  ],
  
  commercial_coworking: [
    'details',
    'location',
    'coworking',
    'features',
    'review'
  ],
  
  // Land flows
  land_sale: [
    'land_details',
    'location',
    'land_features',
    'review'
  ],
  
  // Default flow (fallback)
  default: [
    'details',
    'location',
    'rental',
    'features',
    'review'
  ]
};

/**
 * Field mappings for each step
 * These define which fields belong to which step
 */
export const STEP_FIELD_MAPPINGS = {
  // Basic property details
  details: [
    'title',
    'propertyType',
    'bhkType',
    'floor',
    'totalFloors',
    'builtUpArea',
    'builtUpAreaUnit',
    'bathrooms',
    'balconies',
    'facing',
    'propertyAge',
    'propertyCondition',
    'hasBalcony',
    'hasAC'
  ],
  
  // Commercial basics
  commercial_basics: [
    'title',
    'propertyType',
    'commercialType',
    'floor',
    'totalFloors',
    'builtUpArea',
    'builtUpAreaUnit',
    'facing',
    'propertyAge',
    'propertyCondition'
  ],
  
  // Room details for PG/Hostel
  room_details: [
    'title',
    'propertyType',
    'roomType',
    'occupancy',
    'floor',
    'totalFloors',
    'builtUpArea',
    'builtUpAreaUnit',
    'bathrooms',
    'facing'
  ],
  
  // Land details
  land_details: [
    'title',
    'landType',
    'plotArea',
    'plotAreaUnit',
    'plotFrontage',
    'plotFrontageUnit',
    'plotLength',
    'plotLengthUnit'
  ],
  
  // Location details
  location: [
    'address',
    'flatPlotNo',
    'landmark',
    'locality',
    'area',
    'city',
    'district',
    'state',
    'pinCode',
    'latitude',
    'longitude',
    'coordinates'
  ],
  
  // Features and amenities
  features: [
    'amenities',
    'parking',
    'petFriendly',
    'hasGym',
    'nonVegAllowed',
    'isNonVegAllowed',
    'waterSupply',
    'powerBackup',
    'gatedSecurity',
    'description',
    'isSmokingAllowed',
    'isDrinkingAllowed',
    'hasAttachedBathroom'
  ],
  
  // Rental details
  rental: [
    'rentAmount',
    'securityDeposit',
    'maintenanceCharges',
    'rentNegotiable',
    'availableFrom',
    'preferredTenants',
    'leaseDuration',
    'furnishingStatus',
    'hasSimilarUnits',
    'propertyShowOption',
    'propertyShowPerson',
    'secondaryNumber',
    'secondaryContactNumber'
  ],
  
  // Sale details
  sale: [
    'expectedPrice',
    'priceNegotiable',
    'possessionDate',
    'hasSimilarUnits',
    'propertyShowOption',
    'propertyShowPerson',
    'secondaryNumber',
    'secondaryContactNumber'
  ],
  
  // Flatmate details
  flatmate_details: [
    'preferredGender',
    'occupancy',
    'foodPreference',
    'tenantType',
    'roomSharing',
    'maxFlatmates',
    'currentFlatmates',
    'about'
  ],
  
  // PG/Hostel details
  pg_details: [
    'pgType',
    'mealOptions',
    'roomTypes',
    'occupancyTypes',
    'genderPreference',
    'rules',
    'facilities',
    'noticePolicy'
  ],
  
  // Commercial sale details
  commercial_sale: [
    'expectedPrice',
    'priceNegotiable',
    'possessionDate',
    'hasSimilarUnits',
    'propertyShowOption',
    'propertyShowPerson',
    'cabins',
    'meetingRooms',
    'washrooms',
    'cornerProperty',
    'mainRoadFacing'
  ],
  
  // Coworking details
  coworking: [
    'spaceType',
    'capacity',
    'operatingHours',
    'amenities',
    'securityDeposit',
    'minimumCommitment',
    'discounts',
    'availableFrom'
  ],
  
  // Land features
  land_features: [
    'approvals',
    'boundaryStatus',
    'cornerPlot',
    'landUseZone',
    'description'
  ],
  
  // Review step
  review: [
    'finalCheck',
    'termsAgreed',
    'readyToPublish',
    'additionalNotes'
  ]
};

/**
 * Convert existing step sequences to step objects for compatibility with the useStepNavigation hook
 * This bridges the existing step sequence format with our new flow structure
 */
export const createStepObjectsFromFlow = (flowType: string) => {
  // Get the steps for this flow
  const steps = FLOW_STEPS[flowType] || FLOW_STEPS.default;
  
  // Step icon mappings
  const stepIcons = {
    details: 'Home',
    commercial_basics: 'Building',
    room_details: 'Bed',
    land_details: 'Map',
    location: 'MapPin',
    rental: 'DollarSign',
    sale: 'DollarSign',
    commercial_sale: 'Building',
    flatmate_details: 'Users',
    pg_details: 'Building',
    coworking: 'Briefcase',
    land_features: 'Settings',
    features: 'Settings',
    review: 'FileText'
  };
  
  // Step title mappings
  const stepTitles = {
    details: 'Basic Details',
    commercial_basics: 'Basic Details',
    room_details: 'Room Details',
    land_details: 'Land Details',
    location: 'Location',
    rental: 'Rental Details',
    sale: 'Sale Details',
    commercial_sale: 'Sale Details',
    flatmate_details: 'Flatmate Details',
    pg_details: 'PG Details',
    coworking: 'Co-working',
    land_features: 'Land Features',
    features: 'Features',
    review: 'Review'
  };
  
  // Convert to step objects format expected by useStepNavigation
  return steps.map(stepId => ({
    id: stepId,
    title: stepTitles[stepId] || stepId.charAt(0).toUpperCase() + stepId.slice(1).replace(/([A-Z])/g, ' $1'),
    icon: stepIcons[stepId] || 'Settings'
  }));
};

/**
 * Map between flow types and step sequences from the existing useStepNavigation
 */
export const FLOW_STEP_SEQUENCES = {
  residential_rent: createStepObjectsFromFlow('residential_rent'),
  residential_sale: createStepObjectsFromFlow('residential_sale'),
  residential_pghostel: createStepObjectsFromFlow('residential_pghostel'),
  residential_flatmates: createStepObjectsFromFlow('residential_flatmates'),
  commercial_rent: createStepObjectsFromFlow('commercial_rent'),
  commercial_sale: createStepObjectsFromFlow('commercial_sale'),
  commercial_coworking: createStepObjectsFromFlow('commercial_coworking'),
  land_sale: createStepObjectsFromFlow('land_sale')
};

// Export for use in other files
export default {
  FLOW_TYPES,
  FLOW_STEPS,
  FLOW_STEP_SEQUENCES,
  STEP_FIELD_MAPPINGS,
  createStepObjectsFromFlow
};