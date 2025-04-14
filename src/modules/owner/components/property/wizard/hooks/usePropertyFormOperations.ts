// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 2.6.0
// Last Modified: 15-04-2025 13:00 IST
// Purpose: Improved consistency between URL path and detected property flow

// Inside the determinePropertyFlow function, update the logic to prioritize URL path values:

const determinePropertyFlow = (formData: FormData): { propertyCategory: string, propertyFlow: string } => {
  console.log("==== DETERMINING PROPERTY FLOW ====");
  
  // Extract URL path components to get the flow information
  const pathParts = window.location.pathname.split('/');
  const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
  const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
  
  console.log("URL Property Type:", urlPropertyType);
  console.log("URL Listing Type:", urlListingType);
  console.log("Form flow_property_type:", formData.flow_property_type);
  console.log("Form flow_listing_type:", formData.flow_listing_type);
  
  // Prioritize URL path or stored flow values
  const effectivePropertyType = urlPropertyType || formData.flow_property_type || formData.propertyType || '';
  const effectiveListingType = urlListingType || formData.flow_listing_type || formData.listingType || '';
  
  console.log("Effective Property Type:", effectivePropertyType);
  console.log("Effective Listing Type:", effectiveListingType);
  
  // Directly return based on URL path information if it exists
  if (effectivePropertyType.toLowerCase() === 'commercial' && effectiveListingType.toLowerCase() === 'coworking') {
    console.log("Detected Commercial Coworking from URL path");
    return {
      propertyCategory: 'commercial',
      propertyFlow: 'COMMERCIAL_COWORKING'
    };
  }
  
  if (effectivePropertyType.toLowerCase() === 'commercial' && effectiveListingType.toLowerCase() === 'rent') {
    console.log("Detected Commercial Rent from URL path");
    return {
      propertyCategory: 'commercial',
      propertyFlow: 'COMMERCIAL_RENT'
    };
  }
  
  if (effectivePropertyType.toLowerCase() === 'commercial' && effectiveListingType.toLowerCase() === 'sale') {
    console.log("Detected Commercial Sale from URL path");
    return {
      propertyCategory: 'commercial',
      propertyFlow: 'COMMERCIAL_SALE'
    };
  }
  
  if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'pghostel') {
    console.log("Detected Residential PG/Hostel from URL path");
    return {
      propertyCategory: 'residential',
      propertyFlow: 'RESIDENTIAL_PGHOSTEL'
    };
  }
  
  if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'flatmates') {
    console.log("Detected Residential Flatmates from URL path");
    return {
      propertyCategory: 'residential',
      propertyFlow: 'RESIDENTIAL_FLATMATES'
    };
  }
  
  if (effectivePropertyType.toLowerCase() === 'land' && effectiveListingType.toLowerCase() === 'sale') {
    console.log("Detected Land Sale from URL path");
    return {
      propertyCategory: 'land',
      propertyFlow: 'LAND_SALE'
    };
  }
  
  if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'sale') {
    console.log("Detected Residential Sale from URL path");
    return {
      propertyCategory: 'residential',
      propertyFlow: 'RESIDENTIAL_SALE'
    };
  }
  
  if (effectivePropertyType.toLowerCase() === 'residential' && effectiveListingType.toLowerCase() === 'rent') {
    console.log("Detected Residential Rent from URL path");
    return {
      propertyCategory: 'residential',
      propertyFlow: 'RESIDENTIAL_RENT'
    };
  }
  
  // Only fallback to wizard flags and property data if URL path doesn't provide clear information
  // Rest of the existing determination logic...
  
  // Directly use the flow flags from the wizard
  if (isCoworkingMode) {
    console.log("Detected Co-working flow based on isCoworkingMode flag");
    return { 
      propertyCategory: 'commercial',
      propertyFlow: 'COMMERCIAL_COWORKING'
    };
  }
  
  // Rest of the function stays the same...
};

// In the saveProperty function, update how we extract and use URL path information:

// Extract flow information from URL path
const pathParts = window.location.pathname.split('/');
const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';

// Make sure all required fields exist in the data
const safeFormData = {
  ...formData,
  // ... other fields ...
  // Add flow_property_type and flow_listing_type - prioritize URL values
  flow_property_type: urlPropertyType || formData.flow_property_type || '',
  flow_listing_type: urlListingType || formData.flow_listing_type || ''
};

// Use the flow information to ensure propertyCategory and propertyFlow are consistent
if (safeFormData.flow_property_type && safeFormData.flow_listing_type) {
  const simplifiedCategory = safeFormData.flow_property_type.toLowerCase();
  const simplifiedType = safeFormData.flow_listing_type.toLowerCase();
  
  // Override the detected propertyCategory based on flow_property_type
  safeFormData.propertyCategory = simplifiedCategory;
  
  // Build a consistent propertyFlow based on the flow properties
  if (simplifiedCategory === 'commercial' && simplifiedType === 'coworking') {
    safeFormData.propertyFlow = 'COMMERCIAL_COWORKING';
  } else if (simplifiedCategory === 'commercial' && simplifiedType === 'rent') {
    safeFormData.propertyFlow = 'COMMERCIAL_RENT';
  } else if (simplifiedCategory === 'commercial' && simplifiedType === 'sale') {
    safeFormData.propertyFlow = 'COMMERCIAL_SALE';
  } else if (simplifiedCategory === 'residential' && simplifiedType === 'pghostel') {
    safeFormData.propertyFlow = 'RESIDENTIAL_PGHOSTEL';
  } else if (simplifiedCategory === 'residential' && simplifiedType === 'flatmates') {
    safeFormData.propertyFlow = 'RESIDENTIAL_FLATMATES';
  } else if (simplifiedCategory === 'land' && simplifiedType === 'sale') {
    safeFormData.propertyFlow = 'LAND_SALE';
  } else if (simplifiedCategory === 'residential' && simplifiedType === 'sale') {
    safeFormData.propertyFlow = 'RESIDENTIAL_SALE';
  } else if (simplifiedCategory === 'residential' && simplifiedType === 'rent') {
    safeFormData.propertyFlow = 'RESIDENTIAL_RENT';
  }
}