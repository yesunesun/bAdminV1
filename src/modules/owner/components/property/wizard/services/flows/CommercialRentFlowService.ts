// src/modules/owner/components/property/wizard/services/flows/CommercialRentFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:35 IST
// Purpose: Specialized service for Commercial Rent flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class CommercialRentFlowService extends BaseFlowService {
  protected category: string = 'commercial';
  protected listingType: string = 'rent';
  
  /**
   * Detect if this is a Commercial Rent flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('commercial') && 
        urlPath.includes('rent') && 
        !urlPath.includes('sale') && 
        !urlPath.includes('coworking')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.category === 'commercial' && 
        formData.flow?.listingType === 'rent' && 
        !formData.flow?.listingType.includes('coworking')) {
      return true;
    }
    
    // Check if adType parameter indicates commercial rent
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('commercial') && 
          adTypeLower.includes('rent') && 
          !adTypeLower.includes('sale') && 
          !adTypeLower.includes('coworking')) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add commercial-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add rental section
    output.rental = this.formatRentalSection(formData);
    
    // Add commercial_details section
    output.commercial_details = this.formatCommercialDetailsSection(formData);
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
  
  /**
   * Format commercial details section
   */
  private formatCommercialDetailsSection(formData: any): any {
    const commercialDetails = {};
    
    // Get data from the steps container first
    if (formData.steps?.commercial_details) {
      Object.assign(commercialDetails, formData.steps.commercial_details);
    }
    
    // Check for commercial data at root level
    if (formData.commercial_details) {
      Object.assign(commercialDetails, formData.commercial_details);
    }
    
    // Look for individual commercial fields directly on the form
    const commercialFields = [
      'cabins', 'meetingRooms', 'washrooms', 'cornerProperty', 'mainRoadFacing'
    ];
    
    commercialFields.forEach(field => {
      if (formData[field] !== undefined) {
        commercialDetails[field] = formData[field];
      }
    });
    
    return commercialDetails;
  }
}