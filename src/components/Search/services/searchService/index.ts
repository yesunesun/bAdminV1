// src/components/Search/services/searchService/index.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 15:05 IST
// Purpose: Main export file for SearchService - maintains backward compatibility

import { SearchService } from './SearchService';

// Export types for external use
export type { 
  SearchResponse, 
  SearchOptions, 
  SearchFilters, 
  SearchResult 
} from './types/searchService.types';

// Export utility functions for external use if needed
export { 
  formatLocation, 
  extractOwnerName, 
  extractBHKNumber, 
  parsePriceRange 
} from './utils/mappingUtils';

export { 
  transformDatabaseResults, 
  formatDbResultForLog 
} from './utils/transformUtils';

export { 
  buildSearchParams, 
  validateSearchParams 
} from './utils/paramUtils';

// Create and export singleton instance - MAINTAINS EXISTING IMPORT COMPATIBILITY
const searchServiceInstance = new SearchService();

// Export the instance and class for maximum compatibility
export { searchServiceInstance as searchService };
export { SearchService };
export default searchServiceInstance;