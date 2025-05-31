// src/components/Search/constants/searchConstants.ts
// Version: 2.0.0
// Last Modified: 31-01-2025 16:30 IST
// Purpose: Updated constants to match new dropdown requirements with Action Type (Buy/Sell), conditional Land for Sell only

import { PropertyType } from '../types/search.types';

// Updated Action Types (Buy/Sell instead of Buy/Rent)
export const ACTION_TYPES: Record<string, string> = {
  any: 'Any',
  buy: 'Buy', 
  sell: 'Sell'
};

// Keep TRANSACTION_TYPES for backward compatibility
export const TRANSACTION_TYPES: Record<string, string> = {
  buy: 'Buy',
  rent: 'Rent'
};

// Updated Property types with conditional logic for Land
export const PROPERTY_TYPES: Record<string, PropertyType> = {
  residential: {
    label: 'Residential',
    subtypes: {
      // For Buy/Sell transactions
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
      // For Buy/Sell transactions
      office_space: 'Office Space',
      shop: 'Shop',
      showroom: 'Showroom',
      godown_warehouse: 'Godown/Warehouse',
      industrial_shed: 'Industrial Shed',
      industrial_building: 'Industrial Building',
      other_business: 'Other Business'
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
      four_sharing: 'Four Sharing'
    }
  }
};

// Coworking specific subtypes for Commercial -> Co-working
export const COWORKING_SUBTYPES: Record<string, string> = {
  private_office: 'Private Office',
  dedicated_desk: 'Dedicated Desk',
  hot_desk: 'Hot Desk',
  meeting_room: 'Meeting Room',
  conference_room: 'Conference Room',
  event_space: 'Event Space',
  virtual_office: 'Virtual Office'
};

// BHK types for residential properties (excluding PG/Hostel and Flatmates)
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
  const availableTypes: Record<string, PropertyType> = {
    residential: PROPERTY_TYPES.residential,
    commercial: PROPERTY_TYPES.commercial,
    pghostel: PROPERTY_TYPES.pghostel,
    flatmates: PROPERTY_TYPES.flatmates
  };

  // Land is only available for "Sell" action
  if (actionType === 'sell') {
    availableTypes.land = PROPERTY_TYPES.land;
  }

  return availableTypes;
};

// Helper function to get subtypes based on property type and action type
export const getSubtypesForProperty = (
  propertyType: string, 
  actionType: string, 
  isCoworking: boolean = false
): Record<string, string> => {
  if (!propertyType || propertyType === 'any') {
    return {};
  }

  // Special case for coworking spaces
  if (propertyType === 'commercial' && isCoworking) {
    return COWORKING_SUBTYPES;
  }

  // For PG/Hostel and Flatmates, always return their specific subtypes
  if (propertyType === 'pghostel' || propertyType === 'flatmates') {
    return PROPERTY_TYPES[propertyType].subtypes;
  }

  // For Land, only available with Sell action
  if (propertyType === 'land') {
    if (actionType === 'sell') {
      return PROPERTY_TYPES.land.subtypes;
    }
    return {}; // No subtypes if land is not with sell
  }

  // For Residential and Commercial with Buy/Sell actions
  if (PROPERTY_TYPES[propertyType as keyof typeof PROPERTY_TYPES]) {
    return PROPERTY_TYPES[propertyType as keyof typeof PROPERTY_TYPES].subtypes;
  }

  return {};
};

// Helper function to check if BHK should be shown
export const shouldShowBHK = (propertyType: string): boolean => {
  return propertyType === 'residential' && 
         propertyType !== 'pghostel' && 
         propertyType !== 'flatmates';
};