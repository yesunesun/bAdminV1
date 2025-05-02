// src/modules/owner/components/property/wizard/services/autoFill/basicDetailsAutoFill.ts
// Version: 1.0.0
// Last Modified: 03-05-2025 19:30 IST
// Purpose: Auto fill service for basic details tab

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';
import { DOMUtilsService } from './domUtilsService';

export class BasicDetailsAutoFill {
  /**
   * Fill basic details section of the form
   */
  static fillForm(form: UseFormReturn<FormData>): void {
    // Set individual fields
    form.setValue('propertyType', 'Apartment', { shouldDirty: true });
    form.setValue('bhkType', '3 BHK', { shouldDirty: true });
    form.setValue('floor', '3', { shouldDirty: true });
    form.setValue('totalFloors', '10', { shouldDirty: true });
    form.setValue('propertyAge', '1 - 3 years', { shouldDirty: true });
    form.setValue('facing', 'East', { shouldDirty: true });
    form.setValue('builtUpArea', '1250', { shouldDirty: true });
    form.setValue('builtUpAreaUnit', 'sqft', { shouldDirty: true });
    form.setValue('title', 'Spacious Modern Apartment in Prime Location', { shouldDirty: true });
    form.setValue('bathrooms', '2', { shouldDirty: true });
    form.setValue('balconies', '1', { shouldDirty: true });
    form.setValue('possessionDate', '2025-06-01', { shouldDirty: true });
    
    // Set structured data for v2 format
    form.setValue('basicDetails', {
      title: 'Spacious Modern Apartment in Prime Location',
      propertyType: 'Apartment',
      bhkType: '3 BHK',
      floor: 3,
      totalFloors: 10,
      builtUpArea: 1250,
      builtUpAreaUnit: 'sqft',
      bathrooms: 2,
      balconies: 1,
      facing: 'East',
      propertyAge: '1 - 3 years'
    }, { shouldDirty: true });
    
    // Set flow info
    form.setValue('flow', {
      category: 'residential',
      listingType: 'rent'
    }, { shouldDirty: true });
    
    // Trigger validation
    form.trigger();
    
    console.log("Basic details filled successfully via React Hook Form");
  }
  
  /**
   * Basic form data fill for any step
   */
  static fillBasicFormData(form: UseFormReturn<FormData>): void {
    // Set flow info
    form.setValue('flow', {
      category: 'residential',
      listingType: 'rent'
    }, { shouldDirty: true });
    
    // Try setting some common fields
    try {
      form.setValue('propertyType', 'Apartment', { shouldDirty: true });
      form.setValue('bhkType', '3 BHK', { shouldDirty: true });
      form.setValue('title', 'Spacious Modern Apartment', { shouldDirty: true });
      form.setValue('address', '123 Main Street, Hyderabad', { shouldDirty: true });
      form.setValue('rentAmount', '35000', { shouldDirty: true });
      form.trigger();
    } catch (e) {
      console.warn("Error setting basic form data:", e);
    }
  }
  
  /**
   * Fill DOM elements for basic details tab
   */
  static fillDOMElements(): void {
    try {
      console.log("Filling basic details DOM elements");
      
      // Fill dropdown fields
      this.fillRadixSelectComponents();
      
      // Fill date fields
      this.fillDateFields();
      
      // Fill numeric fields
      this.fillNumericFields();
      
    } catch (error) {
      console.error("Error filling basic details DOM elements:", error);
    }
  }
  
  /**
   * Specifically targets Radix UI Select components for basic details
   */
  private static fillRadixSelectComponents(): void {
    try {
      console.log("Filling Radix UI Select components for basic details...");
      
      // Define field mappings: label text -> field value
      const selectFieldMappings = [
        {
          labelTexts: ['type', 'property type', 'home type'],
          values: ['Apartment', 'Flat', 'Independent House', 'Villa'],
          dataTestId: 'propertyType'
        },
        {
          labelTexts: ['bhk', 'bedroom', 'bedrooms', 'rooms'],
          values: ['3 BHK', '3 Bedroom', '3 BR', '3'],
          dataTestId: 'bhkType'
        },
        {
          labelTexts: ['age', 'property age', 'built in', 'construction'],
          values: ['1 - 3 years', '0 - 1 year', 'New', 'Under 5 years'],
          dataTestId: 'propertyAge'
        },
        {
          labelTexts: ['facing', 'direction', 'direction facing'],
          values: ['East', 'North East', 'North', 'South East'],
          dataTestId: 'facing'
        },
        {
          labelTexts: ['area unit', 'unit', 'measurement'],
          values: ['sqft', 'Square Feet', 'Square Foot'],
          dataTestId: 'builtUpAreaUnit'
        }
      ];
      
      // Handle each select field mapping
      selectFieldMappings.forEach(mapping => {
        DOMUtilsService.fillRadixSelectByMapping(mapping);
      });
    } catch (error) {
      console.error("Error filling Radix UI Select components:", error);
    }
  }
  
  /**
   * Fill date fields for basic details
   */
  private static fillDateFields(): void {
    try {
      console.log("Filling date fields for basic details...");
      
      // Try to fill Possession Date
      const possessionDateFilled = DOMUtilsService.fillDateByLabel(
        ['possession', 'available from', 'handover', 'completion'],
        '2025-06-01'
      );
      
      // If that didn't work, try to find date inputs directly
      if (!possessionDateFilled) {
        const dateInputs = document.querySelectorAll('input[type="date"], input[placeholder*="dd/mm"], input[placeholder*="date"]');
        if (dateInputs.length > 0) {
          Array.from(dateInputs).forEach(input => {
            (input as HTMLInputElement).value = '2025-06-01';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            console.log(`Set date input to 2025-06-01`);
          });
        }
      }
    } catch (error) {
      console.error("Error filling date fields:", error);
    }
  }
  
  /**
   * Fill numeric fields for basic details
   */
  private static fillNumericFields(): void {
    try {
      console.log("Filling numeric fields for basic details...");
      
      // Try to fill specific numeric fields
      DOMUtilsService.fillInputByLabel(['floor'], '3');
      DOMUtilsService.fillInputByLabel(['total floor', 'floors total'], '10');
      DOMUtilsService.fillInputByLabel(['area', 'built up', 'builtup'], '1250');
      
      // Try alternative approach for specific placeholder texts
      const placeholderToValue = {
        'floor': '3',
        'total': '10',
        'area': '1250'
      };
      
      Object.entries(placeholderToValue).forEach(([placeholder, value]) => {
        const inputs = document.querySelectorAll(`input[placeholder*="${placeholder}" i]`);
        inputs.forEach(input => {
          (input as HTMLInputElement).value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
          console.log(`Set input with placeholder containing "${placeholder}" to ${value}`);
        });
      });
    } catch (error) {
      console.error("Error filling numeric fields:", error);
    }
  }
}