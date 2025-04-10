// src/modules/owner/components/property/wizard/PropertyForm/components/FormContent.tsx
// Version: 3.0.0
// Last Modified: 10-04-2025 20:45 IST
// Purpose: Added support for PG/Hostel flow with RoomDetails and PGDetails sections

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
import { Loader2 } from 'lucide-react';

// Import new PG/Hostel specific components
import RoomDetails from '../../sections/RoomDetails';
import PGDetails from '../../sections/PGDetails';

interface FormContentProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  STEPS: any[]; // Using any to match the original import type
  effectiveCategory: string;
  effectiveAdType: string;
  mode: 'create' | 'edit';
  selectedCity: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean; // New prop to identify PG/Hostel flow
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
  isPGHostelMode, // Use the new prop for conditional rendering
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
    if (isSaleMode || isPGHostelMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
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
    if (!isSaleMode || isPGHostelMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
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
  
  // New PG/Hostel specific sections
  if (currentStepId === 'room_details') {
    // Only show room details for PG/Hostel properties
    if (!isPGHostelMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <RoomDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  if (currentStepId === 'pg_details') {
    // Only show PG details for PG/Hostel properties
    if (!isPGHostelMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <PGDetails 
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
    // Check if we have a property ID before rendering the image upload section
    if (!savedPropertyId) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading property details...</p>
          <button
            type="button"
            onClick={handlePreviousStep}
            className="mt-6 px-6 py-3 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground"
          >
            Return to Previous Step
          </button>
        </div>
      );
    }
    
    return (
      <ImageUploadSection
        propertyId={savedPropertyId}
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