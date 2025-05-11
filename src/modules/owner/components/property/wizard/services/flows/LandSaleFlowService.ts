// src/modules/owner/components/property/wizard/services/flows/LandSaleFlowService.ts
// Version: 2.0.0
// Last Modified: 11-05-2025 04:30 IST
// Purpose: Updated to properly extract data from flow-specific step identifiers

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
   * Override formatData to ensure correct land sale structure
   */
  formatData(formData: any): any {
    console.log('LandSaleFlowService.formatData - Raw input:', JSON.stringify(formData, null, 2));
    
    // Call base implementation to get standard structure
    const result = super.formatData(formData);
    
    // Override with land-specific data extraction
    const landBasicDetails = this.extractLandBasicDetails(formData);
    const landLocation = this.extractLandLocation(formData);
    const landFeatures = this.extractLandFeatures(formData);
    
    // Update details with extracted land data
    result.details = {
      ...result.details,
      ...landBasicDetails,
      ...this.formatSaleDetails(formData)
    };
    
    result.location = landLocation;
    result.features = landFeatures;
    
    // Ensure proper flow info
    result.flow = {
      category: 'land',
      listingType: 'sale'
    };
    
    console.log('LandSaleFlowService.formatData - Final output:', JSON.stringify(result, null, 2));
    
    return result;
  }
  
  /**
   * Extract land basic details from step-specific data
   */
  private extractLandBasicDetails(formData: any): any {
    const details: any = {};
    
    // Get from land_sale_basic_details step
    if (formData.steps?.land_sale_basic_details) {
      const stepData = formData.steps.land_sale_basic_details;
      
      // Extract all land-specific fields
      Object.keys(stepData).forEach(key => {
        details[key] = stepData[key];
      });
    }
    
    // Ensure required fields are set with proper values
    if (!details.title && details.landType) {
      // Create a title from land type and location
      const city = formData.steps?.land_sale_location?.city || 'Hyderabad';
      details.title = `${details.landType} for Sale in ${city}`;
    }
    
    // Set property type for land
    if (!details.propertyType) {
      details.propertyType = details.landType || "Plot/Land";
    }
    
    // Handle area calculations
    if (details.plotLength && details.plotWidth) {
      details.plotDimensions = `${details.plotLength} x ${details.plotWidth}`;
      
      // Calculate total area if not set
      if (!details.builtUpArea) {
        const totalSqft = Number(details.plotLength) * Number(details.plotWidth);
        if (!isNaN(totalSqft)) {
          details.builtUpArea = totalSqft;
          details.builtUpAreaUnit = 'sqft';
        }
      }
    }
    
    return details;
  }
  
  /**
   * Extract land location data from step-specific data
   */
  private extractLandLocation(formData: any): any {
    const location: any = {};
    
    // Get from land_sale_location step
    if (formData.steps?.land_sale_location) {
      const stepData = formData.steps.land_sale_location;
      
      // Extract all location fields
      Object.keys(stepData).forEach(key => {
        location[key] = stepData[key];
      });
    }
    
    // Ensure coordinates exist
    if (!location.coordinates) {
      location.coordinates = {
        latitude: null,
        longitude: null
      };
    }
    
    return location;
  }
  
  /**
   * Extract land features from step-specific data
   */
  private extractLandFeatures(formData: any): any {
    const features: any = {};
    
    // Get from land_sale_land_features step
    if (formData.steps?.land_sale_land_features) {
      const stepData = formData.steps.land_sale_land_features;
      
      // Extract all feature fields
      Object.keys(stepData).forEach(key => {
        features[key] = stepData[key];
      });
    }
    
    // Add any additional land-specific features
    if (formData.steps?.land_sale_basic_details) {
      const basicDetails = formData.steps.land_sale_basic_details;
      
      // Add utility info from basic details
      ['waterAvailability', 'electricityStatus', 'roadConnectivity'].forEach(field => {
        if (basicDetails[field]) {
          features[field] = basicDetails[field];
        }
      });
      
      // Add boundary and topography info
      ['boundaryType', 'topographyType'].forEach(field => {
        if (basicDetails[field]) {
          features[field] = basicDetails[field];
        }
      });
    }
    
    return features;
  }
  
  /**
   * Format sale details for land
   */
  private formatSaleDetails(formData: any): any {
    const saleDetails: any = {};
    
    // Look for price information in basic details
    if (formData.steps?.land_sale_basic_details) {
      const stepData = formData.steps.land_sale_basic_details;
      
      if (stepData.expectedPrice) {
        saleDetails.expectedPrice = stepData.expectedPrice;
        saleDetails.price = stepData.expectedPrice; // For backward compatibility
      }
      
      if (stepData.isNegotiable !== undefined) {
        saleDetails.priceNegotiable = stepData.isNegotiable;
      }
    }
    
    // Default values for sale
    if (saleDetails.expectedPrice === undefined) {
      saleDetails.expectedPrice = 0;
    }
    
    if (saleDetails.priceNegotiable === undefined) {
      saleDetails.priceNegotiable = false;
    }
    
    return saleDetails;
  }
  
  /**
   * Override base formatData to ensure steps structure is preserved
   */
  formatData(formData: any): any {
    const result = super.formatData(formData);
    
    // Ensure steps structure is preserved
    if (formData.steps) {
      result.steps = {
        land_sale_basic_details: formData.steps.land_sale_basic_details || {},
        land_sale_location: formData.steps.land_sale_location || {},
        land_sale_land_features: formData.steps.land_sale_land_features || {}
      };
    }
    
    // Extract and organize data from steps
    const basicDetails = this.extractLandBasicDetails(formData);
    const location = this.extractLandLocation(formData);
    const features = this.extractLandFeatures(formData);
    const saleDetails = this.formatSaleDetails(formData);
    
    // Merge into result structure
    result.details = {
      ...result.details,
      ...basicDetails,
      ...saleDetails
    };
    
    result.location = location;
    result.features = features;
    
    // Ensure flow info is correct
    result.flow = {
      category: 'land',
      listingType: 'sale'
    };
    
    return result;
  }
}