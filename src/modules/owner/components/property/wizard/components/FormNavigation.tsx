// src/modules/owner/components/property/wizard/components/FormNavigation.tsx
// Version: 7.1.0
// Last Modified: 02-06-2025 17:45 IST
// Purpose: Fixed step validation status passing to prevent navigation issues with Flatmates Room Details

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  Home, MapPin, Settings, Image, FileText, DollarSign, 
  Building, Bed, Users, Briefcase, Map 
} from 'lucide-react';

// Import flow types and steps directly
import { FLOW_TYPES, FLOW_STEPS, FLOW_STEP_SEQUENCES } from '../constants/flows';
import { getURLFriendlyType } from '@/contexts/FlowContext'; // Import the helper

interface Step {
  id: string;
  title?: string;
  label?: string;
  icon?: React.ElementType;
  description?: string;
  hidden?: boolean;
  isValid?: boolean; // Step validation status
  completionPercentage?: number; // Step completion percentage
}

interface FormNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  propertyId?: string;
  category?: string;
  adType?: string;
  steps: Step[];
  // ✅ FIXED: Enhanced validation props to properly track step completion
  stepValidationStatus?: Record<number, { isValid: boolean; completionPercentage: number }>;
}

// Map step IDs to icons
const getIconForStep = (stepId: string) => {
  const iconMap: Record<string, React.ElementType> = {
    details: Home,
    basicDetails: Home,
    basic_details: Home,
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
    land_features: Settings,
    // Add flow-specific step mappings
    res_rent_basic_details: Home,
    res_rent_location: MapPin,
    res_rent_rental: DollarSign,
    res_rent_features: Settings,
    res_rent_review: FileText,
    res_sale_basic_details: Home,
    res_sale_location: MapPin,
    res_sale_sale_details: DollarSign,
    res_sale_features: Settings,
    res_sale_review: FileText,
    res_flat_basic_details: Bed,
    res_flat_location: MapPin,
    res_flat_flatmate_details: Users,
    res_flat_features: Settings,
    res_flat_review: FileText,
    res_pg_basic_details: Building,
    res_pg_location: MapPin,
    res_pg_pg_details: Building,
    res_pg_features: Settings,
    res_pg_review: FileText,
    com_rent_basic_details: Building,
    com_rent_location: MapPin,
    com_rent_rental: DollarSign,
    com_rent_features: Settings,
    com_rent_review: FileText,
    com_sale_basic_details: Building,
    com_sale_location: MapPin,
    com_sale_sale_details: DollarSign,
    com_sale_features: Settings,
    com_sale_review: FileText,
    com_cow_basic_details: Briefcase,
    com_cow_location: MapPin,
    com_cow_coworking_details: Briefcase,
    com_cow_features: Settings,
    com_cow_review: FileText,
    land_sale_basic_details: Map,
    land_sale_location: MapPin,
    land_sale_land_features: Settings,
    land_sale_review: FileText
  };
  
  return iconMap[stepId] || Settings;
};

// Map step IDs to display titles
const getTitleForStep = (stepId: string) => {
  const titleMap: Record<string, string> = {
    details: 'Basic Details',
    basicDetails: 'Basic Details',
    basic_details: 'Basic Details',
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
    land_features: 'Land Features',
    // Add flow-specific step mappings
    res_rent_basic_details: 'Property Details',
    res_rent_location: 'Location',
    res_rent_rental: 'Rental Details',
    res_rent_features: 'Features',
    res_rent_review: 'Review',
    res_sale_basic_details: 'Property Details',
    res_sale_location: 'Location',
    res_sale_sale_details: 'Sale Details',
    res_sale_features: 'Features',
    res_sale_review: 'Review',
    res_flat_basic_details: 'Room Details',
    res_flat_location: 'Location',
    res_flat_flatmate_details: 'Flatmate Details',
    res_flat_features: 'Features',
    res_flat_review: 'Review',
    res_pg_basic_details: 'Room Details',
    res_pg_location: 'Location',
    res_pg_pg_details: 'PG Details',
    res_pg_features: 'Features',
    res_pg_review: 'Review',
    com_rent_basic_details: 'Comm. Prop. Details',
    com_rent_location: 'Location',
    com_rent_rental: 'Rental Details',
    com_rent_features: 'Features',
    com_rent_review: 'Review',
    com_sale_basic_details: 'Comm. Prop. Details',
    com_sale_location: 'Location',
    com_sale_sale_details: 'Sale Details',
    com_sale_features: 'Features',
    com_sale_review: 'Review',
    com_cow_basic_details: 'Basic Details',
    com_cow_location: 'Location',
    com_cow_coworking_details: 'Coworking Details',
    com_cow_features: 'Features',
    com_cow_review: 'Review',
    land_sale_basic_details: 'Land/Plot Details',
    land_sale_location: 'Location',
    land_sale_land_features: 'Land Features',
    land_sale_review: 'Review'
  };
  
  return titleMap[stepId] || stepId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/_/g, ' ');
};

