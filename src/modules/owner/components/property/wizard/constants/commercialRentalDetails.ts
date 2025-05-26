// src/modules/owner/components/property/wizard/constants/commercialRentalDetails.ts
// Version: 1.0.0
// Last Modified: 26-05-2025 10:30 IST
// Purpose: Constants for Commercial Rental Details section

export const COMMERCIAL_RENTAL_TYPES = [
  { id: 'rent', label: 'Rent' },
  { id: 'lease', label: 'Lease' }
] as const;

export const COMMERCIAL_MAINTENANCE_OPTIONS = [
  'Maintenance Included',
  'Maintenance Extra',
  'No Maintenance',
  'CAM Charges Separate',
  'Triple Net Lease'
] as const;

export const COMMERCIAL_BUSINESS_PREFERENCES = [
  'Retail Business',
  'Office Use',
  'Service Industry', 
  'Food & Beverage',
  'Healthcare Services',
  'Educational Institute',
  'Financial Services',
  'IT/Software Company',
  'Manufacturing Unit',
  'Warehouse/Storage',
  'Any Business Type'
] as const;

export const COMMERCIAL_FURNISHING_OPTIONS = [
  'Fully Furnished',
  'Semi Furnished', 
  'Bare Shell',
  'Unfurnished',
  'Built-to-Suit'
] as const;

export const COMMERCIAL_PARKING_OPTIONS = [
  'No Parking',
  'Open Parking',
  'Covered Parking',
  'Reserved Slots',
  'Valet Available',
  'Multi-level Parking'
] as const;

export const LEASE_TERMS = [
  '11 months',
  '1 year',
  '2 years', 
  '3 years',
  '5 years',
  '9 years',
  '15+ years',
  'Custom'
] as const;

export const OPERATING_HOURS_OPTIONS = [
  '24/7 Access',
  'Business Hours Only',
  'Extended Hours (6 AM - 10 PM)',
  'Flexible Hours',
  'Custom Schedule'
] as const;