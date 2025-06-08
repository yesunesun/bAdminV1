// src/modules/owner/components/property/wizard/utilities/formAutofill.ts
// Version: 2.0.0
// Last Modified: 05-05-2025 15:15 IST
// Purpose: Updated to use v3 data structure only and restored missing exports

import { FormData } from '../types';
import { DATA_VERSION_V3 } from '../utils/propertyDataAdapter';
import { UseFormReturn } from 'react-hook-form';

// Import test data for sample properties
import { 
  samplePropertyData,
  sampleSalePropertyData,
  testPGHostelProperty,
  testFlatmateProperty,
  testCommercialRental,
  testCommercialSale,
  testLandSale
} from '../test-data';

// Helper to get test data based on the property and listing type
export const getTestDataByType = (
  propertyType: string = 'residential', 
  listingType: string = 'rent'
): FormData => {
  const propertyTypeLower = propertyType.toLowerCase();
  const listingTypeLower = listingType.toLowerCase();
  
  if (propertyTypeLower === 'residential') {
    if (listingTypeLower === 'rent') {
      return samplePropertyData;
    } else if (listingTypeLower === 'sale') {
      return sampleSalePropertyData;
    } else if (listingTypeLower === 'pghostel') {
      return testPGHostelProperty;
    } else if (listingTypeLower === 'flatmates') {
      return testFlatmateProperty;
    }
  } else if (propertyTypeLower === 'commercial') {
    if (listingTypeLower === 'rent') {
      return testCommercialRental;
    } else if (listingTypeLower === 'sale') {
      return testCommercialSale;
    }
  } else if (propertyTypeLower === 'land') {
    return testLandSale;
  }
  
  // Default to residential rental
  return samplePropertyData;
};

// Auto-fill form data for a property
export const autoFillPropertyForm = (
  propertyType: string = 'residential', 
  listingType: string = 'rent'
): FormData => {
  const testData = getTestDataByType(propertyType, listingType);
  
  // Create a fresh copy to avoid modifying the original
  const formData = JSON.parse(JSON.stringify(testData));
  
  // Ensure metadata is set correctly
  formData.meta = {
    _version: DATA_VERSION_V3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'draft'
  };
  
  // Ensure flow is set correctly
  formData.flow = {
    category: propertyType.toLowerCase(),
    listingType: listingType.toLowerCase()
  };
  
  return formData;
};

// Map of step IDs to auto-fill functions
const autoFillFunctionsByStep: Record<string, (data: FormData) => Partial<FormData>> = {
  'details': (data: FormData) => ({
    details: {
      ...data.details,
      basicDetails: {
        title: "Auto-filled Property",
        propertyType: data.flow.category === 'residential' ? "Apartment" : 
                      data.flow.category === 'commercial' ? "Office Space" : "Plot",
        bhkType: data.flow.category === 'residential' ? "2BHK" : "",
        floor: 3,
        totalFloors: 5,
        builtUpArea: 1200,
        builtUpAreaUnit: "sqft",
        bathrooms: 2,
        balconies: 1,
        facing: "East",
        propertyAge: "5-10 years"
      }
    }
  }),
  
  'location': (data: FormData) => ({
    details: {
      ...data.details,
      location: {
        address: "123 Auto Street",
        flatPlotNo: "A-101",
        landmark: "Near Shopping Mall",
        locality: "Central Area",
        city: "Hyderabad",
        state: "Telangana",
        pinCode: "500001",
        coordinates: {
          latitude: 17.385044,
          longitude: 78.486671
        }
      }
    }
  }),
  
  'rental': (data: FormData) => ({
    details: {
      ...data.details,
      rentalInfo: {
        rentAmount: 25000,
        securityDeposit: 50000,
        maintenanceCharges: 2000,
        rentNegotiable: true,
        availableFrom: "2025-06-01",
        preferredTenants: ["Family", "Working Professionals"],
        leaseDuration: "11 months",
        furnishingStatus: "Semi-Furnished"
      }
    }
  }),
  
  'sale': (data: FormData) => ({
    details: {
      ...data.details,
      saleInfo: {
        expectedPrice: 7500000,
        priceNegotiable: true,
        possessionDate: "2025-07-01"
      }
    }
  }),
  
  'features': (data: FormData) => ({
    details: {
      ...data.details,
      features: {
        amenities: [
          "Lift",
          "Gym",
          "Swimming Pool",
          "Power Backup",
          "Security"
        ],
        parking: "Covered",
        petFriendly: true,
        nonVegAllowed: true,
        waterSupply: "24x7",
        powerBackup: "Full",
        gatedSecurity: true,
        description: "This is an auto-filled property description with all amenities and features."
      }
    }
  }),
  
  'images': (data: FormData) => ({
    details: {
      ...data.details,
      media: {
        photos: {
          images: [
            {
              id: "auto_img_1",
              url: "https://example.com/auto_image1.jpg",
              isPrimary: true,
              displayOrder: 1
            },
            {
              id: "auto_img_2",
              url: "https://example.com/auto_image2.jpg",
              isPrimary: false,
              displayOrder: 2
            }
          ]
        }
      }
    }
  }),
  
  'review': (data: FormData) => data // No changes for review step
};

