// src/modules/seeker/components/PropertyDetails/utils/propertyDataUtils.ts
// Version: 1.1.0
// Last Modified: 10-05-2025 16:00 IST
// Purpose: Enhanced data extraction with better property type and listing type handling

// Helper functions for parsing and formatting
export const safeParseInt = (value: any): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const numMatch = value.match(/^(\d+)/);
    if (numMatch && numMatch[1]) {
      return parseInt(numMatch[1], 10) || 0;
    }
    return parseInt(value, 10) || 0;
  }
  return 0;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Not specified';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

// Get property listing type (sale/rent) from various data structures
export const getListingType = (property: any): string => {
  if (!property) return 'rent';
  
  // Check different paths for listing type with fallbacks
  const listingType = 
    // From flow object
    property.flow?.listingType || 
    // From property_details.flow
    property.property_details?.flow?.listingType || 
    // Direct property_details property
    property.property_details?.listingType || 
    // Check for saleInfo or rentalInfo presence
    (property.saleInfo || property.property_details?.saleInfo ? 'sale' : 
     property.rentalInfo || property.property_details?.rentalInfo ? 'rent' : 
     // Look for price field name hints
     (property.expectedPrice || property.property_details?.expectedPrice ? 'sale' : 
      property.rentAmount || property.property_details?.rentAmount ? 'rent' : 
      // Default fallback
      'rent'));
  
  return listingType.toLowerCase();
};

// Get property category/type from various data structures
export const getPropertyType = (property: any): string => {
  if (!property) return 'Residential';
  
  // Check different paths with fallbacks
  const propertyType = 
    // From basicDetails
    property.basicDetails?.propertyType || 
    // From property_details.basicDetails
    property.property_details?.basicDetails?.propertyType || 
    // Direct property_details property
    property.property_details?.propertyType || 
    // From flow.category (capitalized)
    (property.flow?.category ? 
      property.flow.category.charAt(0).toUpperCase() + property.flow.category.slice(1) : 
      // From property_details.flow.category
      property.property_details?.flow?.category ?
        property.property_details.flow.category.charAt(0).toUpperCase() + 
        property.property_details.flow.category.slice(1) : 
        // Default fallback
        'Residential');
  
  return propertyType;
};

// Extract data from property based on its structure (v3, v2, or legacy)
export const getPropertyData = (property: any) => {
  if (!property) return null;
  
  // Check if property has property_details with v3 structure
  const propertyDetails = property.property_details || {};
  const isV3Format = propertyDetails._version === 'v3';
  
  // Extract data based on structure
  if (isV3Format) {
    const flow = propertyDetails.flow || { category: 'residential', listingType: 'rent' };
    const meta = propertyDetails.meta || { id: property.id, owner_id: property.owner_id };
    const details = propertyDetails.details || {};
    
    return {
      id: property.id || meta.id,
      owner_id: property.owner_id || meta.owner_id,
      flow,
      basicDetails: details.basicDetails || {},
      features: details.features || {},
      location: details.location || {},
      rentalInfo: details.rentalInfo || {},
      saleInfo: details.saleInfo || {},
      images: details.media?.photos?.images || property.property_images || [],
      description: details.features?.description || property.description || "No description provided for this property."
    };
  }
  
  // For v2 format (often used in the newer properties)
  if (property.basicDetails || propertyDetails.basicDetails) {
    return {
      id: property.id,
      owner_id: property.owner_id,
      flow: property.flow || propertyDetails.flow || { 
        category: propertyDetails.category || 'residential', 
        listingType: getListingType(property)
      },
      basicDetails: property.basicDetails || propertyDetails.basicDetails || {},
      features: property.features || propertyDetails.features || {},
      location: property.location || propertyDetails.location || {
        address: property.address,
        city: property.city,
        state: property.state,
        pinCode: property.zip_code
      },
      rentalInfo: property.rental || propertyDetails.rental || {},
      saleInfo: property.sale || propertyDetails.sale || {},
      images: property.property_images || [],
      description: (property.features?.description || 
                   propertyDetails.features?.description || 
                   property.description || 
                   "No description provided for this property.")
    };
  }
  
  // For legacy format - create a compatible structure
  return {
    id: property.id,
    owner_id: property.owner_id,
    flow: { 
      category: getPropertyType(property).toLowerCase(), 
      listingType: getListingType(property)
    },
    basicDetails: {
      propertyType: getPropertyType(property),
      bhkType: property.bedrooms ? `${property.bedrooms} BHK` : '',
      bathrooms: property.bathrooms || 0,
      builtUpArea: property.square_feet || 0,
      builtUpAreaUnit: 'sqft',
      title: property.title || '',
      floor: propertyDetails.floor || 0,
      totalFloors: propertyDetails.totalFloors || 0,
      facing: propertyDetails.facing || '',
      propertyAge: propertyDetails.propertyAge || '',
      possessionDate: propertyDetails.possessionDate || ''
    },
    features: {
      amenities: propertyDetails.amenities || [],
      description: property.description || "",
      parking: propertyDetails.parking || '',
      furnishing: propertyDetails.furnishing || ''
    },
    location: {
      address: property.address || '',
      city: property.city || '',
      state: property.state || '',
      pinCode: property.zip_code || '',
      coordinates: propertyDetails.coordinates || null
    },
    rentalInfo: {
      rentAmount: property.price || 0,
      securityDeposit: propertyDetails.securityDeposit || 0,
      availableFrom: propertyDetails.availableFrom || '',
      furnishingStatus: propertyDetails.furnishing || ''
    },
    saleInfo: {
      expectedPrice: property.price || 0,
      priceNegotiable: propertyDetails.priceNegotiable || false
    },
    images: property.property_images || [],
    description: property.description || "No description provided for this property."
  };
};

// Function for extracting images from JSON
export const extractImagesFromJson = (property: any): any[] => {
  if (!property) return [];
  
  try {
    // Parse property_details if it's a string
    let details = property.property_details;
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details);
      } catch (e) {
        // Silent catch - no debug logs
      }
    }
    
    // Direct extraction from property_details.images - handling DataUrl format
    if (details && details.images && Array.isArray(details.images) && details.images.length > 0) {
      const firstImg = details.images[0];
      
      // Check if images use dataUrl format (from PropertyImageUpload)
      if (firstImg.dataUrl) {
        return details.images.map((img: any, idx: number) => ({
          id: img.id || `img-${idx}`,
          url: img.dataUrl, // Map dataUrl to url for standard components
          is_primary: !!img.isPrimary,
          display_order: idx
        }));
      }
      
      // Handle standard image format if not dataUrl
      return details.images.map((img: any, idx: number) => ({
        id: img.id || `img-${idx}`,
        url: img.url || (typeof img === 'string' ? img : ''),
        is_primary: !!img.is_primary,
        display_order: img.display_order || idx
      }));
    }
    
    // Try other known paths where images might be stored
    let foundImages: any[] = [];
    
    // Path: details.media.photos.images
    if (details?.media?.photos?.images) {
      foundImages = details.media.photos.images;
    }
    // Path: property.property_images
    else if (property.property_images && Array.isArray(property.property_images)) {
      foundImages = property.property_images;
    }
    
    // If we found images in an alternative path, process them
    if (foundImages.length > 0) {
      return foundImages.map((img, idx) => ({
        id: img.id || `img-${idx}`,
        url: img.url || (typeof img === 'string' ? img : ''),
        is_primary: !!img.is_primary,
        display_order: img.display_order || idx
      }));
    }
    
  } catch (error) {
    // Silent catch - no debug logs
  }
  
  return [];
};