// Normalize string for better matching
const normalizeString = (str: string): string => {
  return str.toLowerCase()
    .replace(/[\s\-_\/]/g, '') // Remove spaces, hyphens, underscores, slashes
    .replace(/[^\w]/g, ''); // Remove non-word characters
};

// Get the flow type based on category and ad type
const getFlowType = (category: string, adType: string): string => {
  const normalizedCategory = normalizeString(category);
  const normalizedAdType = normalizeString(adType);
  
  console.log('[FormNavigation] Flow type detection:', {
    original: `${category}/${adType}`,
    normalized: `${normalizedCategory}/${normalizedAdType}`,
    availableFlowTypes: Object.values(FLOW_TYPES)
  });
  
  if (normalizedCategory === 'residential') {
    // Handle various rent variations
    if (normalizedAdType === 'rent' || normalizedAdType === 'rental') {
      return FLOW_TYPES.RESIDENTIAL_RENT;
    } 
    // Handle various sale variations
    else if (normalizedAdType === 'sale' || normalizedAdType === 'sell') {
      return FLOW_TYPES.RESIDENTIAL_SALE;
    } 
    // Handle PG/Hostel variations - be more flexible with matching
    else if (
      normalizedAdType === 'pghostel' || 
      normalizedAdType === 'pghostel' ||
      normalizedAdType === 'pg' ||
      normalizedAdType === 'hostel' ||
      normalizedAdType.includes('pg') ||
      normalizedAdType.includes('hostel')
    ) {
      return FLOW_TYPES.RESIDENTIAL_PGHOSTEL;
    } 
    // Handle flatmates variations
    else if (
      normalizedAdType === 'flatmates' ||
      normalizedAdType === 'flatmate' ||
      normalizedAdType === 'roommates' ||
      normalizedAdType === 'roommate'
    ) {
      return FLOW_TYPES.RESIDENTIAL_FLATMATES;
    }
  } else if (normalizedCategory === 'commercial') {
    // Handle commercial rent variations
    if (normalizedAdType === 'rent' || normalizedAdType === 'lease' || normalizedAdType === 'rental') {
      return FLOW_TYPES.COMMERCIAL_RENT;
    } 
    // Handle commercial sale variations
    else if (normalizedAdType === 'sale' || normalizedAdType === 'sell') {
      return FLOW_TYPES.COMMERCIAL_SALE;
    } 
    // Handle coworking variations
    else if (
      normalizedAdType === 'coworking' ||
      normalizedAdType === 'coworking' ||
      normalizedAdType.includes('cowork')
    ) {
      return FLOW_TYPES.COMMERCIAL_COWORKING;
    }
  } else if (normalizedCategory === 'land' || normalizedCategory === 'plot') {
    // Handle land sale variations
    if (normalizedAdType === 'sale' || normalizedAdType === 'sell') {
      return FLOW_TYPES.LAND_SALE;
    }
  }
  
  // Log error for debugging
  console.error('[FormNavigation] Invalid property type combination:', {
    category,
    adType,
    normalizedCategory,
    normalizedAdType,
    availableFlowTypes: Object.values(FLOW_TYPES)
  });
  
  // Throw error instead of using default fallback
  throw new Error(`Invalid property type combination: ${category}/${adType}. Please select a valid property type and listing option.`);
};

