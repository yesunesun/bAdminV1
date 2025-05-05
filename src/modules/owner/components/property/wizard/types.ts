// src/modules/owner/components/property/wizard/types.ts
// Version: 5.0.0
// Last Modified: 04-05-2025 14:35 IST
// Purpose: Updated to only support v3 data structure

import { UseFormReturn } from 'react-hook-form';

// Property Image Type
export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

// V3 Form Data Structure
export interface FormData {
  // Metadata section
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
}

// Property interface
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
  images?: PropertyImage[];
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