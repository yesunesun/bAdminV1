// src/modules/owner/components/property/wizard/test-data.ts
// Version: 2.3.0
// Last Modified: 14-04-2025 20:30 IST
// Purpose: Add comprehensive debugging to identify property age field name

import { UseFormReturn } from 'react-hook-form';
import { FormData } from './types';
import { PROPERTY_AGE } from './constants/propertyDetails';

// Demo data for testing form sections
export const TEST_DATA = {
  // Property Selection Fields
  selection: {
    propertyCategory: 'residential',
    listingType: 'rent',
    location: 'Bangalore',
    flow_property_type: 'apartment',
    flow_listing_type: 'rent',
  },
  
  // Basic property details
  basic: {
    title: 'Modern 2BHK Apartment in Indiranagar',
    propertyType: 'Apartment',
    bhkType: '2 BHK',
    floor: '3',
    totalFloors: '10',
    // Try all possible variations of the property age field
    propertyAge: PROPERTY_AGE[1], // '1 - 3 years'
    age: PROPERTY_AGE[1],
    property_age: PROPERTY_AGE[1],
    ageOfProperty: PROPERTY_AGE[1],
    propertyAgeSelect: PROPERTY_AGE[1],
    ageSelect: PROPERTY_AGE[1],
    propertyAgeValue: PROPERTY_AGE[1],
    facing: 'East',
    builtUpArea: '1200',
    builtUpAreaUnit: 'sqft',
    possessionDate: new Date().toISOString().split('T')[0],
    description: 'Well-maintained 2BHK apartment with modern amenities and excellent connectivity to tech parks. Spacious rooms with good ventilation and natural light. Located in a premium residential complex with 24/7 security.',
  },
  
  // Location details
  location: {
    address: '42, 5th Cross, 12th Main',
    state: 'Karnataka',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    locality: 'Indiranagar',
    area: 'Indiranagar 1st Stage',
    landmark: 'Near ESI Hospital',
    pinCode: '560038',
    latitude: 12.9784,
    longitude: 77.6408,
  },
  
  // Rental property specific details
  rental: {
    rentalType: 'rent',
    rentAmount: '25000',
    securityDeposit: '50000',
    rentNegotiable: true,
    maintenance: '2000',
    preferredTenants: ['Family', 'Working Professionals'],
    availableFrom: new Date().toISOString().split('T')[0],
    furnishing: 'Semi-Furnished',
    parking: 'Car & Bike',
  },
  
  // Sale property specific details
  sale: {
    expectedPrice: '7500000',
    maintenanceCost: '3000',
    kitchenType: 'Modular',
    availableFrom: new Date().toISOString().split('T')[0],
    furnishing: 'Semi-Furnished',
    parking: 'Car & Bike',
    priceNegotiable: true,
    possessionStatus: 'Ready to Move',
    transactionType: 'Resale',
    ownershipType: 'Freehold',
  },
  
  // Common amenities
  amenities: [
    'Power Backup',
    'Lift',
    '24x7 Water Supply',
    'Security',
    'Park',
    'Gym',
    'Swimming Pool',
    'Internet/Broadband',
    'Clubhouse',
    'Indoor Games',
    'Visitor Parking',
    'Rainwater Harvesting',
  ],
  
  // Additional details
  additional: {
    bathrooms: '2',
    balconies: '1',
    hasGym: true,
    nonVegAllowed: true,
    gatedSecurity: true,
    propertyShowOption: 'Any Time',
    propertyCondition: 'Good',
    secondaryNumber: '9876543210',
    hasSimilarUnits: false,
    direction: 'North-East',
  },
  
  // PG/Hostel Room Details
  room_details: {
    roomType: 'Single',
    roomCapacity: '2',
    expectedRent: '8000',
    expectedDeposit: '15000',
    bathroomType: 'Attached',
    roomSize: '120',
    hasAC: true,
    hasFan: true,
    hasFurniture: true,
    hasTV: true,
    hasWifi: true,
    hasGeyser: true,
  },
  
  // PG/Hostel Facility Details
  pg_details: {
    genderPreference: 'Male',
    occupantType: 'Students',
    availableFrom: new Date().toISOString().split('T')[0],
    mealOption: 'Food Included',
    rules: ['No Smoking', 'No Drinking', 'No Non-veg', 'No Guardians Stay'],
    gateClosingTime: '22:00',
    description: 'Modern PG with all amenities for comfortable living. Located in a prime area with easy access to public transport, shopping centers, and educational institutions.',
  },
  
  // Flatmate Details
  flatmate_details: {
    monthlyRent: '10000',
    securityDeposit: '20000',
    availableFrom: new Date().toISOString().split('T')[0],
    preferredGender: 'Any',
    occupationType: 'Working Professional',
    roomFurnishing: 'Fully Furnished',
    bathroomType: 'Private',
    foodPreference: 'Veg & Non-Veg',
    maxFlatmates: '2',
    currentFlatmates: '1',
    description: 'Looking for a clean, respectful flatmate to share a spacious 3BHK apartment in a prime location. The apartment is well-maintained with all modern amenities.',
  },
  
  // Commercial Details
  commercial_details: {
    commercialType: 'Office Space',
    builtUpArea: '2500',
    builtUpAreaUnit: 'sqft',
    carpetArea: '2000',
    carpetAreaUnit: 'sqft',
    floorNumber: '4',
    totalFloors: '8',
    cabins: '4',
    meetingRooms: '2',
    washrooms: '3',
    furnishingStatus: 'Fully Furnished',
    parkingSpaces: '3',
    maintenanceCost: '8000',
    lockInPeriod: '3', // years
    securityDeposit: '150000',
    description: 'Premium office space in a commercial complex with excellent connectivity to main business districts. Modern infrastructure with ample natural light.',
  },
  
  // Commercial Sale Details
  commercial_sale_details: {
    expectedPrice: '15000000',
    priceNegotiable: true,
    maintenanceCost: '10000',
    possessionStatus: 'Ready to Move',
    availableFrom: new Date().toISOString().split('T')[0],
    transactionType: 'New Property',
    ownershipType: 'Freehold',
    expectedRentalYield: '5',
    currentRentPerMonth: '75000',
    leaseTenure: '3', // years
    lockInPeriod: '2', // years
  },
  
  // Coworking Details
  coworking_details: {
    workspaceType: 'Private Office',
    numberOfSeats: '10',
    pricePerSeat: '8000',
    cabinRooms: '2',
    meetingRooms: '1',
    operatingHours: '24/7',
    minimumCommitment: '3', // months
    securityDeposit: '50000',
    amenities: ['High Speed Internet', 'Air Conditioning', 'Power Backup', 'Printing Services', 'Coffee/Tea', 'Reception'],
    description: 'Modern coworking space with all essential amenities for startups and small businesses. Located in a commercial hub with excellent connectivity.',
  },
  
  // Land Details
  land_details: {
    landType: 'Residential Plot',
    plotArea: '2400',
    plotAreaUnit: 'sqft',
    length: '60',
    breadth: '40',
    plotFacing: 'East',
    approvedBy: 'BBMP',
    boundaryStatus: 'Fenced',
    expectedPrice: '12000000',
    priceNegotiable: true,
    ownershipType: 'Freehold',
    description: 'Premium residential plot in a well-developed layout with all infrastructure. Clear title document and immediate registration possible.',
  },
  
  // Land Features Details
  land_features_details: {
    hasElectricity: true,
    hasBorewell: true,
    hasWaterConnection: false,
    hasRoad: true,
    roadWidth: '30',
    roadWidthUnit: 'feet',
    cornerPlot: true,
    numberOfOpenSides: '2',
    isBankMortgaged: false,
    hasDigitalDocuments: true,
    soilTested: true,
    proximityToRailwayStation: '2', // km
    proximityToAirport: '15', // km
    proximityToCity: '5', // km
  },
};

