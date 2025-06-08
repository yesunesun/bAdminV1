// src/modules/seeker/utils/propertyTitleUtils.ts
// Version: 2.2.0
// Last Modified: 25-05-2025 17:30 IST
// Purpose: Fixed title generation utility with proper syntax and backward compatibility

import { FLOW_TYPES } from '@/modules/owner/components/property/wizard/constants/flows';

/**
 * Extracts the best location from property data
 * Prioritizes locality over city and filters out inappropriate values
 */
export function extractBestLocation(property: any): string {
  const details = property.property_details || {};
  
  // Try to find location in the steps first (new structure)
  if (details.steps) {
    for (const [stepId, stepData] of Object.entries(details.steps)) {
      if (stepId.includes('location') && stepData && typeof stepData === 'object') {
        const locationData = stepData as any;
        
        // Priority: locality -> city -> address components
        if (locationData.locality && 
            !locationData.locality.toLowerCase().includes('flat') && 
            !locationData.locality.toLowerCase().match(/^(flat|apartment|building)/i)) {
          return locationData.locality;
        }
        
        if (locationData.city) {
          return locationData.city;
        }
      }
    }
  }
  
  // Fallback to old structure
  const location = details.location || {};
  
  if (location.locality && 
      !location.locality.toLowerCase().includes('flat') && 
      !location.locality.toLowerCase().match(/^(flat|apartment|building)/i)) {
    return location.locality;
  } 
  
  if (location.city) {
    return location.city;
  } else if (property.city) {
    return property.city;
  } 
  
  // Try to extract from address
  if (property.address) {
    const addressParts = property.address.split(',');
    for (const part of addressParts) {
      const trimmedPart = part.trim();
      if (trimmedPart && 
          !trimmedPart.toLowerCase().includes('flat') && 
          !trimmedPart.toLowerCase().match(/^(flat|apartment|building)/i) &&
          !trimmedPart.match(/^\d+$/)) {
        return trimmedPart;
      }
    }
  }
  
  return 'Prime Location';
}

/**
 * Detects the property flow type based on property data
 */
export function detectPropertyFlowType(property: any): string {
  const details = property.property_details || {};
  
  // Check flow information
  const flowCategory = details.flow?.category || '';
  const flowListingType = details.flow?.listingType || '';
  
  // If we have explicit flow info, use it
  if (flowCategory && flowListingType) {
    if (flowCategory === 'land') {
      return FLOW_TYPES.LAND_SALE;
    }
    
    if (flowCategory === 'commercial') {
      // Check for coworking in steps
      if (details.steps) {
        for (const stepId in details.steps) {
          if (stepId.includes('coworking')) {
            return FLOW_TYPES.COMMERCIAL_COWORKING;
          }
        }
      }
      return flowListingType === 'rent' ? FLOW_TYPES.COMMERCIAL_RENT : FLOW_TYPES.COMMERCIAL_SALE;
    }
    
    if (flowCategory === 'residential') {
      // Check for specific residential types in steps
      if (details.steps) {
        for (const stepId in details.steps) {
          if (stepId.includes('pg_details')) {
            return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
          }
          if (stepId.includes('flatmate_details')) {
            return FLOW_TYPES.RESIDENTIAL_FLATMATES;
          }
        }
      }
      return flowListingType === 'rent' ? FLOW_TYPES.RESIDENTIAL_RENT : FLOW_TYPES.RESIDENTIAL_SALE;
    }
  }
  
  // Fallback detection logic
  const listingType = property.listing_type || 
                     (property.price > 10000000 ? 'sale' : 'rent');
  
  // Check steps for specific property types
  if (details.steps) {
    for (const stepId in details.steps) {
      if (stepId.includes('land')) {
        return FLOW_TYPES.LAND_SALE;
      }
      if (stepId.includes('pg_details')) {
        return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
      }
      if (stepId.includes('flatmate_details')) {
        return FLOW_TYPES.RESIDENTIAL_FLATMATES;
      }
      if (stepId.includes('coworking')) {
        return FLOW_TYPES.COMMERCIAL_COWORKING;
      }
      if (stepId.includes('com_')) {
        return listingType === 'rent' ? FLOW_TYPES.COMMERCIAL_RENT : FLOW_TYPES.COMMERCIAL_SALE;
      }
    }
  }
  
  return listingType === 'rent' ? FLOW_TYPES.RESIDENTIAL_RENT : FLOW_TYPES.RESIDENTIAL_SALE;
}

