// src/modules/owner/components/property/wizard/validation/fieldValidationConfig.ts
// Version: 1.0.0
// Last Modified: 29-05-2025 16:15 IST
// Purpose: Comprehensive field validation configuration for all 8 property flows

import { FLOW_TYPES, FLOW_STEPS } from '../constants/flows';

// Validation types
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any, formData: any) => string | null;
};

export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'date' | 'file';
  validation: ValidationRule;
  helperText?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  dependsOn?: string; // Field that this field depends on
  showWhen?: (formData: any) => boolean; // Conditional visibility
};

export type StepValidationConfig = {
  stepId: string;
  stepName: string;
  fields: FieldConfig[];
  customValidation?: (formData: any) => string | null;
};

export type FlowValidationConfig = {
  flowType: string;
  flowName: string;
  steps: StepValidationConfig[];
};

// Common validation rules
export const COMMON_VALIDATIONS = {
  REQUIRED: { required: true },
  OPTIONAL: { required: false },
  PIN_CODE: { 
    required: true, 
    pattern: /^\d{6}$/, 
    minLength: 6, 
    maxLength: 6 
  },
  PHONE: { 
    required: false, 
    pattern: /^\d{10}$/, 
    minLength: 10, 
    maxLength: 10 
  },
  POSITIVE_NUMBER: { 
    required: true, 
    min: 1 
  },
  PRICE: { 
    required: true, 
    min: 1000 
  },
  AREA: { 
    required: true, 
    min: 50 
  },
  ADDRESS: { 
    required: true, 
    minLength: 10, 
    maxLength: 500 
  },
  COORDINATES: {
    required: true,
    custom: (value: any) => {
      if (!value || typeof value !== 'object') return 'Coordinates are required';
      if (!value.latitude || !value.longitude) return 'Please select location on map';
      if (Math.abs(value.latitude) > 90 || Math.abs(value.longitude) > 180) {
        return 'Invalid coordinates';
      }
      return null;
    }
  }
};

// Common field configurations
export const COMMON_FIELDS = {
  // Location fields (shared across all flows)
  ADDRESS: {
    name: 'address',
    label: 'Complete Address',
    type: 'textarea' as const,
    validation: COMMON_VALIDATIONS.ADDRESS,
    placeholder: 'Enter complete address',
    helperText: 'Provide detailed address for better visibility'
  },
  FLAT_PLOT_NO: {
    name: 'flatPlotNo',
    label: 'Flat/Plot Number',
    type: 'text' as const,
    validation: COMMON_VALIDATIONS.OPTIONAL,
    placeholder: 'e.g., A-101, Plot 45'
  },
  LANDMARK: {
    name: 'landmark',
    label: 'Landmark',
    type: 'text' as const,
    validation: COMMON_VALIDATIONS.OPTIONAL,
    placeholder: 'Nearby landmark (optional)'
  },
  CITY: {
    name: 'city',
    label: 'City',
    type: 'text' as const,
    validation: COMMON_VALIDATIONS.REQUIRED,
    placeholder: 'Enter city name'
  },
  STATE: {
    name: 'state',
    label: 'State',
    type: 'text' as const,
    validation: COMMON_VALIDATIONS.REQUIRED,
    placeholder: 'Enter state name'
  },
  PIN_CODE: {
    name: 'pinCode',
    label: 'PIN Code',
    type: 'text' as const,
    validation: COMMON_VALIDATIONS.PIN_CODE,
    placeholder: '6-digit PIN code'
  },
  COORDINATES: {
    name: 'coordinates',
    label: 'Map Location',
    type: 'text' as const,
    validation: COMMON_VALIDATIONS.COORDINATES,
    helperText: 'Click on the map to select exact location'
  },

  // Common amenities
  AMENITIES: {
    name: 'amenities',
    label: 'Amenities',
    type: 'checkbox' as const,
    validation: { 
      required: true,
      custom: (value: string[]) => {
        if (!value || value.length === 0) return 'Select at least one amenity';
        return null;
      }
    },
    helperText: 'Select all available amenities'
  }
};

