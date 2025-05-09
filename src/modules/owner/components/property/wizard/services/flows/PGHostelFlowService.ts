// src/modules/owner/components/property/wizard/services/flows/PGHostelFlowService.ts
// Version: 1.0.0
// Last Modified: 12-05-2025 17:15 IST
// Purpose: Specialized service for PG/Hostel flow handling

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class PGHostelFlowService extends BaseFlowService {
  protected category: string = 'residential';
  protected listingType: string = 'pghostel';
  
  /**
   * Detect if this is a PG/Hostel flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check for explicit PG mode prop
    if (flowContext.isPGHostelMode) {
      return true;
    }
    
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('pghostel') || urlPath.includes('pg-hostel') || 
        urlPath.includes('pg') || urlPath.includes('hostel')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.listingType === 'pghostel' || 
        (formData.flow?.listingType || '').toLowerCase().includes('pg') || 
        (formData.flow?.listingType || '').toLowerCase().includes('hostel')) {
      return true;
    }
    
    // Check for PG-specific fields
    if (formData.steps?.pg_details && Object.keys(formData.steps.pg_details).length > 0) {
      return true;
    }
    
    // Check if adType parameter includes 'pg' or 'hostel'
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('pg') || adTypeLower.includes('hostel')) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Add PG-specific sections to the output
   */
  protected addFlowSpecificSections(output: any, formData: any): void {
    // Add pg_details section
    output.pg_details = this.formatPGDetailsSection(formData);
  }
  
  /**
   * Format PG details section
   */
  private formatPGDetailsSection(formData: any): any {
    const pgDetails = {};
    
    // Get data from the steps container first
    if (formData.steps?.pg_details) {
      Object.assign(pgDetails, formData.steps.pg_details);
    }
    
    // Check for PG data at root level
    if (formData.pg_details) {
      Object.assign(pgDetails, formData.pg_details);
    }
    
    // Special handling for specific PG Hostel fields
    const pgFields = [
      // Gender preference
      'gender', 'genderPreference', 
      
      // Guest preferences
      'preferredGuests', 'preferredTenantType', 
      
      // Food options
      'foodIncluded', 'mealOptions', 'includedMeals',
      
      // Rules
      'pgRules', 'rules', 'noSmoking', 'noDrinking', 'noGuardians', 'noGirlsEntry', 'noNonVeg',
      
      // Operational details
      'gateClosingTime', 'availableFrom',
      
      // Room details
      'roomType', 'bathroomType', 'totalCapacity', 'roomSize',
      'expectedRent', 'expectedDeposit', 'roomFeatures',
      
      // Additional info
      'pgType', 'occupancyTypes', 'facilities', 'noticePolicy', 'description'
    ];
    
    // Check for PG specific fields at root level
    pgFields.forEach(field => {
      if (formData[field] !== undefined) {
        pgDetails[field] = formData[field];
      }
    });
    
    // Also check in the basic_details section (some fields might end up there)
    if (formData.steps?.basic_details) {
      pgFields.forEach(field => {
        if (formData.steps.basic_details[field] !== undefined) {
          pgDetails[field] = formData.steps.basic_details[field];
        }
      });
    }
    
    // Special handling for radio button fields (gender, food)
    if (formData.gender || formData.genderPreference) {
      pgDetails.genderPreference = formData.gender || formData.genderPreference;
    }
    
    if (formData.foodIncluded !== undefined) {
      pgDetails.foodIncluded = formData.foodIncluded;
    }
    
    // Handle checkboxes for rules
    const pgRules = [];
    if (formData.noSmoking) pgRules.push('No Smoking');
    if (formData.noDrinking) pgRules.push('No Drinking');
    if (formData.noGuardians) pgRules.push('No Guardians Stay');
    if (formData.noGirlsEntry) pgRules.push('No Girl\'s Entry');
    if (formData.noNonVeg) pgRules.push('No Non-veg');
    
    if (pgRules.length > 0) {
      pgDetails.rules = pgRules;
    }
    
    // Specifically look for room details data from the form
    if (formData.roomType) pgDetails.roomType = formData.roomType;
    if (formData.totalCapacity) pgDetails.totalCapacity = formData.totalCapacity;
    if (formData.expectedRent) pgDetails.expectedRent = formData.expectedRent;
    if (formData.expectedDeposit) pgDetails.expectedDeposit = formData.expectedDeposit;
    if (formData.bathroomType) pgDetails.bathroomType = formData.bathroomType;
    if (formData.roomSize) pgDetails.roomSize = formData.roomSize;
    
    // Room features from checkboxes
    const roomFeatures = [];
    if (formData.airConditioner || formData.hasAC) roomFeatures.push('Air Conditioner');
    if (formData.fan) roomFeatures.push('Fan');
    if (formData.wiFi) roomFeatures.push('Wi-Fi');
    if (formData.tv) roomFeatures.push('TV');
    if (formData.furniture) roomFeatures.push('Furniture');
    if (formData.geyser) roomFeatures.push('Geyser');
    
    if (roomFeatures.length > 0) {
      pgDetails.roomFeatures = roomFeatures;
    }
    
    return pgDetails;
  }
}