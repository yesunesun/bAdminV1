// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 5.0.0
// Last Modified: 09-03-2025 02:00 IST
// Purpose: Fixed navigation for Sale flow to correctly move from Location to Sale tab

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

  // Determine the next step based on the current step ID and property type
  const getNextStepId = () => {
    if (currentStepId === 'details') {
      return 'location';
    }
    
    if (currentStepId === 'location') {
      // Check if this is a sale property by looking for indicators in the form
      // First try to find an explicit listing type element
      const listingTypeElement = document.querySelector('[data-listing-type]');
      if (listingTypeElement) {
        const listingType = listingTypeElement.getAttribute('data-listing-type');
        if (listingType === 'sale' || listingType === 'sell') {
          return 'sale';
        } else {
          return 'rental';
        }
      }
      
      // If no explicit marker, try to detect from visible form elements
      // Look for sale-specific fields that would be visible
      const saleFieldsVisible = document.querySelector('[name="expectedPrice"]') !== null || 
                                document.querySelector('[name="maintenanceCost"]') !== null;
      
      // Look for rental-specific fields that would be visible
      const rentalFieldsVisible = document.querySelector('[name="rentAmount"]') !== null ||
                                  document.querySelector('[name="securityDeposit"]') !== null;
      
      // If we detect sale fields or the URL contains "sale", navigate to sale
      if (saleFieldsVisible || window.location.pathname.includes('/sale/')) {
        return 'sale';
      }
      
      // If we detect rental fields or the URL contains "rent", navigate to rental
      if (rentalFieldsVisible || window.location.pathname.includes('/rent/')) {
        return 'rental';
      }
      
      // Default fallback - check the URL path for clues
      const urlPath = window.location.pathname.toLowerCase();
      if (urlPath.includes('sale') || urlPath.includes('sell')) {
        return 'sale';
      } else {
        return 'rental';
      }
    }
    
    if (currentStepId === 'rental' || currentStepId === 'sale') {
      return 'features';
    }
    
    if (currentStepId === 'features') {
      return 'review';
    }
    
    // Find the next step in the sequence
    const currentIndex = STEPS.findIndex(step => step.id === currentStepId);
    return STEPS[currentIndex + 1]?.id || '';
  };

  // Direct navigation handlers
  const onPrevious = () => {
    try {
      // Get the previous step ID
      const prevStepIndex = formStep - 2; // -1 for 0-index, -1 for previous
      const prevStepId = prevStepIndex >= 0 ? STEPS[prevStepIndex]?.id : 'details';
      
      // Special handling for previous button on Features
      if (currentStepId === 'features') {
        // Determine if we should go back to sale or rental
        const urlPath = window.location.pathname.toLowerCase();
        if (urlPath.includes('sale') || urlPath.includes('sell')) {
          // For sale flow, go back to sale from features
          const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
          navigate(`${baseUrl}/sale`);
          return;
        } else {
          // For rental flow, go back to rental from features
          const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
          navigate(`${baseUrl}/rental`);
          return;
        }
      }
      
      // For other steps, standard previous navigation
      const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
      navigate(`${baseUrl}/${prevStepId}`);
      
    } catch (error) {
      // Fallback to original handler
      handlePreviousStep();
    }
  };
  
  const onNext = () => {
    try {
      // Get the next step ID
      const nextStepId = getNextStepId();
      
      // Extract the base URL without the current step
      const baseUrl = window.location.pathname.replace(/\/[^\/]*$/, '');
      
      // Navigate directly to the next step
      navigate(`${baseUrl}/${nextStepId}`);
      
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