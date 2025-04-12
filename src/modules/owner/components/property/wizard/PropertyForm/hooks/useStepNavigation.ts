// src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts
// Version: 8.1.0
// Last Modified: 12-04-2025 17:30 IST
// Purpose: Removed Commercial Details from Commercial Rent step sequence

import { useMemo, useCallback, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';
import { addFormAutofillHelpers, fillFormSection } from '../../utilities/formAutofill';

interface UseStepNavigationProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  formIsSaleMode?: boolean;
  originalHandleNextStep: () => void;
  setCurrentStep: (step: number) => void;
  STEPS: any[]; 
}

export function useStepNavigation({
  form,
  formStep,
  formIsSaleMode,
  originalHandleNextStep,
  setCurrentStep,
  STEPS
}: UseStepNavigationProps) {
  // Improved sale mode detection logic
  const isSaleMode = useMemo(() => {
    // Check explicit flag first
    if (formIsSaleMode !== undefined) {
      return formIsSaleMode;
    }
    
    // Get current form values
    const formValues = form.getValues();
    
    // Check listing type - primary indicator
    const listingType = formValues.listingType?.toLowerCase() || '';
    const isSaleFromListingType = listingType === 'sale' || listingType === 'sell';
    
    // Check URL path for keywords
    const urlPath = window.location.pathname.toLowerCase();
    const isSaleFromUrl = urlPath.includes('sale') || urlPath.includes('sell');
    
    // Determine final result with URL having higher priority
    const result = isSaleFromUrl || isSaleFromListingType;
    
    return result;
  }, [form, formIsSaleMode]);
  
  // Enhanced PG/Hostel mode detection
  const isPGHostelMode = useMemo(() => {
    try {
      // Check form values
      const formValues = form.getValues();
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
  }, [form]);
  
  // Commercial Rent mode detection
  const isCommercialRentMode = useMemo(() => {
    try {
      // Check form values
      const formValues = form.getValues();
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
  }, [form]);
  
  // Commercial Sale mode detection
  const isCommercialSaleMode = useMemo(() => {
    try {
      // Check form values
      const formValues = form.getValues();
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
  }, [form]);
  
  // Commercial Co-working mode detection
  const isCoworkingMode = useMemo(() => {
    try {
      // Check form values
      const formValues = form.getValues();
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
  }, [form]);
  
  // Land/Plot Sale mode detection
  const isLandSaleMode = useMemo(() => {
    try {
      // Check form values
      const formValues = form.getValues();
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
  }, [form]);
  
  // Residential Flatmates mode detection
  const isFlatmatesMode = useMemo(() => {
    try {
      // Check form values
      const formValues = form.getValues();
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
  }, [form]);

  // Get current step ID
  const getCurrentStepId = useCallback(() => {
    if (formStep <= 0 || formStep > STEPS.length) return null;
    return STEPS[formStep - 1]?.id || null;
  }, [formStep, STEPS]);
  
  // Use our new fillFormSection function for auto-filling
  const fillDemoData = useCallback(() => {
    const currentStepId = getCurrentStepId();
    console.log(`Auto-fill requested for step: ${currentStepId}`);
    
    if (!currentStepId) return;
    
    // Map step IDs to section names in test-data.ts
    const sectionMap: Record<string, string> = {
      'room_details': 'room_details',
      'pg_details': 'pg_details',
      'commercial': 'commercial',
      'commercial_sale': 'commercial_sale',
      'coworking': 'coworking',
      'land_details': 'land_details',
      'land_features': 'land_features',
      'flatmate_details': 'flatmate_details',
      'location': 'location',
      'details': 'basic',
      'rental': 'rental',
      'sale': 'sale',
      'features': 'amenities'
    };
    
    const section = sectionMap[currentStepId];
    if (section) {
      fillFormSection(form, section as any);
    } else {
      console.log(`No test data section mapped for step: ${currentStepId}`);
    }
  }, [getCurrentStepId, form]);

  // Add the autofill helpers when component mounts
  useEffect(() => {
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

  // Define explicit step sequences based on property type
  const stepSequences = useMemo(() => ({
    // PG/Hostel sequence
    pgHostel: ['room_details', 'location', 'pg_details', 'features', 'review', 'photos'],
    
    // Standard rental sequence
    rent: ['details', 'location', 'rental', 'features', 'review', 'photos'],
    
    // Sale sequence
    sale: ['details', 'location', 'sale', 'features', 'review', 'photos'],
    
    // Commercial Rent sequence (updated to remove commercial details)
    commercialRent: ['details', 'location', 'rental', 'features', 'review', 'photos'],
    
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

  // Custom navigation function for all property flows
  const handleNextStep = useCallback(() => {
    try {
      const currentStepId = getCurrentStepId();
      
      // Enhanced debug information for navigation troubleshooting
      console.log(`Navigation - Current step: ${currentStepId} (${formStep}/${STEPS.length})`);
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
        const currentIndex = activeSequence.indexOf(currentStepId);
        
        console.log(`Flow Navigation - Current index in sequence: ${currentIndex}, Sequence:`, activeSequence);
        
        // If found and not at the end, get next step
        if (currentIndex !== -1 && currentIndex < activeSequence.length - 1) {
          const nextStepId = activeSequence[currentIndex + 1];
          
          // Find index in STEPS array
          const nextStepIndex = STEPS.findIndex(step => step.id === nextStepId);
          
          console.log(`Flow Navigation - Next step ID: ${nextStepId}, Index: ${nextStepIndex}`);
          
          if (nextStepIndex !== -1) {
            // Set the next step (adding 1 because formStep is 1-indexed)
            console.log(`Setting current step to: ${nextStepIndex + 1}`);
            
            // Set the next step
            setCurrentStep(nextStepIndex + 1);
            return;
          }
        }
      }
      
      // For other flows, use original handler
      originalHandleNextStep();
    } catch (error) {
      console.error('Error in handleNextStep:', error);
      // Fall back to original handler
      originalHandleNextStep();
    }
  }, [
    getCurrentStepId, 
    formStep, 
    STEPS, 
    isPGHostelMode, 
    isCommercialRentMode, 
    isCommercialSaleMode, 
    isCoworkingMode, 
    isLandSaleMode, 
    isFlatmatesMode, 
    getActiveSequence, 
    originalHandleNextStep, 
    setCurrentStep
  ]);

  // Create a memoized step map for looking up indices quickly
  const stepIndices = useMemo(() => {
    const indices: Record<string, number> = {};
    STEPS.forEach((step, index) => {
      indices[step.id] = index + 1; // 1-based index to match formStep
    });
    return indices;
  }, [STEPS]);

  // Simplified visible steps function
  const getVisibleSteps = useCallback(() => {
    return STEPS.map(step => ({
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
        (step.id === 'details' && (isPGHostelMode || isLandSaleMode)) ||
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
  }, [
    STEPS, 
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
    fillDemoData
  };
}