// src/modules/owner/components/property/wizard/hooks/usePropertyForm.ts
// Version: 1.7.0
// Last Modified: 28-02-2025 15:30 IST
// Purpose: Custom hook for property form state management with enhanced error handling

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

  // Debug logs for development
  useEffect(() => {
    console.log('usePropertyForm params:', {
      propertyCategory,
      adType,
      city,
      'URL params': { category, type, step },
      mode,
      initialStatus,
      existingPropertyId
    });
    
    if (initialData) {
      console.log('usePropertyForm initialData snippet:', {
        propertyType: initialData.propertyType,
        listingType: initialData.listingType,
        bhkType: initialData.bhkType,
        locality: initialData.locality,
        rentAmount: initialData.rentAmount
      });
    }
  }, [propertyCategory, adType, city, category, type, step, mode, initialStatus, existingPropertyId, initialData]);

  // Initialize form with property type and category
  const form = useForm<FormData>({
    defaultValues: initialData || {
      // Set property category and listing type from params
      propertyType: propertyCategory || category || '',
      listingType: adType || type || '',
      
      // Standard form fields with empty values
      title: '',
      bhkType: '',
      floor: '',
      totalFloors: '',
      propertyAge: '',
      facing: '',
      builtUpArea: '',
      zone: '',
      locality: city || '',
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
    // If we're in edit mode, prioritize loading from local storage
    if (mode === 'edit') {
      const savedStep = localStorage.getItem(`propertyWizard_${user?.id}_${existingPropertyId}_step`);
      if (savedStep) {
        return parseInt(savedStep);
      }
    }
    
    // Otherwise, check URL step parameter
    if (step) {
      const stepIndex = STEPS.findIndex(s => s.id === step) + 1;
      return stepIndex > 0 ? stepIndex : 1;
    }
    
    // Fall back to general saved step
    const savedStep = localStorage.getItem(`propertyWizard_${user?.id}_step`);
    if (savedStep) {
      return parseInt(savedStep);
    }
    
    return 1;
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);

  // Log form values for debugging
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('Form values updated');
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Set property type and category values when they change
  useEffect(() => {
    if (propertyCategory || category) {
      form.setValue('propertyType', propertyCategory || category || '');
    }
    
    if (adType || type) {
      form.setValue('listingType', adType || type || '');
    }
    
    if (city) {
      form.setValue('locality', city);
    }
  }, [propertyCategory, adType, city, category, type, form]);

  // Load form data from localStorage if in edit mode and no initialData provided
  useEffect(() => {
    if (user?.id && !initialData && mode === 'edit' && existingPropertyId) {
      const savedData = localStorage.getItem(`propertyWizard_${user.id}_${existingPropertyId}_data`);
      if (savedData) {
        try {
          console.log('Loading saved form data from localStorage for edit mode');
          const parsedData = JSON.parse(savedData);
          Object.entries(parsedData).forEach(([key, value]) => {
            form.setValue(key as keyof FormData, value);
          });
        } catch (error) {
          console.error('Error parsing saved form data:', error);
        }
      }
    }
    
    // Clear stored form data if in create mode to avoid pre-populated data
    if (mode === 'create' && user?.id) {
      localStorage.removeItem(`propertyWizard_${user.id}_data`);
    }
  }, [user?.id, initialData, form, mode, existingPropertyId]);

  // Update URL when step changes
  const updateUrl = useCallback((newStep: number) => {
    const effectiveCategory = propertyCategory || category || form.getValues('propertyType');
    const effectiveType = adType || type || form.getValues('listingType');
    
    if (!effectiveCategory || !effectiveType) {
      console.error('Cannot update URL: missing category or type');
      return;
    }

    const stepData = STEPS[newStep - 1];
    if (!stepData) return;

    const newPath = `/properties/list/${effectiveCategory.toLowerCase()}/${effectiveType.toLowerCase()}/${stepData.id}`;
    console.log('Updating URL to:', newPath);
    navigate(newPath, { replace: true });
  }, [propertyCategory, category, adType, type, navigate, form]);

  // Enhanced setCurrentStep with URL and localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    console.log('Setting current step to:', step);
    setCurrentStep(step);
    
    if (user?.id) {
      // In edit mode, store step with property ID
      if (mode === 'edit' && existingPropertyId) {
        localStorage.setItem(`propertyWizard_${user.id}_${existingPropertyId}_step`, step.toString());
      } else {
        localStorage.setItem(`propertyWizard_${user.id}_step`, step.toString());
      }
    }
    
    // Only update URL in create mode
    if (mode === 'create') {
      updateUrl(step);
    }
  }, [user?.id, updateUrl, mode, existingPropertyId]);

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
      console.log('Saving form data to localStorage');
      
      // In edit mode, store with property ID
      if (mode === 'edit' && existingPropertyId) {
        localStorage.setItem(`propertyWizard_${user.id}_${existingPropertyId}_data`, JSON.stringify(data));
      } else {
        localStorage.setItem(`propertyWizard_${user.id}_data`, JSON.stringify(data));
      }
    }
  }, [user?.id, mode, existingPropertyId]);

  // Handle form auto-fill (development only) - now only triggered by explicit button click
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
      console.log('Clearing form data from localStorage');
      if (mode === 'edit' && existingPropertyId) {
        localStorage.removeItem(`propertyWizard_${user.id}_${existingPropertyId}_step`);
        localStorage.removeItem(`propertyWizard_${user.id}_${existingPropertyId}_data`);
      } else {
        localStorage.removeItem(`propertyWizard_${user.id}_step`);
        localStorage.removeItem(`propertyWizard_${user.id}_data`);
      }
    }
  }, [user?.id, mode, existingPropertyId]);

  // Handle form submissions
  const handleSaveAsDraft = async () => {
    try {
      setSaving(true);
      setError('');

      const formData = form.getValues();
      console.log('Saving as draft with form data:', formData);
      
      const propertyData = {
        owner_id: user!.id,
        title: formData.title || `${formData.bhkType} ${formData.propertyType} in ${formData.locality}`,
        description: formData.description || '',
        price: parseFloat(formData.rentAmount) || 0,
        bedrooms: formData.bhkType ? parseInt(formData.bhkType.split(' ')[0]) : 0,
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
        console.log('Updating existing property:', existingPropertyId);
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) throw updateError;
        setSavedPropertyId(existingPropertyId);
      } else {
        console.log('Creating new property');
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
      console.log('Publishing with form data:', formData);
      
      const propertyData = {
        owner_id: user!.id,
        title: formData.title || `${formData.bhkType} ${formData.propertyType} in ${formData.locality}`,
        description: formData.description || '',
        price: parseFloat(formData.rentAmount) || 0,
        bedrooms: formData.bhkType ? parseInt(formData.bhkType.split(' ')[0]) : 0,
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
        console.log('Updating and publishing existing property:', existingPropertyId);
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) throw updateError;
        setSavedPropertyId(existingPropertyId);
      } else {
        console.log('Creating new published property');
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
      console.log('Updating with form data:', formData);
      
      const propertyData = {
        owner_id: user!.id,
        title: formData.title || `${formData.bhkType} ${formData.propertyType} in ${formData.locality}`,
        description: formData.description || '',
        price: parseFloat(formData.rentAmount) || 0,
        bedrooms: formData.bhkType ? parseInt(formData.bhkType.split(' ')[0]) : 0,
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

      console.log('Updating property with ID:', existingPropertyId);
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