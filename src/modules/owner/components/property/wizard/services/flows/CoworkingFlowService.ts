// src/modules/owner/components/property/wizard/services/flows/CoworkingFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:45 IST
// Purpose: Specialized service for Coworking flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class CoworkingFlowService extends BaseFlowService {
  protected category: string = 'commercial';
  protected listingType: string = 'coworking';
  
  /**
   * Detect if this is a Coworking flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('coworking') || urlPath.includes('co-working')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.listingType === 'coworking' || 
        (formData.flow?.listingType || '').toLowerCase().includes('coworking') || 
        (formData.flow?.listingType || '').toLowerCase().includes('co-working')) {
      return true;
    }
    
    // Check for coworking-specific fields
    if (formData.steps?.coworking && Object.keys(formData.steps.coworking).length > 0) {
      return true;
    }
    
    // Check if adType parameter includes 'coworking'
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('coworking') || adTypeLower.includes('co-working')) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add coworking-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add coworking section
    output.coworking = this.formatCoworkingSection(formData);
  }
  
  /**
   * Format coworking section
   */
  private formatCoworkingSection(formData: any): any {
    const coworking = {};
    
    // Get data from the steps container first
    if (formData.steps?.coworking) {
      Object.assign(coworking, formData.steps.coworking);
    }
    
    // Check for coworking data at root level
    if (formData.coworking) {
      Object.assign(coworking, formData.coworking);
    }
    
    // Look for individual coworking fields directly on the form
    const coworkingFields = [
      'spaceType', 'capacity', 'operatingHours', 'amenities',
      'securityDeposit', 'minimumCommitment', 'discounts', 'availableFrom'
    ];
    
    coworkingFields.forEach(field => {
      if (formData[field] !== undefined) {
        coworking[field] = formData[field];
      }
    });
    
    return coworking;
  }
}