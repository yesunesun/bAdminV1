// src/components/FormProgress.tsx
// Version: 1.3
// Last Modified: 29-01-2025 14:40 IST

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function FormProgress({ currentStep, totalSteps }: FormProgressProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-2 px-4">
      <div className="text-sm text-muted-foreground">
        <span className="font-medium">Step {currentStep} of {totalSteps}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="text-sm text-muted-foreground text-right">
        <span className="font-medium">{Math.round(progress)}% completed</span>
      </div>
    </div>
  );
}