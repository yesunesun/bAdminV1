// src/components/Search/services/searchDataAdapter.ts
// Version: 1.1.0
// Last Modified: 01-06-2025 17:30 IST
// Purpose: Adapter to convert SearchResult to PropertyType for PropertyItem component

import { SearchResult } from '../types/search.types';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';

/**
 * Converts SearchResult to PropertyType format for use with PropertyItem component
 */
export const adaptSearchResultToPropertyType = (searchResult: SearchResult): PropertyType => {
  // Create property_details structure that PropertyItem expects
  const property_details = {
    flow: {
      title: searchResult.title,
      flowType: getFlowType(searchResult)
    },
    basicDetails: {
      propertyType: searchResult.subType || searchResult.propertyType,
      bhkType: searchResult.bhk || undefined,
      bathrooms: searchResult.propertyType === 'residential' ? 2 : undefined,
      builtUpArea: searchResult.area,
      builtUpAreaUnit: 'sqft'
    },
    rentalInfo: searchResult.transactionType === 'rent' ? {
      rentAmount: searchResult.price,
      furnishingStatus: 'Semi-Furnished'
    } : undefined,
    saleInfo: searchResult.transactionType === 'buy' ? {
      expectedPrice: searchResult.price,
      priceNegotiable: true
    } : undefined,
    // Add mock image data for display
    imageFiles: [
      {
        fileName: 'property-image.jpg',
        isPrimary: true
      }
    ]
  };

  // Convert SearchResult to PropertyType
  const propertyTypeData: PropertyType = {
    id: searchResult.id,
    owner_id: 'real-owner', // Will be populated from database
    title: searchResult.title,
    price: searchResult.price,
    address: searchResult.location,
    city: extractCityFromLocation(searchResult.location),
    state: extractStateFromLocation(searchResult.location),
    zip_code: '500001', // Default for Hyderabad area
    bedrooms: searchResult.bhk ? parseInt(searchResult.bhk.charAt(0)) || undefined : undefined,
    bathrooms: searchResult.propertyType === 'residential' ? 2 : undefined,
    square_feet: searchResult.area,
    status: 'published',
    tags: [searchResult.propertyType, searchResult.transactionType],
    created_at: searchResult.createdAt,
    updated_at: searchResult.createdAt,
    property_details,
    property_images: []
  };

  return propertyTypeData;
};

/**
 * Determine flow type based on property and transaction type
 */
const getFlowType = (searchResult: SearchResult): string => {
  const { propertyType, transactionType, subType } = searchResult;
  
  if (propertyType === 'residential') {
    return transactionType === 'buy' ? 'residential_sale' : 'residential_rent';
  } else if (propertyType === 'commercial') {
    if (subType === 'coworking') {
      return 'commercial_coworking';
    }
    return transactionType === 'buy' ? 'commercial_sale' : 'commercial_rent';
  } else if (propertyType === 'land') {
    return 'land_sale';
  } else if (propertyType === 'pghostel') {
    return 'residential_pghostel';
  } else if (propertyType === 'flatmates') {
    return 'residential_flatmates';
  }
  
  return 'residential_rent'; // default
};

/**
 * Extract city from location string
 */
const extractCityFromLocation = (location: string): string => {
  return location.split(',')[0]?.trim() || location;
};

/**
 * Extract state from location string
 */
const extractStateFromLocation = (location: string): string => {
  const parts = location.split(',');
  return parts[1]?.trim() || 'Telangana';
};

/**
 * Converts array of SearchResults to PropertyType array
 */
export const adaptSearchResultsToPropertyTypes = (searchResults: SearchResult[]): PropertyType[] => {
  return searchResults.map(adaptSearchResultToPropertyType);
};