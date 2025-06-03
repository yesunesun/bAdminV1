// src/modules/seeker/services/utilityService.ts
// Version: 2.4.1
// Last Modified: 02-06-2025 16:25 IST
// Purpose: Fixed syntax error in extractImagesFromProperty function

import { supabase } from '@/lib/supabase';
import { markerPins } from './constants';
import { PropertyType } from '@/modules/owner/components/property/types';

// Format price to Indian format with comprehensive null checking
export const formatPrice = (price: number | null | undefined): string => {
  // Handle null, undefined, or invalid values
  if (price === null || price === undefined || isNaN(price) || price <= 0) {
    return '';
  }

  const numPrice = Number(price);
  
  if (numPrice >= 10000000) {
    return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
  } else if (numPrice >= 100000) {
    return `₹${(numPrice / 100000).toFixed(2)} L`;
  } else {
    return `₹${numPrice.toLocaleString('en-IN')}`;
  }
};

// Helper to check if a value is valid for display
export const isValidValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (typeof value === 'number' && (isNaN(value) || value <= 0)) return false;
  return true;
};

// Helper to check if a string field is valid for display
export const isValidStringField = (value: any): boolean => {
  return value && typeof value === 'string' && value.trim().length > 0;
};

// Helper to check if a number field is valid for display
export const isValidNumberField = (value: any): boolean => {
  return value !== null && value !== undefined && !isNaN(Number(value)) && Number(value) > 0;
};

// Helper to safely format area
export const formatArea = (area: number | null | undefined, unit: string = 'sq.ft'): string => {
  if (!isValidNumberField(area)) return '';
  return `${Number(area).toLocaleString('en-IN')} ${unit}`;
};

// Helper to safely format bedrooms/bathrooms
export const formatRoomCount = (count: number | null | undefined, type: 'bedroom' | 'bathroom'): string => {
  if (!isValidNumberField(count)) return '';
  const num = Number(count);
  return type === 'bedroom' ? `${num} BHK` : `${num}`;
};

// Helper to safely format location
export const formatLocation = (address?: string, city?: string, state?: string): string => {
  const parts = [address, city, state].filter(part => isValidStringField(part));
  return parts.length > 0 ? parts.join(', ') : '';
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
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Check for formats like "2.50 Cr" or "5.00 L"
    if (value.includes('Cr')) {
      const match = value.match(/(\d+(\.\d+)?)\s*Cr/);
      if (match && match[1]) {
        return parseFloat(match[1]) * 10000000;
      }
    }
    if (value.includes('L')) {
      const match = value.match(/(\d+(\.\d+)?)\s*L/);
      if (match && match[1]) {
        return parseFloat(match[1]) * 100000;
      }
    }
    
    // Try to extract any number
    const numMatch = value.match(/(\d+(\.\d+)?)/);
    if (numMatch && numMatch[1]) {
      return parseFloat(numMatch[1]) || defaultValue;
    }
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

// Helper to find step ID by pattern in new JSON structure
export const findStepIdByPattern = (steps: any, patterns: string[]): string | undefined => {
  if (!steps || typeof steps !== 'object') return undefined;
  
  // Try each pattern in order of preference
  for (const pattern of patterns) {
    const matchingKey = Object.keys(steps).find(key => 
      key.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (matchingKey) return matchingKey;
  }
  
  return undefined;
};

// Get all possible price fields
export const getAllPriceFields = () => {
  return [
    'price',
    'rentAmount',
    'expectedPrice',
    'seatPrice',
    'amount',
    'totalPrice',
    'totalAmount',
    'pricePerSqft',
    'perSqftPrice',
    'rent',
    'salePrice',
    'value',
    'cost',
    'fee'
  ];
};

// Extensive recursive search for price in any part of the object
export const findPriceInObject = (obj: any, depth = 0, maxDepth = 5): number => {
  if (!obj || typeof obj !== 'object' || depth > maxDepth) return 0;
  
  // Get all possible price field names
  const priceFields = getAllPriceFields();
  
  // Try direct fields at this level
  for (const field of priceFields) {
    const value = safeParseNumber(obj[field], 0);
    if (value > 0) return value;
  }
  
  // Try case variations (PascalCase, camelCase)
  const capitalizedFields = priceFields.map(f => f.charAt(0).toUpperCase() + f.slice(1));
  for (const field of capitalizedFields) {
    const value = safeParseNumber(obj[field], 0);
    if (value > 0) return value;
  }
  
  // For objects identified as likely price containers, check all fields
  if (Object.keys(obj).some(key => 
    key.toLowerCase().includes('price') || 
    key.toLowerCase().includes('rent') || 
    key.toLowerCase().includes('sale') ||
    key.toLowerCase().includes('amount')
  )) {
    for (const key in obj) {
      const value = safeParseNumber(obj[key], 0);
      if (value > 0) return value;
    }
  }
  
  // Look for price in nested objects
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const nestedValue = findPriceInObject(obj[key], depth + 1, maxDepth);
      if (nestedValue > 0) return nestedValue;
    }
  }
  
  // If still nothing found, look for any numeric value in promising fields
  const potentialFields = Object.keys(obj).filter(key => 
    key.toLowerCase().includes('price') || 
    key.toLowerCase().includes('amount') || 
    key.toLowerCase().includes('rent') || 
    key.toLowerCase().includes('cost') ||
    key.toLowerCase().includes('value')
  );
  
  for (const field of potentialFields) {
    const value = safeParseNumber(obj[field], 0);
    if (value > 0) return value;
  }
  
  // If nothing found, return 0
  return 0;
};

