// src/components/Search/services/searchService/utils/mappingUtils.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 15:20 IST
// Purpose: Mapping and extraction utilities for SearchService

import { SearchFilters } from '../types/searchService.types';

/**
 * Map frontend subtypes to database flow types
 */
export const mapSubtypeToFlowType = (propertyType: string, subtype: string, transactionType: string): string | null => {
  console.log('🔄 Mapping subtype to flow type:', { propertyType, subtype, transactionType });
  
  if (propertyType === 'residential') {
    // Handle special residential subtypes that have their own flow types
    switch (subtype) {
      case 'pghostel':
      case 'pg':
        return 'residential_pghostel';
      case 'flatmates':
        return 'residential_flatmates';
      case 'apartment':
      case 'independent_house':
      case 'villa':
      case 'penthouse':
      case 'studio_apartment':
      case 'service_apartment':
        // For regular residential subtypes, use transaction type to determine flow
        return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
      // Handle sharing types for PG/Hostel and Flatmates
      case 'single_sharing':
      case 'double_sharing':
      case 'triple_sharing':
      case 'four_sharing':
      case 'dormitory':
        // These are sharing subtypes, need to determine if PG or Flatmates based on context
        // Default to PG for now, but this might need more context
        return 'residential_pghostel';
      default:
        return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
    }
  } else if (propertyType === 'commercial') {
    switch (subtype) {
      case 'private_office':
      case 'dedicated_desk':
      case 'hot_desk':
      case 'meeting_room':
      case 'conference_room':
      case 'event_space':
      case 'virtual_office':
        return 'commercial_coworking';
      case 'office_space':
      case 'shop':
      case 'showroom':
      case 'godown_warehouse':
      case 'industrial_shed':
      case 'industrial_building':
      case 'other_business':
        return transactionType === 'buy' ? 'commercial_sale' : 'commercial_rent';
      default:
        return transactionType === 'buy' ? 'commercial_sale' : 'commercial_rent';
    }
  } else if (propertyType === 'land') {
    return 'land_sale';
  } else if (propertyType === 'pghostel') {
    return 'residential_pghostel';
  } else if (propertyType === 'flatmates') {
    return 'residential_flatmates';
  }
  
  return 'residential_rent';
};

/**
 * Get property subtype for database filtering
 */
export const getPropertySubtype = (subtype: string): string | null => {
  // Map frontend subtypes to database property types
  const subtypeMapping: Record<string, string> = {
    // Residential Sale/Rent subtypes
    'apartment': 'apartment',
    'independent_house': 'independent_house',
    'villa': 'villa',
    'penthouse': 'penthouse',
    'studio_apartment': 'studio_apartment',
    'service_apartment': 'service_apartment',
    
    // Residential PG/Hostel and Flatmates subtypes (sharing types)
    'single_sharing': 'single_sharing',
    'double_sharing': 'double_sharing',
    'triple_sharing': 'triple_sharing',
    'four_sharing': 'four_sharing',
    'dormitory': 'dormitory',
    
    // Commercial Sale/Rent subtypes
    'office_space': 'office_space',
    'shop': 'shop',
    'showroom': 'showroom',
    'godown_warehouse': 'godown_warehouse',
    'industrial_shed': 'industrial_shed',
    'industrial_building': 'industrial_building',
    'other_business': 'other_business',
    
    // Commercial Co-working subtypes
    'private_office': 'private_office',
    'dedicated_desk': 'dedicated_desk',
    'hot_desk': 'hot_desk',
    'meeting_room': 'meeting_room',
    'conference_room': 'conference_room',
    'event_space': 'event_space',
    'virtual_office': 'virtual_office',
    
    // Land subtypes
    'residential_plot': 'residential_plot',
    'commercial_plot': 'commercial_plot',
    'agricultural_land': 'agricultural_land',
    'industrial_land': 'industrial_land',
    'mixed_use_land': 'mixed_use_land'
  };

  return subtypeMapping[subtype] || null;
};

/**
 * Enhanced method to get effective subtype considering property-level filtering
 */
export const getEffectiveSubtype = (filters: SearchFilters): string | null => {
  const propertyType = filters.selectedPropertyType || 'residential';
  const transactionType = filters.transactionType || 'rent';
  const selectedSubType = filters.selectedSubType;

  console.log('🎯 Getting effective subtype:', { propertyType, transactionType, selectedSubType });

  // For PG/Hostel and Flatmates, use the specific flow type
  if (selectedSubType === 'pghostel' || selectedSubType === 'flatmates') {
    const mappedFlowType = mapSubtypeToFlowType(propertyType, selectedSubType, transactionType);
    console.log('✅ Using special subtype mapping:', selectedSubType, '->', mappedFlowType);
    return mappedFlowType;
  }

  // For regular properties, just use the base flow type
  if (transactionType && transactionType !== 'any') {
    const mappedFlowType = mapSubtypeToFlowType(propertyType, 'default', transactionType);
    console.log('✅ Using transaction type mapping:', transactionType, '->', mappedFlowType);
    return mappedFlowType;
  }

  console.log('ℹ️ No specific subtype filter applied');
  return null;
};

