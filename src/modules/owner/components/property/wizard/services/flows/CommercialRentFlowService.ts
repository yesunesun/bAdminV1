// src/modules/owner/components/property/wizard/services/flows/CommercialRentFlowService.ts
// Version: 1.1.0
// Last Modified: 18-05-2025 18:05 IST
// Purpose: Cleaned up to use only step-based structure

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class CommercialRentFlowService extends BaseFlowService {
  protected category: string = 'commercial';
  protected listingType: string = 'rent';
  
  /**
   * Detect if this is a Commercial Rent flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // First check the flow info in form data
    if (formData.flow?.category === 'commercial' && 
        formData.flow?.listingType === 'rent' && 
        !formData.flow?.listingType.includes('coworking')) {
      return true;
    }
    
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('commercial') && 
        urlPath.includes('rent') && 
        !urlPath.includes('sale') && 
        !urlPath.includes('coworking')) {
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
    
    // Additional check for commercial-specific fields
    if (formData.steps?.com_rent_commercial_details || 
        formData.commercial_details || 
        formData.cabins !== undefined || 
        formData.meetingRooms !== undefined) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Override extractRentalData to ensure proper commercial rent data extraction
   */
  protected extractRentalData(formData: any): any {
    const data: any = {};
    
    const fields = [
      'rentAmount', 'securityDeposit', 'maintenanceCharges', 'rentNegotiable',
      'availableFrom', 'preferredTenants', 'leaseDuration', 'furnishingStatus',
      'hasSimilarUnits', 'propertyShowOption', 'propertyShowPerson',
      'secondaryNumber', 'secondaryContactNumber'
    ];
    
    // Extract from steps structure first
    if (formData.steps) {
      Object.keys(formData.steps).forEach(stepKey => {
        if (stepKey.includes('_rental') && formData.steps[stepKey]) {
          Object.assign(data, formData.steps[stepKey]);
        }
      });
    }
    
    // Then from flat/direct structure
    fields.forEach(field => {
      if (formData[field] !== undefined && data[field] === undefined) {
        data[field] = formData[field];
      }
    });
    
    // Finally from rental object
    if (formData.rental) {
      fields.forEach(field => {
        if (formData.rental[field] !== undefined && data[field] === undefined) {
          data[field] = formData.rental[field];
        }
      });
    }
    
    // Add default preferred tenants for commercial
    if (!data.preferredTenants || data.preferredTenants.length === 0) {
      data.preferredTenants = ['Company', 'Startup'];
    }
    
    return data;
  }
  
  /**
   * Extract commercial-specific features
   */
  protected extractFeaturesData(formData: any): any {
    const data = super.extractFeaturesData(formData);
    
    // Add commercial-specific features
    const commercialFields = [
      'cabins', 'meetingRooms', 'washrooms', 'cornerProperty', 'mainRoadFacing',
      'centrallyAirConditioned', 'conference_room'
    ];
    
    // Extract from commercial_details if available
    if (formData.commercial_details) {
      commercialFields.forEach(field => {
        if (formData.commercial_details[field] !== undefined && data[field] === undefined) {
          data[field] = formData.commercial_details[field];
        }
      });
    }
    
    // Also check in steps
    if (formData.steps) {
      Object.keys(formData.steps).forEach(stepKey => {
        if (stepKey.includes('_features') && formData.steps[stepKey]) {
          commercialFields.forEach(field => {
            if (formData.steps[stepKey][field] !== undefined && data[field] === undefined) {
              data[field] = formData.steps[stepKey][field];
            }
          });
        }
      });
    }
    
    return data;
  }
}