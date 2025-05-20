// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummaryPage.tsx
// Version: 3.0.0
// Last Modified: 21-05-2025 18:00 IST
// Purpose: Removed references to deleted PropertyTitleEditor component

import React, { useEffect, useState, useCallback } from 'react';
import { Info, Clock, MapPin, Edit, Check } from 'lucide-react';
import { PropertySummaryProps } from './types';
import { useFlowDetection } from './hooks/useFlowDetection';
import { usePropertyData } from './hooks/usePropertyData';
import { FlowFactory } from './flows/FlowFactory';
import { BaseSummaryFlow } from './flows/base/BaseSummaryFlow';
import { prepareFormDataForSubmission } from '../../utils/formDataFormatter';
import { Card, CardContent } from '@/components/ui/card';
import { DescriptionSection } from './components/DescriptionSection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// Import the seeker's title generator directly
import { generatePropertyTitle } from '@/modules/seeker/utils/propertyTitleUtils';

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
  
  // Simple title management (replacing usePropertyTitle hook)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Initialize title when formData or flow changes
  useEffect(() => {
    if (!formData) return;
    
    // Get title directly from flow.title or generate a new one
    const existingTitle = formData.flow?.title || '';
    
    if (existingTitle && existingTitle !== "New Property") {
      setEditedTitle(existingTitle);
    } else {
      try {
        // Format formData for the seeker's title generator
        const propertyData = {
          property_details: formData,
          address: formData.steps?.[stepIds.location || '']?.address || '',
          city: formData.steps?.[stepIds.location || '']?.city || '',
          locality: formData.steps?.[stepIds.location || '']?.locality || '',
          bedrooms: formData.steps?.[stepIds.basicDetails || '']?.bhkType?.replace('BHK', '').trim() || '',
        };
        
        // Generate a title using the seeker's generator
        const generatedTitle = generatePropertyTitle(propertyData);
        console.log('Generated title using seeker utility:', generatedTitle);
        
        // Update only flow.title
        if (formData.flow) {
          formData.flow.title = generatedTitle.trim();
        } else {
          formData.flow = { title: generatedTitle.trim() };
        }
        
        setEditedTitle(generatedTitle);
      } catch (error) {
        console.error('Error generating title:', error);
        // Set a generic title as fallback
        const fallbackTitle = 'New Property Listing';
        
        // Update only flow.title
        if (formData.flow) {
          formData.flow.title = fallbackTitle;
        } else {
          formData.flow = { title: fallbackTitle };
        }
        
        setEditedTitle(fallbackTitle);
      }
    }
  }, [formData, stepIds, flowType]);
  
  // Handle title edit completion
  const handleTitleEditComplete = useCallback(() => {
    if (editedTitle.trim()) {
      // Update only flow.title
      if (formData.flow) {
        formData.flow.title = editedTitle.trim();
      } else {
        formData.flow = { title: editedTitle.trim() };
      }
    }
    setIsEditingTitle(false);
  }, [editedTitle, formData]);
  
  // Handle keyboard events
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      const currentTitle = formData.flow?.title || '';
      setEditedTitle(currentTitle);
      setIsEditingTitle(false);
    }
  }, [formData, handleTitleEditComplete]);
  
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
  
  // Get property title
  const propertyTitle = dataToRender?.flow?.title || editedTitle || 'Property Details';
  
  // Get the flow component for the current flow type
  const FlowComponent = FlowFactory.getFlowComponent(flowType);
  
  return (
    <div className="space-y-6 py-4">
      {/* HEADER: Property Title with inline editor */}
      <div className="mb-6">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-lg font-semibold h-10"
              placeholder="Enter property title"
            />
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleTitleEditComplete}
              className="p-2 h-10 w-10"
            >
              <Check className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">
              {propertyTitle || "Unnamed Property"}
            </h2>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => setIsEditingTitle(true)}
              className="p-1 h-8 w-8 ml-1"
              title="Edit property title"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
        <p className="text-muted-foreground text-sm mt-1">{fullAddress}</p>
      </div>
      
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