// src/modules/owner/components/property/wizard/services/flows/PGHostelFlowService.ts
// Version: 1.4.0
// Last Modified: 02-06-2025 15:30 IST
// Purpose: Updated to handle "No Opposite Gender's Entry" rule rename and removed Monthly Rent/Security Deposit references

import { BaseFlowService } from './BaseFlowService';
import { FlowContext } from './FlowServiceInterface';
import { FLOW_TYPES, FLOW_STEPS } from '../../constants/flows';

export class PGHostelFlowService extends BaseFlowService {
 protected category: string = 'residential';
 protected listingType: string = 'pghostel';
 
 /**
  * Get the flow type
  */
 getFlowType(): string {
   return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
 }
 
 /**
  * Detect if this is a PG/Hostel flow
  */
 detectFlow(formData: any, flowContext: FlowContext): boolean {
   // Check for explicit PG mode prop
   if (flowContext.isPGHostelMode) {
     console.log("Detected PG/Hostel from isPGHostelMode flag");
     return true;
   }
   
   // Check URL path for PG/Hostel indicators
   const urlPath = flowContext.urlPath?.toLowerCase() || '';
   if (urlPath.includes('pghostel') || urlPath.includes('pg-hostel') || 
       urlPath.includes('/pg/') || urlPath.includes('/hostel/')) {
     console.log("Detected PG/Hostel from URL path");
     return true;
   }
   
   // Check flow info in the form data
   if (formData.flow?.listingType === 'pghostel' || 
       (formData.flow?.listingType || '').toLowerCase().includes('pg') || 
       (formData.flow?.listingType || '').toLowerCase().includes('hostel')) {
     console.log("Detected PG/Hostel from flow.listingType");
     return true;
   }
   
   // Check for PG-specific steps
   const pgSteps = [
     'res_pg_basic_details',
     'res_pg_location',
     'res_pg_pg_details',
     'res_pg_features'
   ];
   
   if (formData.steps) {
     for (const step of pgSteps) {
       if (formData.steps[step] && Object.keys(formData.steps[step]).length > 0) {
         console.log(`Detected PG/Hostel from step: ${step}`);
         return true;
       }
     }
   }
   
   // Check if adType parameter includes 'pg' or 'hostel'
   if (flowContext.adType) {
     const adTypeLower = flowContext.adType.toLowerCase();
     if (adTypeLower.includes('pg') || adTypeLower.includes('hostel')) {
       console.log("Detected PG/Hostel from adType");
       return true;
     }
   }
   
   return false;
 }
 
 /**
  * Format form data for database storage
  */
 formatForStorage(formData: any): any {
   // First, let the base class do its work
   const output = super.formatForStorage(formData);
   
   // Set the correct flow information
   output.flow = {
     category: 'residential',
     listingType: 'pghostel',
     flowType: FLOW_TYPES.RESIDENTIAL_PGHOSTEL
   };
   
   // Clean up the steps to ensure only PG/Hostel steps exist
   this.cleanupPGHostelSteps(output);
   
   // Collect fields that are at root level
   this.moveRootFieldsToSteps(output);
   
   return output;
 }
 
 /**
  * Clean up steps to ensure only PG/Hostel steps exist
  */
 private cleanupPGHostelSteps(data: any): void {
   if (!data || !data.steps) return;
   
   // Get the PG/Hostel steps
   const pgSteps = FLOW_STEPS[FLOW_TYPES.RESIDENTIAL_PGHOSTEL];
   
   // First, migrate any data from other steps
   this.migrateStepDataToPG(data);
   
   // Then create a new steps object with only PG steps
   const oldSteps = data.steps;
   const newSteps = {};
   
   // Copy only the PG steps
   pgSteps.forEach(stepId => {
     newSteps[stepId] = oldSteps[stepId] || {};
   });
   
   // Replace the steps object
   data.steps = newSteps;
 }
 
 /**
  * Migrate data from other steps to PG/Hostel steps
  */
 private migrateStepDataToPG(data: any): void {
   if (!data.steps) {
     data.steps = {};
   }
   
   // Map from residential rent steps to PG steps
   const stepMapping = {
     'res_rent_basic_details': 'res_pg_basic_details',
     'res_rent_location': 'res_pg_location',
     'res_rent_rental': 'res_pg_pg_details',
     'res_rent_features': 'res_pg_features',
     'res_rent_review': 'res_pg_review'
   };
   
   // Create PG steps if they don't exist
   Object.values(stepMapping).forEach(pgStep => {
     if (!data.steps[pgStep]) {
       data.steps[pgStep] = {};
     }
   });
   
   // Transfer data from old steps to new steps
   for (const [oldStep, newStep] of Object.entries(stepMapping)) {
     if (data.steps[oldStep] && Object.keys(data.steps[oldStep]).length > 0) {
       // Copy all fields from old step to new step
       Object.entries(data.steps[oldStep]).forEach(([key, value]) => {
         data.steps[newStep][key] = value;
       });
     }
   }
 }
 
 /**
  * Move fields from root level to their appropriate steps
  */
 private moveRootFieldsToSteps(data: any): void {
   // Basic details fields that might be at root level
   const basicDetailsFields = [
     'roomType', 'bathroomType', 'totalRooms', 'roomCapacity', 'totalOccupancy',
     'expectedRent', 'expectedDeposit', 'roomSize', 'builtUpArea',
     'builtUpAreaUnit', 'roomFeatures', 'hasAttachedBathroom',
     'hasBalcony', 'hasAC', 'hasFan', 'hasTV', 'hasFurniture', 'hasGeyser', 'hasWiFi'
   ];
   
   // PG details specific fields (removed monthlyRent and securityDeposit)
   const pgDetailsFields = [
     'genderPreference', 'gender', 'occupantType', 'preferredGuests',
     'mealOption', 'foodIncluded', 'mealOptions', 'rules',
     'noSmoking', 'noDrinking', 'noNonVeg', 'noGuardians', 'noOppositeSexEntry',
     'gateClosingTime', 'availableFrom', 'description'
   ];
   
   // Move basic details fields to proper step
   basicDetailsFields.forEach(field => {
     if (data[field] !== undefined) {
       data.steps.res_pg_basic_details[field] = data[field];
     }
   });
   
   // Move PG details fields to proper step
   pgDetailsFields.forEach(field => {
     if (data[field] !== undefined) {
       data.steps.res_pg_pg_details[field] = data[field];
     }
   });
   
   // ✅ UPDATED: Special handling for rules with the new name
   const ruleMappings = {
     'noSmoking': 'No Smoking',
     'noDrinking': 'No Drinking',
     'noNonVeg': 'No Non-veg',
     'noGuardians': 'No Guardians Stay',
     'noOppositeSexEntry': 'No Opposite Gender\'s Entry' // Updated from noGirlsEntry
   };
   
   // Build rules array from individual checkboxes
   const rules = [];
   for (const [key, value] of Object.entries(ruleMappings)) {
     if (data[key] === true) {
       rules.push(value);
     }
   }
   
   // ✅ MIGRATION: Handle legacy "No Girl's Entry" rule
   if (data.steps?.res_pg_pg_details?.rules) {
     const existingRules = data.steps.res_pg_pg_details.rules;
     if (Array.isArray(existingRules)) {
       const updatedRules = existingRules.map(rule => 
         rule === "No Girl's Entry" ? "No Opposite Gender's Entry" : rule
       );
       data.steps.res_pg_pg_details.rules = updatedRules;
     }
   }
   
   // If we found rules, add them to the output
   if (rules.length > 0) {
     data.steps.res_pg_pg_details.rules = rules;
   }
 }
}