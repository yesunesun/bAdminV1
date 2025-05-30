// src/modules/owner/components/property/wizard/constants/commercialRentalDetails.ts
// Version: 1.0.0
// Last Modified: 30-05-2025 23:25 IST
// Purpose: Constants for commercial rental details form

export const COMMERCIAL_RENTAL_TYPES = [
  { id: 'rent', label: 'Monthly Rent' },
  { id: 'lease', label: 'Lease' }
] as const;

export const COMMERCIAL_MAINTENANCE_OPTIONS = [
  'Included in Rent',
  'Exclusive',
  'Fixed Amount',
  'None'
] as const;

export const COMMERCIAL_PARKING_OPTIONS = [
  'Reserved Parking',
  'Shared Parking',
  'Paid Parking',
  'No Parking'
] as const;

export const COMMERCIAL_BUSINESS_PREFERENCES = [
  'IT/Software Company',
  'Consulting Firm',
  'Finance/Banking',
  'Healthcare/Medical',
  'Legal Services',
  'Real Estate',
  'Education/Training',
  'Marketing/Advertising',
  'Manufacturing',
  'Retail Business',
  'Food & Beverage',
  'NGO/Non-Profit',
  'Government Office',
  'Startup',
  'Any Business Type'
] as const;

export const LEASE_TERMS = [
  '6 months',
  '11 months',
  '1 year',
  '2 years',
  '3 years',
  '5 years',
  '10+ years'
] as const;

export const OPERATING_HOURS_OPTIONS = [
  '24/7 Access',
  'Business Hours (9 AM - 6 PM)',
  'Extended Hours (7 AM - 9 PM)',
  'Custom Hours',
  'Weekdays Only',
  'Flexible Hours'
] as const;