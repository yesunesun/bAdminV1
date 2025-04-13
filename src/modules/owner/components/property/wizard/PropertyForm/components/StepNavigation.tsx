// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 7.4.0
// Last Modified: 13-04-2025 16:30 IST
// Purpose: Fixed navigation issue in Commercial Sale flow

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

  // Determine property type from URL - FIXED: Added Flatmates detection
  const getPropertyType = () => {
    const urlPath = window.location.pathname.toLowerCase();
    // Check for flatmates flow first (new case)
    if (urlPath.includes('flatmate')) {
      console.log('Detected FLATMATES flow from URL');
      return 'flatmates';
    } else if (urlPath.includes('pghostel')) {
      return 'pghostel';
    } else if (urlPath.includes('commercial') && (urlPath.includes('sale') || urlPath.includes('sell'))) {
      console.log('Detected COMMERCIAL SALE flow from URL');
      return 'commercial_sale';
    } else if (urlPath.includes('commercial') && (urlPath.includes('rent') || urlPath.includes('lease'))) {
      return 'commercial_rent';
    } else if (urlPath.includes('coworking') || urlPath.includes('co-working')) {
      return 'coworking';
    } else if (urlPath.includes('land') || urlPath.includes('plot')) {
      return 'land_sale';
    } else if (urlPath.includes('sale') || urlPath.includes('sell')) {
      return 'sale';
    } else {
      return 'rent';
    }
  };

  // Get the correct flow steps for the current property type - UPDATED: Added Commercial Rent flow without commercial details
  const getFlowSteps = () => {
    const propertyType = getPropertyType();
    
    // Use switch for better readability
    switch(propertyType) {
      case 'flatmates':
        // Flatmates flow
        return ['details', 'location', 'flatmate_details', 'features', 'review', 'photos'];
      case 'pghostel':
        // PG/Hostel flow
        return ['room_details', 'location', 'pg_details', 'features', 'review', 'photos'];
      case 'commercial_rent':
        // Commercial Rent flow (updated to remove commercial details tab)
        return ['details', 'location', 'rental', 'features', 'review', 'photos'];
      case 'commercial_sale':
        // Commercial Sale flow
        return ['details', 'location', 'commercial_sale', 'features', 'review', 'photos'];
      case 'coworking':
        // Co-working flow
        return ['details', 'location', 'coworking', 'features', 'review', 'photos'];
      case 'land_sale':
        // Land/Plot flow
        return ['land_details', 'location', 'land_features', 'review', 'photos'];
      case 'sale':
        // Sale flow
        return ['details', 'location', 'sale', 'features', 'review', 'photos'];
      default:
        // Rental flow (default)
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
  
  // Custom next button handler - FIXED: Added special case handling for flatmates flow and commercial sale flow
  const onNextClick = () => {
    try {
      // CRITICAL FIX: Special case for flatmates flow location step
      if (window.location.pathname.toLowerCase().includes('flatmate') && 
          currentStepId === 'location') {
        console.log('CRITICAL FIX: Detected Location step in Flatmates flow');
        
        // Extract the base path for flatmates flow
        const basePath = window.location.pathname.match(/(.*)\/location/)?.[1];
        if (basePath) {
          // Form the correct next URL
          const nextUrl = `${basePath}/flatmate_details`;
          console.log('Navigating to flatmate_details:', nextUrl);
          
          // Use navigate with replace to avoid back button issues
          navigate(nextUrl, { replace: true });
          return; // Exit early
        }
      }
      
      // CRITICAL FIX: Special case for commercial sale flow
      if (window.location.pathname.toLowerCase().includes('commercial') && 
          window.location.pathname.toLowerCase().includes('sale') && 
          currentStepId === 'location') {
        console.log('CRITICAL FIX: Detected Location step in Commercial Sale flow');
        
        // Extract the base path for commercial sale flow
        const basePath = window.location.pathname.match(/(.*)\/location/)?.[1];
        if (basePath) {
          // Form the correct next URL without 'rental' in the path
          const properPath = basePath.replace(/\/rental$/, '');
          const nextUrl = `${properPath}/commercial_sale`;
          console.log('Navigating to commercial_sale:', nextUrl);
          
          // Use navigate with replace to avoid back button issues
          navigate(nextUrl, { replace: true });
          return; // Exit early
        }
      }
      
      // Standard navigation logic for other cases
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