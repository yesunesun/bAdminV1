// src/modules/owner/components/property/wizard/utils/mandatoryFieldsUtils.ts
// Version: 1.0.0
// Purpose: Utility functions for extracting and tracking mandatory fields

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { MandatoryField } from '../components/UnifiedStepIndicator';

// Define mandatory fields for each step type
const STEP_MANDATORY_FIELDS: Record<string, MandatoryField[]> = {
  // Residential Rent - Basic Details
  res_rent_basic_details: [
    { name: 'propertyType', label: 'Property Type', isCompleted: false, category: 'basic' },
    { name: 'bhkType', label: 'BHK Configuration', isCompleted: false, category: 'basic' },
    { name: 'floor', label: 'Floor', isCompleted: false, category: 'basic' },
    { name: 'totalFloors', label: 'Total Floors', isCompleted: false, category: 'basic' },
    { name: 'propertyAge', label: 'Property Age', isCompleted: false, category: 'basic' },
    { name: 'facing', label: 'Facing Direction', isCompleted: false, category: 'basic' },
    { name: 'builtUpArea', label: 'Built-up Area', isCompleted: false, category: 'basic' },
    { name: 'bathrooms', label: 'Bathrooms', isCompleted: false, category: 'basic' },
  ],
  
  // Residential Rent - Location
  res_rent_location: [
    { name: 'address', label: 'Address', isCompleted: false, category: 'location' },
    { name: 'city', label: 'City', isCompleted: false, category: 'location' },
    { name: 'state', label: 'State', isCompleted: false, category: 'location' },
    { name: 'pinCode', label: 'PIN Code', isCompleted: false, category: 'location' },
    { name: 'locality', label: 'Locality', isCompleted: false, category: 'location' },
  ],
  
  // Residential Rent - Rental Details
  res_rent_rental: [
    { name: 'expectedPrice', label: 'Expected Rent', isCompleted: false, category: 'details' },
    { name: 'maintenanceCost', label: 'Maintenance Cost', isCompleted: false, category: 'details' },
    { name: 'kitchenType', label: 'Kitchen Type', isCompleted: false, category: 'details' },
    { name: 'availableFrom', label: 'Available From', isCompleted: false, category: 'details' },
    { name: 'furnishing', label: 'Furnishing', isCompleted: false, category: 'details' },
    { name: 'parking', label: 'Parking', isCompleted: false, category: 'details' },
  ],
  
  // Residential Sale - Basic Details
  res_sale_basic_details: [
    { name: 'propertyType', label: 'Property Type', isCompleted: false, category: 'basic' },
    { name: 'bhkType', label: 'BHK Configuration', isCompleted: false, category: 'basic' },
    { name: 'floor', label: 'Floor', isCompleted: false, category: 'basic' },
    { name: 'totalFloors', label: 'Total Floors', isCompleted: false, category: 'basic' },
    { name: 'propertyAge', label: 'Property Age', isCompleted: false, category: 'basic' },
    { name: 'facing', label: 'Facing Direction', isCompleted: false, category: 'basic' },
    { name: 'builtUpArea', label: 'Built-up Area', isCompleted: false, category: 'basic' },
    { name: 'bathrooms', label: 'Bathrooms', isCompleted: false, category: 'basic' },
  ],
  
  // Residential Sale - Location (same as rent)
  res_sale_location: [
    { name: 'address', label: 'Address', isCompleted: false, category: 'location' },
    { name: 'city', label: 'City', isCompleted: false, category: 'location' },
    { name: 'state', label: 'State', isCompleted: false, category: 'location' },
    { name: 'pinCode', label: 'PIN Code', isCompleted: false, category: 'location' },
    { name: 'locality', label: 'Locality', isCompleted: false, category: 'location' },
  ],
  
  // Residential Sale - Sale Details
  res_sale_sale_details: [
    { name: 'expectedPrice', label: 'Expected Price', isCompleted: false, category: 'details' },
    { name: 'furnishing', label: 'Furnishing', isCompleted: false, category: 'details' },
    { name: 'parking', label: 'Parking', isCompleted: false, category: 'details' },
    { name: 'ownership', label: 'Ownership Type', isCompleted: false, category: 'details' },
  ],
  
  // Flatmates - Basic Details  
  res_flat_basic_details: [
    { name: 'roomType', label: 'Room Type', isCompleted: false, category: 'basic' },
    { name: 'capacity', label: 'Room Capacity', isCompleted: false, category: 'basic' },
    { name: 'monthlyRent', label: 'Monthly Rent', isCompleted: false, category: 'basic' },
    { name: 'securityDeposit', label: 'Security Deposit', isCompleted: false, category: 'basic' },
    { name: 'bathroomType', label: 'Bathroom Type', isCompleted: false, category: 'basic' },
    { name: 'roomSize', label: 'Room Size', isCompleted: false, category: 'basic' },
    { name: 'mealOption', label: 'Meal Option', isCompleted: false, category: 'basic' },
  ],
  
  // Add more step configurations as needed
};

