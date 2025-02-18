// src/components/property/wizard/PropertyForm.tsx
// Version: 1.8.0
// Last Modified: 18-02-2025 17:00 IST

import React, { useState, useEffect, useMemo } from 'react';
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
import PropertyTypeSelection from './components/PropertyTypeSelection';
import { usePropertyForm } from './hooks/usePropertyForm';

interface PropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
  mode?: 'create' | 'edit';
  status?: 'draft' | 'published';
  showTypeSelection?: boolean;
  onTypeSelect?: (category: string, type: string, city: string) => void;
  selectedCategory?: string;
  selectedAdType?: string;
  currentStep?: string;
}

const StatusIndicator = ({ status }: { status: 'draft' | 'published' }) => {
  const isDraft = status === 'draft';
  
  return (
    <div className={cn(
      "flex items-center px-3 py-1.5 rounded-lg",
      isDraft 
        ? "bg-warning/10 text-warning border border-warning/20" 
        : "bg-success/10 text-success border border-success/20"
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
  status: initialStatus = 'draft',
  showTypeSelection = false,
  onTypeSelect,
  selectedCategory,
  selectedAdType,
  currentStep: urlStep
}: PropertyFormProps) {
  const navigate = useNavigate();
  const [showTypeSelectionState, setShowTypeSelectionState] = useState(
    showTypeSelection || (!selectedCategory && !selectedAdType)
  );
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Determine initial step from URL or default to 1
  const initialStep = useMemo(() => {
    if (urlStep) {
      const stepIndex = STEPS.findIndex(s => s.id === urlStep);
      return stepIndex > -1 ? stepIndex + 1 : 1;
    }
    return 1;
  }, [urlStep]);

  const {
    form,
    currentStep: formStep,
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
  } = usePropertyForm({ 
    initialData, 
    propertyId, 
    mode, 
    status: initialStatus,
    propertyCategory: selectedCategory,
    adType: selectedAdType,
    city: selectedCity
  });

  // Set initial step from URL
  useEffect(() => {
    if (initialStep > 1) {
      setCurrentStep(initialStep);
    }
  }, [initialStep, setCurrentStep]);

  const handleTypeSelectionComplete = (category: string, adType: string, city: string) => {
    if (onTypeSelect) {
      onTypeSelect(category, adType, city);
    } else {
      navigate(`/properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/details`);
    }
    setSelectedCity(city);
    setShowTypeSelectionState(false);
  };

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="bg-card p-8 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">You must be logged in to create a property listing.</p>
            <button
              onClick={() => navigate('/login')}
              className={cn(
                "w-full py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
              )}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showTypeSelectionState) {
    return (
      <PropertyTypeSelection 
        onNext={handleTypeSelectionComplete}
        selectedCategory={selectedCategory}
        selectedAdType={selectedAdType}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-xl shadow-lg">
        <div className="p-3 border-b border-border">
          <div className="flex justify-between items-center">
            <div>
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className={cn(
                    "flex items-center px-3 py-1.5 text-sm font-medium rounded-lg",
                    "bg-success text-success-foreground",
                    "hover:bg-success/90 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                  )}
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
          currentStep={formStep} 
          onStepChange={setCurrentStep}
          propertyId={savedPropertyId || propertyId}
          mode={mode}
          category={selectedCategory}
          adType={selectedAdType}
        />

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {formStep === STEPS.length ? (
            <ImageUploadSection
              propertyId={savedPropertyId!}
              onUploadComplete={handleImageUploadComplete}
              onPrevious={handlePreviousStep}
            />
          ) : formStep === STEPS.length - 1 ? (
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
              {formStep === 1 && (
                <PropertyDetails 
                  form={form} 
                  mode={mode} 
                  category={selectedCategory}
                  adType={selectedAdType}
                />
              )}
              {formStep === 2 && (
                <LocationDetails 
                  form={form} 
                  selectedCity={selectedCity}
                />
              )}
              {formStep === 3 && (
                <RentalDetails 
                  form={form}
                  adType={selectedAdType}
                />
              )}
              {formStep === 4 && (
                <AmenitiesSection 
                  form={form}
                  category={selectedCategory}
                />
              )}
              
              <div className="flex justify-between pt-6 border-t border-border">
                {formStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className={cn(
                      "px-6 py-3 text-sm font-medium rounded-xl",
                      "bg-secondary text-secondary-foreground",
                      "hover:bg-secondary/90 transition-colors",
                      "focus:outline-none focus:ring-4 focus:ring-ring/30"
                    )}
                  >
                    Previous
                  </button>
                )}
                {formStep === 1 && <div />}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className={cn(
                    "px-6 py-3 text-sm font-medium rounded-xl",
                    "bg-primary text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                    "focus:outline-none focus:ring-4 focus:ring-ring/30"
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