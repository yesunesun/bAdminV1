// src/components/property/PropertyFormTypes.ts
// Version: 1.3.0
// Last Modified: 26-02-2025 14:55 IST

import { UseFormReturn } from 'react-hook-form';
import { PropertyValidationSchema } from './validationSchemas';

export type FormData = {
  // These should match the URL parameters
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
  zone: string;
  locality: string;
  landmark: string;
  address: string;
  pinCode: string;
  rentalType: 'rent' | 'lease';
  rentAmount: string;
  securityDeposit: string;
  rentNegotiable: boolean;
  maintenance: string;
  availableFrom: string;
  preferredTenants: string[];
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

export interface FormSectionProps {
  form: UseFormReturn<FormData>;
  mode?: 'create' | 'edit';
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
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
  onPrevious: () => void;
  onSaveAsDraft: () => Promise<void>;
  onSaveAndPublish: () => Promise<void>;
  onUpdate: () => Promise<void>;
  saving: boolean;
  status: 'draft' | 'published';
  propertyId?: string;
}

export type StepValidationStatus = {
  [key: number]: boolean;
};

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

export interface PropertyCategoryOption {
  id: string;
  title: string;
  listingTypes: string[];
  icon: React.FC<{ className?: string }>;
}

export interface HowItWorksProps {
  onStartListing?: () => void;
  showCTA?: boolean;
  className?: string;
}