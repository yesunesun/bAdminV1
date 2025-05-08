// src/modules/seeker/services/utilityService.ts
// Version: 1.0.0
// Last Modified: 09-05-2025 13:30 IST
// Purpose: Common utility functions for seeker services

import { supabase } from '@/lib/supabase';
import { markerPins } from './constants';
import { PropertyType } from '@/modules/owner/components/property/types';

// Format price to Indian format (e.g. ₹1.5 Cr, ₹75 L)
export const formatPrice = (price: number): string => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} L`;
  } else {
    return `₹${price.toLocaleString('en-IN')}`;
  }
};

// Get marker pin URL based on property type
export const getMarkerPin = (property: PropertyType) => {
  const propertyType = property.property_details?.basicDetails?.propertyType?.toLowerCase() || '';

  if (propertyType.includes('apartment')) {
    return markerPins.apartment;
  } else if (propertyType.includes('residential') || propertyType.includes('house')) {
    return markerPins.residential;
  } else if (propertyType.includes('office')) {
    return markerPins.office;
  } else if (propertyType.includes('shop') || propertyType.includes('retail')) {
    return markerPins.shop;
  } else if (propertyType.includes('commercial')) {
    return markerPins.commercial;
  } else if (propertyType.includes('land') || propertyType.includes('plot')) {
    return markerPins.land;
  }

  return markerPins.default;
};

// Helper to safely extract number from value
export const safeParseNumber = (value: any, defaultValue = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numMatch = value.match(/^(\d+)/);
    if (numMatch && numMatch[1]) {
      return parseInt(numMatch[1], 10) || defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};

// Helper to safely get nested property value
export const getNestedValue = (obj: any, path: string, defaultValue: any = null) => {
  try {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : defaultValue;
    }, obj);
  } catch (e) {
    console.error(`Error getting nested value for path ${path}:`, e);
    return defaultValue;
  }
};

// Debug helper to log table schema
export const debugTableSchema = async (tableName: string) => {
  try {
    console.log(`Checking table schema for: ${tableName}`);
    
    // First check if table exists by trying to count records
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
      
    if (error) {
      console.error(`Error accessing table ${tableName}:`, error);
      return { exists: false, error: error.message };
    }
    
    console.log(`Table ${tableName} exists with approximately ${count} records`);
    
    // Get sample records to infer schema
    const { data, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (sampleError || !data || data.length === 0) {
      console.warn(`No sample data found in ${tableName}`);
      return { exists: true, count, schema: 'No sample data available' };
    }
    
    // Extract column names and types
    const record = data[0];
    const schema = Object.keys(record).map(key => {
      let type = typeof record[key];
      if (record[key] === null) type = 'null';
      if (Array.isArray(record[key])) type = 'array';
      
      return { column: key, type };
    });
    
    console.log(`Table ${tableName} schema:`, schema);
    
    return { exists: true, count, schema };
  } catch (error) {
    console.error('Error in debugTableSchema:', error);
    return { exists: false, error: error.message };
  }
};

// Helper to process property data for consistent structure
export const processPropertyData = (property: any) => {
  try {
    if (!property) {
      console.warn('Received null or undefined property in processPropertyData');
      return null;
    }
    
    // Check if property_details exists
    const details = property.property_details || {};
    
    if (typeof details === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedDetails = JSON.parse(details);
        console.log('Successfully parsed property_details from string to object');
        property.property_details = parsedDetails;
      } catch (e) {
        console.error('Failed to parse property_details string:', e);
      }
    }
    
    // Extract data from property_details - use getNestedValue for safety
    const basicDetails = getNestedValue(property, 'property_details.basicDetails', {});
    const location = getNestedValue(property, 'property_details.location', {});
    const flow = getNestedValue(property, 'property_details.flow', {});
    const rental = getNestedValue(property, 'property_details.rental', {});
    const sale = getNestedValue(property, 'property_details.sale', {});
    
    // Price - try different potential locations
    const price = getNestedValue(rental, 'rentAmount', 0) || 
                  getNestedValue(sale, 'expectedPrice', 0) || 
                  getNestedValue(property, 'property_details.price', 0) || 
                  0;
    
    // Calculate bedrooms from bhkType or directly from property
    let bedrooms = 0;
    const bhkType = getNestedValue(basicDetails, 'bhkType', '');
    if (bhkType) {
      const match = bhkType.match(/^(\d+)/);
      if (match && match[1]) {
        bedrooms = parseInt(match[1], 10);
      }
    }
    
    // Get coordinates from various possible locations
    let latitude = null;
    let longitude = null;
    
    // Try location.coordinates
    const coordinates = getNestedValue(location, 'coordinates', null);
    if (coordinates) {
      latitude = getNestedValue(coordinates, 'latitude', null) || getNestedValue(coordinates, 'lat', null);
      longitude = getNestedValue(coordinates, 'longitude', null) || getNestedValue(coordinates, 'lng', null);
    }
    
    // If not found, try direct property_details coordinates
    if (!latitude || !longitude) {
      const directCoords = getNestedValue(property, 'property_details.coordinates', null);
      if (directCoords) {
        latitude = getNestedValue(directCoords, 'latitude', null) || getNestedValue(directCoords, 'lat', null);
        longitude = getNestedValue(directCoords, 'longitude', null) || getNestedValue(directCoords, 'lng', null);
      }
    }
    
    // Create a standardized property object with normalized data
    return {
      ...property,
      // Extract fields from property_details for compatibility with UI components
      title: getNestedValue(basicDetails, 'title', 'Property Listing'),
      price: safeParseNumber(price),
      bedrooms: bedrooms || safeParseNumber(getNestedValue(property, 'property_details.bedrooms', 0)),
      bathrooms: safeParseNumber(getNestedValue(basicDetails, 'bathrooms', 0)),
      square_feet: safeParseNumber(getNestedValue(basicDetails, 'builtUpArea', 0)),
      address: getNestedValue(location, 'address', ''),
      city: getNestedValue(location, 'city', ''),
      state: getNestedValue(location, 'state', ''),
      zip_code: getNestedValue(location, 'pinCode', ''),
      // Add coordinates to top level for map usage
      latitude: latitude !== null ? safeParseNumber(latitude) : null,
      longitude: longitude !== null ? safeParseNumber(longitude) : null,
      // Keep property_details as is
      property_details: property.property_details
    };
  } catch (error) {
    console.error('Error in processPropertyData:', error);
    return property; // Return original property on error
  }
};

// Helper to extract images from property_details
export const extractImagesFromProperty = (property: any) => {
  try {
    // Initialize images array
    let images: any[] = [];
    
    if (!property || !property.property_details) {
      return [];
    }
    
    const details = property.property_details;
    
    // Try various paths where images might be stored in property_details
    if (details.images && Array.isArray(details.images)) {
      images = details.images;
    } else if (details.photos?.images && Array.isArray(details.photos.images)) {
      images = details.photos.images;
    } else if (details.media?.images && Array.isArray(details.media.images)) {
      images = details.media.images;
    }
    
    // If images were found, process them to have consistent properties
    if (images.length > 0) {
      return images.map((img, idx) => ({
        id: img.id || `img-${idx}`,
        url: img.dataUrl || img.url || '',
        is_primary: !!img.isPrimary || !!img.is_primary,
        display_order: img.display_order || idx
      }));
    }
    
    // No images found
    return [];
  } catch (error) {
    console.error('Error extracting images:', error);
    return [];
  }
};