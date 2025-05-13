// src/modules/owner/components/property/wizard/constants/flows.ts
// Version: 6.0.0
// Last Modified: 18-05-2025 14:55 IST
// Purpose: Implement new flow-based architecture with flow-specific step identifiers

import { 
  Home, MapPin, Settings, Image, FileText, DollarSign, 
  Building, Bed, Users, Briefcase, Map 
} from 'lucide-react';

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
 * Step definitions for each flow type with unique identifiers
 * These define the exact JSON object keys that will be used in the database
 */
export const FLOW_STEPS = {
  // Residential flows
  residential_rent: [
    'res_rent_basic_details',
    'res_rent_location',
    'res_rent_rental',
    'res_rent_features',
    'res_rent_review'
  ],
  
  residential_sale: [
    'res_sale_basic_details',
    'res_sale_location',
    'res_sale_sale_details',
    'res_sale_features',
    'res_sale_review'
  ],
  
  residential_flatmates: [
    'res_flat_basic_details',
    'res_flat_location',
    'res_flat_flatmate_details',
    'res_flat_features',
    'res_flat_review'
  ],
  
  residential_pghostel: [
    'res_pg_basic_details',
    'res_pg_location',
    'res_pg_pg_details',
    'res_pg_features',
    'res_pg_review'
  ],
  
  // Commercial flows
  commercial_rent: [
    'com_rent_basic_details',
    'com_rent_location',
    'com_rent_rental',
    'com_rent_features',
    'com_rent_review'
  ],
  
  commercial_sale: [
    'com_sale_basic_details',
    'com_sale_location',
    'com_sale_sale_details',
    'com_sale_features',
    'com_sale_review'
  ],
  
  commercial_coworking: [
    'com_cow_basic_details',
    'com_cow_location',
    'com_cow_coworking_details',
    'com_cow_features',
    'com_cow_review'
  ],
  
  // Land flows
  land_sale: [
    'land_sale_basic_details',
    'land_sale_location',
    'land_sale_land_features',
    'land_sale_review'
  ],
  
  // Default flow (fallback)
  default: [
    'default_basic_details',
    'default_location',
    'default_rental',
    'default_features',
    'default_review'
  ]
};

/**
 * Step metadata with icons and titles
 */