// Helper to process property data for consistent structure - UPDATED for new JSON structure
export const processPropertyData = (property: any) => {
  try {
    if (!property) {
      console.warn('Received null or undefined property in processPropertyData');
      return null;
    }
    
    // Make sure the property has an ID for logging purposes
    const propertyId = property.id || 'unknown';
    
    // Check if property_details exists
    let details = property.property_details || {};
    
    if (typeof details === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedDetails = JSON.parse(details);
        console.log(`Property ${propertyId}: Successfully parsed property_details from string to object`);
        details = parsedDetails;
        property.property_details = parsedDetails;
      } catch (e) {
        console.error(`Property ${propertyId}: Failed to parse property_details string:`, e);
      }
    }
    
    // Check if this is the new structure with meta, flow, steps format
    const hasMeta = !!getNestedValue(details, 'meta', null);
    const hasFlow = !!getNestedValue(details, 'flow', null);
    const hasSteps = !!getNestedValue(details, 'steps', null);
    const isNewStructure = hasMeta && hasFlow && hasSteps;
    
    console.log(`Property ${propertyId} structure detection: isNewStructure=${isNewStructure}`);
    
    let price = 0;
    let bedrooms = 0;
    let bathrooms = 0;
    let squareFeet = 0;
    let address = '';
    let city = '';
    let state = '';
    let zipCode = '';
    let latitude = null;
    let longitude = null;
    let propertyType = '';
    let title = '';
    let listingType = '';
    
    // First, check for top-level price field
    price = safeParseNumber(property.price, 0);
    if (price > 0) {
      console.log(`Property ${propertyId}: Found top-level price: ${price}`);
    }
    
    // Process based on the detected structure
    if (isNewStructure) {
      // New structure with steps and flow
      const flow = getNestedValue(details, 'flow', {});
      const steps = getNestedValue(details, 'steps', {});
      
      // Extract category and listing type from flow
      const category = getNestedValue(flow, 'category', 'residential');
      listingType = getNestedValue(flow, 'listingType', 'rent');
      
      console.log(`Property ${propertyId} flow information: category=${category}, listingType=${listingType}`);
      
      // Find relevant step IDs based on the flow
      const basicDetailsStepId = findStepIdByPattern(steps, ['basic_details', 'basicdetails']);
      const locationStepId = findStepIdByPattern(steps, ['location']);
      
      // Determine step ID patterns for price based on flow
      let priceStepPatterns: string[] = [];
      
      if (category === 'residential') {
        if (listingType.includes('sale')) {
          priceStepPatterns = ['sale', 'price', 'saledetails'];
        } else if (listingType.includes('flatmates')) {
          priceStepPatterns = ['flatmate', 'rental', 'rent'];
        } else if (listingType.includes('pghostel') || listingType.includes('pg')) {
          priceStepPatterns = ['pg', 'pgdetails', 'rental', 'rent'];
        } else {
          priceStepPatterns = ['rental', 'rent', 'rentaldetails', 'price'];
        }
      } else if (category === 'commercial') {
        if (listingType.includes('sale')) {
          priceStepPatterns = ['sale', 'price', 'commercialsale'];
        } else if (listingType.includes('coworking')) {
          priceStepPatterns = ['coworking', 'coworkingdetails', 'price'];
        } else {
          priceStepPatterns = ['rental', 'rent', 'commercialrent', 'price'];
        }
      } else if (category === 'land') {
        priceStepPatterns = ['sale', 'landsale', 'price', 'landdetails'];
      }
      
      const priceStepId = findStepIdByPattern(steps, priceStepPatterns);
      
      console.log(`Property ${propertyId} step IDs found - Basic: ${basicDetailsStepId}, Location: ${locationStepId}, Price: ${priceStepId}`);
      
      // Extract basic details
      if (basicDetailsStepId && steps[basicDetailsStepId]) {
        const basicDetails = steps[basicDetailsStepId];
        title = getNestedValue(basicDetails, 'title', '');
        propertyType = getNestedValue(basicDetails, 'propertyType', 'Apartment');
        
        // Extract bedrooms from bhkType
        const bhkType = getNestedValue(basicDetails, 'bhkType', '');
        if (bhkType) {
          const match = bhkType.match(/^(\d+)/);
          if (match && match[1]) {
            bedrooms = parseInt(match[1], 10);
          }
        } else {
          // Try direct bedrooms field
          bedrooms = safeParseNumber(getNestedValue(basicDetails, 'bedrooms', 0));
        }
        
        bathrooms = safeParseNumber(getNestedValue(basicDetails, 'bathrooms', 0));
        squareFeet = safeParseNumber(getNestedValue(basicDetails, 'builtUpArea', 0));
        
        // If no price found yet, check for price-like field in basicDetails
        if (price === 0) {
          price = findPriceInObject(basicDetails);
          if (price > 0) {
            console.log(`Property ${propertyId}: Found price in basicDetails: ${price}`);
          }
        }
      }
      
      // Extract location details
      if (locationStepId && steps[locationStepId]) {
        const location = steps[locationStepId];
        address = getNestedValue(location, 'address', '');
        city = getNestedValue(location, 'city', '');
        state = getNestedValue(location, 'state', '');
        zipCode = getNestedValue(location, 'pinCode', '');
        
        // Extract coordinates
        const coordinates = getNestedValue(location, 'coordinates', null);
        if (coordinates) {
          latitude = getNestedValue(coordinates, 'latitude', null) || 
                    getNestedValue(coordinates, 'lat', null);
          longitude = getNestedValue(coordinates, 'longitude', null) || 
                    getNestedValue(coordinates, 'lng', null);
        }
      }
      
      // Look for price in specific step if not found yet
      if (price === 0 && priceStepId && steps[priceStepId]) {
        const priceStep = steps[priceStepId];
        
        // Try all possible price fields
        const priceFields = getAllPriceFields();
        for (const field of priceFields) {
          const fieldValue = safeParseNumber(getNestedValue(priceStep, field, 0));
          if (fieldValue > 0) {
            price = fieldValue;
            console.log(`Property ${propertyId}: Found price in field '${field}': ${price}`);
            break;
          }
        }
        
        // If still no price, try deep search within the step
        if (price === 0) {
          price = findPriceInObject(priceStep);
          if (price > 0) {
            console.log(`Property ${propertyId}: Found price through deep search in priceStep: ${price}`);
          }
        }
      }
      
      // If still no price, search through all steps
      if (price === 0) {
        console.log(`Property ${propertyId}: No price found in primary step, searching all steps...`);
        
        // First check steps that are likely to contain price info
        for (const stepId in steps) {
          if (price > 0) break;
          
          if (stepId.toLowerCase().includes('price') || 
              stepId.toLowerCase().includes('rent') || 
              stepId.toLowerCase().includes('sale') || 
              stepId.toLowerCase().includes('payment')) {
                
            const step = steps[stepId];
            price = findPriceInObject(step);
            if (price > 0) {
              console.log(`Property ${propertyId}: Found price in targeted step '${stepId}': ${price}`);
            }
          }
        }
        
        // If still not found, check all remaining steps
        if (price === 0) {
          for (const stepId in steps) {
            if (price > 0) break;
            
            // Skip steps we already checked
            if (stepId.toLowerCase().includes('price') || 
                stepId.toLowerCase().includes('rent') || 
                stepId.toLowerCase().includes('sale') || 
                stepId.toLowerCase().includes('payment')) {
              continue;
            }
            
            const step = steps[stepId];
            price = findPriceInObject(step);
            if (price > 0) {
              console.log(`Property ${propertyId}: Found price in step '${stepId}': ${price}`);
            }
          }
        }
      }
      
      // If still no price, check meta and flow sections
      if (price === 0) {
        // Check meta section
        price = findPriceInObject(details.meta || {});
        if (price > 0) {
          console.log(`Property ${propertyId}: Found price in meta section: ${price}`);
        }
        
        // Check flow section
        if (price === 0) {
          price = findPriceInObject(details.flow || {});
          if (price > 0) {
            console.log(`Property ${propertyId}: Found price in flow section: ${price}`);
          }
        }
      }
      
      // If still no price, search entire property_details object
      if (price === 0) {
        price = findPriceInObject(details);
        if (price > 0) {
          console.log(`Property ${propertyId}: Found price in full property_details: ${price}`);
        }
      }
      
      // Generate title if not present
      if (!title) {
        title = `${bedrooms > 0 ? bedrooms + ' BHK ' : ''}${propertyType} for ${listingType} in ${city || 'your city'}`;
      }
    } else {
      // Legacy structure processing
      
      // Check if property_details has a valid values structure
      const basicDetails = getNestedValue(property, 'property_details.basicDetails', {});
      const location = getNestedValue(property, 'property_details.location', {});
      const flow = getNestedValue(property, 'property_details.flow', {});
      const rental = getNestedValue(property, 'property_details.rental', {});
      const sale = getNestedValue(property, 'property_details.sale', {});
      
      // Try to determine the flow type from legacy structure
      const category = getNestedValue(flow, 'category', 
        getNestedValue(property, 'property_details.category', 'residential'));
      listingType = getNestedValue(flow, 'listingType', 
        getNestedValue(property, 'property_details.listingType', 
        getNestedValue(property, 'property_details.for', 'rent')));
      
      console.log(`Property ${propertyId} legacy flow detection: category=${category}, listingType=${listingType}`);
      
      // If top-level price is not found yet, try direct property_details price field
      if (price === 0) {
        price = safeParseNumber(getNestedValue(property, 'property_details.price', 0));
        if (price > 0) {
          console.log(`Property ${propertyId}: Found direct property_details.price: ${price}`);
        }
      }
      
      // If still no price, try flow-specific locations
      if (price === 0) {
        // First try the appropriate section
        let priceContainer = null;
        
        if (listingType.includes('sale')) {
          priceContainer = sale;
        } else if (listingType.includes('coworking')) {
          // Try coworking specific container
          priceContainer = getNestedValue(property, 'property_details.coworking', {});
        } else {
          priceContainer = rental;
        }
        
        if (priceContainer && typeof priceContainer === 'object') {
          // Try all possible price fields in the container
          price = findPriceInObject(priceContainer);
          if (price > 0) {
            console.log(`Property ${propertyId}: Found price in appropriate container: ${price}`);
          }
        }
        
        // If still no price, do a deep search through all property_details
        if (price === 0) {
          price = findPriceInObject(property.property_details);
          if (price > 0) {
            console.log(`Property ${propertyId}: Found price through deep search in property_details: ${price}`);
          }
        }
      }
      
      // Calculate bedrooms from bhkType or directly from property
      const bhkType = getNestedValue(basicDetails, 'bhkType', '');
      if (bhkType) {
        const match = bhkType.match(/^(\d+)/);
        if (match && match[1]) {
          bedrooms = parseInt(match[1], 10);
        }
      } else {
        // Try direct bedrooms field
        bedrooms = safeParseNumber(getNestedValue(basicDetails, 'bedrooms', 0)) ||
                  safeParseNumber(getNestedValue(property, 'property_details.bedrooms', 0)) ||
                  safeParseNumber(getNestedValue(property, 'bedrooms', 0));
      }
      
      bathrooms = safeParseNumber(getNestedValue(basicDetails, 'bathrooms', 0)) ||
                 safeParseNumber(getNestedValue(property, 'property_details.bathrooms', 0)) ||
                 safeParseNumber(getNestedValue(property, 'bathrooms', 0));
      
      squareFeet = safeParseNumber(getNestedValue(basicDetails, 'builtUpArea', 0)) ||
                  safeParseNumber(getNestedValue(property, 'property_details.square_feet', 0)) ||
                  safeParseNumber(getNestedValue(property, 'square_feet', 0));
      
      address = getNestedValue(location, 'address', '') ||
               getNestedValue(property, 'property_details.address', '') ||
               getNestedValue(property, 'address', '');
      
      city = getNestedValue(location, 'city', '') ||
            getNestedValue(property, 'property_details.city', '') ||
            getNestedValue(property, 'city', '');
      
      state = getNestedValue(location, 'state', '') ||
             getNestedValue(property, 'property_details.state', '') ||
             getNestedValue(property, 'state', '');
      
      zipCode = getNestedValue(location, 'pinCode', '') ||
               getNestedValue(property, 'property_details.zip_code', '') ||
               getNestedValue(property, 'zip_code', '');
      
      // Get coordinates from various possible locations
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
      
      title = getNestedValue(basicDetails, 'title', '') || 
             getNestedValue(property, 'property_details.title', '') || 
             getNestedValue(property, 'title', '');
      
      propertyType = getNestedValue(basicDetails, 'propertyType', 'Apartment') ||
                    getNestedValue(property, 'property_details.propertyType', 'Apartment');
    }
    
    // FINAL FALLBACK: Try to extract price from title if it contains price information
    if (price === 0 && property.title) {
      if (property.title.includes('Cr') || property.title.includes('L')) {
        price = safeParseNumber(property.title, 0);
        if (price > 0) {
          console.log(`Property ${propertyId}: Extracted price from title: ${price}`);
        }
      }
    }
    
    // As an extreme fallback, try to extract from all fields in the property
    if (price === 0) {
      price = findPriceInObject(property);
      if (price > 0) {
        console.log(`Property ${propertyId}: Found price in root property object: ${price}`);
      }
    }
    
    // Create a standardized property object with normalized data
    const normalizedProperty = {
      ...property,
      // Extract fields from property_details for compatibility with UI components
      title: title || 'Property Listing',
      price: safeParseNumber(price),
      bedrooms: bedrooms || safeParseNumber(getNestedValue(property, 'property_details.bedrooms', 0)) || safeParseNumber(getNestedValue(property, 'bedrooms', 0)),
      bathrooms: bathrooms || safeParseNumber(getNestedValue(property, 'property_details.bathrooms', 0)) || safeParseNumber(getNestedValue(property, 'bathrooms', 0)),
      square_feet: squareFeet || safeParseNumber(getNestedValue(property, 'property_details.square_feet', 0)) || safeParseNumber(getNestedValue(property, 'square_feet', 0)),
      address: address || getNestedValue(property, 'address', ''),
      city: city || getNestedValue(property, 'city', ''),
      state: state || getNestedValue(property, 'state', ''),
      zip_code: zipCode || getNestedValue(property, 'zip_code', ''),
      // Add extra properties derived from the JSON
      property_type: propertyType,
      listing_type: listingType,
      // Add coordinates to top level for map usage
      latitude: latitude !== null ? safeParseNumber(latitude) : null,
      longitude: longitude !== null ? safeParseNumber(longitude) : null,
      // Keep property_details as is
      property_details: property.property_details
    };
    
    console.log(`Property ${propertyId} processing complete: Price=${normalizedProperty.price}, Bedrooms=${normalizedProperty.bedrooms}, Type=${normalizedProperty.property_type}, Listing=${normalizedProperty.listing_type}`);
    
    return normalizedProperty;
  } catch (error) {
    console.error(`Error in processPropertyData for property ${property?.id || 'unknown'}:`, error);
    return property; // Return original property on error
  }
};

