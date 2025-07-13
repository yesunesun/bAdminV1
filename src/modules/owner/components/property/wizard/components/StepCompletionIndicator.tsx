// src/modules/owner/components/property/wizard/components/StepCompletionIndicator.tsx
// Version: 1.0.0
// Created: 2025-01-13
// Purpose: Reusable completion indicator for all flows to show mandatory field completion status

import React from 'react';
import { cn } from '@/lib/utils';

interface StepCompletionIndicatorProps {
  /** Current completion percentage (0-100) */
  completionPercentage: number;
  /** List of unfilled required field names */
  unfilledFields: string[];
  /** Whether all required fields are completed */
  isStepValid: boolean;
  /** Custom class name for the container */
  className?: string;
  /** Theme variant */
  variant?: 'blue' | 'green' | 'orange';
}

export function StepCompletionIndicator({
  completionPercentage,
  unfilledFields,
  isStepValid,
  className,
  variant = 'blue'
}: StepCompletionIndicatorProps) {
  
  // Theme configurations
  const themes = {
    blue: {
      container: 'bg-blue-50 border-blue-200',
      text: {
        primary: 'text-blue-900',
        secondary: 'text-blue-700',
        muted: 'text-blue-600'
      },
      progress: {
        background: 'bg-blue-200',
        fill: 'bg-blue-600'
      }
    },
    green: {
      container: 'bg-green-50 border-green-200',
      text: {
        primary: 'text-green-900',
        secondary: 'text-green-700',
        muted: 'text-green-600'
      },
      progress: {
        background: 'bg-green-200',
        fill: 'bg-green-600'
      }
    },
    orange: {
      container: 'bg-orange-50 border-orange-200',
      text: {
        primary: 'text-orange-900',
        secondary: 'text-orange-700',
        muted: 'text-orange-600'
      },
      progress: {
        background: 'bg-orange-200',
        fill: 'bg-orange-600'
      }
    }
  };

  const theme = themes[variant];

  return (
    <div className={cn(
      "mb-6 p-4 rounded-lg border",
      theme.container,
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-sm font-medium", theme.text.primary)}>
          Step Completion: {completionPercentage}%
        </span>
        <span className={cn("text-xs", theme.text.secondary)}>
          {isStepValid ? '✅ Ready to proceed' : '⚠️ Please complete required fields'}
        </span>
      </div>
      
      <div className={cn("w-full rounded-full h-2", theme.progress.background)}>
        <div 
          className={cn("h-2 rounded-full transition-all duration-300", theme.progress.fill)}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      
      {!isStepValid && unfilledFields.length > 0 && (
        <div className={cn("text-xs mt-2", theme.text.muted)}>
          <span className="font-medium">Remaining fields: </span>
          <span>{unfilledFields.join(', ')}</span>
        </div>
      )}
    </div>
  );
}