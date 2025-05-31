// src/components/Search/services/searchService/utils/paramUtils.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 15:25 IST
// Purpose: Parameter building and validation utilities for SearchService

import { SearchFilters, SearchOptions, SearchParams } from '../types/searchService.types';
import { getEffectiveSubtype, getPropertySubtype, extractBHKNumber, parsePriceRange } from './mappingUtils';

/**
 * Build search parameters for database functions with p_property_subtype
 */
export const buildSearchParams = (filters: SearchFilters, options: SearchOptions): SearchParams => {
  const params: SearchParams = {
    p_search_query: filters.searchQuery || null,
    p_limit: options.limit || 50,
    p_offset: ((options.page || 1) - 1) * (options.limit || 50),
    p_sort_by: options.sortBy || 'created_at',
    p_sort_order: (options.sortOrder || 'desc').toUpperCase(),
  };

  // Location filters
  if (filters.selectedLocation && filters.selectedLocation !== 'any') {
    const locationMapping: Record<string, string> = {
      'hyderabad': 'Hyderabad',
      'secunderabad': 'Secunderabad',
      'warangal': 'Warangal',
      'nizamabad': 'Nizamabad',
      'karimnagar': 'Karimnagar',
      'khammam': 'Khammam',
      'mahbubnagar': 'Mahbubnagar',
      'nalgonda': 'Nalgonda',
      'adilabad': 'Adilabad',
      'medak': 'Medak',
      'rangareddy': 'Rangareddy',
      'sangareddy': 'Sangareddy',
      'siddipet': 'Siddipet',
      'vikarabad': 'Vikarabad'
    };
    
    params.p_city = locationMapping[filters.selectedLocation] || filters.selectedLocation;
    params.p_state = 'Telangana';
  }

  // Get effective subtype for database filtering
  const effectiveSubtype = getEffectiveSubtype(filters);
  if (effectiveSubtype) {
    params.p_subtype = effectiveSubtype;
    console.log('🎯 Database subtype parameter:', effectiveSubtype);
  }

  // Add property subtype parameter for database-level filtering
  if (filters.selectedSubType && filters.selectedSubType !== 'any') {
    const propertySubtype = getPropertySubtype(filters.selectedSubType);
    if (propertySubtype) {
      params.p_property_subtype = propertySubtype;
      console.log('🔍 Database property subtype parameter:', propertySubtype);
    }
  }

  // BHK filter (bedrooms) - only for residential properties
  if (filters.selectedBHK && filters.selectedBHK !== 'any' && filters.selectedPropertyType === 'residential') {
    const bhkNumber = extractBHKNumber(filters.selectedBHK);
    if (bhkNumber) {
      params.p_bedrooms = bhkNumber;
      console.log('🏠 BHK filter applied:', bhkNumber);
    }
  }

  // Price range filter
  if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') {
    const priceRange = parsePriceRange(filters.selectedPriceRange);
    if (priceRange) {
      params.p_min_price = priceRange.min;
      params.p_max_price = priceRange.max;
      console.log('💰 Price range filter applied:', priceRange);
    }
  }

  console.log('🔧 Final search parameters:', params);
  return params;
};

/**
 * Check if property subtype matches selected filter
 */
export const doesPropertyMatchSubtype = (propertyFlowType: string, selectedSubtype: string): boolean => {
  if (!selectedSubtype || selectedSubtype === 'any') {
    return true; // No subtype filter applied
  }

  // For PG/Hostel and Flatmates, the flow type itself is the filter
  if (selectedSubtype === 'pghostel' || selectedSubtype === 'flatmates') {
    return propertyFlowType.includes(selectedSubtype);
  }

  // For regular properties, we now rely on the database-level filtering
  return true;
};

/**
 * Validate search parameters
 */
export const validateSearchParams = (params: SearchParams): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check required parameters
  if (params.p_limit && (params.p_limit < 1 || params.p_limit > 1000)) {
    errors.push('p_limit must be between 1 and 1000');
  }
  
  if (params.p_offset && params.p_offset < 0) {
    errors.push('p_offset must be non-negative');
  }
  
  if (params.p_sort_by && !['created_at', 'price', 'area', 'title'].includes(params.p_sort_by)) {
    errors.push('p_sort_by must be one of: created_at, price, area, title');
  }
  
  if (params.p_sort_order && !['ASC', 'DESC'].includes(params.p_sort_order)) {
    errors.push('p_sort_order must be ASC or DESC');
  }
  
  // Check price range
  if (params.p_min_price && params.p_max_price && params.p_min_price > params.p_max_price) {
    errors.push('p_min_price cannot be greater than p_max_price');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};