// src/modules/owner/components/property/wizard/components/FormNavigation.tsx
// Version: 5.0.0
// Last Modified: 07-05-2025 21:30 IST
// Purpose: Updated to use correct flow structure from flows.ts

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  Home, MapPin, Settings, Image, FileText, DollarSign, 
  Building, Bed, Users, Briefcase, Map 
} from 'lucide-react';

// Import flow types and steps directly
import { FLOW_TYPES, FLOW_STEPS, FLOW_STEP_SEQUENCES } from '../constants/flows';

interface Step {
  id: string;
  title?: string;
  label?: string;
  icon?: React.ElementType;
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

// Map step IDs to icons
const getIconForStep = (stepId: string) => {
  const iconMap: Record<string, React.ElementType> = {
    details: Home,
    basicDetails: Home,
    commercial_basics: Building,
    location: MapPin,
    features: Settings,
    media: Image,
    photos: Image,
    rental: DollarSign,
    rentalDetails: DollarSign,
    review: FileText,
    sale: DollarSign,
    commercial: Building,
    commercial_sale: Building,
    room_details: Bed,
    pg_details: Building,
    flatmate_details: Users,
    coworking: Briefcase,
    land_details: Map,
    land_features: Settings
  };
  
  return iconMap[stepId] || Settings;
};

// Map step IDs to display titles
const getTitleForStep = (stepId: string) => {
  const titleMap: Record<string, string> = {
    details: 'Basic Details',
    basicDetails: 'Basic Details',
    commercial_basics: 'Basic Details',
    location: 'Location',
    features: 'Features',
    media: 'Photos',
    photos: 'Photos',
    rental: 'Rental Details',
    rentalDetails: 'Rental Details',
    review: 'Review',
    sale: 'Sale Details',
    commercial: 'Commercial',
    commercial_sale: 'Sale Details',
    room_details: 'Room Details',
    pg_details: 'PG Details',
    flatmate_details: 'Flatmate Details',
    coworking: 'Co-working',
    land_details: 'Land Details',
    land_features: 'Land Features'
  };
  
  return titleMap[stepId] || stepId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

// Get the flow type based on category and ad type
const getFlowType = (category: string, adType: string): string => {
  const normalizedCategory = category.toLowerCase();
  const normalizedAdType = adType.toLowerCase();
  
  if (normalizedCategory === 'residential') {
    if (normalizedAdType === 'rent' || normalizedAdType === 'rental') {
      return FLOW_TYPES.RESIDENTIAL_RENT;
    } else if (normalizedAdType === 'sale' || normalizedAdType === 'sell') {
      return FLOW_TYPES.RESIDENTIAL_SALE;
    } else if (normalizedAdType === 'pghostel') {
      return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    } else if (normalizedAdType === 'flatmates') {
      return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    }
  } else if (normalizedCategory === 'commercial') {
    if (normalizedAdType === 'rent' || normalizedAdType === 'lease') {
      return FLOW_TYPES.COMMERCIAL_RENT;
    } else if (normalizedAdType === 'sale' || normalizedAdType === 'sell') {
      return FLOW_TYPES.COMMERCIAL_SALE;
    } else if (normalizedAdType === 'coworking') {
      return FLOW_TYPES.COMMERCIAL_COWORKING;
    }
  } else if (normalizedCategory === 'land' || normalizedCategory === 'plot') {
    if (normalizedAdType === 'sale' || normalizedAdType === 'sell') {
      return FLOW_TYPES.LAND_SALE;
    }
  }
  
  // Default flow
  return FLOW_TYPES.DEFAULT;
};

// Create component
const NavigationComponent = (props: FormNavigationProps) => {
  const {
    currentStep,
    onStepChange,
    propertyId,
    mode = 'create',
    category = '',
    adType = '',
    steps = []
  } = props;
  
  const navigate = useNavigate();

  // Get flow type based on category and ad type
  const flowType = useMemo(() => {
    return getFlowType(category, adType);
  }, [category, adType]);

  // Get flow steps for this flow type
  const flowSteps = useMemo(() => {
    console.log('Flow type:', flowType);
    const flowStepIds = FLOW_STEPS[flowType] || FLOW_STEPS.default;
    
    // Convert step IDs to step objects
    return flowStepIds.map(stepId => ({
      id: stepId,
      title: getTitleForStep(stepId),
      icon: getIconForStep(stepId)
    }));
  }, [flowType]);

  // Use provided steps if they exist, otherwise use generated flowSteps
  const stepsToRender = useMemo(() => {
    if (steps && steps.length > 0) {
      // If steps are provided, process them
      return steps.map(step => ({
        ...step,
        title: step.title || getTitleForStep(step.id),
        icon: step.icon || getIconForStep(step.id)
      }));
    }
    
    // Otherwise use generated flow steps
    return flowSteps;
  }, [steps, flowSteps]);

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
  console.log('FormNavigation debug:', {
    category,
    adType,
    flowType,
    currentStep,
    flowSteps: flowSteps.map(s => s.id),
    stepsToRender: stepsToRender.map(s => s.id),
    mode
  });

  return (
    <div className="px-6 py-4 border-b border-border mb-4" style={{ display: 'block', width: '100%' }}>
      <div className="overflow-x-auto" style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <div className="flex space-x-2" style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
          {stepsToRender.map((step, index) => {
            const Icon = step.icon || (() => <span className="w-4 h-4">•</span>);
            const isActive = currentStep === index + 1;
            const isPassed = currentStep > index + 1;
            const isClickable = mode === 'edit' || isPassed;
            
            return (
              <button
                key={step.id}
                type="button"
                disabled={!isClickable}
                onClick={() => handleStepClick(index, step.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.2s',
                  backgroundColor: isActive ? '#0ea5e9' : isPassed ? '#e0f2fe' : '#f1f5f9',
                  color: isActive ? 'white' : isPassed ? '#0ea5e9' : '#334155',
                  opacity: isClickable ? 1 : 0.6,
                  cursor: isClickable ? 'pointer' : 'not-allowed',
                  border: 'none',
                  outline: 'none'
                }}
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
                <Icon className="w-4 h-4 mr-1.5" style={{ marginRight: '0.375rem' }} />
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export as named export without self-referencing 
export const FormNavigation = NavigationComponent;

// Export default without self-referencing
export default NavigationComponent;