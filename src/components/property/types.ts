// src/components/property/types.ts
// Version: 1.0.0
// Last Modified: 2025-02-01T20:30:00+05:30 (IST)

export type PropertyStatus = 'draft' | 'pending_review' | 'rejected' | 'published';

export interface PropertyImage {
  id: string;
  url: string;
  is_approved?: boolean;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface PropertyDetails {
  propertyType: string;
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
  rentalType: string;
  rentAmount: string;
  securityDeposit: string;
  maintenance: string;
  availableFrom: string;
  preferredTenants: string[];
  furnishing: string;
  parking: string;
  description: string;
  amenities: string[];
}

export interface PropertyOwner {
  id: string;
  email: string;
  phone: string;
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  price: number;
  address: string;
  city: string;
  state: string;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
  property_details: PropertyDetails;
  images?: PropertyImage[];
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  ownerDetails?: PropertyOwner;
}

export interface CompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  hasImages: boolean;
}

export interface PropertyListProps {
  properties: Property[];
  loading: boolean;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: PropertyStatus, rejectionReason?: string) => void;
  isUpdating: string | null;
  showOwnerInfo?: boolean;
}

export interface PropertyCardProps {
  property: Property;
  completionStatus: CompletionStatus;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: PropertyStatus, rejectionReason?: string) => void;
  isUpdating: boolean;
  showOwnerInfo?: boolean;
}