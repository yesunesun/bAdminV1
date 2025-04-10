// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 7.1.0
// Last Modified: 10-04-2025 18:30 IST
// Purpose: Fixed PG/Hostel flow navigation to properly go from Room Details to Location tab

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

  // Determine property type from URL
  const getPropertyType = () => {
    const urlPath = window.location.pathname.toLowerCase();
    if (urlPath.includes('pghostel')) {
      return 'pghostel';
    } else if (urlPath.includes('sale') || urlPath.includes('sell')) {
      return 'sale';
    } else {
      return 'rent';
    }
  };

  // Get the correct flow steps for the current property type
  const getFlowSteps = () => {
    const propertyType = getPropertyType();
    
    // Define the flow steps for each property type
    if (propertyType === 'pghostel') {
      // FIX: Use the correct sequence for PG/Hostel flow as defined in flows.ts
      return ['room_details', 'location', 'pg_details', 'features', 'review', 'photos'];
    } else if (propertyType === 'sale') {
      return ['details', 'location', 'sale', 'features', 'review', 'photos'];
    } else {
      return ['details', 'location', 'rental', 'features', 'review', 'photos'];
    }
  };

  // Custom previous button handler
  const onPreviousClick = () => {
    try {
      // Extract the base URL without the current step
      const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
      const propertyType = getPropertyType();
      const flowSteps = getFlowSteps();
      
      // Find the current step in the flow
      const currentStepIndex = flowSteps.indexOf(currentStepId);
      
      if (currentStepIndex > 0) {
        // Navigate to the previous step in the flow
        const prevStepId = flowSteps[currentStepIndex - 1];
        navigate(`${baseUrl}/${prevStepId}`);
      } else {
        // Fallback to original handler
        handlePreviousStep();
      }
    } catch (error) {
      console.error('Error in onPreviousClick:', error);
      // Fallback to original handler
      handlePreviousStep();
    }
  };
  
  // Custom next button handler
  const onNextClick = () => {
    try {
      // Extract the base URL without the current step
      const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
      const flowSteps = getFlowSteps();
      
      console.log('Current step ID:', currentStepId);
      console.log('Flow steps:', flowSteps);
      
      // Find the current step in the flow
      const currentStepIndex = flowSteps.indexOf(currentStepId);
      console.log('Current step index in flow:', currentStepIndex);
      
      if (currentStepIndex >= 0 && currentStepIndex < flowSteps.length - 1) {
        // Navigate to the next step in the flow
        const nextStepId = flowSteps[currentStepIndex + 1];
        console.log('Navigating to next step:', nextStepId);
        navigate(`${baseUrl}/${nextStepId}`);
      } else {
        // Fallback to original handler
        console.log('Using fallback navigation handler');
        handleNextStep();
      }
    } catch (error) {
      console.error('Error in onNextClick:', error);
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