// src/modules/owner/components/property/wizard/utils/propertyDataAdapter.ts
// Version: 1.1.0
// Last Modified: 16-04-2025 15:30 IST
// Purpose: Enhanced utility functions for handling property data structure conversion with specialized property types

// Version constants
export const DATA_VERSION_V1 = 'v1';
export const DATA_VERSION_V2 = 'v2';
export const CURRENT_DATA_VERSION = DATA_VERSION_V2;

/**
 * Detects the version of a property data structure
 * @param propertyData Any property data object
 * @returns The detected version ('v1', 'v2', or 'legacy')
 */
export const detectDataVersion = (propertyData: any): string => {
  // If the property has no data, consider it legacy
  if (!propertyData) return 'legacy';
  
  // If the version is explicitly set, return it
  if (propertyData._version) {
    return propertyData._version;
  }
  
  // Check for v2 structure by examining if it has the proper nested structure
  // All three major sections should exist and be objects
  if (propertyData.basicDetails && 
      typeof propertyData.basicDetails === 'object' &&
      propertyData.location && 
      typeof propertyData.location === 'object' &&
      propertyData.flow && 
      typeof propertyData.flow === 'object') {
    return DATA_VERSION_V2;
  }
  
  // Check for flat structure properties that are unique to v1
  if (propertyData.flatPlotNo !== undefined || 
      propertyData.builtUpArea !== undefined ||
      propertyData.propertyType !== undefined) {
    return DATA_VERSION_V1;
  }
  
  // No version information - assume it's legacy data
  return 'legacy';
};

/**
 * Determines if a property is a specialized type based on its data
 * @param data Property data (v1 or v2 format)
 * @returns Object containing isSpecializedType flag and typeInfo
 */
export const detectSpecializedPropertyType = (data: any): { 
  isSpecializedType: boolean; 
  category: string; 
  listingType: string;
  isCoworking: boolean;
  isPGHostel: boolean;
  isFlatmate: boolean;
  isLand: boolean;
  isSale: boolean;
} => {
  const dataVersion = detectDataVersion(data);
  
  // Default values
  let result = {
    isSpecializedType: false,
    category: 'residential',
    listingType: 'rent',
    isCoworking: false,
    isPGHostel: false,
    isFlatmate: false,
    isLand: false,
    isSale: false
  };
  
  if (dataVersion === DATA_VERSION_V2) {
    // Extract from V2 structure
    const flow = data.flow || {};
    result.category = flow.category || 'residential';
    result.listingType = flow.listingType || 'rent';
    
    // Check for specialized types
    result.isCoworking = result.listingType === 'coworking';
    result.isPGHostel = result.listingType === 'pghostel';
    result.isFlatmate = result.listingType === 'flatmates';
    result.isLand = result.category === 'land';
    result.isSale = result.listingType === 'sale';
    
    // Determine if this is a specialized type
    result.isSpecializedType = result.isCoworking || result.isPGHostel || 
                              result.isFlatmate || result.isLand;
  } else {
    // Extract from V1 structure
    result.category = data.propertyCategory || 'residential';
    result.listingType = data.listingType || '';
    
    // Specialized type checks for V1
    result.isCoworking = data.commercialPropertyType === 'coworking' || 
                        result.listingType === 'coworking';
    result.isPGHostel = result.listingType === 'pghostel';
    result.isFlatmate = result.listingType === 'flatmates';
    result.isLand = result.category === 'land';
    result.isSale = data.isSaleProperty === true || 
                   result.listingType === 'sale' || 
                   data.propertyPriceType === 'sale';
    
    // Determine if this is a specialized type
    result.isSpecializedType = result.isCoworking || result.isPGHostel || 
                              result.isFlatmate || result.isLand;
  }
  
  return result;
};

/**
 * Converts property data from v1 to v2 format with strict categorization
 * @param v1Data Property data in v1 format
 * @returns Property data in v2 format with proper category structure
 */
