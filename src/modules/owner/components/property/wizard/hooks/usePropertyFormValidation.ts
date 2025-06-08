// src/modules/owner/components/property/wizard/hooks/usePropertyFormValidation.ts
// Version: 3.0.0
// Last Modified: 13-04-2025 18:30 IST
// Purpose: Enhanced validation logic to support all property types and flows

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';

export function usePropertyFormValidation(form: UseFormReturn<FormData>) {
  // Determine property type from URL
  const getPropertyTypeFromUrl = () => {
    const urlPath = window.location.pathname.toLowerCase();
    if (urlPath.includes('flatmate')) {
      return 'flatmates';
    } else if (urlPath.includes('pghostel')) {
      return 'pghostel';
    } else if (urlPath.includes('commercial') && (urlPath.includes('sale') || urlPath.includes('sell'))) {
      return 'commercial_sale';
    } else if (urlPath.includes('commercial') && (urlPath.includes('rent') || urlPath.includes('lease'))) {
      return 'commercial_rent';
    } else if (urlPath.includes('coworking') || urlPath.includes('co-working')) {
      return 'coworking';
    } else if (urlPath.includes('land') || urlPath.includes('plot')) {
      return 'land_sale';
    } else if (urlPath.includes('sale') || urlPath.includes('sell')) {
      return 'sale';
    } else {
      return 'rent';
    }
  };

  // Get current step from URL
  const getCurrentStepFromUrl = () => {
    const urlPathSegments = window.location.pathname.split('/');
    const lastSegment = urlPathSegments[urlPathSegments.length - 1];
    
    // Map step IDs to step numbers
    const stepMap = {
      'details': 1,
      'room_details': 1,
      'land_details': 1,
      'location': 2,
      'flatmate_details': 3,
      'pg_details': 3,
      'rental': 3,
      'sale': 3,
      'commercial_sale': 3,
      'coworking': 3,
      'land_features': 3,
      'features': 4,
      'review': 5,
      'photos': 6
    };
    
    return stepMap[lastSegment] || 1;
  };

  const validateCurrentStep = (specificStep?: number) => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        return false;
      }
      
      const propertyType = getPropertyTypeFromUrl();
      const currentStep = specificStep || getCurrentStepFromUrl();
      console.log(`Validating step ${currentStep} for property type: ${propertyType}`);
      
      // Step 1: Property Details validation
      if (currentStep === 1) {
        // Common for all property types 
        if (propertyType === 'pghostel') {
          // PG/Hostel room details validation
          const roomType = form.getValues('roomType');
          const roomCapacity = form.getValues('roomCapacity');
          const totalRooms = form.getValues('totalRooms');
          const bathroomType = form.getValues('bathroomType');
          
          if (!roomType || !roomCapacity || !totalRooms || !bathroomType) {
            console.log('PG/Hostel validation failed:', { roomType, roomCapacity, totalRooms, bathroomType });
            return false;
          }
        } else if (propertyType === 'land_sale') {
          // Land details validation
          const landArea = form.getValues('builtUpArea');
          const landAreaUnit = form.getValues('builtUpAreaUnit');
          
          if (!landArea || !landAreaUnit) {
            console.log('Land validation failed:', { landArea, landAreaUnit });
            return false;
          }
        } else {
          // Standard property details validation
          const propertyTypeValue = form.getValues('propertyType');
          const bhkType = form.getValues('bhkType');
          
          if (!propertyTypeValue || !bhkType) {
            console.log('Property details validation failed:', { propertyTypeValue, bhkType });
            return false;
          }
        }
        
        return true;
      }
      
      // Step 2: Location validation
      if (currentStep === 2) {
        const address = form.getValues('address');
        const pinCode = form.getValues('pinCode');
        
        // Location is required for all property types
        if (!address || !pinCode || pinCode.length !== 6) {
          console.log('Location validation failed:', { address, pinCode });
          return false;
        }
        
        return true;
      }
      
      // Step 3: Property type specific validations
      if (currentStep === 3) {
        if (propertyType === 'flatmates') {
          // Flatmate details validation
          const preferredGender = form.getValues('preferredGender');
          const rentAmount = form.getValues('rentAmount');
          
          if (!preferredGender || !rentAmount) {
            console.log('Flatmate details validation failed:', { preferredGender, rentAmount });
            return false;
          }
        } else if (propertyType === 'pghostel') {
          // PG details validation
          const monthlyRent = form.getValues('monthlyRent');
          const securityDeposit = form.getValues('securityDeposit');
          const mealOption = form.getValues('mealOption');
          
          if (!monthlyRent || !securityDeposit || !mealOption) {
            console.log('PG details validation failed:', { monthlyRent, securityDeposit, mealOption });
            return false;
          }
        } else if (propertyType === 'sale' || propertyType === 'commercial_sale') {
          // Sale details validation
          const expectedPrice = form.getValues('expectedPrice');
          const maintenanceCost = form.getValues('maintenanceCost');
          
          if (!expectedPrice || !maintenanceCost) {
            console.log('Sale details validation failed:', { expectedPrice, maintenanceCost });
            return false;
          }
        } else if (propertyType === 'land_sale') {
          // Land features validation
          const expectedPrice = form.getValues('expectedPrice');
          
          if (!expectedPrice) {
            console.log('Land features validation failed:', { expectedPrice });
            return false;
          }
        } else {
          // Rental details validation
          const rentAmount = form.getValues('rentAmount');
          const securityDeposit = form.getValues('securityDeposit');
          
          if (!rentAmount || !securityDeposit) {
            console.log('Rental details validation failed:', { rentAmount, securityDeposit });
            return false;
          }
        }
        
        return true;
      }
      
      // Step 4: Features & Amenities validation
      if (currentStep === 4) {
        const amenities = form.getValues('amenities');
        
        if (!amenities || amenities.length === 0) {
          console.log('Amenities validation failed:', { amenities });
          return false;
        }
        
        return true;
      }
      
      // For other steps, return true by default
      return true;
    } catch (err) {
      console.error('Validation error:', err);
      return false;
    }
  };

  return {
    validateCurrentStep
  };
}