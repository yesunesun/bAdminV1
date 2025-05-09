// src/modules/owner/components/property/wizard/services/flows/BaseFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:10 IST
// Purpose: Base class with common functionality for all flow services

import { FlowServiceInterface, FlowContext } from './FlowServiceInterface';
import { FormData } from '../../types';

export abstract class BaseFlowService implements FlowServiceInterface {
  protected category: string = 'residential';
  protected listingType: string = 'rent';
  
  abstract detectFlow(formData: any, flowContext: FlowContext): boolean;
  
  /**
   * Common data formatting logic shared by all flows
   */
  formatData(formData: any): FormData {
    // Create basic structure
    const output: any = {
      meta: this.formatMetaSection(formData),
      flow: {
        category: this.category,
        listingType: this.listingType
      },
      media: this.formatMediaSection(formData)
    };
    
    // Add common sections
    output.details = this.formatDetailsSection(formData);
    output.location = this.formatLocationSection(formData);
    output.features = this.formatFeaturesSection(formData);
    
    // Add flow-specific sections
    this.addFlowSpecificSections(output, formData);
    
    console.log(`${this.getFlowType()} flow output:`, output);
    
    return output as FormData;
  }
  
  getFlowType(): string {
    return `${this.category}_${this.listingType}`;
  }
  
  getFlowKey(): string {
    return this.getFlowType();
  }
  
  /**
   * Format meta section
   */
  protected formatMetaSection(formData: any): any {
    return {
      _version: 'v3',
      created_at: formData.meta?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: formData.meta?.status || 'draft',
      id: formData.meta?.id,
      owner_id: formData.meta?.owner_id
    };
  }
  
  /**
   * Format media section
   */
  protected formatMediaSection(formData: any): any {
    return formData.media || {
      photos: { images: [] },
      videos: { urls: [] }
    };
  }
  
  /**
   * Format details section
   */
  protected formatDetailsSection(formData: any): any {
    const details = {};
    
    // Get data from the steps container first
    if (formData.steps?.basic_details) {
      Object.assign(details, formData.steps.basic_details);
    }
    
    // Check for details at root level
    if (formData.basic_details) {
      Object.assign(details, formData.basic_details);
    }
    
    // Check for legacy details structure
    if (formData.details?.basicDetails) {
      Object.assign(details, formData.details.basicDetails);
    }
    
    // Look for individual basic details fields directly on the form
    const basicDetailsFields = [
      'title', 'propertyType', 'bhkType', 'floor', 'totalFloors', 
      'builtUpArea', 'builtUpAreaUnit', 'bathrooms', 'balconies', 
      'facing', 'propertyAge', 'propertyCondition', 'hasBalcony', 'hasAC'
    ];
    
    basicDetailsFields.forEach(field => {
      if (formData[field] !== undefined) {
        details[field] = formData[field];
      }
    });
    
    return details;
  }
  
  /**
   * Format location section
   */
  protected formatLocationSection(formData: any): any {
    const location = {};
    
    // Get data from the steps container first
    if (formData.steps?.location) {
      Object.assign(location, formData.steps.location);
    }
    
    // Check for location data at root level
    if (formData.location) {
      Object.assign(location, formData.location);
    }
    
    // Check for legacy location structure
    if (formData.details?.location) {
      Object.assign(location, formData.details.location);
    }
    
    // Look for individual location fields directly on the form
    const locationFields = [
      'address', 'flatPlotNo', 'landmark', 'locality', 'area', 
      'city', 'district', 'state', 'pinCode'
    ];
    
    locationFields.forEach(field => {
      if (formData[field] !== undefined) {
        location[field] = formData[field];
      }
    });
    
    // Handle coordinates separately since it's a nested object
    if (formData.coordinates) {
      location['coordinates'] = formData.coordinates;
    } else if (formData.latitude !== undefined && formData.longitude !== undefined) {
      location['coordinates'] = {
        latitude: formData.latitude,
        longitude: formData.longitude
      };
    }
    
    // Check if coordinates were stored in a flat structure in location
    if (formData.location?.latitude !== undefined && formData.location?.longitude !== undefined) {
      location['coordinates'] = {
        latitude: formData.location.latitude,
        longitude: formData.location.longitude
      };
    }
    
    return location;
  }
  
  /**
   * Format features section
   */
  protected formatFeaturesSection(formData: any): any {
    const features = {};
    
    // Get data from the steps container first
    if (formData.steps?.features) {
      Object.assign(features, formData.steps.features);
    }
    
    // Check for features data at root level
    if (formData.features) {
      Object.assign(features, formData.features);
    }
    
    // Check for legacy features structure
    if (formData.details?.features) {
      Object.assign(features, formData.details.features);
    }
    
    // Look for individual features fields directly on the form
    const featureFields = [
      'amenities', 'parking', 'petFriendly', 'nonVegAllowed', 'waterSupply',
      'powerBackup', 'gatedSecurity', 'description', 'isSmokingAllowed',
      'isDrinkingAllowed', 'hasAttachedBathroom', 'hasGym'
    ];
    
    featureFields.forEach(field => {
      if (formData[field] !== undefined) {
        features[field] = formData[field];
      }
    });
    
    return features;
  }
  
  /**
   * Add flow-specific sections to the output
   * Override in subclasses to add flow-specific sections
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // To be implemented by subclasses
  }
}