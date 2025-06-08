// src/modules/owner/components/property/wizard/validationSchemas.ts
// Version: 4.2.0
// Last Modified: 02-06-2025 17:15 IST
// Purpose: Added commercial rent flow validation schemas for mandatory fields

import { z } from 'zod';
// Updated import to use the migrated constants file
import { 
  PROPERTY_TYPES, 
  BHK_TYPES, 
  PROPERTY_AGE, 
  FACING_OPTIONS, 
  KITCHEN_TYPES,
  ROOM_TYPES,
  BATHROOM_TYPES,
  MEAL_OPTIONS 
} from './constants';

export const propertyValidationSchema = z.object({
  // Property Selection
  propertyCategory: z.enum(['residential', 'commercial', 'land'], {
    required_error: 'Property category is required'
  }),
  listingType: z.string().min(1, 'Listing type is required'),
  location: z.string().min(1, 'Location is required'),

  // Property Details
  title: z.string().optional(),
  propertyType: z.enum(PROPERTY_TYPES as [string, ...string[]]).min(1, 'Property type is required'),
  bhkType: z.enum(BHK_TYPES as [string, ...string[]]).min(1, 'BHK type is required'),
  floor: z.string().min(1, 'Floor number is required'),
  totalFloors: z.string().min(1, 'Total floors is required'),
  propertyAge: z.enum(PROPERTY_AGE as [string, ...string[]]).min(1, 'Property age is required'),
  facing: z.enum(FACING_OPTIONS as [string, ...string[]]).min(1, 'Facing direction is required'),
  builtUpArea: z.string().min(1, 'Built-up area is required'),
  builtUpAreaUnit: z.enum(['sqft', 'sqyd']).default('sqft'),
  possessionDate: z.string().optional(), // Added possession date as optional

  // Location Details - Updated fields to be optional
  state: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  locality: z.string().optional(),
  area: z.string().optional(),
  landmark: z.string().optional(),
  address: z.string().min(1, 'Complete address is required'),
  pinCode: z.string().length(6, 'PIN code must be 6 digits').regex(/^\d+$/, 'Must contain only numbers'),
  // Map coordinates - optional but should be valid numbers if provided
  latitude: z.number().optional().or(z.string().regex(/^-?\d+(\.\d+)?$/).optional()),
  longitude: z.number().optional().or(z.string().regex(/^-?\d+(\.\d+)?$/).optional()),

  // Rental Details
  rentalType: z.enum(['rent', 'lease']).min(1, 'Rental type is required'),
  rentAmount: z.string().min(1, 'Rent amount is required'),
  securityDeposit: z.string().min(1, 'Security deposit is required'),
  rentNegotiable: z.boolean().default(false),
  maintenance: z.string().min(1, 'Maintenance option is required'),
  preferredTenants: z.array(z.string()).min(1, 'Select at least one preferred tenant'),
  
  // ✅ NEW: Commercial Rental Details validation
  advanceRent: z.string()
    .min(1, 'Advance rent is required')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 12;
    }, 'Advance rent must be between 0 and 12 months'),
  camCharges: z.string().min(1, 'CAM charges are required'),
  availableFrom: z.string().min(1, 'Available from date is required'),
  parking: z.string().min(1, 'Parking option is required'),
  operatingHours: z.string().min(1, 'Operating hours are required'),
  businessPreferences: z.array(z.string()).min(1, 'Select at least one preferred business type'),
  
  // ✅ NEW: Commercial Features validation - Essential Facilities
  powerBackup: z.string().min(1, 'Power backup option is required'),
  lift: z.string().min(1, 'Lift/elevator option is required'),
  parkingType: z.string().min(1, 'Parking type is required'),
  washroomType: z.string().min(1, 'Washroom type is required'),
  waterStorage: z.string().min(1, 'Water storage option is required'),
  security: z.string().min(1, 'Security option is required'),
  
  // ✅ NEW: Commercial Features validation - Property Status & Furnishing
  propertyCondition: z.string().min(1, 'Property condition is required'),
  furnishingType: z.string().min(1, 'Furnishing type is required'),
  
  // ✅ NEW: Commercial Features validation - Checkbox groups (at least 1)
  amenities: z.array(z.string()).min(1, 'Select at least one commercial amenity'),
  facilities: z.array(z.string()).min(1, 'Select at least one commercial facility'),
  infrastructureFeatures: z.array(z.string()).min(1, 'Select at least one infrastructure feature'),
  
  // Sale Details
  expectedPrice: z.string().min(1, 'Expected price is required'),
  maintenanceCost: z.string().min(1, 'Maintenance cost is required'),
  kitchenType: z.enum(KITCHEN_TYPES as [string, ...string[]]).min(1, 'Kitchen type is required'),
  
  // PG/Hostel Room Details
  roomType: z.enum(ROOM_TYPES as [string, ...string[]]).optional(),
  roomCapacity: z.string().optional(),
  availableRooms: z.string().optional(),
  totalRooms: z.string().optional(),
  bathroomType: z.enum(BATHROOM_TYPES as [string, ...string[]]).optional(),
  roomSize: z.string().optional(),
  
  // Room Features
  hasAC: z.boolean().optional(),
  hasFan: z.boolean().optional(),
  hasFurniture: z.boolean().optional(),
  hasTV: z.boolean().optional(),
  hasWifi: z.boolean().optional(),
  hasGeyser: z.boolean().optional(),
  
  // ✅ UPDATED: PG/Hostel Facility Details (removed monthlyRent)
  mealOption: z.enum(MEAL_OPTIONS as [string, ...string[]]).optional(),
  noticePeriod: z.string().optional(),
  genderPreference: z.string().optional(),
  occupantType: z.string().optional(),
  houseRules: z.string().optional(),
  pgAmenities: z.array(z.string()).optional(),
  
  // Common fields
  furnishing: z.string().min(1, 'Furnishing status is required'),
  description: z.string().optional(),

  // Amenities
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  balconies: z.string().optional(),
  hasGym: z.boolean().default(false),
  nonVegAllowed: z.boolean().default(false),
  gatedSecurity: z.boolean().default(false),
  propertyShowOption: z.string().min(1, 'Property show option is required'),
  secondaryNumber: z.string()
    .regex(/^\d{10}$/, 'Phone number must be 10 digits')
    .optional()
    .or(z.literal('')),
  hasSimilarUnits: z.boolean().default(false),
  direction: z.string().optional(),
});

