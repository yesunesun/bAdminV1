// src/components/Search/services/searchService/utils/transformUtils.ts
// Version: 1.0.0
// Last Modified: 02-06-2025 14:45 IST
// Purpose: Data transformation utilities for SearchService

import { DatabaseSearchResult, SearchResult } from '../types/searchService.types';
import { extractTransactionType, extractDisplaySubtype, formatLocation, extractOwnerName } from './mappingUtils';

/**
 * Transform database results to SearchResult format with primary_image and code
 */
export const transformDatabaseResults = (dbResults: DatabaseSearchResult[]): SearchResult[] => {
  return dbResults.map(dbResult => {
    const transactionType = extractTransactionType(dbResult.flow_type);
    const displaySubtype = extractDisplaySubtype(dbResult.flow_type, dbResult.subtype, dbResult.title);
    
    // Type-safe property extraction
    const bedrooms = 'bedrooms' in dbResult ? dbResult.bedrooms : null;
    const bathrooms = 'bathrooms' in dbResult ? dbResult.bathrooms : null;
    const bhk = bedrooms && bedrooms > 0 ? `${bedrooms}bhk` : null;
    
    const price = dbResult.price && dbResult.price > 0 ? dbResult.price : 0;
    const area = dbResult.area && dbResult.area > 0 ? dbResult.area : 0;
    
    // Extract primary_image from database result
    const primaryImage = dbResult.primary_image || null;
    
    // Extract property code from database result
    const propertyCode = dbResult.code || null;
    
    console.log(`🖼️ Transforming property ${dbResult.id}: primary_image = ${primaryImage}, code = ${propertyCode}`);
    
    return {
      id: dbResult.id,
      title: dbResult.title || 'Property Listing',
      location: formatLocation(dbResult.city, dbResult.state),
      price: price,
      propertyType: dbResult.property_type,
      transactionType: transactionType,
      subType: displaySubtype,
      bhk: bhk,
      area: area,
      ownerName: extractOwnerName(dbResult.owner_email),
      ownerPhone: '+91 98765 43210',
      createdAt: dbResult.created_at,
      status: dbResult.status || 'active',
      primary_image: primaryImage,
      code: propertyCode
    } as SearchResult;
  });
};

/**
 * Format database result for logging
 */
export const formatDbResultForLog = (dbResult: DatabaseSearchResult) => {
  return {
    id: dbResult.id,
    title: dbResult.title,
    propertyType: dbResult.property_type,
    flowType: dbResult.flow_type,
    price: `₹${dbResult.price?.toLocaleString() || 0}`,
    location: `${dbResult.city || 'Unknown'}, ${dbResult.state || 'Unknown'}`,
    area: `${dbResult.area || 0} ${dbResult.area_unit || 'sq ft'}`,
    bedrooms: 'bedrooms' in dbResult ? dbResult.bedrooms || 'N/A' : 'N/A',
    owner: dbResult.owner_email || 'Unknown',
    primaryImage: dbResult.primary_image || 'None',
    code: dbResult.code || 'None'
  };
};