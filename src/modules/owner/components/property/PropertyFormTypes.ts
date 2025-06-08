// src/modules/owner/components/property/PropertyFormTypes.ts
// Version: 3.1.0
// Last Modified: 01-06-2025 10:35 IST
// Purpose: Added coordinates interface to support coordinate display in AllProperties page

import { UseFormReturn } from 'react-hook-form';
import { PropertyValidationSchema } from './validationSchemas';

// Image Type Definition
export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

// Coordinates Type Definition
export interface PropertyCoordinates {
  id: string;
  property_id: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  created_at: string;
  updated_at: string;
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

  // Coordinate information from property_coordinates table
  coordinates?: PropertyCoordinates | null;

  // Detailed property information stored as JSON
  property_details?: any;
};

// Form Data Type for Property Submission
export type FormData = {
  // Metadata
  meta: {
    _version: string;
    id?: string;
    owner_id?: string;
    created_at: string;
    updated_at: string;
    status: 'draft' | 'published' | 'archived';
  };
  
  // Flow information
  flow: {
    category: "residential" | "commercial" | "land";
    listingType: string;
  };
  
  // Details section
  details: {
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
    rentalInfo?: {
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
    saleInfo?: {
      expectedPrice: number | null;
      priceNegotiable: boolean;
      possessionDate: string;
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
    };
    
    // Media
    media: {
      photos: {
        images: PropertyImage[];
      };
    };
  };
};

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

// Export the types for use in other components
export default {
  PropertyType,
  FormData,
  PropertyImage,
  PropertyCoordinates,
  PropertyFilter,
  PropertyStats,
  PropertyTypeFormData,
  PropertyCategoryOption
};