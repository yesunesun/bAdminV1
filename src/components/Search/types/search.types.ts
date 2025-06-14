// src/components/Search/types/search.types.ts
// Version: 3.0.0
// Last Modified: 07-06-2025 15:45 IST
// Purpose: Added latitude and longitude fields to SearchResult for map marker rendering

export interface SearchFilters {
  searchQuery: string;
  selectedLocation: string;
  actionType: string; // FIXED: Changed from transactionType to actionType for consistency
  selectedPropertyType: string;
  selectedSubType: string;
  selectedBHK: string;
  selectedPriceRange: string;
}

export interface PropertyType {
  label: string;
  subtypes: Record<string, string>;
}

export interface SearchResult {
  id: string;
  title: string;
  location: string;
  price: number;
  propertyType: string;
  transactionType: string;
  subType: string;
  bhk: string | null;
  area: number;
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
  status: string;
  primary_image: string | null; // Image filename from database
  code?: string | null; // Property code from meta.code
  // NEW: Coordinate fields for map marker rendering
  latitude?: number; // Latitude coordinate from search SQL functions
  longitude?: number; // Longitude coordinate from search SQL functions
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export type FilterType = 'actionType' | 'propertyType' | 'subType' | 'bhkType' | 'priceRange' | 'location'; // FIXED: Changed transactionType to actionType

export interface SearchContainerProps {
  onSearch?: (filters: SearchFilters) => void;
  showResults?: boolean;
  className?: string;
}

export interface SearchHeaderProps {
  searchQuery: string;
  selectedLocation: string;
  onSearchQueryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearch: () => void;
}

export interface SearchFiltersProps {
  filters: SearchFilters;
  onFilterChange: (filterType: keyof SearchFilters, value: string) => void;
  getSubTypes: () => Record<string, string>;
  getSubtypeLabel: () => string;
}

export interface ActiveFiltersProps {
  filters: SearchFilters;
  onClearFilter: (filterType: FilterType) => void;
  onClearAll: () => void;
  hasActiveFilters: boolean;
  getFilterDisplayValue: (filterType: FilterType, value: string) => string;
  getSubTypes: () => Record<string, string>;
}