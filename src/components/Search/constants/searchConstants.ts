// src/components/Search/constants/searchConstants.ts
// Version: 3.1.0
// Last Modified: 02-06-2025 19:00 IST
// Purpose: Updated with proper land types according to search_land_properties documentation

import { PropertyType } from '../types/search.types';

// Action Types - Buy/Rent
export const ACTION_TYPES: Record<string, string> = {
  any: 'Any',
  buy: 'Buy', 
  rent: 'Rent'
};

// Keep TRANSACTION_TYPES for backward compatibility
export const TRANSACTION_TYPES: Record<string, string> = {
  buy: 'Buy',
  rent: 'Rent'
};

// Updated Property types with exact subtypes as per requirements
export const PROPERTY_TYPES: Record<string, PropertyType> = {
  residential: {
    label: 'Residential',
    subtypes: {
      apartment: 'Apartment',
      independent_house: 'Independent House', 
      villa: 'Villa',
      penthouse: 'Penthouse',
      studio_apartment: 'Studio Apartment',
      service_apartment: 'Service Apartment'
    }
  },
  commercial: {
    label: 'Commercial',
    subtypes: {
      office_space: 'Office Space',
      shop: 'Shop',
      showroom: 'Showroom',
      godown_warehouse: 'Godown/Warehouse',
      industrial_shed: 'Industrial Shed',
      industrial_building: 'Industrial Building',
      other_building: 'Other Building'
    }
  },
  land: {
    label: 'Land',
    subtypes: {
      // Updated land subtypes according to search_land_properties documentation
      agricultural: 'Agricultural Land',
      residential: 'Residential Plot',
      commercial: 'Commercial Plot', 
      industrial: 'Industrial Land',
      mixed_use: 'Mixed-use Land'
    }
  },
  pghostel: {
    label: 'PG/Hostel',
    subtypes: {
      single_sharing: 'Single Sharing',
      double_sharing: 'Double Sharing',
      triple_sharing: 'Triple Sharing',
      four_sharing: 'Four Sharing',
      dormitory: 'Dormitory'
    }
  },
  flatmates: {
    label: 'Flatmates',
    subtypes: {
      single_sharing: 'Single Sharing',
      double_sharing: 'Double Sharing', 
      triple_sharing: 'Triple Sharing',
      four_sharing: 'Four Sharing',
      dormitory: 'Dormitory'
    }
  }
};

// Keep COWORKING_SUBTYPES for backward compatibility (even though not used in new structure)
export const COWORKING_SUBTYPES: Record<string, string> = {
  private_office: 'Private Office',
  dedicated_desk: 'Dedicated Desk',
  hot_desk: 'Hot Desk',
  meeting_room: 'Meeting Room',
  conference_room: 'Conference Room',
  event_space: 'Event Space',
  virtual_office: 'Virtual Office'
};

// BHK types for residential properties only
export const BHK_TYPES: Record<string, string> = {
  '1bhk': '1 BHK',
  '2bhk': '2 BHK',
  '3bhk': '3 BHK',
  '4bhk': '4 BHK',
  '4plus': '4+ BHK'
};

// Major cities and districts in Telangana
export const TELANGANA_LOCATIONS: Record<string, string> = {
  hyderabad: 'Hyderabad',
  secunderabad: 'Secunderabad',
  warangal: 'Warangal',
  nizamabad: 'Nizamabad',
  karimnagar: 'Karimnagar',
  khammam: 'Khammam',
  mahbubnagar: 'Mahbubnagar',
  nalgonda: 'Nalgonda',
  adilabad: 'Adilabad',
  medak: 'Medak',
  rangareddy: 'Rangareddy',
  sangareddy: 'Sangareddy',
  siddipet: 'Siddipet',
  vikarabad: 'Vikarabad'
};

// Price ranges - updated with broader ranges for land properties
export const PRICE_RANGES: Record<string, string> = {
  'under-10l': 'Under ₹10L',
  '10l-25l': '₹10L - ₹25L', 
  '25l-50l': '₹25L - ₹50L',
  '50l-75l': '₹50L - ₹75L',
  '75l-1cr': '₹75L - ₹1Cr',
  '1cr-2cr': '₹1Cr - ₹2Cr',
  '2cr-3cr': '₹2Cr - ₹3Cr',
  '3cr-5cr': '₹3Cr - ₹5Cr',
  '5cr-10cr': '₹5Cr - ₹10Cr',
  'above-10cr': 'Above ₹10Cr'
};

