// src/modules/owner/components/property/wizard/PropertyForm/components/FormContent.tsx
// Version: 6.2.0
// Last Modified: 13-05-2025 14:45 IST
// Purpose: Removed debug button from bottom, moving it to header instead

import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../../types';

// Import all sections
import { PropertyDetails } from '../../sections/PropertyDetails';
import { CommercialBasicDetails } from '../../sections/CommercialBasicDetails';
import CoworkingBasicDetails from '../../sections/CoworkingBasicDetails';
import { LocationDetails } from '../../sections/LocationDetails'; 
import RentalDetails from '../../sections/RentalDetails';
import { SaleDetails } from '../../sections/SaleDetails';
import { AmenitiesSection } from '../../sections/AmenitiesSection';
import { PropertySummary } from "../../sections/PropertySummary/";
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
  showDebugInfo?: boolean;
  setShowDebugInfo?: (show: boolean) => void;
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
  handleImageUploadComplete,
  showDebugInfo = false,
  setShowDebugInfo
}: FormContentProps) => {
  // Get current step ID from STEPS array
  const currentStepObj = STEPS[formStep - 1];
  
  // Generate flow type based on category and type
  const flowType = `${effectiveCategory}_${effectiveAdType}`;
  
  // Render section with proper stepId
  const renderSection = (Component: React.ComponentType<any>, props: any) => {
    return (
      <Component
        {...props}
        form={form}
        mode={mode}
        category={effectiveCategory}
        adType={effectiveAdType}
        stepId={currentStepObj?.id}
      />
    );
  };
  
  // Determine which form section to display based on the current step
  const renderFormSection = () => {
    if (!currentStepObj?.id) {
      return (
        <div className="text-center p-8">
          <p className="text-primary text-lg">Step not found</p>
        </div>
      );
    }

    const stepId = currentStepObj.id;
    
    // Match step patterns to components
    if (stepId.includes('_basic_details')) {
      // Basic details - different components based on property type
      if (isCommercialRentMode || isCommercialSaleMode) {
        return renderSection(CommercialBasicDetails, {});
      } else if (isCoworkingMode) {
        return renderSection(CoworkingBasicDetails, {});
      } else if (isLandSaleMode) {
        return renderSection(LandDetails, {});
      } else if (isPGHostelMode || isFlatmatesMode) {
        return renderSection(RoomDetails, {});
      } else {
        return renderSection(PropertyDetails, {});
      }
    } 
    else if (stepId.includes('_location')) {
      return renderSection(LocationDetails, {});
    }
    else if (stepId.includes('_rental')) {
      return renderSection(RentalDetails, {});
    }
    else if (stepId.includes('_sale_details')) {
      if (isCommercialSaleMode) {
        return renderSection(CommercialSaleDetails, {});
      } else {
        return renderSection(SaleDetails, {});
      }
    }
    else if (stepId.includes('_pg_details')) {
      return renderSection(PGDetails, {});
    }
    else if (stepId.includes('_flatmate_details')) {
      return renderSection(FlatmateDetails, {});
    }
    else if (stepId.includes('_coworking_details')) {
      return renderSection(CoworkingDetails, {});
    }
    else if (stepId.includes('_land_features')) {
      return renderSection(LandFeaturesDetails, {});
    }
    else if (stepId.includes('_features')) {
      if (isCommercialRentMode || isCommercialSaleMode) {
        return renderSection(CommercialFeatures, {});
      } else {
        return renderSection(AmenitiesSection, {});
      }
    }
    else if (stepId.includes('_review')) {
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
    }
    // Handle photos step if it exists in STEPS
    else if (stepId.includes('_photos')) {
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
    }
    // Default fallback
    else {
      return (
        <div className="text-center p-8">
          <p className="text-primary text-lg">Section not found: {stepId}</p>
          <p className="text-sm text-gray-600 mt-2">Flow: {flowType}</p>
        </div>
      );
    }
  };
  
  // Debug panel as popup/modal
  const debugPanel = () => {
    if (!showDebugInfo || process.env.NODE_ENV !== 'development') return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Debug Information</h3>
            <button 
              onClick={() => setShowDebugInfo && setShowDebugInfo(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Form Information</h4>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <div><strong>Current Step:</strong> {currentStepObj?.id}</div>
                  <div><strong>Flow Type:</strong> {flowType}</div>
                  <div><strong>Step Progress:</strong> {formStep}/{STEPS.length}</div>
                  <div><strong>Property Category:</strong> {effectiveCategory}</div>
                  <div><strong>Listing Type:</strong> {effectiveAdType}</div>
                  <div><strong>Mode:</strong> {mode}</div>
                  <div><strong>Sale Mode:</strong> {isSaleMode ? 'Yes' : 'No'}</div>
                  <div><strong>Property ID:</strong> {savedPropertyId || 'Not saved yet'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Property Type Flags</h4>
                <div className="bg-gray-100 p-3 rounded text-xs">
                  <div><strong>isPGHostelMode:</strong> {isPGHostelMode ? 'Yes' : 'No'}</div>
                  <div><strong>isCommercialRentMode:</strong> {isCommercialRentMode ? 'Yes' : 'No'}</div>
                  <div><strong>isCommercialSaleMode:</strong> {isCommercialSaleMode ? 'Yes' : 'No'}</div>
                  <div><strong>isCoworkingMode:</strong> {isCoworkingMode ? 'Yes' : 'No'}</div>
                  <div><strong>isLandSaleMode:</strong> {isLandSaleMode ? 'Yes' : 'No'}</div>
                  <div><strong>isFlatmatesMode:</strong> {isFlatmatesMode ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">Steps Data</h4>
              <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-3 rounded">
                {JSON.stringify(form.getValues('steps'), null, 2)}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">All Form Values</h4>
              <pre className="text-xs overflow-auto max-h-60 bg-gray-100 p-3 rounded">
                {JSON.stringify(form.getValues(), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6 relative">
      {renderFormSection()}
      
      {/* Debug modal/popup */}
      {debugPanel()}
    </div>
  );
};

export default FormContent;