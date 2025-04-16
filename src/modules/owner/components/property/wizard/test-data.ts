// src/modules/owner/components/property/wizard/test-data.ts
// Version: 2.0.0
// Last Modified: 16-04-2025 15:30 IST
// Purpose: Added version-aware auto-fill support for v2 data structure

import { 
  DATA_VERSION_V1, 
  DATA_VERSION_V2, 
  CURRENT_DATA_VERSION,
  cleanV2Structure 
} from './utils/propertyDataAdapter';

// Sample test data for property form
export const TEST_DATA = {
  // Basic property information
  title: "Modern 2BHK Apartment in Indiranagar",
  propertyType: "Apartment",
  bhkType: "2 BHK",
  floor: "3",
  totalFloors: "10",
  propertyAge: "10+ years",
  ageOfProperty: "10+ years",
  property_age: "10+ years",
  propertyAgeSelect: "10+ years",
  ageSelect: "1 - 3 years",
  propertyAgeValue: "1 - 3 years",
  facing: "East",
  builtUpArea: "1200",
  builtUpAreaUnit: "sqft",
  
  // Location details
  address: "42, 5th Cross, 12th Main",
  flatPlotNo: "414",
  landmark: "Near ESI Hospital",
  locality: "Indiranagar",
  area: "Indiranagar 1st Stage",
  city: "Bangalore",
  district: "Bangalore Urban",
  state: "Karnataka",
  pinCode: "560038",
  latitude: 12.9784,
  longitude: 77.6408,
  
  // Rental details
  rentalType: "rent",
  rentAmount: "25000",
  securityDeposit: "50000",
  rentNegotiable: true,
  maintenance: "2000",
  availableFrom: "2025-04-16",
  possessionDate: "2025-04-16",
  preferredTenants: ["Family", "Working Professionals"],
  
  // Features
  furnishing: "Semi-Furnished",
  parking: "Car & Bike",
  hasGym: true,
  nonVegAllowed: true,
  gatedSecurity: true,
  propertyShowOption: "Any Time",
  propertyCondition: "Good",
  secondaryNumber: "9876543210",
  hasSimilarUnits: false,
  direction: "North-East",
  
  // Description
  description: "Well-maintained 2BHK apartment with modern amenities and excellent connectivity to tech parks. Spacious rooms with good ventilation and natural light. Located in a premium residential complex with 24/7 security.",
  
  // Amenities
  amenities: [
    "Power Backup", 
    "Lift", 
    "24x7 Water Supply", 
    "Security", 
    "Park", 
    "Gym", 
    "Swimming Pool", 
    "Internet/Broadband", 
    "Clubhouse", 
    "Indoor Games", 
    "Visitor Parking", 
    "Rainwater Harvesting"
  ]
};

// Extra fields for sale properties
export const SALE_EXTRA_FIELDS = {
  expectedPrice: "7500000",
  maintenanceCost: "3500",
  priceNegotiable: true,
  kitchenType: "Modular",
  possessionDate: "2025-05-01"
};

/**
 * Auto-fills the property form with test data according to current version format
 * @param form The form to autofill
 * @param propertyType The property type ('residential', 'commercial', or 'land')
 * @param adType The ad type ('rent', 'sale', etc.)
 */
