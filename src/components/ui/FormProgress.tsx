// src/components/ui/FormProgress.tsx
// Version: 1.0.0
// Last Modified: 2025-01-31T20:45:00+05:30 (IST)

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function FormProgress({ currentStep, totalSteps, className }: FormProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <Progress value={progress} className="h-2" />
      <div className="text-sm text-slate-600">
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
}