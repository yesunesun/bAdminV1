// src/modules/owner/components/property/wizard/validation/fieldValidationConfig.ts
// Version: 1.2.0
// Last Modified: 30-05-2025 16:35 IST
// Purpose: Fixed sale details validation - added missing required fields

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
  dependsOn?: string;
  showWhen?: (formData: any) => boolean;
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

// Basic validation configurations (simplified version)
export const BASIC_FIELD_VALIDATIONS: Record<string, ValidationRule> = {
  // Location fields
  address: COMMON_VALIDATIONS.ADDRESS,
  city: COMMON_VALIDATIONS.REQUIRED,
  state: COMMON_VALIDATIONS.REQUIRED,
  pinCode: COMMON_VALIDATIONS.PIN_CODE,
  locality: COMMON_VALIDATIONS.REQUIRED,
  
  // Property details
  propertyType: COMMON_VALIDATIONS.REQUIRED,
  bhkType: COMMON_VALIDATIONS.REQUIRED,
  floor: { required: true, min: 0 },
  totalFloors: { required: true, min: 1 },
  propertyAge: COMMON_VALIDATIONS.REQUIRED,
  facing: COMMON_VALIDATIONS.REQUIRED,
  builtUpArea: { required: true, min: 100 },
  bathrooms: { required: true, min: 1 },
  
  // FIXED: Added sale details required fields
  expectedPrice: { required: true, min: 10000 },
  maintenanceCost: { required: true, min: 0 },
  kitchenType: COMMON_VALIDATIONS.REQUIRED,
  availableFrom: COMMON_VALIDATIONS.REQUIRED,
  furnishing: COMMON_VALIDATIONS.REQUIRED,
  parking: COMMON_VALIDATIONS.REQUIRED,
  
  // Coordinates
  latitude: COMMON_VALIDATIONS.REQUIRED,
  longitude: COMMON_VALIDATIONS.REQUIRED
};

