// src/modules/owner/components/property/wizard/constants/pgDetails.ts
// Version: 2.0.0
// Last Modified: 31-05-2025 11:45 IST
// Purpose: Updated PG amenities list - removed duplicates and irrelevant items based on requirements

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

// ✅ UPDATED: Filtered PG amenities list - kept only relevant and non-duplicate items
export const PG_AMENITIES_LIST = [
  // ✅ KEEP: Common areas and services
  'Common Refrigerator',
  'Laundry',
  'Meal Service',
  'Study Room',
  'Room Cleaning',
  'Dining Area',
  'Common TV',
  'Common Kitchen',
  'Warden Service'
] as const;

// ✅ REMOVED ITEMS (duplicates and irrelevant):
// - 'Power Backup' (Duplicate)
// - 'Internet/WiFi' (Duplicate)
// - 'Indoor Games' (Irrelevant)
// - 'Fire Safety' (Duplicate)
// - 'Lift' (Irrelevant)
// - 'Air Conditioner' (Duplicate)
// - 'Outdoor Games' (Irrelevant)
// - 'Parking' (Irrelevant)
// - 'Security' (Duplicate/Irrelevant)
// - 'Gym' (Irrelevant)
// - 'CCTV Cameras' (Duplicate/Irrelevant)
// - 'Visitor Area' (Irrelevant)

// ✅ Optional: Keep the full list for reference (commented out)
/*
export const PG_AMENITIES_LIST_FULL = [
  // Basic utilities - REMOVED (duplicates)
  'Power Backup',        // ❌ Duplicate
  'Lift',               // ❌ Irrelevant
  'Security',           // ❌ Duplicate/Irrelevant
  'Internet/WiFi',      // ❌ Duplicate
  'Air Conditioner',    // ❌ Duplicate
  
  // Common areas - KEEP
  'Common TV',          // ✅ Keep
  'Common Refrigerator', // ✅ Keep
  'Study Room',         // ✅ Keep
  'Common Kitchen',     // ✅ Keep
  
  // Services - KEEP
  'Laundry',           // ✅ Keep
  'Room Cleaning',     // ✅ Keep
  'Warden Service',    // ✅ Keep
  
  // Recreation - REMOVED (irrelevant)
  'Indoor Games',      // ❌ Irrelevant
  'Outdoor Games',     // ❌ Irrelevant
  'Gym',              // ❌ Irrelevant
  
  // Food related - KEEP
  'Meal Service',      // ✅ Keep
  'Dining Area',       // ✅ Keep
  
  // Safety - REMOVED (duplicates)
  'CCTV Cameras',      // ❌ Duplicate/Irrelevant
  'Fire Safety',       // ❌ Duplicate
  
  // Additional - REMOVED (irrelevant)
  'Parking',           // ❌ Irrelevant
  'Visitor Area'       // ❌ Irrelevant
] as const;
*/