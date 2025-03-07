// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 1.1.0
// Last Modified: 09-03-2025 10:25 IST
// Purpose: Added debug logs for save operations to track sale fields persistence

import { useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../types';
import { supabase } from '@/lib/supabase';
import { TEST_DATA } from '../test-data';

interface UsePropertyFormOperationsProps {
  form: UseFormReturn<FormData>;
  user: any;
  mode?: 'create' | 'edit';
  existingPropertyId?: string;
  adType?: string;
  isSaleMode: boolean;
  status: 'draft' | 'published';
  setStatus: (status: 'draft' | 'published') => void;
  setSavedPropertyId: (id: string | null) => void;
  setSaving: (saving: boolean) => void;
  setError: (error: string) => void;
  handleNextStep: () => void;
}

export function usePropertyFormOperations({
  form,
  user,
  mode = 'create',
  existingPropertyId,
  adType,
  isSaleMode,
  status,
  setStatus,
  setSavedPropertyId,
  setSaving,
  setError,
  handleNextStep
}: UsePropertyFormOperationsProps) {
  // Handle form auto-fill (development only)
  const handleAutoFill = useCallback(() => {
    try {
      setError('');
      if (!form || typeof form.setValue !== 'function') {
        console.error('Form is not properly initialized for auto-fill');
        return;
      }
      
      Object.entries(TEST_DATA).forEach(([key, value]) => {
        if (value !== undefined) {
          try {
            form.setValue(key as keyof FormData, value, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true
            });
          } catch (err) {
            console.error(`Error setting form value for ${key} during auto-fill:`, err);
          }
        }
      });
      
      if (typeof form.trigger === 'function') {
        form.trigger();
      }
    } catch (err) {
      console.error('Error in handleAutoFill:', err);
    }
  }, [form, setError]);

  // Handle form submissions
  const handleSaveAsDraft = async () => {
    try {
      console.log('=========== DEBUG: SAVE OPERATION START ===========');
      console.log('Raw form data before save:', form.getValues());
      console.log('Specific sale fields:', {
        expectedPrice: form.getValues('expectedPrice'),
        maintenanceCost: form.getValues('maintenanceCost'),
        kitchenType: form.getValues('kitchenType'),
        priceNegotiable: form.getValues('priceNegotiable')
      });
      
      setSaving(true);
      setError('');

      if (!form || typeof form.getValues !== 'function') {
        throw new Error('Form is not properly initialized for saving');
      }
      
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const formData = form.getValues();
      console.log('Saving as draft with form data:', formData);
      
      // Determine if this is a sale or rental property - more robust check
      const isSaleType = 
        formData.listingType?.toLowerCase() === 'sale' || 
        formData.listingType?.toLowerCase() === 'sell' ||
        adType?.toLowerCase() === 'sale';
      
      console.log('Is sale type?', isSaleType);
      console.log('Sale-specific fields before save:', {
        expectedPrice: formData.expectedPrice,
        maintenanceCost: formData.maintenanceCost,
        kitchenType: formData.kitchenType,
        priceNegotiable: formData.priceNegotiable
      });
      
      // Make sure all required fields exist in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || '',
        // Explicitly mark the property as sale or rental
        isSaleProperty: isSaleType,
        propertyPriceType: isSaleType ? 'sale' : 'rental',
        // Ensure sale or rental specific fields exist as needed
        expectedPrice: isSaleType ? (formData.expectedPrice || '') : '',
        maintenanceCost: isSaleType ? (formData.maintenanceCost || '') : '',
        kitchenType: isSaleType ? (formData.kitchenType || '') : '',
        priceNegotiable: isSaleType ? (formData.priceNegotiable || false) : false,
        rentAmount: !isSaleType ? (formData.rentAmount || '') : '',
        securityDeposit: !isSaleType ? (formData.securityDeposit || '') : '',
        rentNegotiable: !isSaleType ? (formData.rentNegotiable || false) : false
      };
      
      // Determine price based on property type
      const price = isSaleType 
        ? parseFloat(safeFormData.expectedPrice) || 0 
        : parseFloat(safeFormData.rentAmount) || 0;
      
      console.log('Using price value:', price, 'from', isSaleType ? 'expectedPrice' : 'rentAmount');
      console.log('Sale property data being saved:', {
        expectedPrice: safeFormData.expectedPrice,
        maintenanceCost: safeFormData.maintenanceCost,
        kitchenType: safeFormData.kitchenType,
        isSaleProperty: safeFormData.isSaleProperty,
        propertyPriceType: safeFormData.propertyPriceType,
        priceUsedInDB: price
      });
      
      const propertyData = {
        owner_id: user.id,
        title: safeFormData.title || `${safeFormData.bhkType} ${safeFormData.propertyType} in ${safeFormData.locality}`,
        description: safeFormData.description || '',
        price: price,
        bedrooms: safeFormData.bhkType ? parseInt(safeFormData.bhkType.split(' ')[0]) : 0,
        bathrooms: safeFormData.bathrooms ? parseInt(safeFormData.bathrooms) : 0,
        square_feet: safeFormData.builtUpArea ? parseFloat(safeFormData.builtUpArea) : null,
        address: safeFormData.address || '',
        city: safeFormData.locality,
        state: 'Telangana',
        zip_code: safeFormData.pinCode || '',
        status: 'draft',
        property_details: safeFormData
      };

      console.log('Saving property data:', propertyData);
      console.log('Property details payload:', JSON.stringify(propertyData.property_details, null, 2));

      let savedPropertyId = existingPropertyId;

      if (mode === 'edit' && existingPropertyId) {
        console.log('Updating existing property:', existingPropertyId);
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) throw updateError;
      } else {
        console.log('Creating new property');
        const { data: newProperty, error: createError } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();

        if (createError) throw createError;
        savedPropertyId = newProperty.id;
        setSavedPropertyId(newProperty.id);
      }

      // Verify the saved data
      console.log('Success - retrieving saved property to verify data:');
      const { data: savedProperty, error: fetchError } = await supabase
        .from('properties')
        .select('property_details, price')
        .eq('id', savedPropertyId)
        .single();

      if (fetchError) {
        console.error('Error fetching saved property:', fetchError);
      } else {
        console.log('Saved property details:', {
          price: savedProperty.price,
          expectedPrice: savedProperty.property_details.expectedPrice,
          maintenanceCost: savedProperty.property_details.maintenanceCost,
          kitchenType: savedProperty.property_details.kitchenType,
          isSaleProperty: savedProperty.property_details.isSaleProperty,
          propertyPriceType: savedProperty.property_details.propertyPriceType
        });
      }

      setStatus('draft');
      console.log('Save operation completed successfully');
      console.log('=========== DEBUG: SAVE OPERATION END ===========');
      handleNextStep();
    } catch (err) {
      console.error('Error saving property:', err);
      setError('Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPublish = async () => {
    try {
      console.log('=========== DEBUG: PUBLISH OPERATION START ===========');
      console.log('Raw form data before publishing:', form.getValues());
      console.log('Specific sale fields:', {
        expectedPrice: form.getValues('expectedPrice'),
        maintenanceCost: form.getValues('maintenanceCost'),
        kitchenType: form.getValues('kitchenType'),
        priceNegotiable: form.getValues('priceNegotiable')
      });
      
      setSaving(true);
      setError('');

      if (!form || typeof form.getValues !== 'function') {
        throw new Error('Form is not properly initialized for publishing');
      }
      
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const formData = form.getValues();
      console.log('Publishing with form data:', formData);
      
      // Determine if this is a sale or rental property - more robust check
      const isSaleType = 
        formData.listingType?.toLowerCase() === 'sale' || 
        formData.listingType?.toLowerCase() === 'sell' ||
        adType?.toLowerCase() === 'sale';
      
      console.log('Is sale type?', isSaleType);
      console.log('Sale-specific fields before save:', {
        expectedPrice: formData.expectedPrice,
        maintenanceCost: formData.maintenanceCost,
        kitchenType: formData.kitchenType,
        priceNegotiable: formData.priceNegotiable
      });
      
      // Make sure all required fields exist in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || '',
        // Explicitly mark the property as sale or rental
        isSaleProperty: isSaleType,
        propertyPriceType: isSaleType ? 'sale' : 'rental',
        // Ensure sale or rental specific fields exist as needed
        expectedPrice: isSaleType ? (formData.expectedPrice || '') : '',
        maintenanceCost: isSaleType ? (formData.maintenanceCost || '') : '',
        kitchenType: isSaleType ? (formData.kitchenType || '') : '',
        priceNegotiable: isSaleType ? (formData.priceNegotiable || false) : false,
        rentAmount: !isSaleType ? (formData.rentAmount || '') : '',
        securityDeposit: !isSaleType ? (formData.securityDeposit || '') : '',
        rentNegotiable: !isSaleType ? (formData.rentNegotiable || false) : false
      };
      
      // Determine price based on property type
      const price = isSaleType 
        ? parseFloat(safeFormData.expectedPrice) || 0 
        : parseFloat(safeFormData.rentAmount) || 0;
      
      console.log('Using price value:', price, 'from', isSaleType ? 'expectedPrice' : 'rentAmount');
      console.log('Sale property data being saved:', {
        expectedPrice: safeFormData.expectedPrice,
        maintenanceCost: safeFormData.maintenanceCost,
        kitchenType: safeFormData.kitchenType,
        isSaleProperty: safeFormData.isSaleProperty,
        propertyPriceType: safeFormData.propertyPriceType,
        priceUsedInDB: price
      });
      
      const propertyData = {
        owner_id: user.id,
        title: safeFormData.title || `${safeFormData.bhkType} ${safeFormData.propertyType} in ${safeFormData.locality}`,
        description: safeFormData.description || '',
        price: price,
        bedrooms: safeFormData.bhkType ? parseInt(safeFormData.bhkType.split(' ')[0]) : 0,
        bathrooms: safeFormData.bathrooms ? parseInt(safeFormData.bathrooms) : 0,
        square_feet: safeFormData.builtUpArea ? parseFloat(safeFormData.builtUpArea) : null,
        address: safeFormData.address || '',
        city: safeFormData.locality,
        state: 'Telangana',
        zip_code: safeFormData.pinCode || '',
        status: 'published',
        property_details: safeFormData
      };

      console.log('Publishing property data:', propertyData);
      console.log('Property details payload:', JSON.stringify(propertyData.property_details, null, 2));

      let savedPropertyId = existingPropertyId;

      if (mode === 'edit' && existingPropertyId) {
        console.log('Updating and publishing existing property:', existingPropertyId);
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) throw updateError;
      } else {
        console.log('Creating new published property');
        const { data: newProperty, error: createError } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();

        if (createError) throw createError;
        savedPropertyId = newProperty.id;
        setSavedPropertyId(newProperty.id);
      }

      // Verify the saved data
      console.log('Success - retrieving saved property to verify data:');
      const { data: savedProperty, error: fetchError } = await supabase
        .from('properties')
        .select('property_details, price')
        .eq('id', savedPropertyId)
        .single();

      if (fetchError) {
        console.error('Error fetching saved property:', fetchError);
      } else {
        console.log('Saved property details:', {
          price: savedProperty.price,
          expectedPrice: savedProperty.property_details.expectedPrice,
          maintenanceCost: savedProperty.property_details.maintenanceCost,
          kitchenType: savedProperty.property_details.kitchenType,
          isSaleProperty: savedProperty.property_details.isSaleProperty,
          propertyPriceType: savedProperty.property_details.propertyPriceType
        });
      }

      setStatus('published');
      console.log('Publish operation completed successfully');
      console.log('=========== DEBUG: PUBLISH OPERATION END ===========');
      handleNextStep();
    } catch (err) {
      console.error('Error publishing property:', err);
      setError('Failed to publish property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    try {
      console.log('=========== DEBUG: UPDATE OPERATION START ===========');
      console.log('Raw form data before update:', form.getValues());
      console.log('Specific sale fields:', {
        expectedPrice: form.getValues('expectedPrice'),
        maintenanceCost: form.getValues('maintenanceCost'),
        kitchenType: form.getValues('kitchenType'),
        priceNegotiable: form.getValues('priceNegotiable')
      });
      
      setSaving(true);
      setError('');

      if (!form || typeof form.getValues !== 'function') {
        throw new Error('Form is not properly initialized for updating');
      }
      
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const formData = form.getValues();
      console.log('Updating with form data:', formData);
      
      // Determine if this is a sale or rental property - more robust check
      const isSaleType = 
        formData.listingType?.toLowerCase() === 'sale' || 
        formData.listingType?.toLowerCase() === 'sell' ||
        adType?.toLowerCase() === 'sale';
      
      console.log('Is sale type?', isSaleType);
      console.log('Sale-specific fields before update:', {
        expectedPrice: formData.expectedPrice,
        maintenanceCost: formData.maintenanceCost,
        kitchenType: formData.kitchenType,
        priceNegotiable: formData.priceNegotiable
      });
      
      // Make sure all required fields exist in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || '',
        // Explicitly mark the property as sale or rental
        isSaleProperty: isSaleType,
        propertyPriceType: isSaleType ? 'sale' : 'rental',
        // Ensure sale or rental specific fields exist as needed
        expectedPrice: isSaleType ? (formData.expectedPrice || '') : '',
        maintenanceCost: isSaleType ? (formData.maintenanceCost || '') : '',
        kitchenType: isSaleType ? (formData.kitchenType || '') : '',
        priceNegotiable: isSaleType ? (formData.priceNegotiable || false) : false,
        rentAmount: !isSaleType ? (formData.rentAmount || '') : '',
        securityDeposit: !isSaleType ? (formData.securityDeposit || '') : '',
        rentNegotiable: !isSaleType ? (formData.rentNegotiable || false) : false
      };
      
      // Determine price based on property type
      const price = isSaleType 
        ? parseFloat(safeFormData.expectedPrice) || 0 
        : parseFloat(safeFormData.rentAmount) || 0;
      
      console.log('Using price value:', price, 'from', isSaleType ? 'expectedPrice' : 'rentAmount');
      console.log('Sale property data being saved:', {
        expectedPrice: safeFormData.expectedPrice,
        maintenanceCost: safeFormData.maintenanceCost,
        kitchenType: safeFormData.kitchenType,
        isSaleProperty: safeFormData.isSaleProperty,
        propertyPriceType: safeFormData.propertyPriceType,
        priceUsedInDB: price
      });
      
      const updateData: any = {
        title: safeFormData.title || `${safeFormData.bhkType} ${safeFormData.propertyType} in ${safeFormData.locality}`,
        description: safeFormData.description || '',
        price: price,
        bedrooms: safeFormData.bhkType ? parseInt(safeFormData.bhkType.split(' ')[0]) : 0,
        bathrooms: safeFormData.bathrooms ? parseInt(safeFormData.bathrooms) : 0,
        square_feet: safeFormData.builtUpArea ? parseFloat(safeFormData.builtUpArea) : null,
        address: safeFormData.address || '',
        city: safeFormData.locality,
        state: 'Telangana',
        zip_code: safeFormData.pinCode || '',
        property_details: safeFormData,
      };

      console.log('Update data:', updateData);
      console.log('Property details payload:', JSON.stringify(updateData.property_details, null, 2));

      // Only update status if provided
      if (status) {
        updateData.status = status;
        updateData.tags = status === 'published' ? ['public'] : [];
      }

      if (!existingPropertyId) {
        throw new Error('Property ID not found');
      }

      console.log('Updating property with ID:', existingPropertyId);
      const { error: updateError } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', existingPropertyId);

      if (updateError) throw updateError;
      
      // Verify the saved data
      console.log('Success - retrieving updated property to verify data:');
      const { data: updatedProperty, error: fetchError } = await supabase
        .from('properties')
        .select('property_details, price')
        .eq('id', existingPropertyId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated property:', fetchError);
      } else {
        console.log('Updated property details:', {
          price: updatedProperty.price,
          expectedPrice: updatedProperty.property_details.expectedPrice,
          maintenanceCost: updatedProperty.property_details.maintenanceCost,
          kitchenType: updatedProperty.property_details.kitchenType,
          isSaleProperty: updatedProperty.property_details.isSaleProperty,
          propertyPriceType: updatedProperty.property_details.propertyPriceType
        });
      }
      
      console.log('Update operation completed successfully');
      console.log('=========== DEBUG: UPDATE OPERATION END ===========');
      handleNextStep();
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return {
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleAutoFill
  };
}