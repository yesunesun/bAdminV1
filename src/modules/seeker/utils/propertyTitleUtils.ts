// src/modules/seeker/utils/propertyTitleUtils.ts
// Version: 1.0.0
// Last Modified: 21-05-2025 10:00 IST
// Purpose: Standalone utility for consistent property title generation

import { FLOW_TYPES } from '@/modules/owner/components/property/wizard/constants/flows';

/**
 * Extracts the best location from property data
 * Prioritizes locality over city and filters out inappropriate values
 */
export function extractBestLocation(property: any): string {
  const details = property.property_details || {};
  const location = details.location || {};
  
  // Priority: locality -> city -> fallback
  let bestLocation = '';
  
  // 1. First try to get a proper locality (neighborhood/area)
  if (location.locality && 
      !location.locality.toLowerCase().includes('flat') && 
      !location.locality.toLowerCase().match(/^(flat|apartment|building)/i)) {
    bestLocation = location.locality;
  } 
  // 2. If no locality, try city
  else if (location.city) {
    bestLocation = location.city;
  } else if (property.city) {
    bestLocation = property.city;
  } 
  // 3. If neither, try to extract from address
  else if (property.address) {
    // Try to extract a neighborhood or area from the address
    const addressParts = property.address.split(',');
    let potentialLocality = '';
    
    // Find the first part that doesn't look like a flat/building number
    for (const part of addressParts) {
      const trimmedPart = part.trim();
      if (trimmedPart && 
          !trimmedPart.toLowerCase().includes('flat') && 
          !trimmedPart.toLowerCase().match(/^(flat|apartment|building)/i) &&
          !trimmedPart.match(/^\d+$/)) {
        potentialLocality = trimmedPart;
        break;
      }
    }
    
    if (potentialLocality) {
      bestLocation = potentialLocality;
    } else {
      // If we couldn't find a good locality, use a default
      bestLocation = 'area';
    }
  } else {
    bestLocation = 'area';
  }
  
  return bestLocation;
}

/**
 * Detects the property flow type based on property data
 */
export function detectPropertyFlowType(property: any): string {
  const details = property.property_details || {};
  
  // Determine category from property details
  const flowCategory = details.flow?.category || 
                      (details.basicDetails?.propertyType === 'Land' ? 'land' : 
                       details.basicDetails?.propertyType?.includes('Commercial') ? 'commercial' : 'residential');
  
  const listingType = details.flow?.listingType || 
                     property.listing_type || 
                     (property.price > 10000000 ? 'sale' : 'rent');
  
  // Determine exact flow type
  if (flowCategory === 'land') {
    return FLOW_TYPES.LAND_SALE;
  }
  
  if (flowCategory === 'commercial') {
    if (details.coworkingDetails) {
      return FLOW_TYPES.COMMERCIAL_COWORKING;
    }
    return listingType === 'rent' ? FLOW_TYPES.COMMERCIAL_RENT : FLOW_TYPES.COMMERCIAL_SALE;
  }
  
  // Residential flows
  if (details.pgDetails) {
    return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
  }
  
  if (details.flatmateDetails) {
    return FLOW_TYPES.RESIDENTIAL_FLATMATES;
  }
  
  return listingType === 'rent' ? FLOW_TYPES.RESIDENTIAL_RENT : FLOW_TYPES.RESIDENTIAL_SALE;
}

/**
 * Extracts flat/apartment number from property data
 */
export function extractFlatNumber(property: any): string {
  const details = property.property_details || {};
  const location = details.location || {};
  
  let flatNumber = '';
  
  if (location.flatPlotNo) {
    flatNumber = location.flatPlotNo;
  } else if (property.address && property.address.toLowerCase().includes('flat')) {
    // Try to extract flat number from address
    const flatMatch = property.address.match(/flat\s+no\s*([\w-]+)/i);
    if (flatMatch && flatMatch[1]) {
      flatNumber = `Flat No ${flatMatch[1]}`;
    }
  }
  
  return flatNumber;
}

/**
 * Creates a detailed location string including flat number if available
 */
export function formatDetailedLocation(property: any): string {
  const bestLocation = extractBestLocation(property);
  const flatNumber = extractFlatNumber(property);
  
  let detailedLocation = '';
  
  if (flatNumber && bestLocation) {
    detailedLocation = `${flatNumber}, ${bestLocation}`;
  } else if (flatNumber) {
    detailedLocation = flatNumber;
  } else {
    detailedLocation = bestLocation;
  }
  
  return detailedLocation;
}

/**
 * Generates a standardized property title based on property data and flow type
 */
