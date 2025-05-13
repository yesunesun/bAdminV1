// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummary.tsx
// Version: 2.6.0
// Last Modified: 14-05-2025 12:15 IST
// Purpose: Fixed section ordering to ensure all Commercial Rent sections are displayed

import React, { useEffect, useState } from 'react';
import { Info, Home, MapPin, Check, Clock, Wallet, Wrench, Layers, Briefcase } from 'lucide-react';
import { PropertySummaryProps } from './types';
import { useFlowDetection } from './hooks/useFlowDetection';
import { usePropertyTitle } from './hooks/usePropertyTitle';
import { PropertyTitleEditor } from './components/PropertyTitleEditor';
import { SummarySection } from './components/SummarySection';
import { DescriptionSection } from './components/DescriptionSection';
// Corrected import path
import { prepareFormDataForSubmission } from '@/modules/owner/components/property/wizard/utils/formDataFormatter';
import { formatCurrency, formatArea, formatBoolean } from './services/dataFormatter';

// Helper function to clean up the JSON structure
const cleanupJsonStructure = (data: any) => {
  if (!data) return data;
  
  // Create a new object with only the standard sections
  const cleanedData = {
    meta: data.meta || {},
    flow: data.flow || {},
    steps: data.steps || {},
    media: data.media || {}
  };
  
  return cleanedData;
};

