// src/modules/owner/components/property/wizard/types.ts
// Version: 5.2.0
// Last Modified: 11-05-2025 21:00 IST
// Purpose: Updated to better align with flow-based JSON structure

import { UseFormReturn } from 'react-hook-form';

// Property Image Type
export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
  displayOrder: number;
}

// V3 Form Data Structure with restructured fields
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
  };
  
  // Direct steps container - this is where most wizard data should be stored
  steps?: {
    basic_details?: {
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
      [key: string]: any; // Allow additional properties based on property type
    };
    
    // Location details
    location?: {
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
      [key: string]: any;
    };
    
    // Rental details (only relevant for rental properties)
    rental?: {
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
      [key: string]: any;
    };
    
    // Sale details (only relevant for sale properties)
    sale?: {
      expectedPrice?: number | null;
      priceNegotiable?: boolean;
      possessionDate?: string;
      hasSimilarUnits?: boolean;
      propertyShowOption?: string;
      propertyShowPerson?: string;
      secondaryNumber?: string;
      secondaryContactNumber?: string;
      [key: string]: any;
    };
    
    // Features and amenities
    features?: {
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
      [key: string]: any;
    };
    
    // Flatmate details
    flatmate_details?: {
      preferredGender?: string;
      occupancy?: string;
      foodPreference?: string;
      tenantType?: string;
      roomSharing?: boolean;
      maxFlatmates?: number;
      currentFlatmates?: number;
      about?: string;
      [key: string]: any;
    };
    
    // PG/Hostel details
    pg_details?: {
      pgType?: string;
      mealOptions?: string[];
      roomTypes?: string[];
      occupancyTypes?: string[];
      genderPreference?: string;
      rules?: string[];
      facilities?: string[];
      noticePolicy?: string;
      [key: string]: any;
    };
    
    // Commercial details
    commercial_details?: {
      cabins?: number;
      meetingRooms?: number;
      washrooms?: number;
      cornerProperty?: boolean;
      mainRoadFacing?: boolean;
      [key: string]: any;
    };
    
    // Coworking details
    coworking?: {
      spaceType?: string;
      capacity?: number;
      operatingHours?: string;
      amenities?: string[];
      securityDeposit?: number;
      minimumCommitment?: string;
      discounts?: string[];
      availableFrom?: string;
      [key: string]: any;
    };
    
    // Land features
    land_features?: {
      approvals?: string[];
      boundaryStatus?: string;
      cornerPlot?: boolean;
      landUseZone?: string;
      description?: string;
      [key: string]: any;
    };
    
    // Add other step types as needed
    [key: string]: any; // Allow for dynamic step types
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
  
  // Flow sections at top level (mapped during output preparation)
  details?: any;
  location?: any;
  rental?: any;
  sale?: any;
  features?: any;
  flatmate_details?: any;
  pg_details?: any;
  coworking?: any;
  commercial_details?: any;
  land_features?: any;
  
  // Legacy support for direct fields
  [key: string]: any;
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

// Debug Component
export interface FormDataDebugProps {
  form: UseFormReturn<FormData>;
  collapsed?: boolean;
}