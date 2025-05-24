// src/modules/owner/components/property/wizard/PropertyForm/index.tsx
// Version: 10.2.0
// Last Modified: 25-05-2025 18:15 IST
// Purpose: Fixed React hooks violations by ensuring consistent hook order and proper null checks

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
import { FormNavigation } from '../components/FormNavigation';
import FormDataDebug from '../components/FormDataDebug';

// Hooks
import { useStepNavigation } from './hooks/useStepNavigation';

// Utils
import { cleanFormData } from '../utils/formCleaningUtils';

import { useFormDataChangeTracking } from '../hooks/useFormDataChangeTracking';

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

// Export as both named export and default export for backward compatibility
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
 console.log('[PropertyForm] Initializing with props:', {
   initialData: initialData ? { ...initialData, steps: Object.keys(initialData.steps || {}) } : undefined,
   propertyId,
   initialStatus,
   showTypeSelection,
   passedCategory,
   passedAdType,
   urlStep,
   path: window.location.pathname
 });
 
 const navigate = useNavigate();

 // CRITICAL FIX: Always call ALL hooks in the EXACT SAME ORDER every time
 // This is the most important fix to prevent React hooks order violations
 
 // 1. State hooks - ALWAYS called first in same order
 const [saveInProgress, setSaveInProgress] = useState(false);
 const [propertyIdAfterSave, setPropertyIdAfterSave] = useState<string | null>(null);
 const [selectedCity, setSelectedCity] = useState<string>(initialData?.locality || '');
 const [showTypeSelectionState, setShowTypeSelectionState] = useState(
   showTypeSelection || (!passedCategory && !passedAdType)
 );

 // 2. Memoized values - ALWAYS called in same order
 const derivedCategory = useMemo(() => {
   const result = passedCategory;
   console.log('[PropertyForm] Derived category:', result, { passedCategory });
   return result;
 }, [passedCategory]);
 
 const derivedAdType = useMemo(() => {
   const result = passedAdType;
   console.log('[PropertyForm] Derived ad type:', result, { passedAdType });
   return result;
 }, [passedAdType]);

 // 3. Mode detection memos - ALWAYS called in same order
 const isPGHostelMode = useMemo(() => {
   if (derivedAdType) {
     return derivedAdType.toLowerCase() === 'pghostel';
   }
   const urlPath = window.location.pathname.toLowerCase();
   return urlPath.includes('pghostel');
 }, [derivedAdType]);
 
 const isCommercialRentMode = useMemo(() => {
   if (derivedAdType && derivedCategory) {
     const isCommercialType = derivedAdType.toLowerCase() === 'commercialrent' || 
                             (derivedAdType.toLowerCase() === 'rent' && 
                              derivedCategory.toLowerCase() === 'commercial');
     return isCommercialType;
   }
   const urlPath = window.location.pathname.toLowerCase();
   return urlPath.includes('commercial') && (urlPath.includes('rent') || urlPath.includes('lease'));
 }, [derivedAdType, derivedCategory]);
 
 const isCommercialSaleMode = useMemo(() => {
   if (derivedAdType && derivedCategory) {
     const isCommercialSaleType = (derivedAdType.toLowerCase() === 'sale' || 
                                 derivedAdType.toLowerCase() === 'sell') && 
                                derivedCategory.toLowerCase() === 'commercial';
     return isCommercialSaleType;
   }
   const urlPath = window.location.pathname.toLowerCase();
   return urlPath.includes('commercial') && (urlPath.includes('sale') || urlPath.includes('sell'));
 }, [derivedAdType, derivedCategory]);
 
 const isCoworkingMode = useMemo(() => {
   if (derivedAdType && derivedCategory) {
     const isCoworkingType = derivedAdType.toLowerCase() === 'coworking' && 
                           derivedCategory.toLowerCase() === 'commercial';
     const isCoworkingAdType = derivedAdType.toLowerCase() === 'coworking';
     const result = isCoworkingType || isCoworkingAdType;
     
     console.log('[PropertyForm] Coworking detection:', result, {
       derivedAdType,
       derivedCategory,
       isCoworkingType,
       isCoworkingAdType
     });
     
     return result;
   }
   const urlPath = window.location.pathname.toLowerCase();
   const pathHasCoworking = urlPath.includes('coworking') || urlPath.includes('co-working');
   console.log('[PropertyForm] Coworking detection (URL):', pathHasCoworking, { urlPath });
   return pathHasCoworking;
 }, [derivedAdType, derivedCategory]);
 
 const isLandSaleMode = useMemo(() => {
   if (derivedCategory) {
     const isLandType = derivedCategory.toLowerCase() === 'land';
     const result = isLandType;
     console.log('[PropertyForm] Land sale detection (category):', result, {
       derivedCategory,
       isLandType
     });
     return result;
   }
   const urlPath = window.location.pathname.toLowerCase();
   const pathHasLand = urlPath.includes('land') || urlPath.includes('plot');
   console.log('[PropertyForm] Land sale detection (URL):', pathHasLand, { urlPath });
   return pathHasLand;
 }, [derivedCategory]);
 
 const isFlatmatesMode = useMemo(() => {
   if (derivedAdType && derivedCategory) {
     const isFlatmatesType = derivedAdType.toLowerCase() === 'flatmates' && 
                           derivedCategory.toLowerCase() === 'residential';
     return isFlatmatesType;
   }
   const urlPath = window.location.pathname.toLowerCase();
   return urlPath.includes('flatmate');
 }, [derivedAdType, derivedCategory]);

 // 4. Flow steps memo - ALWAYS called in same order
 const flowSteps = useMemo(() => {
   // FIXED: Always return a valid array to prevent undefined.length errors
   if (!derivedCategory || !derivedAdType) {
     console.log('[PropertyForm] Missing required parameters, returning empty array');
     return []; // Return empty array instead of null
   }
   
   let result;
   
   if (isPGHostelMode) {
     result = FLOW_STEP_SEQUENCES.residential_pghostel;
   } else if (isCommercialRentMode) {
     result = FLOW_STEP_SEQUENCES.commercial_rent;
   } else if (isCommercialSaleMode) {
     result = FLOW_STEP_SEQUENCES.commercial_sale;
   } else if (isCoworkingMode) {
     result = FLOW_STEP_SEQUENCES.commercial_coworking;
   } else if (isLandSaleMode) {
     result = FLOW_STEP_SEQUENCES.land_sale;
   } else if (isFlatmatesMode) {
     result = FLOW_STEP_SEQUENCES.residential_flatmates;
   } else if (derivedAdType?.toLowerCase() === 'sale' || derivedAdType?.toLowerCase() === 'sell') {
     result = FLOW_STEP_SEQUENCES.residential_sale;
   } else if (derivedAdType?.toLowerCase() === 'rent') {
     result = FLOW_STEP_SEQUENCES.residential_rent;
   } else {
     // Return empty array instead of null to prevent hooks violations
     console.log('[PropertyForm] Invalid property type combination, returning empty array');
     return [];
   }
   
   // FIXED: Ensure result is always an array
   if (!Array.isArray(result)) {
     console.warn('[PropertyForm] Flow steps result is not an array, returning empty array');
     return [];
   }
   
   console.log('[PropertyForm] Determined flow steps:', result?.map(step => step.id), {
     isPGHostelMode,
     isCommercialRentMode,
     isCommercialSaleMode,
     isCoworkingMode,
     isLandSaleMode,
     isFlatmatesMode,
     derivedAdType
   });
   
   return result;
 }, [
   derivedCategory,
   derivedAdType, 
   isPGHostelMode, 
   isCommercialRentMode, 
   isCommercialSaleMode, 
   isCoworkingMode, 
   isLandSaleMode, 
   isFlatmatesMode
 ]);

 // 5. Initial step memo - ALWAYS called in same order
 const initialStep = useMemo(() => {
   if (urlStep && flowSteps && flowSteps.length > 0) {
     const stepIndex = flowSteps.findIndex(s => s.id === urlStep) + 1;
     return stepIndex > 0 ? stepIndex : 1;
   }
   return 1;
 }, [urlStep, flowSteps]);

 // 6. CRITICAL: ALWAYS call usePropertyForm hook - this maintains consistent hooks order
 // The hook itself handles invalid parameters internally, so we always call it
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
   mode: 'create', // Always create mode
   status: initialStatus,
   propertyCategory: derivedCategory,
   adType: derivedAdType,
   city: selectedCity || initialData?.locality || ''
 });

 // 7. CRITICAL: ALWAYS call useFormDataChangeTracking hook after usePropertyForm
 // This maintains consistent hooks order and prevents violations
 useFormDataChangeTracking(form);

 // 8. CRITICAL: ALWAYS call useStepNavigation hook last
 // This ensures all hooks are called in the same order every time
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
   STEPS: flowSteps // Always pass flowSteps (never null/undefined)
 });

 // NOW that all hooks have been called, we can do conditional logic and early returns
 
 // Check if we need type selection
 const needsTypeSelection = !passedCategory || !passedAdType || flowSteps.length === 0;
 
 if (needsTypeSelection && !showTypeSelection) {
   console.log('[PropertyForm] Missing category/adType, forcing type selection');
   return (
     <PropertyTypeSelection 
       onNext={(category: string, adType: string, city: string) => {
         if (onTypeSelect) {
           onTypeSelect(category, adType, city);
         } else {
           const path = `/properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/details`;
           console.log('[PropertyForm] Navigating to:', path);
           navigate(path);
         }
       }}
       selectedCategory={passedCategory}
       selectedAdType={passedAdType}
     />
   );
 }

 // Check if form is properly initialized
 const shouldInitializeForm = flowSteps.length > 0 && form !== null;

 // Force update flow type and category on initialization - only if form exists
 useEffect(() => {
   if (!form || !shouldInitializeForm) return;
   
   // Make sure we're actually in a specific detected mode that needs the correct flow
   if (isLandSaleMode || isCoworkingMode) {
     console.log(`[PropertyForm] Special mode detected (Land Sale: ${isLandSaleMode}, Coworking: ${isCoworkingMode}), updating flow data`);
     
     try {
       const formData = form.getValues();
       console.log('[PropertyForm] Current form data before flow update:', formData);
       
       // Clean the form data first
       const cleanedData = cleanFormData(formData);
       
       // Set the correct flow values
       if (isLandSaleMode) {
         cleanedData.flow = {
           category: 'land',
           listingType: 'sale',
           flowType: 'land_sale'
         };
         
         // Also update root level values
         cleanedData.category = 'land';
         cleanedData.listingType = 'sale';
         cleanedData.propertyType = 'land';
         cleanedData.adType = 'sale';
         
         console.log("[PropertyForm] Set Land Sale flow data");
       } else if (isCoworkingMode) {
         cleanedData.flow = {
           category: 'commercial',
           listingType: 'coworking',
           flowType: 'commercial_coworking'
         };
         
         // Also update root level values
         cleanedData.category = 'commercial';
         cleanedData.listingType = 'coworking';
         cleanedData.propertyType = 'commercial';
         cleanedData.adType = 'coworking';
         
         console.log("[PropertyForm] Set Coworking flow data");
       }
       
       // Reset with updated data
       form.reset(cleanedData);
       
       console.log("[PropertyForm] Initialized form with updated flow data:", cleanedData);
     } catch (error) {
       console.error("[PropertyForm] Error updating flow on init:", error);
     }
   }
 }, [form, shouldInitializeForm, isLandSaleMode, isCoworkingMode]);

 // Update propertyIdAfterSave when savedPropertyId changes
 useEffect(() => {
   if (savedPropertyId) {
     setPropertyIdAfterSave(savedPropertyId);
   }
 }, [savedPropertyId]);

 // Set initial step from URL - only if form exists
 useEffect(() => {
   if (shouldInitializeForm && setCurrentStep && initialStep > 1) {
     setCurrentStep(initialStep);
   }
 }, [shouldInitializeForm, initialStep, setCurrentStep]);

 // Log when the navigation hook properties change
 useEffect(() => {
   console.log('[PropertyForm] Step navigation properties:', {
     isSaleMode,
     detectedPGHostelMode,
     detectedCommercialRentMode,
     detectedCommercialSaleMode,
     detectedCoworkingMode,
     detectedLandSaleMode,
     detectedFlatmatesMode,
     visibleSteps: getVisibleSteps()?.map(step => step.id)
   });
 }, [
   isSaleMode,
   detectedPGHostelMode,
   detectedCommercialRentMode,
   detectedCommercialSaleMode,
   detectedCoworkingMode,
   detectedLandSaleMode,
   detectedFlatmatesMode,
   getVisibleSteps
 ]);

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
   if (!form || !shouldInitializeForm) {
     console.warn('[PropertyForm] Cannot save - form not initialized');
     return undefined;
   }
   
   setSaveInProgress(true);
   
   try {
     // Ensure minimal required data
     const formData = form.getValues();
     console.log('[PropertyForm] Form data before save:', formData);
     
     // Clean the form data to remove invalid sections
     const cleanedData = cleanFormData(formData);
     
     // Set flow information from URL if available
     const pathParts = window.location.pathname.split('/');
     const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
     const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
     
     console.log('[PropertyForm] URL path parts:', {
       pathParts,
       urlPropertyType,
       urlListingType
     });
     
     if (urlPropertyType && !cleanedData.flow_property_type) {
       cleanedData.flow_property_type = urlPropertyType;
     }
     
     if (urlListingType && !cleanedData.flow_listing_type) {
       cleanedData.flow_listing_type = urlListingType;
     }
     
     // Make sure we have a title
     if (!cleanedData.title) {
       if (cleanedData.propertyType) {
         cleanedData.title = `${cleanedData.propertyType} Property`;
       } else {
         cleanedData.title = "New Property";
       }
     }
     
     // Set correct flow for special modes
     if (isLandSaleMode) {
       console.log('[PropertyForm] Setting land sale flow before save');
       
       cleanedData.flow = {
         category: 'land',
         listingType: 'sale',
         flowType: 'land_sale'
       };
       
       // Also update root level values
       cleanedData.category = 'land';
       cleanedData.listingType = 'sale';
       cleanedData.propertyType = 'land';
       cleanedData.adType = 'sale';
     }
     else if (isCoworkingMode) {
       console.log('[PropertyForm] Setting coworking flow before save');
       
       cleanedData.flow = {
         category: 'commercial',
         listingType: 'coworking',
         flowType: 'commercial_coworking'
       };
       
       // Also update root level values
       cleanedData.category = 'commercial';
       cleanedData.listingType = 'coworking';
       cleanedData.propertyType = 'commercial';
       cleanedData.adType = 'coworking';
     }
     
     // Apply the form changes
     console.log('[PropertyForm] Resetting form with updated data before save:', cleanedData);
     form.reset(cleanedData);
     
     // Call the original save function
     console.log('[PropertyForm] Calling handleSaveAsDraft');
     await handleSaveAsDraft();
     
     // Wait a bit for the state to update
     await new Promise(resolve => setTimeout(resolve, 500));
     
     // Return the savedPropertyId or propertyId
     const effectivePropertyId = savedPropertyId || propertyId || propertyIdAfterSave;
     
     console.log("[PropertyForm] Enhanced save function complete, property ID:", effectivePropertyId);
     return effectivePropertyId;
   } catch (error) {
     console.error("[PropertyForm] Error in enhanced save function:", error);
     throw error;
   } finally {
     setSaveInProgress(false);
   }
 };

 // Function to handle type selection completion
 const handleTypeSelectionComplete = (category: string, adType: string, city: string) => {
   console.log('[PropertyForm] Type selection complete:', { category, adType, city });
   
   if (onTypeSelect) {
     onTypeSelect(category, adType, city);
   } else {
     // Ensure proper URL structure
     const path = `/properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/details`;
     console.log('[PropertyForm] Navigating to:', path);
     navigate(path);
   }
   
   setSelectedCity(city);
   setShowTypeSelectionState(false);
 };

 // Update showTypeSelectionState based on flowSteps
 useEffect(() => {
   setShowTypeSelectionState(
     showTypeSelection || (!derivedCategory && !derivedAdType) || flowSteps.length === 0
   );
 }, [showTypeSelection, derivedCategory, derivedAdType, flowSteps]);

 // If user is not logged in, show login prompt - only check if we have form data
 if (shouldInitializeForm && !user) {
   return <LoginPrompt onLoginClick={() => navigate('/login')} />;
 }

 // Show type selection if needed
 if (showTypeSelectionState || !shouldInitializeForm) {
   return (
     <PropertyTypeSelection 
       onNext={handleTypeSelectionComplete}
       selectedCategory={derivedCategory}
       selectedAdType={derivedAdType}
     />
   );
 }

 // Ensure we have category and type
 const effectiveCategory = derivedCategory || '';
 const effectiveAdType = derivedAdType || '';

 // Show error if missing required parameters instead of fallback
 if (!effectiveCategory || !effectiveAdType || !shouldInitializeForm) {
   return (
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="bg-card rounded-xl shadow-lg p-6">
         <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl">
           <h2 className="text-lg font-semibold text-destructive mb-2">Missing Property Information</h2>
           <p className="text-sm text-destructive/80">
             Unable to determine property type and listing option. Please go back and select a valid property type.
           </p>
           <button 
             onClick={() => navigate('/properties/list')}
             className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
           >
             Select Property Type
           </button>
         </div>
       </div>
     </div>
   );
 }

 // Get the filtered steps for the form navigation
 const visibleSteps = getVisibleSteps();

 // Determine the effective property ID for use in the UI
 const effectivePropertyId = savedPropertyId || propertyId || propertyIdAfterSave;

 // Check if current step is the review step - safely access flowSteps array
 const isReviewStep = flowSteps && flowSteps[formStep - 1] ? flowSteps[formStep - 1].id.includes('review') : false;

 console.log('[PropertyForm] Rendering with:', {
   effectiveCategory,
   effectiveAdType,
   isLandSaleMode,
   isCoworkingMode,
   formStep,
   currentStepId: flowSteps && flowSteps[formStep - 1] ? flowSteps[formStep - 1].id : 'unknown',
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
           category={effectiveCategory}
           adType={effectiveAdType}
           currentStep={flowSteps && flowSteps[formStep - 1] ? flowSteps[formStep - 1].label : ''}
         />
       </div>

       <FormNavigation 
         currentStep={formStep} 
         onStepChange={setCurrentStep}
         propertyId={effectivePropertyId}
         category={effectiveCategory}
         adType={effectiveAdType}
         steps={visibleSteps}
       />

       <div className="p-6">
         {/* Only show error message if NOT on the review step */}
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
               STEPS={flowSteps || STEPS}
               effectiveCategory={effectiveCategory}
               effectiveAdType={effectiveAdType}
               mode="create"
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
               isLastStep={isReviewStep}
               disablePrevious={saving || saveInProgress}
             />
           </div>
         </div>
       </div>
     </div>

     {/* FormDataDebug component - only visible in development environment */}
     {process.env.NODE_ENV === 'development' && (
       <FormDataDebug 
         form={form} 
         currentStepId={flowSteps && flowSteps[formStep - 1] ? flowSteps[formStep - 1].id : undefined}
         position="right"
       />
     )}
   </div>
 );
}

// Make sure to add this default export to fix compatibility with existing imports
export default PropertyForm;