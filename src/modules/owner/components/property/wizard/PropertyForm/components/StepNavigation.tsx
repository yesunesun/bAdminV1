// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 3.1.0
// Last Modified: 17-04-2025 10:45 IST
// Purpose: Fixed navigation button functionality for all property flows

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  formStep: number;
  STEPS: any[];
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  onSave?: () => void;
  onPublish?: () => void;
  saveText?: string;
  showBack?: boolean;
  showNext?: boolean;
  showSave?: boolean;
  showPublish?: boolean;
  isLastStep?: boolean;
  isFirstStep?: boolean;
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
  showSave = true,
  showPublish = false,
  isLastStep = false,
  isFirstStep = false
}: StepNavigationProps) {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  
  // Determine current step ID
  const currentStepId = formStep > 0 && formStep <= STEPS.length 
    ? STEPS[formStep - 1]?.id 
    : '';

  // Determine if current step is first or last based on STEPS array
  const computedIsFirstStep = formStep === 1;
  const computedIsLastStep = formStep === STEPS.length;

  // Check if we're on the review step
  const isReviewStep = currentStepId === 'review';
  
  // Get save button text based on current step
  const getSaveButtonText = () => {
    if (isReviewStep) {
      return 'Save and Upload Photos';
    }
    return saveText;
  };
  
  // Determine if we should show the Save button
  const shouldShowSaveButton = showSave && 
    currentStepId !== 'details' && 
    currentStepId !== 'room_details';
  
  // Debugging information
  useEffect(() => {
    console.log(`StepNavigation rendered with step ${formStep} (${currentStepId})`);
    console.log(`Is first step: ${computedIsFirstStep}, Is last step: ${computedIsLastStep}`);
  }, [formStep, currentStepId, computedIsFirstStep, computedIsLastStep]);

  // Handle Save and Next for Review step
  const handleSaveAndNext = () => {
    console.log('Save and Continue clicked');
    if (onSave) {
      setIsSaving(true);
      onSave();
      
      // Give time for the save to complete
      setTimeout(() => {
        handleNextStep();
        setIsSaving(false);
      }, 300);
    } else {
      // If no save handler, just navigate
      handleNextStep();
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
      
      {/* Right section - Next/Save/Publish buttons */}
      <div className="flex gap-3">
        {/* Only show Save button if not on details step */}
        {shouldShowSaveButton && (
          <button
            type="button"
            className={cn(
              "px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50",
              isSaving && "opacity-50 cursor-not-allowed"
            )}
            onClick={isReviewStep ? handleSaveAndNext : onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : getSaveButtonText()}
          </button>
        )}
        
        {showNext && !computedIsLastStep && (
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