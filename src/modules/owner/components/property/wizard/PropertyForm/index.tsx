// src/modules/owner/components/property/wizard/PropertyForm/index.tsx
// Version: 4.0.0
// Last Modified: 07-03-2025 16:30 IST
// Purpose: Refactored PropertyForm into smaller components for better maintainability

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyForm } from '../../hooks/usePropertyForm';
import { FormData } from '../../types';
import { STEPS } from '../../constants';

// Components
import FormHeader from './components/FormHeader';
import FormContent from './components/FormContent';
import StepNavigation from './components/StepNavigation';
import StatusIndicator from './components/StatusIndicator';
import LoginPrompt from './components/LoginPrompt';
import PropertyTypeSelection from '../../components/PropertyTypeSelection';
import WizardBreadcrumbs from '../../components/WizardBreadcrumbs';
import FormNavigation from '../../components/FormNavigation';

// Hooks
import { useStepNavigation } from './hooks/useStepNavigation';
import { useDebugTools } from './hooks/useDebugTools';

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

  // Determine initial step from URL or default to 1
  const initialStep = useMemo(() => {
    if (urlStep) {
      const stepIndex = STEPS.findIndex(s => s.id === urlStep) + 1;
      return stepIndex > 0 ? stepIndex : 1;
    }
    return 1;
  }, [urlStep]);

  // Initialize form with its context and state
  const {
    form,
    currentStep: formStep,
    error,
    saving,
    savedPropertyId,
    user,
    status,
    isSaleMode: formIsSaleMode,
    handleAutoFill,
    handleNextStep: originalHandleNextStep,
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

  // Initialize debug tools
  const { debugFormData, handleDebugClick } = useDebugTools(form, formIsSaleMode);

  // Initialize custom step navigation
  const { 
    isSaleMode, 
    getVisibleSteps, 
    handleNextStep 
  } = useStepNavigation({
    form, 
    formStep, 
    formIsSaleMode, 
    originalHandleNextStep, 
    setCurrentStep, 
    STEPS
  });

  // Function to handle type selection completion
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

  // If user is not logged in, show login prompt
  if (!user) {
    return <LoginPrompt onLoginClick={() => navigate('/login')} />;
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
        {/* Form Header with Status Indicator and Debug Tools */}
        <FormHeader 
          status={status}
          handleAutoFill={handleAutoFill}
          handleDebugClick={handleDebugClick}
        />

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
          steps={getVisibleSteps()}
        />

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Form Content for the current step */}
            <FormContent 
              form={form}
              formStep={formStep}
              STEPS={STEPS}
              effectiveCategory={effectiveCategory}
              effectiveAdType={effectiveAdType}
              mode={mode}
              selectedCity={selectedCity || initialData?.locality || ''}
              isSaleMode={isSaleMode}
              handlePreviousStep={handlePreviousStep}
              handleSaveAsDraft={handleSaveAsDraft}
              handleSaveAndPublish={handleSaveAndPublish}
              handleUpdate={handleUpdate}
              saving={saving}
              status={status}
              savedPropertyId={savedPropertyId || propertyId}
              handleImageUploadComplete={handleImageUploadComplete}
            />
            
            {/* Step Navigation (Previous/Next buttons) */}
            <StepNavigation 
              formStep={formStep}
              STEPS={STEPS}
              handlePreviousStep={handlePreviousStep}
              handleNextStep={handleNextStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyForm;