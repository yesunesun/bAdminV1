// src/components/property/wizard/components/FormNavigation.tsx
// Version: 1.0.0
// Last Modified: 2025-02-01T12:30:00+05:30 (IST)

import React from 'react';
import { cn } from '@/lib/utils';
import { STEPS } from '../constants';

interface FormNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function FormNavigation({ currentStep, onStepChange }: FormNavigationProps) {
  return (
    <div className="flex border-b border-slate-200">
      {STEPS.map((step, index) => {
        const isClickable = index <= currentStep;
        const Icon = step.icon;
        return (
          <button
            key={step.id}
            onClick={() => isClickable && onStepChange(index + 1)}
            disabled={!isClickable}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-2 px-1.5",
              "min-w-[80px] max-w-[100px]",
              "relative group transition-all duration-200",
              "text-sm select-none",
              isClickable && "hover:bg-indigo-50/60",
              currentStep === index + 1 
                ? "text-indigo-600 bg-indigo-50/40" 
                : "text-slate-500 hover:text-indigo-600",
              !isClickable && "opacity-50 cursor-not-allowed",
              "border-r border-slate-200 last:border-r-0",
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-transform duration-200",
              "group-hover:scale-110",
              currentStep === index + 1 ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
            )} />
            <span className={cn(
              "text-[11px] font-medium tracking-tight mt-0.5",
              "transition-colors duration-200",
              "truncate px-1 w-full text-center",
              currentStep === index + 1 ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-600"
            )}>
              {step.title}
            </span>
            {currentStep === index + 1 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}