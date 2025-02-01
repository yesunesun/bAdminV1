// src/components/property/wizard/PropertyForm.tsx
// Version: 1.5.0
// Last Modified: 2025-02-01T17:00:00+05:30 (IST)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Wand2, PencilLine, CheckCircle } from 'lucide-react';
import { FormData } from './types';
import { STEPS } from './constants';
import { PropertyDetails } from './sections/PropertyDetails';
import { LocationDetails } from './sections/LocationDetails';
import { RentalDetails } from './sections/RentalDetails';
import { AmenitiesSection } from './sections/AmenitiesSection';
import { ImageUploadSection } from './sections/ImageUploadSection';
import { PropertySummary } from './sections/PropertySummary';
import { FormNavigation } from './components/FormNavigation';
import { usePropertyForm } from './hooks/usePropertyForm';

interface PropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
  mode?: 'create' | 'edit';
  status?: 'draft' | 'published';
}

const StatusIndicator = ({ status }: { status: 'draft' | 'published' }) => {
  const isDraft = status === 'draft';
  
  return (
    <div className={cn(
      "flex items-center px-3 py-1.5 rounded-lg",
      isDraft 
        ? "bg-amber-50 text-amber-700 border border-amber-200" 
        : "bg-green-50 text-green-700 border border-green-200"
    )}>
      {isDraft ? (
        <PencilLine className="h-4 w-4 mr-1.5" />
      ) : (
        <CheckCircle className="h-4 w-4 mr-1.5" />
      )}
      <span className="text-sm font-medium capitalize">
        {status}
      </span>
    </div>
  );
};

export function PropertyForm({ 
  initialData, 
  propertyId, 
  mode = 'create',
  status: initialStatus = 'draft'
}: PropertyFormProps) {
  const navigate = useNavigate();
  const {
    form,
    currentStep,
    error,
    saving,
    savedPropertyId,
    user,
    status, // Get the current status from usePropertyForm
    handleAutoFill,
    handleNextStep,
    handlePreviousStep,
    handleSaveAsDraft,
    handleSaveAndPublish,
    handleUpdate,
    handleImageUploadComplete,
    setCurrentStep,
  } = usePropertyForm({ initialData, propertyId, mode, status: initialStatus });

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="bg-white p-8 rounded-lg shadow max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You must be logged in to create a property listing.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm 
                font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
            <div>
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
            <StatusIndicator status={status} />
          </div>
        </div>

        <FormNavigation 
          currentStep={currentStep} 
          onStepChange={setCurrentStep}
          propertyId={savedPropertyId || propertyId}
          mode={mode}
        />

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {currentStep === STEPS.length ? (
            <ImageUploadSection
              propertyId={savedPropertyId!}
              onUploadComplete={handleImageUploadComplete}
              onPrevious={handlePreviousStep}
            />
          ) : currentStep === STEPS.length - 1 ? (
            <PropertySummary
              formData={form.watch()}
              onPrevious={handlePreviousStep}
              onSaveAsDraft={handleSaveAsDraft}
              onSaveAndPublish={handleSaveAndPublish}
              onUpdate={handleUpdate}
              saving={saving}
              status={status}
              propertyId={savedPropertyId || propertyId}
            />
          ) : (
            <div className="space-y-6">
              {currentStep === 1 && <PropertyDetails form={form} mode={mode} />}
              {currentStep === 2 && <LocationDetails form={form} />}
              {currentStep === 3 && <RentalDetails form={form} />}
              {currentStep === 4 && <AmenitiesSection form={form} />}
              
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}