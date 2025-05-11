// src/modules/owner/components/property/wizard/services/flows/BaseFlowService.ts
// Version: 2.3.0
// Last Modified: 18-05-2025 18:30 IST
// Purpose: Added comprehensive logging for debugging flatmate data issues

import { FlowServiceInterface, FlowContext } from './FlowServiceInterface';
import { FormData } from '../../types';
import { FLOW_STEPS } from '../../constants/flows';

export abstract class BaseFlowService implements FlowServiceInterface {
  protected category: string = 'residential';
  protected listingType: string = 'rent';
  
  abstract detectFlow(formData: any, flowContext: FlowContext): boolean;
  
  /**
   * Format data for the new step-based structure
   */
  formatData(formData: any): FormData {
    const flowKey = this.getFlowKey();
    const flowSteps = FLOW_STEPS[flowKey] || FLOW_STEPS.default;
    
    // Create output structure with only the necessary sections
    const output: FormData = {
      meta: this.formatMetaSection(formData),
      flow: {
        category: this.category as any,
        listingType: this.listingType
      },
      steps: this.formatStepsSection(formData, flowSteps),
      media: this.formatMediaSection(formData)
    };
    
    // Debug logging for flatmate flow
    if (this.listingType === 'flatmates') {
      console.log('=== FLATMATE FLOW DEBUG ===');
      console.log('Original formData:', JSON.stringify(formData, null, 2));
      console.log('Flow key:', flowKey);
      console.log('Flow steps:', flowSteps);
      console.log('Formatted output:', JSON.stringify(output, null, 2));
      console.log('========================');
    }
    
    console.log(`${this.getFlowType()} flow output:`, output);
    
    return output;
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
   * Format the steps section with flow-specific step identifiers
   * Exclude review step from the output
   */
  protected formatStepsSection(formData: any, flowSteps: string[]): any {
    const steps: any = {};
    
    // Filter out review step from flow steps
    const relevantSteps = flowSteps.filter(stepId => !stepId.includes('_review'));
    
    // If data is already in steps format, use it
    if (formData.steps) {
      // Copy existing steps (excluding review)
      relevantSteps.forEach(stepId => {
        if (formData.steps[stepId]) {
          steps[stepId] = { ...formData.steps[stepId] };
        }
      });
    }
    
    // Map legacy data to step-specific locations
    relevantSteps.forEach(stepId => {
      if (!steps[stepId]) {
        steps[stepId] = {};
      }
      
      // Debug logging for flatmate details
      if (stepId.includes('_flatmate_details')) {
        console.log(`=== DEBUGGING ${stepId} ===`);
        console.log('formData before extraction:', JSON.stringify(formData, null, 2));
      }
      
      // Extract data for each step based on step type
      if (stepId.includes('_basic_details')) {
        Object.assign(steps[stepId], this.extractBasicDetailsData(formData));
      } else if (stepId.includes('_location')) {
        Object.assign(steps[stepId], this.extractLocationData(formData));
      } else if (stepId.includes('_rental')) {
        Object.assign(steps[stepId], this.extractRentalData(formData));
      } else if (stepId.includes('_sale_details')) {
        Object.assign(steps[stepId], this.extractSaleData(formData));
      } else if (stepId.includes('_features')) {
        Object.assign(steps[stepId], this.extractFeaturesData(formData));
      } else if (stepId.includes('_flatmate_details')) {
        const flatmateData = this.extractFlatmateData(formData);
        Object.assign(steps[stepId], flatmateData);
        console.log(`=== ${stepId} DATA AFTER EXTRACTION ===`);
        console.log('Extracted data:', JSON.stringify(flatmateData, null, 2));
        console.log('Final step data:', JSON.stringify(steps[stepId], null, 2));
      } else if (stepId.includes('_pg_details')) {
        Object.assign(steps[stepId], this.extractPGData(formData));
      } else if (stepId.includes('_coworking_details')) {
        Object.assign(steps[stepId], this.extractCoworkingData(formData));
      } else if (stepId.includes('_land_features')) {
        Object.assign(steps[stepId], this.extractLandFeaturesData(formData));
      }
    });
    
    return steps;
  }
  
  /**
   * Extract basic details data from various sources
   */
  protected extractBasicDetailsData(formData: any): any {
    const data: any = {};
    
    // Fields to extract for basic details
    const fields = [
      'title', 'propertyType', 'bhkType', 'floor', 'totalFloors', 
      'builtUpArea', 'builtUpAreaUnit', 'bathrooms', 'balconies', 
      'facing', 'propertyAge', 'propertyCondition', 'hasBalcony', 'hasAC',
      'possessionDate'
    ];
    
    // Extract from steps structure first
    if (formData.steps) {
      Object.keys(formData.steps).forEach(stepKey => {
        if (stepKey.includes('_basic_details') && formData.steps[stepKey]) {
          Object.assign(data, formData.steps[stepKey]);
        }
      });
    }
    
    // Then from flat structure
    fields.forEach(field => {
      if (formData[field] !== undefined && data[field] === undefined) {
        data[field] = formData[field];
      }
    });
    
    // Finally from legacy nested structures
    if (formData.details?.basicDetails || formData.basicDetails) {
      const source = formData.details?.basicDetails || formData.basicDetails;
      fields.forEach(field => {
        if (source[field] !== undefined && data[field] === undefined) {
          data[field] = source[field];
        }
      });
    }
    
    return data;
  }
  
  /**
   * Extract location data from various sources
   */
  protected extractLocationData(formData: any): any {
    const data: any = {};
    
    // Fields to extract for location
    const fields = [
      'address', 'flatPlotNo', 'landmark', 'locality', 'area', 
      'city', 'district', 'state', 'pinCode'
    ];
    
    // Extract from steps structure first
    if (formData.steps) {
      Object.keys(formData.steps).forEach(stepKey => {
        if (stepKey.includes('_location') && formData.steps[stepKey]) {
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
    
    // From location object
    if (formData.location) {
      fields.forEach(field => {
        if (formData.location[field] !== undefined && data[field] === undefined) {
          data[field] = formData.location[field];
        }
      });
    }
    
    // Handle coordinates specially
    if (!data.coordinates) {
      if (formData.coordinates) {
        data.coordinates = formData.coordinates;
      } else if (formData.location?.coordinates) {
        data.coordinates = formData.location.coordinates;
      } else if (formData.latitude !== undefined && formData.longitude !== undefined) {
        data.coordinates = {
          latitude: formData.latitude,
          longitude: formData.longitude
        };
      }
    }
    
    return data;
  }
  
  /**
   * Extract rental data from various sources
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
    
    return data;
  }
  
  /**
   * Extract sale data from various sources
   */
  protected extractSaleData(formData: any): any {
    const data: any = {};
    
    const fields = [
      'expectedPrice', 'priceNegotiable', 'possessionDate', 'hasSimilarUnits',
      'propertyShowOption', 'propertyShowPerson', 'secondaryNumber', 'secondaryContactNumber'
    ];
    
    // Extract from steps structure first
    if (formData.steps) {
      Object.keys(formData.steps).forEach(stepKey => {
        if (stepKey.includes('_sale_details') && formData.steps[stepKey]) {
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
    
    // Finally from sale object
    if (formData.sale) {
      fields.forEach(field => {
        if (formData.sale[field] !== undefined && data[field] === undefined) {
          data[field] = formData.sale[field];
        }
      });
    }
    
    return data;
  }
  
  /**
   * Extract features data from various sources
   */
  protected extractFeaturesData(formData: any): any {
    const data: any = {};
    
    const fields = [
      'amenities', 'parking', 'petFriendly', 'nonVegAllowed', 'waterSupply',
      'powerBackup', 'gatedSecurity', 'description', 'isSmokingAllowed',
      'isDrinkingAllowed', 'hasAttachedBathroom', 'hasGym'
    ];
    
    // Extract from steps structure first
    if (formData.steps) {
      Object.keys(formData.steps).forEach(stepKey => {
        if (stepKey.includes('_features') && formData.steps[stepKey]) {
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
    
    // Finally from features object
    if (formData.features) {
      fields.forEach(field => {
        if (formData.features[field] !== undefined && data[field] === undefined) {
          data[field] = formData.features[field];
        }
      });
    }
    
    return data;
  }
  
  /**
   * Extract flatmate-specific data
   */
  protected extractFlatmateData(formData: any): any {
    const data: any = {};
    
    const fields = [
      'preferredGender', 'occupancy', 'foodPreference', 'tenantType',
      'roomSharing', 'maxFlatmates', 'currentFlatmates', 'about'
    ];
    
    // Debug logging
    console.log('=== BASE FLATMATE DATA EXTRACTION ===');
    console.log('formData.steps:', formData.steps);
    console.log('formData.flatmate_details:', formData.flatmate_details);
    console.log('formData.flatmateDetails:', formData.flatmateDetails);
    
    // Extract from steps structure first
    if (formData.steps) {
      Object.keys(formData.steps).forEach(stepKey => {
        if (stepKey.includes('flatmate_details') && formData.steps[stepKey]) {
          Object.assign(data, formData.steps[stepKey]);
          console.log(`Found data in ${stepKey}:`, formData.steps[stepKey]);
        }
      });
    }
    
    // Then from root-level flatmate_details object
    if (formData.flatmate_details) {
      fields.forEach(field => {
        if (formData.flatmate_details[field] !== undefined && data[field] === undefined) {
          data[field] = formData.flatmate_details[field];
        }
      });
      console.log('Found data in flatmate_details:', formData.flatmate_details);
    }
    
    // Then from alternative naming (flatmateDetails)
    if (formData.flatmateDetails) {
      fields.forEach(field => {
        if (formData.flatmateDetails[field] !== undefined && data[field] === undefined) {
          data[field] = formData.flatmateDetails[field];
        }
      });
      console.log('Found data in flatmateDetails:', formData.flatmateDetails);
    }
    
    // Finally from direct properties
    fields.forEach(field => {
      if (formData[field] !== undefined && data[field] === undefined) {
        data[field] = formData[field];
      }
    });
    
    console.log('Final extracted flatmate data:', data);
    console.log('====================================');
    
    return data;
  }
  
  /**
   * Extract PG/Hostel specific data
   */
  protected extractPGData(formData: any): any {
    const data: any = {};
    
    const fields = [
      'pgType', 'mealOptions', 'roomTypes', 'occupancyTypes', 'genderPreference',
      'rules', 'facilities', 'noticePolicy'
    ];
    
    fields.forEach(field => {
      if (formData[field] !== undefined) {
        data[field] = formData[field];
      } else if (formData.pg_details?.[field] !== undefined) {
        data[field] = formData.pg_details[field];
      } else if (formData.pgDetails?.[field] !== undefined) {
        data[field] = formData.pgDetails[field];
      }
    });
    
    return data;
  }
  
  /**
   * Extract coworking specific data
   */
  protected extractCoworkingData(formData: any): any {
    const data: any = {};
    
    const fields = [
      'spaceType', 'capacity', 'operatingHours', 'amenities',
      'securityDeposit', 'minimumCommitment', 'discounts', 'availableFrom'
    ];
    
    fields.forEach(field => {
      if (formData[field] !== undefined) {
        data[field] = formData[field];
      } else if (formData.coworking?.[field] !== undefined) {
        data[field] = formData.coworking[field];
      } else if (formData.coworkingDetails?.[field] !== undefined) {
        data[field] = formData.coworkingDetails[field];
      }
    });
    
    return data;
  }
  
  /**
   * Extract land features data
   */
  protected extractLandFeaturesData(formData: any): any {
    const data: any = {};
    
    const fields = [
      'approvals', 'boundaryStatus', 'cornerPlot', 'landUseZone', 'description'
    ];
    
    fields.forEach(field => {
      if (formData[field] !== undefined) {
        data[field] = formData[field];
      } else if (formData.land_features?.[field] !== undefined) {
        data[field] = formData.land_features[field];
      } else if (formData.landFeatures?.[field] !== undefined) {
        data[field] = formData.landFeatures[field];
      }
    });
    
    return data;
  }
}