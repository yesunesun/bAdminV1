// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummaryPage.tsx
// Version: 4.0.0
// Last Modified: 25-05-2025 14:40 IST
// Purpose: Enhanced PropertySummaryPage with improved title generation integration

import React, { useEffect, useState } from 'react';
import { Info, Clock, MapPin, Edit, Check, RefreshCw } from 'lucide-react';
import { PropertySummaryProps } from './types';
import { useFlowDetection } from './hooks/useFlowDetection';
import { usePropertyData } from './hooks/usePropertyData';
import { usePropertyTitle } from './hooks/usePropertyTitle';
import { FlowFactory } from './flows/FlowFactory';
import { prepareFormDataForSubmission } from '../../utils/formDataFormatter';
import { Card, CardContent } from '@/components/ui/card';
import { DescriptionSection } from './components/DescriptionSection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  
  // Use the enhanced property title hook
  const {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown,
    regenerateTitle,
    currentTitle
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
      
      console.log('PropertySummaryPage - Transformed data:', cleanedData);
    } catch (error) {
      console.error('PropertySummaryPage - Transformation error:', error);
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
          <p className="ml-4 text-muted-foreground">Preparing property summary...</p>
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
            <Info className="h-8 w-8 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-4">Something went wrong</p>
            <p className="text-sm mb-4">{error}</p>
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
    <div className="space-y-6 py-4 max-w-4xl mx-auto">
      {/* HEADER: Property Title with enhanced inline editor */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        {isEditingTitle ? (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Edit Property Title</label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="text-lg font-semibold h-12"
                placeholder="Enter property title"
              />
              <Button 
                size="sm" 
                variant="default" 
                onClick={handleTitleEditComplete}
                className="h-12 px-4"
                disabled={!editedTitle.trim()}
              >
                <Check className="h-5 w-5 mr-1" />
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  const currentTitle = formData.flow?.title || '';
                  setEditedTitle(currentTitle);
                  setIsEditingTitle(false);
                }}
                className="h-12 px-4"
              >
                Cancel
              </Button>
            </div>
            <p className="text-xs text-gray-500">Press Enter to save, Escape to cancel</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  {currentTitle || "Unnamed Property"}
                </h1>
                <p className="text-muted-foreground text-sm">{fullAddress}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsEditingTitle(true)}
                  className="h-9 px-3"
                  title="Edit property title"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={regenerateTitle}
                  className="h-9 px-3"
                  title="Regenerate title using current property details"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Listing Information Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Listing Information
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="h-4 w-4" /> 
                Listing Type
              </span>
              <span className="text-sm font-semibold text-gray-900">{flowInfo}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> 
                Location
              </span>
              <span className="text-sm font-semibold text-gray-900 text-right max-w-[200px] truncate" title={fullAddress}>
                {fullAddress || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm md:col-span-2">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Edit className="h-4 w-4" /> 
                Property Title
              </span>
              <span className="text-sm font-semibold text-gray-900 text-right max-w-[300px] truncate" title={currentTitle}>
                {currentTitle}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Flow-specific content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">Property Details</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Review all the details for your {flowInfo.toLowerCase()} listing
          </p>
        </div>
        <div className="p-6">
          {FlowComponent ? (
            <FlowComponent formData={dataToRender} />
          ) : (
            <div className="flex justify-center items-center h-48 text-amber-600 bg-amber-50 rounded-lg">
              <div className="text-center flex flex-col items-center gap-3">
                <Info className="h-8 w-8" />
                <div>
                  <p className="font-medium">Flow Component Not Found</p>
                  <p className="text-sm text-amber-700">No component available for flow type: {flowType}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Description Section if available */}
      {description && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Property Description
            </h3>
            <DescriptionSection description={description} />
          </CardContent>
        </Card>
      )}
      
      {/* Debug Information (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="p-4">
            <details className="text-xs">
              <summary className="font-medium cursor-pointer text-gray-600 hover:text-gray-800">
                Debug Information (Development Only)
              </summary>
              <div className="mt-2 space-y-2 text-gray-500">
                <p><strong>Flow Type:</strong> {flowType}</p>
                <p><strong>Step IDs:</strong> {JSON.stringify(stepIds, null, 2)}</p>
                <p><strong>Has Flow Component:</strong> {FlowComponent ? 'Yes' : 'No'}</p>
                <p><strong>Current Title:</strong> {currentTitle}</p>
                <p><strong>Full Address:</strong> {fullAddress}</p>
              </div>
            </details>
          </CardContent>
        </Card>
      )}
    </div>
  );
};