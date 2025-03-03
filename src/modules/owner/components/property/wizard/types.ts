// src/modules/owner/components/property/wizard/types.ts
// Version: 2.3.0
// Last Modified: 03-03-2025 22:45 IST
// Updates: Updated location fields

import { UseFormReturn } from 'react-hook-form';
// Update this import to point to the new location
import { PropertyValidationSchema } from './validationSchemas';

export type FormData = {
  // Property Selection Fields
  propertyCategory: 'residential' | 'commercial' | 'land';
  listingType: string;
  location: string;
  
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
  // Location fields - updated
  state: string;
  district: string;
  city: string;
  locality: string;
  area: string;
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