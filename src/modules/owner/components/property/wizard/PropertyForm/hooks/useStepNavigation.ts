// src/modules/owner/components/property/wizard/PropertyForm/hooks/useStepNavigation.ts
// Version: 6.9.0
// Last Modified: 10-04-2025 17:30 IST
// Purpose: Fixed PG/Hostel navigation flow to properly go from Room Details to Location tab

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
  // FIX: Updated the pgHostel sequence to match flows.ts
  const stepSequences = useMemo(() => ({
    // PG/Hostel sequence - FIXED to match the order in flows.ts
    pgHostel: ['room_details', 'location', 'pg_details', 'features', 'review', 'photos'],
    
    // Standard rental sequence
    rent: ['details', 'location', 'rental', 'features', 'review', 'photos'],
    
    // Sale sequence
    sale: ['details', 'location', 'sale', 'features', 'review', 'photos']
  }), []);

  // Get the active sequence based on property type
  const getActiveSequence = useCallback(() => {
    if (isPGHostelMode) return stepSequences.pgHostel;
    if (isSaleMode) return stepSequences.sale;
    return stepSequences.rent;
  }, [isPGHostelMode, isSaleMode, stepSequences]);

  // FIXED NAVIGATION FUNCTION FOR PG/HOSTEL FLOW
  const handleNextStep = useCallback(() => {
    try {
      const currentStepId = getCurrentStepId();
      
      // Enhanced debug information for navigation troubleshooting
      console.log(`Navigation - Current step: ${currentStepId} (${formStep}/${STEPS.length})`);
      console.log(`Next button clicked - isPGHostelMode: ${isPGHostelMode}`);
      
      // For PG/Hostel flow, use explicit sequence
      if (isPGHostelMode && currentStepId) {
        const pgSequence = getActiveSequence();
        const currentIndex = pgSequence.indexOf(currentStepId);
        
        console.log(`PG Navigation - Current index in sequence: ${currentIndex}, Sequence:`, pgSequence);
        
        // If found and not at the end, get next step
        if (currentIndex !== -1 && currentIndex < pgSequence.length - 1) {
          const nextStepId = pgSequence[currentIndex + 1];
          
          // Find index in STEPS array
          const nextStepIndex = STEPS.findIndex(step => step.id === nextStepId);
          
          console.log(`PG Navigation - Next step ID: ${nextStepId}, Index: ${nextStepIndex}`);
          
          if (nextStepIndex !== -1) {
            // Set the next step (adding 1 because formStep is 1-indexed)
            console.log(`Setting current step to: ${nextStepIndex + 1}`);
            
            // CRUCIAL FIX: Validate the step IDs to ensure location follows room_details
            if (currentStepId === 'room_details' && nextStepId !== 'location') {
              console.error('PG Navigation ERROR: Expected location to follow room_details!');
              
              // Force navigation to the location step
              const locationIndex = STEPS.findIndex(step => step.id === 'location');
              if (locationIndex !== -1) {
                console.log(`Forcing navigation to location step at index: ${locationIndex + 1}`);
                setCurrentStep(locationIndex + 1);
              } else {
                // Fall back to original handler if location step not found
                originalHandleNextStep();
              }
            } else {
              // Normal path - set the next step
              setCurrentStep(nextStepIndex + 1);
            }
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
  }, [getCurrentStepId, formStep, STEPS, isPGHostelMode, getActiveSequence, originalHandleNextStep, setCurrentStep]);

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
      hidden: (step.id === 'rental' && (isSaleMode || isPGHostelMode)) || 
              (step.id === 'sale' && (!isSaleMode || isPGHostelMode)) ||
              (step.id === 'details' && isPGHostelMode) ||
              (step.id === 'room_details' && !isPGHostelMode) ||
              (step.id === 'pg_details' && !isPGHostelMode)
    }));
  }, [STEPS, isSaleMode, isPGHostelMode]);

  return {
    isSaleMode,
    isPGHostelMode,
    getVisibleSteps,
    handleNextStep,
    fillDemoData
  };
}