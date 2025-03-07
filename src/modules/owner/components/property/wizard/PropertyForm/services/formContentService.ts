// src/modules/owner/components/property/wizard/PropertyForm/services/formContentService.ts
// Version: 1.0.0
// Last Modified: 07-03-2025 16:30 IST
// Purpose: Service to determine which form content to display based on step and form mode

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';

/**
 * Determines if the property form is in sale mode
 * 
 * @param form The react-hook-form instance
 * @param formIsSaleMode Flag from usePropertyForm hook if available
 * @returns boolean indicating if form is in sale mode
 */
export function determineSaleMode(form: UseFormReturn<FormData>, formIsSaleMode?: boolean): boolean {
  // First check from the usePropertyForm hook's determination
  if (formIsSaleMode !== undefined) {
    return formIsSaleMode;
  }
  
  // Get the most up-to-date form values
  const formValues = form.getValues();
  
  // Check multiple indicators for sale mode
  const indicators = {
    // Check listing type from form
    formListingType: (formValues.listingType?.toLowerCase() === 'sale' || formValues.listingType?.toLowerCase() === 'sell'),
    
    // Check explicit sale property flags
    isSalePropertyFlag: formValues.isSaleProperty === true,
    propertyPriceTypeFlag: formValues.propertyPriceType === 'sale',
    
    // Check if expectedPrice exists but rentAmount doesn't
    hasExpectedPriceOnly: !!(formValues.expectedPrice && !formValues.rentAmount)
  };
  
  // If ANY indicator is true, consider it a sale property
  return Object.values(indicators).some(indicator => indicator === true);
}

/**
 * Determines which steps to show based on the property type (sale vs rental)
 * 
 * @param steps The complete list of steps
 * @param isSaleMode Boolean indicating if the property is for sale
 * @returns Filtered list of steps with hidden property set
 */
export function getVisibleSteps(steps: any[], isSaleMode: boolean) {
  return steps.map(step => ({
    ...step,
    // Hide rental tab for sale properties and vice versa
    hidden: (step.id === 'rental' && isSaleMode) || (step.id === 'sale' && !isSaleMode)
  }));
}

/**
 * Determines the next step based on current step and property type
 * 
 * @param currentStepId The ID of the current step
 * @param isSaleMode Boolean indicating if the property is for sale
 * @param STEPS The complete list of steps
 * @returns The index of the next step (1-based)
 */
export function determineNextStep(currentStepId: string, isSaleMode: boolean, STEPS: any[]): number | null {
  // If we're on the Location step and this is a sale property,
  // we should skip the Rental tab and go directly to Sale Details
  if (currentStepId === 'location' && isSaleMode) {
    const saleStepIndex = STEPS.findIndex(step => step.id === 'sale');
    if (saleStepIndex !== -1) {
      return saleStepIndex + 1; // +1 because step indices are 1-based
    }
  }
  
  // If we're on the Location step and this is a rental property,
  // we should skip the Sale tab and go directly to Rental Details
  if (currentStepId === 'location' && !isSaleMode) {
    const rentalStepIndex = STEPS.findIndex(step => step.id === 'rental');
    if (rentalStepIndex !== -1) {
      return rentalStepIndex + 1;
    }
  }
  
  // If we're on the Rental tab and this is a sale property,
  // we should skip to Features
  if (currentStepId === 'rental' && isSaleMode) {
    const featuresStepIndex = STEPS.findIndex(step => step.id === 'features');
    if (featuresStepIndex !== -1) {
      return featuresStepIndex + 1;
    }
  }
  
  // If we're on the Sale tab and this is a rental property,
  // we should skip to Features
  if (currentStepId === 'sale' && !isSaleMode) {
    const featuresStepIndex = STEPS.findIndex(step => step.id === 'features');
    if (featuresStepIndex !== -1) {
      return featuresStepIndex + 1;
    }
  }
  
  // No special case, return null to indicate normal progression
  return null;
}