// src/components/Search/services/searchDataAdapter.ts
// Version: 1.0.0
// Last Modified: 2025-07-10
// Purpose: Adapter to convert SearchResult to PropertyType format

import { SearchResult } from '../types/search.types';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';

/**
 * Adapt SearchResults to PropertyType format for UI components
 */
export const adaptSearchResultsToPropertyTypes = (results: SearchResult[]): PropertyType[] => {
  return results.map((result) => ({
    id: result.id,
    created_at: result.created_at,
    updated_at: result.updated_at,
    user_id: result.user_id,
    property_details: result.property_details,
    status: result.status,
    visibility: result.visibility,
    featured: result.featured,
    verified: result.verified,
    views: result.views,
    
    // Additional computed properties for compatibility
    title: result.title || '',
    description: result.description || '',
    price: result.price || 0,
    location: result.location || '',
    propertyType: result.propertyType || '',
    bedrooms: result.bedrooms || 0,
    bathrooms: result.bathrooms || 0,
    area: result.area || 0,
    images: result.images || [],
    
    // Default values for optional fields
    amenities: result.amenities || [],
    features: result.features || [],
    coordinates: result.coordinates || null,
    contactInfo: result.contactInfo || null,
    
    // Ensure required fields exist
    ...result
  }));
};

/**
 * Convert PropertyType back to SearchResult format
 */
export const adaptPropertyTypeToSearchResult = (property: PropertyType): SearchResult => {
  return {
    id: property.id,
    created_at: property.created_at,
    updated_at: property.updated_at,
    user_id: property.user_id,
    property_details: property.property_details,
    status: property.status,
    visibility: property.visibility,
    featured: property.featured,
    verified: property.verified,
    views: property.views,
    
    // Map additional fields
    title: property.title || '',
    description: property.description || '',
    price: property.price || 0,
    location: property.location || '',
    propertyType: property.propertyType || '',
    bedrooms: property.bedrooms || 0,
    bathrooms: property.bathrooms || 0,
    area: property.area || 0,
    images: property.images || [],
    amenities: property.amenities || [],
    features: property.features || [],
    coordinates: property.coordinates || null,
    contactInfo: property.contactInfo || null,
  };
};