export const autoFillAllSections = (form: any, propertyType: string, adType: string) => {
  console.log(`Auto-filling form for ${propertyType} - ${adType} with ${CURRENT_DATA_VERSION} structure`);
  
  // Clear the form first
  form.reset({});
  
  const isSaleProperty = adType?.toLowerCase() === 'sale';
  
  if (CURRENT_DATA_VERSION === DATA_VERSION_V2) {
    // Create V2 structure according to the data
    const v2Data = {
      _version: DATA_VERSION_V2,
      
      // Flow information
      flow: {
        category: propertyType?.toLowerCase() || 'residential',
        listingType: adType?.toLowerCase() || 'rent'
      },
      
      // Basic details
      basicDetails: {
        title: TEST_DATA.title,
        propertyType: TEST_DATA.propertyType,
        bhkType: TEST_DATA.bhkType,
        floor: parseInt(TEST_DATA.floor),
        totalFloors: parseInt(TEST_DATA.totalFloors),
        builtUpArea: parseFloat(TEST_DATA.builtUpArea),
        builtUpAreaUnit: TEST_DATA.builtUpAreaUnit,
        bathrooms: 2,
        balconies: 1,
        facing: TEST_DATA.facing,
        propertyAge: TEST_DATA.propertyAge
      },
      
      // Location
      location: {
        address: TEST_DATA.address,
        flatPlotNo: TEST_DATA.flatPlotNo,
        landmark: TEST_DATA.landmark,
        locality: TEST_DATA.locality,
        city: TEST_DATA.city,
        state: TEST_DATA.state,
        pinCode: TEST_DATA.pinCode,
        coordinates: {
          latitude: TEST_DATA.latitude,
          longitude: TEST_DATA.longitude
        }
      },
      
      // Features
      features: {
        amenities: TEST_DATA.amenities,
        parking: TEST_DATA.parking,
        petFriendly: TEST_DATA.nonVegAllowed,
        nonVegAllowed: TEST_DATA.nonVegAllowed,
        waterSupply: "24 Hours",
        powerBackup: "Full",
        gatedSecurity: TEST_DATA.gatedSecurity,
        description: TEST_DATA.description,
        propertyShowOption: TEST_DATA.propertyShowOption,
        propertyCondition: TEST_DATA.propertyCondition,
        hasGym: TEST_DATA.hasGym,
        secondaryNumber: TEST_DATA.secondaryNumber,
        hasSimilarUnits: TEST_DATA.hasSimilarUnits,
        direction: TEST_DATA.direction
      },
      
      // Photos
      photos: {
        images: []
      }
    };
    
    // Add rental or sale section based on property type
    if (isSaleProperty) {
      v2Data.sale = {
        expectedPrice: parseFloat(SALE_EXTRA_FIELDS.expectedPrice),
        maintenanceCost: parseFloat(SALE_EXTRA_FIELDS.maintenanceCost),
        priceNegotiable: SALE_EXTRA_FIELDS.priceNegotiable,
        possessionDate: SALE_EXTRA_FIELDS.possessionDate,
        kitchenType: SALE_EXTRA_FIELDS.kitchenType
      };
    } else {
      v2Data.rental = {
        rentAmount: parseFloat(TEST_DATA.rentAmount),
        securityDeposit: parseFloat(TEST_DATA.securityDeposit),
        maintenanceCharges: parseFloat(TEST_DATA.maintenance),
        rentNegotiable: TEST_DATA.rentNegotiable,
        availableFrom: TEST_DATA.availableFrom,
        preferredTenants: TEST_DATA.preferredTenants,
        leaseDuration: "11 months",
        furnishingStatus: TEST_DATA.furnishing
      };
    }
    
    // Clean the structure before setting form values
    const cleanedData = cleanV2Structure(v2Data);
    
    // Set the form values with the structured v2 data
    form.reset(cleanedData);
  } else {
    // V1 format - flat structure
    const v1Data = {
      _version: DATA_VERSION_V1,
      
      // Set categorization
      propertyCategory: propertyType?.toLowerCase() || 'residential',
      listingType: adType?.toLowerCase() || 'rent',
      isSaleProperty: isSaleProperty,
      propertyPriceType: isSaleProperty ? 'sale' : 'rental',
      
      // Flow tracking fields
      flow_property_type: propertyType?.toLowerCase() || 'residential',
      flow_listing_type: adType?.toLowerCase() || 'rent',
      
      // Copy all test data fields
      ...TEST_DATA,
      
      // Add sale-specific fields if needed
      ...(isSaleProperty ? SALE_EXTRA_FIELDS : {})
    };
    
    // Set the form values with the flat v1 structure
    form.reset(v1Data);
  }
  
  console.log("Form auto-filled successfully");
};