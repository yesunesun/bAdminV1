// src/modules/owner/components/property/wizard/PropertyForm/components/StepNavigation.tsx
// Version: 4.0.0
// Last Modified: 29-05-2025 17:30 IST
// Purpose: Enhanced step navigation with validation blocking and progress indicators

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // Function to proceed to the next step
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
    
    handleNextStep();
  };

  // Get button states
  const isNextDisabled = !canProceed || isValidating;
  const isPrevDisabled = formStep === 1 || disablePrevious || isValidating;

  // Progress indicator component
  const ProgressIndicator = () => {
    if (!showProgress || variant === 'minimal') return null;

    return (
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1">
          {canProceed ? (
            <CheckCircle2 className={cn(config.icon, 'text-green-500')} />
          ) : (
            <AlertCircle className={cn(config.icon, 'text-amber-500')} />
          )}
          <span className={config.text}>
            {canProceed ? 'Ready to continue' : `${requiredFieldsRemaining} required field${requiredFieldsRemaining !== 1 ? 's' : ''} remaining`}
          </span>
        </div>
        
        {completionPercentage > 0 && (
          <div className="flex items-center gap-1">
            <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className={cn(config.text, 'text-slate-500 dark:text-slate-400 min-w-[3ch]')}>
              {completionPercentage}%
            </span>
          </div>
        )}
      </div>
    );
  };

  // Validation summary component
  const ValidationSummary = () => {
    if (!showValidationSummary || variant === 'minimal' || validationErrors.length === 0) return null;

    return (
      <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
        <AlertCircle className={cn(config.icon, 'text-red-500 mt-0.5 flex-shrink-0')} />
        <div className="flex-1">
          <p className={cn(config.text, 'text-red-700 dark:text-red-300 font-medium mb-1')}>
            Please fix the following issues:
          </p>
          <ul className={cn(config.text, 'text-red-600 dark:text-red-400 space-y-0.5')}>
            {validationErrors.slice(0, 3).map((error, index) => (
              <li key={index} className="flex items-start gap-1">
                <span className="text-red-400 select-none">•</span>
                <span>{error}</span>
              </li>
            ))}
            {validationErrors.length > 3 && (
              <li className="text-red-500 font-medium">
                + {validationErrors.length - 3} more issue{validationErrors.length - 3 !== 1 ? 's' : ''}
              </li>
            )}
          </ul>
        </div>
      </div>
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
        
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isNextDisabled}
          size={size}
          className={cn(config.button)}
        >
          {isValidating ? (
            <>
              <div className={cn(config.icon, 'animate-spin rounded-full border-2 border-current border-t-transparent')} />
              Validating...
            </>
          ) : (
            <>
              Next
              <ArrowRight className={config.icon} />
            </>
          )}
        </Button>
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
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isNextDisabled}
          size={size}
          className={cn(
            config.button,
            'transition-all duration-200',
            !canProceed && 'bg-amber-500 hover:bg-amber-600 border-amber-500 hover:border-amber-600'
          )}
        >
          {isValidating ? (
            <>
              <div className={cn(config.icon, 'animate-spin rounded-full border-2 border-current border-t-transparent')} />
              Validating...
            </>
          ) : (
            <>
              {canProceed ? 'Continue' : 'Complete Required Fields'}
              <ArrowRight className={config.icon} />
            </>
          )}
        </Button>
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