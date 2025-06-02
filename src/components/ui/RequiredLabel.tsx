// src/components/ui/RequiredLabel.tsx
// Version: 2.0.0
// Last Modified: 29-05-2025 18:15 IST
// Purpose: Enhanced label component with validation states and feedback

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export type ValidationState = 'idle' | 'valid' | 'invalid' | 'required';

interface RequiredLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

interface FormFieldLabelProps extends RequiredLabelProps {
  fieldName: string;
  isValid?: boolean;
  isTouched?: boolean;
  error?: string | null;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Basic RequiredLabel component (backward compatibility)
export function RequiredLabel({
  required = false,
  children,
  className,
  ...props
}: RequiredLabelProps) {
  return (
    <Label
      className={cn(
        "text-sm font-medium text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-label="required">
          *
        </span>
      )}
    </Label>
  );
}

// Enhanced FormFieldLabel with validation states
export function FormFieldLabel({
  fieldName,
  required = false,
  isValid,
  isTouched,
  error,
  helperText,
  size = 'md',
  children,
  className,
  ...props
}: FormFieldLabelProps) {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      label: 'text-xs',
      helper: 'text-xs',
      error: 'text-xs'
    },
    md: {
      label: 'text-sm',
      helper: 'text-xs',
      error: 'text-xs'
    },
    lg: {
      label: 'text-base',
      helper: 'text-sm',
      error: 'text-sm'
    }
  };

  const config = sizeConfig[size];

  // Determine validation state
  const getValidationState = (): ValidationState => {
    if (!isTouched) return 'idle';
    if (error) return 'invalid';
    if (required && isValid) return 'valid';
    if (required && !isValid) return 'required';
    return 'idle';
  };

  const validationState = getValidationState();

  // Get label styling based on validation state
  const getLabelClassName = () => {
    const baseClasses = cn(
      config.label,
      'font-medium transition-colors',
      className
    );

    switch (validationState) {
      case 'valid':
        return cn(baseClasses, 'text-green-700 dark:text-green-400');
      case 'invalid':
      case 'required':
        return cn(baseClasses, 'text-red-700 dark:text-red-400');
      default:
        return cn(baseClasses, 'text-gray-700 dark:text-gray-300');
    }
  };

  // Get validation icon
  const getValidationIcon = () => {
    switch (validationState) {
      case 'valid':
        return (
          <span className="text-green-500 ml-1" aria-label="valid">
            ✓
          </span>
        );
      case 'invalid':
      case 'required':
        return (
          <span className="text-red-500 ml-1" aria-label="error">
            !
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      {/* Main label */}
      <Label
        htmlFor={fieldName}
        className={getLabelClassName()}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
        {getValidationIcon()}
      </Label>

      {/* Helper text */}
      {helperText && !error && (
        <p 
          id={`${fieldName}-helper`}
          className={cn(
            config.helper,
            'text-gray-500 dark:text-gray-400'
          )}
        >
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && isTouched && (
        <p 
          id={`${fieldName}-error`}
          className={cn(
            config.error,
            'text-red-600 dark:text-red-400 flex items-center gap-1'
          )}
          role="alert"
        >
          <span className="text-red-500">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}

// Export both for backward compatibility
export default RequiredLabel;