// Helper to extract images from property_details - UPDATED for new JSON structure
export const extractImagesFromProperty = (property: any) => {
  try {
    // Initialize images array
    let images: any[] = [];
    
    if (!property || !property.property_details) {
      return [];
    }
    
    const details = property.property_details;
    
    // Check if this is the new structure with meta, flow, steps format
    const hasMeta = !!getNestedValue(details, 'meta', null);
    const hasFlow = !!getNestedValue(details, 'flow', null);
    const hasSteps = !!getNestedValue(details, 'steps', null);
    const isNewStructure = hasMeta && hasFlow && hasSteps;
    
    if (isNewStructure) {
      // First try to get images from the media section (new structure)
      const mediaImages = getNestedValue(details, 'media.photos.images', []);
      if (mediaImages && Array.isArray(mediaImages) && mediaImages.length > 0) {
        images = mediaImages;
      }
    } else {
      // Try various paths where images might be stored in property_details (legacy structure)
     if (details.images && Array.isArray(details.images)) {
       images = details.images;
     } else if (details.photos?.images && Array.isArray(details.photos.images)) {
       images = details.photos.images;
     } else if (details.media?.images && Array.isArray(details.media.images)) {
       images = details.media.images;
     } else if (details.imageFiles && Array.isArray(details.imageFiles)) {
       images = details.imageFiles;
     }
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