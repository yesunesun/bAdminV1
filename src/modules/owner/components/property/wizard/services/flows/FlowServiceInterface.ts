// src/modules/owner/components/property/wizard/services/flows/FlowServiceInterface.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:00 IST
// Purpose: Define the interface for all flow services

import { FormData } from '../../types';

export interface FlowServiceInterface {
  /**
   * Detect if the current form data matches this flow
   * @param formData The raw form data
   * @param flowContext Additional context like URL path, props, etc.
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean;
  
  /**
   * Format the form data according to this flow's structure
   * @param formData The raw form data
   * @returns Formatted data in the proper flow-specific structure
   */
  formatData(formData: any): FormData;
  
  /**
   * Get the flow type identifier
   */
  getFlowType(): string;
  
  /**
   * Get the flow key (category_listingType)
   */
  getFlowKey(): string;
}

export interface FlowContext {
  urlPath: string;
  isSaleMode?: boolean;
  isPGHostelMode?: boolean;
  adType?: string;
  [key: string]: any;
}