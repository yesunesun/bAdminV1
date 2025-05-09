// src/modules/owner/components/property/wizard/services/flows/ResidentialFlatmatesFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:30 IST
// Purpose: Specialized service for Residential Flatmates flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class ResidentialFlatmatesFlowService extends BaseFlowService {
  protected category: string = 'residential';
  protected listingType: string = 'flatmates';
  
  /**
   * Detect if this is a Residential Flatmates flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('flatmate') || urlPath.includes('flat-mate')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.listingType === 'flatmates' || 
        (formData.flow?.listingType || '').toLowerCase().includes('flatmate')) {
      return true;
    }
    
    // Check for flatmate-specific fields
    if (formData.steps?.flatmate_details && Object.keys(formData.steps.flatmate_details).length > 0) {
      return true;
    }
    
    // Check if adType parameter includes 'flatmate'
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('flatmate')) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add flatmate-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add flatmate_details section
    output.flatmate_details = this.formatFlatmateDetailsSection(formData);
  }
  
  /**
   * Format flatmate details section
   */
  private formatFlatmateDetailsSection(formData: any): any {
    const flatmateDetails = {};
    
    // Get data from the steps container first
    if (formData.steps?.flatmate_details) {
      Object.assign(flatmateDetails, formData.steps.flatmate_details);
    }
    
    // Check for flatmate data at root level
    if (formData.flatmate_details) {
      Object.assign(flatmateDetails, formData.flatmate_details);
    }
    
    // Look for individual flatmate fields directly on the form
    const flatmateFields = [
      'preferredGender', 'occupancy', 'foodPreference', 'tenantType',
      'roomSharing', 'maxFlatmates', 'currentFlatmates', 'about'
    ];
    
    flatmateFields.forEach(field => {
      if (formData[field] !== undefined) {
        flatmateDetails[field] = formData[field];
      }
    });
    
    return flatmateDetails;
  }
}