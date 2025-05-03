// src/modules/owner/components/property/wizard/constants/commercialDetails.ts
// Version: 1.2.0
// Last Modified: 03-05-2025 17:15 IST
// Purpose: Added building types with property type mapping

export const COMMERCIAL_PROPERTY_TYPES = [
  'Office Space',
  'Co-Working',
  'Shop',
  'Showroom',
  'Godown/Warehouse',
  'Industrial Shed',
  'Industrial Building',
  'Other business'
] as const;

export const COMMERCIAL_BUILDING_TYPES = [
  'Independent House',
  'Business Park',
  'Mall',
  'Standalone building',
  'Independent shop'
] as const;

// Mapping of property types to available building types
export const PROPERTY_TO_BUILDING_TYPES: Record<string, string[]> = {
  'Office Space': ['Independent House', 'Business Park', 'Mall', 'Standalone building', 'Independent shop'],
  'Co-Working': ['Independent House', 'Business Park', 'Mall', 'Standalone building', 'Independent shop'],
  'Shop': ['Independent House', 'Business Park', 'Mall', 'Standalone building', 'Independent shop'],
  'Showroom': ['Independent House', 'Business Park', 'Mall', 'Standalone building', 'Independent shop'],
  'Godown/Warehouse': ['Standalone building'],
  'Industrial Shed': ['Standalone building'],
  'Industrial Building': ['Standalone building'],
  'Other business': ['Independent House', 'Business Park', 'Mall', 'Standalone building', 'Independent shop']
};

export const COMMERCIAL_FURNISHING_OPTIONS = [
  'Fully Furnished',
  'Semi Furnished',
  'Bare Shell',
  'Unfurnished'
] as const;

export const COMMERCIAL_AGE_OPTIONS = [
  '0 - 1 year',
  '1 - 3 years',
  '3 - 5 years',
  '5 - 10 years',
  '10+ years'
] as const;

export const COMMERCIAL_MAINTENANCE_OPTIONS = [
  'Included in Rent',
  'Exclusive',
  'Fixed',
  'None'
] as const;

export const LEASE_DURATION_OPTIONS = [
  '11 months',
  '1 year',
  '2 years',
  '3 years',
  '3+ years',
  '5+ years',
  'Custom'
] as const;

export const COMMERCIAL_AMENITIES = [
  'Lift/Elevator',
  'Reserved Parking',
  'Security',
  'Fire Safety',
  'Conference Room',
  'Power Backup',
  'CCTV Surveillance',
  'Centralized AC',
  'Cafeteria',
  'ATM',
  'Internet/WiFi',
  'Visitor Parking',
  'Water Storage',
  'Waste Disposal'
] as const;