// src/components/Search/services/searchService/types/searchService.types.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 14:30 IST
// Purpose: Type definitions for SearchService refactoring

import { SearchFilters, SearchResult } from '../../types/search.types';

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  page: number;
  limit: number;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Database result interfaces with primary_image and code fields
export interface ResidentialSearchResult {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  property_type: string;
  flow_type: string;
  subtype: string;
  total_count: number;
  title: string;
  price: number;
  city: string;
  state: string;
  area: number;
  owner_email: string;
  status: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_unit: string;
  land_type: string | null;
  primary_image: string | null;
  code?: string | null;
}

export interface CommercialSearchResult {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  property_type: string;
  flow_type: string;
  subtype: string;
  total_count: number;
  title: string;
  price: number;
  city: string;
  state: string;
  area: number;
  owner_email: string;
  status: string;
  area_unit: string;
  primary_image: string | null;
  code?: string | null;
}

export interface LandSearchResult {
  id: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  property_type: string;
  flow_type: string;
  subtype: string;
  total_count: number;
  title: string;
  price: number;
  city: string;
  state: string;
  area: number;
  owner_email: string;
  status: string;
  area_unit: string;
  land_type: string;
  primary_image: string | null;
  code?: string | null;
}

// Union type for all database results
export type DatabaseSearchResult = ResidentialSearchResult | CommercialSearchResult | LandSearchResult;

// Search parameter building interface
export interface SearchParams {
  p_search_query?: string | null;
  p_limit?: number;
  p_offset?: number;
  p_sort_by?: string;
  p_sort_order?: string;
  p_city?: string | null;
  p_state?: string | null;
  p_subtype?: string | null;
  p_property_subtype?: string | null;
  p_min_price?: number | null;
  p_max_price?: number | null;
  p_bedrooms?: number | null;
  p_bathrooms?: number | null;
  p_area_min?: number | null;
  p_area_max?: number | null;
}

// Price range interface
export interface PriceRange {
  min: number;
  max: number;
}

// Database function call result
export interface DatabaseCallResult {
  data: DatabaseSearchResult[] | null;
  error: any;
}

export { SearchFilters, SearchResult };