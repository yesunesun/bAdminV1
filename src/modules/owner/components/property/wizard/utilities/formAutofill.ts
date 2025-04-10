// src/modules/owner/components/property/wizard/utilities/formAutofill.ts
// Version: 1.0.0
// Last Modified: 11-04-2025 21:30 IST
// Purpose: Dedicated autofill utility for property form

import { TEST_DATA } from '../test-data';

// Helper function to fill form with test data for a specific section
export const fillFormSection = (form: any, section: keyof typeof TEST_DATA) => {
  if (!form || typeof form.setValue !== 'function') {
    console.error('Invalid form object');
    return false;
  }
  
  const sectionData = TEST_DATA[section];
  if (!sectionData) {
    console.error(`No test data found for section: ${section}`);
    return false;
  }
  
  console.log(`Filling data for ${section} section...`);
  
  try {
    // Fill each field in the section
    Object.entries(sectionData).forEach(([field, value]) => {
      try {
        console.log(`Setting ${field} = `, value);
        form.setValue(field, value, { shouldValidate: true, shouldDirty: true });
      } catch (e) {
        console.warn(`Failed to set ${field}:`, e);
      }
    });
    
    // Trigger validation
    setTimeout(() => form.trigger(), 100);
    return true;
  } catch (error) {
    console.error(`Error filling data for ${section}:`, error);
    return false;
  }
};

// Function to add global autofill helpers
export const addFormAutofillHelpers = (form: any) => {
  try {
    (window as any).autoFill = {
      roomDetails: () => fillFormSection(form, 'room_details'),
      pgDetails: () => fillFormSection(form, 'pg_details'),
      location: () => fillFormSection(form, 'location'),
      basic: () => fillFormSection(form, 'basic'),
      rental: () => fillFormSection(form, 'rental'),
      sale: () => fillFormSection(form, 'sale'),
      all: () => {
        Object.keys(TEST_DATA).forEach(section => {
          fillFormSection(form, section as keyof typeof TEST_DATA);
        });
      },
      getForm: () => form,
      getValues: () => form?.getValues()
    };
    
    console.log('Form autofill helpers added to window.autoFill');
  } catch (error) {
    console.error('Error setting up autofill helpers:', error);
  }
};