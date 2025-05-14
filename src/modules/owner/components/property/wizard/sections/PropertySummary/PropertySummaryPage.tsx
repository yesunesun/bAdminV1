// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummaryPage.tsx
// Version: 2.0.0
// Last Modified: 14-05-2025 19:00 IST
// Purpose: Enhanced entry point component with title and address display

import React, { useEffect, useState } from 'react';
import { Info, Clock, MapPin } from 'lucide-react';
import { PropertySummaryProps } from './types';
import { useFlowDetection } from './hooks/useFlowDetection';
import { usePropertyTitle } from './hooks/usePropertyTitle';
import { usePropertyData } from './hooks/usePropertyData';
import { PropertyTitleEditor } from './components/PropertyTitleEditor';
import { FlowFactory } from './flows/FlowFactory';
import { BaseSummaryFlow } from './flows/base/BaseSummaryFlow';
import { prepareFormDataForSubmission } from '../../utils/formDataFormatter';
import { Card, CardContent } from '@/components/ui/card';
import { DescriptionSection } from './components/DescriptionSection';

// Helper function to capitalize first letter of each word
const capitalizeEachWord = (str: string): string => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

export const PropertySummaryPage: React.FC<PropertySummaryProps> = (props) => {
  const { formData, onPrevious, onSaveAsDraft, onSaveAndPublish, saving, propertyId } = props;
  
  // State to hold the transformed data
  const [transformedData, setTransformedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Detect flow type using the existing hook
  const { flowType, stepIds } = useFlowDetection(formData);
  
  // Use property data hook to get derived values
  const { fullAddress, description, flowInfo } = usePropertyData(formData, stepIds);
  
  // Use property title hook for title management
  const {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown
  } = usePropertyTitle(formData, stepIds, flowType);
  
  // Transform data on initial render
  useEffect(() => {
    if (!formData) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create context params for the data transformation
      const contextParams = {
        urlPath: window.location.pathname,
        isSaleMode: formData?.propertyDetails?.adType === 'Sale' || 
                   flowType?.includes('sale') || 
                   false,
        isPGHostelMode: formData?.propertyDetails?.propertyType === 'PG/Hostel' || false,
        adType: formData?.propertyDetails?.adType || 
               (flowType?.includes('sale') ? 'sale' : 'rent')
      };
      
      // Transform the data using the utility function
      const transformed = prepareFormDataForSubmission(formData, contextParams);
      
      // Clean up the JSON structure to only include standard sections
      const cleanedData = {
        meta: transformed.meta || {},
        flow: transformed.flow || {},
        steps: transformed.steps || {},
        media: transformed.media || {}
      };
      
      setTransformedData(cleanedData);
    } catch (error) {
      console.error('Transformation error:', error);
      setError('Failed to transform data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, flowType]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="py-6 px-4">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="py-6 px-4">
        <div className="flex justify-center items-center h-48 text-red-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-4">Something went wrong</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Use transformed data for rendering
  const dataToRender = transformedData || formData;
  
  // Get the flow component for the current flow type
  const FlowComponent = FlowFactory.getFlowComponent(flowType);
  
  return (
    <div className="space-y-6 py-4">
      {/* HEADER: Property Title with Editor */}
      <PropertyTitleEditor
        title={editedTitle}
        isEditing={isEditingTitle}
        onEdit={() => setIsEditingTitle(true)}
        onComplete={handleTitleEditComplete}
        onKeyDown={handleTitleKeyDown}
        onChange={setEditedTitle}
        fullAddress={fullAddress}
      />
      
      {/* Listing Information Card */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-primary mb-3">Listing Information</h3>
          <div className="grid gap-2">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Listing Type
              </span>
              <span className="text-sm font-medium">{flowInfo}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Location
              </span>
              <span className="text-sm font-medium">{fullAddress || 'Not specified'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Flow-specific content */}
      {FlowComponent ? (
        <FlowComponent formData={dataToRender} />
      ) : (
        <div className="flex justify-center items-center h-48 text-amber-500">
          <div className="text-center flex items-center gap-2">
            <Info className="h-5 w-5" />
            <p>No flow component found for type: {flowType}</p>
          </div>
        </div>
      )}
      
      {/* Description Section if available */}
      {description && (
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-primary mb-3">Description</h3>
          <DescriptionSection description={description} />
        </div>
      )}
    </div>
  );
};