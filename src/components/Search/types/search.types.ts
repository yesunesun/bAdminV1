// src/components/Search/types/search.types.ts
// Version: 2.1.0
// Last Modified: 01-06-2025 23:50 IST
// Purpose: Added property code field to SearchResult interface

export interface SearchFilters {
  searchQuery: string;
  selectedLocation: string;
  transactionType: string;
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
  code?: string | null; // ADDED: Property code from meta.code
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalCount: number;
}

export type FilterType = 'transactionType' | 'propertyType' | 'subType' | 'bhkType' | 'priceRange' | 'location';

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