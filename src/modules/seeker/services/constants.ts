// src/modules/seeker/services/constants.ts
// Version: 1.0.0
// Last Modified: 09-05-2025 13:30 IST
// Purpose: Constants used across seeker services

// Colored marker URLs from Google Maps
export const markerPins = {
  residential: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  apartment: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  commercial: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  land: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  office: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  shop: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  default: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
};

// Property Type Quick Filter options
export const propertyTypeOptions = [
  { id: 'all', label: 'All Types', icon: 'Home' },
  { id: 'apartment', label: 'Apartment', icon: 'Building2' },
  { id: 'house', label: 'House', icon: 'Home' },
  { id: 'commercial', label: 'Commercial', icon: 'Warehouse' },
  { id: 'land', label: 'Land', icon: 'LandPlot' },
];

// Property filter interface
export interface PropertyFilters {
  searchQuery?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  propertyAge?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

// Similar properties options interface
export interface SimilarPropertiesOptions {
  currentPropertyId: string;
  city?: string;
  state?: string;
  propertyType?: string;
  bedrooms?: number;
  price?: number;
  limit?: number;
}