/**
 * Extract transaction type from flow_type
 */
export const extractTransactionType = (flowType: string): string => {
  if (flowType.includes('sale') || flowType.includes('buy')) {
    return 'buy';
  } else if (flowType.includes('rent') || flowType.includes('rental')) {
    return 'rent';
  }
  return 'rent';
};

/**
 * Enhanced display subtype extraction with title-based detection
 */
export const extractDisplaySubtype = (flowType: string, subtype: string | null, title: string | null): string => {
  // If we have a specific subtype, use it
  if (subtype && subtype !== flowType) {
    return subtype;
  }

  // Try to detect subtype from title for better display
  const titleLower = title?.toLowerCase() || '';
  
  // Residential subtypes detection
  if (titleLower.includes('villa')) {
    return 'villa';
  } else if (titleLower.includes('independent') || titleLower.includes('house')) {
    return 'independent_house';
  } else if (titleLower.includes('penthouse')) {
    return 'penthouse';
  } else if (titleLower.includes('studio')) {
    return 'studio_apartment';
  } else if (titleLower.includes('service')) {
    return 'service_apartment';
  }
  
  // Sharing types detection
  else if (titleLower.includes('single sharing')) {
    return 'single_sharing';
  } else if (titleLower.includes('double sharing')) {
    return 'double_sharing';
  } else if (titleLower.includes('triple sharing')) {
    return 'triple_sharing';
  } else if (titleLower.includes('four sharing')) {
    return 'four_sharing';
  } else if (titleLower.includes('dormitory')) {
    return 'dormitory';
  }
  
  // Commercial subtypes detection
  else if (titleLower.includes('office')) {
    return 'office_space';
  } else if (titleLower.includes('shop')) {
    return 'shop';
  } else if (titleLower.includes('showroom')) {
    return 'showroom';
  } else if (titleLower.includes('godown') || titleLower.includes('warehouse')) {
    return 'godown_warehouse';
  } else if (titleLower.includes('industrial shed')) {
    return 'industrial_shed';
  } else if (titleLower.includes('industrial building')) {
    return 'industrial_building';
  }
  
  // Co-working subtypes detection
  else if (titleLower.includes('private office')) {
    return 'private_office';
  } else if (titleLower.includes('dedicated desk')) {
    return 'dedicated_desk';
  } else if (titleLower.includes('hot desk')) {
    return 'hot_desk';
  } else if (titleLower.includes('meeting room')) {
    return 'meeting_room';
  } else if (titleLower.includes('conference room')) {
    return 'conference_room';
  } else if (titleLower.includes('event space')) {
    return 'event_space';
  } else if (titleLower.includes('virtual office')) {
    return 'virtual_office';
  }
  
  // Land subtypes detection
  else if (titleLower.includes('residential plot')) {
    return 'residential_plot';
  } else if (titleLower.includes('commercial plot')) {
    return 'commercial_plot';
  } else if (titleLower.includes('agricultural')) {
    return 'agricultural_land';
  } else if (titleLower.includes('industrial land')) {
    return 'industrial_land';
  } else if (titleLower.includes('mixed use')) {
    return 'mixed_use_land';
  }

  // Extract from flow_type as fallback
  if (flowType.includes('residential_rent') || flowType.includes('residential_sale')) {
    return 'apartment';
  } else if (flowType.includes('residential_pghostel')) {
    return 'pghostel';
  } else if (flowType.includes('residential_flatmates')) {
    return 'flatmates';
  } else if (flowType.includes('commercial_rent') || flowType.includes('commercial_sale')) {
    return 'office_space';
  } else if (flowType.includes('commercial_coworking')) {
    return 'private_office';
  } else if (flowType.includes('land_sale')) {
    return 'residential_plot';
  }

  return flowType;
};

/**
 * Format location from city and state
 */
export const formatLocation = (city: string | null, state: string | null): string => {
  if (city && state) {
    return `${city}, ${state}`;
  } else if (city) {
    return city;
  } else if (state) {
    return state;
  }
  return 'Location not specified';
};

/**
 * Extract owner name from email
 */
export const extractOwnerName = (email: string | null): string => {
  if (!email) return 'Property Owner';
  
  const namePart = email.split('@')[0];
  return namePart
    .replace(/[._]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ') || 'Property Owner';
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