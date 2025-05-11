// src/modules/owner/components/property/wizard/sections/PropertySummary/services/flowDetector.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:40 IST
// Purpose: Flow type detection service

import { FormData } from '../../../types';
import { FLOW_TYPES } from '../../../constants/flows';

/**
 * Comprehensive flow type detection with land sale focus
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
  
  // Other flow detection logic
  if (formData.flow?.category && formData.flow?.listingType) {
    const flowKey = `${formData.flow.category}_${formData.flow.listingType}`;
    const standardFlowType = FLOW_TYPES[flowKey.toUpperCase() as keyof typeof FLOW_TYPES];
    if (standardFlowType) return standardFlowType;
  }
  
  // URL detection
  const path = window.location.pathname.toLowerCase();
  if (path.includes('land') && path.includes('sale')) return FLOW_TYPES.LAND_SALE;
  
  // Default fallback
  return FLOW_TYPES.RESIDENTIAL_RENT;
};