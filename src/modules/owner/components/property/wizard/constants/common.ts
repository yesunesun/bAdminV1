// src/modules/owner/components/property/wizard/constants/common.ts
// Version: 2.4.0
// Last Modified: 12-04-2025 15:30 IST
// Purpose: Updated 'Flatmate Preferences' to 'Flatmate Details'

import { 
  Home, 
  MapPin, 
  IndianRupee, 
  Settings, 
  ImagePlus, 
  ClipboardCheck,
  Bed,
  Building,
  LandPlot,
  Store,  // Changed from Shop to Store
  Briefcase,
  Users
} from 'lucide-react';

// Step definitions with their icons and titles
export const STEP_DEFINITIONS = {
  details: {
    id: 'details',
    title: 'Basic Details',
    icon: Home,
    description: 'Property type and details'
  },
  location: {
    id: 'location',
    title: 'Location',
    icon: MapPin,
    description: 'Property location'
  },
  rental: {
    id: 'rental',
    title: 'Rental',
    icon: IndianRupee,
    description: 'Rental terms'
  },
  sale: {
    id: 'sale',
    title: 'Sale Details',
    icon: IndianRupee,
    description: 'Sale details'
  },
  commercial: {
    id: 'commercial',
    title: 'Commercial Details',
    icon: Building,
    description: 'Commercial property details'
  },
  room_details: {
    id: 'room_details',
    title: 'Room Details',
    icon: Bed,
    description: 'PG/Hostel room details'
  },
  pg_details: {
    id: 'pg_details',
    title: 'PG Details',
    icon: Building,
    description: 'PG/Hostel facility details'
  },
  features: {
    id: 'features',
    title: 'Features',
    icon: Settings,
    description: 'Amenities and features'
  },
  photos: {
    id: 'photos',
    title: 'Photos',
    icon: ImagePlus,
    description: 'Property photos'
  },
  review: {
    id: 'review',
    title: 'Review',
    icon: ClipboardCheck,
    description: 'Review and publish'
  },
  // New step definitions for Commercial Sale flow
  commercial_sale: {
    id: 'commercial_sale',
    title: 'Sale Details',
    icon: Store,  // Changed from Shop to Store
    description: 'Commercial sale details'
  },
  // New step definitions for Commercial Co-working flow
  coworking: {
    id: 'coworking',
    title: 'Co-working Details',
    icon: Briefcase,
    description: 'Co-working space details'
  },
  // New step definitions for Land/Plot Sale flow - Using LandPlot icon
  land_details: {
    id: 'land_details',
    title: 'Land Details',
    icon: LandPlot,
    description: 'Land details'
  },
  land_features: {
    id: 'land_features',
    title: 'Land Features',
    icon: Settings,
    description: 'Land features and specifications'
  },
  // New step definitions for Residential Flatmates flow
  flatmate_details: {
    id: 'flatmate_details',
    title: 'Flatmate Details', // Changed from "Flatmate Preferences" to "Flatmate Details"
    icon: Users,
    description: 'Flatmate preferences and details'
  }
};

// Legacy STEPS array - kept for backward compatibility
export const STEPS = [
  {
    id: 'details',
    title: 'Basic Details',
    icon: Home,
    description: 'Property type and details'
  },
  {
    id: 'location',
    title: 'Location',
    icon: MapPin,
    description: 'Property location'
  },
  {
    id: 'rental',
    title: 'Rental',
    icon: IndianRupee,
    description: 'Rental terms'
  },
  {
    id: 'sale',
    title: 'Sale Details',
    icon: IndianRupee,
    description: 'Sale details'
  },
  {
    id: 'commercial',
    title: 'Commercial Details',
    icon: Building,
    description: 'Commercial property details'
  },
  {
    id: 'room_details',
    title: 'Room Details',
    icon: Bed,
    description: 'PG/Hostel room details'
  },
  {
    id: 'pg_details',
    title: 'PG Details',
    icon: Building,
    description: 'PG/Hostel facility details'
  },
  {
    id: 'commercial_sale',
    title: 'Sale Details',
    icon: Store,  // Changed from Shop to Store
    description: 'Commercial sale details'
  },
  {
    id: 'coworking',
    title: 'Co-working Details',
    icon: Briefcase,
    description: 'Co-working space details'
  },
  {
    id: 'land_details',
    title: 'Land Details',
    icon: LandPlot,
    description: 'Land details'
  },
  {
    id: 'land_features',
    title: 'Land Features',
    icon: Settings,
    description: 'Land features and specifications'
  },
  {
    id: 'flatmate_details',
    title: 'Flatmate Details', // Changed from "Flatmate Preferences" to "Flatmate Details"
    icon: Users,
    description: 'Flatmate preferences and details'
  },
  {
    id: 'features',
    title: 'Features',
    icon: Settings,
    description: 'Amenities and features'
  },
  {
    id: 'review',
    title: 'Review',
    icon: ClipboardCheck,
    description: 'Review and publish'
  },
  {
    id: 'photos',
    title: 'Photos',
    icon: ImagePlus,
    description: 'Property photos'
  }
] as const;

// Shared constants used across different sections
export const FURNISHING_OPTIONS = [
  'Fully Furnished',
  'Semi Furnished',
  'Unfurnished'
] as const;

// Create a variable with escaped name for backward compatibility
export const FURNISHING_OPTIONS_SPECIAL = FURNISHING_OPTIONS;

export const PARKING_OPTIONS = [
  'Two Wheeler',
  'Four Wheeler',
  'Both',
  'None'
] as const;

// Sample zone and localities - replace with actual data
export const HYDERABAD_LOCATIONS: Record<string, string[]> = {
  'West Zone': ['HITEC City', 'Madhapur', 'Gachibowli', 'Kondapur'],
  'Central Zone': ['Banjara Hills', 'Jubilee Hills', 'Ameerpet', 'Punjagutta'],
  'East Zone': ['Uppal', 'LB Nagar', 'Dilsukhnagar', 'Nacharam'],
  'North Zone': ['Kompally', 'Alwal', 'Secunderabad', 'Medchal'],
  'South Zone': ['Mehdipatnam', 'Attapur', 'Rajendranagar', 'Shamshabad']
};