// Helper functions for validation
export const validateField = (fieldName: string, value: any, formData?: any): string | null => {
  const validation = BASIC_FIELD_VALIDATIONS[fieldName];
  if (!validation) return null;
  
  // Check required validation
  if (validation.required && (!value || (Array.isArray(value) && value.length === 0))) {
    return `${getFieldLabel(fieldName)} is required`;
  }
  
  // Skip other validations if field is empty and not required
  if (!validation.required && (!value || value === '')) {
    return null;
  }
  
  // String length validations
  if (typeof value === 'string') {
    if (validation.minLength && value.length < validation.minLength) {
      return `${getFieldLabel(fieldName)} must be at least ${validation.minLength} characters`;
    }
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${getFieldLabel(fieldName)} must not exceed ${validation.maxLength} characters`;
    }
  }
  
  // Number validations
  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
    const numValue = Number(value);
    if (validation.min !== undefined && numValue < validation.min) {
      return `${getFieldLabel(fieldName)} must be at least ${validation.min}`;
    }
    if (validation.max !== undefined && numValue > validation.max) {
      return `${getFieldLabel(fieldName)} must not exceed ${validation.max}`;
    }
  }
  
  // Pattern validation
  if (validation.pattern && typeof value === 'string' && !validation.pattern.test(value)) {
    if (fieldName === 'pinCode') {
      return 'PIN code must be exactly 6 digits';
    }
    return `${getFieldLabel(fieldName)} format is invalid`;
  }
  
  // Custom validation
  if (validation.custom) {
    return validation.custom(value, formData);
  }
  
  return null;
};

// Get user-friendly field label
const getFieldLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    address: 'Address',
    city: 'City',
    state: 'State',
    pinCode: 'PIN Code',
    locality: 'Locality',
    propertyType: 'Property Type',
    bhkType: 'BHK Configuration',
    floor: 'Floor',
    totalFloors: 'Total Floors',
    propertyAge: 'Property Age',
    facing: 'Facing Direction',
    builtUpArea: 'Built-up Area',
    bathrooms: 'Bathrooms',
    latitude: 'Latitude',
    longitude: 'Longitude',
    // FIXED: Added sale details field labels
    expectedPrice: 'Expected Price',
    maintenanceCost: 'Maintenance Cost',
    kitchenType: 'Kitchen Type',
    availableFrom: 'Available From',
    furnishing: 'Furnishing',
    parking: 'Parking'
  };
  return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

// Validate step data
export const validateStep = (stepId: string, formData: any): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Get step data
  const stepData = formData.steps?.[stepId] || {};
  
  // Get required fields for step
  const requiredFields = getRequiredFieldsForStep(stepId);
  
  // Validate each required field
  for (const fieldName of requiredFields) {
    const fieldValue = stepData[fieldName];
    const error = validateField(fieldName, fieldValue, formData);
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Get required fields for step - FIXED: Added sale details step fields
const getRequiredFieldsForStep = (stepId: string): string[] => {
  const stepFieldMap: Record<string, string[]> = {
    // Residential rent
    'res_rent_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms'],
    'res_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    
    // Residential sale
    'res_sale_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms'],
    'res_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    // FIXED: Added all required fields for sale details step
    'res_sale_sale_details': ['expectedPrice', 'maintenanceCost', 'kitchenType', 'availableFrom', 'furnishing', 'parking'],
    
    // Commercial rent
    'com_rent_basic_details': ['propertyType', 'floor', 'totalFloors', 'propertyAge', 'builtUpArea'],
    'com_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    
    // Commercial sale
    'com_sale_basic_details': ['propertyType', 'floor', 'totalFloors', 'propertyAge', 'builtUpArea'],
    'com_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    // FIXED: Added commercial sale details step
    'com_sale_sale_details': ['expectedPrice', 'maintenanceCost', 'kitchenType', 'availableFrom', 'furnishing', 'parking'],
    
    // Land sale
    'land_sale_basic_details': ['propertyType', 'builtUpArea'],
    'land_sale_location': ['address', 'city', 'state', 'pinCode'],
    
    // Default fallback
    'default': ['propertyType', 'address', 'city', 'state']
  };
  
  return stepFieldMap[stepId] || stepFieldMap['default'];
};

// Helper function to get step validation config (simplified)
export const getStepValidationConfig = (flowType: string, stepId: string): StepValidationConfig | null => {
  const requiredFields = getRequiredFieldsForStep(stepId);
  
  const fields: FieldConfig[] = requiredFields.map(fieldName => ({
    name: fieldName,
    label: getFieldLabel(fieldName),
    type: getFieldType(fieldName),
    validation: BASIC_FIELD_VALIDATIONS[fieldName] || COMMON_VALIDATIONS.OPTIONAL
  }));
  
  return {
    stepId,
    stepName: getStepName(stepId),
    fields
  };
};

// Get field type
const getFieldType = (fieldName: string): FieldConfig['type'] => {
  const typeMap: Record<string, FieldConfig['type']> = {
    address: 'textarea',
    propertyType: 'select',
    bhkType: 'select',
    propertyAge: 'select',
    facing: 'select',
    floor: 'number',
    totalFloors: 'number',
    bathrooms: 'number',
    builtUpArea: 'number',
    // FIXED: Added sale details field types
    expectedPrice: 'number',
    maintenanceCost: 'number',
    kitchenType: 'select',
    availableFrom: 'date',
    furnishing: 'select',
    parking: 'select'
  };
  return typeMap[fieldName] || 'text';
};

// Get step name
const getStepName = (stepId: string): string => {
  const nameMap: Record<string, string> = {
    'res_rent_basic_details': 'Property Details',
    'res_rent_location': 'Location Details',
    'res_sale_basic_details': 'Property Details',
    'res_sale_location': 'Location Details',
    // FIXED: Added sale details step name
    'res_sale_sale_details': 'Sale Details',
    'com_rent_basic_details': 'Commercial Details',
    'com_rent_location': 'Location Details',
    'com_sale_basic_details': 'Commercial Details',
    'com_sale_location': 'Location Details',
    // FIXED: Added commercial sale details step name
    'com_sale_sale_details': 'Sale Details',
    'land_sale_basic_details': 'Land Details',
    'land_sale_location': 'Location Details'
  };
  return nameMap[stepId] || 'Step Details';
};

// Helper function to check if step is valid
export const isStepValid = (flowType: string, stepId: string, formData: any): boolean => {
  const validation = validateStep(stepId, formData);
  return validation.isValid;
};