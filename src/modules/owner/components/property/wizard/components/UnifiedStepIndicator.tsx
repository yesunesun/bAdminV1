// src/modules/owner/components/property/wizard/components/UnifiedStepIndicator.tsx
// Version: 1.0.0
// Purpose: Unified professional step completion indicator combining progress bar and validation status

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';

export interface MandatoryField {
  name: string;
  label: string;
  isCompleted: boolean;
  category?: 'basic' | 'location' | 'details' | 'features';
}

interface UnifiedStepIndicatorProps {
  // Validation status
  isValid: boolean;
  completionPercentage: number;
  requiredFieldsRemaining: number;
  totalRequiredFields: number;
  
  // Step information
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
  
  // Mandatory fields tracking
  mandatoryFields?: MandatoryField[];
  
  // Actions
  canProceed: boolean;
  onNext?: () => void;
  nextButtonText?: string;
  
  // Styling
  variant?: 'default' | 'compact' | 'minimal';
  showStepCounter?: boolean;
  showFieldChecklist?: boolean;
  className?: string;
}

export const UnifiedStepIndicator: React.FC<UnifiedStepIndicatorProps> = ({
  isValid,
  completionPercentage,
  requiredFieldsRemaining,
  totalRequiredFields,
  currentStep,
  totalSteps,
  stepTitle,
  mandatoryFields = [],
  canProceed,
  onNext,
  nextButtonText = 'Continue',
  variant = 'default',
  showStepCounter = true,
  showFieldChecklist = true,
  className
}) => {
  // Calculate completed fields
  const completedFields = totalRequiredFields - requiredFieldsRemaining;
  
  // Determine status and colors
  const getStatusConfig = () => {
    if (isValid && completionPercentage === 100) {
      return {
        icon: CheckCircle2,
        iconColor: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        progressColor: 'bg-green-500',
        statusText: 'Step completed',
        statusColor: 'text-green-700 dark:text-green-300'
      };
    } else if (completionPercentage >= 75) {
      return {
        icon: ArrowRight,
        iconColor: 'text-blue-500',
        bgColor: 'bg-blue-50 dark:bg-blue-950/20',
        borderColor: 'border-blue-200 dark:border-blue-800',
        progressColor: 'bg-blue-500',
        statusText: 'Almost ready',
        statusColor: 'text-blue-700 dark:text-blue-300'
      };
    } else if (completionPercentage > 0) {
      return {
        icon: Clock,
        iconColor: 'text-amber-500',
        bgColor: 'bg-amber-50 dark:bg-amber-950/20',
        borderColor: 'border-amber-200 dark:border-amber-800',
        progressColor: 'bg-amber-500',
        statusText: 'In progress',
        statusColor: 'text-amber-700 dark:text-amber-300'
      };
    } else {
      return {
        icon: AlertCircle,
        iconColor: 'text-slate-500',
        bgColor: 'bg-slate-50 dark:bg-slate-950/20',
        borderColor: 'border-slate-200 dark:border-slate-800',
        progressColor: 'bg-slate-400',
        statusText: 'Not started',
        statusColor: 'text-slate-600 dark:text-slate-400'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <StatusIcon className={cn('h-4 w-4', statusConfig.iconColor)} />
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className={statusConfig.statusColor}>
              {isValid ? 'Ready to continue' : `${requiredFieldsRemaining} field${requiredFieldsRemaining !== 1 ? 's' : ''} remaining`}
            </span>
            <span className="text-slate-500 text-xs">{completionPercentage}%</span>
          </div>
          
          {/* Single progress bar */}
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
            <div 
              className={cn('h-full transition-all duration-500 ease-out', statusConfig.progressColor)}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'p-4 rounded-lg border',
        statusConfig.bgColor,
        statusConfig.borderColor,
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn('h-5 w-5', statusConfig.iconColor)} />
            <h3 className={cn('text-sm font-medium', statusConfig.statusColor)}>
              {statusConfig.statusText}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {completionPercentage}%
            </span>
          </div>
        </div>

        {/* Single Progress Bar */}
        <div className="mb-3">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn('h-full transition-all duration-500 ease-out', statusConfig.progressColor)}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>


        {/* Status Message */}
        <div className="flex items-center justify-between">
          <p className={cn('text-xs', statusConfig.statusColor)}>
            {isValid 
              ? '✅ Ready to proceed to the next step' 
              : requiredFieldsRemaining === 1 
              ? '⏳ Complete 1 more required field to continue'
              : `⏳ Complete ${requiredFieldsRemaining} more required fields to continue`
            }
          </p>
          
          {onNext && canProceed && (
            <button
              onClick={onNext}
              className={cn(
                'text-xs font-medium px-3 py-1 rounded-md transition-colors',
                'bg-primary text-primary-foreground hover:bg-primary/90',
                'focus:outline-none focus:ring-2 focus:ring-primary/30'
              )}
            >
              {nextButtonText}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn(
      'p-4 rounded-lg border',
      statusConfig.bgColor,
      statusConfig.borderColor,
      className
    )}>
      {/* Header with status info */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={cn('h-5 w-5', statusConfig.iconColor)} />
          <h3 className={cn('font-medium', statusConfig.statusColor)}>
            {statusConfig.statusText}
          </h3>
        </div>
        
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {completionPercentage}%
        </span>
      </div>

      {/* Single Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className={statusConfig.statusColor}>
            Progress: {completionPercentage}%
          </span>
          {requiredFieldsRemaining > 0 ? (
            <span className="text-slate-600 dark:text-slate-400">
              {requiredFieldsRemaining} field{requiredFieldsRemaining !== 1 ? 's' : ''} remaining
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400 font-medium">
              All fields completed ✓
            </span>
          )}
        </div>
        
        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            className={cn('h-full transition-all duration-500 ease-out', statusConfig.progressColor)}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>


      {/* Status message */}
      <div className="flex items-center justify-between">
        <p className={cn('text-sm', statusConfig.statusColor)}>
          {isValid 
            ? '✅ Ready to proceed to the next step' 
            : requiredFieldsRemaining === 1 
            ? '⏳ Complete 1 more required field to continue'
            : `⏳ Complete ${requiredFieldsRemaining} more required fields to continue`
          }
        </p>
        
        {onNext && canProceed && (
          <button
            onClick={onNext}
            className={cn(
              'text-sm font-medium px-3 py-1 rounded-md transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'focus:outline-none focus:ring-2 focus:ring-primary/30'
            )}
          >
            {nextButtonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default UnifiedStepIndicator;