// Function to auto-fill form data for a specific step
export const autoFillStep = (
  currentData: FormData,
  stepId: string
): Partial<FormData> => {
  // If step has a dedicated auto-fill function, use it
  if (autoFillFunctionsByStep[stepId]) {
    return autoFillFunctionsByStep[stepId](currentData);
  }
  
  // Default case: return current data unchanged
  return currentData;
};

/**
 * Fills a specific form section with test data
 * @param form The form instance
 * @param sectionName The name of the section to fill
 */
export const fillFormSection = (
  form: UseFormReturn<FormData>,
  sectionName: string
): void => {
  try {
    // Get current values
    const currentValues = form.getValues();
    
    // Determine property and listing type
    const propertyType = currentValues.flow?.category || 'residential';
    const listingType = currentValues.flow?.listingType || 'rent';
    
    // Generate test data
    const testData = getTestDataByType(propertyType, listingType);
    
    // Create a map of section names to their corresponding step IDs
    const sectionToStepMap: Record<string, string> = {
      'basicDetails': 'details',
      'location': 'location',
      'rental': 'rental',
      'sale': 'sale',
      'features': 'features',
      'media': 'images'
    };
    
    // Get the corresponding step ID
    const stepId = sectionToStepMap[sectionName] || sectionName;
    
    // Get the auto-fill data for this step
    const stepData = autoFillStep(testData, stepId);
    
    // Merge with current values and update the form
    form.reset({
      ...currentValues,
      ...stepData
    });
    
    console.log(`Form section '${sectionName}' filled successfully`);
  } catch (error) {
    console.error(`Error filling form section '${sectionName}':`, error);
  }
};

/**
 * Adds autofill helpers to the form
 * This function is used to add helpers for testing and development
 * @param form The form instance
 * @param isSaleMode Whether the form is in sale mode
 */
export const addFormAutofillHelpers = (
  form: UseFormReturn<FormData>,
  isSaleMode: boolean = false
) => {
  // Add the auto-fill function to the window object for debugging
  try {
    if (typeof window !== 'undefined') {
      (window as any).__autoFillPropertyForm = (stepId?: string) => {
        // Get current values
        const currentValues = form.getValues();
        const propertyType = currentValues.flow?.category || 'residential';
        const listingType = isSaleMode ? 'sale' : 'rent';
        
        // Create a new auto-filled form
        const autoFilledData = autoFillPropertyForm(propertyType, listingType);
        
        // If a specific step is provided, only fill that step
        if (stepId && autoFillFunctionsByStep[stepId]) {
          const stepData = autoFillFunctionsByStep[stepId](autoFilledData);
          form.reset({
            ...currentValues,
            ...stepData
          });
        } else {
          // Otherwise, fill the entire form
          form.reset(autoFilledData);
        }
        
        console.log('Form auto-filled successfully:', form.getValues());
      };
      
      // Log a message to notify that auto-fill is available
      console.log('Form auto-fill helper added. Use window.__autoFillPropertyForm() to fill the form.');
    }
  } catch (error) {
    console.error('Error adding form auto-fill helpers:', error);
  }
};