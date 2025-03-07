// src/modules/owner/components/property/wizard/PropertyForm/components/FormContent.tsx
// Version: 1.4.0
// Last Modified: 07-03-2025 21:15 IST
// Purpose: Using corrected relative import paths

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

const FormContent: React.FC<FormContentProps> = ({
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
}) => {
  // Get the current step ID
  const currentStepId = STEPS[formStep - 1]?.id;
  
  console.log('=========== DEBUG: RENDERING STEP CONTENT ===========');
  console.log('Current step ID:', currentStepId);
  console.log('Form mode detection:', {
    effectiveAdType,
    isSaleMode,
    listingType: form.getValues('listingType'),
    isSaleProperty: form.getValues('isSaleProperty'),
    propertyPriceType: form.getValues('propertyPriceType')
  });
  
  // Match content based on step ID 
  switch (currentStepId) {
    case 'details':
      return (
        <PropertyDetails 
          form={form} 
          mode={mode} 
          category={effectiveCategory}
          adType={effectiveAdType}
        />
      );
    
    case 'location':
      return (
        <LocationDetails 
          form={form} 
          selectedCity={selectedCity}
        />
      );
    
    case 'rental':
      // CRITICAL: This is for the RENTAL tab - we show rental details when NOT in sale mode
      if (isSaleMode) {
        console.log('Current tab is rental but property is for sale, showing not applicable message');
        return (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">This section is not applicable for sale properties.</p>
          </div>
        );
      }
      
      console.log('Showing rental details for rental property');
      return (
        <RentalDetails 
          form={form}
          adType={effectiveAdType}
        />
      );
    
    case 'sale':
      // CRITICAL: This is for the SALE tab - we show sale details when IN sale mode
      if (!isSaleMode) {
        console.log('Current tab is sale but property is for rent, showing not applicable message');
        return (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">This section is not applicable for rental properties.</p>
          </div>
        );
      }
      
      console.log('Showing sale details for sale property:', {
        expectedPrice: form.getValues('expectedPrice'),
        maintenanceCost: form.getValues('maintenanceCost')
      });
      
      return (
        <SaleDetails 
          form={form}
          adType={effectiveAdType}
        />
      );
    
    case 'features':
      return (
        <AmenitiesSection 
          form={form}
          category={effectiveCategory}
        />
      );
    
    case 'review':
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
    
    case 'photos':
      return (
        <ImageUploadSection
          propertyId={savedPropertyId!}
          onUploadComplete={handleImageUploadComplete}
          onPrevious={handlePreviousStep}
        />
      );
    
    default:
      console.error('Unknown step ID:', currentStepId);
      return null;
  }
};

export default FormContent;