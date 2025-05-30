// src/components/Search/types/search.types.ts
// Version: 1.0.0
// Last Modified: 01-06-2025 16:00 IST
// Purpose: TypeScript interfaces for search functionality

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
    // Add more properties as needed
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
  }
  
  export interface ActiveFiltersProps {
    filters: SearchFilters;
    onClearFilter: (filterType: FilterType) => void;
    onClearAll: () => void;
  }