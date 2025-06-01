// src/components/Search/constants/searchConstants.ts
// Version: 3.0.0
// Last Modified: 01-06-2025 17:15 IST
// Purpose: Updated property types and subtypes to match exact dropdown requirements with COWORKING_SUBTYPES kept for compatibility

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
      residential_plot: 'Residential Plot',
      commercial_plot: 'Commercial Plot',
      agricultural_land: 'Agricultural Land',
      industrial_land: 'Industrial Land',
      mixed_use_land: 'Mixed-use Land'
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

// Price ranges
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