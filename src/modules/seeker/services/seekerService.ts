// src/modules/seeker/services/seekerService.ts
// Version: 6.2.0
// Last Modified: 09-05-2025 16:30 IST
// Purpose: Main entry point for seeker services - refactored to use properties_v2_likes table

import { PropertyType } from '@/modules/owner/components/property/types';

// Define PropertyFilters interface to maintain compatibility
export interface PropertyFilters {
  searchQuery?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  propertyAge?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

// Re-export from other service files to maintain API compatibility
export {
  // Constants
  markerPins,
  propertyTypeOptions,
} from './constants';

// Property service re-exports
export {
  fetchProperties,
  fetchPropertyById,
  fetchSimilarProperties,
} from './propertyService';

// Map service re-exports
export {
  fetchPropertiesForMap,
} from './mapService';

// Favorites service re-exports
export {
  getUserFavorites,
  getUserLikedPropertyIds,
  checkPropertyLike,
  addFavorite,
  removeFavorite,
  togglePropertyLike,
} from './favoriteService';

// Visit service re-exports
export {
  submitVisitRequest,
  reportProperty,
} from './visitService';

// Utility functions re-exports
export {
  formatPrice,
  getMarkerPin,
  safeParseNumber,
  getNestedValue,
  debugTableSchema,
  processPropertyData,
  extractImagesFromProperty,
} from './utilityService';