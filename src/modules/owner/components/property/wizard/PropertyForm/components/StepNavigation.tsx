// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 3.5.0
// Last Modified: 21-05-2025 14:45 IST
// Purpose: Hide navigation completely on review step

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepNavigationProps {
  formStep: number;
  STEPS: Array<{ id: string; title: string }>;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  isLastStep?: boolean;
  disablePrevious?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  formStep,
  STEPS,
  handlePreviousStep,
  handleNextStep,
  isLastStep = false,
  disablePrevious = false
}) => {
  const isLastStepInFlow = formStep === STEPS.length;
  
  // Function to proceed to the next step
  const handleContinue = (event: React.MouseEvent) => {
    event.preventDefault();
    handleNextStep();
  };
  
  // Hide the navigation completely on the review step 
  // since we have our own buttons in the PropertySummary component
  if (isLastStep) {
    return null;
  }
  
  return (
    <div className="flex justify-between items-center">
      {/* Previous button */}
      <button
        type="button"
        onClick={handlePreviousStep}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm rounded",
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/90 transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        disabled={formStep === 1 || disablePrevious}
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </button>
      
      {/* Next button */}
      <button
        type="button"
        onClick={handleContinue}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-sm rounded",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 transition-colors"
        )}
      >
        Next
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default StepNavigation;