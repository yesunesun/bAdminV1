// src/components/property/wizard/hooks/usePropertyForm.ts
// Version: 1.4.2
// Last Modified: 19-02-2025 10:00 IST

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
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
  const { category, type, step } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Initialize form first
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

  // Initialize currentStep from URL or localStorage
  const [currentStep, setCurrentStep] = useState(() => {
    const savedStep = localStorage.getItem(`propertyWizard_${user?.id}_step`);
    if (step) {
      const stepIndex = STEPS.findIndex(s => s.id === step) + 1;
      return stepIndex > 0 ? stepIndex : 1;
    }
    if (savedStep) {
      return parseInt(savedStep);
    }
    return 1;
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);

  // Load form data from localStorage
  useEffect(() => {
    if (user?.id && !initialData) {
      const savedData = localStorage.getItem(`propertyWizard_${user.id}_data`);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          Object.entries(parsedData).forEach(([key, value]) => {
            form.setValue(key as keyof FormData, value);
          });
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
  }, [user?.id, initialData, form]);

  // Update URL when step changes
  const updateUrl = useCallback((newStep: number) => {
    if (!category || !type) return;

    const stepData = STEPS[newStep - 1];
    if (!stepData) return;

    const newPath = `/properties/list/${category}/${type}/${stepData.id}`;
    navigate(newPath, { replace: true });
  }, [category, type, navigate]);

  // Enhanced setCurrentStep with URL and localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    setCurrentStep(step);
    if (user?.id) {
      localStorage.setItem(`propertyWizard_${user.id}_step`, step.toString());
    }
    updateUrl(step);
  }, [user?.id, updateUrl]);

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

  // Save form data to localStorage
  const saveFormToStorage = useCallback((data: Partial<FormData>) => {
    if (user?.id) {
      localStorage.setItem(`propertyWizard_${user.id}_data`, JSON.stringify(data));
    }
  }, [user?.id]);

  // Handle form auto-fill (development only)
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

  // Modified handle functions
  const handleNextStep = useCallback(() => {
    if (!validateCurrentStep()) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    const formData = form.getValues();
    saveFormToStorage(formData);
    setCurrentStepWithPersistence(Math.min(currentStep + 1, STEPS.length));
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence]);

  const handlePreviousStep = useCallback(() => {
    const formData = form.getValues();
    saveFormToStorage(formData);
    setCurrentStepWithPersistence(Math.max(currentStep - 1, 1));
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence]);

  // Clear storage when form is completed
  const clearStorage = useCallback(() => {
    if (user?.id) {
      localStorage.removeItem(`propertyWizard_${user.id}_step`);
      localStorage.removeItem(`propertyWizard_${user.id}_data`);
    }
  }, [user?.id]);

  // Handle form submissions
  const handleSaveAsDraft = async () => {
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
        status: 'published',
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
        status,
        property_details: formData
      };

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

  const handleImageUploadComplete = useCallback(() => {
    clearStorage();
    navigate('/properties');
  }, [clearStorage, navigate]);

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
    setCurrentStep: setCurrentStepWithPersistence,
    setError
  };
}