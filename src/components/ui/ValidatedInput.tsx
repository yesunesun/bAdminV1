// src/components/ui/ValidatedInput.tsx
// Version: 1.0.0
// Last Modified: 29-05-2025 17:00 IST
// Purpose: Input component with integrated validation feedback

import React, { forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { FormFieldLabel, ValidationState } from '@/components/ui/RequiredLabel';
import { UseFormReturn } from 'react-hook-form';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Form integration
  form?: UseFormReturn<any>;
  name: string;
  
  // Label props
  label: string;
  required?: boolean;
  helperText?: string;
  
  // Validation props  
  error?: string | null;
  isValid?: boolean;
  isTouched?: boolean;
  onValidation?: (fieldName: string, value: any) => void;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'filled';
  
  // Container props
  containerClassName?: string;
  labelClassName?: string;
}

export const ValidatedInput = forwardRef<HTMLInputElement, ValidatedInputProps>(({
  // Form props
  form,
  name,
  
  // Label props
  label,
  required = false,
  helperText,
  
  // Validation props
  error,
  isValid,
  isTouched,
  onValidation,
  
  // Appearance
  size = 'md',
  variant = 'default',
  
  // Container props
  containerClassName,
  labelClassName,
  className,
  
  // Input props
  type = 'text',
  placeholder,
  disabled,
  onChange,
  onBlur,
  onFocus,
  value,
  defaultValue,
  ...props
}, ref) => {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      input: 'h-8 text-sm px-2',
      container: 'space-y-1'
    },
    md: {
      input: 'h-10 text-sm px-3',
      container: 'space-y-1.5'
    },
    lg: {
      input: 'h-12 text-base px-4',
      container: 'space-y-2'
    }
  };

  const config = sizeConfig[size];

  // Get validation state for styling
  const getValidationState = (): ValidationState => {
    if (!isTouched) return 'idle';
    if (error) return 'invalid';
    if (required && isValid) return 'valid';
    if (required && !isValid) return 'required';
    return 'idle';
  };

  const validationState = getValidationState();

  // Get input styling based on validation state
  const getInputClassName = () => {
    const baseClasses = cn(
      config.input,
      'flex w-full rounded-md border bg-background text-foreground transition-colors',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    );

    // Apply validation-specific styling
    switch (validationState) {
      case 'valid':
        return cn(
          baseClasses,
          'border-green-300 focus-visible:border-green-400 focus-visible:ring-green-500/20',
          'dark:border-green-700 dark:focus-visible:border-green-600'
        );
      case 'invalid':
      case 'required':
        return cn(
          baseClasses,
          'border-red-300 focus-visible:border-red-400 focus-visible:ring-red-500/20',
          'dark:border-red-700 dark:focus-visible:border-red-600'
        );
      default:
        return cn(
          baseClasses,
          'border-input focus-visible:ring-ring/20'
        );
    }
  };

  // Handle change event with validation
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Call original onChange if provided
    onChange?.(event);
    
    // Trigger validation if callback provided
    if (onValidation) {
      onValidation(name, value);
    }
    
    // Update form value if form is provided
    if (form) {
      form.setValue(name, value, { shouldValidate: isTouched });
    }
  };

  // Handle blur event for validation
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Call original onBlur if provided
    onBlur?.(event);
    
    // Trigger validation on blur
    if (onValidation) {
      onValidation(name, event.target.value);
    }
  };

  // Handle focus event
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    onFocus?.(event);
  };

  // Effect to register field with form if provided
  useEffect(() => {
    if (form && !form.formState.defaultValues?.[name]) {
      form.register(name);
    }
  }, [form, name]);

  return (
    <div className={cn(config.container, containerClassName)}>
      {/* Label with validation feedback */}
      <FormFieldLabel
        fieldName={name}
        required={required}
        isValid={isValid}
        isTouched={isTouched}
        error={error}
        helperText={helperText}
        size={size}
        className={labelClassName}
      >
        {label}
      </FormFieldLabel>
      
      {/* Input field */}
      <Input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        defaultValue={defaultValue}
        className={getInputClassName()}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        aria-invalid={validationState === 'invalid'}
        aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        {...props}
      />
    </div>
  );
});

ValidatedInput.displayName = 'ValidatedInput';

export default ValidatedInput;