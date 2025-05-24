// src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts
// Version: 10.1.1
// Last Modified: 25-05-2025 19:45 IST
// Purpose: Fixed syntax error with duplicated function and removed invalid references

import { useMemo, useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { FormData } from '../../../types';
import { addFormAutofillHelpers, fillFormSection } from '../../utilities/formAutofill';

// Update imports to use the correct paths
import { 
  FLOW_TYPES, 
  FLOW_STEP_SEQUENCES, 
  createStepObjectsFromFlow 
} from '../../constants/flows';

import { STEP_DEFINITIONS } from '../../constants/common';

interface UseStepNavigationProps {
  form: UseFormReturn<FormData> | null;
  formStep: number;
  formIsSaleMode?: boolean;
  originalHandleNextStep: () => void;
  setCurrentStep: (step: number) => void;
  STEPS?: any[]; // Made optional since we'll use flows.ts instead
}

export function useStepNavigation({
  form,
  formStep,
  formIsSaleMode,
  originalHandleNextStep,
  setCurrentStep,
  STEPS = [] // Provide default empty array to prevent undefined errors
}: UseStepNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // FIXED: Add comprehensive safety checks for form access
  const safeGetFormValues = useCallback(() => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.warn('Form not available or getValues method missing');
        return {};
      }
      return form.getValues();
    } catch (error) {
      console.error('Error getting form values:', error);
      return {};
    }
  }, [form]);

  // FIXED: Generate steps array from flow-based step definitions if STEPS is empty
  const computedSteps = useMemo(() => {
    // Always ensure we have a valid array to prevent undefined.length errors
    if (STEPS && Array.isArray(STEPS) && STEPS.length > 0) {
      return STEPS; // Use provided STEPS if available
    }
    
    // Otherwise, generate from our flow-based system
    try {
      // Determine which flow type to use based on form data and URL
      const flowType = determineFlowType();
      
      // Get step sequence for this flow - ensure it exists
      const stepSequence = FLOW_STEP_SEQUENCES[flowType] || FLOW_STEP_SEQUENCES.residential_rent || [];
      
      // Ensure stepSequence is an array
      if (!Array.isArray(stepSequence)) {
        console.error('Step sequence is not an array:', stepSequence);
        return [];
      }
      
      // Convert to the format expected by the existing code
      return stepSequence.map(step => {
        // Find the step definition
        const stepDef = STEP_DEFINITIONS[step.id] || {
          id: step.id,
          title: step.label,
          icon: null,
          description: step.label
        };
        
        return {
          id: step.id,
          title: stepDef.title || step.label,
          icon: stepDef.icon,
          description: stepDef.description || step.label
        };
      });
    } catch (error) {
      console.error('Error generating computed steps:', error);
      return []; // Return empty array as fallback
    }
  }, [STEPS]);
  
  // FIXED: Determine the flow type based on form data and URL with comprehensive safety checks
  function determineFlowType() {
    try {
      // Get form data safely
      const formData = safeGetFormValues();
      const urlPath = window.location.pathname.toLowerCase();
      
      // Check for explicit flow info in form data
      const category = (formData.flow?.category || 'residential').toLowerCase();
      const listingType = (formData.flow?.listingType || 'rent').toLowerCase();
      
      // Detect specific flow types from URL and form data
      const isPGMode = urlPath.includes('pghostel') || urlPath.includes('/pg/') || 
                      (category === 'residential' && listingType === 'pghostel');
                      
      const isFlatmatesMode = urlPath.includes('flatmate') || 
                            (category === 'residential' && listingType === 'flatmates');
                            
      const isCoworkingMode = urlPath.includes('coworking') || urlPath.includes('co-working') || 
                            (category === 'commercial' && (listingType === 'coworking' || listingType === 'co-working'));
      
      const isLandMode = urlPath.includes('land') || urlPath.includes('plot') || 
                        category === 'land';
                        
      const isCommercialMode = category === 'commercial' || urlPath.includes('commercial');
      
      const isSaleMode = formIsSaleMode !== undefined ? formIsSaleMode : 
                        urlPath.includes('sale') || urlPath.includes('sell') || 
                        listingType === 'sale' || listingType === 'sell';
      
      // Determine flow type based on these checks
      if (isPGMode) return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
      if (isFlatmatesMode) return FLOW_TYPES.RESIDENTIAL_FLATMATES;
      if (isLandMode) return FLOW_TYPES.LAND_SALE;
      
      if (isCommercialMode) {
        if (isCoworkingMode) return FLOW_TYPES.COMMERCIAL_COWORKING;
        return isSaleMode ? FLOW_TYPES.COMMERCIAL_SALE : FLOW_TYPES.COMMERCIAL_RENT;
      }
      
      return isSaleMode ? FLOW_TYPES.RESIDENTIAL_SALE : FLOW_TYPES.RESIDENTIAL_RENT;
    } catch (error) {
      console.error('Error determining flow type:', error);
      return FLOW_TYPES.RESIDENTIAL_RENT; // Safe fallback
    }
  }

  // FIXED: Improved sale mode detection logic with comprehensive safety checks
  const isSaleMode = useMemo(() => {
    try {
      // Check explicit flag first
      if (formIsSaleMode !== undefined) {
        return formIsSaleMode;
      }
      
      // Safety check for form
      if (!form) return false;
      
      // Get current form values safely
      const formValues = safeGetFormValues();
      
      // Check flow data first
      if (formValues.flow?.listingType) {
        const listingType = formValues.flow.listingType.toLowerCase();
        return listingType === 'sale' || listingType === 'sell';
      }
      
      // Check legacy listingType - secondary indicator
      const listingType = formValues.listingType?.toLowerCase() || '';
      const isSaleFromListingType = listingType === 'sale' || listingType === 'sell';
      
      // Check URL path for keywords
      const urlPath = window.location.pathname.toLowerCase();
      const isSaleFromUrl = urlPath.includes('sale') || urlPath.includes('sell');
      
      // Determine final result with URL having higher priority
      const result = isSaleFromUrl || isSaleFromListingType;
      
      return result;
    } catch (error) {
      console.error('Error in isSaleMode calculation:', error);
      return false;
    }
  }, [form, formIsSaleMode, safeGetFormValues]);
  
  // FIXED: Enhanced PG/Hostel mode detection with comprehensive safety checks
  const isPGHostelMode = useMemo(() => {
    try {
      // Safety check for form
      if (!form) return false;
      
      // Check form values safely
      const formValues = safeGetFormValues();
      
      // Check flow data first
      if (formValues.flow?.category === 'residential' && formValues.flow?.listingType === 'pghostel') {
        return true;
      }
      
      // Check legacy fields
      const listingType = (formValues.listingType || '').toLowerCase();
      const propertyType = (formValues.propertyType || '').toLowerCase();
      
      // Check URL for PG/Hostel indicators
      const urlPath = window.location.pathname.toLowerCase();
      const isPGFromUrl = urlPath.includes('pghostel') || urlPath.includes('/pg/');
      
      // Combined check
      const result = listingType === 'pghostel' || 
                    propertyType === 'pghostel' || 
                    isPGFromUrl;
      
      return result;
    } catch (error) {
      console.error('Error in isPGHostelMode:', error);
      return false;
    }
  }, [form, safeGetFormValues]);
  
  // FIXED: Commercial Rent mode detection with comprehensive safety checks
  const isCommercialRentMode = useMemo(() => {
    try {
      // Safety check for form
      if (!form) return false;
      
      // Check form values safely
      const formValues = safeGetFormValues();
      
      // Check flow data first
      if (formValues.flow?.category === 'commercial' && formValues.flow?.listingType === 'rent') {
        return true;
      }
      
      // Check legacy fields
      const category = (formValues.propertyCategory || '').toLowerCase();
      const listingType = (formValues.listingType || '').toLowerCase();
      
      // Check URL for Commercial Rent indicators
      const urlPath = window.location.pathname.toLowerCase();
      const isCommercialFromUrl = urlPath.includes('commercial') && 
                               (urlPath.includes('rent') || urlPath.includes('lease'));
      
      // Check that it's not a commercial sale or co-working
      const isNotSale = !urlPath.includes('sale') && !urlPath.includes('sell');
      const isNotCoworking = !urlPath.includes('coworking') && !urlPath.includes('co-working');
      
      // Combined check - category must be commercial and listing type must be rent
      const result = ((category === 'commercial' && listingType === 'rent') || 
                     (isCommercialFromUrl && isNotSale && isNotCoworking));
      
      return result;
    } catch (error) {
      console.error('Error in isCommercialRentMode:', error);
      return false;
    }
  }, [form, safeGetFormValues]);
  
  // FIXED: Commercial Sale mode detection with comprehensive safety checks
  const isCommercialSaleMode = useMemo(() => {
    try {
      // Safety check for form
      if (!form) return false;
      
      // Check form values safely
      const formValues = safeGetFormValues();
      
      // Check flow data first
      if (formValues.flow?.category === 'commercial' && 
          (formValues.flow?.listingType === 'sale' || formValues.flow?.listingType === 'sell')) {
        return true;
      }
      
      // Check legacy fields
      const category = (formValues.propertyCategory || '').toLowerCase();
      const listingType = (formValues.listingType || '').toLowerCase();
      
      // Check URL for Commercial Sale indicators
      const urlPath = window.location.pathname.toLowerCase();
      const isCommercialSaleFromUrl = urlPath.includes('commercial') && 
                                    (urlPath.includes('sale') || urlPath.includes('sell'));
      
      // Combined check - category must be commercial and listing type must be sale
      const result = (category === 'commercial' && (listingType === 'sale' || listingType === 'sell')) || 
                     isCommercialSaleFromUrl;
      
      return result;
    } catch (error) {
      console.error('Error in isCommercialSaleMode:', error);
      return false;
    }
  }, [form, safeGetFormValues]);
  
  // FIXED: Commercial Co-working mode detection with comprehensive safety checks
  const isCoworkingMode = useMemo(() => {
    try {
      // Safety check for form
      if (!form) return false;
      
      // Check form values safely
      const formValues = safeGetFormValues();
      
      // Check flow data first
      if (formValues.flow?.category === 'commercial' && formValues.flow?.listingType === 'coworking') {
        return true;
      }
      
      // Check legacy fields
      const category = (formValues.propertyCategory || '').toLowerCase();
      const listingType = (formValues.listingType || '').toLowerCase();
      
      // Check URL for Co-working indicators
      const urlPath = window.location.pathname.toLowerCase();
      const isCoworkingFromUrl = urlPath.includes('coworking') || urlPath.includes('co-working');
      
      // Combined check - either from listingType or URL
      const result = (category === 'commercial' && (listingType === 'coworking' || listingType === 'co-working')) || 
                     isCoworkingFromUrl;
      
      return result;
    } catch (error) {
      console.error('Error in isCoworkingMode:', error);
      return false;
    }
  }, [form, safeGetFormValues]);
  
  // FIXED: Land/Plot Sale mode detection with comprehensive safety checks
  const isLandSaleMode = useMemo(() => {
    try {
      // Safety check for form
      if (!form) return false;
      
      // Check form values safely
      const formValues = safeGetFormValues();
      
      // Check flow data first
      if (formValues.flow?.category === 'land') {
        return true;
      }
      
      // Check legacy fields
      const category = (formValues.propertyCategory || '').toLowerCase();
      
      // Check URL for Land/Plot indicators
      const urlPath = window.location.pathname.toLowerCase();
      const isLandFromUrl = urlPath.includes('land') || urlPath.includes('plot');
      
      // Combined check
      const result = category === 'land' || isLandFromUrl;
      
      return result;
    } catch (error) {
      console.error('Error in isLandSaleMode:', error);
      return false;
    }
  }, [form, safeGetFormValues]);
  
  // FIXED: Residential Flatmates mode detection with comprehensive safety checks
  const isFlatmatesMode = useMemo(() => {
    try {
      // Safety check for form
      if (!form) return false;
      
      // Check form values safely
      const formValues = safeGetFormValues();
      
      // Check flow data first
      if (formValues.flow?.category === 'residential' && formValues.flow?.listingType === 'flatmates') {
        return true;
      }
      
      // Check legacy fields
      const category = (formValues.propertyCategory || '').toLowerCase();
      const listingType = (formValues.listingType || '').toLowerCase();
      
      // Check URL for Flatmates indicators
      const urlPath = window.location.pathname.toLowerCase();
      const isFlatmatesFromUrl = urlPath.includes('flatmate');
      
      // Combined check
      const result = (category === 'residential' && listingType === 'flatmates') || 
                     isFlatmatesFromUrl;
      
      return result;
    } catch (error) {
      console.error('Error in isFlatmatesMode:', error);
      return false;
    }
  }, [form, safeGetFormValues]);

  // FIXED: Get current step ID with comprehensive safety checks
  const getCurrentStepId = useCallback(() => {
    // Ensure computedSteps exists and is an array
    if (!computedSteps || !Array.isArray(computedSteps) || computedSteps.length === 0) {
      console.warn('computedSteps is not available or empty');
      return null;
    }
    
    if (formStep <= 0 || formStep > computedSteps.length) {
      console.warn(`formStep ${formStep} is out of bounds for computedSteps length ${computedSteps.length}`);
      return null;
    }
    
    const step = computedSteps[formStep - 1];
    return step?.id || null;
  }, [formStep, computedSteps]);
  
  // Auto-fill the form with test data for the current step
  const fillDemoData = useCallback(() => {
    const currentStepId = getCurrentStepId();
    console.log(`Auto-fill requested for step: ${currentStepId}`);
    
    if (!currentStepId || !form) return;
    
    // Map step IDs to section names in test-data.ts
    const sectionMap: Record<string, string> = {
      'room_details': 'room_details',
      'pg_details': 'pg_details',
      'commercial': 'commercial',
      'commercial_basics': 'commercial_basics',
      'commercial_sale': 'commercial_sale',
      'coworking': 'coworking',
      'land_details': 'land_details',
      'land_features': 'land_features',
      'flatmate_details': 'flatmate_details',
      'location': 'location',
      'details': 'basic',
      'rental': 'rental',
      'sale': 'sale',
      'features': 'amenities',
      'basicDetails': 'basic',
      'rentalDetails': 'rental',
      'saleDetails': 'sale'
    };
    
    const section = sectionMap[currentStepId];
    if (section) {
      fillFormSection(form, section as any);
    } else {
      console.log(`No test data section mapped for step: ${currentStepId}`);
    }
  }, [getCurrentStepId, form]);

  // Auto-fill helpers setup
  useEffect(() => {
    // Only add helpers if form exists
    if (!form) return;
    
    // Add global autofill helpers
    addFormAutofillHelpers(form);
    
    // Also expose the fillDemoData function for direct use
    (window as any).fillCurrentStep = fillDemoData;
    
    // Add keyboard shortcut for auto-fill (Alt+F)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'f') {
        console.log('Auto-fill triggered via keyboard shortcut (Alt+F)');
        fillDemoData();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      // Clean up
      delete (window as any).fillCurrentStep;
      delete (window as any).autoFill;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [form, fillDemoData]);

  // Map flow types to step sequences
  const stepSequences = useMemo(() => ({
    // PG/Hostel sequence
    pgHostel: ['room_details', 'location', 'pg_details', 'features', 'review', 'photos'],
    
    // Standard rental sequence
    rent: ['details', 'location', 'rental', 'features', 'review', 'photos'],
    
    // Sale sequence
    sale: ['details', 'location', 'sale', 'features', 'review', 'photos'],
    
    // Commercial Rent sequence - UPDATED to include initial details step before commercial_basics
    commercialRent: ['details', 'commercial_basics', 'location', 'rental', 'features', 'review', 'photos'],
    
    // Commercial Sale sequence
    commercialSale: ['details', 'location', 'commercial_sale', 'features', 'review', 'photos'],
    
    // Commercial Co-working sequence
    coworking: ['details', 'location', 'coworking', 'features', 'review', 'photos'],
    
    // Land/Plot Sale sequence
    landSale: ['land_details', 'location', 'land_features', 'review', 'photos'],
    
    // Residential Flatmates sequence
    flatmates: ['details', 'location', 'flatmate_details', 'features', 'review', 'photos']
  }), []);

  // Get the active sequence based on property type
  const getActiveSequence = useCallback(() => {
    if (isPGHostelMode) return stepSequences.pgHostel;
    if (isCommercialRentMode) return stepSequences.commercialRent;
    if (isCommercialSaleMode) return stepSequences.commercialSale;
    if (isCoworkingMode) return stepSequences.coworking;
    if (isLandSaleMode) return stepSequences.landSale;
    if (isFlatmatesMode) return stepSequences.flatmates;
    if (isSaleMode) return stepSequences.sale;
    return stepSequences.rent;
  }, [
    isPGHostelMode, 
    isCommercialRentMode, 
    isCommercialSaleMode, 
    isCoworkingMode, 
    isLandSaleMode, 
    isFlatmatesMode, 
    isSaleMode, 
    stepSequences
  ]);

  // FIXED: Extract property category and type from current URL with stable reference
  const getPropertyInfoFromUrl = useCallback(() => {
    const urlPath = location.pathname;
    const pathParts = urlPath.split('/').filter(part => part.length > 0);
    
    // Default values
    let category = 'residential';
    let type = 'rent';
    
    // Look for category and type in URL
    if (pathParts.includes('list')) {
      // Find index of 'list'
      const listIndex = pathParts.indexOf('list');
      
      // Category and type should follow 'list'
      if (pathParts.length > listIndex + 2) {
        category = pathParts[listIndex + 1];
        type = pathParts[listIndex + 2];
      }
    }
    
    console.log(`URL Info - Category: ${category}, Type: ${type}`);
    
    return { category, type };
  }, [location.pathname]);
  
  // FIXED: Memoize current location pathname to prevent unnecessary re-renders
  const currentPathname = useMemo(() => location.pathname, [location.pathname]);

  // FIXED: Function to update URL based on current flow and step with stable dependencies
  const updateUrlForStep = useCallback((stepId: string) => {
    try {
      if (!form || typeof form.getValues !== 'function') {
        console.error('Form not available for URL update');
        return;
      }
      
      // Log the current URL for debugging
      console.log('Current URL before update:', window.location.pathname);
      
      // Get property info from current URL first
      const { category, type } = getPropertyInfoFromUrl();
      
      // Extract necessary values from form as fallback
      const formValues = safeGetFormValues();
      
      // Use flow information from v3 data structure if available
      const formCategory = formValues.flow?.category || 
                          (formValues.propertyCategory || formValues.category || 'residential').toLowerCase();
                          
      let formType = formValues.flow?.listingType || 
                    (formValues.listingType || formValues.type || 'rent').toLowerCase();
      
      // Use URL values if they exist, otherwise fall back to form values
      const effectiveCategory = category || formCategory;
      let effectiveType = type || formType;
      
      // Determine correct type for URL based on flow detection
      if (isPGHostelMode) {
        effectiveType = 'pghostel';
      } else if (isFlatmatesMode) {
        effectiveType = 'flatmates';
      } else if (isCoworkingMode) {
        effectiveType = 'coworking';
      }
      
      // FIXED: Construct base URL preserving the original path structure
      let baseUrl = '';
      
      // For create mode, build a proper path based on the original URL
      // Check if we already have a full path structure in the current URL
      const urlPath = currentPathname;
      const hasProperListPrefix = urlPath.includes('/properties/list/');
      
      if (hasProperListPrefix) {
        // Extract base path up to the flow type
        const listPattern = /\/properties\/list\/([^\/]+)\/([^\/]+)/;
        const match = urlPath.match(listPattern);
        
        if (match) {
          // Get the current category and type
          const currentCategory = match[1];
          const currentType = match[2];
          
          // Use the same category and type to maintain consistency
          baseUrl = `/properties/list/${currentCategory}/${currentType}`;
        } else {
          // Fallback if pattern doesn't match
          baseUrl = `/properties/list/${effectiveCategory}/${effectiveType}`;
        }
      } else {
        // If we don't have a proper path, construct it from form values
        baseUrl = `/properties/list/${effectiveCategory}/${effectiveType}`;
      }
      
      // Construct and navigate to new URL
      const newUrl = `${baseUrl}/${stepId}`;
      console.log(`Navigating to create URL: ${newUrl}`);
      navigate(newUrl, { replace: true });
      
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  }, [
    form, 
    navigate, 
    currentPathname, 
    isPGHostelMode, 
    isFlatmatesMode, 
    isCoworkingMode, 
    getPropertyInfoFromUrl, 
    safeGetFormValues
  ]);

  // FIXED: Custom navigation function for all property flows with enhanced safety
  const handleNextStep = useCallback(() => {
    try {
      // Safety check - ensure we have valid form and steps
      if (!form || !computedSteps || !Array.isArray(computedSteps) || computedSteps.length === 0) {
        console.warn('Cannot navigate - form or steps not available');
        return;
      }
      
      const currentStepId = getCurrentStepId();
      
      // Enhanced debug information for navigation troubleshooting
      console.log(`Navigation - Current step: ${currentStepId} (${formStep}/${computedSteps.length})`);
      console.log(`Next button clicked - Property mode:`, {
        isPGHostelMode,
        isCommercialRentMode,
        isCommercialSaleMode,
        isCoworkingMode,
        isLandSaleMode,
        isFlatmatesMode,
        isSaleMode
      });
      
      // For specific flows, use explicit sequence
      if (isPGHostelMode || isCommercialRentMode || isCommercialSaleMode || 
          isCoworkingMode || isLandSaleMode || isFlatmatesMode) {
        const activeSequence = getActiveSequence();
        
        // Ensure activeSequence is valid
        if (!Array.isArray(activeSequence) || activeSequence.length === 0) {
          console.warn('Active sequence is not valid, falling back to original handler');
          originalHandleNextStep();
          return;
        }
        
        const currentIndex = activeSequence.indexOf(currentStepId);
        
        console.log(`Flow Navigation - Current index in sequence: ${currentIndex}, Sequence:`, activeSequence);
        
        // If found and not at the end, get next step
        if (currentIndex !== -1 && currentIndex < activeSequence.length - 1) {
          const nextStepId = activeSequence[currentIndex + 1];
          
          // Find index in computedSteps array
          const nextStepIndex = computedSteps.findIndex(step => step && step.id === nextStepId);
          
          console.log(`Flow Navigation - Next step ID: ${nextStepId}, Index: ${nextStepIndex}`);
          
          if (nextStepIndex !== -1) {
            // Set the next step (adding 1 because formStep is 1-indexed)
            console.log(`Setting current step to: ${nextStepIndex + 1}`);
            
            // First update the URL before changing the step state
            updateUrlForStep(nextStepId);
            
            // Then set the next step
            setCurrentStep(nextStepIndex + 1);
            return;
          }
        }
      }
      
      // For other flows, determine the next step
      const nextStepIndex = Math.min(formStep + 1, computedSteps.length);
      const nextStep = computedSteps[nextStepIndex - 1];
      const nextStepId = nextStep?.id;
      
      if (nextStepId) {
        // First update the URL
        updateUrlForStep(nextStepId);
      }
      
      // Then use original handler
      originalHandleNextStep();
      
    } catch (error) {
      console.error('Error in handleNextStep:', error);
      // Fall back to original handler
      originalHandleNextStep();
    }
  }, [
    form,
    computedSteps,
    getCurrentStepId, 
    formStep, 
    isPGHostelMode, 
    isCommercialRentMode, 
    isCommercialSaleMode, 
    isCoworkingMode, 
    isLandSaleMode, 
    isFlatmatesMode, 
    isSaleMode, 
    getActiveSequence, 
    originalHandleNextStep, 
    setCurrentStep,
    updateUrlForStep
  ]);

  // FIXED: Handle Previous button click with enhanced safety
  const handlePreviousStep = useCallback(() => {
    try {
      // Safety check - ensure we have valid form and steps
      if (!form || !computedSteps || !Array.isArray(computedSteps) || computedSteps.length === 0) {
        console.warn('Cannot navigate - form or steps not available');
        return;
      }
      
      const currentStepId = getCurrentStepId();
      
      console.log(`Navigation - Current step: ${currentStepId} (${formStep}/${computedSteps.length})`);
      
      // For specific flows, use explicit sequence
      if (isPGHostelMode || isCommercialRentMode || isCommercialSaleMode || 
          isCoworkingMode || isLandSaleMode || isFlatmatesMode) {
        const activeSequence = getActiveSequence();
        
        // Ensure activeSequence is valid
        if (!Array.isArray(activeSequence) || activeSequence.length === 0) {
          console.warn('Active sequence is not valid, falling back to simple navigation');
          const prevStepIndex = Math.max(formStep - 1, 1);
          setCurrentStep(prevStepIndex);
          return;
        }
        
        const currentIndex = activeSequence.indexOf(currentStepId);
        
        console.log(`Flow Navigation - Current index in sequence: ${currentIndex}, Sequence:`, activeSequence);
        
        // If found and not at the beginning, get previous step
        if (currentIndex > 0) {
          const prevStepId = activeSequence[currentIndex - 1];
          
          // Find index in computedSteps array
          const prevStepIndex = computedSteps.findIndex(step => step && step.id === prevStepId);
          
          console.log(`Flow Navigation - Previous step ID: ${prevStepId}, Index: ${prevStepIndex}`);
          
          if (prevStepIndex !== -1) {
            // First update the URL before changing the step state
            updateUrlForStep(prevStepId);
            
            // Set the previous step (adding 1 because formStep is 1-indexed)
            console.log(`Setting current step to: ${prevStepIndex + 1}`);
            setCurrentStep(prevStepIndex + 1);
            return;
          }
        }
      }
      
      // For other flows, directly calculate the previous step
      const prevStepIndex = Math.max(formStep - 1, 1);
      const prevStep = computedSteps[prevStepIndex - 1];
      const prevStepId = prevStep?.id;
      
      if (prevStepId) {
        // First update the URL
        updateUrlForStep(prevStepId);
      }
      
      // Then set the step
      setCurrentStep(prevStepIndex);
      
    } catch (error) {
      console.error('Error in handlePreviousStep:', error);
      // Fall back to simple step decrement
      const prevStepIndex = Math.max(formStep - 1, 1);
      setCurrentStep(prevStepIndex);
    }
  }, [
    form,
    computedSteps,
    getCurrentStepId, 
    formStep, 
    isPGHostelMode, 
    isCommercialRentMode, 
    isCommercialSaleMode, 
    isCoworkingMode, 
    isLandSaleMode, 
    isFlatmatesMode, 
    getActiveSequence, 
    setCurrentStep,
    updateUrlForStep
  ]);

  // FIXED: Create step indices for lookup with safety checks
  const stepIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    
    // Ensure computedSteps exists and is an array
    if (!computedSteps || !Array.isArray(computedSteps)) {
      console.warn('stepIndices: computedSteps is not available or not an array');
      return indices;
    }
    
    try {
      computedSteps.forEach((step, index) => {
        if (step && step.id) {
          indices[step.id] = index + 1; // 1-based index to match formStep
        }
      });
    } catch (error) {
      console.error('Error creating step indices:', error);
    }
    
    return indices;
  }, [computedSteps]);

  // FIXED: Visible steps function with comprehensive safety checks
  const getVisibleSteps = useCallback(() => {
    // Safety check - return empty array if no steps or not an array
    if (!computedSteps || !Array.isArray(computedSteps) || computedSteps.length === 0) {
      console.warn('getVisibleSteps: computedSteps is not available or empty');
      return [];
    }
    
    try {
      return computedSteps.map(step => ({
        ...step,
        hidden: 
          // Rental step hidden for non-rental flows
          (step.id === 'rental' && (isSaleMode || isPGHostelMode || 
                                 isCommercialSaleMode || isCoworkingMode || isLandSaleMode || 
                                 isFlatmatesMode)) || 
          // Sale step hidden for non-sale flows
          (step.id === 'sale' && (!isSaleMode || isPGHostelMode || isCommercialRentMode || 
                                 isCommercialSaleMode || isCoworkingMode || isLandSaleMode || 
                                 isFlatmatesMode)) ||
          // Details step hidden for PG/Hostel and Land/Plot flows
          // Removed isCommercialRentMode from this condition to allow details step for Commercial Rent
          (step.id === 'details' && (isPGHostelMode || isLandSaleMode)) ||
          // Commercial basics step hidden for non-Commercial Rent flows
          (step.id === 'commercial_basics' && !isCommercialRentMode) ||
          // PG/Hostel steps hidden for non-PG/Hostel flows
          (step.id === 'room_details' && !isPGHostelMode) ||
          (step.id === 'pg_details' && !isPGHostelMode) ||
          // Commercial details step hidden for all flows (removed step)
          (step.id === 'commercial') ||
          // Commercial sale step hidden for non-Commercial Sale flows
          (step.id === 'commercial_sale' && !isCommercialSaleMode) ||
          // Co-working step hidden for non-Co-working flows
          (step.id === 'coworking' && !isCoworkingMode) ||
          // Land details steps hidden for non-Land/Plot flows
          (step.id === 'land_details' && !isLandSaleMode) ||
          (step.id === 'land_features' && !isLandSaleMode) ||
          // Flatmates step hidden for non-Flatmates flows
          (step.id === 'flatmate_details' && !isFlatmatesMode)
      }));
    } catch (error) {
      console.error('Error in getVisibleSteps:', error);
      return [];
    }
  }, [
    computedSteps, 
    isSaleMode, 
    isPGHostelMode, 
    isCommercialRentMode, 
    isCommercialSaleMode, 
    isCoworkingMode, 
    isLandSaleMode, 
    isFlatmatesMode
  ]);

  return {
    isSaleMode,
    isPGHostelMode,
    isCommercialRentMode,
    isCommercialSaleMode,
    isCoworkingMode,
    isLandSaleMode,
    isFlatmatesMode,
    getVisibleSteps,
    handleNextStep,
    handlePreviousStep,
    fillDemoData,
    updateUrlForStep,
    stepIndices,
    computedSteps
  };
}