// src/modules/owner/components/property/wizard/constants/rentalDetails.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 14:30 IST
// Purpose: Constants related to rental details section

export const RENTAL_TYPES = [
  { id: 'rent', label: 'Rent' },
  { id: 'lease', label: 'Lease' }
] as const;

export const MAINTENANCE_OPTIONS = [
  'Maintenance Included',
  'Maintenance Extra',
  'No Maintenance'
] as const;

export const TENANT_PREFERENCES = [
  'Family',
  'Bachelor Male',
  'Bachelor Female',
  'Company',
  'Only Vegetarian',
  'Any'
] as const;