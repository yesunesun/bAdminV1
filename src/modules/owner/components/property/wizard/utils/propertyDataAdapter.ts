// src/modules/owner/components/property/wizard/utils/propertyDataAdapter.ts
// Version: 3.3.0
// Last Modified: 04-05-2025 21:15 IST
// Purpose: Refactored to support only v3 data structure and export all necessary constants

/**
 * Data structure version constants
 */
export const DATA_VERSION_V3 = 'v3';
export const CURRENT_DATA_VERSION = DATA_VERSION_V3;

/**
 * Detects the version of property data structure
 * @param data Property data to check
 * @returns Version string (v3)
 */
export const detectDataVersion = (data: any): string => {
  if (!data) return CURRENT_DATA_VERSION;
  
  // If there's explicit version in meta, use that
  if (data.meta && data.meta._version) {
    return data.meta._version;
  }
  
  // Check for v3 structure (meta, flow, details sections)
  if (data.meta && data.flow && data.details) {
    return DATA_VERSION_V3;
  }
  
  // Default to v3 since we're phasing out older versions
  return CURRENT_DATA_VERSION;
};

/**
 * Detects specialized property types from data
 */
export const detectSpecializedPropertyType = (data: any): {
  isCoworking: boolean;
  isPGHostel: boolean;
  isFlatmate: boolean;
  isLand: boolean;
} => {
  if (!data) {
    return {
      isCoworking: false,
      isPGHostel: false,
      isFlatmate: false,
      isLand: false
    };
  }
  
  // For v3 format
  if (data.flow) {
    return {
      isCoworking: data.flow.listingType === 'coworking',
      isPGHostel: data.flow.listingType === 'pghostel',
      isFlatmate: data.flow.listingType === 'flatmates',
      isLand: data.flow.category === 'land'
    };
  }
  
  // Default if structure is unclear
  return {
    isCoworking: false,
    isPGHostel: false,
    isFlatmate: false,
    isLand: false
  };
};

/**
 * Creates a new clean property data structure in v3 format
 */
export const createNewPropertyData = (
  category: string = 'residential',
  listingType: string = 'rent'
): any => {
  const now = new Date().toISOString();
  
  return {
    meta: {
      _version: CURRENT_DATA_VERSION,
      created_at: now,
      updated_at: now,
      status: 'draft'
    },
    flow: {
      category: category,
      listingType: listingType
    },
    details: {
      basicDetails: {
        title: 'Spacious Apartment in Prime Location',
        propertyType: 'Apartment',
        bhkType: '2BHK',
        floor: 3,
        totalFloors: 5,
        builtUpArea: 1200,
        builtUpAreaUnit: 'sqft',
        bathrooms: 2,
        balconies: 1,
        facing: 'East',
        propertyAge: '5-10 years'
      },
      location: {
        address: '123 Main Street',
        flatPlotNo: 'A-101',
        landmark: 'Near Central Park',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560038',
        coordinates: {
          latitude: 12.9716,
          longitude: 77.5946
        }
      },
      features: {
        amenities: ['Lift', 'Gym', 'Swimming Pool', '24x7 Security'],
        parking: 'Covered',
        petFriendly: true,
        nonVegAllowed: true,
        waterSupply: '24x7',
        powerBackup: 'Full',
        gatedSecurity: true,
        description: 'Well-maintained apartment with modern amenities and great location.'
      },
      media: {
        photos: {
          images: []
        }
      }
    }
  };
};

/**
 * Ensures the property data follows the v3 structure
 * @param data Property data that might need structural cleaning
 * @returns Clean v3 data
 */