// Helper function to fill form with test data for a specific section
export const fillTestData = (form: UseFormReturn<FormData>, section: keyof typeof TEST_DATA) => {
  if (!form || typeof form.setValue !== 'function') {
    console.error('Invalid form object');
    return;
  }
  
  const sectionData = TEST_DATA[section];
  if (!sectionData) {
    console.error(`No test data found for section: ${section}`);
    return;
  }
  
  console.log(`Filling test data for ${section} section...`);
  
  try {
    // Add debug logs to identify form field names
    console.log("Current form field names:");
    const formValues = form.getValues();
    console.log(Object.keys(formValues));
    
    // Fill each field in the section
    Object.entries(sectionData).forEach(([field, value]) => {
      console.log(`Attempting to set ${field} = `, value);
      form.setValue(field, value, { shouldValidate: true, shouldDirty: true });
      
      // Check if the field was actually set
      const newValue = form.getValues(field);
      console.log(`Field ${field} is now:`, newValue);
    });
    
    console.log(`Test data filled successfully for ${section} section`);
    
    // Trigger validation
    setTimeout(() => form.trigger(), 100);
  } catch (error) {
    console.error(`Error filling test data for ${section}:`, error);
  }
};

// Function to debug form field names
export const debugFormFields = (form: UseFormReturn<FormData>) => {
  try {
    const formValues = form.getValues();
    console.log("===== FORM FIELD NAMES DEBUG =====");
    console.log("All form field names:", Object.keys(formValues));
    
    // Get detailed information about property age-related fields
    const ageFields = Object.keys(formValues).filter(field => 
      field.toLowerCase().includes('age') || 
      field.toLowerCase().includes('year')
    );
    
    console.log("Age-related field names:", ageFields);
    
    // Try to update all possible age fields with valid values
    ageFields.forEach(field => {
      console.log(`Setting ${field} to '1 - 3 years'`);
      form.setValue(field, '1 - 3 years');
      const newValue = form.getValues(field);
      console.log(`Field ${field} is now:`, newValue);
    });
    
    // Try all combinations one by one
    PROPERTY_AGE.forEach(ageValue => {
      console.log(`Trying age value: ${ageValue}`);
      
      // Try standard field names
      const standardFields = ['propertyAge', 'age', 'ageOfProperty'];
      standardFields.forEach(field => {
        form.setValue(field, ageValue);
        console.log(`Set ${field} to ${ageValue}, result:`, form.getValues(field));
      });
    });
    
    console.log("===== FORM FIELD NAMES DEBUG END =====");
  } catch (error) {
    console.error("Error debugging form fields:", error);
  }
};