export const convertV1ToV2 = (v1Data: any): any => {
  if (!v1Data) return null;
  
  // Detect specialized property types
  const { 
    isSpecializedType, 
    category, 
    listingType,
    isCoworking,
    isPGHostel,
    isFlatmate,
    isLand,
    isSale
  } = detectSpecializedPropertyType(v1Data);
  
  // Initialize v2 structure with empty objects for each category
  const v2Data: any = {
    _version: DATA_VERSION_V2,
    
    // Extract ID and metadata
    id: v1Data.id,
    owner_id: v1Data.owner_id,
    created_at: v1Data.created_at,
    updated_at: v1Data.updated_at,
    status: v1Data.status,
    
    // Set flow information with detected values
    flow: {
      category: category,
      listingType: listingType || (isSale ? "sale" : "rent")
    },
    
    // Basic details
    basicDetails: {
      title: v1Data.title || '',
      propertyType: v1Data.propertyType || '',
      bhkType: v1Data.bhkType || '',
      floor: v1Data.floor ? parseInt(v1Data.floor) : null,
      totalFloors: v1Data.totalFloors ? parseInt(v1Data.totalFloors) : null,
      builtUpArea: v1Data.builtUpArea ? parseFloat(v1Data.builtUpArea) : null,
      builtUpAreaUnit: v1Data.builtUpAreaUnit || 'sqft',
      bathrooms: v1Data.bathrooms ? parseInt(v1Data.bathrooms) : null,
      balconies: v1Data.balconies ? parseInt(v1Data.balconies) : null,
      facing: v1Data.facing || '',
      propertyAge: v1Data.propertyAge || v1Data.ageOfProperty || v1Data.property_age || v1Data.propertyAgeSelect || ''
    },
    
    // Location information
    location: {
      address: v1Data.address || '',
      flatPlotNo: v1Data.flatPlotNo || '',
      landmark: v1Data.landmark || '',
      locality: v1Data.locality || '',
      city: v1Data.city || '',
      state: v1Data.state || '',
      pinCode: v1Data.pinCode || '',
      coordinates: {
        latitude: v1Data.latitude || null,
        longitude: v1Data.longitude || null
      }
    },
    
    // Features and amenities
    features: {
      amenities: v1Data.amenities || [],
      parking: v1Data.parking || '',
      petFriendly: v1Data.petFriendly || false,
      nonVegAllowed: v1Data.nonVegAllowed || false,
      waterSupply: v1Data.waterSupply || '',
      powerBackup: v1Data.powerBackup || '',
      gatedSecurity: v1Data.gatedSecurity || false,
      description: v1Data.description || '',
      propertyShowOption: v1Data.propertyShowOption || '',
      propertyCondition: v1Data.propertyCondition || '',
      hasGym: v1Data.hasGym || false,
      secondaryNumber: v1Data.secondaryNumber || '',
      hasSimilarUnits: v1Data.hasSimilarUnits || false,
      direction: v1Data.direction || ''
    },
    
    // Photos
    photos: {
      images: v1Data.images ? v1Data.images.map((img: any) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.type === 'primary' || false,
        displayOrder: 0
      })) : []
    }
  };
  
  // Add specialized sections based on property type
  
  // Coworking Space
  if (isCoworking) {
    v2Data.coworking = {
      rentPrice: v1Data.rentAmount ? parseFloat(v1Data.rentAmount) : null,
      securityDeposit: v1Data.securityDeposit ? parseFloat(v1Data.securityDeposit) : null,
      workstations: v1Data.workstations ? parseInt(v1Data.workstations) : null,
      availableFrom: v1Data.availableFrom || '',
      meetingRooms: v1Data.meetingRooms || false,
      conferenceRooms: v1Data.conferenceRooms || false,
      cabins: v1Data.cabins || false,
      receptionServices: v1Data.receptionServices || false,
      internetSpeed: v1Data.internetSpeed || '',
      workingHours: v1Data.workingHours || '',
      facilities: v1Data.coworkingFacilities || []
    };
  }
  // PG/Hostel
  else if (isPGHostel) {
    v2Data.pghostel = {
      rentAmount: v1Data.rentAmount ? parseFloat(v1Data.rentAmount) : null,
      securityDeposit: v1Data.securityDeposit ? parseFloat(v1Data.securityDeposit) : null,
      mealOption: v1Data.mealOption || '',
      roomType: v1Data.roomType || '',
      roomCapacity: v1Data.roomCapacity ? parseInt(v1Data.roomCapacity) : null,
      availableRooms: v1Data.availableRooms ? parseInt(v1Data.availableRooms) : null,
      totalRooms: v1Data.totalRooms ? parseInt(v1Data.totalRooms) : null,
      bathroomType: v1Data.bathroomType || '',
      gender: v1Data.genderPreference || '',
      availableFrom: v1Data.availableFrom || '',
      noticePeriod: v1Data.noticePeriod || '',
      rules: v1Data.houseRules || ''
    };
    
    // Extract room features 
    v2Data.pghostel.roomFeatures = {
      hasAC: v1Data.hasAC || false,
      hasFan: v1Data.hasFan || false,
      hasFurniture: v1Data.hasFurniture || false,
      hasTV: v1Data.hasTV || false,
      hasWifi: v1Data.hasWifi || false,
      hasGeyser: v1Data.hasGeyser || false
    };
  }
  // Flatmate
  else if (isFlatmate) {
    v2Data.flatmate = {
      rentAmount: v1Data.rentAmount ? parseFloat(v1Data.rentAmount) : null,
      securityDeposit: v1Data.securityDeposit ? parseFloat(v1Data.securityDeposit) : null,
      occupancy: v1Data.roomCapacity ? parseInt(v1Data.roomCapacity) : null,
      availableFrom: v1Data.availableFrom || '',
      gender: v1Data.genderPreference || '',
      preferredTenants: v1Data.preferredTenants || [],
      furnishingStatus: v1Data.furnishing || ''
    };
  }
  // Land
  else if (isLand) {
    v2Data.land = {
      expectedPrice: v1Data.expectedPrice ? parseFloat(v1Data.expectedPrice) : null,
      priceNegotiable: v1Data.priceNegotiable || false,
      landArea: v1Data.builtUpArea ? parseFloat(v1Data.builtUpArea) : null,
      landAreaUnit: v1Data.builtUpAreaUnit || 'sqft',
      landType: v1Data.landType || '',
      isApproved: v1Data.isApproved || false,
      availableFrom: v1Data.availableFrom || v1Data.possessionDate || ''
    };
  }
  // Sale Property
  else if (isSale) {
    v2Data.sale = {
      expectedPrice: v1Data.expectedPrice ? parseFloat(v1Data.expectedPrice) : null,
      maintenanceCost: v1Data.maintenanceCost ? parseFloat(v1Data.maintenanceCost) : null,
      priceNegotiable: v1Data.priceNegotiable || false,
      possessionDate: v1Data.possessionDate || v1Data.availableFrom || '',
      kitchenType: v1Data.kitchenType || ''
    };
  }
  // Regular Rental Property (default case)
  else {
    v2Data.rental = {
      rentAmount: v1Data.rentAmount ? parseFloat(v1Data.rentAmount) : null,
      securityDeposit: v1Data.securityDeposit ? parseFloat(v1Data.securityDeposit) : null,
      maintenanceCharges: v1Data.maintenance ? parseFloat(v1Data.maintenance) : null,
      rentNegotiable: v1Data.rentNegotiable || false,
      availableFrom: v1Data.availableFrom || '',
      preferredTenants: v1Data.preferredTenants || [],
      leaseDuration: v1Data.leaseDuration || '',
      furnishingStatus: v1Data.furnishing || ''
    };
  }
  
  return v2Data;
};

