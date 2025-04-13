// src/modules/owner/components/property/wizard/PropertyForm/index.tsx
// Version: 6.1.0
// Last Modified: 13-04-2025 21:00 IST
// Purpose: Fixed reference error for handlePreviousStep

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Fix hook and utility imports
import { usePropertyForm } from '../hooks/usePropertyForm';
import { FormData } from '../types'
import { STEPS, FLOW_STEPS } from '../constants'

// Components
import FormHeader from './components/FormHeader';
import FormContent from './components/FormContent';
import StepNavigation from './components/StepNavigation';
import StatusIndicator from './components/StatusIndicator';
import LoginPrompt from './components/LoginPrompt';
import PropertyTypeSelection from '../components/PropertyTypeSelection';
import WizardBreadcrumbs from '../components/WizardBreadcrumbs';
import { FormNavigation } from '../components/FormNavigation'; // Changed to named import

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

  // Determine if we're in PG/Hostel mode
  const isPGHostelMode = useMemo(() => {
    if (derivedAdType) {
      return derivedAdType.toLowerCase() === 'pghostel';
    }
    
    // Check URL path for keywords
    const urlPath = window.location.pathname.toLowerCase();
    return urlPath.includes('pghostel');
  }, [derivedAdType]);
  
  // Determine if we're in Commercial Rent mode
  const isCommercialRentMode = useMemo(() => {
    // Check if the ad type specifically indicates commercial rent
    if (derivedAdType && derivedCategory) {
      const isCommercialType = derivedAdType.toLowerCase() === 'commercialrent' || 
                              (derivedAdType.toLowerCase() === 'rent' && 
                               derivedCategory.toLowerCase() === 'commercial');
      return isCommercialType;
    }
    
    // Check URL path for commercial rent keywords
    const urlPath = window.location.pathname.toLowerCase();
    return urlPath.includes('commercial') && (urlPath.includes('rent') || urlPath.includes('lease'));
  }, [derivedAdType, derivedCategory]);
  
  // Determine if we're in Commercial Sale mode
  const isCommercialSaleMode = useMemo(() => {
    // Check if the ad type specifically indicates commercial sale
    if (derivedAdType && derivedCategory) {
      const isCommercialSaleType = (derivedAdType.toLowerCase() === 'sale' || 
                                  derivedAdType.toLowerCase() === 'sell') && 
                                 derivedCategory.toLowerCase() === 'commercial';
      return isCommercialSaleType;
    }
    
    // Check URL path for commercial sale keywords
    const urlPath = window.location.pathname.toLowerCase();
    return urlPath.includes('commercial') && (urlPath.includes('sale') || urlPath.includes('sell'));
  }, [derivedAdType, derivedCategory]);
  
  // Determine if we're in Commercial Co-working mode
  const isCoworkingMode = useMemo(() => {
    // Check if the ad type specifically indicates co-working
    if (derivedAdType && derivedCategory) {
      const isCoworkingType = derivedAdType.toLowerCase() === 'coworking' && 
                            derivedCategory.toLowerCase() === 'commercial';
      return isCoworkingType;
    }
    
    // Check URL path for co-working keywords
    const urlPath = window.location.pathname.toLowerCase();
    return urlPath.includes('coworking') || urlPath.includes('co-working');
  }, [derivedAdType, derivedCategory]);
  
  // Determine if we're in Land/Plot Sale mode
  const isLandSaleMode = useMemo(() => {
    // Check if the category indicates land
    if (derivedCategory) {
      const isLandType = derivedCategory.toLowerCase() === 'land';
      return isLandType;
    }
    
    // Check URL path for land keywords
    const urlPath = window.location.pathname.toLowerCase();
    return urlPath.includes('land') || urlPath.includes('plot');
  }, [derivedCategory]);
  
  // Determine if we're in Residential Flatmates mode
  const isFlatmatesMode = useMemo(() => {
    // Check if the ad type specifically indicates flatmates
    if (derivedAdType && derivedCategory) {
      const isFlatmatesType = derivedAdType.toLowerCase() === 'flatmates' && 
                            derivedCategory.toLowerCase() === 'residential';
      return isFlatmatesType;
    }
    
    // Check URL path for flatmates keywords
    const urlPath = window.location.pathname.toLowerCase();
    return urlPath.includes('flatmate');
  }, [derivedAdType, derivedCategory]);

  // Determine which flow steps to use based on property type
  const flowSteps = useMemo(() => {
    if (isPGHostelMode) {
      return FLOW_STEPS.RESIDENTIAL_PGHOSTEL;
    } else if (isCommercialRentMode) {
      return FLOW_STEPS.COMMERCIAL_RENT;
    } else if (isCommercialSaleMode) {
      return FLOW_STEPS.COMMERCIAL_SALE;
    } else if (isCoworkingMode) {
      return FLOW_STEPS.COMMERCIAL_COWORKING;
    } else if (isLandSaleMode) {
      return FLOW_STEPS.LAND_SALE;
    } else if (isFlatmatesMode) {
      return FLOW_STEPS.RESIDENTIAL_FLATMATES;
    } else if (derivedAdType?.toLowerCase() === 'sale' || derivedAdType?.toLowerCase() === 'sell') {
      return FLOW_STEPS.RESIDENTIAL_SALE;
    } else {
      return FLOW_STEPS.RESIDENTIAL_RENT;
    }
  }, [
    derivedAdType, 
    isPGHostelMode, 
    isCommercialRentMode, 
    isCommercialSaleMode, 
    isCoworkingMode, 
    isLandSaleMode, 
    isFlatmatesMode
  ]);

  // Determine initial step from URL or default to 1
  const initialStep = useMemo(() => {
    if (urlStep) {
      const stepIndex = flowSteps.findIndex(s => s.id === urlStep) + 1;
      return stepIndex > 0 ? stepIndex : 1;
    }
    return 1;
  }, [urlStep, flowSteps]);

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

  // Initialize custom step navigation with the correct flow steps
  const { 
    isSaleMode, 
    isPGHostelMode: detectedPGHostelMode,
    isCommercialRentMode: detectedCommercialRentMode,
    isCommercialSaleMode: detectedCommercialSaleMode,
    isCoworkingMode: detectedCoworkingMode,
    isLandSaleMode: detectedLandSaleMode,
    isFlatmatesMode: detectedFlatmatesMode,
    getVisibleSteps, 
    handleNextStep 
  } = useStepNavigation({
    form, 
    formStep, 
    formIsSaleMode, 
    originalHandleNextStep, 
    setCurrentStep, 
    STEPS: flowSteps // Use flow-specific steps
  });

  // Define a safe handlePreviousStep function that won't cause reference errors
  const safePreviousStep = () => {
    if (typeof handlePreviousStep === 'function') {
      handlePreviousStep();
    } else {
      // Fallback to basic navigation
      const prevStep = Math.max(formStep - 1, 1);
      setCurrentStep(prevStep);
    }
  };

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

  // Get the filtered steps for the form navigation
  const visibleSteps = getVisibleSteps();

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
            currentStep={flowSteps[formStep - 1]?.title || ''}
          />
        </div>

        <FormNavigation 
          currentStep={formStep} 
          onStepChange={setCurrentStep}
          propertyId={savedPropertyId || propertyId}
          mode={mode}
          category={effectiveCategory}
          adType={effectiveAdType}
          steps={visibleSteps}
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
              STEPS={flowSteps}
              effectiveCategory={effectiveCategory}
              effectiveAdType={effectiveAdType}
              mode={mode}
              selectedCity={selectedCity || initialData?.locality || ''}
              isSaleMode={isSaleMode}
              isPGHostelMode={isPGHostelMode}
              isCommercialRentMode={isCommercialRentMode}
              isCommercialSaleMode={isCommercialSaleMode}
              isCoworkingMode={isCoworkingMode}
              isLandSaleMode={isLandSaleMode}
              isFlatmatesMode={isFlatmatesMode}
              handlePreviousStep={safePreviousStep}
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
              STEPS={flowSteps}
              handlePreviousStep={safePreviousStep}
              handleNextStep={handleNextStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyForm;