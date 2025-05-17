// src/modules/owner/components/property/wizard/PropertyForm/index.tsx
// Version: 9.0.0
// Last Modified: 19-05-2025 14:30 IST
// Purpose: Removed all debugging components and related code

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

// Hooks
import { useStepNavigation } from './hooks/useStepNavigation';

// Utils
import { cleanFormData } from '../utils/formCleaningUtils';

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

// Export as both named export and default export for backward compatibility
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
 console.log('[PropertyForm] Initializing with props:', {
   initialData: initialData ? { ...initialData, steps: Object.keys(initialData.steps || {}) } : undefined,
   propertyId,
   mode,
   initialStatus,
   showTypeSelection,
   passedCategory,
   passedAdType,
   urlStep,
   path: window.location.pathname
 });
 
 const navigate = useNavigate();
 
 // State for tracking custom save operation results
 const [saveInProgress, setSaveInProgress] = useState(false);
 const [propertyIdAfterSave, setPropertyIdAfterSave] = useState<string | null>(null);
 
 // Extract property type and listing type from initialData if in edit mode
 const derivedCategory = useMemo(() => {
   const result = mode === 'edit' && initialData?.propertyType 
     ? initialData.propertyType 
     : passedCategory;
   
   console.log('[PropertyForm] Derived category:', result, {
     mode,
     'initialData?.propertyType': initialData?.propertyType,
     passedCategory
   });
   
   return result;
 }, [mode, initialData, passedCategory]);
 
 const derivedAdType = useMemo(() => {
   const result = mode === 'edit' && initialData?.listingType 
     ? initialData.listingType 
     : passedAdType;
   
   console.log('[PropertyForm] Derived ad type:', result, {
     mode,
     'initialData?.listingType': initialData?.listingType,
     passedAdType
   });
   
   return result;
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
   // Check if the ad type specifically indicates PG/Hostel
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
     
     // Also check if either of the keys indicates coworking
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
   
   // Check URL path for co-working keywords
   const urlPath = window.location.pathname.toLowerCase();
   const pathHasCoworking = urlPath.includes('coworking') || urlPath.includes('co-working');
   
   console.log('[PropertyForm] Coworking detection (URL):', pathHasCoworking, {
     urlPath
   });
   
   return pathHasCoworking;
 }, [derivedAdType, derivedCategory]);
 
 // Determine if we're in Land/Plot Sale mode
 const isLandSaleMode = useMemo(() => {
   // Check if the category indicates land
   if (derivedCategory) {
     const isLandType = derivedCategory.toLowerCase() === 'land';
     const result = isLandType;
     
     console.log('[PropertyForm] Land sale detection (category):', result, {
       derivedCategory,
       isLandType
     });
     
     return result;
   }
   
   // Check URL path for land keywords
   const urlPath = window.location.pathname.toLowerCase();
   const pathHasLand = urlPath.includes('land') || urlPath.includes('plot');
   
   console.log('[PropertyForm] Land sale detection (URL):', pathHasLand, {
     urlPath
   });
   
   return pathHasLand;
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
   } else {
     result = FLOW_STEP_SEQUENCES.residential_rent;
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

 // Force update flow type and category on initialization
 useEffect(() => {
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
 }, [form, isLandSaleMode, isCoworkingMode]);

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
 
 // Direct save and navigate function with no popups
 const handleDirectSaveAndPublish = async (): Promise<string> => {
   try {
     setSaveInProgress(true);
     
     // Ensure minimal required data
     const formData = form.getValues();
     console.log('[PropertyForm] Form data before publish:', formData);
     
     // Clean the form data to remove invalid sections
     const cleanedData = cleanFormData(formData);
     
     // Set flow information from URL if available
     const pathParts = window.location.pathname.split('/');
     const urlPropertyType = pathParts.length > 2 ? pathParts[pathParts.length - 3] : '';
     const urlListingType = pathParts.length > 2 ? pathParts[pathParts.length - 2] : '';
     
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
     
     // Ensure we have a city
     if (!cleanedData.city && !cleanedData.locality) {
       cleanedData.city = "Hyderabad";
     }
     
     // Make sure there's a description
     if (!cleanedData.description) {
       cleanedData.description = `${cleanedData.title} - A quality property listing.`;
     }
     
     // Set correct flow for Land Sale mode
     if (isLandSaleMode) {
       console.log('[PropertyForm] Setting land sale flow before publish');
       
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
       console.log('[PropertyForm] Setting coworking flow before publish');
       
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
     console.log('[PropertyForm] Resetting form with updated data before publish:', cleanedData);
     form.reset(cleanedData);
     
     // Directly use handleSaveAndPublish
     console.log('[PropertyForm] Calling handleSaveAndPublish');
     const publishedPropertyId = await handleSaveAndPublish();
     
     console.log("[PropertyForm] Property published successfully with ID:", publishedPropertyId);
     
     if (!publishedPropertyId) {
       throw new Error("No property ID returned after publishing");
     }
     
     return publishedPropertyId;
   } catch (error) {
     console.error("[PropertyForm] Error in direct save and publish:", error);
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
   console.error('[PropertyForm] Missing required parameters:', { 
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
         mode={mode}
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
               onPublish={handleDirectSaveAndPublish}
               isLastStep={isReviewStep}
               disablePrevious={saving || saveInProgress}
             />
           </div>
         </div>
       </div>
     </div>
   </div>
 );
}

// Make sure to add this default export to fix compatibility with existing imports
export default PropertyForm;