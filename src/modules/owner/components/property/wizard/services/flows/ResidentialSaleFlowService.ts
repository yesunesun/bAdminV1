// src/modules/owner/components/property/wizard/services/flows/ResidentialSaleFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:25 IST
// Purpose: Specialized service for Residential Sale flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class ResidentialSaleFlowService extends BaseFlowService {
  protected category: string = 'residential';
  protected listingType: string = 'sale';
  
  /**
   * Detect if this is a Residential Sale flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // First check for explicit sale mode prop (highest priority)
    if (flowContext.isSaleMode) {
      return true;
    }
    
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('residential') && 
        (urlPath.includes('sale') || urlPath.includes('sell')) && 
        !urlPath.includes('pg') && !urlPath.includes('hostel') && 
        !urlPath.includes('flatmate')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.category === 'residential' && 
        (formData.flow?.listingType === 'sale' || 
        (formData.flow?.listingType || '').toLowerCase().includes('sale') || 
        (formData.flow?.listingType || '').toLowerCase().includes('sell'))) {
      return true;
    }
    
    // Check for sale-specific fields
    if (formData.expectedPrice || 
        formData.steps?.sale?.expectedPrice || 
        formData.sale?.expectedPrice || 
        formData.details?.saleInfo?.expectedPrice) {
      return true;
    }
    
    // Check if adType parameter indicates residential sale
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('residential') && 
          (adTypeLower.includes('sale') || adTypeLower.includes('sell')) && 
          !adTypeLower.includes('pg') && 
          !adTypeLower.includes('hostel') && 
          !adTypeLower.includes('flatmate')) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add sale-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add sale section
    output.sale = this.formatSaleSection(formData);
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
}