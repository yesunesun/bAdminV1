// src/modules/owner/components/property/wizard/sections/PropertySummary/services/dataExtractor.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:40 IST
// Purpose: Data extraction utilities for PropertySummary

import { FormData } from '../../../types';
import { FLOW_TYPES, FLOW_STEPS } from '../../../constants/flows';
import { StepIds } from '../types';

/**
 * Get step IDs for a specific flow type
 */
export const getStepIdsForFlow = (flowType: string): StepIds => {
  if (flowType === FLOW_TYPES.LAND_SALE) {
    return {
      basicDetails: 'land_sale_basic_details',
      location: 'land_sale_location',
      saleDetails: 'land_sale_basic_details', // Land sale price is in basic details
      landFeatures: 'land_sale_land_features'
    };
  }
  
  // Fallback for other flows
  const flowSteps = FLOW_STEPS[flowType] || FLOW_STEPS.default;
  const stepMap: StepIds = {};
  
  flowSteps.forEach(stepId => {
    if (stepId.includes('basic_details')) stepMap.basicDetails = stepId;
    if (stepId.includes('location')) stepMap.location = stepId;
    if (stepId.includes('rental')) stepMap.rental = stepId;
    if (stepId.includes('sale_details')) stepMap.saleDetails = stepId;
    if (stepId.includes('features')) stepMap.features = stepId;
    if (stepId.includes('flatmate_details')) stepMap.flatmateDetails = stepId;
    if (stepId.includes('pg_details')) stepMap.pgDetails = stepId;
    if (stepId.includes('coworking_details')) stepMap.coworkingDetails = stepId;
    if (stepId.includes('land_features')) stepMap.landFeatures = stepId;
  });
  
  return stepMap;
};

/**
 * Enhanced field value retrieval for land sale
 */
export const getFieldValue = (
  formData: FormData, 
  stepId: string, 
  fieldName: string, 
  fallbackPaths?: string[]
): any => {
  // Primary: Check in steps structure
  if (formData.steps?.[stepId]?.[fieldName] !== undefined) {
    return formData.steps[stepId][fieldName];
  }
  
  // Secondary: Check direct property
  if (formData[fieldName] !== undefined) {
    return formData[fieldName];
  }
  
  // Land sale specific mappings
  if (stepId === 'land_sale_basic_details') {
    const stepData = formData.steps?.[stepId];
    if (stepData) {
      // Map specific field names
      if (fieldName === 'totalArea') return stepData.builtUpArea;
      if (fieldName === 'areaUnit') return stepData.builtUpAreaUnit;
      if (fieldName === 'price' || fieldName === 'expectedPrice') return stepData.expectedPrice;
    }
  }
  
  if (stepId === 'land_sale_land_features') {
    const stepData = formData.steps?.[stepId];
    if (stepData) {
      // Check for boolean features
      if (fieldName === 'nearbyFacilities') {
        // Collect all nearby features
        const facilities = [];
        if (stepData.nearbySchool) facilities.push('School');
        if (stepData.nearbyStation) facilities.push('Station');
        if (stepData.nearbyAirport) facilities.push('Airport');
        if (stepData.nearbyHospital) facilities.push('Hospital');
        if (stepData.nearbyMarket) facilities.push('Market');
        if (stepData.nearbyHighway) facilities.push('Highway');
        return facilities.length > 0 ? facilities : undefined;
      }
      
      if (fieldName === 'landDocuments') {
        // Collect all document types
        const documents = [];
        if (stepData.titleDeed) documents.push('Title Deed');
        if (stepData.taxReceipts) documents.push('Tax Receipts');
        if (stepData.encumbranceCertificate) documents.push('Encumbrance Certificate');
        if (stepData.landSurveyReport) documents.push('Land Survey Report');
        if (stepData.conversionOrder) documents.push('Conversion Order');
        return documents.length > 0 ? documents : undefined;
      }
    }
  }
  
  // Tertiary: Check fallback paths
  if (fallbackPaths) {
    for (const path of fallbackPaths) {
      const parts = path.split('.');
      let value = formData;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && value[part] !== undefined) {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      
      if (value !== undefined) return value;
    }
  }
  
  return undefined;
};