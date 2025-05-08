// src/modules/owner/components/property/wizard/PropertyForm/components/FormContent.tsx
// Version: 5.1.0
// Last Modified: 09-05-2025 13:45 IST
// Purpose: Updated to use new step names and fix import issues for named exports

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';

// Import all sections - with correct named imports for components that use named exports
import { PropertyDetails } from '../../sections/PropertyDetails';
import { CommercialBasicDetails } from '../../sections/CommercialBasicDetails';
import CoworkingBasicDetails from '../../sections/CoworkingBasicDetails';
import { LocationDetails } from '../../sections/LocationDetails'; 
import RentalDetails from '../../sections/RentalDetails';
import { SaleDetails } from '../../sections/SaleDetails';
import { AmenitiesSection } from '../../sections/AmenitiesSection';
import PropertySummary from '../../sections/PropertySummary';
import { ImageUploadSection } from '../../sections/ImageUploadSection';
import LandDetails from '../../sections/LandDetails';
import LandFeaturesDetails from '../../sections/LandFeaturesDetails';
import FlatmateDetails from '../../sections/FlatmateDetails';
import PGDetails from '../../sections/PGDetails';
import CommercialDetails from '../../sections/CommercialDetails';
import CommercialFeatures from '../../sections/CommercialFeatures';
import CommercialSaleDetails from '../../sections/CommercialSaleDetails';
import CoworkingDetails from '../../sections/CoworkingDetails';
import RoomDetails from '../../sections/RoomDetails';

interface FormContentProps {
  form: UseFormReturn<FormData>;
  formStep: number;
  STEPS: any[];
  effectiveCategory: string;
  effectiveAdType: string;
  mode: 'create' | 'edit';
  selectedCity: string;
  isSaleMode: boolean;
  isPGHostelMode: boolean;
  isCommercialRentMode: boolean;
  isCommercialSaleMode: boolean;
  isCoworkingMode: boolean;
  isLandSaleMode: boolean;
  isFlatmatesMode: boolean;
  handlePreviousStep: () => void;
  handleSaveAsDraft: () => Promise<void>;
  handleSaveAndPublish: () => Promise<void>;
  handleUpdate: () => Promise<void>;
  saving: boolean;
  status: 'draft' | 'published';
  savedPropertyId?: string;
  handleImageUploadComplete?: () => void;
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
  isPGHostelMode,
  isCommercialRentMode,
  isCommercialSaleMode,
  isCoworkingMode,
  isLandSaleMode,
  isFlatmatesMode,
  handlePreviousStep,
  handleSaveAsDraft,
  handleSaveAndPublish,
  handleUpdate,
  saving,
  status,
  savedPropertyId,
  handleImageUploadComplete
}: FormContentProps) => {
  // Get current step ID
  const currentStep = STEPS[formStep - 1]?.id || '';
  
  // Determine which form section to display based on the current step
  const renderFormSection = () => {
    // Map step to component
    switch (currentStep) {
      // Basic details section - different components based on property type
      case 'basic_details':
        if (isCommercialRentMode || isCommercialSaleMode) {
          return <CommercialBasicDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        } else if (isCoworkingMode) {
          return <CoworkingBasicDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        } else if (isLandSaleMode) {
          return <LandDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        } else if (isPGHostelMode || isFlatmatesMode) {
          return <RoomDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        } else {
          return <PropertyDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        }
        
      // Location details section - same for all property types
      case 'location':
        return <LocationDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        
      // Rental details section
      case 'rental':
        return <RentalDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        
      // Sale details section
      case 'sale':
        if (isCommercialSaleMode) {
          return <CommercialSaleDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        } else {
          return <SaleDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        }
        
      // PG/Hostel details section
      case 'pg_details':
        return <PGDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        
      // Flatmate details section
      case 'flatmate_details':
        return <FlatmateDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        
      // Coworking details section
      case 'coworking':
        return <CoworkingDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        
      // Commercial features section
      case 'commercial_details':
        return <CommercialDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        
      // Land features section
      case 'land_features':
        return <LandFeaturesDetails form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        
      // Features section
      case 'features':
        if (isCommercialRentMode || isCommercialSaleMode) {
          return <CommercialFeatures form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        } else {
          return <AmenitiesSection form={form} mode={mode} category={effectiveCategory} adType={effectiveAdType} />;
        }
        
      // Image upload section
      case 'photos':
        return savedPropertyId ? (
          <ImageUploadSection 
            propertyId={savedPropertyId} 
            onUploadComplete={handleImageUploadComplete} 
            onPrevious={handlePreviousStep} 
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-primary text-lg">Please save your property first to upload images</p>
          </div>
        );
        
      // Review section
      case 'review':
        const formData = form.getValues();
        return (
          <PropertySummary
            formData={formData}
            onPrevious={handlePreviousStep}
            onSaveAsDraft={handleSaveAsDraft}
            onSaveAndPublish={handleSaveAndPublish}
            onUpdate={handleUpdate}
            saving={saving}
            status={status}
            propertyId={savedPropertyId}
          />
        );
        
      // Default fallback
      default:
        return (
          <div className="text-center p-8">
            <p className="text-primary text-lg">Section not found: {currentStep}</p>
          </div>
        );
    }
  };
  
  return <div className="space-y-6">{renderFormSection()}</div>;
};

export default FormContent;