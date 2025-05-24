// src/modules/owner/components/property/wizard/PropertyForm/index.tsx
// Version: 11.1.0
// Last Modified: 25-05-2025 22:15 IST
// Purpose: Fixed step navigation with FlowContext and proper URL updates

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import FLOW_TYPES and step sequences
import { usePropertyForm } from '../hooks/usePropertyForm';
import { FormData } from '../types';
import { STEPS } from '../constants';
import { FLOW_TYPES, FLOW_STEP_SEQUENCES } from '../constants/flows';
import { useFlow } from '@/contexts/FlowContext';

// Components
import FormHeader from './components/FormHeader';
import FormContent from './components/FormContent';
import StepNavigation from './components/StepNavigation';
import StatusIndicator from './components/StatusIndicator';
import LoginPrompt from './components/LoginPrompt';
import PropertyTypeSelection from '../components/PropertyTypeSelection';
import WizardBreadcrumbs from '../components/WizardBreadcrumbs';
import { FormNavigation } from '../components/FormNavigation';
import FormDataDebug from '../components/FormDataDebug';

// Hooks
import { useStepNavigation } from './hooks/useStepNavigation';
import { useFormDataChangeTracking } from '../hooks/useFormDataChangeTracking';

// Utils
import { cleanFormData } from '../utils/formCleaningUtils';