export const STEP_METADATA = {
  // Residential rent steps
  res_rent_basic_details: {
    id: 'res_rent_basic_details',
    name: 'Property Details',
    component: 'PropertyDetails',
    icon: Home,
    description: 'Tell us about your property'
  },
  res_rent_location: {
    id: 'res_rent_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  res_rent_rental: {
    id: 'res_rent_rental',
    name: 'Rental Details',
    component: 'RentalDetails',
    icon: DollarSign,
    description: 'Pricing and rental terms'
  },
  res_rent_features: {
    id: 'res_rent_features',
    name: 'Features',
    component: 'AmenitiesSection',
    icon: Settings,
    description: 'Amenities and features'
  },
  res_rent_review: {
    id: 'res_rent_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  },
  
  // Residential sale steps
  res_sale_basic_details: {
    id: 'res_sale_basic_details',
    name: 'Property Details',
    component: 'PropertyDetails',
    icon: Home,
    description: 'Tell us about your property'
  },
  res_sale_location: {
    id: 'res_sale_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  res_sale_sale_details: {
    id: 'res_sale_sale_details',
    name: 'Sale Details',
    component: 'SaleDetails',
    icon: DollarSign,
    description: 'Pricing and sale details'
  },
  res_sale_features: {
    id: 'res_sale_features',
    name: 'Features',
    component: 'AmenitiesSection',
    icon: Settings,
    description: 'Amenities and features'
  },
  res_sale_review: {
    id: 'res_sale_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  },
  
  // Residential flatmates steps
  res_flat_basic_details: {
    id: 'res_flat_basic_details',
    name: 'Room Details',
    component: 'RoomDetails',
    icon: Bed,
    description: 'Tell us about the room'
  },
  res_flat_location: {
    id: 'res_flat_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  res_flat_flatmate_details: {
    id: 'res_flat_flatmate_details',
    name: 'Flatmate Details',
    component: 'FlatmateDetails',
    icon: Users,
    description: 'Flatmate preferences'
  },
  res_flat_features: {
    id: 'res_flat_features',
    name: 'Features',
    component: 'AmenitiesSection',
    icon: Settings,
    description: 'Amenities and features'
  },
  res_flat_review: {
    id: 'res_flat_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  },
  
  // Residential PG/Hostel steps
  res_pg_basic_details: {
    id: 'res_pg_basic_details',
    name: 'Room Details',
    component: 'RoomDetails',
    icon: Building,
    description: 'Tell us about your PG/Hostel'
  },
  res_pg_location: {
    id: 'res_pg_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  res_pg_pg_details: {
    id: 'res_pg_pg_details',
    name: 'PG Details',
    component: 'PGDetails',
    icon: Building,
    description: 'PG/Hostel specific details'
  },
  res_pg_features: {
    id: 'res_pg_features',
    name: 'Features',
    component: 'AmenitiesSection',
    icon: Settings,
    description: 'Amenities and features'
  },
  res_pg_review: {
    id: 'res_pg_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  },
  
  // Commercial rent steps
  com_rent_basic_details: {
    id: 'com_rent_basic_details',
    name: 'Comm. Prop. Details',
    component: 'CommercialBasicDetails',
    icon: Building,
    description: 'Tell us about your commercial space'
  },
  com_rent_location: {
    id: 'com_rent_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  com_rent_rental: {
    id: 'com_rent_rental',
    name: 'Rental Details',
    component: 'RentalDetails',
    icon: DollarSign,
    description: 'Pricing and rental terms'
  },
  com_rent_features: {
    id: 'com_rent_features',
    name: 'Features',
    component: 'CommercialFeatures',
    icon: Settings,
    description: 'Amenities and features'
  },
  com_rent_review: {
    id: 'com_rent_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  },
  
  // Commercial sale steps
  com_sale_basic_details: {
    id: 'com_sale_basic_details',
    name: 'Comm. Prop. Details',
    component: 'CommercialBasicDetails',
    icon: Building,
    description: 'Tell us about your commercial space'
  },
  com_sale_location: {
    id: 'com_sale_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  com_sale_sale_details: {
    id: 'com_sale_sale_details',
    name: 'Sale Details',
    component: 'CommercialSaleDetails',
    icon: DollarSign,
    description: 'Pricing and sale details'
  },
  com_sale_features: {
    id: 'com_sale_features',
    name: 'Features',
    component: 'CommercialFeatures',
    icon: Settings,
    description: 'Amenities and features'
  },
  com_sale_review: {
    id: 'com_sale_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  },
  
  // Commercial coworking steps
  com_cow_basic_details: {
    id: 'com_cow_basic_details',
    name: 'Basic Details',
    component: 'CoworkingBasicDetails',
    icon: Briefcase,
    description: 'Tell us about your coworking space'
  },
  com_cow_location: {
    id: 'com_cow_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your property located?'
  },
  com_cow_coworking_details: {
    id: 'com_cow_coworking_details',
    name: 'Coworking Details',
    component: 'CoworkingDetails',
    icon: Briefcase,
    description: 'Coworking specific details'
  },
  com_cow_features: {
    id: 'com_cow_features',
    name: 'Features',
    component: 'AmenitiesSection',
    icon: Settings,
    description: 'Amenities and features'
  },
  com_cow_review: {
    id: 'com_cow_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  },
  
  // Land sale steps
  land_sale_basic_details: {
    id: 'land_sale_basic_details',
    name: 'Land/Plot Details',
    component: 'LandDetails',
    icon: Map,
    description: 'Tell us about your land'
  },
  land_sale_location: {
    id: 'land_sale_location',
    name: 'Location',
    component: 'LocationDetails',
    icon: MapPin,
    description: 'Where is your land located?'
  },
  land_sale_land_features: {
    id: 'land_sale_land_features',
    name: 'Land Features',
    component: 'LandFeaturesDetails',
    icon: Map,
    description: 'Land specific features'
  },
  land_sale_review: {
    id: 'land_sale_review',
    name: 'Review',
    component: 'PropertySummary',
    icon: FileText,
    description: 'Review and publish'
  }
};

/**
 * Convert existing step sequences to step objects for compatibility with the useStepNavigation hook
 */
export const createStepObjectsFromFlow = (flowType: string) => {
  const steps = FLOW_STEPS[flowType] || FLOW_STEPS.default;
  
  return steps.map(stepId => {
    const metadata = STEP_METADATA[stepId];
    
    if (!metadata) {
      console.warn(`No metadata found for step: ${stepId}`);
      return {
        id: stepId,
        title: stepId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        icon: Settings
      };
    }
    
    return {
      id: metadata.id,
      title: metadata.name,
      icon: metadata.icon
    };
  });
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

/**
 * Field mappings are now removed, as data structure will be handled by useStepData hook
 */

// Export for use in other files
export default {
  FLOW_TYPES,
  FLOW_STEPS,
  FLOW_STEP_SEQUENCES,
  STEP_METADATA,
  createStepObjectsFromFlow
};