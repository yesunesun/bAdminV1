// src/modules/owner/components/property/wizard/hooks/usePropertyFormState.ts
// Version: 1.4.0
// Last Modified: 07-03-2025 14:30 IST
// Purpose: Fixed loading of sale fields from initialData

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { FormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';

interface UsePropertyFormStateProps {
  initialData?: FormData;
  propertyCategory?: string;
  adType?: string;
  city?: string;
  existingPropertyId?: string;
  initialStatus?: 'draft' | 'published';
  mode?: 'create' | 'edit';
}

export function usePropertyFormState({
  initialData,
  propertyCategory,
  adType,
  city,
  existingPropertyId,
  initialStatus = 'draft',
  mode = 'create'
}: UsePropertyFormStateProps) {
  const { category, type } = useParams();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);

  // Enhanced logic to determine if we're in sale mode
  const isSaleMode = 
    adType?.toLowerCase() === 'sale' || 
    type?.toLowerCase() === 'sale' || 
    initialData?.listingType?.toLowerCase() === 'sale' ||
    initialData?.listingType?.toLowerCase() === 'sell' ||
    initialData?.isSaleProperty === true ||
    initialData?.propertyPriceType === 'sale';

  // Log before preparation to see what we're working with
  useEffect(() => {
    if (initialData) {
      console.log('=========== DEBUG: PRE-FORM INITIALIZATION ===========');
      console.log('Initial data received:', {
        hasExpectedPrice: !!initialData.expectedPrice,
        hasMaintenanceCost: !!initialData.maintenanceCost,
        hasKitchenType: !!initialData.kitchenType,
        detectedAsSale: isSaleMode,
        listingType: initialData.listingType
      });
      
      // Directly check all possible locations for sale data
      if (initialData.property_details) {
        console.log('Property details from initialData:', {
          expectedPrice: initialData.property_details.expectedPrice,
          maintenanceCost: initialData.property_details.maintenanceCost,
          kitchenType: initialData.property_details.kitchenType
        });
      }
      console.log('=========== DEBUG: PRE-FORM INITIALIZATION END ===========');
    }
  }, [initialData, isSaleMode]);

  // Prepare default values OUTSIDE of React's rendering phase
  // This avoids the "Should have a queue" error which can happen
  // when we modify state during render
  const prepareDefaultValues = () => {
    if (initialData) {
      console.log('Preparing default values for edit mode');
      
      // For existing data (edit mode), extract values carefully with detailed logging
      let expectedPrice = '';
      let maintenanceCost = '';
      let kitchenType = '';
      let priceNegotiable = false;
      
      // First check direct properties on initialData
      if (initialData.expectedPrice) {
        expectedPrice = initialData.expectedPrice;
        console.log('Found expectedPrice directly:', expectedPrice);
      } 
      
      if (initialData.maintenanceCost) {
        maintenanceCost = initialData.maintenanceCost;
        console.log('Found maintenanceCost directly:', maintenanceCost);
      }
      
      if (initialData.kitchenType) {
        kitchenType = initialData.kitchenType;
        console.log('Found kitchenType directly:', kitchenType);
      }
      
      if (initialData.priceNegotiable !== undefined) {
        priceNegotiable = initialData.priceNegotiable;
        console.log('Found priceNegotiable directly:', priceNegotiable);
      }
      
      // Then check property_details if those weren't found
      if (!expectedPrice && initialData.property_details?.expectedPrice) {
        expectedPrice = initialData.property_details.expectedPrice;
        console.log('Found expectedPrice in property_details:', expectedPrice);
      }
      
      if (!maintenanceCost && initialData.property_details?.maintenanceCost) {
        maintenanceCost = initialData.property_details.maintenanceCost;
        console.log('Found maintenanceCost in property_details:', maintenanceCost);
      }
      
      if (!kitchenType && initialData.property_details?.kitchenType) {
        kitchenType = initialData.property_details.kitchenType;
        console.log('Found kitchenType in property_details:', kitchenType);
      }
      
      if (priceNegotiable === false && initialData.property_details?.priceNegotiable !== undefined) {
        priceNegotiable = initialData.property_details.priceNegotiable;
        console.log('Found priceNegotiable in property_details:', priceNegotiable);
      }
      
      // Use price as fallback for expectedPrice only for sale properties
      if (!expectedPrice && initialData.price && isSaleMode) {
        expectedPrice = initialData.price.toString();
        console.log('Using price as fallback for expectedPrice:', expectedPrice);
      }
      
      console.log('Final sale field values:', {
        expectedPrice,
        maintenanceCost,
        kitchenType,
        priceNegotiable
      });
      
      return {
        ...initialData,
        propertyType: initialData.propertyType || propertyCategory || category || '',
        listingType: initialData.listingType || adType || type || '',
        // Ensure flat/plot number is present
        flatPlotNo: initialData.flatPlotNo || initialData.property_details?.flatPlotNo || '',
        
        // CRITICAL: Set sale-specific fields explicitly
        expectedPrice,
        maintenanceCost,
        kitchenType,
        priceNegotiable,
        
        // Set property type flags
        isSaleProperty: isSaleMode,
        propertyPriceType: isSaleMode ? 'sale' : 'rental'
      };
    } else {
      console.log('Preparing default values for create mode');
      // For new properties, set up with basic values
      return {
        propertyType: propertyCategory || category || '',
        listingType: adType || type || '',
        title: '',
        bhkType: '',
        floor: '',
        totalFloors: '',
        flatPlotNo: '',
        
        // Initialize sale fields to empty strings, not undefined
        expectedPrice: '',
        maintenanceCost: '',
        kitchenType: '',
        priceNegotiable: false,
        
        // Set property type flags
        isSaleProperty: isSaleMode,
        propertyPriceType: isSaleMode ? 'sale' : 'rental'
      };
    }
  };

  // Initialize form with properly prepared values
  const form = useForm<FormData>({
    defaultValues: prepareDefaultValues()
  });

  // Log data for debugging after form is initialized
  useEffect(() => {
    if (!form) return;
    
    console.log('=========== DEBUG: FORM INITIALIZATION ===========');
    console.log('Form default values:', form.getValues());
    
    if (initialData) {
      console.log('Initial data provided:', initialData);
      console.log('Is sale mode:', isSaleMode);
      
      // Check sale fields
      const formValues = form.getValues();
      console.log('Sale fields in form after initialization:', {
        expectedPrice: formValues.expectedPrice,
        maintenanceCost: formValues.maintenanceCost,
        kitchenType: formValues.kitchenType,
        priceNegotiable: formValues.priceNegotiable
      });
      
      // Ensure isSaleProperty and propertyPriceType flags are set
      if (isSaleMode) {
        if (formValues.isSaleProperty !== true) {
          console.log('Setting isSaleProperty to true');
          form.setValue('isSaleProperty', true, { shouldValidate: false });
        }
        
        if (formValues.propertyPriceType !== 'sale') {
          console.log('Setting propertyPriceType to sale');
          form.setValue('propertyPriceType', 'sale', { shouldValidate: false });
        }
      }
    }
    console.log('=========== DEBUG: FORM INITIALIZATION END ===========');
  }, [form, initialData, isSaleMode]);

  // Return the state and state updaters
  return {
    form,
    error,
    setError,
    saving,
    setSaving,
    savedPropertyId,
    setSavedPropertyId,
    status,
    setStatus,
    isSaleMode,
    user
  };
}