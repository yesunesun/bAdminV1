// src/modules/owner/components/property/wizard/utilities/formAutofill.ts
// Version: 5.2.0
// Last Modified: 16-04-2025 15:45 IST
// Purpose: Removed initial autofill tools popup alert

import { TEST_DATA } from '../test-data';
import { detectDataVersion, DATA_VERSION_V1, DATA_VERSION_V2 } from '../utils/propertyDataAdapter';

// Helper function to fill form with test data for a specific section
export const fillFormSection = (form: any, section: keyof typeof TEST_DATA) => {
  if (!form || typeof form.setValue !== 'function') {
    console.error('Invalid form object');
    alert(`⚠️ Autofill Error: Invalid form object`);
    return false;
  }
  
  const sectionData = TEST_DATA[section];
  if (!sectionData) {
    console.error(`No test data found for section: ${section}`);
    alert(`⚠️ Autofill Error: No test data found for section: ${section}`);
    return false;
  }
  
  // Log to console instead of showing alert
  console.log(`🔄 Filling data for "${section}" section`);
  
  try {
    // Detect which data structure the form is currently using
    const formData = form.getValues();
    const dataVersion = detectDataVersion(formData);
    console.log(`Detected data version: ${dataVersion}`);
    
    // Special handling for basic details section
    if (section === 'basic') {
      console.log('Auto-filling basic details section...');
      
      // Common field values
      const basicValues = {
        propertyType: 'Apartment',
        bhkType: '2 BHK',
        floor: '3',
        totalFloors: '10',
        propertyAge: '1 - 3 years',
        facing: 'East',
        builtUpArea: '1200',
        builtUpAreaUnit: 'sqft',
        possessionDate: '2025-06-01',
        title: 'Modern 2BHK Apartment in Indiranagar'
      };
      
      // Set values in the UI-facing flat structure (for immediate form display)
      Object.entries(basicValues).forEach(([field, value]) => {
        console.log(`Setting flat field ${field} = ${value}`);
        form.setValue(field, value, { shouldValidate: true });
      });
      
      // If using v2 structure, also set nested structure
      if (dataVersion === DATA_VERSION_V2) {
        console.log('Setting v2 nested structure for basicDetails');
        form.setValue('basicDetails', {
          title: basicValues.title,
          propertyType: basicValues.propertyType,
          bhkType: basicValues.bhkType,
          floor: parseInt(basicValues.floor),
          totalFloors: parseInt(basicValues.totalFloors),
          builtUpArea: parseInt(basicValues.builtUpArea),
          builtUpAreaUnit: basicValues.builtUpAreaUnit,
          bathrooms: 2,
          balconies: 1,
          facing: basicValues.facing,
          propertyAge: basicValues.propertyAge
        }, { shouldValidate: false });
        
        // Set the flow information for v2 structure if not already set
        const flow = form.getValues('flow');
        if (!flow) {
          form.setValue('flow', {
            category: 'residential',
            listingType: 'rent'
          }, { shouldValidate: false });
        }
      }
      
      console.log('Basic details set successfully');
      
      // Trigger validation after a short delay to ensure all fields are processed
      setTimeout(() => {
        form.trigger();
        console.log('Form validation triggered');
        
        // Log the form values after update to verify
        console.log('Form values after basic details update:', form.getValues());
        
        // Force a UI refresh by setting the values again
        Object.entries(basicValues).forEach(([field, value]) => {
          form.setValue(field, value, { shouldValidate: true });
        });
        
        // Show success alert
        alert(`✅ Autofill Complete: Basic details have been populated`);
      }, 100);
      
      return true;
    }
    
    // Special handling for rental details section
    if (section === 'rental') {
      console.log('Auto-filling rental details section...');
      
      // Common rental values
      const rentalValues = {
        rentalType: 'rent',
        rentAmount: '25000',
        securityDeposit: '50000',
        rentNegotiable: true,
        maintenance: '2000',
        availableFrom: '2025-05-15',
        furnishing: 'Semi-Furnished',
        parking: 'Car & Bike',
        preferredTenants: ['Family', 'Working Professionals'],
        nonVegAllowed: true,
        petsAllowed: false,
        hasLockInPeriod: true,
        lockInPeriod: '11'
      };
      
      // Set values in the UI-facing flat structure
      Object.entries(rentalValues).forEach(([field, value]) => {
        console.log(`Setting flat rental field ${field} = ${value}`);
        form.setValue(field, value, { shouldValidate: true });
      });
      
      // If using v2 structure, also set nested structure
      if (dataVersion === DATA_VERSION_V2) {
        console.log('Setting v2 nested structure for rental');
        form.setValue('rental', {
          rentAmount: parseInt(rentalValues.rentAmount),
          securityDeposit: parseInt(rentalValues.securityDeposit),
          maintenanceCharges: parseInt(rentalValues.maintenance),
          rentNegotiable: rentalValues.rentNegotiable,
          availableFrom: rentalValues.availableFrom,
          preferredTenants: rentalValues.preferredTenants,
          leaseDuration: "11 months",
          furnishingStatus: rentalValues.furnishing
        }, { shouldValidate: false });
      }
      
      console.log('Rental details set successfully');
      
      // Trigger validation
      setTimeout(() => {
        form.trigger();
        
        // Force a UI refresh by setting the values again
        Object.entries(rentalValues).forEach(([field, value]) => {
          form.setValue(field, value, { shouldValidate: true });
        });
        
        // Show success alert
        alert(`✅ Autofill Complete: Rental details have been populated`);
      }, 100);
      
      return true;
    }
    
    // For other sections, use the default approach
    console.log('Using default approach for section:', section);
    Object.entries(sectionData).forEach(([field, value]) => {
      try {
        console.log(`Setting ${field} = `, value);
        form.setValue(field, value, { shouldValidate: true });
        
        // If using v2 structure, check if this field should be in a nested object
        if (dataVersion === DATA_VERSION_V2) {
          // Map fields to their nested locations
          const nestedMap: Record<string, string> = {
            // Location fields
            'address': 'location.address',
            'flatPlotNo': 'location.flatPlotNo',
            'landmark': 'location.landmark',
            'locality': 'location.locality',
            'city': 'location.city',
            'state': 'location.state',
            'pinCode': 'location.pinCode',
            'latitude': 'location.coordinates.latitude',
            'longitude': 'location.coordinates.longitude',
            
            // Features fields
            'amenities': 'features.amenities',
            'parking': 'features.parking',
            'nonVegAllowed': 'features.nonVegAllowed',
            'gatedSecurity': 'features.gatedSecurity',
            'description': 'features.description',
            'propertyShowOption': 'features.propertyShowOption',
            'propertyCondition': 'features.propertyCondition',
            'hasGym': 'features.hasGym',
            'secondaryNumber': 'features.secondaryNumber',
            'hasSimilarUnits': 'features.hasSimilarUnits',
            'direction': 'features.direction'
          };
          
          // If this field has a nested path, set it there too
          if (field in nestedMap) {
            const nestedPath = nestedMap[field];
            console.log(`Also setting nested path ${nestedPath} = `, value);
            const [section, prop, subprop] = nestedPath.split('.');
            
            if (subprop) {
              // Path like location.coordinates.latitude
              const parentObj = form.getValues(section) || {};
              const subObj = parentObj[prop] || {};
              subObj[subprop] = value;
              parentObj[prop] = subObj;
              form.setValue(section, parentObj, { shouldValidate: false });
            } else {
              // Path like location.address
              const parentObj = form.getValues(section) || {};
              parentObj[prop] = value;
              form.setValue(section, parentObj, { shouldValidate: false });
            }
          }
        }
      } catch (e) {
        console.warn(`Failed to set ${field}:`, e);
      }
    });
    
    // Trigger validation and show success alert
    setTimeout(() => {
      form.trigger();
      alert(`✅ Autofill Complete: ${section} data has been populated`);
    }, 100);
    
    return true;
  } catch (error) {
    console.error(`Error filling data for ${section}:`, error);
    alert(`❌ Autofill Error: ${error.message || "Unknown error"}`);
    return false;
  }
};

