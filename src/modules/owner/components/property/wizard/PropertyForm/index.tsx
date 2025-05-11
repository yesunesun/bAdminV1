// src/modules/owner/components/property/wizard/PropertyForm/index.tsx
// Version: 6.6.0
// Last Modified: 11-05-2025 17:15 IST
// Purpose: Removed debugging components and added non-intrusive debug mode

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Import FLOW_TYPES directly from the flows module
import { usePropertyForm } from '../hooks/usePropertyForm';
import { FormData } from '../types'
import { STEPS } from '../constants'
import { FLOW_TYPES, FLOW_STEP_SEQUENCES } from '../constants/flows';

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
 
 // State for tracking custom save operation results
 const [saveInProgress, setSaveInProgress] = useState(false);
 const [propertyIdAfterSave, setPropertyIdAfterSave] = useState<string | null>(null);
 
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
     return FLOW_STEP_SEQUENCES.residential_pghostel;
   } else if (isCommercialRentMode) {
     return FLOW_STEP_SEQUENCES.commercial_rent;
   } else if (isCommercialSaleMode) {
     return FLOW_STEP_SEQUENCES.commercial_sale;
   } else if (isCoworkingMode) {
     return FLOW_STEP_SEQUENCES.commercial_coworking;
   } else if (isLandSaleMode) {
     return FLOW_STEP_SEQUENCES.land_sale;
   } else if (isFlatmatesMode) {
     return FLOW_STEP_SEQUENCES.residential_flatmates;
   } else if (derivedAdType?.toLowerCase() === 'sale' || derivedAdType?.toLowerCase() === 'sell') {
     return FLOW_STEP_SEQUENCES.residential_sale;
   } else {
     return FLOW_STEP_SEQUENCES.residential_rent;
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
   if (urlStep && flowSteps) {
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

 // Update propertyIdAfterSave when savedPropertyId changes
 useEffect(() => {
   if (savedPropertyId) {
     setPropertyIdAfterSave(savedPropertyId);
   }
 }, [savedPropertyId]);

 // Set initial step from URL
 useEffect(() => {
   if (initialStep > 1) {
     setCurrentStep(initialStep);
   }
 }, [initialStep, setCurrentStep]);

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

 // Enhanced save function that returns the property ID
 const enhancedSaveFunction = async (): Promise<string | undefined> => {
   setSaveInProgress(true);
   
   try {
     // Ensure minimal required data
     const formData = form.getValues();
     
     // Set flow information from URL if available
     const pathParts = window.location.pathname.split('/');
     const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
     const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
     
     if (urlPropertyType && !formData.flow_property_type) {
       formData.flow_property_type = urlPropertyType;
     }
     
     if (urlListingType && !formData.flow_listing_type) {
       formData.flow_listing_type = urlListingType;
     }
     
     // Make sure we have a title
     if (!formData.title) {
       if (formData.propertyType) {
         formData.title = `${formData.propertyType} Property`;
       } else {
         formData.title = "New Property";
       }
     }
     
     // Apply the form changes
     form.reset(formData);
     
     // Call the original save function
     await handleSaveAsDraft();
     
     // Wait a bit for the state to update
     await new Promise(resolve => setTimeout(resolve, 500));
     
     // Return the savedPropertyId or propertyId
     const effectivePropertyId = savedPropertyId || propertyId || propertyIdAfterSave;
     
     console.log("Enhanced save function complete, property ID:", effectivePropertyId);
     return effectivePropertyId;
   } catch (error) {
     console.error("Error in enhanced save function:", error);
     throw error;
   } finally {
     setSaveInProgress(false);
   }
 };
 
 // Direct save and navigate function with no popups
 const handleDirectSaveAndPublish = async (): Promise<string> => {
   try {
     setSaveInProgress(true);
     
     // Ensure minimal required data
     const formData = form.getValues();
     
     // Set flow information from URL if available
     const pathParts = window.location.pathname.split('/');
     const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
     const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
     
     if (urlPropertyType && !formData.flow_property_type) {
       formData.flow_property_type = urlPropertyType;
     }
     
     if (urlListingType && !formData.flow_listing_type) {
       formData.flow_listing_type = urlListingType;
     }
     
     // Make sure we have a title
     if (!formData.title) {
       if (formData.propertyType) {
         formData.title = `${formData.propertyType} Property`;
       } else {
         formData.title = "New Property";
       }
     }
     
     // Ensure we have a city
     if (!formData.city && !formData.locality) {
       formData.city = "Hyderabad";
     }
     
     // Make sure there's a description
     if (!formData.description) {
       formData.description = `${formData.title} - A quality property listing.`;
     }
     
     // Apply the form changes
     form.reset(formData);
     
     // Directly use handleSaveAndPublish
     const publishedPropertyId = await handleSaveAndPublish();
     
     console.log("Property published successfully with ID:", publishedPropertyId);
     
     if (!publishedPropertyId) {
       throw new Error("No property ID returned after publishing");
     }
     
     return publishedPropertyId;
   } catch (error) {
     console.error("Error in direct save and publish:", error);
     throw error;
   } finally {
     setSaveInProgress(false);
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
 
 // Determine the effective property ID for use in the UI
 const effectivePropertyId = savedPropertyId || propertyId || propertyIdAfterSave;
 
 // Check if current step is the review step - safely access flowSteps array
 const isReviewStep = flowSteps && flowSteps[formStep - 1] ? flowSteps[formStep - 1].id === 'review' : false;

 return (
   <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     <div className="bg-card rounded-xl shadow-lg">
       {/* Form Header with Status Indicator */}
       <FormHeader 
         status={status}
         handleAutoFill={handleAutoFill}
       />

       <div className="px-6 pt-4">
         <WizardBreadcrumbs
           category={effectiveCategory}
           adType={effectiveAdType}
           currentStep={flowSteps && flowSteps[formStep - 1] ? flowSteps[formStep - 1].label : ''}
         />
       </div>

       <FormNavigation 
         currentStep={formStep} 
         onStepChange={setCurrentStep}
         propertyId={effectivePropertyId}
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
             STEPS={flowSteps || STEPS}
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
             savedPropertyId={effectivePropertyId}
             handleImageUploadComplete={handleImageUploadComplete}
           />
           
           {/* Step Navigation (Previous/Next buttons) */}
           <StepNavigation 
             formStep={formStep}
             STEPS={flowSteps || STEPS}
             handlePreviousStep={safePreviousStep}
             handleNextStep={handleNextStep}
             savedPropertyId={effectivePropertyId}
             onSave={enhancedSaveFunction}
             onPublish={handleDirectSaveAndPublish} // Use our direct save function
             isLastStep={isReviewStep} // Flag to indicate this is the review step
             disablePrevious={saving || saveInProgress}
           />
         </div>
       </div>
     </div>
   </div>
 );
}

export default PropertyForm;