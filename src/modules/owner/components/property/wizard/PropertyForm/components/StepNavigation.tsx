// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 3.4.0
// Last Modified: 16-04-2025 18:30 IST
// Purpose: Fixed Photos tab navigation by using standard navigation flow

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
  showSave = false,
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

  // Check for specific steps
  const isReviewStep = currentStepId === 'review';
  const isPhotosStep = currentStepId === 'photos';
  
  // Get the base URL path (removing the last segment)
  const getBasePath = () => {
    const url = window.location.pathname;
    const lastSlashIndex = url.lastIndexOf('/');
    return url.substring(0, lastSlashIndex);
  };
  
  // Debugging information
  useEffect(() => {
    console.log(`StepNavigation rendered with step ${formStep} (${currentStepId})`);
    console.log(`Is first step: ${computedIsFirstStep}, Is last step: ${computedIsLastStep}`);
    console.log(`Is photos step: ${isPhotosStep}, Is review step: ${isReviewStep}`);
  }, [formStep, currentStepId, computedIsFirstStep, computedIsLastStep, isPhotosStep, isReviewStep]);

  // Special handling for photos step - if we're on the photos step, show the return button
  if (isPhotosStep) {
    return (
      <div className="flex justify-between mt-6">
        <div>
          <button
            type="button"
            className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50"
            onClick={handlePreviousStep}
          >
            Return to Review
          </button>
        </div>
        
        <div className="flex gap-3">
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
      
      {/* Right section - Next/Publish buttons */}
      <div className="flex gap-3">
        {/* Only show special review button if on review step */}
        {isReviewStep && (
          <button
            type="button"
            className="px-4 py-2 text-white bg-blue-600 rounded shadow-sm hover:bg-blue-700"
            onClick={handleNextStep} // Use standard handleNextStep instead of custom navigation
          >
            Continue to Photos
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