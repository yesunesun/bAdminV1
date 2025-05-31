// src/components/Search/constants/searchConstants.ts
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: Constants and static data for search functionality

import { PropertyType } from '../types/search.types';

// Property types and their subtypes
export const PROPERTY_TYPES: Record<string, PropertyType> = {
  residential: {
    label: 'Residential',
    subtypes: {
      apartment: 'Apartment',
      villa: 'Villa',
      house: 'House',
      studio: 'Studio',
      duplex: 'Duplex',
      penthouse: 'Penthouse',
      farmhouse: 'Farmhouse'
    }
  },
  commercial: {
    label: 'Commercial',
    subtypes: {
      office_space: 'Office Space',
      coworking: 'Co-Working',
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

// Coworking specific subtypes
export const COWORKING_SUBTYPES: Record<string, string> = {
  private_office: 'Private Office',
  dedicated_desk: 'Dedicated Desk',
  hot_desk: 'Hot Desk',
  meeting_room: 'Meeting Room',
  conference_room: 'Conference Room',
  event_space: 'Event Space',
  virtual_office: 'Virtual Office'
};

// Buy/Rent options
export const TRANSACTION_TYPES: Record<string, string> = {
  buy: 'Buy',
  rent: 'Rent'
};

// BHK types for residential properties
export const BHK_TYPES: Record<string, string> = {
  '1bhk': '1 BHK',
  '2bhk': '2 BHK',
  '3bhk': '3 BHK',
  '4bhk': '4 BHK',
  '5bhk': '5+ BHK',
  'studio': 'Studio'
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