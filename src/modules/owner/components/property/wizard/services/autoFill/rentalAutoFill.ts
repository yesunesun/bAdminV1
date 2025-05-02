// src/modules/owner/components/property/wizard/services/autoFill/rentalAutoFill.ts
// Version: 1.0.0
// Last Modified: 03-05-2025 19:30 IST
// Purpose: Auto fill service for rental tab

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';
import { DOMUtilsService } from './domUtilsService';

export class RentalAutoFill {
  /**
   * Fill rental details section of the form using React Hook Form
   */
  static fillForm(form: UseFormReturn<FormData>): void {
    console.log("Filling rental details form fields");
    
    // Basic rental fields
    form.setValue('rentalType', 'rent', { shouldDirty: true });
    form.setValue('rentAmount', '35000', { shouldDirty: true });
    form.setValue('securityDeposit', '70000', { shouldDirty: true });
    form.setValue('maintenance', '3500', { shouldDirty: true });
    form.setValue('maintenanceType', 'Monthly', { shouldDirty: true });
    form.setValue('rentNegotiable', true, { shouldDirty: true });
    form.setValue('availableFrom', '2025-06-01', { shouldDirty: true });
    form.setValue('furnishing', 'Semi-Furnished', { shouldDirty: true });
    form.setValue('parking', 'Car & Bike', { shouldDirty: true });
    
    // Preferred tenant options
    form.setValue('preferredTenants', ['Family', 'Working Professionals'], { shouldDirty: true });
    form.setValue('nonVegAllowed', true, { shouldDirty: true });
    form.setValue('petsAllowed', true, { shouldDirty: true });
    form.setValue('hasLockInPeriod', true, { shouldDirty: true });
    
    // Set structured data for v2 format
    form.setValue('rental', {
      rentAmount: 35000,
      securityDeposit: 70000,
      maintenanceCharges: 3500,
      maintenanceType: 'Monthly',
      rentNegotiable: true,
      availableFrom: '2025-06-01',
      preferredTenants: ['Family', 'Working Professionals'],
      leaseDuration: '11 months',
      furnishingStatus: 'Semi-Furnished',
      parking: 'Car & Bike',
      nonVegAllowed: true,
      petsAllowed: true,
      hasLockInPeriod: true
    }, { shouldDirty: true });
    
    // Trigger validation
    form.trigger();
    
    console.log("Rental details filled successfully via React Hook Form");
  }
  
  /**
   * Fill DOM elements for rental tab
   */
  static fillDOMElements(): void {
    try {
      console.log("Filling rental fields using DOM manipulation");
      
      // Fill Rent Amount
      DOMUtilsService.fillInputByLabel(['rent amount', 'monthly rent'], '35000');
      
      // Fill Security Deposit 
      DOMUtilsService.fillInputByLabel(['security deposit', 'deposit'], '70000');
      
      // Fill Maintenance Amount
      DOMUtilsService.fillInputByLabel(['maintenance', 'maintenance charge'], '3500');
      
      // Select Maintenance Type dropdown
      DOMUtilsService.fillRadixSelectByMapping({
        labelTexts: ['maintenance type', 'maintenance option'],
        values: ['Monthly', 'Included', 'Quarterly'],
        dataTestId: 'maintenanceType'
      });
      
      // Select Furnishing Status dropdown
      DOMUtilsService.fillRadixSelectByMapping({
        labelTexts: ['furnishing', 'furnishing status'],
        values: ['Semi-Furnished', 'Fully Furnished', 'Unfurnished'],
        dataTestId: 'furnishing'
      });
      
      // Select Parking dropdown
      DOMUtilsService.fillRadixSelectByMapping({
        labelTexts: ['parking', 'parking option'],
        values: ['Car & Bike', 'Car', 'Bike', 'None'],
        dataTestId: 'parking'
      });
      
      // Fill Available From date
      DOMUtilsService.fillDateByLabel(['available from', 'available date'], '2025-06-01');
      
      // Check all the checkboxes - Preferred Tenants
      DOMUtilsService.checkCheckboxByLabel(['family'], true);
      DOMUtilsService.checkCheckboxByLabel(['working professional'], true);
      DOMUtilsService.checkCheckboxByLabel(['bachelor male'], true);
      DOMUtilsService.checkCheckboxByLabel(['bachelor female'], true);
      
      // Check the "Negotiable" option
      DOMUtilsService.checkCheckboxByLabel(['negotiable'], true);
      
      // Check other rental checkboxes
      DOMUtilsService.checkCheckboxByLabel(['non-veg allowed', 'non veg'], true);
      DOMUtilsService.checkCheckboxByLabel(['pets allowed', 'pet friendly'], true);
      DOMUtilsService.checkCheckboxByLabel(['lock-in period', 'lock in'], true);
      
      console.log("Rental fields filled successfully");
    } catch (error) {
      console.error("Error filling rental fields:", error);
    }
  }
}