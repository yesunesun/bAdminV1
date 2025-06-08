// src/modules/owner/components/property/wizard/utils/formCleaningUtils.ts
// Version: 1.0.0
// Last Modified: 18-05-2025 15:35 IST
// Purpose: Utility functions for cleaning form data and handling invalid sections

import { FLOW_STEP_SEQUENCES } from '../constants/flows';

/**
 * Cleans form data by removing invalid sections based on the flow type
 * @param formData The form data to clean
 * @returns Cleaned form data with only valid sections for the current flow
 */
export const cleanFormData = (formData: any) => {
  console.log('[formCleaningUtils] Cleaning form data, before:', JSON.stringify({
    ...formData,
    steps: formData.steps ? Object.keys(formData.steps) : {}
  }));
  
  // Create a copy of the data
  const cleanedData = { ...formData };
  
  // Get flow type to determine valid sections
  const flowType = formData.flow?.flowType || 'residential_rent';
  
  // Get the valid step IDs for this flow type
  let validStepIds: string[] = [];
  if (flowType && FLOW_STEP_SEQUENCES[flowType as keyof typeof FLOW_STEP_SEQUENCES]) {
    validStepIds = FLOW_STEP_SEQUENCES[flowType as keyof typeof FLOW_STEP_SEQUENCES].map(step => step.id);
    console.log('[formCleaningUtils] Valid step IDs for flow', flowType, ':', validStepIds);
  }
  
  // If there's no steps object yet, create it
  if (!cleanedData.steps) {
    cleanedData.steps = {};
  }
  
  // Create empty objects for valid steps that don't exist yet
  validStepIds.forEach(stepId => {
    if (!cleanedData.steps[stepId]) {
      cleanedData.steps[stepId] = {};
    }
  });
  
  // Find invalid sections (not in validStepIds) and remove them
  if (cleanedData.steps) {
    const invalidSections = Object.keys(cleanedData.steps).filter(stepId => !validStepIds.includes(stepId));
    console.log('[formCleaningUtils] Invalid sections found:', invalidSections);
    
    // For each invalid section, try to move its properties to a valid section
    invalidSections.forEach(invalidSection => {
      // Special handling for known deprecated sections
      if (invalidSection === 'features') {
        // Try to find a matching features section for the current flow
        const featuresSection = validStepIds.find(id => id.includes('features'));
        if (featuresSection) {
          // Move features data to the correct features section
          cleanedData.steps[featuresSection] = {
            ...cleanedData.steps[featuresSection],
            ...cleanedData.steps['features']
          };
          console.log(`[formCleaningUtils] Moved features data to ${featuresSection}`);
        }
      } 
      else if (invalidSection === 'basic_details') {
        // Try to find a matching basic details section for the current flow
        const basicDetailsSection = validStepIds.find(id => id.includes('basic_details'));
        if (basicDetailsSection) {
          // Move basic_details data to the correct basic details section
          cleanedData.steps[basicDetailsSection] = {
            ...cleanedData.steps[basicDetailsSection],
            ...cleanedData.steps['basic_details']
          };
          console.log(`[formCleaningUtils] Moved basic_details data to ${basicDetailsSection}`);
        }
      }
      
      // Remove the invalid section
      delete cleanedData.steps[invalidSection];
    });
  }
  
  console.log('[formCleaningUtils] Cleaning form data, after:', JSON.stringify({
    ...cleanedData,
    steps: cleanedData.steps ? Object.keys(cleanedData.steps) : {}
  }));
  return cleanedData;
};