// Function to add global autofill helpers
export const addFormAutofillHelpers = (form: any) => {
  try {
    (window as any).autoFill = {
      // Section-specific autofill functions
      roomDetails: () => fillFormSection(form, 'room_details'),
      pgDetails: () => fillFormSection(form, 'pg_details'),
      location: () => fillFormSection(form, 'location'),
      basic: () => fillFormSection(form, 'basic'),
      rental: () => fillFormSection(form, 'rental'),
      sale: () => fillFormSection(form, 'sale'),
      all: () => {
        // Log to console instead of showing alert
        console.log(`🚀 Starting Complete Autofill: This will populate all sections`);
        
        // First fill basic
        fillFormSection(form, 'basic');
        
        // Then other sections after a delay
        setTimeout(() => {
          Object.keys(TEST_DATA).forEach(section => {
            if (section !== 'basic') {
              fillFormSection(form, section as keyof typeof TEST_DATA);
            }
          });
        }, 200);
      },
      
      // Debugging helpers
      getForm: () => form,
      getValues: () => form?.getValues(),
      basicValues: () => {
        const values = form?.getValues();
        return {
          propertyType: values.propertyType,
          bhkType: values.bhkType,
          floor: values.floor,
          totalFloors: values.totalFloors,
          propertyAge: values.propertyAge,
          facing: values.facing,
          builtUpArea: values.builtUpArea,
          builtUpAreaUnit: values.builtUpAreaUnit,
          possessionDate: values.possessionDate,
          title: values.title,
          basicDetails: values.basicDetails,
          flow: values.flow
        };
      },
      forceRefresh: () => {
        // Log to console instead of showing alert
        console.log(`🔄 Force Refreshing Form Fields`);
        
        // Force refresh values by setting them again
        const values = form?.getValues();
        form.setValue('propertyType', values.propertyType, { shouldValidate: true });
        form.setValue('bhkType', values.bhkType, { shouldValidate: true });
        form.setValue('floor', values.floor, { shouldValidate: true });
        form.setValue('totalFloors', values.totalFloors, { shouldValidate: true });
        form.setValue('propertyAge', values.propertyAge, { shouldValidate: true });
        form.setValue('facing', values.facing, { shouldValidate: true });
        form.setValue('builtUpArea', values.builtUpArea, { shouldValidate: true });
        form.setValue('builtUpAreaUnit', values.builtUpAreaUnit, { shouldValidate: true });
        form.setValue('possessionDate', values.possessionDate, { shouldValidate: true });
        form.setValue('title', values.title, { shouldValidate: true });
        form.trigger();
      },
      detectVersion: () => {
        const formData = form.getValues();
        const version = detectDataVersion(formData);
        console.log(`📊 Form Data Version: ${version}`);
        return version;
      }
    };
    
    console.log('Form autofill helpers added to window.autoFill (without initial popup)');
    // Removed the alert that was showing when the page loads
  } catch (error) {
    console.error('Error setting up autofill helpers:', error);
    // Keep this alert as it's for actual errors
    alert(`❌ Error setting up autofill helpers: ${error.message || "Unknown error"}`);
  }
};