// Helper function to capitalize first letter of each word
const capitalizeEachWord = (str: string): string => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Helper function to format field label from camelCase
const formatFieldLabel = (key: string): string => {
  // Remove common prefixes
  const cleanKey = key
    .replace(/^has/, '')
    .replace(/^is/, '');
  
  // Convert camelCase to spaces
  return cleanKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Helper function to format field value based on type
const formatFieldValue = (key: string, value: any): string => {
  if (value === undefined || value === null || value === '') {
    return '-';
  }
  
  // Format boolean values
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  // Format array values
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  // Format price/monetary values
  if ((key.toLowerCase().includes('price') || 
      key.toLowerCase().includes('deposit') || 
      key.toLowerCase().includes('cost') || 
      key.toLowerCase().includes('amount')) && 
      !isNaN(Number(value))) {
    return `₹${parseInt(value).toLocaleString('en-IN')}`;
  }
  
  // Format area values
  if (key.toLowerCase().includes('area') && !key.toLowerCase().includes('areaunit')) {
    return `${value} ${key.toLowerCase().includes('builtup') ? 'sq. ft.' : ''}`;
  }
  
  // Format floor values
  if (key === 'floor' && value && typeof value === 'string') {
    return value;
  }
  
  return String(value);
};

// Helper to determine section order
const getSectionPriority = (stepId: string): number => {
  if (stepId.includes('basic_details')) return 1;
  if (stepId.includes('location')) return 2;
  if (stepId.includes('rental')) return 3;
  if (stepId.includes('sale_details')) return 3;
  if (stepId.includes('features')) return 4;
  if (stepId.includes('land_features')) return 5;
  if (stepId.includes('coworking_details')) return 6;
  if (stepId.includes('flatmate_details')) return 7;
  if (stepId.includes('pg_details')) return 8;
  return 10; // Default priority for other sections
};

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

  // State to hold the transformed data
  const [transformedData, setTransformedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Detect flow type and get step IDs
  const { flowType, stepIds } = useFlowDetection(formData);
  
  // Transform data on initial render
  useEffect(() => {
    if (!formData) return;
    
    setIsLoading(true);
    setError(null);
    
    // Create context params for the data transformation
    const contextParams = {
      urlPath: window.location.pathname,
      isSaleMode: formData?.propertyDetails?.adType === 'Sale' || false,
      isPGHostelMode: formData?.propertyDetails?.propertyType === 'PG/Hostel' || false,
      adType: formData?.propertyDetails?.adType
    };
    
    try {
      // Transform the data using the utility function
      const transformed = prepareFormDataForSubmission(formData, contextParams);
      
      // Clean up the JSON structure to only include standard sections
      const cleanedData = cleanupJsonStructure(transformed);
      
      // Log the raw steps data for debugging
      console.log('Steps data for review:', cleanedData.steps);
      
      // Set the transformed data to state for rendering
      setTransformedData(cleanedData);
    } catch (error) {
      console.error('Transformation error:', error);
      setError('Failed to transform data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData]); // Only re-run if formData changes
  
  // Use the title from the transformed data or from the property title hook
  const {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown
  } = usePropertyTitle(formData, stepIds, flowType);

  // Show loading state while data is being transformed
  if (isLoading) {
    return (
      <div className="py-6 px-4">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show error state if transformation failed
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

  // Use the transformed data if available, otherwise fall back to formData
  const data = transformedData || formData;
  
  // Get flow information
  const flowCategory = data?.flow?.category || '';
  const flowListingType = data?.flow?.listingType || '';
  const flowInfo = `${capitalizeEachWord(flowCategory)} ${capitalizeEachWord(flowListingType)}`;
  
  // Find the title from the data
  let propertyTitle = '';
  
  // Search for title in all steps
  for (const stepId in data?.steps) {
    if (data.steps[stepId]?.title) {
      propertyTitle = data.steps[stepId].title;
      break;
    }
  }
  
  // If not found, use the editedTitle or a default
  if (!propertyTitle) {
    propertyTitle = editedTitle || 'Property Details';
  }
  
  // Get address information from the location step
  let address = '';
  let coordinates = '-';
  
  // Search for address in all location steps
  for (const stepId in data?.steps) {
    if (stepId.toLowerCase().includes('location')) {
      const locationStep = data.steps[stepId];
      if (locationStep?.address) {
        address = locationStep.address;
      }
      
      break;
    }
  }
  
  // Get description from any step
  let description = '';
  for (const stepId in data?.steps) {
    if (data.steps[stepId]?.description) {
      description = data.steps[stepId].description;
      break;
    } else if (data.steps[stepId]?.additionalDetails) {
      description = data.steps[stepId].additionalDetails;
      break;
    } else if (data.steps[stepId]?.nearbyLandmarks) {
      description = data.steps[stepId].nearbyLandmarks;
      break;
    }
  }
  
  // Dynamically create sections based on step IDs
  const sections = [];
  
  // Log all steps for debugging
  console.log("Processing steps:", Object.keys(data?.steps || {}));
  
  // Process each step as its own section
  for (const stepId in data?.steps) {
    // Skip empty steps
    if (!data.steps[stepId] || Object.keys(data.steps[stepId]).length === 0) {
      console.log(`Skipping empty step: ${stepId}`);
      continue;
    }
    
    console.log(`Processing step: ${stepId} with ${Object.keys(data.steps[stepId]).length} fields`);
    
    // Format the section title based on the step ID
    let sectionTitle = stepId
      .replace(/_/g, ' ')
      .replace(/com rent/, 'commercial rental')
      .replace(/com cow/, 'coworking')
      .replace(/res rent/, 'residential rental')
      .replace(/land sale/, 'land')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Remove redundant words
    sectionTitle = sectionTitle
      .replace('Basic Details', 'Basic Details')
      .replace('Location Details', 'Location Details')
      .replace('Coworking Details', 'Coworking Details')
      .replace('Features Details', 'Features');
    
    // Remove flow prefix from title if present
    ['Basic', 'Location', 'Coworking', 'Features', 'Land', 'Sale', 'Rental'].forEach(word => {
      if (sectionTitle.startsWith(word)) {
        sectionTitle = word + sectionTitle.substring(word.length);
      }
    });
    
    // Choose appropriate icon based on section content
    let icon = <Info className="h-4 w-4" />;
    
    if (stepId.includes('basic_details')) {
      icon = <Home className="h-4 w-4" />;
      sectionTitle = 'Basic Details';
    } else if (stepId.includes('location')) {
      icon = <MapPin className="h-4 w-4" />;
      sectionTitle = 'Location Details';
    } else if (stepId.includes('features')) {
      icon = <Check className="h-4 w-4" />;
      sectionTitle = 'Property Features';
    } else if (stepId.includes('coworking')) {
      icon = <Briefcase className="h-4 w-4" />;
      sectionTitle = 'Coworking Details';
    } else if (stepId.includes('land_features')) {
      icon = <Layers className="h-4 w-4" />;
      sectionTitle = 'Land Features';
    } else if (stepId.includes('sale')) {
      icon = <Wallet className="h-4 w-4" />;
      sectionTitle = 'Sale Details';
    } else if (stepId.includes('rental')) {
      icon = <Wallet className="h-4 w-4" />;
      sectionTitle = 'Rental Details';
    }
    
    // Create items for this section
    const items = [];
    
    // Process each field in the step
    for (const key in data.steps[stepId]) {
      // Skip title and description fields as they are handled separately
      if (key === 'title' || key === 'description' || key === '__typename') {
        continue;
      }
      
      // Special handling for floor + totalFloors
      if (key === 'floor' && data.steps[stepId]['totalFloors']) {
        items.push({
          label: 'Floor',
          value: `${data.steps[stepId]['floor']} out of ${data.steps[stepId]['totalFloors']}`
        });
        continue;
      }
      
      // Skip totalFloors as it's handled with floor
      if (key === 'totalFloors' && data.steps[stepId]['floor']) {
        continue;
      }
      
      // Special handling for builtUpArea + builtUpAreaUnit
      if (key === 'builtUpArea' && data.steps[stepId]['builtUpAreaUnit']) {
        items.push({
          label: 'Built-up Area',
          value: `${data.steps[stepId]['builtUpArea']} ${
            data.steps[stepId]['builtUpAreaUnit'] === 'sqft' ? 'sq. ft.' : 
            data.steps[stepId]['builtUpAreaUnit'] === 'sqyd' ? 'sq. yd.' : 
            data.steps[stepId]['builtUpAreaUnit']
          }`
        });
        continue;
      }
      
      // Skip builtUpAreaUnit as it's handled with builtUpArea
      if (key === 'builtUpAreaUnit' && data.steps[stepId]['builtUpArea']) {
        continue;
      }
      
      // Add standard field
      items.push({
        label: formatFieldLabel(key),
        value: formatFieldValue(key, data.steps[stepId][key])
      });
    }
    
    // Only add sections with items
    if (items.length > 0) {
      sections.push({
        id: stepId,
        title: sectionTitle,
        icon,
        items,
        priority: getSectionPriority(stepId) // Add priority for sorting
      });
    }
  }
  
  // Sort sections by priority
  sections.sort((a, b) => a.priority - b.priority);
  
  return (
    <div className="space-y-6 py-4">
      {/* 1. HEADER: Property Title and Address */}
      <div className="border-b border-border pb-4">
        <h2 className="text-2xl font-bold">{propertyTitle}</h2>
        {address && <p className="text-sm text-gray-600 mt-1">{address}</p>}
      </div>
      
      {/* 2. ALWAYS FIRST: Listing Information */}
      <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-3">Listing Information</h3>
        <SummarySection
          title="Listing Information"
          icon={<Clock className="h-4 w-4" />}
          items={[
            { label: 'Flow Type', value: flowInfo },
            { label: 'Status', value: data?.meta?.status || status }
          ]}
        />
      </div>
      
      {/* 3. DEBUG: Log which sections are being rendered */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 text-xs rounded hidden">
          <div>Found {sections.length} sections to render</div>
          <div>{sections.map(s => s.title).join(', ')}</div>
        </div>
      )}
      
      {/* 3. CONTENT: All other property details sections */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-primary mb-3">Property Details</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <SummarySection
              key={section.id || `section-${index}`}
              title={section.title}
              icon={section.icon}
              items={section.items}
            />
          ))}
        </div>
      </div>

      {/* 4. FOOTER: Description Section if available */}
      {description && (
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-primary mb-3">Description</h3>
          <DescriptionSection description={description} />
        </div>
      )}
    </div>
  );
};