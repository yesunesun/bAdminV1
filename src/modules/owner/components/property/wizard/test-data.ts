// src/modules/owner/components/property/wizard/test-data.ts
// Version: 2.0.0
// Last Modified: 11-04-2025 21:15 IST
// Purpose: Updated test data with PG/Hostel specific fields

// Demo data for testing form sections
export const TEST_DATA = {
  // Basic property details
  basic: {
    title: 'Sample Property',
    propertyType: 'Residential',
    bhkType: '2 BHK',
    floor: '3',
    totalFloors: '10',
    propertyAge: '2',
    facing: 'East',
    builtUpArea: '1200',
    builtUpAreaUnit: 'sqft',
    possessionDate: new Date().toISOString().split('T')[0],
    description: 'This is a sample property description for testing purposes.',
  },
  
  // Location details
  location: {
    address: '123 Sample Street, Near Main Road',
    state: 'Karnataka',
    city: 'Bangalore',
    district: 'Bangalore Urban',
    locality: 'Indiranagar',
    area: 'Indiranagar 1st Stage',
    landmark: 'Near Sample Mall',
    pinCode: '560038',
  },
  
  // Rental property specific details
  rental: {
    rentalType: 'rent',
    rentAmount: '25000',
    securityDeposit: '50000',
    rentNegotiable: true,
    maintenance: '2000',
    preferredTenants: ['Anyone'],
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
  },
  
  // Common amenities
  amenities: [
    'Power Backup',
    'Lift',
    'Water Supply',
    'Security',
    'Park',
    'Gym',
    'Swimming Pool',
    'Internet/Broadband',
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
  
  // PG/Hostel Room Details - specific fields from RoomDetails.tsx
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
  
  // PG/Hostel Facility Details - specific fields from PGDetails.tsx
  pg_details: {
    genderPreference: 'Male',
    occupantType: 'Students',
    availableFrom: new Date().toISOString().split('T')[0],
    mealOption: 'Food Included',
    rules: ['No Smoking', 'No Drinking', 'No Non-veg', 'No Guardians Stay'],
    gateClosingTime: '22:00',
    description: 'Modern PG/Hostel with all amenities for comfortable living. Located in a prime area with easy access to public transport, shopping centers, and educational institutions.',
  }
};

// Helper function to fill form with test data for a specific section
export const fillTestData = (form: any, section: keyof typeof TEST_DATA) => {
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
    // Fill each field in the section
    Object.entries(sectionData).forEach(([field, value]) => {
      console.log(`Setting ${field} = `, value);
      form.setValue(field, value, { shouldValidate: true, shouldDirty: true });
    });
    
    console.log(`Test data filled successfully for ${section} section`);
    
    // Trigger validation
    setTimeout(() => form.trigger(), 100);
  } catch (error) {
    console.error(`Error filling test data for ${section}:`, error);
  }
};

// Export a window helper that can be used from the console
export const setupTestHelpers = (form: any) => {
  try {
    (window as any).fillTestData = (section: string) => {
      fillTestData(form, section as keyof typeof TEST_DATA);
    };
    
    (window as any).fillAllTestData = () => {
      Object.keys(TEST_DATA).forEach(section => {
        fillTestData(form, section as keyof typeof TEST_DATA);
      });
    };
    
    console.log('Test helpers added to window object. Use window.fillTestData("section_name") to fill specific sections.');
  } catch (error) {
    console.error('Error setting up test helpers:', error);
  }
};