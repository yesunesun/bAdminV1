// src/modules/owner/components/property/wizard/hooks/useStepValidation.ts
// Version: 5.8.0
// Last Modified: 02-06-2025 19:35 IST
// Purpose: Fixed commercial sale features validation to match actual CommercialFeatures.tsx requirements

import { useState, useCallback, useMemo, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

interface UseStepValidationProps {
 form: UseFormReturn<FormData>;
 flowType: string;
 currentStepId: string;
}

interface ValidationSummary {
 isValid: boolean;
 completionPercentage: number;
 totalRequiredFields: number;
 completedFields: number;
 invalidFields: Array<{
   name: string;
   label: string;
   error: string;
 }>;
}

interface CrossFieldValidationRule {
 fields: string[];
 validate: (values: Record<string, any>) => { isValid: boolean; error?: string };
}

export function useStepValidation({
 form,
 flowType,
 currentStepId
}: UseStepValidationProps) {
 
 // Simple state - track validation results
 const [validationResults, setValidationResults] = useState({
   isValid: false,
   completionPercentage: 0,
   lastCheckedStep: ''
 });
 
 // ✅ FIXED: Get required fields for current step - Corrected Commercial Sale Features validation
 const getRequiredFieldsForStep = useCallback((stepId: string): string[] => {
   const stepFieldMap: Record<string, string[]> = {
     // Basic details steps - ✅ UPDATED: Added availableFrom to all property details steps
     'res_rent_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms', 'availableFrom'],
     'res_sale_basic_details': ['propertyType', 'bhkType', 'floor', 'totalFloors', 'propertyAge', 'facing', 'builtUpArea', 'bathrooms', 'availableFrom'],
     
     // ✅ FIXED: Residential Flatmates basic details (Room Details component) - matches actual RoomDetails.tsx fields
     'res_flat_basic_details': ['roomType', 'roomCapacity', 'expectedRent', 'expectedDeposit', 'bathroomType', 'roomSize', 'mealOption'],
     
     // ✅ PG/Hostel room details step - all required fields from RoomDetails UI
     'res_pg_basic_details': ['roomType', 'roomCapacity', 'expectedRent', 'expectedDeposit', 'bathroomType', 'roomSize', 'mealOption'],
     
     // ✅ FIXED: Commercial basic details - exactly matching UI requirements
     'com_rent_basic_details': ['propertyType', 'buildingType', 'ageOfProperty', 'builtUpArea', 'floor', 'totalFloors'],
     'com_sale_basic_details': ['propertyType', 'buildingType', 'ageOfProperty', 'builtUpArea', 'floor', 'totalFloors'],
     'com_cow_basic_details': ['propertyType', 'spaceType', 'capacity'],
     
     // ✅ UPDATED: Land basic details - now includes expectedPrice as required
     'land_sale_basic_details': [
       'propertyType',           // Land/Plot Type (required)
       'builtUpArea',           // Total Area (required)
       'expectedPrice',         // Expected Price (required) - ADDED
       'plotFacing',            // Plot Facing (required for validation)
       'developmentStatus',     // Development Status (required for validation)
       'approvalStatus',        // Approval Status (required for validation)
       'boundaryType',          // Boundary Type (required for validation)
       'waterAvailability',     // Water Availability (required for validation)
       'electricityStatus',     // Electricity Status (required for validation)
       'roadConnectivity'       // Road Connectivity (required for validation)
     ],
     
     // Location steps - including locality as required
     'res_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
     'res_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
     'res_flat_location': ['address', 'city', 'state', 'pinCode', 'locality'],
     'res_pg_location': ['address', 'city', 'state', 'pinCode', 'locality'],
     'com_rent_location': ['address', 'city', 'state', 'pinCode', 'locality'],
     'com_sale_location': ['address', 'city', 'state', 'pinCode', 'locality'],
     'com_cow_location': ['address', 'city', 'state', 'pinCode', 'locality'],
     'land_sale_location': ['address', 'city', 'state', 'pinCode'],
     
     // ✅ FIXED: Commercial rental step - exactly matching UI requirements
     'com_rent_rental': ['rentalType', 'rentAmount', 'securityDeposit', 'advanceRent', 'maintenance', 'camCharges', 'availableFrom', 'parking', 'operatingHours', 'businessPreferences'],
     
     // ✅ UPDATED: Residential rental step - ADDED maintenanceCharges as mandatory
     'res_rent_rental': ['rentAmount', 'securityDeposit', 'maintenanceCharges', 'availableFrom', 'furnishingStatus', 'preferredTenants'],
     
     // Sale details steps - added ALL required fields as shown in UI
     'res_sale_sale_details': ['expectedPrice', 'maintenanceCost', 'kitchenType', 'availableFrom', 'furnishing', 'parking'],
     
     // ✅ FIXED: Commercial Sale Details - Added the correct mandatory fields
     'com_sale_sale_details': ['expectedPrice', 'ownershipType', 'availableFrom', 'idealFor'],
     
     // Features steps - ✅ FIXED: Commercial rent features now use correct commercial fields
     'res_rent_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
     'res_sale_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
     'res_flat_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
     'res_pg_features': ['bathrooms', 'propertyShowOption', 'propertyCondition', 'amenities'],
     
     // ✅ FIXED: Commercial rent features - ALL mandatory fields matching CommercialFeatures.tsx
     'com_rent_features': [
       // Essential Facilities (all mandatory)
       'powerBackup', 'lift', 'parkingType', 'washroomType', 'waterStorage', 'security',
       // Property Status (mandatory)
       'propertyCondition',
       // Furnishing (mandatory)
       'furnishingType',
       // Checkbox groups (at least 1 each)
       'amenities', 'facilities', 'infrastructureFeatures'
     ],
     
     // ✅ FIXED: Commercial sale features - Updated to match actual CommercialFeatures.tsx implementation
     'com_sale_features': [
       // Essential Facilities (all mandatory)
       'powerBackup', 'lift', 'parkingType', 'washroomType', 'waterStorage', 'security',
       // Property Status (mandatory)
       'propertyCondition',
       // Furnishing (mandatory)
       'furnishingType',
       // Checkbox groups (at least 1 each)
       'amenities', 'facilities', 'infrastructureFeatures'
     ],
     
     'com_cow_features': ['propertyShowOption', 'propertyCondition', 'amenities'],
     'land_sale_land_features': ['propertyShowOption', 'propertyCondition'],
     
     // ✅ FIXED: Flatmate details step - ALL fields made mandatory to match actual component
     'res_flat_flatmate_details': [
       // Room Details Toggle Fields
       'hasAttachedBathroom',    // Attached Bathroom (Yes/No)
       'hasAC',                  // AC Room (Yes/No)
       'hasBalcony',             // Balcony (Yes/No)
       // Flatmate Preferences Toggle Fields
       'isNonVegAllowed',        // Non-Veg Allowed (Yes/No)
       'isSmokingAllowed',       // Smoking Allowed (Yes/No)
       'isDrinkingAllowed',      // Drinking Allowed (Yes/No)
       // Contact & Utilities Fields
       'propertyShowPerson',     // Who Will Show the Property?
       'waterSupply',            // Water Supply
       // Additional Details Field
       'about'                   // Additional Details About Flatmate Requirements
       // Note: 'directions' is optional and only shown when user clicks "Add Directions"
     ],
     
     // ✅ FIXED: PG details - REMOVED monthlyRent and securityDeposit
     'res_pg_pg_details': ['genderPreference', 'occupantType', 'mealOption', 'availableFrom'],
     
     // Coworking details
     'com_cow_coworking_details': ['spaceType', 'capacity', 'rentAmount'],
     
     // ✅ UPDATED: Land features step - added mandatory sections
     'land_sale_land_features': [
       'nearbyDevelopments',    // Nearby Developments (required - at least one option)
       'commercialFeatures',    // Commercial Plot Features (required - at least one option, if commercial land)
       'availableDocuments'     // Available Documents (required - at least one option)
       // nearbyLandmarks is optional - removed from required fields
     ],
     
     // Default fallback
     'default': []
   };
   
   return stepFieldMap[stepId] || stepFieldMap['default'];
 }, []);

 // ✅ NEW: Cross-field validation rules
 const getCrossFieldValidationRules = useCallback((stepId: string): CrossFieldValidationRule[] => {
   const rules: Record<string, CrossFieldValidationRule[]> = {
     // Commercial and residential basic details steps - floor validation
     'com_rent_basic_details': [
       {
         fields: ['floor', 'totalFloors'],
         validate: (values) => {
           const floor = parseInt(values.floor);
           const totalFloors = parseInt(values.totalFloors);
           
           if (isNaN(floor) || isNaN(totalFloors)) {
             return { isValid: true }; // Skip validation if either is not a number
           }
           
           if (totalFloors < floor) {
             return { 
               isValid: false, 
               error: 'Total Floors should be equal to or greater than Floor' 
             };
           }
           
           return { isValid: true };
         }
       }
     ],
     'com_sale_basic_details': [
       {
         fields: ['floor', 'totalFloors'],
         validate: (values) => {
           const floor = parseInt(values.floor);
           const totalFloors = parseInt(values.totalFloors);
           if (isNaN(floor) || isNaN(totalFloors)) {
            return { isValid: true };
          }
          
          if (totalFloors < floor) {
            return { 
              isValid: false, 
              error: 'Total Floors should be equal to or greater than Floor' 
            };
          }
          
          return { isValid: true };
        }
      }
    ],
    'res_rent_basic_details': [
      {
        fields: ['floor', 'totalFloors'],
        validate: (values) => {
          const floor = parseInt(values.floor);
          const totalFloors = parseInt(values.totalFloors);
          
          if (isNaN(floor) || isNaN(totalFloors)) {
            return { isValid: true };
          }
          
          if (totalFloors < floor) {
            return { 
              isValid: false, 
              error: 'Total Floors should be equal to or greater than Floor' 
            };
          }
          
          return { isValid: true };
        }
      }
    ],
    'res_sale_basic_details': [
      {
        fields: ['floor', 'totalFloors'],
        validate: (values) => {
          const floor = parseInt(values.floor);
          const totalFloors = parseInt(values.totalFloors);
          
          if (isNaN(floor) || isNaN(totalFloors)) {
            return { isValid: true };
          }
          
          if (totalFloors < floor) {
            return { 
              isValid: false, 
              error: 'Total Floors should be equal to or greater than Floor' 
            };
          }
          
          return { isValid: true };
        }
      }
    ]
  };
  
  return rules[stepId] || [];
}, []);

// Enhanced field checker that properly validates different field types
const hasFieldValue = useCallback((fieldName: string): boolean => {
  if (!form || !currentStepId || !fieldName) {
    return false;
  }

  try {
    console.log(`[hasFieldValue] Checking ${fieldName} in step ${currentStepId}`);
    
    // Method 1: Check step-specific data first
    try {
      const stepData = form.getValues(`steps.${currentStepId}`);
      if (stepData && stepData[fieldName] !== undefined) {
        const value = stepData[fieldName];
        console.log(`[hasFieldValue] Step value for ${fieldName}:`, value);
        
        // Enhanced validation for different field types
        if (Array.isArray(value)) {
          // For arrays (like preferredTenants, roomFeatures, idealFor), check if it has at least one item
          return value.length > 0;
        } else if (typeof value === 'boolean') {
          // For booleans, consider them valid regardless of true/false
          return true;
        } else if (typeof value === 'string') {
          // For strings, check if not empty after trimming
          return value.trim() !== '';
        } else if (typeof value === 'number') {
          // ✅ UPDATED: For numbers, check if not NaN and greater than 0 (except certain fields which can be 0)
          // Added maintenanceCharges to fields that can be 0 but cannot be empty
          if (fieldName === 'bathrooms' || fieldName === 'balconies' || fieldName === 'maintenanceCharges' || fieldName === 'maintenanceCost' || fieldName === 'expectedDeposit' || fieldName === 'floor' || fieldName === 'roomCapacity') {
            return !isNaN(value) && value >= 0;
          }
          return !isNaN(value) && value > 0;
        } else if (value !== null && value !== undefined) {
          // For other types, check if not null/undefined
          return true;
        }
      }
    } catch (e) {
      console.error(`[hasFieldValue] Error checking step data for ${fieldName}:`, e);
    }

    // Method 2: Check root level data as fallback
    try {
      const rootValue = form.getValues(fieldName);
      if (rootValue !== undefined && rootValue !== null) {
        console.log(`[hasFieldValue] Root value for ${fieldName}:`, rootValue);
        
        // Same enhanced validation for root values
        if (Array.isArray(rootValue)) {
          return rootValue.length > 0;
        } else if (typeof rootValue === 'boolean') {
          return true;
        } else if (typeof rootValue === 'string') {
          return rootValue.trim() !== '';
        } else if (typeof rootValue === 'number') {
          // ✅ UPDATED: Added maintenanceCharges and roomCapacity to fields that can be 0
          if (fieldName === 'bathrooms' || fieldName === 'balconies' || fieldName === 'maintenanceCharges' || fieldName === 'maintenanceCost' || fieldName === 'expectedDeposit' || fieldName === 'floor' || fieldName === 'roomCapacity') {
            return !isNaN(rootValue) && rootValue >= 0;
          }
          return !isNaN(rootValue) && rootValue > 0;
        } else {
          return true;
        }
      }
    } catch (e) {
      console.error(`[hasFieldValue] Error checking root data for ${fieldName}:`, e);
    }

    console.log(`[hasFieldValue] No valid value found for ${fieldName}`);
    return false;
  } catch (error) {
    console.error('[useStepValidation] Error checking field value:', fieldName, error);
    return false;
  }
}, [form, currentStepId]);

// ✅ NEW: Cross-field validation checker
const validateCrossFields = useCallback((): Array<{ name: string; label: string; error: string }> => {
  const rules = getCrossFieldValidationRules(currentStepId);
  const crossFieldErrors: Array<{ name: string; label: string; error: string }> = [];
  
  for (const rule of rules) {
    try {
      // Get values for all fields in the rule
      const values: Record<string, any> = {};
      for (const fieldName of rule.fields) {
        // Check step data first, then root level
        const stepData = form.getValues(`steps.${currentStepId}`);
        if (stepData && stepData[fieldName] !== undefined) {
          values[fieldName] = stepData[fieldName];
        } else {
          values[fieldName] = form.getValues(fieldName);
        }
      }
      
      // Run the validation
      const result = rule.validate(values);
      if (!result.isValid && result.error) {
        // ✅ UPDATED: Add error for totalFloors field (the second field in the rule)
        crossFieldErrors.push({
          name: 'totalFloors', // Always show error on totalFloors field
          label: getFieldLabel('totalFloors'),
          error: result.error
        });
      }
    } catch (error) {
      console.error('[validateCrossFields] Error validating cross-field rule:', error);
    }
  }
  
  return crossFieldErrors;
}, [currentStepId, form, getCrossFieldValidationRules]);

// Enhanced validation summary
const getValidationSummary = useCallback((): ValidationSummary => {
  if (!currentStepId) {
    return {
      isValid: true,
      completionPercentage: 100,
      totalRequiredFields: 0,
      completedFields: 0,
      invalidFields: []
    };
  }

  try {
    const requiredFields = getRequiredFieldsForStep(currentStepId);
    console.log(`[getValidationSummary] Required fields for ${currentStepId}:`, requiredFields);
    
    const invalidFields: ValidationSummary['invalidFields'] = [];
    let completedFields = 0;

    // Check each required field
    for (const fieldName of requiredFields) {
      try {
        const hasValue = hasFieldValue(fieldName);
        console.log(`[getValidationSummary] Field ${fieldName} has value:`, hasValue);
        
        if (hasValue) {
          completedFields++;
        } else {
          // ✅ UPDATED: Track incomplete fields for step validation (but don't show error messages)
          invalidFields.push({
            name: fieldName,
            label: getFieldLabel(fieldName),
            error: `${getFieldLabel(fieldName)} is required` // Keep for internal tracking
          });
        }
      } catch (error) {
        console.error(`[getValidationSummary] Error validating field ${fieldName}:`, error);
        // On error, assume field is invalid for required fields
        invalidFields.push({
          name: fieldName,
          label: getFieldLabel(fieldName),
          error: `${getFieldLabel(fieldName)} validation error`
        });
      }
    }

    // ✅ NEW: Add cross-field validation errors
    const crossFieldErrors = validateCrossFields();
    invalidFields.push(...crossFieldErrors);

    const totalRequiredFields = requiredFields.length;
    const completionPercentage = totalRequiredFields > 0 
      ? Math.round((completedFields / totalRequiredFields) * 100)
      : 100;

    console.log(`[getValidationSummary] Step ${currentStepId} completion: ${completedFields}/${totalRequiredFields} (${completionPercentage}%)`);
    console.log(`[getValidationSummary] Invalid fields:`, invalidFields.map(f => f.name));

    return {
      isValid: invalidFields.length === 0,
      completionPercentage,
      totalRequiredFields,
      completedFields,
      invalidFields
    };
  } catch (error) {
    console.warn('[useStepValidation] Error getting validation summary:', error);
    return {
      isValid: false,
      completionPercentage: 0,
      totalRequiredFields: 0,
      completedFields: 0,
      invalidFields: []
    };
  }
}, [currentStepId, getRequiredFieldsForStep, hasFieldValue, validateCrossFields]);

// Simple step validation
const validateCurrentStep = useCallback(() => {
  try {
    const summary = getValidationSummary();
    return {
      isValid: summary.isValid,
      errors: summary.invalidFields.reduce((acc, field) => {
        acc[field.name] = field.error;
        return acc;
      }, {} as Record<string, string>)
    };
  } catch (error) {
    console.warn('[useStepValidation] Error validating step:', error);
    return { isValid: false, errors: {} };
  }
}, [getValidationSummary]);

// Check if can proceed to next step
const canProceedToNextStep = useCallback(() => {
  try {
    const validation = validateCurrentStep();
    return validation.isValid;
  } catch (error) {
    console.warn('[useStepValidation] Error checking if can proceed:', error);
    return false; // Be strict about navigation
  }
}, [validateCurrentStep]);

// Enhanced field validation for individual fields
const validateField = useCallback((fieldName: string) => {
  try {
    const hasValue = hasFieldValue(fieldName);
    
    // ✅ NEW: Check for cross-field validation errors specific to this field
    const crossFieldErrors = validateCrossFields();
    const crossFieldError = crossFieldErrors.find(error => error.name === fieldName);
    
    if (crossFieldError) {
      return {
        isValid: false,
        error: crossFieldError.error,
        isTouched: true
      };
    }
    
    // ✅ UPDATED: Don't show "required" messages since asterisks already indicate this
    return {
      isValid: hasValue,
      error: null, // No error message for required fields
      isTouched: true
    };
  } catch (error) {
    return { isValid: false, error: 'Validation error', isTouched: false };
  }
}, [hasFieldValue, validateCrossFields]);

const getFieldValidation = useCallback((fieldName: string) => {
  try {
    const hasValue = hasFieldValue(fieldName);
    
    // ✅ NEW: Check for cross-field validation errors specific to this field
    const crossFieldErrors = validateCrossFields();
    const crossFieldError = crossFieldErrors.find(error => error.name === fieldName);
    
    if (crossFieldError) {
      return {
        isValid: false,
        error: crossFieldError.error,
        isTouched: false
      };
    }
    
    // ✅ UPDATED: Don't show "required" messages since asterisks already indicate this
    return {
      isValid: hasValue,
      error: null, // No error message for required fields
      isTouched: false
    };
  } catch (error) {
    return { isValid: false, error: null, isTouched: false };
  }
}, [hasFieldValue, validateCrossFields]);

const shouldShowFieldError = useCallback((fieldName: string) => {
  // ✅ UPDATED: Only show cross-field validation errors for totalFloors field
  // But still track all validation for step completion
  if (fieldName !== 'totalFloors') {
    return false; // No validation messages for any other fields
  }
  
  const crossFieldErrors = validateCrossFields();
  const hasCrossFieldError = crossFieldErrors.some(error => error.name === fieldName);
  
  return hasCrossFieldError;
}, [validateCrossFields]);

// ✅ NEW: Additional function to check if field has validation error (for internal use)
const hasValidationError = useCallback((fieldName: string) => {
  const requiredFields = getRequiredFieldsForStep(currentStepId);
  if (requiredFields.includes(fieldName) && !hasFieldValue(fieldName)) {
    return true; // Field is required but empty
  }
  
  // Check cross-field validation errors
  const crossFieldErrors = validateCrossFields();
  const hasCrossFieldError = crossFieldErrors.some(error => error.name === fieldName);
  
  return hasCrossFieldError;
}, [currentStepId, getRequiredFieldsForStep, hasFieldValue, validateCrossFields]);

const getFieldConfig = useCallback((fieldName: string) => {
  const requiredFields = getRequiredFieldsForStep(currentStepId);
  return { 
    required: requiredFields.includes(fieldName)
  };
}, [currentStepId, getRequiredFieldsForStep]);

const markFieldAsTouched = useCallback(() => {
  // No-op for now
}, []);

const blockNavigation = useCallback(() => {
  return !canProceedToNextStep();
}, [canProceedToNextStep]);

// Memoized values using reactive state
const isValid = useMemo(() => {
  return validationResults.isValid;
}, [validationResults.isValid]);

const completionPercentage = useMemo(() => {
  return validationResults.completionPercentage;
}, [validationResults.completionPercentage]);

const requiredFields = useMemo(() => {
  try {
    return getRequiredFieldsForStep(currentStepId);
  } catch (error) {
    return [];
  }
}, [getRequiredFieldsForStep, currentStepId]);

// Watch form changes and update validation
useEffect(() => {
  if (!form || !currentStepId) return;

  const subscription = form.watch(() => {
    // Debounce validation updates
    const timeoutId = setTimeout(() => {
      try {
        const summary = getValidationSummary();
        setValidationResults({
          isValid: summary.isValid,
          completionPercentage: summary.completionPercentage,
          lastCheckedStep: currentStepId
        });
        console.log(`[useStepValidation] Updated validation for ${currentStepId}:`, summary);
      } catch (error) {
        console.error('[useStepValidation] Error updating validation:', error);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  });

  // Initial validation
  try {
    const summary = getValidationSummary();
    setValidationResults({
      isValid: summary.isValid,
      completionPercentage: summary.completionPercentage,
      lastCheckedStep: currentStepId
    });
  } catch (error) {
    console.error('[useStepValidation] Error in initial validation:', error);
  }

  return () => subscription.unsubscribe();
}, [form, currentStepId, getValidationSummary]);

return {
  isValid,
  canProceedToNextStep,
  completionPercentage,
  getValidationSummary,
  blockNavigation,
  validateCurrentStep,
  requiredFields,
  
  // Field-level validation functions
  validateField,
  getFieldValidation,
  getFieldConfig,
  shouldShowFieldError,
  markFieldAsTouched,
  hasValidationError // ✅ NEW: Added for internal validation checking
};
}

// Helper function to get user-friendly field labels - ✅ UPDATED: Added Commercial Sale field labels
function getFieldLabel(fieldName: string): string {
const labels: Record<string, string> = {
  // Property Details fields
  propertyType: 'Property Type',
  buildingType: 'Building Type',
  ageOfProperty: 'Age of Property',
  bhkType: 'BHK Configuration',
  floor: 'Floor',
  totalFloors: 'Total Floors',
  propertyAge: 'Property Age',
  facing: 'Facing Direction',
  builtUpArea: 'Built-up Area',
  bathrooms: 'Bathrooms',
  availableFrom: 'Available From',
  
  // Location fields
  address: 'Complete Address',
  city: 'City',
  state: 'State',
  pinCode: 'PIN Code',
  locality: 'Locality',
  
  // ✅ UPDATED: Rental/Sale fields - Added maintenanceCharges and Commercial Sale specific fields
  rentalType: 'Rental Type',
  rentAmount: 'Monthly Rent Amount',
  securityDeposit: 'Security Deposit',
  maintenanceCharges: 'Maintenance Charges', // ✅ ADDED: Now mandatory field
  advanceRent: 'Advance Rent',
  maintenance: 'Maintenance',
  camCharges: 'CAM Charges',
  parking: 'Parking',
  operatingHours: 'Operating Hours',
  businessPreferences: 'Business Preferences',
  furnishingStatus: 'Furnishing Status',
  preferredTenants: 'Preferred Tenants',
  
  // ✅ ADDED: Commercial Sale specific field labels
  expectedPrice: 'Expected Price',
  ownershipType: 'Ownership Type',
  idealFor: 'Ideal For',
  
  // ✅ NEW: Commercial Features Essential Facilities field labels
  powerBackup: 'Power Backup',
  lift: 'Lift/Elevator',
  parkingType: 'Parking',
  washroomType: 'Washroom(s)',
  waterStorage: 'Water Storage Facility',
  security: 'Security',
  
  // ✅ NEW: Commercial Features Property Status & Furnishing field labels  
  propertyCondition: 'Property Condition',
  furnishingType: 'Furnishing',
  
  // ✅ NEW: Commercial Features Checkbox Groups field labels
  amenities: 'Commercial Amenities',
  facilities: 'Commercial Facilities', 
  infrastructureFeatures: 'Infrastructure Features',
  
  // Sale details field labels
  maintenanceCost: 'Maintenance Cost',
  kitchenType: 'Kitchen Type',
  furnishing: 'Furnishing',
  
  // ✅ PG/Hostel room details field labels (also used for Flatmates Room Details)
  roomType: 'Room Type',
  roomCapacity: 'Room Capacity',
  expectedRent: 'Expected Rent',
  expectedDeposit: 'Expected Deposit',
  bathroomType: 'Bathroom Type',
  roomSize: 'Room Size',
  mealOption: 'Meal Option',
  roomFeatures: 'Room Features',
  
  // ✅ UPDATED: PG Details specific field labels
  genderPreference: 'Place is available for',
  occupantType: 'Preferred guests',
  
  // Features fields
  propertyShowOption: 'Who Shows Property',
  
  // Commercial fields
  spaceType: 'Space Type',
  capacity: 'Capacity',
  
  // ✅ ADDED: Flatmate Details specific field labels
  hasAttachedBathroom: 'Attached Bathroom',
  hasAC: 'AC Room',
  hasBalcony: 'Balcony',
  isNonVegAllowed: 'Non-Veg Allowed',
  isSmokingAllowed: 'Smoking Allowed',
  isDrinkingAllowed: 'Drinking Allowed',
  propertyShowPerson: 'Who Will Show the Property',
  waterSupply: 'Water Supply',
  directions: 'Directions to Property',
  about: 'Additional Details About Flatmate Requirements',
  
  // Legacy flatmate fields (for backward compatibility)
  preferredGender: 'Preferred Gender',
  
  // ✅ ADDED: Land-specific field labels
  plotFacing: 'Plot Facing',
  developmentStatus: 'Development Status',
  approvalStatus: 'Approval Status',
  soilType: 'Soil Type',
  boundaryType: 'Boundary Type',
  waterAvailability: 'Water Availability',
  electricityStatus: 'Electricity Status',
  roadConnectivity: 'Road Connectivity',
  additionalDetails: 'Additional Details',
  
  // ✅ ADDED: Land features field labels
  distanceFromCity: 'Distance from City Center',
  distanceFromHighway: 'Distance from Highway',
  nearbyLandmarks: 'Nearby Landmarks',
  availableDocuments: 'Available Documents',
  nearbyDevelopments: 'Nearby Developments',
  commercialFeatures: 'Commercial Plot Features'
};
return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

// Export default for backward compatibility
export default useStepValidation;