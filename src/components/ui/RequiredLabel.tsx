// src/components/ui/RequiredLabel.tsx
// Version: 2.0.0 
// Last Modified: 29-05-2025 16:45 IST
// Purpose: Enhanced RequiredLabel with validation states and better accessibility

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export type ValidationState = 'idle' | 'valid' | 'invalid' | 'required';

interface RequiredLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
  errorText?: string;
  className?: string;
  labelClassName?: string;
  validationState?: ValidationState;
  showValidationIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'default' | 'minimal';
}

export function RequiredLabel({ 
  htmlFor, 
  required = false,
  children, 
  helperText,
  errorText,
  className,
  labelClassName,
  validationState = 'idle',
  showValidationIcon = true,
  size = 'md',
  theme = 'default'
}: RequiredLabelProps) {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      label: 'text-xs',
      icon: 'h-3 w-3',
      helper: 'text-xs',
      spacing: 'space-y-0.5'
    },
    md: {
      label: 'text-sm',
      icon: 'h-4 w-4',
      helper: 'text-xs',
      spacing: 'space-y-1'
    },
    lg: {
      label: 'text-base',
      icon: 'h-4 w-4',
      helper: 'text-sm',
      spacing: 'space-y-1.5'
    }
  };

  const config = sizeConfig[size];

  // Determine which text to show (error takes priority)
  const displayText = errorText || helperText;
  const textType = errorText ? 'error' : 'helper';

  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidationIcon) return null;
    
    switch (validationState) {
      case 'valid':
        return <CheckCircle2 className={cn(config.icon, 'text-green-500')} />;
      case 'invalid':
        return <AlertCircle className={cn(config.icon, 'text-red-500')} />;
      case 'required':
        return <AlertCircle className={cn(config.icon, 'text-amber-500')} />;
      default:
        return null;
    }
  };

  // Get theme-specific styles
  const getThemeStyles = () => {
    if (theme === 'minimal') {
      return {
        label: 'text-slate-700 dark:text-slate-200',
        required: 'text-red-400',
        helper: 'text-slate-500 dark:text-slate-400',
        error: 'text-red-500 dark:text-red-400'
      };
    }
    
    return {
      label: 'text-slate-700 dark:text-slate-200 font-medium',
      required: 'text-red-500',
      helper: 'text-slate-500 dark:text-slate-400',
      error: 'text-red-600 dark:text-red-400 font-medium'
    };
  };

  const themeStyles = getThemeStyles();

  return (
    <div className={cn(config.spacing, className)}>
      {/* Label row with validation icon */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Label 
            htmlFor={htmlFor} 
            className={cn(
              config.label,
              themeStyles.label,
              labelClassName
            )}
          >
            {children}
          </Label>
          {required && (
            <span 
              className={cn(
                'leading-none select-none',
                config.label,
                themeStyles.required
              )}
              aria-label="Required field"
              title="This field is required"
            >
              *
            </span>
          )}
        </div>
        
        {/* Validation icon */}
        {getValidationIcon()}
      </div>
      
      {/* Helper/Error text */}
      {displayText && (
        <div className="flex items-start gap-1">
          {textType === 'error' && !showValidationIcon && (
            <AlertCircle className={cn(config.icon, 'text-red-500 mt-0.5 flex-shrink-0')} />
          )}
          {textType === 'helper' && helperText && (
            <Info className={cn(config.icon, 'text-slate-400 mt-0.5 flex-shrink-0')} />
          )}
          <p 
            className={cn(
              config.helper,
              'leading-relaxed',
              textType === 'error' ? themeStyles.error : themeStyles.helper
            )}
            role={textType === 'error' ? 'alert' : 'note'}
            aria-live={textType === 'error' ? 'polite' : 'off'}
          >
            {displayText}
          </p>
        </div>
      )}
    </div>
  );
}

// Enhanced required label specifically for form fields
export interface FormFieldLabelProps extends RequiredLabelProps {
  fieldName: string;
  isValid?: boolean;
  isTouched?: boolean;
  error?: string | null;
}

export function FormFieldLabel({
  fieldName,
  isValid,
  isTouched,
  error,
  required,
  children,
  helperText,
  ...props
}: FormFieldLabelProps) {
  // Determine validation state based on field status
  const getValidationState = (): ValidationState => {
    if (!isTouched) return 'idle';
    if (error) return 'invalid';
    if (required && isValid) return 'valid';
    if (required && !isValid) return 'required';
    return 'idle';
  };

  return (
    <RequiredLabel
      htmlFor={fieldName}
      required={required}
      helperText={helperText}
      errorText={error || undefined}
      validationState={getValidationState()}
      {...props}
    >
      {children}
    </RequiredLabel>
  );
}

// Re-export types for convenience
export type { RequiredLabelProps, ValidationState };