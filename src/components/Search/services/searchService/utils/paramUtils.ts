// src/components/Search/services/searchService/utils/paramUtils.ts
// Version: 2.0.0
// Last Modified: 02-06-2025 18:35 IST
// Purpose: Simplified parameter building for residential and commercial properties

import { SearchFilters, SearchOptions, SearchParams } from '../types/searchService.types';

/**
 * Build search parameters for residential properties according to search_residential_properties function
 */
export const buildResidentialSearchParams = (filters: SearchFilters, options: SearchOptions): SearchParams => {
  const params: SearchParams = {
    p_search_query: filters.searchQuery?.trim() || null,
    p_limit: options.limit || 50,
    p_offset: ((options.page || 1) - 1) * (options.limit || 50),
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

  // Map action type to subtype (transaction type)
  if (filters.actionType && filters.actionType !== 'any') {
    if (filters.selectedPropertyType === 'pghostel') {
      params.p_subtype = 'pghostel';
    } else if (filters.selectedPropertyType === 'flatmates') {
      params.p_subtype = 'flatmates';
    } else {
      // Regular residential properties
      switch (filters.actionType) {
        case 'buy':
        case 'sell':
          params.p_subtype = 'sale';
          break;
        case 'rent':
          params.p_subtype = 'rent';
          break;
      }
    }
  }

  // Property subtype (villa, apartment, etc.) - uses p_property_subtype parameter
  if (filters.selectedSubType && filters.selectedSubType !== 'any') {
    const propertySubtypeMapping: Record<string, string> = {
      'apartment': 'apartment',
      'independent_house': 'independent_house',
      'villa': 'villa',
      'penthouse': 'penthouse',
      'studio_apartment': 'studio_apartment',
      'service_apartment': 'service_apartment',
      'single_sharing': 'single_sharing',
      'double_sharing': 'double_sharing',
      'triple_sharing': 'triple_sharing',
      'four_sharing': 'four_sharing',
      'dormitory': 'dormitory'
    };
    
    if (propertySubtypeMapping[filters.selectedSubType]) {
      params.p_property_subtype = propertySubtypeMapping[filters.selectedSubType];
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

  console.log('🔧 Final residential search parameters:', params);
  return params;
};

/**
 * Build search parameters for commercial properties according to search_commercial_properties function
 */
export const buildCommercialSearchParams = (filters: SearchFilters, options: SearchOptions): SearchParams => {
  const params: SearchParams = {
    p_search_query: filters.searchQuery?.trim() || null,
    p_limit: options.limit || 50,
    p_offset: ((options.page || 1) - 1) * (options.limit || 50),
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

  // Map action type to subtype for commercial
  if (filters.actionType && filters.actionType !== 'any') {
    if (filters.selectedSubType === 'coworking' || 
        ['private_office', 'dedicated_desk', 'hot_desk', 'meeting_room', 'conference_room', 'event_space', 'virtual_office'].includes(filters.selectedSubType)) {
      params.p_subtype = 'coworking';
    } else {
      switch (filters.actionType) {
        case 'buy':
        case 'sell':
          params.p_subtype = 'sale';
          break;
        case 'rent':
          params.p_subtype = 'rent';
          break;
      }
    }
  }

  // Property subtype for commercial - uses p_property_subtype parameter
  if (filters.selectedSubType && filters.selectedSubType !== 'any') {
    const commercialSubtypeMapping: Record<string, string> = {
      'office_space': 'office_space',
      'shop': 'shop',
      'showroom': 'showroom',
      'godown_warehouse': 'godown_warehouse',
      'industrial_shed': 'industrial_shed',
      'industrial_building': 'industrial_building',
      'other_business': 'other_business',
      'private_office': 'private_office',
      'dedicated_desk': 'dedicated_desk',
      'hot_desk': 'hot_desk',
      'meeting_room': 'meeting_room',
      'conference_room': 'conference_room',
      'event_space': 'event_space',
      'virtual_office': 'virtual_office'
    };
    
    if (commercialSubtypeMapping[filters.selectedSubType]) {
      params.p_property_subtype = commercialSubtypeMapping[filters.selectedSubType];
    }
  }

  // Price range filter
  if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') {
    const priceRange = parsePriceRange(filters.selectedPriceRange);
    if (priceRange) {
      params.p_min_price = priceRange.min;
      params.p_max_price = priceRange.max;
      console.log('💰 Commercial price range filter applied:', priceRange);
    }
  }

  console.log('🔧 Final commercial search parameters:', params);
  return params;
};

/**
 * Build search parameters for land properties according to search_land_properties function
 */
export const buildLandSearchParams = (filters: SearchFilters, options: SearchOptions): SearchParams => {
  const params: SearchParams = {
    p_search_query: filters.searchQuery?.trim() || null,
    p_limit: options.limit || 50,
    p_offset: ((options.page || 1) - 1) * (options.limit || 50),
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

  // Land is typically only for sale
  params.p_subtype = 'sale';

  // Property subtype for land - uses p_property_subtype parameter
  if (filters.selectedSubType && filters.selectedSubType !== 'any') {
    const landSubtypeMapping: Record<string, string> = {
      'residential_plot': 'residential_plot',
      'commercial_plot': 'commercial_plot',
      'agricultural_land': 'agricultural_land',
      'industrial_land': 'industrial_land',
      'mixed_use_land': 'mixed_use_land'
    };
    
    if (landSubtypeMapping[filters.selectedSubType]) {
      params.p_property_subtype = landSubtypeMapping[filters.selectedSubType];
    }
  }

  // Price range filter
  if (filters.selectedPriceRange && filters.selectedPriceRange !== 'any') {
    const priceRange = parsePriceRange(filters.selectedPriceRange);
    if (priceRange) {
      params.p_min_price = priceRange.min;
      params.p_max_price = priceRange.max;
      console.log('💰 Land price range filter applied:', priceRange);
    }
  }

  console.log('🔧 Final land search parameters:', params);
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
 * Validate search parameters according to function signatures
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
  
  // Check price range
  if (params.p_min_price && params.p_max_price && params.p_min_price > params.p_max_price) {
    errors.push('p_min_price cannot be greater than p_max_price');
  }

  // Check bedrooms (for residential only)
  if (params.p_bedrooms && (params.p_bedrooms < 1 || params.p_bedrooms > 10)) {
    errors.push('p_bedrooms must be between 1 and 10');
  }

  // Check bathrooms (for residential only)
  if (params.p_bathrooms && (params.p_bathrooms < 1 || params.p_bathrooms > 10)) {
    errors.push('p_bathrooms must be between 1 and 10');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Extract BHK number from BHK string
 */
export const extractBHKNumber = (bhkString: string): number | null => {
  const match = bhkString.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
};

/**
 * Parse price range string to min/max values
 */
export const parsePriceRange = (priceRange: string): { min: number; max: number } | null => {
  const ranges: Record<string, { min: number; max: number }> = {
    'under-10l': { min: 0, max: 1000000 },
    '10l-25l': { min: 1000000, max: 2500000 },
    '25l-50l': { min: 2500000, max: 5000000 },
    '50l-75l': { min: 5000000, max: 7500000 },
    '75l-1cr': { min: 7500000, max: 10000000 },
    '1cr-2cr': { min: 10000000, max: 20000000 },
    '2cr-3cr': { min: 20000000, max: 30000000 },
    '3cr-5cr': { min: 30000000, max: 50000000 },
    '5cr-10cr': { min: 50000000, max: 100000000 },
    'above-10cr': { min: 100000000, max: 999999999 }
  };

  return ranges[priceRange] || null;
};

/**
 * Get property type from filters
 */
export const getEffectivePropertyType = (filters: SearchFilters): string => {
  return filters.selectedPropertyType || 'residential';
};

/**
 * Get effective subtype for database filtering
 */
export const getEffectiveSubtype = (filters: SearchFilters): string | null => {
  const propertyType = filters.selectedPropertyType || 'residential';
  const actionType = filters.actionType || 'rent';

  console.log('🎯 Getting effective subtype:', { propertyType, actionType });

  // For PG/Hostel and Flatmates, use the specific subtype
  if (propertyType === 'pghostel') {
    return 'pghostel';
  } else if (propertyType === 'flatmates') {
    return 'flatmates';
  }

  // For regular properties, map action type to subtype
  if (actionType && actionType !== 'any') {
    switch (actionType) {
      case 'buy':
      case 'sell':
        return 'sale';
      case 'rent':
        return 'rent';
      default:
        return null;
    }
  }

  return null;
};