export const ensureV3Structure = (data: any): any => {
  if (!data) return createNewPropertyData();
  
  // Detect the data version
  const version = detectDataVersion(data);
  
  // Handle the mixed structure case (fields at root level and in details)
  if (version === DATA_VERSION_V3 && data.details && 
      (data.basicDetails || data.rental || data.features || 
       data.address || data.bhkType || data.builtUpArea)) {
    
    // Create a clean v3 structure
    const cleanData = {
      meta: { ...data.meta },
      flow: { ...data.flow },
      details: { ...data.details }
    };
    
    // Ensure meta section is properly set
    cleanData.meta = cleanData.meta || {
      _version: CURRENT_DATA_VERSION,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    };
    cleanData.meta._version = CURRENT_DATA_VERSION;
    
    // Move root level basicDetails into details.basicDetails if they exist
    if (data.basicDetails && (!data.details.basicDetails || Object.keys(data.details.basicDetails).length === 0)) {
      cleanData.details.basicDetails = { ...data.basicDetails };
    }
    // Or populate from individual fields
    else if (!data.details.basicDetails || Object.keys(data.details.basicDetails).length === 0) {
      cleanData.details.basicDetails = {
        title: data.title || "",
        propertyType: data.propertyType || "",
        bhkType: data.bhkType || "",
        floor: data.floor ? parseInt(data.floor) : null,
        totalFloors: data.totalFloors ? parseInt(data.totalFloors) : null,
        builtUpArea: data.builtUpArea ? parseFloat(data.builtUpArea) : null,
        builtUpAreaUnit: data.builtUpAreaUnit || "sqft",
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        balconies: data.balconies ? parseInt(data.balconies) : null,
        facing: data.facing || "",
        propertyAge: data.propertyAge || ""
      };
    }
    
    // Move root level location fields into details.location if needed
    if (!data.details.location || Object.keys(data.details.location).length === 0) {
      cleanData.details.location = {
        address: data.address || "",
        flatPlotNo: data.flatPlotNo || "",
        landmark: data.landmark || "",
        locality: data.locality || "",
        city: data.city || "",
        state: data.state || "",
        pinCode: data.pinCode || "",
        coordinates: {
          latitude: data.latitude || null,
          longitude: data.longitude || null
        }
      };
    }
    
    // Move rental information to the right place
    if (data.rental && (!data.details.rentalInfo || Object.keys(data.details.rentalInfo).length === 0)) {
      cleanData.details.rentalInfo = {
        rentAmount: data.rental.rentAmount || null,
        securityDeposit: data.rental.securityDeposit || null,
        maintenanceCharges: data.rental.maintenanceCharges || null,
        rentNegotiable: data.rental.rentNegotiable || false,
        availableFrom: data.rental.availableFrom || "",
        preferredTenants: data.rental.preferredTenants || [],
        leaseDuration: data.rental.leaseDuration || "",
        furnishingStatus: data.rental.furnishingStatus || ""
      };
    } 
    // Or from individual fields
    else if (!data.details.rentalInfo || Object.keys(data.details.rentalInfo).length === 0) {
      cleanData.details.rentalInfo = {
        rentAmount: data.rentAmount ? parseFloat(data.rentAmount) : null,
        securityDeposit: data.securityDeposit ? parseFloat(data.securityDeposit) : null,
        maintenanceCharges: data.maintenance ? parseFloat(data.maintenance) : null,
        rentNegotiable: data.rentNegotiable || false,
        availableFrom: data.availableFrom || "",
        preferredTenants: data.preferredTenants || [],
        leaseDuration: data.leaseDuration || "",
        furnishingStatus: data.furnishing || ""
      };
    }
    
    // Move features to the right place
    if (data.features && (!data.details.features || Object.keys(data.details.features).length === 0)) {
      cleanData.details.features = {
        amenities: data.features.amenities || [],
        parking: data.features.parking || "",
        petFriendly: data.features.petFriendly || false,
        nonVegAllowed: data.features.nonVegAllowed || false,
        waterSupply: data.features.waterSupply || "",
        powerBackup: data.features.powerBackup || "",
        gatedSecurity: data.features.gatedSecurity || false,
        description: data.features.description || ""
      };
    }
    // Or from individual fields
    else if (!data.details.features || Object.keys(data.details.features).length === 0) {
      cleanData.details.features = {
        amenities: data.amenities || [],
        parking: data.parking || "",
        petFriendly: data.petFriendly || false,
        nonVegAllowed: data.nonVegAllowed || false,
        waterSupply: data.waterSupply || "",
        powerBackup: data.powerBackup || "",
        gatedSecurity: data.gatedSecurity || false,
        description: data.description || ""
      };
    }
    
    // Ensure media section exists
    if (!cleanData.details.media) {
      cleanData.details.media = {
        photos: {
          images: data.images || []
        }
      };
    }
    
    // Check for root-level media section
    if (data.media && data.media.photos && 
        (!cleanData.details.media || !cleanData.details.media.photos)) {
      cleanData.details.media = {
        photos: { ...data.media.photos }
      };
    }
    
    return cleanData;
  }
  
  // If it's already v3, ensure all required sections exist
  const cleanData = { ...data };
  
  // Ensure meta section exists
  if (!cleanData.meta) {
    cleanData.meta = {
      _version: CURRENT_DATA_VERSION,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    };
  } else {
    cleanData.meta._version = CURRENT_DATA_VERSION;
  }
  
  // Ensure flow section exists
  if (!cleanData.flow) {
    cleanData.flow = {
      category: 'residential',
      listingType: 'rent'
    };
  }
  
  // Ensure details section exists
  if (!cleanData.details) {
    cleanData.details = {
      basicDetails: {},
      location: {},
      features: {},
      media: { photos: { images: [] } }
    };
  }
  
  // Ensure required subsections exist
  if (!cleanData.details.basicDetails) cleanData.details.basicDetails = {};
  if (!cleanData.details.location) cleanData.details.location = {};
  if (!cleanData.details.features) cleanData.details.features = {};
  if (!cleanData.details.media) cleanData.details.media = { photos: { images: [] } };
  else if (!cleanData.details.media.photos) cleanData.details.media.photos = { images: [] };
  
  // Add specific sections based on listing type
  if (cleanData.flow.listingType === 'rent' && !cleanData.details.rentalInfo) {
    cleanData.details.rentalInfo = {
      rentAmount: null,
      securityDeposit: null,
      maintenanceCharges: null,
      rentNegotiable: false,
      availableFrom: "",
      preferredTenants: [],
      leaseDuration: "",
      furnishingStatus: ""
    };
  } else if (cleanData.flow.listingType === 'sale' && !cleanData.details.saleInfo) {
    cleanData.details.saleInfo = {
      expectedPrice: null,
      priceNegotiable: false,
      possessionDate: ""
    };
  }
  
  return cleanData;
};

