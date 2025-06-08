// src/modules/owner/components/property/wizard/constants/flatmateDetails.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 22:45 IST
// Purpose: Constants for Residential Flatmates property flow

export const FLATMATE_PREFERENCES = [
  'Students',
  'Working Professionals',
  'Either Student or Working',
  'Family',
  'Couples'
] as const;

export const GENDER_PREFERENCES = [
  'Male',
  'Female',
  'Any Gender'
] as const;

export const ROOM_SHARING_OPTIONS = [
  'Private Room',
  'Shared Room (2 People)',
  'Shared Room (3+ People)'
] as const;

export const OCCUPANCY_STATUS = [
  'Available Immediately',
  'Available from Specific Date',
  'Occupied, Finding Replacement'
] as const;

export const HOUSE_RULES = [
  'No Smoking',
  'No Alcohol',
  'No Pets',
  'No Loud Music after 10 PM',
  'No Overnight Guests',
  'Vegetarian Only',
  'No Parties'
] as const;

export const AGE_GROUP_PREFERENCES = [
  '18-25',
  '26-35',
  '36-45',
  '46+',
  'Any Age'
] as const;

export const BATHROOM_SHARING = [
  'Private Bathroom',
  'Shared Bathroom (2 People)',
  'Shared Bathroom (3+ People)',
  'Common Bathroom for Floor'
] as const;

export const ADDITIONAL_EXPENSES = [
  'Electricity',
  'Water',
  'Internet',
  'Cable TV',
  'Maid Service',
  'Cooking Gas',
  'Maintenance'
] as const;

export const CURRENT_OCCUPANT_COUNT = [
  '1',
  '2',
  '3',
  '4',
  '5+'
] as const;

export const LEASE_DURATION_OPTIONS = [
  '3 Months',
  '6 Months',
  '1 Year',
  'Flexible'
] as const;