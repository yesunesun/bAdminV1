// src/modules/owner/components/property/wizard/constants/commercialSaleDetails.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 22:45 IST
// Purpose: Constants for Commercial Sale property flow

export const COMMERCIAL_SALE_PROPERTY_TYPES = [
  'Office Space',
  'Shop/Showroom',
  'Commercial Land',
  'Industrial Building',
  'Warehouse/Godown',
  'Industrial Shed',
  'Hotel/Resort',
  'Restaurant/Cafe',
  'Guest House',
  'Banquet Hall'
] as const;

export const COMMERCIAL_PRICE_OPTIONS = [
  'Fixed',
  'Negotiable',
  'Price on Request'
] as const;

export const COMMERCIAL_OWNERSHIP_OPTIONS = [
  'Freehold',
  'Leasehold',
  'Co-operative Society',
  'Power of Attorney'
] as const;

export const TRANSACTION_TYPES = [
  'New Property',
  'Resale'
] as const;

export const APPROVED_USAGE_TYPES = [
  'Commercial',
  'Retail',
  'Industrial',
  'Hospitality',
  'Mixed Use'
] as const;

export const PROPERTY_STATUS_OPTIONS = [
  'Ready to Move',
  'Under Construction'
] as const;

export const CONSTRUCTION_STATUS = [
  'Not Started',
  'Foundation',
  'Structure Completed',
  'Finishing Stage',
  'Almost Ready'
] as const;

export const TITLE_DEED_STATUS = [
  'Clear',
  'Disputed',
  'Under Verification'
] as const;

export const TAX_REGISTRATION_TYPES = [
  'GST Registered',
  'Not Registered',
  'In Process'
] as const;