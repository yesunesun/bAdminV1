// src/components/ui/ValidatedSelect.tsx
// Version: 1.0.0
// Last Modified: 29-05-2025 17:15 IST
// Purpose: Select component with integrated validation feedback

import React, { forwardRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormFieldLabel, ValidationState } from '@/components/ui/RequiredLabel';
import { UseFormReturn } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ValidatedSelectProps {
  // Form integration
  form?: UseFormReturn<any>;
  name: string;
  
  // Label props
  label: string;
  required?: boolean;
  helperText?: string;
  
  // Select options
  options: SelectOption[];
  placeholder?: string;
  
  // Validation props  
  error?: string | null;
  isValid?: boolean;
  isTouched?: boolean;
  onValidation?: (fieldName: string, value: any) => void;
  
  // Appearance
  size?: 'sm' | 'md' | 'lg';
  
  // Event handlers
  onValueChange?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  
  // State
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  
  // Container props
  containerClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
}

export const ValidatedSelect = forwardRef<HTMLButtonElement, ValidatedSelectProps>(({
  // Form props
  form,
  name,
  
  // Label props
  label,
  required = false,
  helperText,
  
  // Select options
  options,
  placeholder = "Select an option...",
  
  // Validation props
  error,
  isValid,
  isTouched,
  onValidation,
  
  // Appearance
  size = 'md',
  
  // Event handlers
  onValueChange,
  onOpenChange,
  
  // State
  value,
  defaultValue,
  disabled = false,
  
  // Container props
  containerClassName,
  labelClassName,
  triggerClassName,
}, ref) => {
  
  // Size configurations
  const sizeConfig = {
    sm: {
      trigger: 'h-8 text-sm px-2',
      container: 'space-y-1'
    },
    md: {
      trigger: 'h-10 text-sm px-3',
      container: 'space-y-1.5'
    },
    lg: {
      trigger: 'h-12 text-base px-4',
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

  // Get trigger styling based on validation state
  const getTriggerClassName = () => {
    const baseClasses = cn(
      config.trigger,
      'flex w-full items-center justify-between rounded-md border bg-background text-foreground',
      'placeholder:text-muted-foreground transition-colors',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      triggerClassName
    );

    // Apply validation-specific styling
    switch (validationState) {
      case 'valid':
        return cn(
          baseClasses,
          'border-green-300 focus:border-green-400 focus:ring-green-500/20',
          'dark:border-green-700 dark:focus:border-green-600'
        );
      case 'invalid':
      case 'required':
        return cn(
          baseClasses,
          'border-red-300 focus:border-red-400 focus:ring-red-500/20',
          'dark:border-red-700 dark:focus:border-red-600'
        );
      default:
        return cn(
          baseClasses,
          'border-input focus:ring-ring/20'
        );
    }
  };

  // Handle value change with validation
  const handleValueChange = (newValue: string) => {
    // Call original onValueChange if provided
    onValueChange?.(newValue);
    
    // Trigger validation if callback provided
    if (onValidation) {
      onValidation(name, newValue);
    }
    
    // Update form value if form is provided
    if (form) {
      form.setValue(name, newValue, { shouldValidate: isTouched });
    }
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
      
      {/* Select field */}
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        onOpenChange={onOpenChange}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          id={name}
          className={getTriggerClassName()}
          aria-invalid={validationState === 'invalid'}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

ValidatedSelect.displayName = 'ValidatedSelect';

export default ValidatedSelect;