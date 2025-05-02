// src/modules/owner/components/property/wizard/services/autoFillService.ts
// Version: 1.0.0
// Last Modified: 03-05-2025 19:30 IST
// Purpose: Main Auto Fill service coordinator

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../types';
import { TabDetectionService } from './autoFill/tabDetectionService';
import { BasicDetailsAutoFill } from './autoFill/basicDetailsAutoFill';
import { LocationAutoFill } from './autoFill/locationAutoFill';
import { RentalAutoFill } from './autoFill/rentalAutoFill';
import { FeaturesAutoFill } from './autoFill/featuresAutoFill';

/**
 * Service for handling form auto-fill functionality
 * Only to be used in development mode
 */
export class AutoFillService {
  
  /**
   * Checks if the application is running in development mode
   */
  static isDevelopmentMode(): boolean {
    return process.env.NODE_ENV === 'development';
  }
  
  /**
   * Fills the form with test data for the current step
   * @param form The React Hook Form instance
   * @param currentStepId The ID of the current step
   * @param formStep The current step number
   */
  static autoFillCurrentStep(form: UseFormReturn<FormData>, currentStepId: string, formStep: number): void {
    console.log("Auto Fill requested for step:", currentStepId);
    
    try {
      // Check which tab is currently active based on the DOM
      const activeTab = TabDetectionService.detectActiveTab();
      console.log("Detected active tab:", activeTab);
      
      // Determine which step/tab to fill
      const tabToFill = activeTab?.toLowerCase() || currentStepId.toLowerCase();
      
      // Fill appropriate data based on the current step or active tab
      if (tabToFill.includes('basic') || tabToFill.includes('details')) {
        BasicDetailsAutoFill.fillForm(form);
        setTimeout(() => BasicDetailsAutoFill.fillDOMElements(), 100);
      } 
      else if (tabToFill.includes('location')) {
        LocationAutoFill.fillForm(form);
        setTimeout(() => LocationAutoFill.fillDOMElements(), 100);
      } 
      else if (tabToFill.includes('rental')) {
        RentalAutoFill.fillForm(form);
        setTimeout(() => RentalAutoFill.fillDOMElements(), 100);
      } 
      else if (tabToFill.includes('features') || tabToFill.includes('amenities')) {
        FeaturesAutoFill.fillForm(form);
        setTimeout(() => FeaturesAutoFill.fillDOMElements(), 100);
      }
      else {
        console.log("No specific auto-fill available for this step/tab:", tabToFill);
        BasicDetailsAutoFill.fillBasicFormData(form);
      }
      
    } catch (error) {
      console.error("Error in auto fill service:", error);
    }
  }
}