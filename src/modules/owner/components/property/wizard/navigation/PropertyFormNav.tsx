// src/components/property/PropertyForm.tsx
// Version: 2.0.0
// Last Modified: 2025-01-30T19:45:00+05:30 (IST)
// Author: Bhoomitalli Team

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FormProgress } from '@/components/FormProgress';
import { PropertyDetails } from './PropertyDetails';
import { LocationDetails } from './LocationDetails';
import { RentalDetails } from './RentalDetails';
import { AmenitiesSection } from './AmenitiesSection';
import { ImageUploadSection } from '../sections/ImageUploadSection';
import { PropertySummary } from './PropertySummary';
import { FormData } from '../../types';
import { STEPS } from '../../constants';
import { supabase } from '@/lib/supabase';
import { Wand2 } from 'lucide-react';

// Test data for auto-fill in development mode
const TEST_DATA: FormData = {
  title: '',
  propertyType: 'Apartment',
  bhkType: '2 BHK',
  floor: '3',
  totalFloors: '6',
  propertyAge: '1-3 years',
  facing: 'East',
  builtUpArea: '1200',
  zone: 'West Zone',
  locality: 'HITEC City',
  landmark: 'Near Cyber Towers',
  address: '123, Silicon Valley Apartments, HITEC City Main Road',
  pinCode: '500081',
  rentalType: 'rent',
  rentAmount: '25000',
  securityDeposit: '100000',
  rentNegotiable: true,
  maintenance: 'Maintenance Included',
  availableFrom: '2024-03-01',
  preferredTenants: ['Family', 'Bachelor Female'],
  furnishing: 'Semi-furnished',
  parking: 'Both',
  description: 'Beautiful 2 BHK apartment in a prime location with modern amenities.',
  amenities: ['Power Backup', 'Lift', 'Security', 'Park', 'Gym']
};

interface PropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
  mode?: 'create' | 'edit';
}

export function PropertyForm({ initialData, propertyId: existingPropertyId, mode = 'create' }: PropertyFormProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const form = useForm<FormData>({
    defaultValues: initialData || {
      title: '',
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
    },
  });

  const handleAutoFill = () => {
    form.reset();
    Object.entries(TEST_DATA).forEach(([key, value]) => {
      form.setValue(key as keyof FormData, value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    });
    form.trigger();
  };

  const validateCurrentStep = (): boolean => {
    const values = form.getValues();
    let isValid = true;
    let errorMessage = '';

    switch (currentStep) {
      case 1:
        if (!values.propertyType || !values.bhkType) {
          errorMessage = 'Please fill in basic property details';
          isValid = false;
        }
        break;
      case 2:
        if (!values.zone || !values.locality || !values.address) {
          errorMessage = 'Please fill in location details';
          isValid = false;
        }
        break;
      case 3:
        if (!values.rentAmount || !values.securityDeposit || !values.availableFrom) {
          errorMessage = 'Please fill in rental details';
          isValid = false;
        }
        break;
      case 4:
        if (!values.furnishing || !values.parking) {
          errorMessage = 'Please fill in amenities details';
          isValid = false;
        }
        break;
    }

    if (!isValid) {
      setError(errorMessage);
    }
    return isValid;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setError('');
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleImageUploadComplete = () => {
    handleNextStep();
  };

  const handleSaveForLater = async () => {
    try {
      setSaving(true);
      setError('');

      const formData = form.getValues();
      const propertyData = {
        owner_id: user!.id,
        title: formData.title || `${formData.bhkType} ${formData.propertyType} in ${formData.locality}`,
        description: formData.description || '',
        price: parseFloat(formData.rentAmount) || 0,
        bedrooms: parseInt(formData.bhkType?.split(' ')[0]) || 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        square_feet: formData.builtUpArea ? parseFloat(formData.builtUpArea) : null,
        address: formData.address || '',
        city: formData.locality || '',
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
      } else {
        const { error: createError } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (createError) throw createError;
      }

      navigate('/properties');
    } catch (err) {
      console.error('Error saving property:', err);
      setError('Failed to save property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setSaving(true);
      setError('');

      const formData = form.getValues();
      const propertyData = {
        owner_id: user!.id,
        title: formData.title || `${formData.bhkType} ${formData.propertyType} in ${formData.locality}`,
        description: formData.description || '',
        price: parseFloat(formData.rentAmount) || 0,
        bedrooms: parseInt(formData.bhkType?.split(' ')[0]) || 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        square_feet: formData.builtUpArea ? parseFloat(formData.builtUpArea) : null,
        address: formData.address || '',
        city: formData.locality || '',
        state: 'Telangana',
        zip_code: formData.pinCode || '',
        status: 'published',
        tags: ['public'],
        property_details: formData
      };

      if (mode === 'edit' && existingPropertyId) {
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', existingPropertyId);

        if (updateError) throw updateError;
      } else {
        const { error: createError } = await supabase
          .from('properties')
          .insert([propertyData]);

        if (createError) throw createError;
      }

      navigate('/properties');
    } catch (err) {
      console.error('Error publishing property:', err);
      setError('Failed to publish property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderFormNavigation = () => {
    return (
      <div className="flex justify-between pt-6 border-t">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handlePreviousStep}
            className="px-6 py-3 text-sm font-medium text-slate-600 bg-slate-100 
              rounded-lg hover:bg-slate-200 transition-colors focus:outline-none 
              focus:ring-2 focus:ring-slate-200"
          >
            Previous
          </button>
        )}
        {currentStep === 1 && <div />}
        {currentStep < STEPS.length && (
          <button
            type="button"
            onClick={handleNextStep}
            className={cn(
              "px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg",
              "hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200",
              "disabled:opacity-50"
            )}
          >
            Next
          </button>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You must be logged in to create a property listing.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Header with Progress */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <FormProgress 
              currentStep={currentStep} 
              totalSteps={STEPS.length}
              className="flex-1 mr-4" 
            />
            {process.env.NODE_ENV === 'development' && (
              <button
                type="button"
                onClick={handleAutoFill}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 
                  rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none 
                  focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Wand2 className="h-3.5 w-3.5 mr-1.5" />
                Auto Fill
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {currentStep === STEPS.length ? (
            <PropertySummary
              formData={form.watch()}
              onSaveForLater={handleSaveForLater}
              onPublish={handlePublish}
              onPrevious={handlePreviousStep}
              saving={saving}
            />
          ) : currentStep === 5 ? (
            <ImageUploadSection
              propertyId={existingPropertyId || 'temp'}
              onUploadComplete={handleImageUploadComplete}
              onPrevious={handlePreviousStep}
            />
          ) : (
            <div className="space-y-6">
              {currentStep === 1 && <PropertyDetails form={form} mode={mode} />}
              {currentStep === 2 && <LocationDetails form={form} />}
              {currentStep === 3 && <RentalDetails form={form} />}
              {currentStep === 4 && <AmenitiesSection form={form} />}
              {renderFormNavigation()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}