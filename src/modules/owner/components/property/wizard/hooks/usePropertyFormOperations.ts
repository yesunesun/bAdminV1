// src/modules/owner/components/property/wizard/hooks/usePropertyFormOperations.ts
// Version: 1.7.0
// Last Modified: 07-04-2025 20:15 IST
// Purpose: Robust property creation with timestamp marker

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

  // Save property and return the saved property ID
  const saveProperty = async (isPublished: boolean): Promise<string> => {
    try {
      console.log('=========== DEBUG: SAVE OPERATION START ===========');
      
      if (!form || typeof form.getValues !== 'function') {
        throw new Error('Form is not properly initialized for saving');
      }
      
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const formData = form.getValues();
      
      // Determine if this is a sale or rental property
      const isSaleType = 
        formData.listingType?.toLowerCase() === 'sale' || 
        formData.listingType?.toLowerCase() === 'sell' ||
        adType?.toLowerCase() === 'sale';
      
      // Make sure all required fields exist in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || '',
        isSaleProperty: isSaleType,
        propertyPriceType: isSaleType ? 'sale' : 'rental',
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
        status: isPublished ? 'published' : 'draft',
        property_details: safeFormData
      };

      console.log('Saving property data:', propertyData);

      // Use an explicit ID variable
      let propertyId: string;

      if (mode === 'edit' && existingPropertyId) {
        console.log('Updating existing property:', existingPropertyId);
        
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) {
          console.error('Database update error:', updateError);
          throw new Error(`Failed to update property: ${updateError.message}`);
        }
        
        propertyId = existingPropertyId;
      } else {
        console.log('Creating new property with timestamp marker');
        
        try {
          // Add a timestamp marker to help identify this specific property
          const timestamp = new Date().toISOString();
          const markerTitle = `${propertyData.title} (${timestamp})`;
          
          // Use the marker in the property data
          const propertyDataWithMarker = {
            ...propertyData,
            title: markerTitle,
            marker_timestamp: timestamp
          };
          
          console.log('Creating property with marker title:', markerTitle);
          
          // First, insert the property
          const { error: insertError } = await supabase
            .from('properties')
            .insert([propertyDataWithMarker]);
          
          if (insertError) {
            console.error('Database insert error:', insertError);
            throw new Error(`Failed to create property: ${insertError.message}`);
          }
          
          // Sleep briefly to ensure database consistency
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Query for the property with the exact title (which now includes timestamp)
          const { data: newProperty, error: queryError } = await supabase
            .from('properties')
            .select('id')
            .eq('title', markerTitle)
            .eq('owner_id', propertyData.owner_id)
            .single();
          
          if (queryError) {
            console.error('Error querying new property:', queryError);
            throw new Error(`Failed to retrieve property ID: ${queryError.message}`);
          }
          
          if (!newProperty || !newProperty.id) {
            // Fallback query if exact title match fails
            console.warn('Exact title match failed, trying broader query');
            
            const { data: fallbackProperties, error: fallbackError } = await supabase
              .from('properties')
              .select('id, title, created_at')
              .eq('owner_id', propertyData.owner_id)
              .order('created_at', { ascending: false })
              .limit(5);
            
            if (fallbackError) {
              console.error('Fallback query error:', fallbackError);
              throw new Error('All attempts to retrieve property ID failed');
            }
            
            if (!fallbackProperties || fallbackProperties.length === 0) {
              console.error('No properties found for this user');
              throw new Error('No properties found for this user');
            }
            
            // Log all found properties for debugging
            console.log('Found recent properties:', fallbackProperties);
            
            // Use the most recent property
            propertyId = fallbackProperties[0].id;
            console.log('Using most recent property ID as fallback:', propertyId);
          } else {
            propertyId = newProperty.id;
            console.log('Successfully retrieved new property with ID:', propertyId);
          }
        } catch (insertError) {
          console.error('Error during property creation process:', insertError);
          throw new Error(`Failed to process property: ${insertError.message}`);
        }
      }

      // Set state immediately
      setSavedPropertyId(propertyId);
      setStatus(isPublished ? 'published' : 'draft');
      
      console.log('Save operation completed with ID:', propertyId);
      console.log('=========== DEBUG: SAVE OPERATION END ===========');
      
      // Explicitly return the ID
      return propertyId;
    } catch (err) {
      console.error('Error saving property:', err);
      throw err;
    }
  };

  // Handle form submissions
  const handleSaveAsDraft = async () => {
    let savedId: string | null = null;
    
    try {
      setSaving(true);
      setError('');
      
      console.log('Starting handleSaveAsDraft...');
      savedId = await saveProperty(false);
      
      console.log('Property saved as draft with ID:', savedId);
      handleNextStep();
      return savedId;
    } catch (err) {
      console.error('Error in handleSaveAsDraft:', err);
      setError('Failed to save property as draft. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndPublish = async () => {
    let savedId: string | null = null;
    
    try {
      setSaving(true);
      setError('');
      
      console.log('Starting handleSaveAndPublish...');
      savedId = await saveProperty(true);
      
      // Do not call handleNextStep() here - let the caller control navigation
      console.log('Property saved successfully with ID:', savedId);
      return savedId;
    } catch (err) {
      console.error('Error in handleSaveAndPublish:', err);
      setError('Failed to publish property. Please try again.');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    let savedId: string | null = null;
    
    try {
      setSaving(true);
      setError('');
      
      console.log('Starting handleUpdate...');
      savedId = await saveProperty(status === 'published');
      
      console.log('Property updated successfully with ID:', savedId);
      handleNextStep();
      return savedId;
    } catch (err) {
      console.error('Error in handleUpdate:', err);
      setError('Failed to update property. Please try again.');
      throw err;
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