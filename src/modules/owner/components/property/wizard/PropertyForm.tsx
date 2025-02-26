// src/modules/owner/components/property/wizard/PropertyForm.tsx
// Version: 2.2.0
// Last Modified: 26-02-2025 18:20 IST
// Purpose: Form for property listing creation and editing with improved data handling

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
import WizardBreadcrumbs from './components/WizardBreadcrumbs';
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
  selectedCategory: passedCategory,
  selectedAdType: passedAdType,
  currentStep: urlStep
}: PropertyFormProps) {
  const navigate = useNavigate();
  
  // Extract property type and listing type from initialData if in edit mode
  const derivedCategory = useMemo(() => {
    if (mode === 'edit' && initialData?.propertyType) {
      return initialData.propertyType;
    }
    return passedCategory;
  }, [mode, initialData, passedCategory]);
  
  const derivedAdType = useMemo(() => {
    if (mode === 'edit' && initialData?.listingType) {
      return initialData.listingType;
    }
    return passedAdType;
  }, [mode, initialData, passedAdType]);
  
  // Determine whether to show type selection
  const [showTypeSelectionState, setShowTypeSelectionState] = useState(
    showTypeSelection || (!derivedCategory && !derivedAdType && mode !== 'edit')
  );
  
  const [selectedCity, setSelectedCity] = useState<string>(
    initialData?.locality || ''
  );

  // Debug logs for development
  useEffect(() => {
    console.log('PropertyForm props:', {
      hasInitialData: !!initialData,
      propertyId,
      mode,
      initialStatus,
      passedCategory,
      passedAdType,
      derivedCategory,
      derivedAdType,
      urlStep
    });
    
    if (initialData) {
      console.log('PropertyForm initialData snippet:', {
        propertyType: initialData.propertyType,
        listingType: initialData.listingType,
        bhkType: initialData.bhkType,
        locality: initialData.locality,
        rentAmount: initialData.rentAmount
      });
    }
  }, [initialData, propertyId, mode, initialStatus, passedCategory, passedAdType, derivedCategory, derivedAdType, urlStep]);

  // Determine initial step from URL or default to 1
  const initialStep = useMemo(() => {
    if (urlStep) {
      const stepIndex = STEPS.findIndex(s => s.id === urlStep) + 1;
      return stepIndex > -1 ? stepIndex : 1;
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
    propertyCategory: derivedCategory,
    adType: derivedAdType,
    city: selectedCity || initialData?.locality || ''
  });

  // Set initial step from URL
  useEffect(() => {
    if (initialStep > 1) {
      setCurrentStep(initialStep);
    }
  }, [initialStep, setCurrentStep]);

  // For debugging 
  useEffect(() => {
    console.log('Current form step:', formStep);
    console.log('Form values sample:', {
      propertyType: form.getValues('propertyType'),
      listingType: form.getValues('listingType'),
      bhkType: form.getValues('bhkType'),
      locality: form.getValues('locality')
    });
  }, [formStep, form]);

  const handleTypeSelectionComplete = (category: string, adType: string, city: string) => {
    console.log('Type selection complete:', { category, adType, city });
    
    if (onTypeSelect) {
      onTypeSelect(category, adType, city);
    } else {
      // Ensure proper URL structure
      const path = `/properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/details`;
      console.log('Navigating to:', path);
      navigate(path);
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

  // In edit mode with initialData, bypass type selection
  useEffect(() => {
    if (mode === 'edit' && initialData && showTypeSelectionState) {
      setShowTypeSelectionState(false);
    }
  }, [mode, initialData, showTypeSelectionState]);

  if (showTypeSelectionState) {
    return (
      <PropertyTypeSelection 
        onNext={handleTypeSelectionComplete}
        selectedCategory={derivedCategory}
        selectedAdType={derivedAdType}
      />
    );
  }

  // Ensure we have category and type either from props or initialData
  const effectiveCategory = derivedCategory || initialData?.propertyType || '';
  const effectiveAdType = derivedAdType || initialData?.listingType || '';

  // Debug check for valid property parameters
  if (!effectiveCategory || !effectiveAdType) {
    console.error('Missing required parameters:', { 
      effectiveCategory, 
      effectiveAdType,
      derivedCategory,
      derivedAdType,
      'initialData?.propertyType': initialData?.propertyType,
      'initialData?.listingType': initialData?.listingType
    });
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

        <div className="px-6 pt-4">
          <WizardBreadcrumbs
            category={effectiveCategory}
            adType={effectiveAdType}
            currentStep={STEPS[formStep - 1]?.title || ''}
          />
        </div>

        <FormNavigation 
          currentStep={formStep} 
          onStepChange={setCurrentStep}
          propertyId={savedPropertyId || propertyId}
          mode={mode}
          category={effectiveCategory}
          adType={effectiveAdType}
        />

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {formStep === STEPS.length ? (
            <ImageUploadSection
              propertyId={savedPropertyId || propertyId!}
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
                  category={effectiveCategory}
                  adType={effectiveAdType}
                />
              )}
              {formStep === 2 && (
                <LocationDetails 
                  form={form} 
                  selectedCity={selectedCity || initialData?.locality || ''}
                />
              )}
              {formStep === 3 && (
                <RentalDetails 
                  form={form}
                  adType={effectiveAdType}
                />
              )}
              {formStep === 4 && (
                <AmenitiesSection 
                  form={form}
                  category={effectiveCategory}
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