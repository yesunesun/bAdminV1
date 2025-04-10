// src/modules/owner/components/property/wizard/constants/pgDetails.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 14:30 IST
// Purpose: Constants related to PG/Hostel details section

export const ROOM_TYPES = [
  'Single Sharing',
  'Double Sharing',
  'Triple Sharing',
  'Four Sharing',
  'Dormitory'
] as const;

export const BATHROOM_TYPES = [
  'Attached',
  'Common',
  'Both'
] as const;

export const MEAL_OPTIONS = [
  'No Meals',
  'Breakfast Only',
  'Breakfast & Dinner',
  'All Meals'
] as const;

export const PG_AMENITIES_LIST = [
  // Basic utilities
  'Power Backup',
  'Lift',
  'Security',
  'Internet/WiFi',
  'Air Conditioner',
  
  // Common areas
  'Common TV',
  'Common Refrigerator',
  'Study Room',
  'Common Kitchen',
  
  // Services
  'Laundry',
  'Room Cleaning',
  'Warden Service',
  
  // Recreation
  'Indoor Games',
  'Outdoor Games',
  'Gym',
  
  // Food related
  'Meal Service',
  'Dining Area',
  
  // Safety
  'CCTV Cameras',
  'Fire Safety',
  
  // Additional
  'Parking',
  'Visitor Area'
] as const;