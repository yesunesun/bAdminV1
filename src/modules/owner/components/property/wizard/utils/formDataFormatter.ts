// src/modules/owner/components/property/wizard/utils/formDataFormatter.ts
// Version: 1.2.0
// Last Modified: 13-05-2025 15:10 IST
// Purpose: Enhanced utility to consistently format form data and prepare for submission

import { FormData } from '../types';
import { FlowServiceFactory } from '../services/flows/FlowServiceFactory';

export interface FlowContextParams {
  urlPath: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean;
  adType?: string;
}

/**
 * Transforms and formats raw form data using the appropriate flow service
 * @param rawFormData The raw form data to transform
 * @param contextParams Flow context parameters
 * @returns Formatted form data ready for storage or submission
 */
export function formatFormData(rawFormData: FormData, contextParams: FlowContextParams): FormData {
  try {
    console.log('Formatting form data with context:', contextParams);
    
    // Create flow context from provided parameters
    const flowContext = {
      urlPath: contextParams.urlPath,
      isSaleMode: contextParams.isSaleMode,
      isPGHostelMode: contextParams.isPGHostelMode,
      adType: contextParams.adType
    };
    
    // Get the appropriate flow service
    const flowService = FlowServiceFactory.getFlowService(rawFormData, flowContext);
    console.log(`Using flow service: ${flowService.getFlowType()}`);
    
    // Format the data using the flow service
    const formattedData = flowService.formatData(rawFormData);
    
    // Log the final output structure for debugging
    console.log('Formatted data structure:', Object.keys(formattedData));
    
    return formattedData;
  } catch (error) {
    console.error('Error formatting form data:', error);
    // Return the original data if formatting fails
    return rawFormData;
  }
}

/**
 * Prepares form data for submission by transforming it using the appropriate flow service
 * @param formValues The raw form values from the form hook
 * @param contextParams Flow context parameters
 * @returns Prepared form data ready for database submission
 */
export function prepareFormDataForSubmission(formValues: FormData, contextParams: FlowContextParams): FormData {
  try {
    console.log('Preparing form data for submission');
    
    // Get the raw form data
    const rawFormData = formValues;
    console.log('Raw form data:', JSON.stringify(rawFormData, null, 2));
    
    // Format the data using the existing utility
    const formattedData = formatFormData(rawFormData, contextParams);
    
    // Add a marker to verify this utility is being used
    if (!formattedData.meta) {
      formattedData.meta = {};
    }
    
    // Add our verification marker
    formattedData.meta._formatterVersion = '1.2.0';
    formattedData.meta._processedBy = 'centralizedFormatter';
    formattedData.meta._processedAt = new Date().toISOString();
    
    // Log the final output structure for debugging
    console.log('Final structured output with marker:', JSON.stringify(formattedData.meta, null, 2));
    
    return formattedData;
  } catch (error) {
    console.error('Error preparing form data for submission:', error);
    // Return the original data if preparation fails
    return formValues;
  }
}