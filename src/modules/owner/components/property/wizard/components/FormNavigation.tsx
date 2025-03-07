// src/modules/owner/components/property/wizard/components/FormNavigation.tsx
// Version: 1.6.0
// Last Modified: 06-03-2025 21:15 IST
// Purpose: Updated to conditionally display either Rental or Sale tab based on listing type

import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { STEPS } from '../constants';

interface FormNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  propertyId?: string;
  mode?: 'create' | 'edit';
  category?: string;
  adType?: string;
}

export function FormNavigation({ 
  currentStep, 
  onStepChange, 
  propertyId, 
  mode,
  category,
  adType
}: FormNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if we're in sale mode
  const isSaleMode = useMemo(() => {
    return adType?.toLowerCase() === 'sale' || adType?.toLowerCase() === 'sell';
  }, [adType]);

  // Filter steps to show either Rental or Sale tab based on listing type
  const filteredSteps = useMemo(() => {
    return STEPS.filter(step => {
      // Skip 'rental' step if in sale mode
      if (step.id === 'rental' && isSaleMode) {
        return false;
      }
      // Skip 'sale' step if in rental mode
      if (step.id === 'sale' && !isSaleMode) {
        return false;
      }
      return true;
    });
  }, [isSaleMode]);

  // Function to map current step index to filtered steps index
  const mapStepIndex = (currentIndex: number): number => {
    // Get the step ID for the current index from the original STEPS array
    const originalStepId = STEPS[currentIndex - 1]?.id;
    
    // Find the corresponding index in the filtered steps
    return filteredSteps.findIndex(step => step.id === originalStepId);
  };

  // Function to map filtered step index back to original STEPS array index
  const mapToOriginalIndex = (filteredIndex: number): number => {
    const filteredStepId = filteredSteps[filteredIndex]?.id;
    return STEPS.findIndex(step => step.id === filteredStepId);
  };

  const isStepAccessible = (stepIndex: number) => {
    // Convert to original index for accessibility check
    const originalIndex = mapToOriginalIndex(stepIndex);
    const isPhotoStep = originalIndex === STEPS.length - 1;
    if (isPhotoStep) {
      return mode === 'edit' || propertyId !== undefined;
    }
    return true;
  };

  const handleStepClick = (index: number) => {
    if (!isStepAccessible(index)) return;

    // Convert to original index for navigation
    const originalIndex = mapToOriginalIndex(index);
    const step = STEPS[originalIndex];
    
    // Debug logging
    console.log("Navigation params:", { mode, propertyId, category, adType, step: step.id });
    
    if (mode === 'edit' && propertyId) {
      // Keep property ID in URL for edit mode
      console.log(`Navigating to edit mode tab: /properties/${propertyId}/edit?step=${step.id}`);
      navigate(`/properties/${propertyId}/edit?step=${step.id}`, { replace: true });
    } else if (category && adType) {
      // For create mode, use the category/adType pattern
      console.log(`Navigating to create mode tab: /properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/${step.id}`);
      navigate(`/properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/${step.id}`, { replace: true });
    } else {
      console.warn("Missing navigation parameters:", { mode, propertyId, category, adType });
    }
    
    onStepChange(originalIndex + 1);
  };

  // Map the current step to filtered index for display purposes
  const mappedCurrentStep = mapStepIndex(currentStep);

  return (
    <div className="flex border-b border-slate-200">
      {filteredSteps.map((step, index) => {
        const isAccessible = isStepAccessible(index);
        const Icon = step.icon;
        return (
          <button
            key={step.id}
            onClick={() => isAccessible && handleStepClick(index)}
            disabled={!isAccessible}
            className={cn(
              "flex flex-1 flex-col items-center justify-center py-2 px-1.5",
              "min-w-[80px] max-w-[100px]",
              "relative group transition-all duration-200",
              "text-sm select-none",
              isAccessible && "hover:bg-indigo-50/60",
              mappedCurrentStep === index 
                ? "text-indigo-600 bg-indigo-50/40" 
                : "text-slate-500 hover:text-indigo-600",
              !isAccessible && "opacity-50 cursor-not-allowed",
              "border-r border-slate-200 last:border-r-0",
            )}
            title={!isAccessible ? "Complete property details first" : undefined}
          >
            <Icon className={cn(
              "h-4 w-4 transition-transform duration-200",
              "group-hover:scale-110",
              mappedCurrentStep === index ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
            )} />
            <span className={cn(
              "text-[11px] font-medium tracking-tight mt-0.5",
              "transition-colors duration-200",
              "truncate px-1 w-full text-center",
              mappedCurrentStep === index ? "text-indigo-600" : "text-slate-600 group-hover:text-indigo-600"
            )}>
              {step.title}
            </span>
            {mappedCurrentStep === index && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        );
      })}
    </div>
  );
}