/**
 * Cleans a v2 data object by removing any attributes that aren't in their proper categories
 * and ensures specialized property types have the correct structure
 * @param v2Data Potentially mixed v2 data with incorrect structure
 * @returns Cleaned v2 data with correct structure
 */
export const cleanV2Structure = (v2Data: any): any => {
  if (!v2Data) return null;
  
  // Detect specialized property types
  const { 
    category, 
    listingType,
    isCoworking,
    isPGHostel,
    isFlatmate,
    isLand,
    isSale
  } = detectSpecializedPropertyType(v2Data);
  
  // Create a fresh, properly structured v2 object
  const cleanedData: any = {
    _version: DATA_VERSION_V2,
    
    // Extract ID and metadata - these are allowed at root level
    id: v2Data.id,
    owner_id: v2Data.owner_id,
    created_at: v2Data.created_at,
    updated_at: v2Data.updated_at,
    status: v2Data.status,
    
    // Initialize structured categories with correct flow
    flow: {
      category: category,
      listingType: listingType
    },
    
    basicDetails: {
      title: '', 
      propertyType: '',
      bhkType: '',
      floor: null,
      totalFloors: null,
      builtUpArea: null,
      builtUpAreaUnit: 'sqft',
      bathrooms: null,
      balconies: null,
      facing: '',
      propertyAge: ''
    },
    
    location: {
      address: '',
      flatPlotNo: '',
      landmark: '',
      locality: '',
      city: '',
      state: '',
      pinCode: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    },
    
    features: {
      amenities: [],
      parking: '',
      petFriendly: false,
      nonVegAllowed: false,
      waterSupply: '',
      powerBackup: '',
      gatedSecurity: false,
      description: '',
      propertyShowOption: '',
      propertyCondition: '',
      hasGym: false,
      secondaryNumber: '',
      hasSimilarUnits: false,
      direction: ''
    },
    
    photos: {
      images: []
    }
  };
  
  // Add the appropriate specialized section based on property type
  
  // Coworking Space
  if (isCoworking) {
    cleanedData.coworking = {
      rentPrice: null,
      securityDeposit: null,
      workstations: null,
      availableFrom: '',
      meetingRooms: false,
      conferenceRooms: false,
      cabins: false,
      receptionServices: false,
      internetSpeed: '',
      workingHours: '',
      facilities: []
    };
    
    // Copy existing coworking data if available
    if (v2Data.coworking) {
      Object.assign(cleanedData.coworking, v2Data.coworking);
    } 
    // If coworking data was incorrectly stored in rental, migrate it
    else if (v2Data.rental) {
      cleanedData.coworking.rentPrice = v2Data.rental.rentAmount;
      cleanedData.coworking.securityDeposit = v2Data.rental.securityDeposit;
      cleanedData.coworking.availableFrom = v2Data.rental.availableFrom;
    }
    
    // Ensure any root-level coworking fields are moved to the proper section
    const coworkingFields = [
      'rentPrice', 'securityDeposit', 'workstations', 'availableFrom',
      'meetingRooms', 'conferenceRooms', 'cabins', 'receptionServices',
      'internetSpeed', 'workingHours', 'facilities'
    ];
    
    coworkingFields.forEach(field => {
      if (v2Data[field] !== undefined) {
        cleanedData.coworking[field] = v2Data[field];
      }
    });
    
    // Remove rental section if it exists
    if (cleanedData.rental) {
      delete cleanedData.rental;
    }
  }
  // PG/Hostel
  else if (isPGHostel) {
    cleanedData.pghostel = {
      rentAmount: null,
      securityDeposit: null,
      mealOption: '',
      roomType: '',
      roomCapacity: null,
      availableRooms: null,
      totalRooms: null,
      bathroomType: '',
      gender: '',
      availableFrom: '',
      noticePeriod: '',
      rules: '',
      roomFeatures: {
        hasAC: false,
        hasFan: false,
        hasFurniture: false,
        hasTV: false,
        hasWifi: false,
        hasGeyser: false
      }
    };
    
    // Copy existing PG/Hostel data if available
    if (v2Data.pghostel) {
      Object.assign(cleanedData.pghostel, v2Data.pghostel);
      
      // Ensure room features is properly structured
      if (v2Data.pghostel.roomFeatures) {
        Object.assign(cleanedData.pghostel.roomFeatures, v2Data.pghostel.roomFeatures);
      }
    } 
    // If PG data was incorrectly stored in rental, migrate it
    else if (v2Data.rental) {
      cleanedData.pghostel.rentAmount = v2Data.rental.rentAmount;
      cleanedData.pghostel.securityDeposit = v2Data.rental.securityDeposit;
      cleanedData.pghostel.availableFrom = v2Data.rental.availableFrom;
    }
    
    // Migrate room feature fields if they're at root level
    const roomFeatureFields = ['hasAC', 'hasFan', 'hasFurniture', 'hasTV', 'hasWifi', 'hasGeyser'];
    roomFeatureFields.forEach(field => {
      if (v2Data[field] !== undefined) {
        cleanedData.pghostel.roomFeatures[field] = v2Data[field];
      }
    });
    
    // Ensure any root-level PG/Hostel fields are moved to the proper section
    const pgHostelFields = [
      'rentAmount', 'securityDeposit', 'mealOption', 'roomType', 'roomCapacity',
      'availableRooms', 'totalRooms', 'bathroomType', 'gender', 'availableFrom',
      'noticePeriod', 'rules', 'genderPreference'
    ];
    
    pgHostelFields.forEach(field => {
      if (v2Data[field] !== undefined) {
        // Special case for gender preference field name
        if (field === 'genderPreference') {
          cleanedData.pghostel.gender = v2Data[field];
        } else {
          cleanedData.pghostel[field] = v2Data[field];
        }
      }
    });
    
    // Remove rental section if it exists
    if (cleanedData.rental) {
      delete cleanedData.rental;
    }
  }
  // Flatmate
  else if (isFlatmate) {
    cleanedData.flatmate = {
      rentAmount: null,
      securityDeposit: null,
      occupancy: null,
      availableFrom: '',
      gender: '',
      preferredTenants: [],
      furnishingStatus: ''
    };
    
    // Copy existing Flatmate data if available
    if (v2Data.flatmate) {
      Object.assign(cleanedData.flatmate, v2Data.flatmate);
    } 
    // If Flatmate data was incorrectly stored in rental, migrate it
    else if (v2Data.rental) {
      cleanedData.flatmate.rentAmount = v2Data.rental.rentAmount;
      cleanedData.flatmate.securityDeposit = v2Data.rental.securityDeposit;
      cleanedData.flatmate.availableFrom = v2Data.rental.availableFrom;
      cleanedData.flatmate.preferredTenants = v2Data.rental.preferredTenants;
      cleanedData.flatmate.furnishingStatus = v2Data.rental.furnishingStatus;
    }
    
    // Ensure any root-level Flatmate fields are moved to the proper section
    const flatmateFields = [
      'rentAmount', 'securityDeposit', 'occupancy', 'availableFrom',
      'gender', 'preferredTenants', 'furnishingStatus', 'genderPreference'
    ];
    
    flatmateFields.forEach(field => {
      if (v2Data[field] !== undefined) {
        // Special case for gender preference field name
        if (field === 'genderPreference') {
          cleanedData.flatmate.gender = v2Data[field];
        } else {
          cleanedData.flatmate[field] = v2Data[field];
        }
      }
    });
    
    // Remove rental section if it exists
    if (cleanedData.rental) {
      delete cleanedData.rental;
    }
  }
  // Land
  else if (isLand) {
    cleanedData.land = {
      expectedPrice: null,
      priceNegotiable: false,
      landArea: null,
      landAreaUnit: 'sqft',
      landType: '',
      isApproved: false,
      availableFrom: ''
    };
    
    // Copy existing Land data if available
    if (v2Data.land) {
      Object.assign(cleanedData.land, v2Data.land);
    } 
    // If Land data was incorrectly stored in sale, migrate it
    else if (v2Data.sale) {
      cleanedData.land.expectedPrice = v2Data.sale.expectedPrice;
      cleanedData.land.priceNegotiable = v2Data.sale.priceNegotiable;
      cleanedData.land.availableFrom = v2Data.sale.possessionDate;
    }
    
    // Ensure any root-level Land fields are moved to the proper section
    const landFields = [
      'expectedPrice', 'priceNegotiable', 'landArea', 'landAreaUnit',
      'landType', 'isApproved', 'availableFrom'
    ];
    
    landFields.forEach(field => {
      if (v2Data[field] !== undefined) {
        cleanedData.land[field] = v2Data[field];
      }
    });
    
    // Land size might be stored in builtUpArea in basic details
    if (v2Data.basicDetails && v2Data.basicDetails.builtUpArea && !cleanedData.land.landArea) {
      cleanedData.land.landArea = v2Data.basicDetails.builtUpArea;
      cleanedData.land.landAreaUnit = v2Data.basicDetails.builtUpAreaUnit || 'sqft';
    }
    
    // Remove sale section if it exists
    if (cleanedData.sale) {
      delete cleanedData.sale;
    }
  }
  // Sale Property
  else if (isSale) {
    cleanedData.sale = {
      expectedPrice: null,
      maintenanceCost: null,
      priceNegotiable: false,
      possessionDate: '',
      kitchenType: ''
    };
    
    // Copy existing Sale data if available
    if (v2Data.sale) {
      Object.assign(cleanedData.sale, v2Data.sale);
    }
    
    // Ensure any root-level Sale fields are moved to the proper section
    const saleFields = [
      'expectedPrice', 'maintenanceCost', 'priceNegotiable', 'possessionDate', 'kitchenType'
    ];
    
    saleFields.forEach(field => {
      if (v2Data[field] !== undefined) {
        if (field === 'expectedPrice' || field === 'maintenanceCost') {
          // Convert to number if a string
          if (typeof v2Data[field] === 'string') {
            cleanedData.sale[field] = parseFloat(v2Data[field]) || null;
          } else {
            cleanedData.sale[field] = v2Data[field];
          }
        } else {
          cleanedData.sale[field] = v2Data[field];
        }
      }
    });
    
    // Special case for possessionDate - could be called availableFrom
    if (v2Data.availableFrom && !cleanedData.sale.possessionDate) {
      cleanedData.sale.possessionDate = v2Data.availableFrom;
    }
    
    // Remove rental section if it exists
    if (cleanedData.rental) {
      delete cleanedData.rental;
    }
  } 
  // Regular Rental Property (default case)
  else {
    cleanedData.rental = {
      rentAmount: null,
      securityDeposit: null,
      maintenanceCharges: null,
      rentNegotiable: false,
      availableFrom: '',
      preferredTenants: [],
      leaseDuration: '',
      furnishingStatus: ''
    };
    
    // Copy existing Rental data if available
    if (v2Data.rental) {
      Object.assign(cleanedData.rental, v2Data.rental);
    }
    
    // Ensure any root-level Rental fields are moved to the proper section
    const rentalFields = [
      'rentAmount', 'securityDeposit', 'maintenanceCharges', 'maintenance', 
      'rentNegotiable', 'availableFrom', 'preferredTenants', 'leaseDuration', 
      'furnishingStatus', 'furnishing', 'rentalType'
    ];
    
    rentalFields.forEach(field => {
      if (v2Data[field] !== undefined) {
        if (field === 'rentAmount' || field === 'securityDeposit') {
          // Convert to number if a string
          if (typeof v2Data[field] === 'string') {
            cleanedData.rental[field] = parseFloat(v2Data[field]) || null;
          } else {
            cleanedData.rental[field] = v2Data[field];
          }
        } else if (field === 'maintenance') {
          // Map maintenance to maintenanceCharges
          if (typeof v2Data[field] === 'string') {
            cleanedData.rental.maintenanceCharges = parseFloat(v2Data[field]) || null;
          } else {
            cleanedData.rental.maintenanceCharges = v2Data[field];
          }
        } else if (field === 'furnishing') {
          // Map furnishing to furnishingStatus
          cleanedData.rental.furnishingStatus = v2Data[field];
        } else {
          cleanedData.rental[field] = v2Data[field];
        }
      }
    });
    
    // Remove any specialized sections that shouldn't exist for regular rental
    if (cleanedData.sale) delete cleanedData.sale;
    if (cleanedData.coworking) delete cleanedData.coworking;
    if (cleanedData.pghostel) delete cleanedData.pghostel;
    if (cleanedData.flatmate) delete cleanedData.flatmate;
    if (cleanedData.land) delete cleanedData.land;
  }
  
  // Basic Details section
  if (v2Data.basicDetails) {
    Object.assign(cleanedData.basicDetails, v2Data.basicDetails);
  }
  
  // Check for basic details at root level and move to proper section
  const basicDetailsFields = [
    'title', 'propertyType', 'bhkType', 'floor', 'totalFloors', 'builtUpArea', 
    'builtUpAreaUnit', 'bathrooms', 'balconies', 'facing', 'propertyAge',
    'ageOfProperty', 'property_age', 'propertyAgeSelect', 'ageSelect'
  ];
  
  basicDetailsFields.forEach(field => {
    if (v2Data[field] !== undefined) {
      // Handle special cases for property age fields
      if (['propertyAge', 'ageOfProperty', 'property_age', 'propertyAgeSelect', 'ageSelect'].includes(field)) {
        cleanedData.basicDetails.propertyAge = v2Data[field];
      } else if (field === 'floor' || field === 'totalFloors') {
        // Convert to numbers if they are strings
        if (typeof v2Data[field] === 'string') {
          cleanedData.basicDetails[field] = parseInt(v2Data[field]) || null;
        } else {
          cleanedData.basicDetails[field] = v2Data[field];
        }
      } else if (field === 'builtUpArea') {
        // Convert to number if it's a string
        if (typeof v2Data[field] === 'string') {
          cleanedData.basicDetails[field] = parseFloat(v2Data[field]) || null;
        } else {
          cleanedData.basicDetails[field] = v2Data[field];
        }
      } else {
        cleanedData.basicDetails[field] = v2Data[field];
      }
    }
  });
  
  // Location section
  if (v2Data.location) {
    Object.assign(cleanedData.location, v2Data.location);
    
    // Ensure coordinates object exists
    if (!cleanedData.location.coordinates) {
      cleanedData.location.coordinates = { latitude: null, longitude: null };
    }
    
    // If coordinates exist at root, copy them to location
    if (v2Data.latitude !== undefined) {
      cleanedData.location.coordinates.latitude = v2Data.latitude;
    }
    if (v2Data.longitude !== undefined) {
      cleanedData.location.coordinates.longitude = v2Data.longitude;
    }
  }
  
  // Check for location fields at root level
  const locationFields = [
    'address', 'flatPlotNo', 'landmark', 'locality', 'city', 'state', 'pinCode', 'district', 'area'
  ];
  
  locationFields.forEach(field => {
    if (v2Data[field] !== undefined) {
      cleanedData.location[field] = v2Data[field];
    }
  });
  
  // Features section
  if (v2Data.features) {
    Object.assign(cleanedData.features, v2Data.features);
  }
  
  // Check for feature fields at root level
  const featureFields = [
    'parking', 'petFriendly', 'nonVegAllowed', 'waterSupply', 'powerBackup', 
    'gatedSecurity', 'description', 'propertyShowOption', 'propertyCondition',
    'hasGym', 'secondaryNumber', 'hasSimilarUnits', 'direction', 'furnishing'
  ];
  
  featureFields.forEach(field => {
    if (v2Data[field] !== undefined) {
      // Special case for furnishing - it goes to the appropriate section
      if (field === 'furnishing') {
        if (isCoworking) {
          // Not relevant for coworking
        } else if (isPGHostel) {
          // Not directly applicable to PG
        } else if (isFlatmate) {
          cleanedData.flatmate.furnishingStatus = v2Data[field];
        } else if (isLand) {
          // Not applicable to land
        } else if (isSale) {
          // Not typically stored but can include
          cleanedData.features[field] = v2Data[field]; 
        } else {
          // Regular rental
          cleanedData.rental.furnishingStatus = v2Data[field];
        }
      } else {
        cleanedData.features[field] = v2Data[field];
      }
    }
  });
  
  // Amenities handling - might be at root level or as numbered properties
  if (v2Data.amenities) {
    cleanedData.features.amenities = v2Data.amenities;
  } else {
    // Look for numbered properties that might be amenities
    const possibleAmenities: string[] = [];
    for (let i = 0; i < 20; i++) {
      if (typeof v2Data[i] === 'string') {
        possibleAmenities.push(v2Data[i]);
      }
    }
    if (possibleAmenities.length > 0) {
      cleanedData.features.amenities = possibleAmenities;
    }
  }
  
  // Photos section
  if (v2Data.photos && v2Data.photos.images) {
    cleanedData.photos.images = v2Data.photos.images;
  } else if (v2Data.images) {
    cleanedData.photos.images = v2Data.images.map((img: any) => ({
      id: img.id,
      url: img.url,
      isPrimary: img.type === 'primary' || img.is_primary || false,
      displayOrder: img.display_order || 0
    }));
  }
  
  return cleanedData;
};

