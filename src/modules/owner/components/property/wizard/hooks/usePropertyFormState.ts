// src/modules/owner/components/property/wizard/hooks/usePropertyFormState.ts
// Version: 2.0.0
// Last Modified: 07-03-2025 21:00 IST
// Purpose: Direct database query for sale property details

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { FormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
  const [isFormReady, setIsFormReady] = useState(false);

  // Enhanced logic to determine if we're in sale mode
  const isSaleMode = 
    adType?.toLowerCase() === 'sale' || 
    type?.toLowerCase() === 'sale' || 
    initialData?.listingType?.toLowerCase() === 'sale' ||
    initialData?.listingType?.toLowerCase() === 'sell' ||
    initialData?.isSaleProperty === true ||
    initialData?.propertyPriceType === 'sale';

  // Simple function to create basic form values
  const getBasicFormValues = () => {
    return {
      propertyType: initialData?.propertyType || propertyCategory || category || '',
      listingType: initialData?.listingType || adType || type || '',
      title: initialData?.title || '',
      bhkType: initialData?.bhkType || '',
      floor: initialData?.floor || '',
      totalFloors: initialData?.totalFloors || '',
      flatPlotNo: initialData?.flatPlotNo || initialData?.property_details?.flatPlotNo || '',
      
      // Sale/rental flags
      isSaleProperty: isSaleMode,
      propertyPriceType: isSaleMode ? 'sale' : 'rental',
      
      // Initialize sale fields 
      expectedPrice: '',
      maintenanceCost: '',
      kitchenType: '',
      priceNegotiable: false,
    };
  };

  // Initialize form with basic values first
  const form = useForm<FormData>({
    defaultValues: getBasicFormValues()
  });

  // Directly query the database for property details in edit mode
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      // Only run this for existing properties in edit mode
      if (!existingPropertyId || mode !== 'edit') {
        setIsFormReady(true);
        return;
      }

      try {
        console.log('Directly querying database for property:', existingPropertyId);
        
        // Query the entire property record
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', existingPropertyId)
          .single();
        
        if (error) {
          console.error('Error fetching property details:', error);
          setIsFormReady(true);
          return;
        }
        
        console.log('Direct database query result:', data);
        
        if (data) {
          // If we have data, copy all values to form
          let formData = { ...initialData };
          
          // Important: For sale properties, use price field as expectedPrice
          if (isSaleMode && data.price) {
            console.log('Setting expectedPrice from DB price:', data.price);
            formData.expectedPrice = data.price.toString();
            
            // Set default maintenance cost if none exists
            if (!formData.maintenanceCost) {
              const defaultMaintenance = Math.min(
                Math.round(parseFloat(formData.expectedPrice) * 0.005), 
                10000
              );
              formData.maintenanceCost = defaultMaintenance.toString();
              console.log('Set default maintenance cost:', formData.maintenanceCost);
            }
          }
          
          // If property_details exists, copy all fields from it
          if (data.property_details) {
            console.log('Found property_details in DB response:', data.property_details);
            if (data.property_details.expectedPrice) {
              formData.expectedPrice = data.property_details.expectedPrice;
            }
            
            if (data.property_details.maintenanceCost) {
              formData.maintenanceCost = data.property_details.maintenanceCost;
            }
            
            if (data.property_details.kitchenType) {
              formData.kitchenType = data.property_details.kitchenType;
            }
            
            if (data.property_details.priceNegotiable !== undefined) {
              formData.priceNegotiable = data.property_details.priceNegotiable;
            }
          }
          
          // Make sure sale property flags are set
          if (isSaleMode) {
            formData.isSaleProperty = true;
            formData.propertyPriceType = 'sale';
          }
          
          // Update all form fields
          console.log('Setting form values:', formData);
          Object.entries(formData).forEach(([key, value]) => {
            if (value !== undefined) {
              // @ts-ignore - key may not be a valid field name
              form.setValue(key, value);
            }
          });
        }
      } catch (err) {
        console.error('Error fetching property details:', err);
      } finally {
        setIsFormReady(true);
      }
    };

    fetchPropertyDetails();
  }, [existingPropertyId, mode, initialData, form, isSaleMode]);

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
    user,
    isFormReady
  };
}