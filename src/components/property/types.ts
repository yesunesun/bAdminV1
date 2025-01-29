import { UseFormReturn } from 'react-hook-form';

export interface FormData {
  title: string;
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
  // New fields
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
}

export interface FormSectionProps {
  form: UseFormReturn<FormData>;
  mode?: 'create' | 'edit';
}

export interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  status: 'draft' | 'published';
  property_details: FormData;
  images?: { id: string; url: string }[];
}