// src/components/property/wizard/hooks/usePropertyForm.ts
// Version: 1.4.1
// Last Modified: 07-02-2025 12:00 IST
// Updates: Fixed searchParams usage for section navigation

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FormData } from '../types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { TEST_DATA } from '../test-data';
import { STEPS } from '../constants';

interface UsePropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
  mode?: 'create' | 'edit';
  status?: 'draft' | 'published';
  propertyCategory?: string;
  adType?: string;
  city?: string;
}

export function usePropertyForm({ 
  initialData, 
  propertyId: existingPropertyId, 
  mode = 'create',
  status: initialStatus = 'draft',
  propertyCategory,
  adType,
  city
}: UsePropertyFormProps) {
  const [searchParams] = useSearchParams();
  const section = searchParams.get('section');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(() => {
    if (section === 'images') {
      return STEPS.length;
    }
    return 1;
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);

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

  useEffect(() => {
    const fetchPropertyStatus = async () => {
      if (mode === 'edit' && existingPropertyId) {
        try {
          const { data, error } = await supabase
            .from('properties')
            .select('status')
            .eq('id', existingPropertyId)
            .single();

          if (error) throw error;
          
          if (data && data.status) {
            setStatus(data.status);
          }
        } catch (err) {
          console.error('Error fetching property status:', err);
          setError('Failed to fetch property status.');
        }
      }
    };

    fetchPropertyStatus();
  }, [mode, existingPropertyId]);

  const preparePropertyData = (formData: FormData, propertyStatus: 'draft' | 'published') => {
    return {
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
      status: propertyStatus,
      property_details: formData
    };
  };

  const handleAutoFill = useCallback(() => {
    setError('');
    Object.entries(TEST_DATA).forEach(([key, value]) => {
      form.setValue(key as keyof FormData, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    });
    form.trigger();
  }, [form]);

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      return form.getValues('propertyType') && form.getValues('bhkType');
    }
    if (currentStep === 2) {
      return form.getValues('locality');
    }
    if (currentStep === 3) {
      return form.getValues('rentAmount');
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveAsDraft = async () => {
    try {
      setSaving(true);
      setError('');

      const formData = form.getValues();
      const propertyData = preparePropertyData(formData, 'draft');

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

      setStatus('draft');
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
      setSaving(true);
      setError('');

      const formData = form.getValues();
      const propertyData = preparePropertyData(formData, 'published');

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

      setStatus('published');
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
      setSaving(true);
      setError('');

      const formData = form.getValues();
      const propertyData = preparePropertyData(formData, status);

      if (!existingPropertyId) {
        throw new Error('Property ID not found');
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', existingPropertyId);

      if (updateError) throw updateError;
      handleNextStep();
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property. Please try again.');
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
    status,
    handleAutoFill,
    handleNextStep,
    handlePreviousStep,
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleImageUploadComplete,
    setCurrentStep,
    setError
  };
}