/**
 * Converts the v3 structure to database format
 * @param data Property data to convert
 * @returns Object ready for database insertion
 */
export const convertToDbFormat = (data: any): any => {
  if (!data) return {};
  
  // Ensure data is in v3 format
  const cleanData = ensureV3Structure(data);
  
  // Extract values for database columns
  const basicDetails = cleanData.details.basicDetails || {};
  const location = cleanData.details.location || {};
  
  // Create a database-ready object with essential fields at root level
  const dbData: any = {
    title: basicDetails.title || "",
    address: location.address || "",
    city: location.city || "",
    state: location.state || "",
    zip_code: location.pinCode || "",
    status: cleanData.meta.status || "draft"
  };
  
  // Add price based on listing type
  if (cleanData.flow.listingType === 'rent' && cleanData.details.rentalInfo) {
    dbData.price = cleanData.details.rentalInfo.rentAmount || 0;
  } else if (cleanData.flow.listingType === 'sale' && cleanData.details.saleInfo) {
    dbData.price = cleanData.details.saleInfo.expectedPrice || 0;
  } else {
    dbData.price = 0;
  }
  
  // Add property ID if it exists in metadata
  if (cleanData.meta.id) {
    dbData.id = cleanData.meta.id;
  }
  
  // Add owner ID if it exists in metadata
  if (cleanData.meta.owner_id) {
    dbData.owner_id = cleanData.meta.owner_id;
  }
  
  // Store the full property details in the JSON field
  dbData.property_details = cleanData;
  
  return dbData;
};