// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 4.2.0
// Last Modified: 16-07-2025 15:15 IST
// Purpose: Fixed location button logic - prioritizes Find Location when coordinates missing

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationContext {
  isLocationStep: boolean;
  hasCoordinates: boolean;
  isFetchingCoordinates: boolean;
  onFindLocation?: () => Promise<boolean>;
  canAutoFetch: boolean;
  coordinatesMissing?: boolean;
}

interface StepNavigationProps {
  formStep: number;
  STEPS: Array<{ id: string; title: string }>;
  handlePreviousStep: () => void;
  handleNextStep: () => void;
  isLastStep?: boolean;
  disablePrevious?: boolean;
  
  // Enhanced validation props
  canProceed?: boolean;
  isValidating?: boolean;
  validationErrors?: string[];
  completionPercentage?: number;
  requiredFieldsRemaining?: number;
  
  // Location context props
  locationContext?: LocationContext;
  
  // Customization props
  showProgress?: boolean;
  showValidationSummary?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  formStep,
  STEPS,
  handlePreviousStep,
  handleNextStep,
  isLastStep = false,
  disablePrevious = false,
  
  // Enhanced validation props
  canProceed = true,
  isValidating = false,
  validationErrors = [],
  completionPercentage = 0,
  requiredFieldsRemaining = 0,
  
  // Location context props
  locationContext,
  
  // Customization props
  showProgress = true,
  showValidationSummary = true,
  size = 'md',
  variant = 'default'
}) => {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'h-8 px-3 text-sm',
      icon: 'h-3 w-3',
      text: 'text-xs'
    },
    md: {
      button: 'h-10 px-4 text-sm',
      icon: 'h-4 w-4',
      text: 'text-sm'
    },
    lg: {
      button: 'h-12 px-6 text-base',
      icon: 'h-5 w-5',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Hide the navigation completely on the review step 
  // since we have our own buttons in the PropertySummary component
  if (isLastStep) {
    return null;
  }

  // Determine button behavior based on location context
  const isLocationStep = locationContext?.isLocationStep || false;
  const hasCoordinates = locationContext?.hasCoordinates || false;
  const isFetchingCoordinates = locationContext?.isFetchingCoordinates || false;
  const canAutoFetch = locationContext?.canAutoFetch || false;
  const coordinatesMissing = locationContext?.coordinatesMissing || false;

  // SIMPLIFIED LOGIC: Always show "Next" button, never show "Find Location"
  // The Next button will handle coordinate fetching internally
  
  // Button is disabled if:
  // 1. General validation fails (canProceed = false) OR
  // 2. Currently validating/fetching
  const isActionButtonDisabled = !canProceed || isValidating || isFetchingCoordinates;

  console.log('[StepNavigation] Button logic:', {
    isLocationStep,
    hasCoordinates,
    coordinatesMissing,
    canProceed,
    isActionButtonDisabled,
    isFetchingCoordinates
  });

  // Function to proceed to the next step (handles both regular and location logic)
  const handleContinue = (event: React.MouseEvent) => {
    event.preventDefault();
    
    if (!canProceed) {
      // Scroll to first error or show validation summary
      const firstErrorElement = document.querySelector('[aria-invalid="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Always call handleNextStep - it will handle coordinate logic internally
    handleNextStep();
  };

  // Get button states for Previous button
  const isPrevDisabled = formStep === 1 || disablePrevious || isValidating || isFetchingCoordinates;

  // Progress indicator component - REMOVED: Now handled by UnifiedStepIndicator
  const ProgressIndicator = () => {
    // Always return null - progress is now handled by UnifiedStepIndicator
    return null;
  };

  // Validation summary component - REMOVED: Now handled by UnifiedStepIndicator
  const ValidationSummary = () => {
    // Always return null - validation summary is now handled by UnifiedStepIndicator
    return null;
  };

  // Render Next Button (always show Next, never Find Location)
  const renderActionButton = () => {
    return (
      <Button
        type="button"
        onClick={handleContinue}
        disabled={isActionButtonDisabled}
        size={size}
        className={cn(
          config.button,
          'transition-all duration-200',
          !canProceed && 'bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600',
          isActionButtonDisabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isValidating || isFetchingCoordinates ? (
          <>
            <div className={cn(config.icon, 'animate-spin rounded-full border-2 border-current border-t-transparent')} />
            {isFetchingCoordinates ? 'Getting Location...' : 'Validating...'}
          </>
        ) : (
          <>
            {canProceed ? 'Next' : 'Complete Required Fields'}
            <ArrowRight className={config.icon} />
          </>
        )}
      </Button>
    );
  };

  if (variant === 'minimal') {
    return (
      <div className="flex justify-between items-center">
        <Button
          type="button"
          onClick={handlePreviousStep}
          disabled={isPrevDisabled}
          variant="outline"
          size={size}
          className={cn(config.button)}
        >
          <ArrowLeft className={config.icon} />
          Previous
        </Button>
        
        {renderActionButton()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress and validation info */}
      <div className="space-y-3">
        <ProgressIndicator />
        <ValidationSummary />
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        {/* Previous button */}
        <Button
          type="button"
          onClick={handlePreviousStep}
          disabled={isPrevDisabled}
          variant="outline"
          size={size}
          className={cn(
            config.button,
            'transition-all duration-200'
          )}
        >
          <ArrowLeft className={config.icon} />
          Previous
        </Button>
        
        {/* Next button */}
        {renderActionButton()}
      </div>
      
      {/* Step indicator */}
      {showProgress && (
        <div className="flex justify-center">
          <span className={cn(config.text, 'text-slate-500 dark:text-slate-400')}>
            Step {formStep} of {STEPS.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default StepNavigation;