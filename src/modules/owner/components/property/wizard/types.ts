// src/modules/owner/components/property/wizard/types.ts
// Version: 3.2.0
// Last Modified: 15-04-2025 10:30 IST
// Purpose: Added flow_property_type and flow_listing_type fields

import { UseFormReturn } from 'react-hook-form';
// Update this import to point to the new location
import { PropertyValidationSchema } from './validationSchemas';

export type FormData = {
  // Property Selection Fields
  propertyCategory: 'residential' | 'commercial' | 'land';
  listingType: string;
  location: string;
  
  // Flow tracking fields - new additions
  flow_property_type?: string;
  flow_listing_type?: string;
  
  // Existing Fields
  title: string;
  propertyType: string;
  bhkType: string;
  floor: string;
  totalFloors: string;
  propertyAge: string;
  facing: string;
  builtUpArea: string;
  builtUpAreaUnit: 'sqft' | 'sqyd'; // For area unit
  possessionDate: string; // New field for possession date
  
  // Location fields - updated to be optional
  state?: string;
  district?: string;
  city?: string;
  locality?: string;
  area?: string;
  landmark?: string;
  
  // Required location fields
  address: string;
  pinCode: string;
  
  // Rental-specific fields
  rentalType: 'rent' | 'lease';
  rentAmount: string;
  securityDeposit: string;
  rentNegotiable: boolean;
  maintenance: string;
  preferredTenants: string[];
  
  // Sale-specific fields
  expectedPrice: string;
  maintenanceCost: string;
  kitchenType: string;
  
  // Common fields for both rental and sale
  availableFrom: string;
  furnishing: string;
  parking: string;
  description: string;
  amenities: string[];
  
  // Additional fields
  bathrooms: string;
  balconies: string;
  hasGym: boolean;
  nonVegAllowed: boolean;
  gatedSecurity: boolean;
  propertyShowOption: string;
  propertyCondition: string;
  secondaryNumber: string;
  hasSimilarUnits: boolean;
  direction: string;
  
  // Optional fields for mapping
  latitude?: number;
  longitude?: number;
  
  // Image related fields
  images?: Array<{
    id: string;
    url: string;
    type: 'primary' | 'additional';
  }>;
  primaryImage?: string;
};

// Rest of the file remains unchanged