// Function to auto-fill all relevant sections based on property type and current step
export const autoFillAllSections = (form: UseFormReturn<FormData>, propertyType?: string, adType?: string) => {
  console.log("Auto-filling all sections for property type:", propertyType, "and ad type:", adType);
  
  try {
    // Debug first to understand field names
    debugFormFields(form);
    
    // First, fill basic sections that are common for all property types
    fillTestData(form, 'basic');
    fillTestData(form, 'location');
    fillTestData(form, 'additional');
    fillTestData(form, 'amenities');
    
    // Then fill type-specific sections
    if (propertyType && adType) {
      const propertyTypeLower = propertyType.toLowerCase();
      const adTypeLower = adType.toLowerCase();
      
      // Residential properties
      if (propertyTypeLower === 'residential') {
        if (adTypeLower === 'rent') {
          fillTestData(form, 'rental');
        } else if (adTypeLower === 'sale' || adTypeLower === 'sell') {
          fillTestData(form, 'sale');
        } else if (adTypeLower === 'pghostel') {
          fillTestData(form, 'pg_details');
          fillTestData(form, 'room_details');
        } else if (adTypeLower === 'flatmates') {
          fillTestData(form, 'flatmate_details');
        }
      }
      // Commercial properties
      else if (propertyTypeLower === 'commercial') {
        fillTestData(form, 'commercial_details');
        
        if (adTypeLower === 'rent') {
          fillTestData(form, 'rental');
        } else if (adTypeLower === 'sale' || adTypeLower === 'sell') {
          fillTestData(form, 'commercial_sale_details');
        } else if (adTypeLower === 'coworking') {
          fillTestData(form, 'coworking_details');
        }
      }
      // Land/Plots
      else if (propertyTypeLower === 'land') {
        fillTestData(form, 'land_details');
        fillTestData(form, 'land_features_details');
      }
    } else {
      // If property type and ad type aren't available, try to fill based on URL path
      const urlPath = window.location.pathname.toLowerCase();
      
      if (urlPath.includes('residential') && urlPath.includes('rent')) {
        fillTestData(form, 'rental');
      } else if (urlPath.includes('residential') && urlPath.includes('sale')) {
        fillTestData(form, 'sale');
      } else if (urlPath.includes('pghostel')) {
        fillTestData(form, 'pg_details');
        fillTestData(form, 'room_details');
      } else if (urlPath.includes('flatmate')) {
        fillTestData(form, 'flatmate_details');
      } else if (urlPath.includes('commercial') && urlPath.includes('rent')) {
        fillTestData(form, 'commercial_details');
        fillTestData(form, 'rental');
      } else if (urlPath.includes('commercial') && urlPath.includes('sale')) {
        fillTestData(form, 'commercial_details');
        fillTestData(form, 'commercial_sale_details');
      } else if (urlPath.includes('coworking')) {
        fillTestData(form, 'commercial_details');
        fillTestData(form, 'coworking_details');
      } else if (urlPath.includes('land') || urlPath.includes('plot')) {
        fillTestData(form, 'land_details');
        fillTestData(form, 'land_features_details');
      } else {
        // Default to residential rent if nothing else matches
        fillTestData(form, 'rental');
      }
    }
    
    // After filling all sections, explicitly try to set the property age field again
    setTimeout(() => {
      console.log("Final attempt to set property age field...");
      
      // Try all combinations of field names with the first property age value
      ['propertyAge', 'age', 'property_age', 'ageOfProperty', 'propertyAgeSelect'].forEach(field => {
        PROPERTY_AGE.forEach(ageValue => {
          console.log(`Setting ${field} to ${ageValue}`);
          form.setValue(field, ageValue);
          const newValue = form.getValues(field);
          console.log(`Result of setting ${field} to ${ageValue}:`, newValue);
        });
      });
      
      // For debugging, manually check if any of these worked
      console.log("Final check of age-related fields:");
      ['propertyAge', 'age', 'property_age', 'ageOfProperty', 'propertyAgeSelect'].forEach(field => {
        console.log(`${field}:`, form.getValues(field));
      });
    }, 500);
    
    console.log("Auto-fill completed successfully for all applicable sections");
  } catch (error) {
    console.error("Error during auto-fill:", error);
  }
};

// Export a window helper that can be used from the console
export const setupTestHelpers = (form: UseFormReturn<FormData>) => {
  try {
    (window as any).fillTestData = (section: string) => {
      fillTestData(form, section as keyof typeof TEST_DATA);
    };
    
    (window as any).fillAllTestData = () => {
      autoFillAllSections(form);
    };
    
    // Add debug helper
    (window as any).debugFormFields = () => {
      debugFormFields(form);
    };
    
    console.log('Test helpers added to window object. Use window.fillTestData("section_name") to fill specific sections.');
    console.log('Added window.debugFormFields() to identify form field names.');
  } catch (error) {
    console.error('Error setting up test helpers:', error);
  }
};