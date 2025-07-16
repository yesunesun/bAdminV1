// src/modules/owner/components/property/wizard/PropertyForm/index.tsx
// Version: 11.6.0
// Last Modified: 16-07-2025 15:00 IST
// Purpose: Complete implementation of Find Location button behavior with location context

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Import FLOW_TYPES and step sequences
import { usePropertyForm } from '../hooks/usePropertyForm';
import { FormData } from '../types';
import { STEPS } from '../constants';
import { FLOW_TYPES, FLOW_STEP_SEQUENCES } from '../constants/flows';
import { useFlow } from '@/contexts/FlowContext';
import { getURLFriendlyType } from '@/contexts/FlowContext';

// Components
import FormHeader from './components/FormHeader';
import FormContent from './components/FormContent';
import StepNavigation from './components/StepNavigation';
import StatusIndicator from './components/StatusIndicator';
import LoginPrompt from './components/LoginPrompt';
import PropertyTypeSelection from '../components/PropertyTypeSelection';
import WizardBreadcrumbs from '../components/WizardBreadcrumbs';
import { FormNavigation } from '../components/FormNavigation';
import UnifiedStepIndicator from '../components/UnifiedStepIndicator';
import { updateMandatoryFieldsStatus, calculateCompletionStats } from '../utils/mandatoryFieldsUtils';

// Import LocationDetailsRef type
import type { LocationDetailsRef } from '../sections/LocationDetails';