export type PropertyValidationSchema = z.infer<typeof propertyValidationSchema>;

// ✅ NEW: Commercial Rent Flow Step Validation Schemas
const commercialRentBasicDetailsSchema = z.object({
  propertyType: z.string().min(1, 'Property type is required'),
  buildingType: z.string().min(1, 'Building type is required'),
  ageOfProperty: z.string().min(1, 'Age of property is required'),
  builtUpArea: z.string().min(1, 'Built-up area is required'),
  builtUpAreaUnit: z.string().min(1, 'Area unit is required'),
  floor: z.string().min(1, 'Floor is required'),
  totalFloors: z.string().min(1, 'Total floors is required'),
});

const commercialRentRentalDetailsSchema = z.object({
  rentalType: z.string().min(1, 'Rental type is required'),
  rentAmount: z.string().min(1, 'Rent amount is required'),
  securityDeposit: z.string().min(1, 'Security deposit is required'),
  advanceRent: z.string()
    .min(1, 'Advance rent is required')
    .refine((val) => {
      const num = parseInt(val);
      return !isNaN(num) && num >= 0 && num <= 12;
    }, 'Advance rent must be between 0 and 12 months'),
  maintenance: z.string().min(1, 'Maintenance is required'),
  camCharges: z.string().min(1, 'CAM charges are required'),
  availableFrom: z.string().min(1, 'Available from date is required'),
  parking: z.string().min(1, 'Parking is required'),
  operatingHours: z.string().min(1, 'Operating hours are required'),
  businessPreferences: z.array(z.string()).min(1, 'Select at least one preferred business type'),
});

