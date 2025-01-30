// src/components/ui/RequiredLabel.tsx
// Version: 1.0.0 
// Last Modified: 30-01-2025 16:30 IST

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface RequiredLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  helperText?: string;
  className?: string;
  labelClassName?: string;
}

export function RequiredLabel({ 
  htmlFor, 
  required, 
  children, 
  helperText,
  className,
  labelClassName
}: RequiredLabelProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-1">
        <Label 
          htmlFor={htmlFor} 
          className={cn(
            "text-sm font-medium text-slate-700",
            labelClassName
          )}
        >
          {children}
        </Label>
        {required && (
          <span 
            className="text-red-500 text-sm leading-none" 
            aria-label="Required field"
          >
            *
          </span>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-slate-500 leading-relaxed">
          {helperText}
        </p>
      )}
    </div>
  );
}

// Re-export for convenience
export type { RequiredLabelProps };