interface PropertyFormProps {
  initialData?: FormData;
  propertyId?: string;
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
  status: initialStatus = 'draft',
  showTypeSelection = false,
  onTypeSelect,
  selectedCategory: passedCategory,
  selectedAdType: passedAdType,
  currentStep: urlStep
}: PropertyFormProps) {
  const navigate = useNavigate();
  const { step } = useParams();
  const { flowType, category, listingType, isValidFlow, isLoading, redirectToPropertySelection } = useFlow();
  
  // State hooks
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [propertyIdAfterSave, setPropertyIdAfterSave] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>(initialData?.locality || '');

  console.log('[PropertyForm] Initialized with FlowContext:', {
    flowType,
    category,
    listingType,
    isValidFlow,
    isLoading,
    propertyId,
    urlStep,
    stepFromParams: step
  });

  // Show loading spinner while flow context is initializing
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3 text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // If no valid flow, show property type selection
  if (!isValidFlow || !flowType) {
    console.log('[PropertyForm] No valid flow, showing PropertyTypeSelection');
    return (
      <PropertyTypeSelection 
        onNext={(category: string, adType: string, city: string) => {
          if (onTypeSelect) {
            onTypeSelect(category, adType, city);
          } else {
            // FlowContext will handle navigation
            redirectToPropertySelection();
          }
        }}
        selectedCategory={passedCategory}
        selectedAdType={passedAdType}
      />
    );
  }

  // Get flow steps based on current flow type
  const flowSteps = FLOW_STEP_SEQUENCES[flowType] || [];
  
  if (flowSteps.length === 0) {
    console.error('[PropertyForm] No flow steps found for:', flowType);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card rounded-xl shadow-lg p-6">
          <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
            <h2 className="text-lg font-semibold text-destructive mb-2">Configuration Error</h2>
            <p className="text-sm text-destructive/80">
              No steps configured for the selected property flow. Please try selecting a different property type.
            </p>
            <button 
              onClick={() => redirectToPropertySelection()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Select Property Type
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Initialize the property form hook
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
    handleImageUploadComplete,
    setCurrentStep,
  } = usePropertyForm({ 
    initialData, 
    propertyId, 
    mode: 'create',
    status: initialStatus,
    propertyCategory: category,
    adType: listingType,
    city: selectedCity || initialData?.locality || ''
  });

  // Track form data changes
  useFormDataChangeTracking(form);

  // Custom next step handler that updates URL
  const handleNextStepWithNavigation = () => {
    const nextStep = formStep + 1;
    const maxSteps = flowSteps.length;
    
    console.log('[PropertyForm] handleNextStepWithNavigation:', {
      currentStep: formStep,
      nextStep,
      maxSteps,
      flowSteps: flowSteps.map(s => s.id)
    });
    
    if (nextStep <= maxSteps) {
      // Update the current step first
      setCurrentStep(nextStep);
      
      // Update URL to reflect new step
      const stepName = flowSteps[nextStep - 1]?.id || 'details';
      const newUrl = `/properties/list/${category.toLowerCase()}/${listingType.toLowerCase()}/${stepName}`;
      
      console.log('[PropertyForm] Navigating to next step:', newUrl);
      navigate(newUrl, { replace: true });
    } else {
      console.log('[PropertyForm] Reached end of steps');
    }
  };

  // Custom previous step handler that updates URL
  const handlePreviousStepWithNavigation = () => {
    const prevStep = Math.max(formStep - 1, 1);
    
    console.log('[PropertyForm] handlePreviousStepWithNavigation:', {
      currentStep: formStep,
      prevStep
    });
    
    // Update the current step first
    setCurrentStep(prevStep);
    
    // Update URL to reflect new step
    const stepName = flowSteps[prevStep - 1]?.id || 'details';
    const newUrl = `/properties/list/${category.toLowerCase()}/${listingType.toLowerCase()}/${stepName}`;
    
    console.log('[PropertyForm] Navigating to previous step:', newUrl);
    navigate(newUrl, { replace: true });
  };

  // Initialize step navigation
  const { 
    isSaleMode, 
    isPGHostelMode,
    isCommercialRentMode,
    isCommercialSaleMode,
    isCoworkingMode,
    isLandSaleMode,
    isFlatmatesMode,
    getVisibleSteps
  } = useStepNavigation({
    form, 
    formStep, 
    formIsSaleMode, 
    originalHandleNextStep: handleNextStepWithNavigation,
    setCurrentStep, 
    STEPS: flowSteps
  });

  // If user is not logged in, show login prompt
  if (!user) {
    return <LoginPrompt onLoginClick={() => navigate('/login')} />;
  }

  // Update propertyIdAfterSave when savedPropertyId changes
  useEffect(() => {
    if (savedPropertyId) {
      setPropertyIdAfterSave(savedPropertyId);
    }
  }, [savedPropertyId]);

  // Set initial step from URL if provided
  useEffect(() => {
    if ((urlStep || step) && setCurrentStep && flowSteps.length > 0) {
      const stepId = urlStep || step;
      const stepIndex = flowSteps.findIndex(s => s.id === stepId) + 1;
      if (stepIndex > 0) {
        console.log('[PropertyForm] Setting step from URL:', {
          stepId,
          stepIndex,
          availableSteps: flowSteps.map(s => s.id)
        });
        setCurrentStep(stepIndex);
      }
    }
  }, [urlStep, step, setCurrentStep, flowSteps]);

  // Enhanced save function
  const enhancedSaveFunction = async (): Promise<string | undefined> => {
    if (!form) {
      console.warn('[PropertyForm] Cannot save - form not initialized');
      return undefined;
    }
    
    setSaveInProgress(true);
    
    try {
      const formData = form.getValues();
      console.log('[PropertyForm] Form data before save:', formData);
      
      // Clean the form data
      const cleanedData = cleanFormData(formData);
      
      // Ensure we have flow information from context
      cleanedData.flow = {
        category,
        listingType,
        flowType
      };
      
      // Ensure we have a title
      if (!cleanedData.title) {
        cleanedData.title = `${category} ${listingType} Property`;
      }
      
      // Apply the form changes
      form.reset(cleanedData);
      
      // Call the original save function
      await handleSaveAsDraft();
      
      // Wait for state to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const effectivePropertyId = savedPropertyId || propertyId || propertyIdAfterSave;
      console.log("[PropertyForm] Enhanced save complete, property ID:", effectivePropertyId);
      return effectivePropertyId;
    } catch (error) {
      console.error("[PropertyForm] Error in enhanced save function:", error);
      throw error;
    } finally {
      setSaveInProgress(false);
    }
  };

  // Get the filtered steps for the form navigation
  const visibleSteps = getVisibleSteps();
  const effectivePropertyId = savedPropertyId || propertyId || propertyIdAfterSave;
  const isReviewStep = flowSteps[formStep - 1]?.id.includes('review') || false;

  console.log('[PropertyForm] Rendering with:', {
    category,
    listingType,
    flowType,
    formStep,
    currentStepId: flowSteps[formStep - 1]?.id,
    visibleSteps: visibleSteps?.map(step => step.id),
    isReviewStep
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-xl shadow-lg">
        {/* Form Header with Status Indicator */}
        <FormHeader 
          status={status}
          handleAutoFill={handleAutoFill}
        />

        <div className="px-6 pt-4">
          <WizardBreadcrumbs
            category={category}
            adType={listingType}
            currentStep={flowSteps[formStep - 1]?.label || ''}
          />
        </div>

        <FormNavigation 
          currentStep={formStep} 
          onStepChange={(newStep) => {
            setCurrentStep(newStep);
            const stepName = flowSteps[newStep - 1]?.id || 'details';
            const newUrl = `/properties/list/${category.toLowerCase()}/${listingType.toLowerCase()}/${stepName}`;
            navigate(newUrl, { replace: true });
          }}
          propertyId={effectivePropertyId}
          category={category}
          adType={listingType}
          steps={visibleSteps}
        />

        <div className="p-6">
          {/* Error message - only show if NOT on review step */}
          {error && !isReviewStep && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Main content area */}
          <div className="w-full">
            <div className="space-y-6">
              {/* Form Content for the current step */}
              <FormContent 
                form={form}
                formStep={formStep}
                STEPS={flowSteps}
                effectiveCategory={category}
                effectiveAdType={listingType}
                mode="create"
                selectedCity={selectedCity || initialData?.locality || ''}
                isSaleMode={isSaleMode}
                isPGHostelMode={isPGHostelMode}
                isCommercialRentMode={isCommercialRentMode}
                isCommercialSaleMode={isCommercialSaleMode}
                isCoworkingMode={isCoworkingMode}
                isLandSaleMode={isLandSaleMode}
                isFlatmatesMode={isFlatmatesMode}
                handlePreviousStep={handlePreviousStepWithNavigation}
                handleSaveAsDraft={handleSaveAsDraft}
                saving={saving}
                status={status}
                savedPropertyId={effectivePropertyId}
                handleImageUploadComplete={handleImageUploadComplete}
              />
              
              {/* Step Navigation (Previous/Next buttons) */}
              <StepNavigation 
                formStep={formStep}
                STEPS={flowSteps}
                handlePreviousStep={handlePreviousStepWithNavigation}
                handleNextStep={handleNextStepWithNavigation}
                isLastStep={isReviewStep}
                disablePrevious={saving || saveInProgress}
              />
            </div>
          </div>
        </div>
      </div>

      {/* FormDataDebug component - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <FormDataDebug 
          form={form} 
          currentStepId={flowSteps[formStep - 1]?.id}
          currentStepNumber={formStep}
          flowType={flowType}
          position="right"
        />
      )}
    </div>
  );
}

export default PropertyForm;