// src/modules/owner/components/property/wizard/types.ts
// Version: 4.0.0
// Last Modified: 16-04-2025 14:35 IST
// Purpose: Added support for v2 data structure with backward compatibility

import { UseFormReturn } from 'react-hook-form';
import { PropertyValidationSchema } from './validationSchemas';

// V1 Form Data Structure
export type FormDataV1 = {
  // Version tracking field
  _version?: string;

  // Property Selection Fields
  propertyCategory: 'residential' | 'commercial' | 'land';
  listingType: string;
  location: string;
  
  // Flow tracking fields
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
  builtUpAreaUnit: 'sqft' | 'sqyd';
  possessionDate: string;
  
  // Location fields
  state?: string;
  district?: string;
  city?: string;
  locality?: string;
  area?: string;
  landmark?: string;
  address: string;
  pinCode: string;
  flatPlotNo?: string;
  
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
  priceNegotiable?: boolean;
  
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
  
  // Sale/rental flags
  isSaleProperty?: boolean;
  propertyPriceType?: 'sale' | 'rental';
};

// V2 Form Data Structure
export type PropertyImageV2 = {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
};

export type FormDataV2 = {
  // Version tracking
  _version: string;
  
  // Flow information
  flow: {
    category: "residential" | "commercial" | "land";
    listingType: string;
  };
  
  // Basic property details
  basicDetails: {
    title: string;
    propertyType: string;
    bhkType: string;
    floor: number | null;
    totalFloors: number | null;
    builtUpArea: number | null;
    builtUpAreaUnit: 'sqft' | 'sqyd';
    bathrooms: number | null;
    balconies: number | null;
    facing: string;
    propertyAge: string;
  };
  
  // Location details
  location: {
    address: string;
    flatPlotNo: string;
    landmark: string;
    locality: string;
    city: string;
    state: string;
    pinCode: string;
    coordinates: {
      latitude: number | null;
      longitude: number | null;
    };
  };
  
  // Rental details (only relevant for rental properties)
  rental?: {
    rentAmount: number | null;
    securityDeposit: number | null;
    maintenanceCharges: number | null;
    rentNegotiable: boolean;
    availableFrom: string;
    preferredTenants: string[];
    leaseDuration: string;
    furnishingStatus: string;
  };
  
  // Sale details (only relevant for sale properties)
  sale?: {
    expectedPrice: number | null;
    maintenanceCost: number | null;
    priceNegotiable: boolean;
    possessionDate: string;
    kitchenType?: string;
  };
  
  // Features and amenities
  features: {
    amenities: string[];
    parking: string;
    petFriendly: boolean;
    nonVegAllowed: boolean;
    waterSupply: string;
    powerBackup: string;
    gatedSecurity: boolean;
    description: string;
    propertyShowOption?: string;
    propertyCondition?: string;
    hasGym?: boolean;
    secondaryNumber?: string;
    hasSimilarUnits?: boolean;
    direction?: string;
  };
  
  // Photos
  photos: {
    images: PropertyImageV2[];
  };
  
  // Metadata fields (used when loading/saving data)
  id?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'draft' | 'published' | 'archived';
};

// Union type for supporting both formats
export type FormData = FormDataV1 | FormDataV2;

// Property interface supporting both formats
export interface Property {
  id: string;
  owner_id: string;
  title: string;
  price: number;
  address: string;
  city?: string;
  state?: string;
  zip_code: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  created_at: string;
  updated_at: string;
  property_details: FormData;
  images?: Array<{
    id: string;
    url: string;
    type: 'primary' | 'additional';
  }>;
}

// Common form props and interfaces
export interface FormSectionProps {
  form: UseFormReturn<FormData>;
  mode?: 'create' | 'edit';
  category?: string;
  adType?: string;
}

export interface FormStepProps extends FormSectionProps {
  onNext: () => void;
  onPrevious: () => void;
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
  onSave: () => Promise<void>;
  onSaveAsDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  onPrevious: () => void;
  saving: boolean;
  status?: 'draft' | 'published';
}

export type StepValidationStatus = {
  [key: number]: boolean;
};

export type PropertyFilter = {
  state?: string;
  district?: string;
  city?: string;
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

export type PropertyStats = {
  total: number;
  published: number;
  draft: number;
  archived: number;
  views: number;
  inquiries: number;
};

// Property Selection Types
export type PropertyCategory = 'residential' | 'commercial' | 'land';

export interface PropertyCategoryOption {
  id: PropertyCategory;
  title: string;
  listingTypes: string[];
  icon: React.FC<{ className?: string }>;
}

export interface HowItWorksProps {
  onStartListing?: () => void;
  showCTA?: boolean;
  className?: string;
}