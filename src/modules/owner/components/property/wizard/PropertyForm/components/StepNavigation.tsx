// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 3.0.0
// Last Modified: 02-05-2025 20:00 IST
// Purpose: Fixed property saving and direct navigation

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';

interface StepNavigationProps {
  formStep: number;
  STEPS: Array<{ id: string; title: string }>;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  savedPropertyId?: string;
  onSave?: () => Promise<string | undefined>;
  onPublish?: () => Promise<string>;
  isLastStep?: boolean;
  disablePrevious?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  formStep,
  STEPS,
  handlePreviousStep,
  handleNextStep,
  savedPropertyId,
  onSave,
  onPublish,
  isLastStep = false,
  disablePrevious = false
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const isLastStepInFlow = formStep === STEPS.length;
  
  // Function to handle the "Save and Continue" action in the last step
  const handleSaveAndNavigate = async (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent any default form submission
    
    // If we're already saving, don't allow multiple clicks
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      setErrorMessage(null);
      
      // Use onPublish which should be the save and publish function
      if (typeof onPublish === 'function') {
        console.log('Starting save and publish process...');
        const propertyId = await onPublish();
        
        if (!propertyId) {
          throw new Error('No property ID returned after saving');
        }
        
        console.log('Property saved successfully with ID:', propertyId);
        
        // Navigate directly to the property details page
        const detailsPath = `/seeker/property/${propertyId}`;
        console.log('Navigating to:', detailsPath);
        
        // Use direct window location change to ensure immediate navigation
        window.location.href = detailsPath;
        
      } else {
        throw new Error('Save function not available');
      }
    } catch (error: any) {
      console.error('Error in save and navigate:', error);
      setErrorMessage(error.message || 'Error saving property');
      // Don't show alert or popup, just log the error
    } finally {
      setIsSaving(false);
    }
  };
  
  // Function to just proceed to the next step when not on the last step
  const handleContinue = (event: React.MouseEvent) => {
    event.preventDefault();
    handleNextStep();
  };
  
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
        disabled={formStep === 1 || disablePrevious || isSaving}
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </button>
      
      {/* Error message inline */}
      {errorMessage && (
        <p className="text-sm text-destructive mx-2">{errorMessage}</p>
      )}
      
      {/* Next/Save button */}
      {isLastStepInFlow || isLastStep ? (
        <button
          type="button"
          onClick={handleSaveAndNavigate}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm rounded",
            "bg-primary text-primary-foreground",
            "hover:bg-primary/90 transition-colors",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-primary-foreground" viewBox="0 0 24 24">
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                  fill="none"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Save and Continue
            </>
          )}
        </button>
      ) : (
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
      )}
    </div>
  );
};

export default StepNavigation;