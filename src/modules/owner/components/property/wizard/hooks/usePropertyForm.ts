// src/modules/owner/components/property/wizard/hooks/usePropertyForm.ts
// Version: 2.1.0
// Last Modified: 06-03-2025 22:45 IST
// Purpose: Fixed issues with undefined values and added flatPlotNo field handling

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
        propertyType: initialData.propertyType || '',
        listingType: initialData.listingType || '',
        bhkType: initialData.bhkType || '',
        locality: initialData.locality || '',
        flatPlotNo: initialData.flatPlotNo || '', // Log the flat/plot number field with fallback
        rentAmount: initialData.rentAmount || ''
      });
    }
  }, [propertyCategory, adType, city, category, type, step, mode, initialStatus, existingPropertyId, initialData]);

  // Ensure initialData has all required fields with defaults if missing
  const safeInitialData = initialData ? {
    ...initialData,
    // Ensure all required fields have defaults if missing
    propertyType: initialData.propertyType || propertyCategory || category || '',
    listingType: initialData.listingType || adType || type || '',
    title: initialData.title || '',
    bhkType: initialData.bhkType || '',
    floor: initialData.floor || '',
    totalFloors: initialData.totalFloors || '',
    propertyAge: initialData.propertyAge || '',
    facing: initialData.facing || '',
    builtUpArea: initialData.builtUpArea || '',
    builtUpAreaUnit: initialData.builtUpAreaUnit || 'sqft',
    possessionDate: initialData.possessionDate || '',
    zone: initialData.zone || '',
    locality: initialData.locality || city || '',
    landmark: initialData.landmark || '',
    address: initialData.address || '',
    flatPlotNo: initialData.flatPlotNo || '', // Ensure flatPlotNo has default value
    pinCode: initialData.pinCode || '',
    rentalType: initialData.rentalType || 'rent',
    rentAmount: initialData.rentAmount || '',
    securityDeposit: initialData.securityDeposit || '',
    rentNegotiable: initialData.rentNegotiable || false,
    maintenance: initialData.maintenance || '',
    availableFrom: initialData.availableFrom || '',
    preferredTenants: initialData.preferredTenants || [],
    furnishing: initialData.furnishing || '',
    parking: initialData.parking || '',
    description: initialData.description || '',
    amenities: initialData.amenities || [],
    bathrooms: initialData.bathrooms || '',
    balconies: initialData.balconies || '',
    hasGym: initialData.hasGym || false,
    nonVegAllowed: initialData.nonVegAllowed || false,
    gatedSecurity: initialData.gatedSecurity || false,
    propertyShowOption: initialData.propertyShowOption || '',
    propertyCondition: initialData.propertyCondition || '',
    secondaryNumber: initialData.secondaryNumber || '',
    hasSimilarUnits: initialData.hasSimilarUnits || false,
    direction: initialData.direction || ''
  } : undefined;

  // Initialize form with property type and category
  const form = useForm<FormData>({
    defaultValues: safeInitialData || {
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
      builtUpAreaUnit: 'sqft',
      possessionDate: '',
      zone: '',
      locality: city || '',
      landmark: '',
      address: '',
      flatPlotNo: '', // Add default value for flat/plot number
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

  // Define currentStep state before using it in any functions
  const [currentStep, setCurrentStep] = useState<number>(() => {
    // If step is in URL, prioritize that regardless of mode
    if (step) {
      const stepIndex = STEPS.findIndex(s => s.id === step) + 1;
      // Ensure a valid step index, defaulting to 1 (details) if not found or invalid
      return stepIndex > 0 ? stepIndex : 1;
    }
    
    // For newly created listings after property type selection, always start at step 1
    if (mode === 'create' && !existingPropertyId) {
      return 1; // Always start with Basic Details (step 1)
    }
    
    // If we're in edit mode, try loading from local storage
    if (mode === 'edit' && user?.id && existingPropertyId) {
      const savedStep = localStorage.getItem(`propertyWizard_${user.id}_${existingPropertyId}_step`);
      if (savedStep) {
        return parseInt(savedStep);
      }
    }
    
    // Fall back to general saved step
    if (user?.id) {
      const savedStep = localStorage.getItem(`propertyWizard_${user.id}_step`);
      if (savedStep) {
        return parseInt(savedStep);
      }
    }
    
    // Default to first step (Basic Details)
    return 1;
  });

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedPropertyId, setSavedPropertyId] = useState<string | null>(existingPropertyId || null);
  const [status, setStatus] = useState(initialStatus);

  // Log form values for debugging
  useEffect(() => {
    try {
      // Only set up the subscription if form is available
      const subscription = form.watch((value) => {
        try {
          // Safe logging to prevent errors
          console.log('Form values updated:', 
            value ? {
              propertyType: value.propertyType || '',
              listingType: value.listingType || '',
              flatPlotNo: value.flatPlotNo || '',
              // Add other important fields as needed
            } : 'No values'
          );
        } catch (err) {
          console.error('Error in form watch callback:', err);
        }
      });
      
      return () => {
        try {
          // Clean up subscription safely
          if (subscription && typeof subscription.unsubscribe === 'function') {
            subscription.unsubscribe();
          }
        } catch (err) {
          console.error('Error unsubscribing from form watch:', err);
        }
      };
    } catch (err) {
      console.error('Error setting up form watch:', err);
      // Continue without the watch subscription
      return () => {};
    }
  }, [form]);

  // Set property type and category values when they change
  useEffect(() => {
    try {
      if ((propertyCategory || category) && form && typeof form.setValue === 'function') {
        form.setValue('propertyType', propertyCategory || category || '');
      }
      
      if ((adType || type) && form && typeof form.setValue === 'function') {
        form.setValue('listingType', adType || type || '');
      }
      
      if (city && form && typeof form.setValue === 'function') {
        form.setValue('locality', city);
      }
    } catch (err) {
      console.error('Error setting initial property values:', err);
    }
  }, [propertyCategory, adType, city, category, type, form]);

  // Load form data from localStorage if in edit mode and no initialData provided
  useEffect(() => {
    if (user?.id && !initialData && mode === 'edit' && existingPropertyId) {
      try {
        const savedData = localStorage.getItem(`propertyWizard_${user.id}_${existingPropertyId}_data`);
        if (savedData) {
          try {
            console.log('Loading saved form data from localStorage for edit mode');
            const parsedData = JSON.parse(savedData);
            if (parsedData && typeof parsedData === 'object' && form && typeof form.setValue === 'function') {
              Object.entries(parsedData).forEach(([key, value]) => {
                if (value !== undefined) {
                  try {
                    form.setValue(key as keyof FormData, value);
                  } catch (err) {
                    console.error(`Error setting form value for ${key}:`, err);
                  }
                }
              });
            }
          } catch (error) {
            console.error('Error parsing saved form data:', error);
          }
        }
      } catch (err) {
        console.error('Error loading saved form data:', err);
      }
    }
    
    // Clear stored form data if in create mode to avoid pre-populated data
    if (mode === 'create' && user?.id) {
      try {
        localStorage.removeItem(`propertyWizard_${user.id}_data`);
      } catch (err) {
        console.error('Error clearing saved form data:', err);
      }
    }
  }, [user?.id, initialData, form, mode, existingPropertyId]);

  // Update URL when step changes
  const updateUrl = useCallback((newStep: number) => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for URL update');
        return;
      }
      
      const effectiveCategory = propertyCategory || category || form.getValues('propertyType');
      const effectiveType = adType || type || form.getValues('listingType');
      
      if (!effectiveCategory || !effectiveType) {
        console.error('Cannot update URL: missing category or type');
        return;
      }

      const stepData = STEPS[newStep - 1];
      if (!stepData) {
        console.error('Invalid step index for URL update:', newStep);
        return;
      }

      // Ensure 'details' is the first step after property type selection
      const stepId = newStep === 1 ? 'details' : stepData.id;
      const newPath = `/properties/list/${effectiveCategory.toLowerCase()}/${effectiveType.toLowerCase()}/${stepId}`;
      console.log('Updating URL to:', newPath);
      navigate(newPath, { replace: true });
    } catch (err) {
      console.error('Error updating URL:', err);
    }
  }, [propertyCategory, category, adType, type, navigate, form]);

  // Enhanced setCurrentStep with URL and localStorage updates
  const setCurrentStepWithPersistence = useCallback((step: number) => {
    try {
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
    } catch (err) {
      console.error('Error setting current step:', err);
    }
  }, [user?.id, updateUrl, mode, existingPropertyId]);

  const validateCurrentStep = () => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for validation');
        return false;
      }
      
      if (currentStep === 1) {
        return !!form.getValues('propertyType') && !!form.getValues('bhkType');
      }
      if (currentStep === 2) {
        return !!form.getValues('locality');
      }
      if (currentStep === 3) {
        return !!form.getValues('rentAmount');
      }
      return true;
    } catch (err) {
      console.error('Error validating current step:', err);
      return false;
    }
  };

  // Save form data to localStorage
  const saveFormToStorage = useCallback((data: Partial<FormData>) => {
    try {
      if (user?.id) {
        console.log('Saving form data to localStorage');
        
        // Make sure flatPlotNo exists in the data
        const safeData = {
          ...data,
          flatPlotNo: data.flatPlotNo || ''
        };
        
        // In edit mode, store with property ID
        if (mode === 'edit' && existingPropertyId) {
          localStorage.setItem(`propertyWizard_${user.id}_${existingPropertyId}_data`, JSON.stringify(safeData));
        } else {
          localStorage.setItem(`propertyWizard_${user.id}_data`, JSON.stringify(safeData));
        }
      }
    } catch (err) {
      console.error('Error saving form data to localStorage:', err);
    }
  }, [user?.id, mode, existingPropertyId]);

  // Handle form auto-fill (development only) - now only triggered by explicit button click
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
  }, [form]);

  // Modified handle functions
  const handleNextStep = useCallback(() => {
    try {
      if (!validateCurrentStep()) {
        setError('Please fill in all required fields');
        return;
      }
      
      setError('');
      
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for next step');
        return;
      }
      
      const formData = form.getValues();
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      setCurrentStepWithPersistence(Math.min(currentStep + 1, STEPS.length));
    } catch (err) {
      console.error('Error in handleNextStep:', err);
      setError('An error occurred while proceeding to the next step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence]);

  const handlePreviousStep = useCallback(() => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form is not properly initialized for previous step');
        return;
      }
      
      const formData = form.getValues();
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      saveFormToStorage(safeFormData);
      setCurrentStepWithPersistence(Math.max(currentStep - 1, 1));
    } catch (err) {
      console.error('Error in handlePreviousStep:', err);
      setError('An error occurred while going back to the previous step. Please try again.');
    }
  }, [currentStep, form, saveFormToStorage, setCurrentStepWithPersistence]);

  // Clear storage when form is completed
  const clearStorage = useCallback(() => {
    try {
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
    } catch (err) {
      console.error('Error clearing storage:', err);
    }
  }, [user?.id, mode, existingPropertyId]);

  // Handle form submissions
  const handleSaveAsDraft = async () => {
    try {
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
      console.log('flatPlotNo value:', formData.flatPlotNo || '');
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      const propertyData = {
        owner_id: user.id,
        title: safeFormData.title || `${safeFormData.bhkType} ${safeFormData.propertyType} in ${safeFormData.locality}`,
        description: safeFormData.description || '',
        price: parseFloat(safeFormData.rentAmount) || 0,
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

      if (!form || typeof form.getValues !== 'function') {
        throw new Error('Form is not properly initialized for publishing');
      }
      
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const formData = form.getValues();
      console.log('Publishing with form data:', formData);
      console.log('flatPlotNo value:', formData.flatPlotNo || '');
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      const propertyData = {
        owner_id: user.id,
        title: safeFormData.title || `${safeFormData.bhkType} ${safeFormData.propertyType} in ${safeFormData.locality}`,
        description: safeFormData.description || '',
        price: parseFloat(safeFormData.rentAmount) || 0,
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

      if (!form || typeof form.getValues !== 'function') {
        throw new Error('Form is not properly initialized for updating');
      }
      
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const formData = form.getValues();
      console.log('Updating with form data:', formData);
      console.log('flatPlotNo value:', formData.flatPlotNo || '');
      
      // Make sure flatPlotNo exists in the data
      const safeFormData = {
        ...formData,
        flatPlotNo: formData.flatPlotNo || ''
      };
      
      const propertyData = {
        owner_id: user.id,
        title: safeFormData.title || `${safeFormData.bhkType} ${safeFormData.propertyType} in ${safeFormData.locality}`,
        description: safeFormData.description || '',
        price: parseFloat(safeFormData.rentAmount) || 0,
        bedrooms: safeFormData.bhkType ? parseInt(safeFormData.bhkType.split(' ')[0]) : 0,
        bathrooms: safeFormData.bathrooms ? parseInt(safeFormData.bathrooms) : 0,
        square_feet: safeFormData.builtUpArea ? parseFloat(safeFormData.builtUpArea) : null,
        address: safeFormData.address || '',
        city: safeFormData.locality,
        state: 'Telangana',
        zip_code: safeFormData.pinCode || '',
        status,
        property_details: safeFormData
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
    try {
      clearStorage();
      navigate('/properties');
    } catch (err) {
      console.error('Error in handleImageUploadComplete:', err);
    }
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