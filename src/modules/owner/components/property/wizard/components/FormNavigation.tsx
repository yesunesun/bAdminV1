// src/modules/owner/components/property/wizard/components/FormNavigation.tsx
// Version: 2.0.0
// Last Modified: 10-04-2025 23:45 IST
// Purpose: Tab navigation component for property form with support for different flows

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Step {
  id: string;
  title: string;
  icon: React.ElementType;
  description?: string;
  hidden?: boolean;
}

interface FormNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  propertyId?: string;
  mode?: 'create' | 'edit';
  category?: string;
  adType?: string;
  steps: Step[];
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  currentStep,
  onStepChange,
  propertyId,
  mode = 'create',
  category = '',
  adType = '',
  steps
}) => {
  const navigate = useNavigate();

  // Determine property type (sale, rent, pghostel) for special handling
  const propertyType = useMemo(() => {
    const normalizedAdType = adType.toLowerCase();
    if (normalizedAdType === 'pghostel') {
      return 'pghostel';
    } else if (normalizedAdType === 'sale' || normalizedAdType === 'sell') {
      return 'sale';
    } else {
      return 'rent';
    }
  }, [adType]);

  // Filter out hidden steps based on property type
  const visibleSteps = useMemo(() => {
    return steps.filter(step => {
      // Always show Details, Location, Features, Photos, Review
      if (['details', 'location', 'features', 'photos', 'review'].includes(step.id)) {
        return true;
      }
      
      // For PG/Hostel flow, show room_details and pg_details
      if (propertyType === 'pghostel') {
        return ['room_details', 'pg_details'].includes(step.id);
      }
      
      // For Sale flow, show only sale tab
      if (propertyType === 'sale') {
        return step.id === 'sale';
      }
      
      // For Rent flow, show only rental tab
      if (propertyType === 'rent') {
        return step.id === 'rental';
      }
      
      return !step.hidden;
    });
  }, [steps, propertyType]);

  // Handle clicking on steps for navigation
  const handleStepClick = (index: number, stepId: string) => {
    // In edit mode, all steps should be clickable
    if (mode === 'edit' || currentStep > index) {
      try {
        // Extract base URL
        const urlParts = window.location.pathname.split('/');
        // Remove the last part (current step)
        urlParts.pop();
        // Add the new step
        urlParts.push(stepId);
        // Navigate to the new URL
        navigate(urlParts.join('/'));
        // Update internal step state
        onStepChange(index + 1);
      } catch (error) {
        // Fallback to just updating the step state
        onStepChange(index + 1);
      }
    }
  };

  // Debug information
  const debugInfo = {
    propertyType,
    visibleStepIds: visibleSteps.map(s => s.id),
    currentStep,
    mode,
    category,
    adType,
  };

  console.log('FormNavigation debug:', debugInfo);

  return (
    <div className="px-6 py-4 border-b border-border">
      <div className="overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          {visibleSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === index + 1;
            const isPassed = currentStep > index + 1;
            const isClickable = mode === 'edit' || isPassed;
            
            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => handleStepClick(index, step.id)}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-lg transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-ring/30",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : isPassed
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                  !isClickable && "opacity-60 cursor-not-allowed"
                )}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {step.title}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormNavigation;