// src/modules/owner/components/property/wizard/PropertyForm/components/FormContent.tsx
// Version: 4.2.0
// Last Modified: 12-04-2025 17:30 IST
// Purpose: Fixed rental tab display for Commercial Rent flow

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

// Import existing specific components
import RoomDetails from '../../sections/RoomDetails';
import PGDetails from '../../sections/PGDetails';
import CommercialDetails from '../../sections/CommercialDetails';

// Import new components for the new flows
import CommercialSaleDetails from '../../sections/CommercialSaleDetails';
import CoworkingDetails from '../../sections/CoworkingDetails';
import LandDetails from '../../sections/LandDetails';
import LandFeaturesDetails from '../../sections/LandFeaturesDetails';
import FlatmateDetails from '../../sections/FlatmateDetails';

interface FormContentProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  STEPS: any[]; // Using any to match the original import type
  effectiveCategory: string;
  effectiveAdType: string;
  mode: 'create' | 'edit';
  selectedCity: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean; // Prop for PG/Hostel flow
  isCommercialRentMode?: boolean; // Prop for Commercial Rent flow
  isCommercialSaleMode?: boolean; // Prop for Commercial Sale flow
  isCoworkingMode?: boolean; // Prop for Commercial Co-working flow
  isLandSaleMode?: boolean; // Prop for Land/Plot Sale flow
  isFlatmatesMode?: boolean; // Prop for Residential Flatmates flow
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
  isPGHostelMode, // Prop for PG/Hostel flow
  isCommercialRentMode = false, // Prop for Commercial Rent flow
  isCommercialSaleMode = false, // Prop for Commercial Sale flow
  isCoworkingMode = false, // Prop for Commercial Co-working flow
  isLandSaleMode = false, // Prop for Land/Plot Sale flow
  isFlatmatesMode = false, // Prop for Residential Flatmates flow
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
    // Skip details for Land/Plot flow
    if (isLandSaleMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for Land/Plot properties.</p>
        </div>
      );
    }
    
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
    // Show rental details for both residential and commercial rent properties
    // This is the critical change - explicitly check if this is a rent flow
    const isRentFlow = !isSaleMode && !isPGHostelMode && !isCommercialSaleMode && 
                      !isCoworkingMode && !isLandSaleMode && !isFlatmatesMode;
    
    // Display rental details for both normal rent and commercial rent
    if (isRentFlow || isCommercialRentMode) {
      return (
        <RentalDetails 
          form={form}
          adType={effectiveAdType}
        />
      );
    }
    
    // For all other property types, show not applicable message
    return (
      <div className="py-6 text-center">
        <p className="text-muted-foreground">This section is not applicable for this property type.</p>
      </div>
    );
  }
  
  if (currentStepId === 'sale') {
    // Only show sale details for residential sale properties
    if (!isSaleMode || isPGHostelMode || isCommercialRentMode || 
        isCommercialSaleMode || isCoworkingMode || isLandSaleMode || 
        isFlatmatesMode) {
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
  
  // PG/Hostel specific sections
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
  
  // Commercial Rent specific section
  if (currentStepId === 'commercial') {
    // Only show Commercial details for Commercial Rent properties
    if (!isCommercialRentMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <CommercialDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  // Commercial Sale specific section
  if (currentStepId === 'commercial_sale') {
    // Only show Commercial Sale details for Commercial Sale properties
    if (!isCommercialSaleMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <CommercialSaleDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  // Co-working specific section
  if (currentStepId === 'coworking') {
    // Only show Co-working details for Co-working properties
    if (!isCoworkingMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <CoworkingDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  // Land/Plot specific sections
  if (currentStepId === 'land_details') {
    // Only show Land details for Land/Plot properties
    if (!isLandSaleMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <LandDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  if (currentStepId === 'land_features') {
    // Only show Land features for Land/Plot properties
    if (!isLandSaleMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <LandFeaturesDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  // Flatmates specific section
  if (currentStepId === 'flatmate_details') {
    // Only show Flatmate details for Flatmates properties
    if (!isFlatmatesMode) {
      return (
        <div className="py-6 text-center">
          <p className="text-muted-foreground">This section is not applicable for this property type.</p>
        </div>
      );
    }
    
    return (
      <FlatmateDetails 
        form={form}
        adType={effectiveAdType}
      />
    );
  }
  
  // Common sections for all property types
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