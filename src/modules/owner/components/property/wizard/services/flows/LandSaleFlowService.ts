// src/modules/owner/components/property/wizard/services/flows/LandSaleFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:50 IST
// Purpose: Specialized service for Land Sale flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class LandSaleFlowService extends BaseFlowService {
  protected category: string = 'land';
  protected listingType: string = 'sale';
  
  /**
   * Detect if this is a Land Sale flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if ((urlPath.includes('land') || urlPath.includes('plot')) && 
        (urlPath.includes('sale') || urlPath.includes('sell'))) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.category === 'land') {
      return true;
    }
    
    // Check for land-specific fields
    if (formData.steps?.land_features && Object.keys(formData.steps.land_features).length > 0) {
      return true;
    }
    
    // Check if adType parameter indicates land
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('land') || adTypeLower.includes('plot')) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add land-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add land_features section
    output.land_features = this.formatLandFeaturesSection(formData);
    
    // Add sale section
    output.sale = this.formatSaleSection(formData);
  }
  
  /**
   * Format land features section
   */
  private formatLandFeaturesSection(formData: any): any {
    const landFeatures = {};
    
    // Get data from the steps container first
    if (formData.steps?.land_features) {
      Object.assign(landFeatures, formData.steps.land_features);
    }
    
    // Check for land features data at root level
    if (formData.land_features) {
      Object.assign(landFeatures, formData.land_features);
    }
    
    // Look for individual land features fields directly on the form
    const landFeatureFields = [
      'approvals', 'boundaryStatus', 'cornerPlot', 'landUseZone', 'description'
    ];
    
    landFeatureFields.forEach(field => {
      if (formData[field] !== undefined) {
        landFeatures[field] = formData[field];
      }
    });
    
    return landFeatures;
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
      'secondaryNumber'
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