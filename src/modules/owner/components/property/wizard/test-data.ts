// src/modules/owner/components/property/wizard/test-data.ts
// Version: 1.2.0
// Last Modified: 09-03-2025 15:10 IST
// Purpose: Enhanced test data for property form development with additional fields

export const TEST_DATA = {
  // Basic Details
  propertyType: 'Apartment',
  bhkType: '2 BHK',
  floor: '3',
  totalFloors: '8',
  propertyAge: '1 - 3 years',
  possessionDate: '2025-06-01',
  facing: 'North',
  builtUpArea: '1250',
  
  // Location Details
  zone: 'West Zone',
  locality: 'HITEC City',
  landmark: 'Near Mind Space',
  flatPlotNo: 'A-304',
  address: '123 Tech Park, Road No. 2',
  pinCode: '500081',
  age: '3', // Added specific age field for Location Details
  
  // Rental Details
  rentalType: 'rent',
  rentAmount: '30000',
  securityDeposit: '60000',
  rentNegotiable: true,
  maintenance: 'Maintenance Extra',
  availableFrom: '2025-03-15',
  preferredTenants: ['Family', 'Company'],
  
  // Sale Details (for Sale flow)
  expectedPrice: '12500000',
  maintenanceCost: '5000',
  kitchenType: 'Modular',
  priceNegotiable: true,
  
  // Features and Amenities
  furnishing: 'Semi Furnished',
  parking: 'Both',
  description: 'Beautiful apartment with modern amenities',
  bathrooms: '2',
  balconies: '1',
  hasGym: true,
  nonVegAllowed: true,
  gatedSecurity: true,
  propertyShowOption: 'Owner',
  propertyCondition: 'Excellent',
  secondaryNumber: '9876543210',
  hasSimilarUnits: false,
  amenities: ['Power Backup', 'Lift', 'Security', 'Swimming Pool', 'Park']
};