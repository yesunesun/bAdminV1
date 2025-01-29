import { Building2, MapPin, Home, Settings, Upload, FileCheck } from 'lucide-react';

export const STEPS = [
  { id: 'details', title: 'Property Details', icon: Building2 },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'rental', title: 'Rental Details', icon: Home },
  { id: 'amenities', title: 'Amenities', icon: Settings },
  { id: 'upload', title: 'Upload Images', icon: Upload },
  { id: 'summary', title: 'Summary', icon: FileCheck },
];

export const PROPERTY_TYPES = [
  'Apartment',
  'Independent House',
  'Villa',
  'Gated Community',
];

export const BHK_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];

export const PROPERTY_AGE = [
  'Less than 1 year',
  '1-3 years',
  '3-5 years',
  '5-10 years',
  'More than 10 years',
];

export const FACING_OPTIONS = [
  'North',
  'South',
  'East',
  'West',
  'North East',
  'North West',
  'South East',
  'South West',
];

export const HYDERABAD_LOCATIONS = {
  'Central Zone': ['Begumpet', 'Banjara Hills', 'Jubilee Hills', 'Somajiguda'],
  'West Zone': ['Gachibowli', 'Madhapur', 'HITEC City', 'Kondapur'],
  'East Zone': ['Uppal', 'LB Nagar', 'Nacharam', 'Malakpet'],
  'North Zone': ['Kompally', 'Alwal', 'Secunderabad', 'Sainikpuri'],
  'South Zone': ['Mehdipatnam', 'Attapur', 'Rajendranagar', 'Shamshabad'],
} as const;

export const RENTAL_TYPES = [
  { id: 'rent', label: 'Rent' },
  { id: 'lease', label: 'Lease' },
];

export const MAINTENANCE_OPTIONS = [
  'Maintenance Included',
  'Maintenance Extra',
];

export const TENANT_PREFERENCES = [
  'Anyone',
  'Family',
  'Bachelor Female',
  'Bachelor Male',
  'Company',
];

export const FURNISHING_OPTIONS = [
  'Fully-furnished',
  'Semi-furnished',
  'Unfurnished',
];

export const PARKING_OPTIONS = [
  'Bike',
  'Car',
  'Both',
  'None',
];

export const AMENITIES_LIST = [
  'Power Backup',
  'Lift',
  'Security',
  'Park',
  'Swimming Pool',
  'Club House',
  'Children Play Area',
  'Gated Community',
];

export const PROPERTY_SHOW_OPTIONS = [
  'Need help',
  'I will show',
  'Neighbours',
  'Friends/Relatives',
  'Security',
  'Tenants',
  'Others'
];

export const PROPERTY_CONDITION_OPTIONS = [
  'Vacant',
  'Tenant on Notice Period',
  'New Property',
  'Need Help to Manage'
];