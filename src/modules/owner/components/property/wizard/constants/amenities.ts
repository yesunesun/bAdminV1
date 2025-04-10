// src/modules/owner/components/property/wizard/constants/amenities.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 14:30 IST
// Purpose: Constants related to amenities and features section

export const PROPERTY_SHOW_OPTIONS = [
  'Owner',
  'Caretaker',
  'Security',
  'Agent'
] as const;

export const PROPERTY_CONDITION_OPTIONS = [
  'Excellent',
  'Good',
  'Average',
  'Needs Repair'
] as const;

export const AMENITIES_LIST = [
  // Basic utilities
  'Power Backup',
  'Lift',
  'Security',
  'Gas Pipeline',
  'Air Conditioner',
  'Internet Services',
  'Intercom',
  
  // Facilities
  'Swimming Pool',
  'Club House',
  'Children Play Area',
  'Indoor Games',
  'Park',
  'Garden',
  
  // Services
  'House Keeping',
  'Servant Room',
  'Fire Safety',
  'Shopping Center',
  
  // Parking & Water
  'Visitor Parking',
  'Water Storage',
  'Rain Water Harvesting',
  'Sewage Treatment Plant'
] as const;