// src/modules/owner/components/property/wizard/constants/commercialDetails.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 22:30 IST
// Purpose: Constants specific to commercial property listings

export const COMMERCIAL_PROPERTY_TYPES = [
  'Office Space',
  'Shop/Showroom',
  'Commercial Land',
  'Industrial Building',
  'Warehouse/Godown',
  'Industrial Shed',
  'Co-working Space',
  'Hotel/Resort',
  'Restaurant/Cafe',
  'Guest House',
  'Banquet Hall'
] as const;

export const COMMERCIAL_FURNISHING_OPTIONS = [
  'Fully Furnished',
  'Semi Furnished',
  'Bare Shell',
  'Unfurnished'
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