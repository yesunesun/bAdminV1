// src/modules/owner/components/property/wizard/constants.ts
// Version: 2.1.0
// Last Modified: 2025-03-03T14:45:00+05:30 (IST)
// Author: Bhoomitalli Team

import { 
  Home, 
  MapPin, 
  IndianRupee, 
  Settings, 
  ImagePlus, 
  ClipboardCheck 
} from 'lucide-react';

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

export const PROPERTY_TYPES = [
  'Apartment',
  'Independent House',
  'Villa',
  'Penthouse',
  'Studio Apartment',
  'Service Apartment'
] as const;

export const BHK_TYPES = [
  '1 BHK',
  '2 BHK',
  '3 BHK',
  '4 BHK',
  '4+ BHK'
] as const;

export const PROPERTY_AGE = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  '10+ years'
] as const;

export const FACING_OPTIONS = [
  'North',
  'South',
  'East',
  'West',
  'North East',
  'North West',
  'South East',
  'South West'
] as const;

export const AREA_UNITS = [
  { value: 'sqft', label: 'sq ft' },
  { value: 'sqyd', label: 'sq yard' }
] as const;

export const RENTAL_TYPES = [
  { id: 'rent', label: 'Rent' },
  { id: 'lease', label: 'Lease' }
] as const;

export const MAINTENANCE_OPTIONS = [
  'Maintenance Included',
  'Maintenance Extra',
  'No Maintenance'
] as const;

export const TENANT_PREFERENCES = [
  'Family',
  'Bachelor Male',
  'Bachelor Female',
  'Company',
  'Any'
] as const;

export const FURNISHING_OPTIONS = [
  'Fully Furnished',
  'Semi Furnished',
  'Unfurnished'
] as const;

export const PARKING_OPTIONS = [
  'Two Wheeler',
  'Four Wheeler',
  'Both',
  'None'
] as const;

export const PROPERTY_SHOW_OPTIONS = [
  'Owner',
  'Caretaker',
  'Security',
  'Agent'
] as const;

export const PROPERTY_CONDITION_OPTIONS = [
  'Excellent',
  'Good',
  'Average',
  'Needs Repair'
] as const;

export const AMENITIES_LIST = [
  // Basic utilities
  'Power Backup',
  'Lift',
  'Security',
  'Gas Pipeline',
  'Air Conditioner',
  'Internet Services',
  'Intercom',
  
  // Facilities
  'Swimming Pool',
  'Club House',
  'Children Play Area',
  'Indoor Games',
  'Park',
  'Garden',
  
  // Services
  'House Keeping',
  'Servant Room',
  'Fire Safety',
  'Shopping Center',
  
  // Parking & Water
  'Visitor Parking',
  'Water Storage',
  'Rain Water Harvesting',
  'Sewage Treatment Plant'
] as const;

// Sample zone and localities - replace with actual data
export const HYDERABAD_LOCATIONS: Record<string, string[]> = {
  'West Zone': ['HITEC City', 'Madhapur', 'Gachibowli', 'Kondapur'],
  'Central Zone': ['Banjara Hills', 'Jubilee Hills', 'Ameerpet', 'Punjagutta'],
  'East Zone': ['Uppal', 'LB Nagar', 'Dilsukhnagar', 'Nacharam'],
  'North Zone': ['Kompally', 'Alwal', 'Secunderabad', 'Medchal'],
  'South Zone': ['Mehdipatnam', 'Attapur', 'Rajendranagar', 'Shamshabad']
};