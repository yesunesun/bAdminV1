// src/components/property/wizard/hooks/usePropertyForm.ts
// Version: 1.0.0
// Last Modified: 2025-02-01T12:30:00+05:30 (IST)

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FormData } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TEST_DATA } from '../test-data';

interface UsePropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
  mode?: 'create' | 'edit';
}

export function usePropertyForm({ initialData, propertyId: existingPropertyId, mode = 'create' }: UsePropertyFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);

  const form = useForm<FormData>({
    defaultValues: initialData || {
      propertyType: '',
      bhkType: '',
      floor: '',
      totalFloors: '',
      propertyAge: '',
      facing: '',
      builtUpArea: '',
      zone: '',
      locality: '',
      landmark: '',
      address: '',
      pinCode: '',
      rentalType: 'rent',
      rentAmount: '',
      securityDeposit: '',
      rentNegotiable: false,
      maintenance: '',
      availableFrom: '',
      preferredTenants: [],
      furnishing: '',
      parking: '',
      description: '',
      amenities: [],
      bathrooms: '',
      balconies: '',
      hasGym: false,
      nonVegAllowed: false,
      gatedSecurity: false,
      propertyShowOption: '',
      propertyCondition: '',
      secondaryNumber: '',
      hasSimilarUnits: false,
      direction: ''
    }
  });

  const handleAutoFill = () => {
    setError('');
    Object.entries(TEST_DATA).forEach(([key, value]) => {
      form.setValue(key as keyof FormData, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });
    form.trigger();
  };

  const handleNextStep = () => {
    if (currentStep === 1 && (!form.getValues('propertyType') || !form.getValues('bhkType'))) {
      setError('Please fill in all required fields');
      return;
    }
    if (currentStep === 2 && !form.getValues('locality')) {
      setError('Please select a locality');
      return;
    }
    if (currentStep === 3 && !form.getValues('rentAmount')) {
      setError('Please enter rent amount');
      return;
    }
    
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveProperty = async () => {
    try {
      setSaving(true);
      setError('');

      const formData = form.getValues();
      const propertyData = {
        owner_id: user!.id,
        title: formData.title || `${formData.bhkType} ${formData.propertyType} in ${formData.locality}`,
        description: formData.description || '',
        price: parseFloat(formData.rentAmount),
        bedrooms: parseInt(formData.bhkType.split(' ')[0]),
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        square_feet: formData.builtUpArea ? parseFloat(formData.builtUpArea) : null,
        address: formData.address || '',
        city: formData.locality,
        state: 'Telangana',
        zip_code: formData.pinCode || '',
        status: 'draft',
        property_details: formData
      };

      if (mode === 'edit' && existingPropertyId) {
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) throw updateError;
        setSavedPropertyId(existingPropertyId);
      } else {
        const { data: newProperty, error: createError } = await supabase
          .from('properties')
          .insert([propertyData])
          .select()
          .single();

        if (createError) throw createError;
        setSavedPropertyId(newProperty.id);
      }

      handleNextStep();
    } catch (err) {
      console.error('Error saving property:', err);
      setError('Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUploadComplete = () => {
    navigate('/properties');
  };

  return {
    form,
    currentStep,
    error,
    saving,
    savedPropertyId,
    user,
    handleAutoFill,
    handleNextStep,
    handlePreviousStep,
    handleSaveProperty,
    handleImageUploadComplete,
    setCurrentStep
  };
}