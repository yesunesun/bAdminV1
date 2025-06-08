// src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts
// Version: 10.2.0
// Last Modified: 26-01-2025 01:15 IST
// Purpose: Fixed URL construction to prevent root navigation

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

  // DISABLED: URL updating to prevent conflicts with PropertyForm navigation
  const updateUrlForStep = useCallback((stepId: string) => {
    // Do nothing - let PropertyForm handle URL updates
    console.log('[useStepNavigation] updateUrlForStep disabled, stepId:', stepId);
  }, []);

  // FIXED: Custom navigation function for all property flows with enhanced safety
  const handleNextStep = useCallback(() => {
    try {
      // Use the original handler which should handle the navigation properly
      originalHandleNextStep();
    } catch (error) {
      console.error('Error in handleNextStep:', error);
    }
  }, [originalHandleNextStep]);

  // DISABLED: Let PropertyForm handle all navigation
  const handlePreviousStep = useCallback(() => {
    console.log('[useStepNavigation] handlePreviousStep disabled - using PropertyForm navigation');
  }, []);

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