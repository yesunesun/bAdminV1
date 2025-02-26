// src/components/property/wizard/components/WizardBreadcrumbs.tsx
// Version: 1.0.1
// Last Modified: 19-02-2025 14:45 IST

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardBreadcrumbsProps {
  category?: string;
  adType?: string;
  currentStep: string;
  className?: string;
}

const WizardBreadcrumbs = ({ 
  category, 
  adType, 
  currentStep,
  className 
}: WizardBreadcrumbsProps) => {
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const steps = [
    category ? capitalize(category) : 'Property Type',
    adType ? capitalize(adType) : '',
    currentStep
  ].filter(Boolean);

  return (
    <nav className={cn("flex", className)}>
      <ol className="flex items-center space-x-2 text-sm">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
            <li>
              <span className="text-muted-foreground">
                {step}
              </span>
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default WizardBreadcrumbs;