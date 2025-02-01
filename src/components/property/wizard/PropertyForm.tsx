// src/components/property/wizard/PropertyForm.tsx
// Version: 1.5.0
// Last Modified: 2025-02-01T12:30:00+05:30 (IST)

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Wand2 } from 'lucide-react';
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
}

export function PropertyForm({ initialData, propertyId, mode = 'create' }: PropertyFormProps) {
  const navigate = useNavigate();
  const {
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
  } = usePropertyForm({ initialData, propertyId, mode });

  if (!user) {
    return (
      <AuthRequiredMessage onLogin={() => navigate('/login')} />
    );
  }

  const renderFormContent = () => {
    if (currentStep === STEPS.length) {
      return (
        <ImageUploadSection
          propertyId={savedPropertyId!}
          onUploadComplete={handleImageUploadComplete}
          onPrevious={handlePreviousStep}
        />
      );
    }

    if (currentStep === STEPS.length - 1) {
      return (
        <PropertySummary
          formData={form.watch()}
          onSaveForLater={handleSaveProperty}
          onPublish={handleSaveProperty}
          onPrevious={handlePreviousStep}
          saving={saving}
          buttonText="Save and Continue to Photos"
        />
      );
    }

    return (
      <div className="space-y-6">
        {currentStep === 1 && <PropertyDetails form={form} mode={mode} />}
        {currentStep === 2 && <LocationDetails form={form} />}
        {currentStep === 3 && <RentalDetails form={form} />}
        {currentStep === 4 && <AmenitiesSection form={form} />}
        <FormNavigationButtons 
          currentStep={currentStep}
          onNext={handleNextStep}
          onPrevious={handlePreviousStep}
          isLastStep={currentStep === STEPS.length - 1}
          saving={saving}
        />
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-lg">
        <FormHeader onAutoFill={handleAutoFill} />
        <FormNavigation 
          currentStep={currentStep} 
          onStepChange={setCurrentStep} 
        />
        <div className="p-6">
          {error && <ErrorMessage message={error} />}
          {renderFormContent()}
        </div>
      </div>
    </div>
  );
}

// Sub-components
function AuthRequiredMessage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-12">
        <div className="bg-white p-8 rounded-lg shadow max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You must be logged in to create a property listing.</p>
          <button
            onClick={onLogin}
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

function FormHeader({ onAutoFill }: { onAutoFill: () => void }) {
  return (
    <div className="p-3 border-b border-slate-200">
      <div className="flex justify-between items-center">
        {process.env.NODE_ENV === 'development' && (
          <button
            type="button"
            onClick={onAutoFill}
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
  );
}

interface FormNavigationButtonsProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  isLastStep: boolean;
  saving: boolean;
}

function FormNavigationButtons({ 
  currentStep, 
  onNext, 
  onPrevious, 
  isLastStep,
  saving 
}: FormNavigationButtonsProps) {
  return (
    <div className="flex justify-between pt-6 border-t">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={onPrevious}
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
        onClick={onNext}
        disabled={saving}
        className={cn(
          "px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl",
          "hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-100",
          "disabled:opacity-50"
        )}
      >
        {isLastStep ? "Save and Continue to Photos" : "Next"}
      </button>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}