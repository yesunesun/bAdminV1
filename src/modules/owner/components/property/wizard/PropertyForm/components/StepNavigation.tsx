// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 4.1.0
// Last Modified: 01-05-2025 17:45 IST
// Purpose: Improved handling of save completion and property ID retrieval

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  formStep: number;
  STEPS: any[];
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  onSave?: () => Promise<string | undefined>; 
  onPublish?: () => void;
  saveText?: string;
  showBack?: boolean;
  showNext?: boolean;
  showSave?: boolean;
  showPublish?: boolean;
  isLastStep?: boolean;
  isFirstStep?: boolean;
  savedPropertyId?: string;
}

export default function StepNavigation({
  formStep,
  STEPS,
  handlePreviousStep,
  handleNextStep,
  onSave,
  onPublish,
  saveText = 'Save as Draft',
  showBack = true,
  showNext = true,
  showSave = false,
  showPublish = false,
  isLastStep = false,
  isFirstStep = false,
  savedPropertyId = ''
}: StepNavigationProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedPropertyId, setLastSavedPropertyId] = useState<string | null>(null);
  
  // Update lastSavedPropertyId when savedPropertyId changes
  useEffect(() => {
    if (savedPropertyId && savedPropertyId !== '') {
      setLastSavedPropertyId(savedPropertyId);
    }
  }, [savedPropertyId]);
  
  // Determine current step ID
  const currentStepId = formStep > 0 && formStep <= STEPS.length 
    ? STEPS[formStep - 1]?.id 
    : '';

  // Determine if current step is first or last based on STEPS array
  const computedIsFirstStep = formStep === 1;
  const computedIsLastStep = formStep === STEPS.length;

  // Check for specific steps
  const isReviewStep = currentStepId === 'review';
  
  // Handle explicit save draft button - separate from navigation
  const handleSaveDraftExplicit = async () => {
    if (!onSave) {
      alert("Save function not available");
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Save the property
      const propertyId = await onSave();
      
      if (propertyId) {
        setLastSavedPropertyId(propertyId);
        alert("Property saved successfully!");
      } else {
        // Even if we don't get a property ID, show success since data was saved
        alert("Property saved successfully, but ID not available.");
      }
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Error saving property. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle save and navigate in two separate steps
  const handleSaveAndNavigate = async () => {
    if (isSaving) return; // Prevent multiple clicks
    
    setIsSaving(true);
    console.log("Starting save and navigate process");
    
    try {
      // Always try to save first, regardless of whether we have a saved ID already
      if (onSave) {
        console.log("Saving property...");
        const newPropertyId = await onSave();
        
        if (newPropertyId) {
          console.log("Property saved with ID:", newPropertyId);
          setLastSavedPropertyId(newPropertyId);
          
          // Wait briefly to ensure state updates
          setTimeout(() => {
            // Navigate to seeker view with the property ID
            navigate(`/seeker/property/${newPropertyId}`);
          }, 100);
          return;
        }
      }
      
      // If onSave didn't return a property ID, check if we have one from props or state
      const effectivePropertyId = savedPropertyId || lastSavedPropertyId;
      
      if (effectivePropertyId) {
        console.log("Using existing property ID for navigation:", effectivePropertyId);
        navigate(`/seeker/property/${effectivePropertyId}`);
        return;
      }
      
      // If we still don't have a property ID, show error
      console.error("No property ID available after saving");
      alert("Unable to save property. Please try saving as draft first.");
      
    } catch (error) {
      console.error("Error in save and navigate:", error);
      alert("Error saving property. Please try again or save as draft first.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex justify-between mt-6">
      {/* Left section - Back button */}
      <div>
        {showBack && !computedIsFirstStep && (
          <button
            type="button"
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            onClick={handlePreviousStep}
          >
            Back
          </button>
        )}
      </div>
      
      {/* Right section - Next/Save buttons */}
      <div className="flex gap-3">
        {/* Save as Draft button if we're on the review step */}
        {isReviewStep && (
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50",
              isSaving && "opacity-70 cursor-not-allowed"
            )}
            onClick={handleSaveDraftExplicit}
            disabled={isSaving}
          >
            {isSaving && !lastSavedPropertyId ? "Saving..." : "Save as Draft"}
          </button>
        )}
        
        {/* Save and Continue button for review step */}
        {isReviewStep && (
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700 flex items-center",
              isSaving && "opacity-70 cursor-not-allowed"
            )}
            onClick={() => {
              // If we already have a saved property ID, navigate directly
              if (savedPropertyId || lastSavedPropertyId) {
                navigate(`/seeker/property/${savedPropertyId || lastSavedPropertyId}`);
              } else {
                // Otherwise try to save and then navigate
                handleSaveAndNavigate();
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save and Continue'
            )}
          </button>
        )}
        
        {/* Only show Next button if not on review step and not last step */}
        {showNext && !computedIsLastStep && !isReviewStep && (
          <button
            type="button"
            className="px-4 py-2 text-white bg-green-600 rounded shadow-sm hover:bg-green-700"
            onClick={handleNextStep}
          >
            Next
          </button>
        )}
        
        {showPublish && (
          <button
            type="button"
            className="px-4 py-2 text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700"
            onClick={onPublish}
          >
            Publish
          </button>
        )}
      </div>
    </div>
  );
}