/**
 * Get mandatory fields for a specific step
 */
export function getMandatoryFieldsForStep(stepId: string): MandatoryField[] {
  return STEP_MANDATORY_FIELDS[stepId] || [];
}

/**
 * Check if a form field has a value
 */
function hasValue(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !isNaN(value) && value >= 0;
  if (typeof value === 'boolean') return true; // Booleans are always considered filled
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

/**
 * Get the form field value by path
 */
function getFieldValue(form: UseFormReturn<FormData>, stepId: string, fieldName: string): any {
  const formData = form.getValues();
  
  // Try to get from step-specific path first
  const stepSpecificValue = formData.details?.[stepId]?.[fieldName];
  if (hasValue(stepSpecificValue)) {
    return stepSpecificValue;
  }
  
  // Fallback to direct property access
  const directValue = (formData as any)[fieldName];
  if (hasValue(directValue)) {
    return directValue;
  }
  
  // Special case handling for common field mappings
  const fieldMappings: Record<string, string[]> = {
    expectedPrice: ['price', 'rent', 'amount'],
    propertyType: ['type', 'category'],
    bhkType: ['bhk', 'bedroom'],
    builtUpArea: ['area', 'size', 'sqft'],
    bathrooms: ['bathroom', 'bath'],
    availableFrom: ['available', 'date'],
    pinCode: ['pin', 'postal'],
  };
  
  const mappings = fieldMappings[fieldName] || [];
  for (const mapping of mappings) {
    const mappedValue = formData.details?.[stepId]?.[mapping] || (formData as any)[mapping];
    if (hasValue(mappedValue)) {
      return mappedValue;
    }
  }
  
  return null;
}

/**
 * Update mandatory fields completion status based on form data
 */
export function updateMandatoryFieldsStatus(
  form: UseFormReturn<FormData>,
  stepId: string
): MandatoryField[] {
  const mandatoryFields = getMandatoryFieldsForStep(stepId);
  
  return mandatoryFields.map(field => ({
    ...field,
    isCompleted: hasValue(getFieldValue(form, stepId, field.name))
  }));
}

/**
 * Calculate completion statistics
 */
export function calculateCompletionStats(mandatoryFields: MandatoryField[]) {
  const totalFields = mandatoryFields.length;
  const completedFields = mandatoryFields.filter(field => field.isCompleted).length;
  const remainingFields = totalFields - completedFields;
  const completionPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 100;
  
  return {
    totalFields,
    completedFields,
    remainingFields,
    completionPercentage,
    isComplete: remainingFields === 0
  };
}

/**
 * Get field labels by category
 */
export function groupFieldsByCategory(mandatoryFields: MandatoryField[]): Record<string, MandatoryField[]> {
  return mandatoryFields.reduce((groups, field) => {
    const category = field.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(field);
    return groups;
  }, {} as Record<string, MandatoryField[]>);
}