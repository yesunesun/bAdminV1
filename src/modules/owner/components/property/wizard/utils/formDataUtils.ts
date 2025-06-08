// src/modules/owner/components/property/wizard/utils/formDataUtils.ts
// Version: 1.0.0
// Last Modified: 18-05-2025 14:45 IST
// Purpose: Utility functions for handling step-specific data in the flow-based wizard

import { useCallback } from 'react';
import { UseFormReturn, useFormContext } from 'react-hook-form';
import { FormData } from '../types';

/**
 * Custom hook for managing step-specific data
 * @param stepId - The unique identifier for the step (e.g., 'res_rent_basic_details')
 */
export const useStepData = (stepId: string) => {
  const form = useFormContext<FormData>();
  
  const saveField = useCallback((fieldName: string, value: any) => {
    // Generate the path for this field: details.{stepId}.{fieldName}
    const path = `steps.${stepId}.${fieldName}`;
    form.setValue(path, value, { shouldValidate: true });
  }, [form, stepId]);
  
  const getField = useCallback((fieldName: string, defaultValue?: any) => {
    const path = `steps.${stepId}.${fieldName}`;
    return form.getValues(path) ?? defaultValue;
  }, [form, stepId]);
  
  return { saveField, getField };
};

/**
 * Helper function to get step data from various legacy formats
 * @param form - The form instance
 * @param stepId - The step identifier
 * @param fields - Array of field names to extract
 */
export const getStepDataFromForm = (
  form: UseFormReturn<FormData>,
  stepId: string,
  fields: string[]
): any => {
  const stepData: any = {};
  
  // Try to get data from the steps container
  const stepsData = form.getValues('steps');
  if (stepsData && stepsData[stepId]) {
    fields.forEach(field => {
      if (stepsData[stepId][field] !== undefined) {
        stepData[field] = stepsData[stepId][field];
      }
    });
  }
  
  // Fallback to flat structure for backward compatibility
  fields.forEach(field => {
    if (stepData[field] === undefined) {
      const flatValue = form.getValues(field);
      if (flatValue !== undefined) {
        stepData[field] = flatValue;
      }
    }
  });
  
  return stepData;
};

/**
 * Helper function to save step data to the correct location in the form
 * @param form - The form instance
 * @param stepId - The step identifier
 * @param data - The data to save
 */
export const saveStepDataToForm = (
  form: UseFormReturn<FormData>,
  stepId: string,
  data: any
): void => {
  // Ensure steps container exists
  const currentSteps = form.getValues('steps') || {};
  
  // Update the step data
  const updatedSteps = {
    ...currentSteps,
    [stepId]: {
      ...(currentSteps[stepId] || {}),
      ...data
    }
  };
  
  // Save the updated steps container
  form.setValue('steps', updatedSteps, { shouldValidate: true });
};

/**
 * Generate step-specific field mappings based on flow type
 * @param flowType - The flow type (e.g., 'residential_rent')
 * @param category - The property category
 * @param listingType - The listing type
 */
