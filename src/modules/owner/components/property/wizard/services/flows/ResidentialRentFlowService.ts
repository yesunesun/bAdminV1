// src/modules/owner/components/property/wizard/services/flows/ResidentialRentFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:20 IST
// Purpose: Specialized service for Residential Rent flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class ResidentialRentFlowService extends BaseFlowService {
  protected category: string = 'residential';
  protected listingType: string = 'rent';
  
  /**
   * Detect if this is a Residential Rent flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('residential') && urlPath.includes('rent') && 
        !urlPath.includes('sale') && !urlPath.includes('pg') && 
        !urlPath.includes('hostel') && !urlPath.includes('flatmate')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.category === 'residential' && 
        formData.flow?.listingType === 'rent') {
      return true;
    }
    
    // Check for rent-specific fields but not sale fields
    if (formData.rentAmount && !formData.expectedPrice) {
      return true;
    }
    
    // Check if adType parameter indicates residential rent
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('residential') && 
          adTypeLower.includes('rent') && 
          !adTypeLower.includes('sale') && 
          !adTypeLower.includes('pg') && 
          !adTypeLower.includes('hostel') && 
          !adTypeLower.includes('flatmate')) {
        return true;
      }
    }
    
    // Default for when no specific flow is detected
    if (!flowContext.isSaleMode && 
        !flowContext.isPGHostelMode && 
        !formData.flow?.listingType && 
        !formData.expectedPrice) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Add rental-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add rental section
    output.rental = this.formatRentalSection(formData);
  }
  
  /**
   * Format rental section
   */
  private formatRentalSection(formData: any): any {
    const rental = {};
    
    // Get data from the steps container first
    if (formData.steps?.rental) {
      Object.assign(rental, formData.steps.rental);
    }
    
    // Check for rental data at root level
    if (formData.rental) {
      Object.assign(rental, formData.rental);
    }
    
    // Check for legacy rental structure
    if (formData.details?.rentalInfo) {
      Object.assign(rental, formData.details.rentalInfo);
    }
    
    // Look for individual rental fields directly on the form
    const rentalFields = [
      'rentAmount', 'securityDeposit', 'maintenanceCharges', 
      'rentNegotiable', 'availableFrom', 'preferredTenants', 
      'leaseDuration', 'furnishingStatus', 'hasSimilarUnits', 
      'propertyShowOption', 'propertyShowPerson', 'secondaryNumber'
    ];
    
    rentalFields.forEach(field => {
      if (formData[field] !== undefined) {
        rental[field] = formData[field];
      }
    });
    
    return rental;
  }
}