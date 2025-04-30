// src/modules/owner/components/property/PropertyFormTypes.ts
// Version: 2.0.0
// Last Modified: 01-05-2025 12:45 IST
// Purpose: Added support for v2 property data structure

import { UseFormReturn } from 'react-hook-form';
import { PropertyValidationSchema } from './validationSchemas';

// Image Type Definition
export interface PropertyImage {
  id: string;
  url: string;
  is_primary?: boolean;
  display_order?: number;
  type?: 'primary' | 'additional';
}

// Core Property Type
export type PropertyType = {
  id: string;
  owner_id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  status: 'draft' | 'published' | 'archived';
  tags?: string[];
  created_at: string;
  updated_at: string;
  
  // Comprehensive image handling
  property_images?: PropertyImage[];
  image?: string; // Legacy support for single image

  // Detailed property information
  property_details?: {
    propertyType?: string;
    rentalFrequency?: string;
    latitude?: number;
    longitude?: number;
    [key: string]: any; // Allow for additional dynamic properties
  };
  
  // V2 format properties
  _version?: string;
  flow?: {
    category: string;
    listingType: string;
  };
  rental?: {
    rentAmount: number;
    availableFrom: string;
    leaseDuration: string;
    rentNegotiable: boolean;
    securityDeposit: number;
    furnishingStatus: string;
    preferredTenants: string[];
    maintenanceCharges: number | null;
  };
  features?: {
    hasGym: boolean;
    parking: string;
    amenities: string[];
    direction: string;
    description: string;
    petFriendly: boolean;
    powerBackup: string;
    waterSupply: string;
    gatedSecurity: boolean;
    nonVegAllowed: boolean;
    hasSimilarUnits: boolean;
    secondaryNumber: string;
    propertyCondition: string;
    propertyShowOption: string;
  };
  location?: {
    area: string;
    city: string;
    state: string;
    address: string;
    pinCode: string;
    district: string;
    landmark: string;
    locality: string;
    flatPlotNo: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  basicDetails?: {
    floor: number;
    title: string;
    facing: string;
    bhkType: string;
    balconies: string;
    bathrooms: string;
    builtUpArea: number;
    propertyAge: string;
    totalFloors: number;
    propertyType: string;
    possessionDate: string;
    builtUpAreaUnit: string;
  };
  photos?: {
    images: PropertyImage[];
  };
}

// Form Data Type for Property Submission
export type FormData = {
  // Existing fields from previous implementation
  propertyType: string;
  listingType: string;
  
  // Core fields
  title: string;
  bhkType: string;
  floor: string;
  totalFloors: string;
  propertyAge: string;
  facing: string;
  builtUpArea: string;
  builtUpAreaUnit: 'sqft' | 'sqyd';
  possessionDate: string;
  zone: string;
  locality: string;
  landmark: string;
  address: string;
  flatPlotNo: string;
  pinCode: string;
  
  // Rental/Sale Details
  rentalType: 'rent' | 'lease';
  rentAmount: string;
  securityDeposit: string;
  rentNegotiable: boolean;
  maintenance: string;
  availableFrom: string;
  preferredTenants: string[];
  
  // Property Characteristics
  furnishing: string;
  parking: string;
  description: string;
  amenities: string[];
  
  // Additional Fields
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
  
  // Mapping and Location
  latitude?: number;
  longitude?: number;
  
  // Enhanced Image Handling
  images?: PropertyImage[];
  primaryImage?: string;
  
  // V2 Format Support
  _version?: 'v1' | 'v2';
  dataFormat?: 'v1' | 'v2';
}

// Interfaces for Form Steps and Validation
export interface FormStepProps extends FormSectionProps {
  onNext: () => void;
  onPrevious: () => void;
}

export interface FormSectionProps {
  form: UseFormReturn<FormData>;
}

export interface PropertySelectionSectionProps extends FormSectionProps {
  isFirstStep?: boolean;
}

export interface ImageUploadSectionProps {
  propertyId: string;
  onUploadComplete: () => void;
  onPrevious: () => void;
}

export interface PropertySummaryProps {
  formData: FormData;
  onPrevious: () => void;
  onSaveAsDraft: () => Promise<void>;
  onSaveAndPublish: () => Promise<void>;
  onUpdate: () => Promise<void>;
  saving: boolean;
  status: 'draft' | 'published';
  propertyId?: string;
}

// Validation and Tracking Types
export type StepValidationStatus = {
  [key: number]: boolean;
};

// Property Filtering and Search Types
export type PropertyFilter = {
  zone?: string;
  locality?: string;
  propertyType?: string;
  bhkType?: string;
  rentRange?: {
    min: number;
    max: number;
  };
  furnishing?: string;
  availability?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'latest';
};

// Property Statistics Type
export type PropertyStats = {
  total: number;
  published: number;
  draft: number;
  archived: number;
  views: number;
  inquiries: number;
};

// Property Type Selection Types
export type PropertyTypeFormData = {
  propertyType: string;
  listingType: string;
  city?: string;
};

// Property Category Interface
export interface PropertyCategoryOption {
  id: string;
  title: string;
  listingTypes: string[];
  icon: React.FC<{ className?: string }>;
}

// How It Works Component Props
export interface HowItWorksProps {
  onStartListing?: () => void;
  showCTA?: boolean;
  className?: string;
}

// V2 Format specific interfaces
export interface PropertyV2 {
  id: string;
  owner_id: string;
  status: 'draft' | 'published' | 'archived';
  _version: 'v2';
  title: string;
  flow: {
    category: 'residential' | 'commercial' | 'land';
    listingType: 'rent' | 'sale';
  };
  basicDetails: {
    title: string;
    propertyType: string;
    bhkType: string;
    floor: number;
    totalFloors: number;
    propertyAge: string;
    facing: string;
    builtUpArea: number;
    builtUpAreaUnit: string;
    possessionDate: string;
    bathrooms: string;
    balconies: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    pinCode: string;
    district: string;
    landmark: string;
    locality: string;
    flatPlotNo: string;
    area: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  rental?: {
    rentAmount: number;
    securityDeposit: number;
    rentNegotiable: boolean;
    availableFrom: string;
    leaseDuration: string;
    furnishingStatus: string;
    preferredTenants: string[];
    maintenanceCharges: number | null;
  };
  features: {
    description: string;
    amenities: string[];
    parking: string;
    direction: string;
    hasGym: boolean;
    nonVegAllowed: boolean;
    gatedSecurity: boolean;
    petFriendly: boolean;
    propertyShowOption: string;
    propertyCondition: string;
    secondaryNumber: string;
    hasSimilarUnits: boolean;
    powerBackup: string;
    waterSupply: string;
  };
  photos: {
    images: PropertyImage[];
  };
}

// Export the types for use in other components
export default {
  PropertyType,
  FormData,
  PropertyImage,
  PropertyFilter,
  PropertyStats,
  PropertyTypeFormData,
  PropertyCategoryOption,
  PropertyV2
};