// Validation configurations for all 8 flows
export const FLOW_VALIDATION_CONFIGS: Record<string, FlowValidationConfig> = {
  
  // 1. RESIDENTIAL RENT FLOW
  [FLOW_TYPES.RESIDENTIAL_RENT]: {
    flowType: FLOW_TYPES.RESIDENTIAL_RENT,
    flowName: 'Residential Rent',
    steps: [
      {
        stepId: 'res_rent_basic_details',
        stepName: 'Property Details',
        fields: [
          {
            name: 'title',
            label: 'Property Title',
            type: 'text',
            validation: COMMON_VALIDATIONS.REQUIRED,
            placeholder: 'e.g., 2BHK Apartment in Banjara Hills',
            helperText: 'Give an attractive title to your property'
          },
          {
            name: 'propertyType',
            label: 'Property Type',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'apartment', label: 'Apartment' },
              { value: 'house', label: 'Independent House' },
              { value: 'villa', label: 'Villa' },
              { value: 'builder_floor', label: 'Builder Floor' }
            ]
          },
          {
            name: 'bhkType',
            label: 'BHK Configuration',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: '1rk', label: '1 RK' },
              { value: '1bhk', label: '1 BHK' },
              { value: '2bhk', label: '2 BHK' },
              { value: '3bhk', label: '3 BHK' },
              { value: '4bhk', label: '4 BHK' },
              { value: '4plus', label: '4+ BHK' }
            ]
          },
          {
            name: 'floor',
            label: 'Floor',
            type: 'number',
            validation: { required: true, min: 0, max: 100 },
            placeholder: 'Floor number'
          },
          {
            name: 'totalFloors',
            label: 'Total Floors in Building',
            type: 'number',
            validation: { required: true, min: 1, max: 100 },
            placeholder: 'Total floors'
          },
          {
            name: 'builtUpArea',
            label: 'Built-up Area',
            type: 'number',
            validation: COMMON_VALIDATIONS.AREA,
            placeholder: 'Area in sq ft'
          },
          {
            name: 'bathrooms',
            label: 'Bathrooms',
            type: 'number',
            validation: { required: true, min: 1, max: 10 },
            placeholder: 'Number of bathrooms'
          },
          {
            name: 'facing',
            label: 'Facing Direction',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'north', label: 'North' },
              { value: 'south', label: 'South' },
              { value: 'east', label: 'East' },
              { value: 'west', label: 'West' },
              { value: 'north_east', label: 'North-East' },
              { value: 'north_west', label: 'North-West' },
              { value: 'south_east', label: 'South-East' },
              { value: 'south_west', label: 'South-West' }
            ]
          },
          {
            name: 'propertyAge',
            label: 'Property Age',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'under_construction', label: 'Under Construction' },
              { value: '0_1_years', label: '0-1 Years' },
              { value: '1_3_years', label: '1-3 Years' },
              { value: '3_5_years', label: '3-5 Years' },
              { value: '5_10_years', label: '5-10 Years' },
              { value: '10_plus_years', label: '10+ Years' }
            ]
          }
        ]
      },
      {
        stepId: 'res_rent_location',
        stepName: 'Location Details',
        fields: [
          COMMON_FIELDS.ADDRESS,
          COMMON_FIELDS.FLAT_PLOT_NO,
          COMMON_FIELDS.LANDMARK,
          COMMON_FIELDS.CITY,
          COMMON_FIELDS.STATE,
          COMMON_FIELDS.PIN_CODE,
          COMMON_FIELDS.COORDINATES
        ]
      },
      {
        stepId: 'res_rent_rental',
        stepName: 'Rental Details',
        fields: [
          {
            name: 'rentAmount',
            label: 'Monthly Rent',
            type: 'number',
            validation: COMMON_VALIDATIONS.PRICE,
            placeholder: 'Monthly rent in ₹',
            helperText: 'Enter monthly rent amount'
          },
          {
            name: 'securityDeposit',
            label: 'Security Deposit',
            type: 'number',
            validation: COMMON_VALIDATIONS.PRICE,
            placeholder: 'Security deposit in ₹'
          },
          {
            name: 'maintenanceCharges',
            label: 'Maintenance Charges',
            type: 'number',
            validation: COMMON_VALIDATIONS.OPTIONAL,
            placeholder: 'Monthly maintenance in ₹'
          },
          {
            name: 'availableFrom',
            label: 'Available From',
            type: 'date',
            validation: COMMON_VALIDATIONS.REQUIRED,
            helperText: 'When will the property be available?'
          },
          {
            name: 'furnishingStatus',
            label: 'Furnishing Status',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'unfurnished', label: 'Unfurnished' },
              { value: 'semi_furnished', label: 'Semi-Furnished' },
              { value: 'fully_furnished', label: 'Fully Furnished' }
            ]
          },
          {
            name: 'preferredTenants',
            label: 'Preferred Tenants',
            type: 'checkbox',
            validation: { 
              required: true,
              custom: (value: string[]) => {
                if (!value || value.length === 0) return 'Select at least one tenant type';
                return null;
              }
            },
            options: [
              { value: 'family', label: 'Family' },
              { value: 'bachelors', label: 'Bachelors' },
              { value: 'students', label: 'Students' },
              { value: 'professionals', label: 'Working Professionals' }
            ]
          }
        ]
      },
      {
        stepId: 'res_rent_features',
        stepName: 'Features & Amenities',
        fields: [
          {
            ...COMMON_FIELDS.AMENITIES,
            options: [
              { value: 'parking', label: 'Parking' },
              { value: 'gym', label: 'Gym/Fitness Center' },
              { value: 'swimming_pool', label: 'Swimming Pool' },
              { value: 'garden', label: 'Garden/Terrace' },
              { value: 'elevator', label: 'Elevator' },
              { value: 'security', label: '24/7 Security' },
              { value: 'power_backup', label: 'Power Backup' },
              { value: 'water_supply', label: '24/7 Water Supply' },
              { value: 'internet', label: 'Internet/WiFi Ready' },
              { value: 'club_house', label: 'Club House' }
            ]
          },
          {
            name: 'petFriendly',
            label: 'Pet Friendly',
            type: 'checkbox',
            validation: COMMON_VALIDATIONS.OPTIONAL
          },
          {
            name: 'nonVegAllowed',
            label: 'Non-Veg Cooking Allowed',
            type: 'checkbox',
            validation: COMMON_VALIDATIONS.OPTIONAL
          }
        ]
      }
    ]
  },

  // 2. RESIDENTIAL SALE FLOW
  [FLOW_TYPES.RESIDENTIAL_SALE]: {
    flowType: FLOW_TYPES.RESIDENTIAL_SALE,
    flowName: 'Residential Sale',
    steps: [
      {
        stepId: 'res_sale_basic_details',
        stepName: 'Property Details',
        fields: [
          // Reuse most fields from residential rent basic details
          ...FLOW_VALIDATION_CONFIGS[FLOW_TYPES.RESIDENTIAL_RENT].steps[0].fields
        ]
      },
      {
        stepId: 'res_sale_location',
        stepName: 'Location Details',
        fields: [
          // Reuse location fields
          ...FLOW_VALIDATION_CONFIGS[FLOW_TYPES.RESIDENTIAL_RENT].steps[1].fields
        ]
      },
      {
        stepId: 'res_sale_sale_details',
        stepName: 'Sale Details',
        fields: [
          {
            name: 'salePrice',
            label: 'Expected Price',
            type: 'number',
            validation: { required: true, min: 100000 },
            placeholder: 'Expected price in ₹',
            helperText: 'Enter your expected selling price'
          },
          {
            name: 'priceNegotiable',
            label: 'Price Negotiable',
            type: 'checkbox',
            validation: COMMON_VALIDATIONS.OPTIONAL
          },
          {
            name: 'possessionDate',
            label: 'Possession Date',
            type: 'date',
            validation: COMMON_VALIDATIONS.REQUIRED,
            helperText: 'When can buyer take possession?'
          },
          {
            name: 'furnishingStatus',
            label: 'Furnishing Status',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'unfurnished', label: 'Unfurnished' },
              { value: 'semi_furnished', label: 'Semi-Furnished' },
              { value: 'fully_furnished', label: 'Fully Furnished' }
            ]
          }
        ]
      },
      {
        stepId: 'res_sale_features',
        stepName: 'Features & Amenities',
        fields: [
          // Reuse amenities from residential rent
          ...FLOW_VALIDATION_CONFIGS[FLOW_TYPES.RESIDENTIAL_RENT].steps[3].fields
        ]
      }
    ]
  },

  // 3. COMMERCIAL RENT FLOW
  [FLOW_TYPES.COMMERCIAL_RENT]: {
    flowType: FLOW_TYPES.COMMERCIAL_RENT,
    flowName: 'Commercial Rent',
    steps: [
      {
        stepId: 'com_rent_basic_details',
        stepName: 'Commercial Property Details',
        fields: [
          {
            name: 'title',
            label: 'Property Title',
            type: 'text',
            validation: COMMON_VALIDATIONS.REQUIRED,
            placeholder: 'e.g., Commercial Space in IT Park',
            helperText: 'Give an attractive title to your commercial property'
          },
          {
            name: 'propertyType',
            label: 'Commercial Property Type',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'office', label: 'Office Space' },
              { value: 'retail', label: 'Retail Shop' },
              { value: 'warehouse', label: 'Warehouse' },
              { value: 'showroom', label: 'Showroom' },
              { value: 'restaurant', label: 'Restaurant Space' },
              { value: 'industrial', label: 'Industrial Space' }
            ]
          },
          {
            name: 'area',
            label: 'Total Area',
            type: 'number',
            validation: { required: true, min: 100 },
            placeholder: 'Area in sq ft'
          },
          {
            name: 'floor',
            label: 'Floor',
            type: 'number',
            validation: { required: true, min: 0, max: 100 },
            placeholder: 'Floor number'
          },
          {
            name: 'totalFloors',
            label: 'Total Floors in Building',
            type: 'number',
            validation: { required: true, min: 1, max: 100 },
            placeholder: 'Total floors'
          },
          {
            name: 'propertyAge',
            label: 'Property Age',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'under_construction', label: 'Under Construction' },
              { value: '0_1_years', label: '0-1 Years' },
              { value: '1_3_years', label: '1-3 Years' },
              { value: '3_5_years', label: '3-5 Years' },
              { value: '5_10_years', label: '5-10 Years' },
              { value: '10_plus_years', label: '10+ Years' }
            ]
          }
        ]
      },
      {
        stepId: 'com_rent_location',
        stepName: 'Location Details',
        fields: [
          // Reuse location fields
          ...COMMON_FIELDS.ADDRESS,
          ...COMMON_FIELDS.FLAT_PLOT_NO,
          ...COMMON_FIELDS.LANDMARK,
          ...COMMON_FIELDS.CITY,
          ...COMMON_FIELDS.STATE,
          ...COMMON_FIELDS.PIN_CODE,
          ...COMMON_FIELDS.COORDINATES
        ].map(field => ({ ...field }))
      },
      {
        stepId: 'com_rent_rental',
        stepName: 'Rental Details',
        fields: [
          {
            name: 'rentAmount',
            label: 'Monthly Rent',
            type: 'number',
            validation: { required: true, min: 5000 },
            placeholder: 'Monthly rent in ₹',
            helperText: 'Enter monthly rent amount'
          },
          {
            name: 'securityDeposit',
            label: 'Security Deposit',
            type: 'number',
            validation: { required: true, min: 10000 },
            placeholder: 'Security deposit in ₹'
          },
          {
            name: 'maintenanceCharges',
            label: 'Maintenance Charges',
            type: 'number',
            validation: COMMON_VALIDATIONS.OPTIONAL,
            placeholder: 'Monthly maintenance in ₹'
          },
          {
            name: 'availableFrom',
            label: 'Available From',
            type: 'date',
            validation: COMMON_VALIDATIONS.REQUIRED,
            helperText: 'When will the property be available?'
          },
          {
            name: 'leaseDuration',
            label: 'Minimum Lease Duration',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: '11_months', label: '11 Months' },
              { value: '1_year', label: '1 Year' },
              { value: '2_years', label: '2 Years' },
              { value: '3_years', label: '3 Years' },
              { value: '5_years', label: '5 Years' },
              { value: 'negotiable', label: 'Negotiable' }
            ]
          }
        ]
      },
      {
        stepId: 'com_rent_features',
        stepName: 'Commercial Features',
        fields: [
          {
            name: 'amenities',
            label: 'Commercial Amenities',
            type: 'checkbox',
            validation: { 
              required: true,
              custom: (value: string[]) => {
                if (!value || value.length === 0) return 'Select at least one amenity';
                return null;
              }
            },
            options: [
              { value: 'parking', label: 'Parking Space' },
              { value: 'elevator', label: 'Elevator' },
              { value: 'security', label: '24/7 Security' },
              { value: 'power_backup', label: 'Power Backup' },
              { value: 'water_supply', label: 'Water Supply' },
              { value: 'internet', label: 'Internet Ready' },
              { value: 'conference_room', label: 'Conference Room' },
              { value: 'reception', label: 'Reception Area' },
              { value: 'cafeteria', label: 'Cafeteria' },
              { value: 'fire_safety', label: 'Fire Safety' }
            ]
          },
          {
            name: 'suitableFor',
            label: 'Suitable For Business Types',
            type: 'checkbox',
            validation: { 
              required: true,
              custom: (value: string[]) => {
                if (!value || value.length === 0) return 'Select at least one business type';
                return null;
              }
            },
            options: [
              { value: 'it_software', label: 'IT/Software' },
              { value: 'consulting', label: 'Consulting' },
              { value: 'finance', label: 'Finance/Banking' },
              { value: 'retail', label: 'Retail Business' },
              { value: 'healthcare', label: 'Healthcare' },
              { value: 'education', label: 'Education/Training' },
              { value: 'manufacturing', label: 'Manufacturing' },
              { value: 'any', label: 'Any Business' }
            ]
          }
        ]
      }
    ]
  },

  // 4. LAND SALE FLOW
  [FLOW_TYPES.LAND_SALE]: {
    flowType: FLOW_TYPES.LAND_SALE,
    flowName: 'Land Sale',
    steps: [
      {
        stepId: 'land_sale_basic_details',
        stepName: 'Land/Plot Details',
        fields: [
          {
            name: 'title',
            label: 'Plot Title',
            type: 'text',
            validation: COMMON_VALIDATIONS.REQUIRED,
            placeholder: 'e.g., Residential Plot in Gachibowli',
            helperText: 'Give an attractive title to your land/plot'
          },
          {
            name: 'landType',
            label: 'Land Type',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'residential', label: 'Residential' },
              { value: 'commercial', label: 'Commercial' },
              { value: 'industrial', label: 'Industrial' },
              { value: 'agricultural', label: 'Agricultural' },
              { value: 'mixed_use', label: 'Mixed Use' }
            ]
          },
          {
            name: 'area',
            label: 'Total Area',
            type: 'number',
            validation: { required: true, min: 100 },
            placeholder: 'Area in sq ft/sq yds'
          },
          {
            name: 'areaUnit',
            label: 'Area Unit',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'sqft', label: 'Square Feet' },
              { value: 'sqyds', label: 'Square Yards' },
              { value: 'acres', label: 'Acres' },
              { value: 'guntas', label: 'Guntas' }
            ]
          },
          {
            name: 'salePrice',
            label: 'Expected Price',
            type: 'number',
            validation: { required: true, min: 100000 },
            placeholder: 'Expected price in ₹',
            helperText: 'Enter your expected selling price'
          }
        ]
      },
      {
        stepId: 'land_sale_location',
        stepName: 'Location Details',
        fields: [
          // Reuse location fields but adjust for land context
          {
            ...COMMON_FIELDS.ADDRESS,
            placeholder: 'Enter plot address/survey number'
          },
          COMMON_FIELDS.LANDMARK,
          COMMON_FIELDS.CITY,
          COMMON_FIELDS.STATE,
          COMMON_FIELDS.PIN_CODE,
          COMMON_FIELDS.COORDINATES
        ]
      },
      {
        stepId: 'land_sale_land_features',
        stepName: 'Land Features',
        fields: [
          {
            name: 'approvals',
            label: 'Approvals & Clearances',
            type: 'checkbox',
            validation: { 
              required: true,
              custom: (value: string[]) => {
                if (!value || value.length === 0) return 'Select applicable approvals';
                return null;
              }
            },
            options: [
              { value: 'gram_panchayat', label: 'Gram Panchayat Approved' },
              { value: 'dtcp', label: 'DTCP Approved' },
              { value: 'hmda', label: 'HMDA Approved' },
              { value: 'rera', label: 'RERA Approved' },
              { value: 'municipal', label: 'Municipal Approved' },
              { value: 'none', label: 'No Approvals Yet' }
            ]
          },
          {
            name: 'boundaryStatus',
            label: 'Boundary Status',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'clear', label: 'Clear Boundaries' },
              { value: 'partial', label: 'Partially Demarcated' },
              { value: 'disputed', label: 'Boundary Disputes' },
              { value: 'unknown', label: 'Not Sure' }
            ]
          },
          {
            name: 'roadAccess',
            label: 'Road Access',
            type: 'select',
            validation: COMMON_VALIDATIONS.REQUIRED,
            options: [
              { value: 'paved_road', label: 'Paved Road Access' },
              { value: 'unpaved_road', label: 'Unpaved Road Access' },
              { value: 'no_direct_access', label: 'No Direct Road Access' }
            ]
          },
          {
            name: 'cornerPlot',
            label: 'Corner Plot',
            type: 'checkbox',
            validation: COMMON_VALIDATIONS.OPTIONAL,
            helperText: 'Check if this is a corner plot'
          }
        ]
      }
    ]
  }

  // TODO: Add remaining flows (Commercial Sale, Residential Flatmates, Residential PG/Hostel, Commercial Coworking)
  // These will be added in subsequent iterations to keep the file manageable
};