// Create component
const NavigationComponent = (props: FormNavigationProps) => {
  const {
    currentStep,
    onStepChange,
    propertyId,
    category = '',
    adType = '',
    steps = [],
    stepValidationStatus = {} // Validation status for steps
  } = props;
  
  const navigate = useNavigate();

  // Get flow type based on category and ad type
  const flowType = useMemo(() => {
    try {
      const detectedFlowType = getFlowType(category, adType);
      console.log('[FormNavigation] Flow type detected:', detectedFlowType);
      return detectedFlowType;
    } catch (error) {
      console.error('[FormNavigation] Flow type detection error:', error);
      // Show error in UI instead of falling back
      return null;
    }
  }, [category, adType]);

  // Get flow steps for this flow type
  const flowSteps = useMemo(() => {
    if (!flowType) return [];
    
    console.log('[FormNavigation] Getting flow steps for:', flowType);
    const flowStepIds = FLOW_STEPS[flowType];
    
    if (!flowStepIds || !Array.isArray(flowStepIds)) {
      console.error(`[FormNavigation] No flow steps defined for flow type: ${flowType}`);
      return [];
    }
    
    console.log('[FormNavigation] Flow step IDs:', flowStepIds);
    
    // Convert step IDs to step objects
    const stepObjects = flowStepIds.map(stepId => ({
      id: stepId,
      title: getTitleForStep(stepId),
      icon: getIconForStep(stepId)
    }));
    
    console.log('[FormNavigation] Generated step objects:', stepObjects);
    return stepObjects;
  }, [flowType]);

  // Use provided steps if they exist, otherwise use generated flowSteps
  const stepsToRender = useMemo(() => {
    if (steps && steps.length > 0) {
      // If steps are provided, process them
      const processedSteps = steps.map(step => ({
        ...step,
        title: step.title || getTitleForStep(step.id),
        icon: step.icon || getIconForStep(step.id)
      }));
      
      console.log('[FormNavigation] Using provided steps:', processedSteps);
      return processedSteps;
    }
    
    // Otherwise use generated flow steps
    console.log('[FormNavigation] Using generated flow steps:', flowSteps);
    return flowSteps;
  }, [steps, flowSteps]);

  // ✅ ENHANCED: Step click handler with better validation logic for Flatmates flow
  const handleStepClick = (index: number, stepId: string) => {
    const targetStepNumber = index + 1;
    
    console.log('[FormNavigation] Step click attempt:', {
      index,
      stepId,
      currentStep,
      targetStep: targetStepNumber,
      stepValidationStatus,
      flowType,
      category,
      adType
    });

    // Allow navigation to current step (refresh)
    if (currentStep === targetStepNumber) {
      console.log('[FormNavigation] Refreshing current step');
      onStepChange(targetStepNumber);
      return;
    }

    // Only allow navigation to previous steps OR next step if current step is valid
    if (targetStepNumber < currentStep) {
      // Navigation to previous steps is always allowed
      console.log('[FormNavigation] Navigating to previous step');
      navigateToStep(index, stepId, targetStepNumber);
    } else if (targetStepNumber === currentStep + 1) {
      // Navigation to next step - check if current step is valid
      const currentStepValidation = stepValidationStatus[currentStep];
      
      // ✅ ENHANCED: Better validation checking for Flatmates Room Details
      if (currentStepValidation && currentStepValidation.isValid) {
        console.log('[FormNavigation] Current step is valid, allowing navigation to next step');
        navigateToStep(index, stepId, targetStepNumber);
      } else {
        console.log('[FormNavigation] Current step is invalid, blocking navigation to next step', {
          currentStepValidation,
          currentStep,
          stepId: stepsToRender[currentStep - 1]?.id,
          flowType
        });
        
        // ✅ IMPROVED: More specific error message for different flows
        let errorMessage = 'Please complete all required fields in the current step before proceeding.';
        
        if (flowType === FLOW_TYPES.RESIDENTIAL_FLATMATES && currentStep === 1) {
          errorMessage = 'Please fill in all required Room Details fields (Room Type, Capacity, Rent, Deposit, Bathroom Type, Room Size, and Meal Option) before proceeding.';
        }
        
        alert(errorMessage);
        return;
      }
    } else {
      // Navigation to steps further ahead is not allowed
      console.log('[FormNavigation] Navigation to future steps is not allowed');
      alert('Please complete the steps in order.');
      return;
    }
  };

  // Helper function to actually navigate
  const navigateToStep = (index: number, stepId: string, targetStepNumber: number) => {
    try {
      console.log('[FormNavigation] Executing navigation:', {
        index,
        stepId,
        targetStepNumber,
        currentPath: window.location.pathname,
        category,
        adType
      });
      
      // Parse current URL to extract category and type
      const currentPath = window.location.pathname;
      const pathRegex = /\/properties\/list\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/;
      const match = currentPath.match(pathRegex);
      
      if (match) {
        const [, urlCategory, urlType] = match;
        
        // Construct the new URL with proper URL-friendly type
        const urlFriendlyType = getURLFriendlyType(adType);
        const newUrl = `/properties/list/${urlCategory}/${urlFriendlyType}/${stepId}`;
        
        console.log('[FormNavigation] Navigating to:', {
          from: currentPath,
          to: newUrl,
          parts: { urlCategory, originalAdType: adType, urlFriendlyType, stepId }
        });
        
        navigate(newUrl);
        // Update internal step state
        onStepChange(targetStepNumber);
      } else {
        console.warn('[FormNavigation] Could not parse current URL for navigation:', currentPath);
        // Fallback to just updating the step state
        onStepChange(targetStepNumber);
      }
    } catch (error) {
      console.error('[FormNavigation] Error navigating:', error);
      // Fallback to just updating the step state
      onStepChange(targetStepNumber);
    }
  };

  // Show error if no valid flow type
  if (!flowType) {
    return (
      <div className="px-6 py-4 border-b border-border mb-4 bg-destructive/10">
        <div className="text-destructive text-sm">
          <strong>Error:</strong> Invalid property type combination ({category}/{adType}). 
          Please go back and select a valid property type and listing option.
          <br />
          <small className="text-xs opacity-75">
            Available combinations: Residential (Rent, Sale, PG/Hostel, Flatmates), 
            Commercial (Rent, Sale, Coworking), Land (Sale)
          </small>
        </div>
      </div>
    );
  }

  // Show error if no steps available
  if (stepsToRender.length === 0) {
    return (
      <div className="px-6 py-4 border-b border-border mb-4 bg-destructive/10">
        <div className="text-destructive text-sm">
          <strong>Error:</strong> No wizard steps available for the selected property type ({flowType}). 
          Please contact support if this issue persists.
        </div>
      </div>
    );
  }

  // Debug information
  console.log('[FormNavigation] Rendering navigation:', {
    category,
    adType,
    flowType,
    currentStep,
    flowSteps: flowSteps.map(s => s.id),
    stepsToRender: stepsToRender.map(s => ({ id: s.id, title: s.title })),
    stepValidationStatus
  });

  return (
    <div className="px-6 py-4 border-b border-border mb-4" style={{ display: 'block', width: '100%' }}>
      <div className="overflow-x-auto" style={{ maxWidth: '100%', overflowX: 'auto' }}>
        <div className="flex space-x-2" style={{ display: 'flex', gap: '0.5rem', minWidth: 'max-content' }}>
          {stepsToRender.map((step, index) => {
            // Make sure we have a proper React component, not a string or unknown type
            let IconComponent: React.ElementType;
            
            if (React.isValidElement(step.icon)) {
              IconComponent = step.icon.type;
            } else if (typeof step.icon === 'function') {
              IconComponent = step.icon;
            } else {
              IconComponent = Settings;
            }
            
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isPassed = currentStep > stepNumber;
            const stepValidation = stepValidationStatus[stepNumber];
            
            // ✅ ENHANCED: Improved clickable logic with proper validation checking
            const isClickable = 
              stepNumber < currentStep || // Previous steps are always clickable
              stepNumber === currentStep || // Current step is clickable (refresh)
              (stepNumber === currentStep + 1 && stepValidationStatus[currentStep]?.isValid); // Next step only if current is valid
            
            // ✅ ENHANCED: Better visual indicators for validation status
            const hasValidationInfo = stepValidation !== undefined;
            const isValid = stepValidation?.isValid ?? true;
            const completionPercentage = stepValidation?.completionPercentage ?? 100;
            
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
                  backgroundColor: isActive 
                    ? (isValid ? '#0ea5e9' : '#ef4444') 
                    : isPassed 
                    ? '#e0f2fe' 
                    : '#f1f5f9',
                  color: isActive 
                    ? 'white' 
                    : isPassed 
                    ? '#0ea5e9' 
                    : '#334155',
                  opacity: isClickable ? 1 : 0.6,
                  cursor: isClickable ? 'pointer' : 'not-allowed',
                  border: hasValidationInfo && !isValid && isActive ? '2px solid #fbbf24' : 'none',
                  outline: 'none',
                  position: 'relative'
                }}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-lg transition-colors relative",
                  "focus:outline-none focus:ring-2 focus:ring-ring/30",
                  isActive 
                    ? (isValid ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground")
                    : isPassed
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90",
                  !isClickable && "opacity-60 cursor-not-allowed"
                )}
                title={
                  hasValidationInfo 
                    ? `${step.title} - ${completionPercentage}% complete ${isValid ? '✓' : '⚠️'}`
                    : step.title
                }
              >
                <IconComponent className="w-4 h-4 mr-1.5" style={{ marginRight: '0.375rem' }} />
                <span>{step.title}</span>
                
                {/* ✅ ENHANCED: Better validation indicator */}
                {hasValidationInfo && isActive && (
                  <div 
                    className="absolute -bottom-1 left-0 h-1 bg-current rounded-b-lg transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                )}
                
                {/* ✅ ENHANCED: Status icon */}
                {hasValidationInfo && isActive && (
                  <span className="ml-1 text-xs">
                    {isValid ? '✓' : '⚠️'}
                  </span>
                )}
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