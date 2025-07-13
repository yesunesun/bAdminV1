// src/modules/owner/components/property/wizard/hooks/useStepCompletion.ts
// Version: 1.0.0
// Created: 2025-01-13
// Purpose: Reusable hook for calculating step completion status across all flows

import { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface StepCompletionConfig {
  /** Required field names for the current step */
  requiredFields: string[];
  /** Field display names for user-friendly error messages */
  fieldLabels: Record<string, string>;
  /** Form instance */
  form: UseFormReturn<any>;
  /** Current step ID */
  stepId: string;
  /** Current form values to check */
  values: Record<string, any>;
}

interface StepCompletionResult {
  /** Completion percentage (0-100) */
  completionPercentage: number;
  /** Whether all required fields are completed */
  isStepValid: boolean;
  /** Array of unfilled required field display names */
  unfilledFields: string[];
  /** Array of completed required field names */
  completedFields: string[];
}

export function useStepCompletion({
  requiredFields,
  fieldLabels,
  form,
  stepId,
  values
}: StepCompletionConfig): StepCompletionResult {
  
  return useMemo(() => {
    // Filter completed fields - only count fields that actually have values
    const completedFields = requiredFields.filter(field => {
      const value = values[field];
      
      // Handle different value types
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      
      if (typeof value === 'boolean') {
        return true; // Boolean fields are always considered "filled"
      }
      
      if (typeof value === 'number') {
        return !isNaN(value) && value > 0;
      }
      
      if (typeof value === 'string') {
        const trimmed = value.trim();
        // For numeric strings, require > 0 for fields that typically need positive values
        if (/^\d+$/.test(trimmed)) {
          const numValue = parseInt(trimmed);
          // Fields that should be > 0 when they're numbers
          const requirePositiveFields = ['bathrooms', 'floor', 'totalFloors', 'builtUpArea', 'rentAmount', 'securityDeposit', 'expectedPrice'];
          if (requirePositiveFields.includes(field)) {
            return numValue > 0;
          }
        }
        return trimmed !== '';
      }
      
      // For other types, check if it's not null/undefined
      return value != null;
    });

    // Calculate completion percentage
    const completionPercentage = requiredFields.length === 0 
      ? 100 
      : Math.round((completedFields.length / requiredFields.length) * 100);

    // Check if step is valid (all required fields completed)
    const isStepValid = completionPercentage === 100;

    // Get unfilled required fields with user-friendly names
    const unfilledFields = requiredFields
      .filter(field => !completedFields.includes(field))
      .map(field => fieldLabels[field] || field);

    return {
      completionPercentage,
      isStepValid,
      unfilledFields,
      completedFields
    };
  }, [requiredFields, fieldLabels, values]);
}

// Default field labels for common form fields
export const DEFAULT_FIELD_LABELS: Record<string, string> = {
  // Property Details
  propertyType: 'Property Type',
  bhkType: 'BHK Configuration',
  floor: 'Floor',
  totalFloors: 'Total Floors',
  propertyAge: 'Property Age',
  facing: 'Facing Direction',
  builtUpArea: 'Built-up Area',
  availableFrom: 'Available From',
  title: 'Property Title',
  
  // Location Details
  address: 'Address',
  city: 'City',
  locality: 'Locality',
  pincode: 'PIN Code',
  landmark: 'Landmark',
  
  // Rental Details
  rentAmount: 'Monthly Rent',
  securityDeposit: 'Security Deposit',
  maintenanceCharges: 'Maintenance Charges',
  furnishingStatus: 'Furnishing Status',
  preferredTenants: 'Preferred Tenants',
  
  // Sale Details
  expectedPrice: 'Expected Price',
  priceNegotiable: 'Price Negotiable',
  
  // Amenities & Features
  bathrooms: 'Bathrooms',
  balconies: 'Balconies',
  propertyShowOption: 'Who Shows Property',
  propertyCondition: 'Property Condition',
  amenities: 'Amenities',
  
  // Commercial Details
  commercialType: 'Commercial Type',
  carpetArea: 'Carpet Area',
  officeFloor: 'Office Floor',
  totalCommercialFloors: 'Total Floors',
  parkingSpaces: 'Parking Spaces',
  
  // Land Details
  landArea: 'Land Area',
  landType: 'Land Type',
  boundaryWall: 'Boundary Wall',
  waterConnection: 'Water Connection',
  electricityConnection: 'Electricity Connection',
  
  // Common
  description: 'Description',
  images: 'Property Images',
  contactNumber: 'Contact Number'
};