// Area ranges for land properties (in sq ft)
// These could be added to filters in the future
export const LAND_AREA_RANGES: Record<string, string> = {
  'under-1000': 'Under 1,000 sq ft',
  '1000-2500': '1,000 - 2,500 sq ft',
  '2500-5000': '2,500 - 5,000 sq ft', 
  '5000-10000': '5,000 - 10,000 sq ft',
  '10000-43560': '10,000 sq ft - 1 Acre',
  '43560-87120': '1 - 2 Acres',
  '87120-217800': '2 - 5 Acres',
  '217800-435600': '5 - 10 Acres',
  'above-435600': 'Above 10 Acres'
};

// Area units commonly used in Indian land transactions
export const AREA_UNITS: Record<string, string> = {
  'sq_ft': 'Square Feet',
  'acres': 'Acres',
  'guntas': 'Guntas',
  'cents': 'Cents',
  'hectares': 'Hectares'
};

// Helper function to get available property types based on action type
export const getAvailablePropertyTypes = (actionType: string): Record<string, PropertyType> => {
  const availableTypes: Record<string, PropertyType> = {};

  if (actionType === 'buy') {
    // For Buy: Residential, Commercial, Land
    availableTypes.residential = PROPERTY_TYPES.residential;
    availableTypes.commercial = PROPERTY_TYPES.commercial;
    availableTypes.land = PROPERTY_TYPES.land;
  } else if (actionType === 'rent') {
    // For Rent: Residential, Commercial, PG/Hostel, Flatmates
    availableTypes.residential = PROPERTY_TYPES.residential;
    availableTypes.commercial = PROPERTY_TYPES.commercial;
    availableTypes.pghostel = PROPERTY_TYPES.pghostel;
    availableTypes.flatmates = PROPERTY_TYPES.flatmates;
  } else {
    // For Any: All property types available
    return PROPERTY_TYPES;
  }

  return availableTypes;
};

// Helper function to get subtypes based on property type and action type
export const getSubtypesForProperty = (
  propertyType: string, 
  actionType: string,
  isCoworking: boolean = false // Keep for backward compatibility
): Record<string, string> => {
  if (!propertyType || propertyType === 'any') {
    return {};
  }

  // Legacy coworking support (keep for backward compatibility)
  if (propertyType === 'commercial' && isCoworking) {
    return COWORKING_SUBTYPES;
  }

  // Check if property type is available for the selected action type
  const availableTypes = getAvailablePropertyTypes(actionType);
  
  if (!availableTypes[propertyType as keyof typeof availableTypes]) {
    return {}; // Property type not available for this action
  }

  // Return subtypes for the property type
  if (PROPERTY_TYPES[propertyType as keyof typeof PROPERTY_TYPES]) {
    return PROPERTY_TYPES[propertyType as keyof typeof PROPERTY_TYPES].subtypes;
  }

  return {};
};

// Helper function to check if BHK should be shown
export const shouldShowBHK = (propertyType: string): boolean => {
  // BHK is only shown for Residential properties (not PG/Hostel or Flatmates)
  return propertyType === 'residential';
};

// Helper function to check if area filters should be shown (for land properties)
export const shouldShowAreaFilter = (propertyType: string): boolean => {
  return propertyType === 'land';
};

// Helper function to get appropriate label for subtype dropdown
export const getSubtypeLabel = (propertyType: string): string => {
  switch (propertyType) {
    case 'land':
      return 'Land Type';
    case 'pghostel':
    case 'flatmates':
      return 'Room Type';
    case 'commercial':
      return 'Space Type';
    default:
      return 'Property Type';
  }
};

// Parse area range for land properties (future enhancement)
export const parseAreaRange = (areaRange: string): { min: number; max: number } | null => {
  const ranges: Record<string, { min: number; max: number }> = {
    'under-1000': { min: 0, max: 1000 },
    '1000-2500': { min: 1000, max: 2500 },
    '2500-5000': { min: 2500, max: 5000 },
    '5000-10000': { min: 5000, max: 10000 },
    '10000-43560': { min: 10000, max: 43560 }, // Up to 1 acre
    '43560-87120': { min: 43560, max: 87120 }, // 1-2 acres
    '87120-217800': { min: 87120, max: 217800 }, // 2-5 acres
    '217800-435600': { min: 217800, max: 435600 }, // 5-10 acres
    'above-435600': { min: 435600, max: 99999999 } // Above 10 acres
  };

  return ranges[areaRange] || null;
};