export const generateStepFieldMappings = (
  flowType: string,
  category: string,
  listingType: string
): Record<string, string[]> => {
  const baseStepId = `${category.substring(0, 3)}_${listingType.substring(0, 4)}`;
  
  const mappings: Record<string, string[]> = {
    [`${baseStepId}_basic_details`]: [
      'title',
      'propertyType',
      'bhkType',
      'floor',
      'totalFloors',
      'builtUpArea',
      'builtUpAreaUnit',
      'bathrooms',
      'balconies',
      'facing',
      'propertyAge',
      'propertyCondition',
      'hasBalcony',
      'hasAC'
    ],
    
    [`${baseStepId}_location`]: [
      'address',
      'flatPlotNo',
      'landmark',
      'locality',
      'area',
      'city',
      'district',
      'state',
      'pinCode',
      'coordinates'
    ],
    
    [`${baseStepId}_features`]: [
      'amenities',
      'parking',
      'petFriendly',
      'nonVegAllowed',
      'waterSupply',
      'powerBackup',
      'gatedSecurity',
      'description',
      'isSmokingAllowed',
      'isDrinkingAllowed',
      'hasAttachedBathroom',
      'hasGym'
    ]
  };
  
  // Add flow-specific step mappings
  if (listingType.includes('rent')) {
    mappings[`${baseStepId}_rental`] = [
      'rentAmount',
      'securityDeposit',
      'maintenanceCharges',
      'rentNegotiable',
      'availableFrom',
      'preferredTenants',
      'leaseDuration',
      'furnishingStatus',
      'hasSimilarUnits',
      'propertyShowOption',
      'propertyShowPerson',
      'secondaryNumber',
      'secondaryContactNumber'
    ];
  }
  
  if (listingType.includes('sale')) {
    mappings[`${baseStepId}_sale`] = [
      'expectedPrice',
      'priceNegotiable',
      'possessionDate',
      'hasSimilarUnits',
      'propertyShowOption',
      'propertyShowPerson',
      'secondaryNumber',
      'secondaryContactNumber'
    ];
  }
  
  if (listingType.includes('flatmates')) {
    mappings[`${baseStepId}_flatmate_details`] = [
      'preferredGender',
      'occupancy',
      'foodPreference',
      'tenantType',
      'roomSharing',
      'maxFlatmates',
      'currentFlatmates',
      'about'
    ];
  }
  
  if (listingType.includes('pghostel')) {
    mappings[`${baseStepId}_pg_details`] = [
      'pgType',
      'mealOptions',
      'roomTypes',
      'occupancyTypes',
      'genderPreference',
      'rules',
      'facilities',
      'noticePolicy'
    ];
  }
  
  if (category === 'commercial') {
    mappings[`${baseStepId}_commercial_details`] = [
      'cabins',
      'meetingRooms',
      'washrooms',
      'cornerProperty',
      'mainRoadFacing'
    ];
    
    if (listingType.includes('coworking')) {
      mappings[`${baseStepId}_coworking_details`] = [
        'spaceType',
        'capacity',
        'operatingHours',
        'amenities',
        'securityDeposit',
        'minimumCommitment',
        'discounts',
        'availableFrom'
      ];
    }
  }
  
  if (category === 'land') {
    mappings[`${baseStepId}_land_features`] = [
      'approvals',
      'boundaryStatus',
      'cornerPlot',
      'landUseZone',
      'description'
    ];
  }
  
  return mappings;
};

/**
 * Convert legacy data format to new step-based format
 * @param formData - The form data in legacy format
 * @param flowType - The flow type to convert to
 * @param category - The property category
 * @param listingType - The listing type
 */
export const convertToStepFormat = (
  formData: any,
  flowType: string,
  category: string,
  listingType: string
): FormData => {
  const stepMappings = generateStepFieldMappings(flowType, category, listingType);
  const convertedData: FormData = {
    meta: formData.meta || {
      _version: 'v3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'draft'
    },
    flow: {
      category: category as any,
      listingType: listingType
    },
    steps: {},
    media: formData.media || {
      photos: { images: [] },
      videos: { urls: [] }
    }
  };
  
  // Convert each step's data
  Object.entries(stepMappings).forEach(([stepId, fields]) => {
    const stepData: any = {};
    
    fields.forEach(field => {
      // First check if it's in steps already
      if (formData.steps && formData.steps[stepId] && formData.steps[stepId][field] !== undefined) {
        stepData[field] = formData.steps[stepId][field];
      }
      // Then check in direct properties
      else if (formData[field] !== undefined) {
        stepData[field] = formData[field];
      }
      // Check in legacy sections
      else if (field === 'coordinates' && formData.location && formData.location.coordinates) {
        stepData[field] = formData.location.coordinates;
      }
      // Add other legacy mapping logic as needed
    });
    
    if (Object.keys(stepData).length > 0) {
      convertedData.steps![stepId] = stepData;
    }
  });
  
  return convertedData;
};

/**
 * Validate step data based on required fields
 * @param stepData - The data for a specific step
 * @param requiredFields - Array of required field names
 */
export const validateStepData = (
  stepData: any,
  requiredFields: string[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  requiredFields.forEach(field => {
    if (!stepData[field] || stepData[field] === '' || stepData[field] === null) {
      errors.push(`${field} is required`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Helper to get the current step ID based on flow type and step index
 * @param flowType - The flow type
 * @param stepIndex - The current step index
 * @param category - The property category
 * @param listingType - The listing type
 */
export const getCurrentStepId = (
  flowType: string,
  stepIndex: number,
  category: string,
  listingType: string
): string | null => {
  const flowSteps = FLOW_STEPS[flowType];
  if (!flowSteps || stepIndex >= flowSteps.length) {
    return null;
  }
  
  const baseStepName = flowSteps[stepIndex];
  
  // Generate step-specific ID
  const baseStepId = `${category.substring(0, 3)}_${listingType.substring(0, 4)}`;
  return `${baseStepId}_${baseStepName}`;
};

// Import FLOW_STEPS for use in getCurrentStepId
import { FLOW_STEPS } from '../constants/flows';