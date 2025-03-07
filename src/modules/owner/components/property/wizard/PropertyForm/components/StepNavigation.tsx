// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 6.0.0
// Last Modified: 09-03-2025 04:00 IST
// Purpose: Fixed Previous button navigation in Sale/Rental tabs

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

  // Determine if this is a sale property
  const isSaleProperty = () => {
    const urlPath = window.location.pathname.toLowerCase();
    return urlPath.includes('sale') || urlPath.includes('sell');
  };

  // Custom previous button handler
  const onPreviousClick = () => {
    try {
      // Extract the base URL without the current step
      const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
      
      // Special handling for Previous from Rental or Sale tabs
      if (currentStepId === 'rental' || currentStepId === 'sale') {
        // Always go back to location from rental/sale
        navigate(`${baseUrl}/location`);
        return;
      }
      
      // Special handling for Previous from Features
      if (currentStepId === 'features') {
        if (isSaleProperty()) {
          // Go back to sale from features in sale flow
          navigate(`${baseUrl}/sale`);
        } else {
          // Go back to rental from features in rental flow
          navigate(`${baseUrl}/rental`);
        }
        return;
      }
      
      // Get the previous step ID
      const prevStepIndex = formStep - 2; // -1 for 0-index, -1 for previous
      const prevStepId = prevStepIndex >= 0 ? STEPS[prevStepIndex]?.id : 'details';
      
      // Navigate to previous step
      navigate(`${baseUrl}/${prevStepId}`);
    } catch (error) {
      // Fallback to original handler
      handlePreviousStep();
    }
  };
  
  // Custom next button handler
  const onNextClick = () => {
    try {
      // Extract the base URL without the current step
      const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
      
      // Special handling for Next from Location
      if (currentStepId === 'location') {
        if (isSaleProperty()) {
          // Go to sale from location in sale flow
          navigate(`${baseUrl}/sale`);
        } else {
          // Go to rental from location in rental flow
          navigate(`${baseUrl}/rental`);
        }
        return;
      }
      
      // Special handling for Next from Rental or Sale
      if (currentStepId === 'rental' || currentStepId === 'sale') {
        // Always go to features from rental/sale
        navigate(`${baseUrl}/features`);
        return;
      }
      
      // Special handling for Next from Features
      if (currentStepId === 'features') {
        // Always go to review from features
        navigate(`${baseUrl}/review`);
        return;
      }
      
      // For other steps, find the next step ID
      const nextStepIndex = formStep; // Current step index (1-based) is the next step index (0-based) + 1
      const nextStepId = nextStepIndex < STEPS.length ? STEPS[nextStepIndex]?.id : '';
      
      // Navigate to next step
      if (nextStepId) {
        navigate(`${baseUrl}/${nextStepId}`);
      }
    } catch (error) {
      // Fallback to original handler
      handleNextStep();
    }
  };

  return (
    <div className="flex justify-between pt-6 border-t border-border">
      {showPreviousButton ? (
        <button
          type="button"
          onClick={onPreviousClick}
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
        onClick={onNextClick}
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