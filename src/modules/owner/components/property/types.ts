// src/modules/owner/components/property/types.ts
// Version: 1.0.0
// Last Modified: 2025-07-09
// Purpose: Re-export Property types with coordinate fields for MapPanel compatibility

import { Property as BaseProperty } from './wizard/types';

// Extended Property interface that includes coordinate fields for map display
export interface Property extends BaseProperty {
  // Coordinate fields added for map compatibility
  latitude?: number | null;
  longitude?: number | null;
  
  // Additional fields that might be needed for seeker components
  ownerName?: string;
  ownerPhone?: string;
  propertyType?: string;
  transactionType?: string;
  subType?: string;
  bhk?: string | null;
  area?: number;
  location?: string;
  primary_image?: string | null;
  code?: string | null;
}

// Re-export other types from wizard/types
export * from './wizard/types';