const commercialRentFeaturesSchema = z.object({
  // Essential Facilities - All mandatory
  powerBackup: z.string().min(1, 'Power backup is required'),
  lift: z.string().min(1, 'Lift/elevator is required'),
  parkingType: z.string().min(1, 'Parking type is required'),
  washroomType: z.string().min(1, 'Washroom type is required'),
  waterStorage: z.string().min(1, 'Water storage is required'),
  security: z.string().min(1, 'Security is required'),
  
  // Property Status & Furnishing
  propertyCondition: z.string().min(1, 'Property condition is required'),
  furnishingType: z.string().min(1, 'Furnishing type is required'),
  
  // Checkbox groups - At least 1 required
  amenities: z.array(z.string()).min(1, 'Select at least one commercial amenity'),
  facilities: z.array(z.string()).min(1, 'Select at least one commercial facility'),
  infrastructureFeatures: z.array(z.string()).min(1, 'Select at least one infrastructure feature'),
});

export const stepValidationSchemas = {
  0: propertyValidationSchema.pick({
    propertyCategory: true,
    listingType: true,
    location: true,
  }),
  1: propertyValidationSchema.pick({
    propertyType: true,
    bhkType: true,
    floor: true,
    totalFloors: true,
    propertyAge: true,
    facing: true,
    builtUpArea: true,
    builtUpAreaUnit: true,
    possessionDate: true, // Added to step 1 validation
  }),
  2: propertyValidationSchema.pick({
    // Removed required fields, only keeping address and pinCode as required
    address: true,
    pinCode: true,
    // Keep these optional fields
    landmark: true,
    state: true,
    district: true,
    city: true,
    locality: true,
    area: true,
    latitude: true,
    longitude: true, 
  }),
  3: z.union([
    // Rental Details Validation
    propertyValidationSchema.pick({
      rentalType: true,
      rentAmount: true,
      securityDeposit: true,
      maintenance: true,
      availableFrom: true,
      preferredTenants: true,
    }),
    // ✅ NEW: Commercial Rental Details Validation
    commercialRentRentalDetailsSchema,
    // Sale Details Validation
    propertyValidationSchema.pick({
      expectedPrice: true,
      maintenanceCost: true,
      kitchenType: true,
      availableFrom: true,
    }),
    // PG/Hostel Room Details Validation
    propertyValidationSchema.pick({
      roomType: true,
      roomCapacity: true,
      availableRooms: true,
      totalRooms: true,
      bathroomType: true,
      roomSize: true,
      hasAC: true,
      hasFan: true,
      hasFurniture: true,
      hasTV: true,
      hasWifi: true,
      hasGeyser: true,
    })
  ]),
  4: z.union([
    // Standard Amenities Validation
    propertyValidationSchema.pick({
      bathrooms: true,
      propertyShowOption: true,
      propertyCondition: true,
      amenities: true,
    }),
    // ✅ NEW: Commercial Features Validation
    commercialRentFeaturesSchema,
    // ✅ UPDATED: PG/Hostel Facility Validation (removed monthlyRent and securityDeposit)
    propertyValidationSchema.pick({
      mealOption: true,
      noticePeriod: true,
      genderPreference: true,
      occupantType: true,
      houseRules: true,
      pgAmenities: true,
    })
  ]),
};

// ✅ NEW: Export flow-specific validation schemas
export const commercialRentValidationSchemas = {
  com_rent_basic_details: commercialRentBasicDetailsSchema,
  com_rent_rental: commercialRentRentalDetailsSchema,
  com_rent_features: commercialRentFeaturesSchema,
};

// ✅ NEW: Helper function to get validation schema by flow type and step
export const getValidationSchemaForStep = (flowType: string, stepId: string) => {
  switch (flowType) {
    case 'commercial_rent':
      return commercialRentValidationSchemas[stepId as keyof typeof commercialRentValidationSchemas];
    default:
      return null;
  }
};