/**
 * Converts property data from v2 to v1 format
 * @param v2Data Property data in v2 format
 * @returns Property data in v1 format
 */
export const convertV2ToV1 = (v2Data: any): any => {
  if (!v2Data) return null;
  
  // Clean the V2 data first to ensure proper structure
  const cleanedV2 = cleanV2Structure(v2Data);
  
  // Start with the basic v1 structure
  const v1Data: any = {
    _version: DATA_VERSION_V1,
    
    // ID and metadata
    id: cleanedV2.id,
    owner_id: cleanedV2.owner_id,
    created_at: cleanedV2.created_at,
    updated_at: cleanedV2.updated_at,
    status: cleanedV2.status,
    
    // Categorization
    propertyCategory: cleanedV2.flow?.category || "residential",
    listingType: cleanedV2.flow?.listingType || "rent",
    isSaleProperty: cleanedV2.flow?.listingType === "sale",
    propertyPriceType: cleanedV2.flow?.listingType === "sale" ? "sale" : "rental",
    
    // Flow tracking for URL paths
    flow_property_type: cleanedV2.flow?.category,
    flow_listing_type: cleanedV2.flow?.listingType,
    
    // Basic Details
    title: cleanedV2.basicDetails?.title || '',
    propertyType: cleanedV2.basicDetails?.propertyType || '',
    bhkType: cleanedV2.basicDetails?.bhkType || '',
    floor: cleanedV2.basicDetails?.floor?.toString() || "",
    totalFloors: cleanedV2.basicDetails?.totalFloors?.toString() || "",
    builtUpArea: cleanedV2.basicDetails?.builtUpArea?.toString() || "",
    builtUpAreaUnit: cleanedV2.basicDetails?.builtUpAreaUnit || "sqft",
    bathrooms: cleanedV2.basicDetails?.bathrooms?.toString() || "",
    balconies: cleanedV2.basicDetails?.balconies?.toString() || "",
    facing: cleanedV2.basicDetails?.facing || '',
    propertyAge: cleanedV2.basicDetails?.propertyAge || '',
    
    // Location
    address: cleanedV2.location?.address || '',
    flatPlotNo: cleanedV2.location?.flatPlotNo || '',
    landmark: cleanedV2.location?.landmark || '',
    locality: cleanedV2.location?.locality || '',
    city: cleanedV2.location?.city || '',
    state: cleanedV2.location?.state || '',
    pinCode: cleanedV2.location?.pinCode || '',
    latitude: cleanedV2.location?.coordinates?.latitude,
    longitude: cleanedV2.location?.coordinates?.longitude,
    
    // Features
    description: cleanedV2.features?.description || '',
    amenities: cleanedV2.features?.amenities || [],
    parking: cleanedV2.features?.parking || '',
    nonVegAllowed: cleanedV2.features?.nonVegAllowed || false,
    gatedSecurity: cleanedV2.features?.gatedSecurity || false,
    hasGym: cleanedV2.features?.hasGym || false,
    propertyShowOption: cleanedV2.features?.propertyShowOption || '',
    propertyCondition: cleanedV2.features?.propertyCondition || '',
    secondaryNumber: cleanedV2.features?.secondaryNumber || '',
    hasSimilarUnits: cleanedV2.features?.hasSimilarUnits || false,
    direction: cleanedV2.features?.direction || '',
    
    // Images
    images: cleanedV2.photos?.images?.map((img: any) => ({
      id: img.id,
      url: img.url,
      type: img.isPrimary ? 'primary' : 'additional'
    })) || []
  };
  
  // Handle specialized property types
  const listingType = cleanedV2.flow?.listingType || '';
  
  // Coworking Space
  if (listingType === 'coworking' && cleanedV2.coworking) {
    v1Data.commercialPropertyType = 'coworking';
    v1Data.rentAmount = cleanedV2.coworking.rentPrice?.toString() || "";
    v1Data.securityDeposit = cleanedV2.coworking.securityDeposit?.toString() || "";
    v1Data.workstations = cleanedV2.coworking.workstations?.toString() || "";
    v1Data.availableFrom = cleanedV2.coworking.availableFrom || '';
    v1Data.meetingRooms = cleanedV2.coworking.meetingRooms || false;
    v1Data.conferenceRooms = cleanedV2.coworking.conferenceRooms || false;
    v1Data.cabins = cleanedV2.coworking.cabins || false;
    v1Data.receptionServices = cleanedV2.coworking.receptionServices || false;
    v1Data.internetSpeed = cleanedV2.coworking.internetSpeed || '';
    v1Data.workingHours = cleanedV2.coworking.workingHours || '';
    v1Data.coworkingFacilities = cleanedV2.coworking.facilities || [];
  }
  // PG/Hostel
  else if (listingType === 'pghostel' && cleanedV2.pghostel) {
    v1Data.rentAmount = cleanedV2.pghostel.rentAmount?.toString() || "";
    v1Data.securityDeposit = cleanedV2.pghostel.securityDeposit?.toString() || "";
    v1Data.mealOption = cleanedV2.pghostel.mealOption || '';
    v1Data.roomType = cleanedV2.pghostel.roomType || '';
    v1Data.roomCapacity = cleanedV2.pghostel.roomCapacity?.toString() || "";
    v1Data.availableRooms = cleanedV2.pghostel.availableRooms?.toString() || "";
    v1Data.totalRooms = cleanedV2.pghostel.totalRooms?.toString() || "";
    v1Data.bathroomType = cleanedV2.pghostel.bathroomType || '';
    v1Data.genderPreference = cleanedV2.pghostel.gender || '';
    v1Data.availableFrom = cleanedV2.pghostel.availableFrom || '';
    v1Data.noticePeriod = cleanedV2.pghostel.noticePeriod || '';
    v1Data.houseRules = cleanedV2.pghostel.rules || '';
    
    // Room features
    if (cleanedV2.pghostel.roomFeatures) {
      v1Data.hasAC = cleanedV2.pghostel.roomFeatures.hasAC || false;
      v1Data.hasFan = cleanedV2.pghostel.roomFeatures.hasFan || false;
      v1Data.hasFurniture = cleanedV2.pghostel.roomFeatures.hasFurniture || false;
      v1Data.hasTV = cleanedV2.pghostel.roomFeatures.hasTV || false;
      v1Data.hasWifi = cleanedV2.pghostel.roomFeatures.hasWifi || false;
      v1Data.hasGeyser = cleanedV2.pghostel.roomFeatures.hasGeyser || false;
    }
  }
  // Flatmate
  else if (listingType === 'flatmates' && cleanedV2.flatmate) {
    v1Data.rentAmount = cleanedV2.flatmate.rentAmount?.toString() || "";
    v1Data.securityDeposit = cleanedV2.flatmate.securityDeposit?.toString() || "";
    v1Data.roomCapacity = cleanedV2.flatmate.occupancy?.toString() || "";
    v1Data.availableFrom = cleanedV2.flatmate.availableFrom || '';
    v1Data.genderPreference = cleanedV2.flatmate.gender || '';
    v1Data.preferredTenants = cleanedV2.flatmate.preferredTenants || [];
    v1Data.furnishing = cleanedV2.flatmate.furnishingStatus || '';
  }
  // Land
  else if (listingType === 'land' && cleanedV2.land) {
    v1Data.expectedPrice = cleanedV2.land.expectedPrice?.toString() || "";
    v1Data.priceNegotiable = cleanedV2.land.priceNegotiable || false;
    v1Data.builtUpArea = cleanedV2.land.landArea?.toString() || cleanedV2.basicDetails?.builtUpArea?.toString() || "";
    v1Data.builtUpAreaUnit = cleanedV2.land.landAreaUnit || cleanedV2.basicDetails?.builtUpAreaUnit || "sqft";
    v1Data.landType = cleanedV2.land.landType || '';
    v1Data.isApproved = cleanedV2.land.isApproved || false;
    v1Data.possessionDate = cleanedV2.land.availableFrom || '';
  }
  // Regular Sale
  else if (listingType === 'sale' && cleanedV2.sale) {
    v1Data.expectedPrice = cleanedV2.sale.expectedPrice?.toString() || "";
    v1Data.maintenanceCost = cleanedV2.sale.maintenanceCost?.toString() || "";
    v1Data.priceNegotiable = cleanedV2.sale.priceNegotiable || false;
    v1Data.possessionDate = cleanedV2.sale.possessionDate || '';
    v1Data.kitchenType = cleanedV2.sale.kitchenType || '';
  }
  // Regular Rental
  else if (cleanedV2.rental) {
    v1Data.rentalType = "rent";
    v1Data.rentAmount = cleanedV2.rental.rentAmount?.toString() || "";
    v1Data.securityDeposit = cleanedV2.rental.securityDeposit?.toString() || "";
    v1Data.rentNegotiable = cleanedV2.rental.rentNegotiable || false;
    v1Data.maintenance = cleanedV2.rental.maintenanceCharges?.toString() || "";
    v1Data.availableFrom = cleanedV2.rental.availableFrom || '';
    v1Data.preferredTenants = cleanedV2.rental.preferredTenants || [];
    v1Data.furnishing = cleanedV2.rental.furnishingStatus || '';
  }
  
  return v1Data;
};