export function generatePropertyTitle(property: any): string {
  const details = property.property_details || {};
  const basicDetails = details.basicDetails || {};
  const flowType = detectPropertyFlowType(property);
  const bestLocation = extractBestLocation(property);
  
  let title = '';
  
  switch (flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
    case FLOW_TYPES.RESIDENTIAL_SALE:
      // Title: 3 BHK Apartment in Jubilee Hills
      const propertyType = basicDetails.propertyType || 'Apartment';
      const bhkType = basicDetails.bhkType || (property.bedrooms ? `${property.bedrooms} BHK` : '');
      title = bhkType ? `${bhkType} ${propertyType} in ${bestLocation}` : `${propertyType} in ${bestLocation}`;
      break;
      
    case FLOW_TYPES.RESIDENTIAL_FLATMATES:
      // Title: Room in Madhapur
      title = `Room in ${bestLocation}`;
      break;
      
    case FLOW_TYPES.RESIDENTIAL_PGHOSTEL:
      // Title: PG/Hostel in Gachibowli
      title = `PG/Hostel in ${bestLocation}`;
      break;
      
    case FLOW_TYPES.COMMERCIAL_RENT:
    case FLOW_TYPES.COMMERCIAL_SALE:
      // Title: Commercial Office Space in Hitech City
      const commercialType = basicDetails.propertyType || 'Commercial Space';
      title = `Commercial ${commercialType} in ${bestLocation}`;
      break;
      
    case FLOW_TYPES.COMMERCIAL_COWORKING:
      // Title: Coworking Space in Kondapur
      title = `Coworking Space in ${bestLocation}`;
      break;
      
    case FLOW_TYPES.LAND_SALE:
      // Title: Residential Plot in Shamshabad
      const landType = details.landDetails?.landType || "Land/Plot";
      title = `${landType} in ${bestLocation}`;
      break;
      
    default:
      // Default title if no specific flow detected
      title = `Property in ${bestLocation}`;
  }
  
  return title;
}

/**
 * Cleans up an existing property title or generates a new one if needed
 */
export function cleanupPropertyTitle(property: any): string {
  // Generate the standard title based on property data
  const generatedTitle = generatePropertyTitle(property);
  const bestLocation = extractBestLocation(property);
  
  // Check if property has a user-provided title
  if (property.title) {
    const titleLower = property.title.toLowerCase();
    
    // Check for problematic patterns
    if (titleLower.includes('in hyderabad in') ||
        titleLower.includes('in secunderabad in') ||
        titleLower.includes('flat no') || 
        titleLower.includes('in flat') || 
        titleLower.match(/in\s+(apartment|unit|building)/i) ||
        titleLower.includes('property for rent in') || 
        titleLower.includes('property for sale in') ||
        titleLower.includes('new property in')) {
      // Use our generated title instead
      return generatedTitle;
    } else if (!titleLower.includes(bestLocation.toLowerCase())) {
      // If the title doesn't include the location, append it
      return `${property.title} in ${bestLocation}`;
    } else {
      // Use original title if it's good
      return property.title;
    }
  }
  
  // No title provided, use generated one
  return generatedTitle;
}

/**
 * All-in-one function to get property display data
 */
export function getPropertyDisplayData(property: any) {
  const details = property.property_details || {};
  const basicDetails = details.basicDetails || {};
  
  const flowType = detectPropertyFlowType(property);
  const title = cleanupPropertyTitle(property);
  const detailedLocation = formatDetailedLocation(property);
  const propertyType = basicDetails.propertyType || property.property_type || 'Apartment';
  const listingDisplay = flowType.includes('sale') ? 'For Sale' : 'For Rent';
  
  // Handle special pricing cases
  let price = property.price || 0;
  let formattedPrice = '';
  
  // If the price is 0 or 1, it's likely a test/placeholder property
  if (price === 0) {
    formattedPrice = 'Price on request';
  } else if (price === 1) {
    formattedPrice = 'Contact for price';
  } else if (flowType.includes('rent')) {
    formattedPrice = `₹${price.toLocaleString('en-IN')} per month`;
  } else {
    formattedPrice = `₹${price.toLocaleString('en-IN')}`;
  }
  
  return {
    title,
    detailedLocation,
    propertyType,
    listingDisplay,
    price: formattedPrice,
    flowType
  };
}

export default {
  extractBestLocation,
  detectPropertyFlowType,
  extractFlatNumber,
  formatDetailedLocation,
  generatePropertyTitle,
  cleanupPropertyTitle,
  getPropertyDisplayData
};