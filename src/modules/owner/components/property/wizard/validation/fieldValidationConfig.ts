// src/modules/owner/components/property/wizard/validation/fieldValidationConfig.ts
// Version: 2.4.0
// Last Modified: 03-06-2025 14:30 IST
// Purpose: Fixed residential sale validation - removed bathrooms requirement and fixed totalFloors validation

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

// ✅ UPDATED: Fixed totalFloors validation and conditionally required bathrooms
export const BASIC_FIELD_VALIDATIONS: Record<string, ValidationRule> = {
  // Location fields
  address: COMMON_VALIDATIONS.ADDRESS,
  city: COMMON_VALIDATIONS.REQUIRED,
  state: COMMON_VALIDATIONS.REQUIRED,
  pinCode: COMMON_VALIDATIONS.PIN_CODE,
  locality: COMMON_VALIDATIONS.REQUIRED,
  
  // Property details - ✅ FIXED: Updated totalFloors validation to handle string/number conversion
  propertyType: COMMON_VALIDATIONS.REQUIRED,
  bhkType: COMMON_VALIDATIONS.REQUIRED,
  floor: { 
    required: true, 
    min: 0,
    custom: (value: any) => {
      if (!value && value !== 0) return 'Floor is required';
      const numValue = typeof value === 'string' ? parseInt(value) : value;
      if (isNaN(numValue) || numValue < 0) return 'Floor must be a valid number (0 or greater)';
      return null;
    }
  },
  totalFloors: { 
    required: true, 
    min: 1,
    custom: (value: any) => {
      if (!value) return 'Total floors is required';
      const numValue = typeof value === 'string' ? parseInt(value) : value;
      if (isNaN(numValue) || numValue < 1) return 'Total floors must be a valid number (1 or greater)';
      return null;
    }
  },
  propertyAge: COMMON_VALIDATIONS.REQUIRED,
  facing: COMMON_VALIDATIONS.REQUIRED,
  builtUpArea: { 
    required: true, 
    min: 100,
    custom: (value: any) => {
      if (!value) return 'Built-up area is required';
      const numValue = typeof value === 'string' ? parseInt(value) : value;
      if (isNaN(numValue) || numValue < 100) return 'Built-up area must be at least 100 sq ft';
      return null;
    }
  },
  // ✅ FIXED: Made bathrooms conditionally required based on flow type
  bathrooms: { 
    required: false, // Default to not required
    min: 1,
    custom: (value: any, formData: any) => {
      // Check if bathrooms should be required for this specific flow/step
      const flowType = formData?.flow?.flowType || formData?.flowType;
      const currentStep = getCurrentStepId(formData);
      
      // Only require bathrooms for flows that actually have this field in their form
      const requiresBathrooms = shouldRequireBathrooms(flowType, currentStep);
      
      if (requiresBathrooms) {
        if (!value) return 'Bathrooms is required';
        const numValue = typeof value === 'string' ? parseInt(value) : value;
        if (isNaN(numValue) || numValue < 1) return 'Bathrooms must be at least 1';
      }
      return null;
    }
  },
  availableFrom: COMMON_VALIDATIONS.REQUIRED,
  
  // Sale details fields
  expectedPrice: { required: true, min: 10000 },
  maintenanceCost: { required: true, min: 0 },
  kitchenType: COMMON_VALIDATIONS.REQUIRED,
  furnishing: COMMON_VALIDATIONS.REQUIRED,
  parking: COMMON_VALIDATIONS.REQUIRED,
  
  // Commercial property fields
  commercialPropertyType: COMMON_VALIDATIONS.REQUIRED,
  rentAmount: { required: true, min: 1000 },
  securityDeposit: { required: true, min: 0 },
  leaseDuration: COMMON_VALIDATIONS.REQUIRED,
  maintenance: COMMON_VALIDATIONS.REQUIRED,
  powerBackup: COMMON_VALIDATIONS.REQUIRED,
  lockInPeriod: { required: true, min: 0, max: 60 },
  
  // Commercial rental fields
  rentalType: COMMON_VALIDATIONS.REQUIRED,
  camCharges: { required: true, min: 0 },
  advanceRent: { required: true, min: 0, max: 12 },
  operatingHours: COMMON_VALIDATIONS.REQUIRED,
  businessPreferences: { required: true },
  
  // Commercial features fields
  lift: COMMON_VALIDATIONS.REQUIRED,
  parkingType: COMMON_VALIDATIONS.REQUIRED,
  washroomType: COMMON_VALIDATIONS.REQUIRED,
  propertyCondition: COMMON_VALIDATIONS.REQUIRED,
  
  // Commercial sale fields  
  ownershipType: COMMON_VALIDATIONS.REQUIRED,
  
  // PG/Hostel room details fields
  roomType: COMMON_VALIDATIONS.REQUIRED,
  roomCapacity: { required: true, min: 1 },
  expectedRent: { required: true, min: 1000 },
  expectedDeposit: { required: true, min: 0 },
  bathroomType: COMMON_VALIDATIONS.REQUIRED,
  roomSize: { required: true, min: 50 },
  mealOption: COMMON_VALIDATIONS.REQUIRED,
  roomFeatures: { required: false },
  
  // PG Details specific fields
  genderPreference: COMMON_VALIDATIONS.REQUIRED,
  occupantType: COMMON_VALIDATIONS.REQUIRED,
  
  // Amenities fields
  propertyShowOption: COMMON_VALIDATIONS.REQUIRED,
  amenities: { required: true },
  
  // Coordinates
  latitude: COMMON_VALIDATIONS.REQUIRED,
  longitude: COMMON_VALIDATIONS.REQUIRED
};