/**
 * Creates a new property data object in the current version format
 * @param propertyType Optional property type (residential, commercial, land)
 * @param listingType Optional listing type (rent, sale, coworking, pghostel, flatmates)
 * @returns Empty property data object in current version format
 */
export const createNewPropertyData = (propertyType = 'residential', listingType = 'rent') => {
  if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
    // Base structure for V2
    const baseV2Data = {
      _version: DATA_VERSION_V2,
      flow: {
        category: propertyType as "residential" | "commercial" | "land",
        listingType: listingType
      },
      basicDetails: {
        title: "",
        propertyType: "",
        bhkType: "",
        floor: null,
        totalFloors: null,
        builtUpArea: null,
        builtUpAreaUnit: "sqft",
        bathrooms: null,
        balconies: null,
        facing: "",
        propertyAge: ""
      },
      location: {
        address: "",
        flatPlotNo: "",
        landmark: "",
        locality: "",
        city: "",
        state: "",
        pinCode: "",
        coordinates: {
          latitude: null,
          longitude: null
        }
      },
      features: {
        amenities: [],
        parking: "",
        petFriendly: false,
        nonVegAllowed: false,
        waterSupply: "",
        powerBackup: "",
        gatedSecurity: false,
        description: "",
        propertyShowOption: "",
        propertyCondition: "",
        hasGym: false,
        secondaryNumber: "",
        hasSimilarUnits: false,
        direction: ""
      },
      photos: {
        images: []
      }
    };
    
    // Add the appropriate specialized section based on listing type
    if (listingType === 'sale') {
      return {
        ...baseV2Data,
        sale: {
          expectedPrice: null,
          maintenanceCost: null,
          priceNegotiable: false,
          possessionDate: "",
          kitchenType: ""
        }
      };
    } else if (listingType === 'coworking') {
      return {
        ...baseV2Data,
        coworking: {
          rentPrice: null,
          securityDeposit: null,
          workstations: null,
          availableFrom: "",
          meetingRooms: false,
          conferenceRooms: false,
          cabins: false,
          receptionServices: false,
          internetSpeed: "",
          workingHours: "",
          facilities: []
        }
      };
    } else if (listingType === 'pghostel') {
      return {
        ...baseV2Data,
        pghostel: {
          rentAmount: null,
          securityDeposit: null,
          mealOption: "",
          roomType: "",
          roomCapacity: null,
          availableRooms: null,
          totalRooms: null,
          bathroomType: "",
          gender: "",
          availableFrom: "",
          noticePeriod: "",
          rules: "",
          roomFeatures: {
            hasAC: false,
            hasFan: false,
            hasFurniture: false,
            hasTV: false,
            hasWifi: false,
            hasGeyser: false
          }
        }
      };
    } else if (listingType === 'flatmates') {
      return {
        ...baseV2Data,
        flatmate: {
          rentAmount: null,
          securityDeposit: null,
          occupancy: null,
          availableFrom: "",
          gender: "",
          preferredTenants: [],
          furnishingStatus: ""
        }
      };
    } else if (propertyType === 'land') {
      return {
        ...baseV2Data,
        land: {
          expectedPrice: null,
          priceNegotiable: false,
          landArea: null,
          landAreaUnit: "sqft",
          landType: "",
          isApproved: false,
          availableFrom: ""
        }
      };
    } else {
      // Default to rental
      return {
        ...baseV2Data,
        rental: {
          rentAmount: null,
          securityDeposit: null,
          maintenanceCharges: null,
          rentNegotiable: false,
          availableFrom: "",
          preferredTenants: [],
          leaseDuration: "",
          furnishingStatus: ""
        }
      };
    }
  } else {
    // For V1 data structure
    return {
      _version: DATA_VERSION_V1,
      propertyCategory: propertyType || "residential",
      listingType: listingType || "rent",
      isSaleProperty: listingType === 'sale',
      propertyPriceType: listingType === 'sale' ? "sale" : "rental",
      title: "",
      propertyType: "",
      bhkType: "",
      floor: "",
      totalFloors: "",
      builtUpArea: "",
      builtUpAreaUnit: "sqft",
      address: "",
      flatPlotNo: "",
      landmark: "",
      locality: "",
      city: "",
      state: "",
      pinCode: "",
      description: "",
      amenities: [],
      bathrooms: "",
      balconies: "",
      gatedSecurity: false,
      nonVegAllowed: false,
      images: []
    };
  }
};