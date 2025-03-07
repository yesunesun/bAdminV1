// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 1.0.0
// Last Modified: 07-03-2025 16:30 IST
// Purpose: Navigation buttons for form steps

import React from 'react';
import { cn } from '@/lib/utils';

interface StepNavigationProps {
  formStep: number;
  STEPS: any[]; // Using any to match the original import type
  handlePreviousStep: () => void;
  handleNextStep: () => void;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  formStep,
  STEPS,
  handlePreviousStep,
  handleNextStep
}) => {
  // Only show navigation buttons for steps that need them
  if (STEPS[formStep - 1]?.id === 'review' || STEPS[formStep - 1]?.id === 'photos') {
    return null;
  }

  return (
    <div className="flex justify-between pt-6 border-t border-border">
      {formStep > 1 ? (
        <button
          type="button"
          onClick={handlePreviousStep}
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
        onClick={handleNextStep}
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