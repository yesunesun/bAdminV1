// src/modules/owner/components/property/wizard/types.ts
// Version: 7.0.0
// Last Modified: 18-05-2025 18:30 IST
// Purpose: Removed backward compatibility fields and simplified the FormData interface

import { UseFormReturn } from 'react-hook-form';

// Property Image Type
export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

// Form Data Structure with flow-specific step identifiers
export interface FormData {
  // Metadata section
  meta?: {
    _version: string;
    id?: string;
    owner_id?: string;
    created_at: string;
    updated_at: string;
    status: 'draft' | 'published' | 'archived';
  };
  
  // Flow information
  flow?: {
    category: "residential" | "commercial" | "land";
    listingType: string;
    flowType?: string;
  };
  
  // Steps container with flow-specific identifiers
  steps?: {
    // Residential rent steps
    res_rent_basic_details?: StepData;
    res_rent_location?: StepData;
    res_rent_rental?: StepData;
    res_rent_features?: StepData;
    
    // Residential sale steps
    res_sale_basic_details?: StepData;
    res_sale_location?: StepData;
    res_sale_sale_details?: StepData;
    res_sale_features?: StepData;
    
    // Residential flatmates steps
    res_flat_basic_details?: StepData;
    res_flat_location?: StepData;
    res_flat_flatmate_details?: StepData;
    res_flat_features?: StepData;
    
    // Residential PG/Hostel steps
    res_pg_basic_details?: StepData;
    res_pg_location?: StepData;
    res_pg_pg_details?: StepData;
    res_pg_features?: StepData;
    
    // Commercial rent steps
    com_rent_basic_details?: StepData;
    com_rent_location?: StepData;
    com_rent_rental?: StepData;
    com_rent_features?: StepData;
    
    // Commercial sale steps
    com_sale_basic_details?: StepData;
    com_sale_location?: StepData;
    com_sale_sale_details?: StepData;
    com_sale_features?: StepData;
    
    // Commercial coworking steps
    com_cow_basic_details?: StepData;
    com_cow_location?: StepData;
    com_cow_coworking_details?: StepData;
    com_cow_features?: StepData;
    
    // Land sale steps
    land_sale_basic_details?: StepData;
    land_sale_location?: StepData;
    land_sale_land_features?: StepData;
    
    // Allow for dynamic step types
    [key: string]: any;
  };
  
  // Media section with photos and videos
  media?: {
    photos: {
      images: PropertyImage[];
    };
    videos?: {
      urls: string[];
    };
  };
  
  // Enable compatibility with any properties that might be added dynamically
  [key: string]: any;
}

// Generic step data interface
export interface StepData {
  [key: string]: any;
}

// Specific step data interfaces for type safety
export interface BasicDetailsStepData extends StepData {
  title?: string;
  propertyType?: string;
  bhkType?: string;
  floor?: number | null;
  totalFloors?: number | null;
  builtUpArea?: number | null;
  builtUpAreaUnit?: 'sqft' | 'sqyd';
  bathrooms?: number | null;
  balconies?: number | null;
  facing?: string;
  propertyAge?: string;
  propertyCondition?: string;
  hasBalcony?: boolean;
  hasAC?: boolean;
}

export interface LocationStepData extends StepData {
  address?: string;
  flatPlotNo?: string;
  landmark?: string;
  locality?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  coordinates?: {
    latitude: number | null;
    longitude: number | null;
  };
}

export interface RentalStepData extends StepData {
  rentAmount?: number | null;
  securityDeposit?: number | null;
  maintenanceCharges?: number | null;
  rentNegotiable?: boolean;
  availableFrom?: string;
  preferredTenants?: string[];
  leaseDuration?: string;
  furnishingStatus?: string;
  hasSimilarUnits?: boolean;
  propertyShowOption?: string;
  propertyShowPerson?: string;
  secondaryNumber?: string;
  secondaryContactNumber?: string;
}

export interface SaleStepData extends StepData {
  expectedPrice?: number | null;
  priceNegotiable?: boolean;
  possessionDate?: string;
  hasSimilarUnits?: boolean;
  propertyShowOption?: string;
  propertyShowPerson?: string;
  secondaryNumber?: string;
  secondaryContactNumber?: string;
}

export interface FeaturesStepData extends StepData {
  amenities?: string[];
  parking?: string;
  petFriendly?: boolean;
  nonVegAllowed?: boolean;
  waterSupply?: string;
  powerBackup?: string;
  gatedSecurity?: boolean;
  description?: string;
  isSmokingAllowed?: boolean;
  isDrinkingAllowed?: boolean;
  hasAttachedBathroom?: boolean;
  hasGym?: boolean;
}

export interface FlatmateStepData extends StepData {
  preferredGender?: string;
  occupancy?: string;
  foodPreference?: string;
  tenantType?: string;
  roomSharing?: boolean;
  maxFlatmates?: number;
  currentFlatmates?: number;
  about?: string;
}

export interface PGStepData extends StepData {
  pgType?: string;
  mealOptions?: string[];
  roomTypes?: string[];
  occupancyTypes?: string[];
  genderPreference?: string;
  rules?: string[];
  facilities?: string[];
  noticePolicy?: string;
}

export interface CoworkingStepData extends StepData {
  spaceType?: string;
  capacity?: number;
  operatingHours?: string;
  amenities?: string[];
  securityDeposit?: number;
  minimumCommitment?: string;
  discounts?: string[];
  availableFrom?: string;
}

export interface LandFeaturesStepData extends StepData {
  approvals?: string[];
  boundaryStatus?: string;
  cornerPlot?: boolean;
  landUseZone?: string;
  description?: string;
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
  stepId?: string;
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

// Debug Component
export interface FormDataDebugProps {
  form: UseFormReturn<FormData>;
  collapsed?: boolean;
}

// Step Component Props with stepId
export interface StepComponentProps extends FormSectionProps {
  stepId: string;
}