// Hooks
import { useStepNavigation } from './hooks/useStepNavigation';
import { useFormDataChangeTracking } from '../hooks/useFormDataChangeTracking';
import { useStepValidation } from '../hooks/useStepValidation';

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

  // Location context state for StepNavigation
  const [locationHasCoordinates, setLocationHasCoordinates] = useState(false);
  const [locationIsFetching, setLocationIsFetching] = useState(false);
  
  // Ref to access LocationDetails methods
  const locationDetailsRef = useRef<LocationDetailsRef>(null);

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

  // Initialize validation system for current step
  const currentStepId = flowSteps[formStep - 1]?.id || '';
  const {
    isValid: stepIsValid,
    canProceedToNextStep,
    completionPercentage,
    getValidationSummary,
    blockNavigation,
    validateCurrentStep
  } = useStepValidation({
    form,
    flowType: flowType || 'residential_rent',
    currentStepId
  });

  // Check if current step is a location step
  const isLocationStep = currentStepId.includes('location');

  // Track form data changes
  useFormDataChangeTracking(form);

  // Create step validation status for all steps (FIXED)
  const stepValidationStatus = React.useMemo(() => {
    const status: Record<number, { isValid: boolean; completionPercentage: number }> = {};
    
    // For now, only calculate for current step to avoid performance issues
    // In a full implementation, you might want to calculate for all steps
    status[formStep] = {
      isValid: stepIsValid,
      completionPercentage: completionPercentage
    };
    
    console.log('[PropertyForm] Step validation status:', status);
    return status;
  }, [formStep, stepIsValid, completionPercentage]);

  // Handle coordinates change from LocationDetails
  const handleCoordinatesChange = React.useCallback((hasCoordinates: boolean) => {
    console.log('[PropertyForm] Coordinates changed:', hasCoordinates);
    setLocationHasCoordinates(hasCoordinates);
  }, []);

  // Handle Find Location action
  const handleFindLocation = React.useCallback(async (): Promise<boolean> => {
    console.log('[PropertyForm] handleFindLocation called');
    
    if (!locationDetailsRef.current) {
      console.warn('[PropertyForm] LocationDetails ref not available');
      return false;
    }

    try {
      setLocationIsFetching(true);
      const success = await locationDetailsRef.current.autoFetchCoordinates();
      console.log('[PropertyForm] Find Location result:', success);
      return success;
    } catch (error) {
      console.error('[PropertyForm] Error in Find Location:', error);
      return false;
    } finally {
      setLocationIsFetching(false);
    }
  }, []);

  // ENHANCED: Next step handler with automatic coordinate fetching
  const handleNextStepWithValidation = async () => {
    console.log('[PropertyForm] handleNextStepWithValidation called:', {
      currentStep: formStep,
      currentStepId,
      stepIsValid,
      canProceed: canProceedToNextStep(),
      isLocationStep,
      locationHasCoordinates
    });

    // For location steps, handle coordinate logic
    if (isLocationStep && areCoordinatesMissing()) {
      console.log('[PropertyForm] Location step with missing coordinates - attempting auto-fetch');
      
      // First check if other required fields are filled
      const summary = getValidationSummary();
      const missingFields = summary?.invalidFields.filter(f => f.name !== 'latitude' && f.name !== 'longitude') || [];
      
      if (missingFields.length > 0) {
        // Other fields are missing - show normal validation error
        const fieldLabels = {
          propertyType: 'Property Type',
          bhkType: 'BHK Configuration',
          floor: 'Floor',
          totalFloors: 'Total Floors',
          propertyAge: 'Property Age',
          facing: 'Facing Direction',
          builtUpArea: 'Built-up Area',
          bathrooms: 'Bathrooms',
          address: 'Address',
          city: 'City',
          state: 'State',
          pinCode: 'PIN Code',
          locality: 'Locality',
          expectedPrice: 'Expected Price',
          maintenanceCost: 'Maintenance Cost',
          kitchenType: 'Kitchen Type',
          availableFrom: 'Available From',
          furnishing: 'Furnishing',
          parking: 'Parking'
        };

        const missingFieldLabels = missingFields.map(field => 
          fieldLabels[field.name as keyof typeof fieldLabels] || field.name
        );

        alert(`Please complete these required fields before proceeding:\n\n• ${missingFieldLabels.join('\n• ')}`);
        
        // Scroll to first missing field
        const firstMissingField = missingFields[0];
        if (firstMissingField) {
          const fieldElement = document.querySelector(`[name="${firstMissingField.name}"]`) || 
                              document.querySelector(`input[placeholder*="${firstMissingField.name}"]`) ||
                              document.querySelector(`select[name="${firstMissingField.name}"]`);
          
          if (fieldElement) {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              if ('focus' in fieldElement) {
                (fieldElement as HTMLElement).focus();
              }
            }, 500);
          }
        }
        return; // Block navigation
      }

      // Only coordinates are missing - try to auto-fetch
      try {
        console.log('[PropertyForm] Attempting to auto-fetch coordinates');
        const success = await handleFindLocation();
        
        if (success) {
          console.log('[PropertyForm] Coordinates fetched successfully, proceeding to next step');
          // Continue with normal flow below
        } else {
          console.log('[PropertyForm] Coordinate fetch failed');
          alert('Unable to get location coordinates automatically. Please check your address is correct and try again, or use the "Find on Map" or "Use My Location" buttons to set the location manually.');
          return; // Block navigation
        }
      } catch (error) {
        console.error('[PropertyForm] Error fetching coordinates:', error);
        alert('Unable to get location coordinates. Please check your address and try again, or use the "Find on Map" or "Use My Location" buttons to set the location manually.');
        return; // Block navigation
      }
    } else {
      // Non-location step or coordinates already exist - validate normally
      if (!canProceedToNextStep()) {
        console.log('[PropertyForm] Navigation blocked - validation failed');
        
        // Get validation summary for user feedback
        const summary = getValidationSummary();
        const missingFields = summary?.invalidFields.map(f => f.name) || [];
        
        // Show user-friendly alert
        const fieldLabels = {
          propertyType: 'Property Type',
          bhkType: 'BHK Configuration',
          floor: 'Floor',
          totalFloors: 'Total Floors',
          propertyAge: 'Property Age',
          facing: 'Facing Direction',
          builtUpArea: 'Built-up Area',
          bathrooms: 'Bathrooms',
          address: 'Address',
          city: 'City',
          state: 'State',
          pinCode: 'PIN Code',
          locality: 'Locality',
          latitude: 'Latitude',
          longitude: 'Longitude',
          expectedPrice: 'Expected Price',
          maintenanceCost: 'Maintenance Cost',
          kitchenType: 'Kitchen Type',
          availableFrom: 'Available From',
          furnishing: 'Furnishing',
          parking: 'Parking'
        };

        const missingFieldLabels = missingFields.map(field => 
          fieldLabels[field as keyof typeof fieldLabels] || field
        );

        alert(`Please complete these required fields before proceeding:\n\n• ${missingFieldLabels.join('\n• ')}`);
        
        // Scroll to first missing field
        const firstMissingField = missingFields[0];
        if (firstMissingField) {
          const fieldElement = document.querySelector(`[name="${firstMissingField}"]`) || 
                              document.querySelector(`input[placeholder*="${firstMissingField}"]`) ||
                              document.querySelector(`select[name="${firstMissingField}"]`);
          
          if (fieldElement) {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              if ('focus' in fieldElement) {
                (fieldElement as HTMLElement).focus();
              }
            }, 500);
          }
        }
        
        return; // Block navigation
      }
    }

    // Validation passed - proceed to next step
    const nextStep = formStep + 1;
    const maxSteps = flowSteps.length;
    
    console.log('[PropertyForm] Validation passed, proceeding to next step:', {
      currentStep: formStep,
      nextStep,
      maxSteps
    });
    
    if (nextStep <= maxSteps) {
      setCurrentStep(nextStep);
      
      const urlFriendlyType = getURLFriendlyType(listingType);
      const stepName = flowSteps[nextStep - 1]?.id || 'details';
      const newUrl = `/properties/list/${category.toLowerCase()}/${urlFriendlyType}/${stepName}`;
      
      console.log('[PropertyForm] Navigating to next step:', {
        from: window.location.pathname,
        to: newUrl
      });
      
      navigate(newUrl, { replace: true });
    } else {
      console.log('[PropertyForm] Reached end of steps');
    }
  };

  // Previous step handler with proper URL construction
  const handlePreviousStepWithNavigation = () => {
    const prevStep = Math.max(formStep - 1, 1);
    
    console.log('[PropertyForm] handlePreviousStepWithNavigation:', {
      currentStep: formStep,
      prevStep
    });
    
    setCurrentStep(prevStep);
    
    const urlFriendlyType = getURLFriendlyType(listingType);
    const stepName = flowSteps[prevStep - 1]?.id || 'details';
    const newUrl = `/properties/list/${category.toLowerCase()}/${urlFriendlyType}/${stepName}`;
    
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
    originalHandleNextStep: handleNextStepWithValidation, // Use validation-enabled handler
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
      
      const cleanedData = cleanFormData(formData);
      
      cleanedData.flow = {
        category,
        listingType,
        flowType
      };
      
      if (!cleanedData.title) {
        cleanedData.title = `${category} ${listingType} Property`;
      }
      
      form.reset(cleanedData);
      
      await handleSaveAsDraft();
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

  // Get validation summary for step navigation component
  const validationSummary = getValidationSummary();
  const validationErrors = validationSummary ? validationSummary.invalidFields.map(f => f.label) : [];

  // Get mandatory fields for current step
  const mandatoryFields = updateMandatoryFieldsStatus(form, currentStepId);
  const completionStats = calculateCompletionStats(mandatoryFields);

  // Check if address has been modified for coordinate reset requirement
  const checkAddressModified = React.useCallback(() => {
    if (!isLocationStep || !locationDetailsRef.current) return false;
    
    const status = locationDetailsRef.current.getCoordinatesStatus();
    return !status.hasCoordinates && status.canAutoFetch;
  }, [isLocationStep]);

  // Enhanced validation logic for location steps
  const canProceedWithLocationLogic = React.useCallback(() => {
    // Always allow proceeding - let the Next button handle coordinate logic
    return true;
  }, []);

  // Check if coordinates are missing for internal logic
  const areCoordinatesMissing = React.useCallback(() => {
    if (!isLocationStep) return false;
    
    const summary = getValidationSummary();
    const missingFields = summary?.invalidFields.map(f => f.name) || [];
    
    return missingFields.some(field => field === 'latitude' || field === 'longitude');
  }, [isLocationStep, getValidationSummary]);

  // Create location context for StepNavigation
  const locationContext = React.useMemo(() => {
    if (!isLocationStep) return undefined;
    
    const summary = getValidationSummary();
    const missingFields = summary?.invalidFields.map(f => f.name) || [];
    const hasAddress = form.getValues(`steps.${currentStepId}.address`)?.trim() || '';
    
    return {
      isLocationStep: true,
      hasCoordinates: locationHasCoordinates,
      isFetchingCoordinates: locationIsFetching,
      onFindLocation: handleFindLocation,
      canAutoFetch: hasAddress || navigator.geolocation !== undefined,
      coordinatesMissing: areCoordinatesMissing()
    };
  }, [isLocationStep, locationHasCoordinates, locationIsFetching, handleFindLocation, getValidationSummary, form, currentStepId, areCoordinatesMissing]);

  console.log('[PropertyForm] Rendering with validation:', {
    currentStepId,
    stepIsValid,
    canProceed: canProceedToNextStep(),
    completionPercentage,
    validationErrors,
    stepValidationStatus,
    mandatoryFields,
    completionStats,
    isLocationStep,
    locationContext
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

        {/* Simplified FormNavigation without duplicate progress indicators */}
        <FormNavigation 
          currentStep={formStep} 
          onStepChange={(newStep) => {
            setCurrentStep(newStep);
            const urlFriendlyType = getURLFriendlyType(listingType);
            const stepName = flowSteps[newStep - 1]?.id || 'details';
            const newUrl = `/properties/list/${category.toLowerCase()}/${urlFriendlyType}/${stepName}`;
            navigate(newUrl, { replace: true });
          }}
          propertyId={effectivePropertyId}
          category={category}
          adType={listingType}
          steps={visibleSteps}
          stepValidationStatus={stepValidationStatus}
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
                ref={isLocationStep ? locationDetailsRef : undefined}
                onCoordinatesChange={isLocationStep ? handleCoordinatesChange : undefined}
              />
              
              {/* Enhanced Step Navigation with Location Context */}
              <StepNavigation 
                formStep={formStep}
                STEPS={flowSteps}
                handlePreviousStep={handlePreviousStepWithNavigation}
                handleNextStep={handleNextStepWithValidation}
                isLastStep={isReviewStep}
                disablePrevious={saving || saveInProgress}
                canProceed={canProceedWithLocationLogic()}
                isValidating={saving || saveInProgress}
                validationErrors={[]}
                completionPercentage={0}
                requiredFieldsRemaining={0}
                locationContext={locationContext}
                showProgress={false}
                showValidationSummary={false}
                size="md"
                variant="minimal"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default PropertyForm;