// src/modules/owner/components/property/wizard/PropertyForm/hooks/useDebugTools.ts
// Version: 1.0.0
// Last Modified: 07-03-2025 16:30 IST
// Purpose: Hook for form debugging functionality

import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';

/**
 * Custom hook for debugging form data and values
 */
export function useDebugTools(form: UseFormReturn<FormData>, formIsSaleMode?: boolean) {
  /**
   * Function to output detailed form state to console
   */
  const debugFormData = () => {
    console.log('=========== DEBUG: CURRENT FORM STATE ===========');
    
    if (!form || typeof form.getValues !== 'function') {
      console.error('Form is not properly initialized for debugging');
      return;
    }
    
    const values = form.getValues();
    console.log('Current form values:', values);
    
    const isFormSale = 
      values.listingType?.toLowerCase() === 'sale' || 
      values.listingType?.toLowerCase() === 'sell' ||
      values.isSaleProperty === true ||
      values.propertyPriceType === 'sale' ||
      formIsSaleMode === true;
    
    console.log('Form is for sale property:', isFormSale);
    
    if (isFormSale) {
      console.log('Sale-specific form values:', {
        expectedPrice: values.expectedPrice,
        maintenanceCost: values.maintenanceCost,
        kitchenType: values.kitchenType,
        priceNegotiable: values.priceNegotiable,
        isSaleProperty: values.isSaleProperty,
        propertyPriceType: values.propertyPriceType
      });
    } else {
      console.log('Rental-specific form values:', {
        rentalType: values.rentalType,
        rentAmount: values.rentAmount,
        securityDeposit: values.securityDeposit,
        rentNegotiable: values.rentNegotiable
      });
    }
    
    console.log('=========== DEBUG: CURRENT FORM STATE END ===========');
  };

  /**
   * Function to debug flat/plot number
   */
  const debugFlatPlotNo = () => {
    const formValues = form.getValues();
    console.log('=========== DEBUG: FLAT/PLOT NUMBER ===========');
    console.log('Flat/Plot No value:', formValues.flatPlotNo);
    console.log('Form values related to address:', {
      address: formValues.address,
      flatPlotNo: formValues.flatPlotNo,
      locality: formValues.locality,
      pinCode: formValues.pinCode
    });
    console.log('=========== DEBUG: FLAT/PLOT NUMBER END ===========');
  };

  /**
   * Function to force reload form values
   */
  const reloadFormValues = () => {
    const formValues = form.getValues();
    console.log('=========== DEBUG: RELOADING FORM VALUES ===========');
    console.log('Current form values:', formValues);
    
    // Force form to rerender by setting key fields
    if (formIsSaleMode) {
      console.log('Reloading sale property fields');
      form.setValue('expectedPrice', formValues.expectedPrice || '', { shouldDirty: true });
      form.setValue('maintenanceCost', formValues.maintenanceCost || '', { shouldDirty: true });
      form.setValue('kitchenType', formValues.kitchenType || '', { shouldDirty: true });
    } else {
      console.log('Reloading rental property fields');
      form.setValue('rentAmount', formValues.rentAmount || '', { shouldDirty: true });
      form.setValue('securityDeposit', formValues.securityDeposit || '', { shouldDirty: true });
    }
    
    console.log('=========== DEBUG: RELOADING FORM VALUES END ===========');
  };

  /**
   * Handle debug button click - runs main debug function
   */
  const handleDebugClick = () => {
    debugFormData();
  };

  return {
    debugFormData,
    debugFlatPlotNo,
    reloadFormValues,
    handleDebugClick
  };
}