// src/modules/owner/components/property/wizard/validationSchemas.ts
// Version: 2.4.0
// Last Modified: 03-03-2025 22:45 IST
// Updates: Updated location fields validation

import { z } from 'zod';
// Updated import to use the migrated constants file
import { PROPERTY_TYPES, BHK_TYPES, PROPERTY_AGE, FACING_OPTIONS } from './constants';

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

  // Location Details - Updated fields
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  city: z.string().min(1, 'City is required'),
  locality: z.string().min(1, 'Locality is required'),
  area: z.string().min(1, 'Area is required'),
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
  availableFrom: z.string().min(1, 'Available date is required'),
  preferredTenants: z.array(z.string()).min(1, 'Select at least one preferred tenant'),
  furnishing: z.string().min(1, 'Furnishing status is required'),
  parking: z.string().min(1, 'Parking option is required'),
  description: z.string().optional(),

  // Amenities
  bathrooms: z.string().min(1, 'Number of bathrooms is required'),
  balconies: z.string().optional(),
  hasGym: z.boolean().default(false),
  nonVegAllowed: z.boolean().default(false),
  gatedSecurity: z.boolean().default(false),
  propertyShowOption: z.string().min(1, 'Property show option is required'),
  propertyCondition: z.string().min(1, 'Property condition is required'),
  secondaryNumber: z.string()
    .regex(/^\d{10}$/, 'Phone number must be 10 digits')
    .optional()
    .or(z.literal('')),
  hasSimilarUnits: z.boolean().default(false),
  direction: z.string().optional(),
  amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
});

export type PropertyValidationSchema = z.infer<typeof propertyValidationSchema>;

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
    state: true,
    district: true,
    city: true,
    locality: true,
    area: true,
    address: true,
    pinCode: true,
    // We don't make these required for validation
    latitude: true,
    longitude: true, 
  }),
  3: propertyValidationSchema.pick({
    rentalType: true,
    rentAmount: true,
    securityDeposit: true,
    maintenance: true,
    availableFrom: true,
    preferredTenants: true,
  }),
  4: propertyValidationSchema.pick({
    bathrooms: true,
    propertyShowOption: true,
    propertyCondition: true,
    amenities: true,
  }),
};