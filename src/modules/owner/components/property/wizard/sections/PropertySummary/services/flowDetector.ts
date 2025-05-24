// src/modules/owner/components/property/wizard/sections/PropertySummary/services/flowDetector.ts
// Version: 2.0.0
// Last Modified: 25-05-2025 16:30 IST
// Purpose: Remove residential rent fallback and show explicit errors

import { FormData } from '../../../types';
import { FLOW_TYPES } from '../../../constants/flows';

/**
 * Comprehensive flow type detection without fallback
 * Throws error if no valid flow is detected
 */
export const determineFlowType = (formData: FormData): string => {
  // Check for land sale specific data structure
  if (formData.steps && (
    formData.steps['land_sale_basic_details'] || 
    formData.steps['land_sale_location'] || 
    formData.steps['land_sale_land_features']
  )) {
    return FLOW_TYPES.LAND_SALE;
  }
  
  // Check for valid flow data structure
  if (formData.flow?.category && formData.flow?.listingType) {
    const flowKey = `${formData.flow.category}_${formData.flow.listingType}`;
    const standardFlowType = FLOW_TYPES[flowKey.toUpperCase() as keyof typeof FLOW_TYPES];
    if (standardFlowType) return standardFlowType;
  }
  
  // URL detection
  const path = window.location.pathname.toLowerCase();
  
  // Commercial flows
  if (path.includes('commercial')) {
    if (path.includes('coworking')) return FLOW_TYPES.COMMERCIAL_COWORKING;
    if (path.includes('sale')) return FLOW_TYPES.COMMERCIAL_SALE;
    if (path.includes('rent')) return FLOW_TYPES.COMMERCIAL_RENT;
  }
  
  // Residential flows
  if (path.includes('residential')) {
    if (path.includes('flatmate')) return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    if (path.includes('pghostel') || path.includes('pg-hostel')) return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    if (path.includes('sale')) return FLOW_TYPES.RESIDENTIAL_SALE;
    if (path.includes('rent')) return FLOW_TYPES.RESIDENTIAL_RENT;
  }
  
  // Land flows
  if (path.includes('land') && path.includes('sale')) return FLOW_TYPES.LAND_SALE;
  
  // If no valid flow detected, throw error instead of fallback
  throw new Error(`Unable to determine property flow type. Please ensure you've selected a valid property type and listing option. Current path: ${path}`);
};