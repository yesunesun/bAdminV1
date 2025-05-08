// src/modules/owner/components/property/wizard/constants/flows.ts
// Version: 5.1.0
// Last Modified: 09-05-2025 11:30 IST
// Purpose: Updated flow definitions for structured step hierarchy

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
    'basic_details',
    'location',
    'rental',
    'features',
    'review'
  ],
  
  residential_sale: [
    'basic_details',
    'location',
    'sale',
    'features',
    'review'
  ],
  
  residential_flatmates: [
    'basic_details',
    'location',
    'flatmate_details',
    'features',
    'review'
  ],
  
  residential_pghostel: [
    'basic_details',
    'location',
    'pg_details',
    'features',
    'review'
  ],
  
  // Commercial flows
  commercial_rent: [
    'basic_details',
    'location',
    'rental',
    'features',
    'review'
  ],
  
  commercial_sale: [
    'basic_details',
    'location',
    'sale',
    'features',
    'review'
  ],
  
  commercial_coworking: [
    'basic_details',
    'location',
    'coworking',
    'features',
    'review'
  ],
  
  // Land flows
  land_sale: [
    'basic_details',
    'location',
    'land_features',
    'review'
  ],
  
  // Default flow (fallback)
  default: [
    'basic_details',
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
  // Basic property details (formerly 'details')
  basic_details: [
    'steps.basic_details.title',
    'steps.basic_details.propertyType',
    'steps.basic_details.bhkType',
    'steps.basic_details.floor',
    'steps.basic_details.totalFloors',
    'steps.basic_details.builtUpArea',
    'steps.basic_details.builtUpAreaUnit',
    'steps.basic_details.bathrooms',
    'steps.basic_details.balconies',
    'steps.basic_details.facing',
    'steps.basic_details.propertyAge',
    'steps.basic_details.propertyCondition',
    'steps.basic_details.hasBalcony',
    'steps.basic_details.hasAC'
  ],
  
  // Location details
  location: [
    'steps.location.address',
    'steps.location.flatPlotNo',
    'steps.location.landmark',
    'steps.location.locality',
    'steps.location.area',
    'steps.location.city',
    'steps.location.district',
    'steps.location.state',
    'steps.location.pinCode',
    'steps.location.coordinates.latitude',
    'steps.location.coordinates.longitude'
  ],
  
  // Features and amenities
  features: [
    'steps.features.amenities',
    'steps.features.parking',
    'steps.features.petFriendly',
    'steps.features.nonVegAllowed',
    'steps.features.waterSupply',
    'steps.features.powerBackup',
    'steps.features.gatedSecurity',
    'steps.features.description',
    'steps.features.isSmokingAllowed',
    'steps.features.isDrinkingAllowed',
    'steps.features.hasAttachedBathroom'
  ],
  
  // Rental details
  rental: [
    'steps.rental.rentAmount',
    'steps.rental.securityDeposit',
    'steps.rental.maintenanceCharges',
    'steps.rental.rentNegotiable',
    'steps.rental.availableFrom',
    'steps.rental.preferredTenants',
    'steps.rental.leaseDuration',
    'steps.rental.furnishingStatus',
    'steps.rental.hasSimilarUnits',
    'steps.rental.propertyShowOption',
    'steps.rental.propertyShowPerson',
    'steps.rental.secondaryNumber',
    'steps.rental.secondaryContactNumber'
  ],
  
  // Sale details
  sale: [
    'steps.sale.expectedPrice',
    'steps.sale.priceNegotiable',
    'steps.sale.possessionDate',
    'steps.sale.hasSimilarUnits',
    'steps.sale.propertyShowOption',
    'steps.sale.propertyShowPerson',
    'steps.sale.secondaryNumber',
    'steps.sale.secondaryContactNumber'
  ],
  
  // Flatmate details
  flatmate_details: [
    'steps.flatmate_details.preferredGender',
    'steps.flatmate_details.occupancy',
    'steps.flatmate_details.foodPreference',
    'steps.flatmate_details.tenantType',
    'steps.flatmate_details.roomSharing',
    'steps.flatmate_details.maxFlatmates',
    'steps.flatmate_details.currentFlatmates',
    'steps.flatmate_details.about'
  ],
  
  // PG/Hostel details
  pg_details: [
    'steps.pg_details.pgType',
    'steps.pg_details.mealOptions',
    'steps.pg_details.roomTypes',
    'steps.pg_details.occupancyTypes',
    'steps.pg_details.genderPreference',
    'steps.pg_details.rules',
    'steps.pg_details.facilities',
    'steps.pg_details.noticePolicy'
  ],
  
  // Commercial sale details
  commercial_sale: [
    'steps.sale.expectedPrice',
    'steps.sale.priceNegotiable',
    'steps.sale.possessionDate',
    'steps.sale.hasSimilarUnits',
    'steps.sale.propertyShowOption',
    'steps.sale.propertyShowPerson',
    'steps.commercial_details.cabins',
    'steps.commercial_details.meetingRooms',
    'steps.commercial_details.washrooms',
    'steps.commercial_details.cornerProperty',
    'steps.commercial_details.mainRoadFacing'
  ],
  
  // Coworking details
  coworking: [
    'steps.coworking.spaceType',
    'steps.coworking.capacity',
    'steps.coworking.operatingHours',
    'steps.coworking.amenities',
    'steps.coworking.securityDeposit',
    'steps.coworking.minimumCommitment',
    'steps.coworking.discounts',
    'steps.coworking.availableFrom'
  ],
  
  // Land features
  land_features: [
    'steps.land_features.approvals',
    'steps.land_features.boundaryStatus',
    'steps.land_features.cornerPlot',
    'steps.land_features.landUseZone',
    'steps.land_features.description'
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
    basic_details: 'Home',
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
    basic_details: 'Basic Details',
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