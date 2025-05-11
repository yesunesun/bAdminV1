// src/modules/owner/components/property/wizard/services/flows/ResidentialFlatmatesFlowService.ts
// Version: 1.3.0
// Last Modified: 11-05-2025 01:00 IST
// Purpose: Fixed data extraction to correctly read from steps structure

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';

export class ResidentialFlatmatesFlowService extends BaseFlowService {
  protected category: string = 'residential';
  protected listingType: string = 'flatmates';
  
  /**
   * Detect if this is a Residential Flatmates flow
   */
  detectFlow(formData: any, flowContext: FlowContext): boolean {
    // Check URL path
    const urlPath = flowContext.urlPath.toLowerCase();
    if (urlPath.includes('flatmate') || urlPath.includes('flat-mate')) {
      return true;
    }
    
    // Check flow info in the form data
    if (formData.flow?.listingType === 'flatmates' || 
        (formData.flow?.listingType || '').toLowerCase().includes('flatmate')) {
      return true;
    }
    
    // Check for flatmate-specific fields in any format
    if (this.hasFlatmateData(formData)) {
      return true;
    }
    
    // Check if adType parameter includes 'flatmate'
    if (flowContext.adType) {
      const adTypeLower = flowContext.adType.toLowerCase();
      if (adTypeLower.includes('flatmate')) {
        return true;
      }
    }
    
    // Default check based on category and listingType from context
    if (flowContext.category === 'residential' && 
        (flowContext.listingType === 'flatmates' || 
         (flowContext.listingType || '').toLowerCase().includes('flatmate'))) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Check if the form data contains any flatmate-related information
   */
  private hasFlatmateData(formData: any): boolean {
    // First check in the new structure
    if (formData.steps?.res_flat_flatmate_details) {
      return Object.keys(formData.steps.res_flat_flatmate_details).length > 0;
    }
    
    // Define all possible flatmate field names (including variations)
    const flatmateFields = [
      'preferredGender', 'occupancy', 'foodPreference', 'tenantType',
      'roomSharing', 'maxFlatmates', 'currentFlatmates', 'about',
      // Possible variations
      'preferred_gender', 'food_preference', 'tenant_type', 'room_sharing',
      'max_flatmates', 'current_flatmates',
      // New fields from the form
      'hasAttachedBathroom', 'hasAC', 'hasBalcony', 'isNonVegAllowed',
      'isSmokingAllowed', 'isDrinkingAllowed', 'propertyShowPerson',
      'waterSupply', 'secondaryContactNumber', 'directions'
    ];
    
    // Check in various locations
    const checkLocations = [
      formData,
      formData.flatmate_details,
      formData.flatmateDetails,
      formData.flatMateDetails,
      formData.steps?.flatmate_details,
      formData.details?.flatmateDetails
    ];
    
    for (const location of checkLocations) {
      if (location) {
        for (const field of flatmateFields) {
          if (location[field] !== undefined) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  /**
   * Override formatData to ensure flatmate data is properly captured
   */
  formatData(formData: any): any {
    console.log('ResidentialFlatmatesFlowService.formatData called with:', formData);
    
    // Call base implementation
    const result = super.formatData(formData);
    
    // Extract flatmate data more aggressively
    const flatmateData = this.extractFlatmateDataComprehensively(formData);
    
    // Ensure the flatmate step exists and has data
    const flatmateStepId = 'res_flat_flatmate_details';
    
    if (Object.keys(flatmateData).length > 0) {
      result.steps[flatmateStepId] = flatmateData;
      console.log('Successfully assigned flatmate data:', flatmateData);
    } else {
      // If no data found, create empty object with default values
      result.steps[flatmateStepId] = this.getDefaultFlatmateData();
      console.log('No flatmate data found, using defaults');
    }
    
    console.log('Final result:', result);
    return result;
  }
  
  /**
   * Comprehensive extraction of flatmate data from all possible sources
   */
  private extractFlatmateDataComprehensively(formData: any): any {
    const data: any = {};
    
    // Priority 1: Check in the new steps structure first
    if (formData.steps?.res_flat_flatmate_details) {
      console.log('Found flatmate data in steps.res_flat_flatmate_details:', formData.steps.res_flat_flatmate_details);
      return { ...formData.steps.res_flat_flatmate_details };
    }
    
    // Define field mappings to handle variations
    const fieldMappings = {
      hasAttachedBathroom: ['hasAttachedBathroom', 'attached_bathroom'],
      hasAC: ['hasAC', 'has_ac', 'ac_available'],
      hasBalcony: ['hasBalcony', 'has_balcony', 'balcony_available'],
      isNonVegAllowed: ['isNonVegAllowed', 'non_veg_allowed', 'nonVegAllowed'],
      isSmokingAllowed: ['isSmokingAllowed', 'smoking_allowed', 'smokingAllowed'],
      isDrinkingAllowed: ['isDrinkingAllowed', 'drinking_allowed', 'drinkingAllowed'],
      propertyShowPerson: ['propertyShowPerson', 'property_show_person', 'showPerson'],
      waterSupply: ['waterSupply', 'water_supply'],
      secondaryContactNumber: ['secondaryContactNumber', 'secondary_contact_number', 'secondaryNumber'],
      directions: ['directions', 'property_directions'],
      about: ['about', 'description', 'flatmate_about', 'additional_info'],
      // Legacy flatmate fields
      preferredGender: ['preferredGender', 'preferred_gender', 'gender_preference'],
      occupancy: ['occupancy', 'room_occupancy'],
      foodPreference: ['foodPreference', 'food_preference', 'food_habit'],
      tenantType: ['tenantType', 'tenant_type', 'preference_for'],
      roomSharing: ['roomSharing', 'room_sharing', 'sharing_type'],
      maxFlatmates: ['maxFlatmates', 'max_flatmates', 'max_occupants'],
      currentFlatmates: ['currentFlatmates', 'current_flatmates', 'existing_flatmates']
    };
    
    // Sources to check, in order of priority
    const sources = [
      { data: formData.steps?.flatmate_details, name: 'steps.flatmate_details' },
      { data: formData.flatmate_details, name: 'flatmate_details' },
      { data: formData.flatmateDetails, name: 'flatmateDetails' },
      { data: formData.flatMateDetails, name: 'flatMateDetails' },
      { data: formData.details?.flatmateDetails, name: 'details.flatmateDetails' },
      { data: formData, name: 'root' }
    ];
    
    // Extract data from each source
    for (const [targetField, possibleNames] of Object.entries(fieldMappings)) {
      for (const source of sources) {
        if (source.data) {
          for (const name of possibleNames) {
            const value = source.data[name];
            if (value !== undefined && data[targetField] === undefined) {
              data[targetField] = value;
              console.log(`Found ${targetField} in ${source.name}.${name}:`, value);
              break;
            }
          }
        }
      }
    }
    
    // Perform data type conversions and validations
    this.validateAndCleanFlatmateData(data);
    
    return data;
  }
  
  /**
   * Get default flatmate data when no data is found
   */
  private getDefaultFlatmateData(): any {
    return {
      hasAttachedBathroom: 'No',
      hasAC: 'No',
      hasBalcony: 'No',
      isNonVegAllowed: 'No',
      isSmokingAllowed: 'No',
      isDrinkingAllowed: 'No',
      propertyShowPerson: '',
      waterSupply: '',
      secondaryContactNumber: '',
      directions: '',
      about: '',
      // Legacy fields
      preferredGender: 'Any',
      occupancy: 'Single',
      foodPreference: 'Any',
      tenantType: 'Any',
      roomSharing: false,
      maxFlatmates: 1,
      currentFlatmates: 0
    };
  }
  
  /**
   * Validate and clean flatmate data
   */
  private validateAndCleanFlatmateData(data: any): void {
    // Convert string boolean values
    if (typeof data.roomSharing === 'string') {
      data.roomSharing = data.roomSharing.toLowerCase() === 'true' || 
                         data.roomSharing.toLowerCase() === 'yes';
    }
    
    // Convert string numbers
    if (typeof data.maxFlatmates === 'string') {
      const parsed = parseInt(data.maxFlatmates);
      data.maxFlatmates = isNaN(parsed) ? 1 : parsed;
    }
    
    if (typeof data.currentFlatmates === 'string') {
      const parsed = parseInt(data.currentFlatmates);
      data.currentFlatmates = isNaN(parsed) ? 0 : parsed;
    }
    
    // Ensure minimum values
    if (data.maxFlatmates < 1) data.maxFlatmates = 1;
    if (data.currentFlatmates < 0) data.currentFlatmates = 0;
    
    // Ensure maxFlatmates is at least currentFlatmates
    if (data.currentFlatmates > data.maxFlatmates) {
      data.maxFlatmates = data.currentFlatmates;
    }
    
    // Clean up empty strings
    if (data.about === '') {
      delete data.about;
    }
  }
  
  /**
   * Override extractFlatmateData to use comprehensive extraction
   */
  protected extractFlatmateData(formData: any): any {
    return this.extractFlatmateDataComprehensively(formData);
  }
}