// src/modules/owner/components/property/wizard/constants/coworkingDetails.ts
// Version: 1.3.0
// Last Modified: 17-05-2025 15:15 IST
// Purpose: Constants for Commercial Co-working property flow

export const COWORKING_SPACE_TYPES = [
  'Private Office',
  'Dedicated Desk',
  'Hot Desk',
  'Meeting Room',
  'Conference Room',
  'Event Space',
  'Virtual Office'
] as const;

export const COWORKING_LEASE_TERMS = [
  'Daily',
  'Weekly',
  'Monthly',
  'Quarterly',
  'Annually',
  'Custom'
] as const;

export const COWORKING_AMENITIES = [
  'High-speed Internet',
  'Meeting Rooms',
  'Reception Services',
  'Printer/Scanner/Copier',
  'Kitchen/Pantry',
  'Coffee/Tea',
  'Mail Handling',
  'Phone Booths',
  '24/7 Access',
  'Security',
  'Cleaning Services',
  'Networking Events'
] as const;

export const DESK_TYPES = [
  'Standing Desk',
  'Standard Desk',
  'Ergonomic Desk',
  'Custom Desk'
] as const;

export const BOOKING_OPTIONS = [
  'Online Booking System',
  'Direct Contact',
  'Through App',
  'Through Website'
] as const;

// Add the properly named constant that matches what the code is trying to import
export const COWORKING_BOOKING_OPTIONS = BOOKING_OPTIONS;

export const PRICING_STRUCTURES = [
  'Per Seat',
  'Per Office',
  'Per Day',
  'Per Hour',
  'Package Deal'
] as const;

// Add the properly named constant that matches what the code is trying to import
export const COWORKING_PRICING_STRUCTURES = PRICING_STRUCTURES;

export const ACCESS_POLICY_OPTIONS = [
  'Business Hours Only',
  '24/7 Access',
  'Extended Hours',
  'Custom Schedule'
] as const;

export const INTERNET_SPEED_OPTIONS = [
  'Up to 100 Mbps',
  '100-500 Mbps',
  '500-1000 Mbps',
  '1+ Gbps'
] as const;

// Add the properly named constant that matches what the code is trying to import
export const COWORKING_INTERNET_SPEEDS = INTERNET_SPEED_OPTIONS;