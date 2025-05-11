// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummary.tsx
// Version: 1.0.0
// Last Modified: 19-02-2025 10:30 IST
// Purpose: Core PropertySummary component

import React from 'react';
import { FormSection } from '@/components/FormSection';
import { Info } from 'lucide-react';
import { PropertySummaryProps } from './types';
import { useFlowDetection } from './hooks/useFlowDetection';
import { usePropertyTitle } from './hooks/usePropertyTitle';
import { usePropertyData } from './hooks/usePropertyData';
import { useSummarySections } from './hooks/useSummarySections';
import { PropertyTitleEditor } from './components/PropertyTitleEditor';
import { SummarySection } from './components/SummarySection';
import { BasicDetailsSection } from './components/BasicDetailsSection';
import { LocationSection } from './components/LocationSection';
import { SaleDetailsSection } from './components/SaleDetailsSection';
import { LandFeaturesSection } from './components/LandFeaturesSection';
import { DescriptionSection } from './components/DescriptionSection';

export const PropertySummary: React.FC<PropertySummaryProps> = (props) => {
  const {
    formData,
    onPrevious,
    onSaveAsDraft,
    onSaveAndPublish,
    onUpdate,
    saving,
    status = 'draft',
    propertyId
  } = props;
  
  // Detect flow type and get step IDs
  const { flowType, stepIds } = useFlowDetection(formData);
  
  // Manage property title
  const {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown
  } = usePropertyTitle(formData, stepIds, flowType);
  
  // Get property data
  const {
    flowInfo,
    coordinates,
    fullAddress,
    description
  } = usePropertyData(formData, stepIds);
  
  // Get summary section items
  const {
    basicDetailItems,
    locationItems,
    saleItems,
    landFeatureItems
  } = useSummarySections(formData, stepIds, flowType, coordinates);

  return (
    <FormSection
      title="Review Property Details"
      description="Review all details before saving or publishing"
    >
      <div className="space-y-6">
        {/* Property title with edit functionality */}
        <PropertyTitleEditor
          title={editedTitle}
          isEditing={isEditingTitle}
          onEdit={() => setIsEditingTitle(true)}
          onComplete={handleTitleEditComplete}
          onKeyDown={handleTitleKeyDown}
          onChange={setEditedTitle}
          fullAddress={fullAddress}
        />
        
        {/* Flow Information */}
        <SummarySection
          title="Listing Information"
          icon={<Info className="h-4 w-4" />}
          items={[
            { label: 'Flow Type', value: flowInfo }
          ]}
        />
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Details */}
          <BasicDetailsSection items={basicDetailItems} />

          {/* Location Details */}
          <LocationSection items={locationItems} />
          
          {/* Sale Details */}
          <SaleDetailsSection items={saleItems} />
          
          {/* Land Features */}
          <LandFeaturesSection items={landFeatureItems} />
        </div>

        {/* Description Section */}
        <DescriptionSection description={description} />
      </div>
    </FormSection>
  );
};