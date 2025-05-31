// src/components/Search/index.ts
// Version: 2.0.0
// Last Modified: 01-06-2025 16:30 IST
// Purpose: Main exports for Search components and utilities

// Main component
export { default as SearchContainer } from './SearchContainer';

// Individual components
export { default as SearchHeader } from './components/SearchHeader';
export { default as SearchFilters } from './components/SearchFilters';
export { default as ActiveFilters } from './components/ActiveFilters';
export { default as SearchResults } from './components/SearchResults';
export { default as SearchResultsTable } from './components/SearchResultsTable';

// Hooks
export { useSearch } from './hooks/useSearch';
export { useSearchFilters } from './hooks/useSearchFilters';

// Services
export { searchService, type SearchResponse, type SearchOptions } from './services/searchService';

// Types
export type {
  SearchFilters,
  PropertyType,
  SearchResult,
  SearchState,
  FilterType,
  SearchContainerProps,
  SearchHeaderProps,
  SearchFiltersProps,
  ActiveFiltersProps
} from './types/search.types';

// Constants
export {
  PROPERTY_TYPES,
  COWORKING_SUBTYPES,
  TRANSACTION_TYPES,
  BHK_TYPES,
  TELANGANA_LOCATIONS,
  PRICE_RANGES
} from './constants/searchConstants';