// src/modules/owner/components/property/wizard/constants/propertyDetails.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 14:30 IST
// Purpose: Constants related to property details section

export const PROPERTY_TYPES = [
  'Apartment',
  'Independent House',
  'Villa',
  'Penthouse',
  'Studio Apartment',
  'Service Apartment'
] as const;

export const BHK_TYPES = [
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK',
  '4+ BHK'
] as const;

export const PROPERTY_AGE = [
  '0 - 1 year',
  '1 - 3 years',
  '3 - 5 years',
  '5 - 10 years',
  '10+ years'
] as const;

export const FACING_OPTIONS = [
  'North',
  'South',
  'East',
  'West',
  'North East',
  'North West',
  'South East',
  'South West'
] as const;

export const AREA_UNITS = [
  { value: 'sqft', label: 'sq ft' },
  { value: 'sqyd', label: 'sq yard' }
] as const;