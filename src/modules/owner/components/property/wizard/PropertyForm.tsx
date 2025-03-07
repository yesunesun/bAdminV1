// src/modules/owner/components/property/wizard/PropertyForm.tsx
// Version: 3.1.0
// Last Modified: 07-03-2025 14:45 IST
// Purpose: Fixed navigation between tabs for sale properties

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Wand2, PencilLine, CheckCircle } from 'lucide-react';
import { FormData } from './types';
import { STEPS } from './constants';
import { PropertyDetails } from './sections/PropertyDetails';
import { LocationDetails } from './sections/LocationDetails';
import { RentalDetails } from './sections/RentalDetails';
import { SaleDetails } from './sections/SaleDetails';
import { AmenitiesSection } from './sections/AmenitiesSection';
import { ImageUploadSection } from './sections/ImageUploadSection';
import { PropertySummary } from './sections/PropertySummary';
import { FormNavigation } from './components/FormNavigation';
import PropertyTypeSelection from './components/PropertyTypeSelection';
import WizardBreadcrumbs from './components/WizardBreadcrumbs';
import { usePropertyForm } from './hooks/usePropertyForm';

// Function to debug form data
const debugFormData = (form: any) => {
  console.log('=========== DEBUG: CURRENT FORM STATE ===========');
  
  if (!form || typeof form.getValues !== 'function') {
    console.error('Form is not properly initialized for debugging');
    return;
  }
  
  const values = form.getValues();
  console.log('Current form values:', values);
  
  const isFormSale = 
    values.listingType?.toLowerCase() === 'sale' || 
    values.listingType?.toLowerCase() === 'sell' ||
    values.isSaleProperty === true ||
    values.propertyPriceType === 'sale';
  
  console.log('Form is for sale property:', isFormSale);
  
  if (isFormSale) {
    console.log('Sale-specific form values:', {
      expectedPrice: values.expectedPrice,
      maintenanceCost: values.maintenanceCost,
      kitchenType: values.kitchenType,
      priceNegotiable: values.priceNegotiable,
      isSaleProperty: values.isSaleProperty,
      propertyPriceType: values.propertyPriceType
    });
  } else {
    console.log('Rental-specific form values:', {
      rentalType: values.rentalType,
      rentAmount: values.rentAmount,
      securityDeposit: values.securityDeposit,
      rentNegotiable: values.rentNegotiable
    });
  }
  
  console.log('=========== DEBUG: CURRENT FORM STATE END ===========');
};

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
    console.log('=========== DEBUG: PROPERTY FORM INITIALIZATION ===========');
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
        isSaleProperty: initialData.isSaleProperty,
        propertyPriceType: initialData.propertyPriceType,
        expectedPrice: initialData.expectedPrice,
        maintenanceCost: initialData.maintenanceCost
      });
    }
    console.log('=========== DEBUG: PROPERTY FORM INITIALIZATION END ===========');
  }, [initialData, propertyId, mode, initialStatus, passedCategory, passedAdType, derivedCategory, derivedAdType, urlStep]);

  // Determine initial step from URL or default to 1
  const initialStep = useMemo(() => {
    if (urlStep) {
      const stepIndex = STEPS.findIndex(s => s.id === urlStep) + 1;
      return stepIndex > 0 ? stepIndex : 1;
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

  // For debugging 
  useEffect(() => {
    console.log('=========== DEBUG: FORM NAVIGATION ===========');
    console.log('Current form step:', formStep);
    console.log('Step ID:', STEPS[formStep - 1]?.id);
    console.log('Form values sample:', {
      propertyType: form.getValues('propertyType'),
      listingType: form.getValues('listingType'),
      bhkType: form.getValues('bhkType'),
      locality: form.getValues('locality'),
      expectedPrice: form.getValues('expectedPrice'),
      maintenanceCost: form.getValues('maintenanceCost')
    });
    console.log('=========== DEBUG: FORM NAVIGATION END ===========');
  }, [formStep, form]);

  // Enhanced isSaleMode detection with extensive debugging
  const isSaleMode = useMemo(() => {
    // First check from the usePropertyForm hook's determination
    if (formIsSaleMode !== undefined) {
      return formIsSaleMode;
    }
    
    // Get the most up-to-date form values
    const formValues = form.getValues();
    
    // Check multiple indicators for sale mode
    const indicators = {
      // Check listing type from props
      derivedAdType: (derivedAdType?.toLowerCase() === 'sale' || derivedAdType?.toLowerCase() === 'sell'),
      
      // Check listing type from form
      formListingType: (formValues.listingType?.toLowerCase() === 'sale' || formValues.listingType?.toLowerCase() === 'sell'),
      
      // Check explicit sale property flags
      isSalePropertyFlag: formValues.isSaleProperty === true,
      propertyPriceTypeFlag: formValues.propertyPriceType === 'sale',
      
      // Check if expectedPrice exists but rentAmount doesn't
      hasExpectedPriceOnly: !!(formValues.expectedPrice && !formValues.rentAmount)
    };
    
    // If ANY indicator is true, consider it a sale property
    const result = Object.values(indicators).some(indicator => indicator === true);
    
    console.log('Sale mode indicators:', indicators);
    console.log('Final sale mode determination:', result);
    
    return result;
  }, [derivedAdType, form, formIsSaleMode]);

  // Debug sale mode detection
  useEffect(() => {
    console.log('=========== DEBUG: SALE MODE DETECTION ===========');
    console.log('Sale mode sources:', {
      formIsSaleMode,
      derivedAdType: derivedAdType?.toLowerCase(),
      formListingType: form.getValues('listingType')?.toLowerCase(),
      isSalePropertyFlag: form.getValues('isSaleProperty'),
      propertyPriceType: form.getValues('propertyPriceType'),
      resultingIsSaleMode: isSaleMode
    });
    console.log('=========== DEBUG: SALE MODE DETECTION END ===========');
  }, [isSaleMode, derivedAdType, form, formIsSaleMode]);

  // Custom handleNextStep function that properly handles tab navigation for sale properties
  const handleNextStep = () => {
    console.log('=========== DEBUG: CUSTOM NEXT STEP HANDLER ===========');
    const currentStepId = STEPS[formStep - 1]?.id;
    console.log('Current step ID:', currentStepId);
    console.log('Is sale mode:', isSaleMode);
    
    // If we're on the Location step and this is a sale property,
    // we should skip the Rental tab and go directly to Sale Details
    if (currentStepId === 'location' && isSaleMode) {
      console.log('Sale property detected, skipping rental tab, going to sale details');
      // Find the index of the sale step
      const saleStepIndex = STEPS.findIndex(step => step.id === 'sale');
      if (saleStepIndex !== -1) {
        setCurrentStep(saleStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', saleStepIndex + 1);
        return;
      }
    }
    
    // If we're on the Location step and this is a rental property,
    // we should skip the Sale tab and go directly to Rental Details
    if (currentStepId === 'location' && !isSaleMode) {
      console.log('Rental property detected, skipping sale tab, going to rental details');
      // Find the index of the rental step
      const rentalStepIndex = STEPS.findIndex(step => step.id === 'rental');
      if (rentalStepIndex !== -1) {
        setCurrentStep(rentalStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', rentalStepIndex + 1);
        return;
      }
    }
    
    // If we're on the Rental tab and this is a sale property,
    // we should skip to Features
    if (currentStepId === 'rental' && isSaleMode) {
      console.log('Sale property on rental tab, skipping to features');
      // Find the index of the features step
      const featuresStepIndex = STEPS.findIndex(step => step.id === 'features');
      if (featuresStepIndex !== -1) {
        setCurrentStep(featuresStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', featuresStepIndex + 1);
        return;
      }
    }
    
    // If we're on the Sale tab and this is a rental property,
    // we should skip to Features
    if (currentStepId === 'sale' && !isSaleMode) {
      console.log('Rental property on sale tab, skipping to features');
      // Find the index of the features step
      const featuresStepIndex = STEPS.findIndex(step => step.id === 'features');
      if (featuresStepIndex !== -1) {
        setCurrentStep(featuresStepIndex + 1); // +1 because step indices are 1-based
        console.log('Setting current step to:', featuresStepIndex + 1);
        return;
      }
    }
    
    // In other cases, proceed with normal next step
    console.log('Using default next step behavior');
    originalHandleNextStep();
    console.log('=========== DEBUG: CUSTOM NEXT STEP HANDLER END ===========');
  };

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

  // Function to handle debug button click
  const handleDebugClick = () => {
    debugFormData(form);
  };
  
  // Get visible steps based on property type
  const getVisibleSteps = () => {
    return STEPS.map(step => ({
      ...step,
      // Hide rental tab for sale properties and vice versa
      hidden: (step.id === 'rental' && isSaleMode) || (step.id === 'sale' && !isSaleMode)
    }));
  };

  // If user is not logged in, show login prompt
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

  // Function to get correct step content based on the current tab ID
  const getStepContent = () => {
    // Get the current step ID
    const currentStepId = STEPS[formStep - 1]?.id;
    
    console.log('=========== DEBUG: RENDERING STEP CONTENT ===========');
    console.log('Current step ID:', currentStepId);
    console.log('Form mode detection:', {
      effectiveAdType,
      isSaleMode,
      listingType: form.getValues('listingType'),
      isSaleProperty: form.getValues('isSaleProperty'),
      propertyPriceType: form.getValues('propertyPriceType')
    });
    
    // Match content based on step ID 
    switch (currentStepId) {
      case 'details':
        return (
          <PropertyDetails 
            form={form} 
            mode={mode} 
            category={effectiveCategory}
            adType={effectiveAdType}
          />
        );
      
      case 'location':
        return (
          <LocationDetails 
            form={form} 
            selectedCity={selectedCity || initialData?.locality || ''}
          />
        );
      
      case 'rental':
        // CRITICAL: This is for the RENTAL tab - we show rental details when NOT in sale mode
        if (isSaleMode) {
          console.log('Current tab is rental but property is for sale, showing not applicable message');
          return (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">This section is not applicable for sale properties.</p>
            </div>
          );
        }
        
        console.log('Showing rental details for rental property');
        return (
          <RentalDetails 
            form={form}
            adType={effectiveAdType}
          />
        );
      
      case 'sale':
        // CRITICAL: This is for the SALE tab - we show sale details when IN sale mode
        if (!isSaleMode) {
          console.log('Current tab is sale but property is for rent, showing not applicable message');
          return (
            <div className="py-6 text-center">
              <p className="text-muted-foreground">This section is not applicable for rental properties.</p>
            </div>
          );
        }
        
        console.log('Showing sale details for sale property:', {
          expectedPrice: form.getValues('expectedPrice'),
          maintenanceCost: form.getValues('maintenanceCost')
        });
        
        return (
          <SaleDetails 
            form={form}
            adType={effectiveAdType}
          />
        );
      
      case 'features':
        return (
          <AmenitiesSection 
            form={form}
            category={effectiveCategory}
          />
        );
      
      case 'review':
        return (
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
        );
      
      case 'photos':
        return (
          <ImageUploadSection
            propertyId={savedPropertyId || propertyId!}
            onUploadComplete={handleImageUploadComplete}
            onPrevious={handlePreviousStep}
          />
        );
      
      default:
        console.error('Unknown step ID:', currentStepId);
        return null;
    }
  };

  // Function to debug flat/plot number
  const debugFlatPlotNo = () => {
    const formValues = form.getValues();
    console.log('=========== DEBUG: FLAT/PLOT NUMBER ===========');
    console.log('Flat/Plot No value:', formValues.flatPlotNo);
    console.log('Form values related to address:', {
      address: formValues.address,
      flatPlotNo: formValues.flatPlotNo,
      locality: formValues.locality,
      pinCode: formValues.pinCode
    });
    console.log('=========== DEBUG: FLAT/PLOT NUMBER END ===========');
  };

  // Function to force reload form values
  const reloadFormValues = () => {
    const formValues = form.getValues();
    console.log('=========== DEBUG: RELOADING FORM VALUES ===========');
    console.log('Current form values:', formValues);
    
    // Force form to rerender by setting key fields
    if (isSaleMode) {
      console.log('Reloading sale property fields');
      form.setValue('expectedPrice', formValues.expectedPrice || '', { shouldDirty: true });
      form.setValue('maintenanceCost', formValues.maintenanceCost || '', { shouldDirty: true });
      form.setValue('kitchenType', formValues.kitchenType || '', { shouldDirty: true });
    } else {
      console.log('Reloading rental property fields');
      form.setValue('rentAmount', formValues.rentAmount || '', { shouldDirty: true });
      form.setValue('securityDeposit', formValues.securityDeposit || '', { shouldDirty: true });
    }
    
    console.log('=========== DEBUG: RELOADING FORM VALUES END ===========');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-xl shadow-lg">
        <div className="p-3 border-b border-border">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {process.env.NODE_ENV === 'development' && (
                <>
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
                  <button
                    type="button"
                    onClick={handleDebugClick}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-sm font-medium rounded-lg",
                      "bg-info text-info-foreground",
                      "hover:bg-info/90 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                    )}
                  >
                    <span className="mr-1.5">🐞</span>
                    Debug
                  </button>
                </>
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
          steps={getVisibleSteps()}
        />

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 p-3 rounded-xl">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {getStepContent()}
            
            {/* Only show navigation buttons for steps that need them */}
            {(STEPS[formStep - 1]?.id !== 'review' && STEPS[formStep - 1]?.id !== 'photos') && (
              <div className="flex justify-between pt-6 border-t border-border">
                {formStep > 1 ? (
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
                ) : (
                  <div />
                )}
                
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}