// ✅ NEW: Helper function to determine current step ID
const getCurrentStepId = (formData: any): string => {
  // Try to get from various possible locations
  return formData?.currentStep || 
         formData?.stepId || 
         formData?.currentStepId ||
         '';
};

// ✅ NEW: Helper function to determine if bathrooms should be required
const shouldRequireBathrooms = (flowType: string, stepId: string): boolean => {
  // Map of flows and steps that should require bathrooms
  const bathroomRequiredFlows = {
    'residential_rent': ['res_rent_features'],
    'commercial_rent': ['com_rent_features'],
    'commercial_sale': ['com_sale_features'],
    'residential_pghostel': ['res_pg_features'],
    'residential_flatmates': ['res_flat_features']
  };
  
  // Residential sale should NOT require bathrooms in property details step
  if (flowType === 'residential_sale' && stepId === 'res_sale_basic_details') {
    return false;
  }
  
  // Check if current flow/step combination should require bathrooms
  const requiredSteps = bathroomRequiredFlows[flowType] || [];
  return requiredSteps.includes(stepId);
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
    availableFrom: 'Available From',
    
    // Sale details field labels
    expectedPrice: 'Expected Price',
    maintenanceCost: 'Maintenance Cost',
    kitchenType: 'Kitchen Type',
    furnishing: 'Furnishing',
    parking: 'Parking',
    
    // Commercial property field labels
    commercialPropertyType: 'Commercial Property Type',
    rentAmount: 'Rent Amount',
    securityDeposit: 'Security Deposit',
    leaseDuration: 'Lease Duration',
    maintenance: 'Maintenance',
    powerBackup: 'Power Backup',
    lockInPeriod: 'Lock-in Period',
    
    // Commercial rental field labels
    rentalType: 'Rental Type',
    camCharges: 'CAM Charges',
    advanceRent: 'Advance Rent',
    operatingHours: 'Operating Hours',
    businessPreferences: 'Business Preferences',
    
    // Commercial features field labels
    lift: 'Lift/Elevator',
    parkingType: 'Parking Type',
    washroomType: 'Washroom Type',
    propertyCondition: 'Property Condition',
    
    // Commercial sale field labels
    ownershipType: 'Ownership Type',
    
    // PG/Hostel room details field labels
    roomType: 'Room Type',
    roomCapacity: 'Room Capacity',
    expectedRent: 'Expected Rent',
    expectedDeposit: 'Expected Deposit',
    bathroomType: 'Bathroom Type',
    roomSize: 'Room Size',
    mealOption: 'Meal Option',
    roomFeatures: 'Room Features',
    
    // PG Details specific field labels
    genderPreference: 'Gender Preference',
    occupantType: 'Preferred Guests',
    
    // Amenities field labels
    propertyShowOption: 'Who Shows Property',
    amenities: 'Amenities'
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
    const error = validateField(fieldName, fieldValue, { ...formData, currentStep: stepId });
    if (error) {
      errors[fieldName] = error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ✅ UPDATED: Fixed required fields mapping - removed bathrooms from property details steps
const getRequiredFieldsForStep = (stepId: string): string[] => {
  const stepFieldMap: Record<string, string[]> = {
    // ✅ FIXED: Residential rent - removed bathrooms from basic details
    'res_rent_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'availableFrom'],
    'res_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    'res_rent_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
    
    // ✅ FIXED: Residential sale - removed bathrooms from basic details
    'res_sale_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'availableFrom'],
    'res_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    'res_sale_sale_details': ['expectedPrice', 'maintenanceCost', 'kitchenType', 'availableFrom', 'furnishing', 'parking'],
    'res_sale_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
    
    // PG/Hostel steps - bathrooms handled in room details or features
    'res_pg_basic_details': ['roomType', 'roomCapacity', 'expectedRent', 'expectedDeposit', 'bathroomType', 'roomSize', 'mealOption'],
    'res_pg_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    'res_pg_pg_details': ['genderPreference', 'occupantType', 'mealOption', 'availableFrom'],
    'res_pg_features': ['propertyShowOption', 'propertyCondition', 'amenities'],
    
    // Commercial rent
    'com_rent_basic_details': ['commercialPropertyType', 'builtUpArea', 'rentAmount', 'securityDeposit', 'leaseDuration', 'maintenance', 'furnishing', 'parking', 'powerBackup', 'lockInPeriod', 'availableFrom'],
    'com_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    'com_rent_rental': ['rentalType', 'rentAmount', 'securityDeposit', 'advanceRent', 'maintenance', 'camCharges', 'availableFrom', 'parking', 'operatingHours', 'businessPreferences'],
    'com_rent_features': ['powerBackup', 'lift', 'parkingType', 'washroomType', 'propertyCondition'],
    
    // Commercial sale
    'com_sale_basic_details': ['commercialPropertyType', 'builtUpArea', 'floor', 'totalFloors', 'propertyAge'],
    'com_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    'com_sale_sale_details': ['expectedPrice', 'ownershipType', 'availableFrom'],
    'com_sale_features': ['powerBackup', 'lift', 'parkingType', 'washroomType', 'propertyCondition'],
    
    // Commercial coworking
    'com_cow_basic_details': ['propertyType', 'spaceType', 'capacity'],
    'com_cow_location': ['address', 'city', 'state', 'pinCode', 'locality'],
    'com_cow_features': ['propertyShowOption', 'propertyCondition', 'amenities'],
    
    // Land sale
    'land_sale_basic_details': ['propertyType', 'builtUpArea'],
    'land_sale_location': ['address', 'city', 'state', 'pinCode'],
    'land_sale_land_features': ['expectedPrice'],
    
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
    availableFrom: 'date',
    
    // Sale details field types
    expectedPrice: 'number',
    maintenanceCost: 'number',
    kitchenType: 'select',
    furnishing: 'select',
    parking: 'select',
    
    // Commercial field types
    commercialPropertyType: 'select',
    rentAmount: 'number',
    securityDeposit: 'number',
    leaseDuration: 'select',
    maintenance: 'select',
    powerBackup: 'select',
    lockInPeriod: 'number',
    rentalType: 'select',
    camCharges: 'number',
    advanceRent: 'number',
    operatingHours: 'select',
    businessPreferences: 'checkbox',
    lift: 'select',
    parkingType: 'select',
    washroomType: 'select',
    propertyCondition: 'select',
    ownershipType: 'radio',
    
    // PG/Hostel field types
    roomType: 'select',
    roomCapacity: 'number',
    expectedRent: 'number',
    expectedDeposit: 'number',
    bathroomType: 'select',
    roomSize: 'number',
    mealOption: 'select',
    roomFeatures: 'checkbox',
    genderPreference: 'radio',
    occupantType: 'select',
    
    propertyShowOption: 'select',
    amenities: 'checkbox'
  };
  return typeMap[fieldName] || 'text';
};

// Get step name
const getStepName = (stepId: string): string => {
  const nameMap: Record<string, string> = {
    'res_rent_basic_details': 'Property Details',
    'res_rent_location': 'Location Details',
    'res_rent_features': 'Amenities & Features',
    'res_sale_basic_details': 'Property Details',
    'res_sale_location': 'Location Details',
    'res_sale_sale_details': 'Sale Details',
    'res_sale_features': 'Amenities & Features',
    
    // PG/Hostel step names
    'res_pg_basic_details': 'Room Details',
    'res_pg_location': 'Location Details',
    'res_pg_pg_details': 'PG Details',
    'res_pg_features': 'Amenities & Features',
    
    // Commercial step names
    'com_rent_basic_details': 'Commercial Details',
    'com_rent_location': 'Location Details',
    'com_rent_rental': 'Rental Details',
    'com_rent_features': 'Commercial Features',
    'com_sale_basic_details': 'Commercial Details',
    'com_sale_location': 'Location Details',
    'com_sale_sale_details': 'Sale Details',
    'com_sale_features': 'Commercial Features',
    'com_cow_basic_details': 'Coworking Details',
    'com_cow_location': 'Location Details',
    'com_cow_features': 'Coworking Features',
    
    'land_sale_basic_details': 'Land Details',
    'land_sale_location': 'Location Details',
    'land_sale_land_features': 'Land Features'
  };
  return nameMap[stepId] || 'Step Details';
};

// Helper function to check if step is valid
export const isStepValid = (flowType: string, stepId: string, formData: any): boolean => {
  const validation = validateStep(stepId, formData);
  return validation.isValid;
};