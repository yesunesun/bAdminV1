// src/modules/owner/components/property/wizard/PropertyForm/components/FormContent.tsx
// Version: 2.0.0
// Last Modified: 08-03-2025 23:00 IST
// Purpose: Fixed component rendering and removed console logs

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../types';

// Use corrected relative import paths
import { PropertyDetails } from '../../sections/PropertyDetails';
import { LocationDetails } from '../../sections/LocationDetails';
import { RentalDetails } from '../../sections/RentalDetails';
import { SaleDetails } from '../../sections/SaleDetails';
import { AmenitiesSection } from '../../sections/AmenitiesSection';
import { PropertySummary } from '../../sections/PropertySummary';
import { ImageUploadSection } from '../../sections/ImageUploadSection';

interface FormContentProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  STEPS: any[]; // Using any to match the original import type
  effectiveCategory: string;
  effectiveAdType: string;
  mode: 'create' | 'edit';
  selectedCity: string;
  isSaleMode: boolean;
  handlePreviousStep: () => void;
  handleSaveAsDraft: () => Promise<void>;
  handleSaveAndPublish: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  saving: boolean;
  status: 'draft' | 'published';
  savedPropertyId?: string;
  handleImageUploadComplete: () => void;
}

const FormContent = ({
  form,
  formStep,
  STEPS,
  effectiveCategory,
  effectiveAdType,
  mode,
  selectedCity,
  isSaleMode,
  handlePreviousStep,
  handleSaveAsDraft,
  handleSaveAndPublish,
  handleUpdate,
  saving,
  status,
  savedPropertyId,
  handleImageUploadComplete
}: FormContentProps) => {
  // Get the current step ID safely
  const currentStepId = formStep > 0 && formStep <= STEPS.length 
    ? STEPS[formStep - 1]?.id 
    : null;
  
  // Render content based on the current step
  if (currentStepId === 'details') {
    return (
      <PropertyDetails 
        form={form} 
        mode={mode} 
        category={effectiveCategory}
        adType={effectiveAdType}
      />
    );
  }
  
  if (currentStepId === 'location') {
    return (
      <LocationDetails 
        form={form} 
        selectedCity={selectedCity}
      />
    );
  }
  
  if (currentStepId === 'rental') {
    // Only show rental details for rental properties
    if (isSaleMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for sale properties.</p>
        </div>
      );
    }
    
    return (
      <RentalDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  if (currentStepId === 'sale') {
    // Only show sale details for sale properties
    if (!isSaleMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for rental properties.</p>
        </div>
      );
    }
    
    return (
      <SaleDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  if (currentStepId === 'features') {
    return (
      <AmenitiesSection 
        form={form}
        category={effectiveCategory}
      />
    );
  }
  
  if (currentStepId === 'review') {
    return (
      <PropertySummary
        formData={form.watch()}
        onPrevious={handlePreviousStep}
        onSaveAsDraft={handleSaveAsDraft}
        onSaveAndPublish={handleSaveAndPublish}
        onUpdate={handleUpdate}
        saving={saving}
        status={status}
        propertyId={savedPropertyId}
      />
    );
  }
  
  if (currentStepId === 'photos') {
    return (
      <ImageUploadSection
        propertyId={savedPropertyId!}
        onUploadComplete={handleImageUploadComplete}
        onPrevious={handlePreviousStep}
      />
    );
  }
  
  // Default fallback
  return (
    <div className="py-6 text-center">
      <p className="text-muted-foreground">Section not available</p>
    </div>
  );
};

export default FormContent;