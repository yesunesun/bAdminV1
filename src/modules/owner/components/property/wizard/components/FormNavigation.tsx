// src/modules/owner/components/property/wizard/components/FormNavigation.tsx
// Version: 2.1.0
// Last Modified: 11-04-2025 10:15 IST
// Purpose: Fixed PG/Hostel navigation sequence to include location step

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
      // Always include these common steps for all property types
      if (['features', 'photos', 'review'].includes(step.id)) {
        return true;
      }
      
      // For PG/Hostel flow
      if (propertyType === 'pghostel') {
        // Include room_details, location, and pg_details - correct sequence!
        return ['room_details', 'location', 'pg_details'].includes(step.id);
      }
      
      // For Sale flow
      if (propertyType === 'sale') {
        // Include basic details, location, and sale specific info
        return ['details', 'location', 'sale'].includes(step.id);
      }
      
      // For Rent flow
      if (propertyType === 'rent') {
        // Include basic details, location, and rental specific info
        return ['details', 'location', 'rental'].includes(step.id);
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