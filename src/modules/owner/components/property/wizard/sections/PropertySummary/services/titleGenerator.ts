// src/modules/owner/components/property/wizard/sections/PropertySummary/services/titleGenerator.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:40 IST
// Purpose: Property title generation service

import { FormData } from '../../../types';
import { StepIds } from '../types';
import { getFieldValue } from './dataExtractor';
import { FLOW_TYPES } from '../../../constants/flows';
import { capitalize } from './dataFormatter';

/**
 * Property title generation for different flow types
 */
export const generatePropertyTitle = (
  formData: FormData,
  stepIds: StepIds,
  flowType: string,
  category: string,
  listingType: string
): string => {
  if (flowType === FLOW_TYPES.LAND_SALE) {
    const landType = getFieldValue(formData, stepIds.basicDetails || '', 'landType') || 'Land';
    const city = getFieldValue(formData, stepIds.location || '', 'city') || 
                 getFieldValue(formData, stepIds.location || '', 'locality') || 
                 'Hyderabad';
    
    return `${landType} for Sale in ${city}`;
  }
  
  // Fallback for other flows
  return `Property for ${capitalize(listingType)} in Hyderabad`;
};

/**
 * Get property title from form data with fallbacks
 */
export const getPropertyTitle = (
  formData: FormData,
  stepIds: StepIds,
  flowType: string
): string => {
  let title = getFieldValue(formData, stepIds.basicDetails || '', 'title', ['title', 'details.title']);
  
  if (!title || title === "New Property") {
    // Generate title if not present
    const flow = formData.flow || {};
    const category = flow.category || 'land';
    const listingType = flow.listingType || 'sale';
    
    title = generatePropertyTitle(formData, stepIds, flowType, category, listingType);
    
    // Save generated title
    if (formData.steps?.[stepIds.basicDetails || '']) {
      formData.steps[stepIds.basicDetails].title = title;
    } else {
      formData.title = title;
    }
  }
  
  return title || '';
};