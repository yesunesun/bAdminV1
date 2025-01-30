// PropertyForm.tsx
// Version: 1.3.0
// Last Modified: 30-01-2025 16:00 IST

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { PropertyDetails } from './PropertyDetails';
import { LocationDetails } from './LocationDetails';
import { RentalDetails } from './RentalDetails';
import { AmenitiesSection } from './AmenitiesSection';
import { ImageUploadSection } from './ImageUploadSection';
import { PropertySummary } from './PropertySummary';
import { FormData } from './types';
import { STEPS } from './constants';
import { supabase } from '@/lib/supabase';
import { Wand2 } from 'lucide-react';

// Test data for auto-fill
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

  const handleNextStep = () => {
    // Basic validation before moving to next step
    if (currentStep === 1) {
      if (!form.getValues('propertyType') || !form.getValues('bhkType')) {
        setError('Please fill in all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!form.getValues('locality')) {
        setError('Please select a locality');
        return;
      }
    } else if (currentStep === 3) {
      if (!form.getValues('rentAmount')) {
        setError('Please enter rent amount');
        return;
      }
    }
    
    setError('');
    setCurrentStep(prev => Math.min(prev + 1, 6));
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
        price: parseFloat(formData.rentAmount),
        bedrooms: parseInt(formData.bhkType.split(' ')[0]),
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        square_feet: formData.builtUpArea ? parseFloat(formData.builtUpArea) : null,
        address: formData.address || '',
        city: formData.locality,
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
              rounded-xl hover:bg-slate-200 transition-colors focus:outline-none 
              focus:ring-4 focus:ring-slate-100"
          >
            Previous
          </button>
        )}
        {currentStep === 1 && <div />}
        {currentStep < 6 && (
          <button
            type="button"
            onClick={handleNextStep}
            className={cn(
              "px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl",
              "hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-100",
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
          <div className="bg-white p-8 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You must be logged in to create a property listing.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
        <div className="p-3 border-b border-slate-200">
          <div className="flex justify-between items-center">
            {/* <FormProgress currentStep={currentStep} totalSteps={STEPS.length} /> */}
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

        <div className="flex border-b border-slate-200">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index + 1)}
                className={cn(
                  // Base styles - Reduced width
                  "flex flex-1 flex-col items-center justify-center py-2 px-1.5",
                  "min-w-[80px] max-w-[100px]", // Control minimum and maximum width
                  "relative group transition-all duration-200",
                  // Text and icon styles
                  "text-sm select-none",
                  // Hover effects
                  "hover:bg-indigo-50/60",
                  // Active/Current step styles
                  currentStep === index + 1 
                    ? "text-indigo-600 bg-indigo-50/40" 
                    : "text-slate-500 hover:text-indigo-600",
                  // Border and divider styles
                  "border-r border-slate-200 last:border-r-0",
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  "group-hover:scale-110",
                  currentStep === index + 1 ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
                )} />
                <span className={cn(
                  "text-[11px] font-medium tracking-tight mt-0.5",
                  "transition-colors duration-200",
                  "truncate px-1 w-full text-center",
                  currentStep === index + 1 ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-600"
                )}>
                  {step.title}
                </span>
                {currentStep === index + 1 && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {currentStep === 6 ? (
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