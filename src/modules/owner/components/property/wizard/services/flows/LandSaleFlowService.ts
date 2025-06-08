// src/modules/owner/components/property/wizard/services/flows/LandSaleFlowService.ts
// Version: 2.1.0
// Last Modified: 14-05-2025 14:45 IST
// Purpose: Fixed to use standard JSON structure without non-standard sections

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
    
    // Check for land-specific step data
    if (formData.steps?.land_sale_basic_details || 
        formData.steps?.land_sale_location || 
        formData.steps?.land_sale_land_features) {
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
   * Format data to ensure correct land sale structure using standard JSON format
   */
  formatData(formData: any): any {
    console.log('LandSaleFlowService.formatData - Raw input:', JSON.stringify(formData, null, 2));
    
    // Call base implementation to get standard structure
    const result = super.formatData(formData);
    
    // Ensure steps structure is preserved and enhanced with computed values
    if (formData.steps) {
      // Start with existing steps data
      result.steps = {
        ...formData.steps
      };
      
      // Enhance basic details step if needed
      if (result.steps.land_sale_basic_details) {
        // Ensure title is set
        if (!result.steps.land_sale_basic_details.title && result.steps.land_sale_basic_details.landType) {
          const city = formData.steps?.land_sale_location?.city || 'Hyderabad';
          result.steps.land_sale_basic_details.title = `${result.steps.land_sale_basic_details.landType} for Sale in ${city}`;
        }
        
        // Set property type for land
        if (!result.steps.land_sale_basic_details.propertyType) {
          result.steps.land_sale_basic_details.propertyType = result.steps.land_sale_basic_details.landType || "Plot/Land";
        }
        
        // Calculate plot dimensions if needed
        if (result.steps.land_sale_basic_details.plotLength && result.steps.land_sale_basic_details.plotWidth) {
          const plotLength = result.steps.land_sale_basic_details.plotLength;
          const plotWidth = result.steps.land_sale_basic_details.plotWidth;
          
          // Calculate total area if not set
          if (!result.steps.land_sale_basic_details.builtUpArea) {
            const totalSqft = Number(plotLength) * Number(plotWidth);
            if (!isNaN(totalSqft)) {
              result.steps.land_sale_basic_details.builtUpArea = totalSqft;
              result.steps.land_sale_basic_details.builtUpAreaUnit = 'sqft';
            }
          }
        }
      }
      
      // Enhance location step if needed
      if (result.steps.land_sale_location) {
        // No special enhancements needed for now
      }
      
      // Enhance features step if needed
      if (result.steps.land_sale_land_features) {
        // No special enhancements needed for now
      }
    }
    
    // Ensure flow info is correct
    result.flow = {
      category: 'land',
      listingType: 'sale'
    };
    
    // Log the final structure (should only contain standard sections)
    console.log('LandSaleFlowService.formatData - Final output (standard structure):', JSON.stringify({
      meta: result.meta,
      flow: result.flow,
      steps: result.steps,
      media: result.media
    }, null, 2));
    
    return {
      meta: result.meta,
      flow: result.flow,
      steps: result.steps,
      media: result.media
    };
  }
}