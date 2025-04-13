// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 7.9.0
// Last Modified: 14-04-2025 11:30 IST
// Purpose: Added form field validation

import React, { useState } from 'react';
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
  const [validationError, setValidationError] = useState('');

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

  // Validate current form fields
  const validateForm = () => {
    try {
      // Get form element
      const form = document.querySelector('form');
      if (!form) return true;
      
      // Get all required inputs that are visible
      const requiredInputs = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));
      
      // Filter out hidden inputs
      const visibleRequiredInputs = requiredInputs.filter(input => {
        const el = input as HTMLElement;
        const isVisible = !!el.offsetParent; // Element is visible if offsetParent is not null
        return isVisible;
      });
      
      // Find first empty required input
      const firstEmptyInput = visibleRequiredInputs.find(input => {
        const inputEl = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        return !inputEl.value.trim();
      });
      
      if (firstEmptyInput) {
        // Get field name for error message
        const inputEl = firstEmptyInput as HTMLInputElement;
        const fieldId = inputEl.id;
        let fieldName = 'field';
        
        // Try to get field name from label
        if (fieldId) {
          const labelEl = document.querySelector(`label[for="${fieldId}"]`);
          if (labelEl) {
            fieldName = labelEl.textContent?.replace('*', '').trim() || 'field';
          } else {
            // Fallback to placeholder
            fieldName = inputEl.placeholder || 'This field';
          }
        }
        
        // Set error message
        setValidationError(`${fieldName} is required`);
        
        // Focus the empty input
        inputEl.focus();
        
        // Scroll to it
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        return false;
      }
      
      // No empty required inputs found
      setValidationError('');
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return true; // Let it proceed on error
    }
  };

  // Handle previous button click
  const onPreviousClick = () => {
    // Save form data before going back
    handlePreviousStep();
  };
  
  // Handle next button click with validation
  const onNextClick = () => {
    const isValid = validateForm();
    
    if (isValid) {
      // Clear any previous errors
      setValidationError('');
      
      // Proceed to next step
      handleNextStep();
    }
  };

  return (
    <div className="flex flex-col">
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
      
      {validationError && (
        <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg">
          <p className="text-sm font-medium">{validationError}</p>
          <p className="text-xs mt-1">Please fill in all required fields before proceeding</p>
        </div>
      )}
    </div>
  );
};

export default StepNavigation;