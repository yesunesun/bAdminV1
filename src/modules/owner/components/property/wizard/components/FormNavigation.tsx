// src/modules/owner/components/property/wizard/components/FormNavigation.tsx
// Version: 1.7.0
// Last Modified: 07-03-2025 14:30 IST
// Purpose: Updated to sync URL with tab navigation and properly handle URL updates

import React, { useMemo, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { STEPS } from '../constants';

interface FormNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  propertyId?: string;
  mode?: 'create' | 'edit';
  category?: string;
  adType?: string;
  steps?: typeof STEPS;
}

export function FormNavigation({ 
  currentStep, 
  onStepChange, 
  propertyId, 
  mode,
  category,
  adType,
  steps = STEPS
}: FormNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { step: urlStep } = useParams();

  // Sync URL step parameter with current step if they don't match
  useEffect(() => {
    if (urlStep) {
      const stepIndex = STEPS.findIndex(s => s.id === urlStep);
      if (stepIndex !== -1 && currentStep !== stepIndex + 1) {
        // If URL step exists but doesn't match current step, update current step
        onStepChange(stepIndex + 1);
      }
    } else if (currentStep > 1) {
      // If no URL step but we're not on first step, update URL
      updateUrlWithCurrentStep();
    }
  }, [urlStep, currentStep]);

  // Determine if we're in sale mode
  const isSaleMode = useMemo(() => {
    return adType?.toLowerCase() === 'sale' || adType?.toLowerCase() === 'sell';
  }, [adType]);

  // Filter steps to show either Rental or Sale tab based on listing type
  const filteredSteps = useMemo(() => {
    return (steps || STEPS).filter(step => {
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
  }, [isSaleMode, steps]);

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

  // Function to update URL with current step
  const updateUrlWithCurrentStep = () => {
    if (!category || !adType) {
      console.warn("Missing navigation parameters:", { category, adType });
      return;
    }

    const stepId = STEPS[currentStep - 1]?.id;
    if (!stepId) return;

    if (mode === 'edit' && propertyId) {
      navigate(`/properties/${propertyId}/edit?step=${stepId}`, { replace: true });
    } else {
      navigate(`/properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/${stepId}`, { replace: true });
    }
  };

  const handleStepClick = (index: number) => {
    if (!isStepAccessible(index)) return;

    // Convert to original index for navigation
    const originalIndex = mapToOriginalIndex(index);
    const step = STEPS[originalIndex];
    
    // Update the current step in the form state
    onStepChange(originalIndex + 1);
    
    // Update URL to reflect the new step
    if (mode === 'edit' && propertyId) {
      navigate(`/properties/${propertyId}/edit?step=${step.id}`, { replace: true });
    } else if (category && adType) {
      navigate(`/properties/list/${category.toLowerCase()}/${adType.toLowerCase()}/${step.id}`, { replace: true });
    } else {
      console.warn("Missing navigation parameters:", { mode, propertyId, category, adType });
    }
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