/**
 * Extracts flat/apartment number from property data (BACKWARD COMPATIBILITY)
 */
export function extractFlatNumber(property: any): string {
  const details = property.property_details || {};
  
  // Try to find in steps first (new structure)
  if (details.steps) {
    for (const [stepId, stepData] of Object.entries(details.steps)) {
      if (stepId.includes('location') && stepData && typeof stepData === 'object') {
        const locationData = stepData as any;
        if (locationData.flatPlotNo) {
          return locationData.flatPlotNo;
        }
      }
    }
  }
  
  // Fallback to old structure
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
 * Creates a detailed location string including flat number if available (BACKWARD COMPATIBILITY)
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
 * Extracts property data from steps based on flow type
 */
export function extractPropertyData(property: any, flowType: string) {
  const details = property.property_details || {};
  const steps = details.steps || {};
  
  let basicDetails: any = {};
  let locationDetails: any = {};
  let priceDetails: any = {};
  let specificDetails: any = {};
  
  // Find relevant steps based on flow type
  for (const [stepId, stepData] of Object.entries(steps)) {
    if (!stepData || typeof stepData !== 'object') continue;
    
    const data = stepData as any;
    
    // Basic details step
    if (stepId.includes('basic_details')) {
      basicDetails = { ...basicDetails, ...data };
    }
    
    // Location step
    if (stepId.includes('location')) {
      locationDetails = { ...locationDetails, ...data };
    }
    
    // Price-related steps
    if (stepId.includes('rental') || stepId.includes('sale_details')) {
      priceDetails = { ...priceDetails, ...data };
    }
    
    // Flow-specific details
    if (stepId.includes('flatmate_details')) {
      specificDetails.flatmate = { ...specificDetails.flatmate, ...data };
    }
    if (stepId.includes('pg_details')) {
      specificDetails.pg = { ...specificDetails.pg, ...data };
    }
    if (stepId.includes('coworking_details')) {
      specificDetails.coworking = { ...specificDetails.coworking, ...data };
    }
    if (stepId.includes('land_features')) {
      specificDetails.land = { ...specificDetails.land, ...data };
    }
  }
  
  return { basicDetails, locationDetails, priceDetails, specificDetails };
}

/**
 * Generates a standardized property title based on property data and flow type
 */
export function generatePropertyTitle(property: any): string {
  console.log('generatePropertyTitle: Starting for property:', property.id);
  
  const flowType = detectPropertyFlowType(property);
  const bestLocation = extractBestLocation(property);
  const { basicDetails, locationDetails, priceDetails, specificDetails } = extractPropertyData(property, flowType);
  
  console.log('generatePropertyTitle: Flow type:', flowType);
  console.log('generatePropertyTitle: Best location:', bestLocation);
  console.log('generatePropertyTitle: Extracted data:', { basicDetails, specificDetails });
  
  let title = '';
  
  switch (flowType) {
    case FLOW_TYPES.RESIDENTIAL_RENT:
    case FLOW_TYPES.RESIDENTIAL_SALE:
      {
        // Pattern: "3 BHK Apartment for Family in Jubilee Hills"
        const propertyType = basicDetails.propertyType || 'Apartment';
        const bhkType = basicDetails.bhkType || (property.bedrooms ? `${property.bedrooms} BHK` : '');
        
        // Add tenant preference for rent
        let targetAudience = '';
        if (flowType === FLOW_TYPES.RESIDENTIAL_RENT && priceDetails.preferredTenants && priceDetails.preferredTenants.length > 0) {
          const tenants = priceDetails.preferredTenants;
          if (tenants.includes('Family')) targetAudience = ' for Family';
          else if (tenants.includes('Bachelor')) targetAudience = ' for Bachelors';
          else if (tenants.includes('Working Professional')) targetAudience = ' for Professionals';
        }
        
        if (bhkType) {
          title = `${bhkType} ${propertyType}${targetAudience} in ${bestLocation}`;
        } else {
          title = `${propertyType}${targetAudience} in ${bestLocation}`;
        }
        break;
      }
      
    case FLOW_TYPES.RESIDENTIAL_FLATMATES:
      {
        // Pattern: "Single Room in 3 BHK for Working Professional in Madhapur"
        const roomSharing = specificDetails.flatmate?.roomSharing === false ? 'Single Room' : 'Shared Room';
        const flatType = basicDetails.bhkType || '3 BHK';
        const tenantType = specificDetails.flatmate?.tenantType === 'Working Professional' ? ' for Working Professional' : 
                          specificDetails.flatmate?.tenantType === 'Student' ? ' for Student' : '';
        const genderPref = specificDetails.flatmate?.preferredGender && specificDetails.flatmate.preferredGender !== 'Any' ? 
                          ` for ${specificDetails.flatmate.preferredGender}` : '';
        
        title = `${roomSharing} in ${flatType}${tenantType}${genderPref} in ${bestLocation}`;
        break;
      }
      
    case FLOW_TYPES.RESIDENTIAL_PGHOSTEL:
      {
        // Pattern: "Boys PG with Food near IT Companies in Hitech City"
        const genderType = specificDetails.pg?.genderPreference === 'Male' ? 'Boys' : 
                          specificDetails.pg?.genderPreference === 'Female' ? 'Girls' : 
                          specificDetails.pg?.genderPreference === 'Co-ed' ? 'Co-ed' : '';
        
        const pgType = specificDetails.pg?.pgType === 'Executive' ? 'Executive PG' : 
                      specificDetails.pg?.pgType === 'Student' ? 'Student PG' : 'PG';
        
        const mealInfo = specificDetails.pg?.mealOptions && specificDetails.pg.mealOptions.length > 0 ? ' with Food' : '';
        
        const targetLocation = bestLocation.toLowerCase().includes('hitech') || bestLocation.toLowerCase().includes('gachibowli') || 
                             bestLocation.toLowerCase().includes('madhapur') ? ' near IT Companies' : '';
        
        if (genderType) {
          title = `${genderType} ${pgType}${mealInfo}${targetLocation} in ${bestLocation}`;
        } else {
          title = `${pgType}${mealInfo}${targetLocation} in ${bestLocation}`;
        }
        break;
      }
      
    case FLOW_TYPES.COMMERCIAL_RENT:
    case FLOW_TYPES.COMMERCIAL_SALE:
      {
        // Pattern: "2000 Sq Ft Office Space in Business District, Banjara Hills"
        let commercialType = basicDetails.propertyType || 'Commercial Space';
        
        // Remove "Commercial" prefix if already present to avoid redundancy
        if (commercialType.toLowerCase().includes('commercial')) {
          commercialType = commercialType.replace(/commercial\s*/gi, '').trim();
        }
        
        const area = basicDetails.builtUpArea ? `${basicDetails.builtUpArea} Sq Ft ` : '';
        const businessArea = bestLocation.toLowerCase().includes('banjara') || bestLocation.toLowerCase().includes('jubilee') ? 
                            ' in Business District' : '';
        
        title = `${area}${commercialType}${businessArea}, ${bestLocation}`;
        break;
      }
      
    case FLOW_TYPES.COMMERCIAL_COWORKING:
      {
        // Pattern: "50 Seats Coworking Space with Parking in Gachibowli"
        const capacity = specificDetails.coworking?.capacity ? `${specificDetails.coworking.capacity} Seats ` : '';
        const amenities = specificDetails.coworking?.amenities && specificDetails.coworking.amenities.includes('Parking') ? 
                         ' with Parking' : '';
        
        title = `${capacity}Coworking Space${amenities} in ${bestLocation}`;
        break;
      }
      
    case FLOW_TYPES.LAND_SALE:
      {
        // Pattern: "1200 Sq Ft HMDA Approved Plot in Shamshabad"
        const landArea = basicDetails.builtUpArea || specificDetails.land?.plotSize;
        const areaUnit = basicDetails.builtUpAreaUnit === 'sqyd' ? 'Sq Yd' : 'Sq Ft';
        const sizeText = landArea ? `${landArea} ${areaUnit} ` : '';
        
        // Check for approvals
        const approvals = specificDetails.land?.approvals || [];
        let approvalText = '';
        if (approvals.includes('HMDA')) approvalText = 'HMDA Approved ';
        else if (approvals.includes('RERA')) approvalText = 'RERA Approved ';
        else if (approvals.includes('DTCP')) approvalText = 'DTCP Approved ';
        
        // Determine land type
        const landType = specificDetails.land?.landUseZone === 'Residential' ? 'Residential Plot' :
                        specificDetails.land?.landUseZone === 'Commercial' ? 'Commercial Plot' :
                        specificDetails.land?.landUseZone === 'Agricultural' ? 'Agricultural Land' :
                        'Plot';
        
        // Special features
        const isCorner = specificDetails.land?.cornerPlot ? 'Corner ' : '';
        
        title = `${sizeText}${approvalText}${isCorner}${landType} in ${bestLocation}`;
        break;
      }
      
    default:
      {
        // Fallback title
        title = `Property in ${bestLocation}`;
        break;
      }
  }
  
  console.log('generatePropertyTitle: Generated title:', title);
  return title.trim();
}

/**
 * Cleans up an existing property title or generates a new one if needed
 */
export function cleanupPropertyTitle(property: any): string {
  // Generate the standard title based on property data
  const generatedTitle = generatePropertyTitle(property);
  const bestLocation = extractBestLocation(property);
  
  // Check if property has a user-provided title
  if (property.property_details?.flow?.title) {
    const currentTitle = property.property_details.flow.title;
    const titleLower = currentTitle.toLowerCase();
    
    // Check for problematic patterns
    if (titleLower.includes('in hyderabad in') ||
        titleLower.includes('in secunderabad in') ||
        titleLower.includes('flat no') || 
        titleLower.includes('in flat') || 
        titleLower.match(/in\s+(apartment|unit|building)/i) ||
        titleLower.includes('property for rent in') || 
        titleLower.includes('property for sale in') ||
        titleLower.includes('new property in') ||
        titleLower.includes('commercial commercial') ||
        titleLower === 'untitled property' ||
        titleLower === 'property' ||
        currentTitle.trim() === '') {
      // Use our generated title instead
      return generatedTitle;
    } else if (!titleLower.includes(bestLocation.toLowerCase())) {
      // If the title doesn't include the location, use generated title
      return generatedTitle;
    } else {
      // Use original title if it's good
      return currentTitle;
    }
  }
  
  // Check old structure title as fallback
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
  const flowType = detectPropertyFlowType(property);
  const title = cleanupPropertyTitle(property);
  const detailedLocation = formatDetailedLocation(property);
  const { basicDetails } = extractPropertyData(property, flowType);
  
  const propertyType = basicDetails.propertyType || property.property_type || 'Property';
  const listingDisplay = flowType.includes('sale') ? 'For Sale' : 'For Rent';
  
  // Handle pricing
  let price = property.price || 0;
  
  // Try to get price from steps if not available at root level
  if (price === 0 && details.steps) {
    for (const [stepId, stepData] of Object.entries(details.steps)) {
      if (stepData && typeof stepData === 'object') {
        const data = stepData as any;
        if (data.rentAmount && flowType.includes('rent')) {
          price = data.rentAmount;
          break;
        }
        if (data.expectedPrice && flowType.includes('sale')) {
          price = data.expectedPrice;
          break;
        }
      }
    }
  }
  
  let formattedPrice = '';
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