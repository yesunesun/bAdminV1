// src/modules/owner/components/property/wizard/services/flows/CommercialSaleFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:40 IST
// Purpose: Specialized service for Commercial Sale flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class CommercialSaleFlowService extends BaseFlowService {
  protected category: string = 'commercial';
  protected listingType: string = 'sale';
  
  /**
   * Detect if this is a Commercial Sale flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('commercial') && 
        (urlPath.includes('sale') || urlPath.includes('sell')) && 
        !urlPath.includes('coworking')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.category === 'commercial' && 
        (formData.flow?.listingType === 'sale' || 
        (formData.flow?.listingType || '').toLowerCase().includes('sale') || 
        (formData.flow?.listingType || '').toLowerCase().includes('sell'))) {
      return true;
    }
    
    // Check if adType parameter indicates commercial sale
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('commercial') && 
          (adTypeLower.includes('sale') || adTypeLower.includes('sell')) && 
          !adTypeLower.includes('coworking')) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add commercial sale-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add sale section
    output.sale = this.formatSaleSection(formData);
    
    // Add commercial_details section
    output.commercial_details = this.formatCommercialDetailsSection(formData);
  }
  
  /**
   * Format sale section
   */
  private formatSaleSection(formData: any): any {
    const sale = {};
    
    // Get data from the steps container first
    if (formData.steps?.sale) {
      Object.assign(sale, formData.steps.sale);
    }
    
    // Check for sale data at root level
    if (formData.sale) {
      Object.assign(sale, formData.sale);
    }
    
    // Check for legacy sale structure
    if (formData.details?.saleInfo) {
      Object.assign(sale, formData.details.saleInfo);
    }
    
    // Look for individual sale fields directly on the form
    const saleFields = [
      'expectedPrice', 'priceNegotiable', 'possessionDate', 
      'hasSimilarUnits', 'propertyShowOption', 'propertyShowPerson', 
      'secondaryNumber', 'secondaryContactNumber'
    ];
    
    saleFields.forEach(field => {
      if (formData[field] !== undefined) {
        sale[field] = formData[field];
      }
    });
    
    // Ensure critical sale fields have a default value
    if (sale.expectedPrice === undefined) {
      sale.expectedPrice = 0;
    }
    
    if (sale.priceNegotiable === undefined) {
      sale.priceNegotiable = false;
    }
    
    return sale;
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