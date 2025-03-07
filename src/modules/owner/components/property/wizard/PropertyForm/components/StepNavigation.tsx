// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 4.0.0
// Last Modified: 09-03-2025 00:45 IST
// Purpose: Direct navigation implementation to bypass Google Maps errors

import React from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface StepNavigationProps {
  formStep: number;
  STEPS: any[];
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

const StepNavigation = ({
  formStep,
  STEPS,
  handlePreviousStep,
  handleNextStep
}: StepNavigationProps) => {
  const navigate = useNavigate();

  // Get current step ID safely
  const currentStepId = formStep > 0 && formStep <= STEPS.length 
    ? STEPS[formStep - 1]?.id 
    : '';
  
  // Don't show navigation on review or photos steps
  if (currentStepId === 'review' || currentStepId === 'photos') {
    return null;
  }
  
  // Only show previous button if not on the first step
  const showPreviousButton = formStep > 1;

  // Determine the next step based on the current step ID
  const getNextStepId = () => {
    switch (currentStepId) {
      case 'details':
        return 'location';
      case 'location':
        // Check if this is a sale property
        const listingType = document.querySelector('[data-listing-type]')?.getAttribute('data-listing-type');
        return listingType === 'sale' ? 'sale' : 'rental';
      case 'rental':
      case 'sale':
        return 'features';
      case 'features':
        return 'review';
      default:
        // Find the next step in the sequence
        const currentIndex = STEPS.findIndex(step => step.id === currentStepId);
        return STEPS[currentIndex + 1]?.id || '';
    }
  };

  // Direct navigation handlers to bypass complex hooks
  const onPrevious = () => {
    // Get the previous step ID
    const prevStepIndex = formStep - 2; // -1 for 0-index, -1 for previous
    const prevStepId = prevStepIndex >= 0 ? STEPS[prevStepIndex]?.id : 'details';
    
    // Extract the base URL without the current step
    const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
    
    // Navigate directly to the previous step
    navigate(`${baseUrl}/${prevStepId}`);
  };
  
  const onNext = () => {
    // Get the next step ID
    const nextStepId = getNextStepId();
    
    // Extract the base URL without the current step
    const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
    
    // Navigate directly to the next step
    navigate(`${baseUrl}/${nextStepId}`);
  };

  return (
    <div className="flex justify-between pt-6 border-t border-border">
      {showPreviousButton ? (
        <button
          type="button"
          onClick={onPrevious}
          className={cn(
            "px-6 py-3 text-sm font-medium rounded-xl",
            "bg-secondary text-secondary-foreground",
            "hover:bg-secondary/90 transition-colors",
            "focus:outline-none focus:ring-4 focus:ring-ring/30"
          )}
        >
          Previous
        </button>
      ) : (
        <div />
      )}
      
      <button
        type="button"
        onClick={onNext}
        className={cn(
          "px-6 py-3 text-sm font-medium rounded-xl",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 transition-colors",
          "focus:outline-none focus:ring-4 focus:ring-ring/30"
        )}
      >
        Next
      </button>
    </div>
  );
};

export default StepNavigation;