// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummary.tsx
// Version: 1.2.0
// Last Modified: 13-05-2025 17:45 IST
// Purpose: Core PropertySummary component with clean, one-time data transformation logging

import React, { useEffect, useRef } from 'react';
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
// Corrected import path
import { prepareFormDataForSubmission } from '@/modules/owner/components/property/wizard/utils/formDataFormatter';

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

  // Use ref to ensure the transformation only runs once
  const hasTransformed = useRef(false);
  
  // Detect flow type and get step IDs
  const { flowType, stepIds } = useFlowDetection(formData);
  
  // Transform and log data only once on initial render
  useEffect(() => {
    // Skip if already transformed or if formData is not available
    if (hasTransformed.current || !formData) return;
    
    // Mark as transformed to prevent multiple executions
    hasTransformed.current = true;
    
    // Create context params for the data transformation
    const contextParams = {
      urlPath: window.location.pathname,
      isSaleMode: formData?.propertyDetails?.adType === 'Sale' || false,
      isPGHostelMode: formData?.propertyDetails?.propertyType === 'PG/Hostel' || false,
      adType: formData?.propertyDetails?.adType
    };
    
    try {
      // Transform the data using the utility function
      const transformedData = prepareFormDataForSubmission(formData, contextParams);
      
      // Log only the transformed data, clean and simple
      console.log('Transformed JSON:', transformedData);
    } catch (error) {
      console.error('Transformation error:', error);
    }
  }, []); // Empty dependency array ensures it only runs once on mount
  
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