// Helper functions for validation
export const validateField = (field: FieldConfig, value: any, formData?: any): string | null => {
  const { validation } = field;
  
  // Check required validation
  if (validation.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return `${field.label} is required`;
  }
  
  // Skip other validations if field is empty and not required
  if (!validation.required && (!value || value === '')) {
    return null;
  }
  
  // String length validations
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} must not exceed ${validation.maxLength} characters`;
    }
  }
  
  // Number validations
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = Number(value);
    if (validation.min && numValue < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }
    if (validation.max && numValue > validation.max) {
      return `${field.label} must not exceed ${validation.max}`;
    }
  }
  
  // Pattern validation
  if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
    return `${field.label} format is invalid`;
  }
  
  // Custom validation
  if (validation.custom) {
    return validation.custom(value, formData);
  }
  
  return null;
};

export const validateStep = (stepConfig: StepValidationConfig, formData: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate each field in the step
  for (const field of stepConfig.fields) {
    // Get field value from formData (supporting nested paths)
    const fieldValue = getNestedValue(formData, field.name);
    
    // Check field visibility condition
    if (field.showWhen && !field.showWhen(formData)) {
      continue; // Skip validation for hidden fields
    }
    
    // Validate the field
    const error = validateField(field, fieldValue, formData);
    if (error) {
      errors[field.name] = error;
    }
  }
  
  // Run custom step validation if provided
  if (stepConfig.customValidation) {
    const customError = stepConfig.customValidation(formData);
    if (customError) {
      errors._step = customError;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Helper function to get nested values from form data
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

// Helper function to get step validation config
export const getStepValidationConfig = (flowType: string, stepId: string): StepValidationConfig | null => {
  const flow = FLOW_VALIDATION_CONFIGS[flowType];
  if (!flow) return null;
  
  return flow.steps.find(step => step.stepId === stepId) || null;
};

// Helper function to get all required fields for a step
export const getRequiredFields = (stepConfig: StepValidationConfig): string[] => {
  return stepConfig.fields
    .filter(field => field.validation.required)
    .map(field => field.name);
};

// Helper function to check if step is valid
export const isStepValid = (flowType: string, stepId: string, formData: any): boolean => {
  const stepConfig = getStepValidationConfig(flowType, stepId);
  if (!stepConfig) return true; // No validation config means valid
  
  const validation = validateStep(stepConfig, formData);
  return validation.isValid;
};