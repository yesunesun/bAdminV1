// src/modules/owner/components/property/wizard/sections/PropertySummary/PropertySummary.tsx
// Version: 2.9.2
// Last Modified: 21-05-2025 14:30 IST
// Purpose: Put Previous and Save buttons in the same row

import React, { useEffect, useState } from 'react';
import { Info, Home, MapPin, Check, Clock, Wallet, Wrench, Layers, Briefcase, Save, ArrowLeft } from 'lucide-react';
import { PropertySummaryProps } from './types';
import { useFlowDetection } from './hooks/useFlowDetection';
import { usePropertyTitle } from './hooks/usePropertyTitle';
import { PropertyTitleEditor } from './components/PropertyTitleEditor';
import { SummarySection } from './components/SummarySection';
import { DescriptionSection } from './components/DescriptionSection';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

  // Format date values
  if (key.toLowerCase().includes('date') || key.toLowerCase().includes('from') || key.toLowerCase().includes('until')) {
    // Check if it's a valid date string
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      } catch (e) {
        // If date parsing fails, return the original value
        return String(value);
      }
    }
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

// Helper to get appropriate section title
const getSectionTitle = (stepId: string): string => {
  if (stepId.includes('basic_details')) return 'Basic Details';
  if (stepId.includes('location')) return 'Location Details';
  if (stepId.includes('features')) return 'Property Features';
  if (stepId.includes('sale_details')) return 'Sale Details';
  if (stepId.includes('rental')) return 'Rental Details';
  if (stepId.includes('land_features')) return 'Land Features';
  if (stepId.includes('coworking_details')) return 'Coworking Details';
  if (stepId.includes('flatmate_details')) return 'Flatmate Details';
  if (stepId.includes('pg_details')) return 'PG Details';

  // If not a known step, create a title from the step ID
  return stepId
    .replace(/_/g, ' ')
    .replace(/com rent/, 'commercial rental')
    .replace(/com sale/, 'commercial sale')
    .replace(/com cow/, 'coworking')
    .replace(/res rent/, 'residential rental')
    .replace(/land sale/, 'land')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper to get the appropriate icon for a section
const getSectionIcon = (stepId: string) => {
  if (stepId.includes('basic_details')) return <Home className="h-4 w-4" />;
  if (stepId.includes('location')) return <MapPin className="h-4 w-4" />;
  if (stepId.includes('features')) return <Check className="h-4 w-4" />;
  if (stepId.includes('coworking')) return <Briefcase className="h-4 w-4" />;
  if (stepId.includes('land_features')) return <Layers className="h-4 w-4" />;
  if (stepId.includes('sale')) return <Wallet className="h-4 w-4" />;
  if (stepId.includes('rental')) return <Wallet className="h-4 w-4" />;

  // Default icon
  return <Info className="h-4 w-4" />;
};

export const PropertySummary: React.FC<PropertySummaryProps> = (props) => {
  const {
    formData,
    onPrevious,
    onSaveAsDraft,
    onUpdate,
    saving,
    status = 'draft',
    propertyId
  } = props;

  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State for saving original data
  const [savingOriginal, setSavingOriginal] = useState(false);

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
      isSaleMode: formData?.propertyDetails?.adType === 'Sale' ||
        flowType?.includes('sale') ||
        false,
      isPGHostelMode: formData?.propertyDetails?.propertyType === 'PG/Hostel' || false,
      adType: formData?.propertyDetails?.adType ||
        (flowType?.includes('sale') ? 'sale' : 'rent')
    };

    try {
      // Transform the data using the utility function
      const transformed = prepareFormDataForSubmission(formData, contextParams);

      // Clean up the JSON structure to only include standard sections
      const cleanedData = cleanupJsonStructure(transformed);

      // Log for debugging
      console.log('Transformed & cleaned JSON:', cleanedData);

      // Set the transformed data to state for rendering
      setTransformedData(cleanedData);
    } catch (error) {
      console.error('Transformation error:', error);
      setError('Failed to transform data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, flowType]); // Re-run if formData or flowType changes

  // Use the title from the transformed data or from the property title hook
  const {
    isEditingTitle,
    setIsEditingTitle,
    editedTitle,
    setEditedTitle,
    handleTitleEditComplete,
    handleTitleKeyDown
  } = usePropertyTitle(formData, stepIds, flowType);

  // Function to save the raw formData to properties_v2 table and navigate
  const saveOriginalData = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save properties.",
        variant: "destructive"
      });
      return;
    }

    setSavingOriginal(true);

    try {
      // Use the ORIGINAL formData directly without any transformation
      const originalData = formData;

      console.log('Saving original form data:', originalData);

      // Create new property or update existing one
      const now = new Date().toISOString();
      let savedPropertyId: string;

      if (propertyId) {
        // Update existing property
        const { data, error } = await supabase
          .from('properties_v2')
          .update({
            property_details: originalData,
            updated_at: now,
            status: 'draft'
          })
          .eq('id', propertyId)
          .eq('owner_id', user.id)
          .select();

        if (error) throw error;

        savedPropertyId = propertyId;
        console.log('Updated property with ID:', savedPropertyId);

        toast({
          title: "Success",
          description: `Property updated with ID: ${savedPropertyId}`,
          variant: "default"
        });
      } else {
        // Create new property
        const { data, error } = await supabase
          .from('properties_v2')
          .insert([{
            owner_id: user.id,
            created_at: now,
            updated_at: now,
            property_details: originalData,
            status: 'draft'
          }])
          .select();

        if (error) throw error;

        savedPropertyId = data[0].id;
        console.log('Created new property with ID:', savedPropertyId);

        toast({
          title: "Success",
          description: `Property created with ID: ${savedPropertyId}`,
          variant: "default"
        });
      }

      // Short delay to ensure toast is visible
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Navigate to the property details page
      navigate(`/seeker/property/${savedPropertyId}`);

    } catch (error) {
      console.error('Error saving original data:', error);
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSavingOriginal(false);
    }
  };

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

  // Use the transformed data for display, but we'll save the original formData
  const dataToRender = transformedData || formData;

  // Get flow information
  const flowCategory = dataToRender?.flow?.category || '';
  const flowListingType = dataToRender?.flow?.listingType || '';
  const flowInfo = `${capitalizeEachWord(flowCategory)} ${capitalizeEachWord(flowListingType)}`;

  // Find the title from the data
  let propertyTitle = '';

  // Search for title in all steps
  for (const stepId in dataToRender?.steps) {
    if (dataToRender.steps[stepId]?.title) {
      propertyTitle = dataToRender.steps[stepId].title;
      break;
    }
  }

  // If not found, use the editedTitle or a default
  if (!propertyTitle) {
    propertyTitle = editedTitle || 'Property Details';
  }

  // Get address information from the location step
  let address = '';

  // Search for address in all location steps
  for (const stepId in dataToRender?.steps) {
    if (stepId.toLowerCase().includes('location')) {
      const locationStep = dataToRender.steps[stepId];
      if (locationStep?.address) {
        address = locationStep.address;
      }

      break;
    }
  }

  // Get description from any step
  let description = '';
  for (const stepId in dataToRender?.steps) {
    if (dataToRender.steps[stepId]?.description) {
      description = dataToRender.steps[stepId].description;
      break;
    } else if (dataToRender.steps[stepId]?.additionalDetails) {
      description = dataToRender.steps[stepId].additionalDetails;
      break;
    } else if (dataToRender.steps[stepId]?.nearbyLandmarks) {
      description = dataToRender.steps[stepId].nearbyLandmarks;
      break;
    } else if (dataToRender.steps[stepId]?.directionsTip) {
      description = dataToRender.steps[stepId].directionsTip;
      break;
    }
  }

  // Dynamically create sections based on step IDs
  const sections = [];

  // Log all steps for debugging
  console.log("Processing steps:", Object.keys(dataToRender?.steps || {}));

  // Process each step as its own section
  for (const stepId in dataToRender?.steps) {
    // Skip empty steps
    if (!dataToRender.steps[stepId] || Object.keys(dataToRender.steps[stepId]).length === 0) {
      console.log(`Skipping empty step: ${stepId}`);
      continue;
    }

    console.log(`Processing step: ${stepId} with ${Object.keys(dataToRender.steps[stepId]).length} fields`);

    // Get the section title and icon
    const sectionTitle = getSectionTitle(stepId);
    const icon = getSectionIcon(stepId);

    // Create items for this section
    const items = [];

    // Process each field in the step
    for (const key in dataToRender.steps[stepId]) {
      // Skip title and description fields as they are handled separately
      if (key === 'title' || key === 'description' || key === '__typename') {
        continue;
      }

      // Special handling for floor + totalFloors
      if (key === 'floor' && dataToRender.steps[stepId]['totalFloors']) {
        items.push({
          label: 'Floor',
          value: `${dataToRender.steps[stepId]['floor']} out of ${dataToRender.steps[stepId]['totalFloors']}`
        });
        continue;
      }

      // Skip totalFloors as it's handled with floor
      if (key === 'totalFloors' && dataToRender.steps[stepId]['floor']) {
        continue;
      }

      // Special handling for builtUpArea + builtUpAreaUnit
      if (key === 'builtUpArea' && dataToRender.steps[stepId]['builtUpAreaUnit']) {
        items.push({
          label: 'Built-up Area',
          value: `${dataToRender.steps[stepId]['builtUpArea']} ${dataToRender.steps[stepId]['builtUpAreaUnit'] === 'sqft' ? 'sq. ft.' :
              dataToRender.steps[stepId]['builtUpAreaUnit'] === 'sqyd' ? 'sq. yd.' :
                dataToRender.steps[stepId]['builtUpAreaUnit']
            }`
        });
        continue;
      }

      // Skip builtUpAreaUnit as it's handled with builtUpArea
      if (key === 'builtUpAreaUnit' && dataToRender.steps[stepId]['builtUpArea']) {
        continue;
      }

      // Add standard field
      items.push({
        label: formatFieldLabel(key),
        value: formatFieldValue(key, dataToRender.steps[stepId][key])
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
            { label: 'Status', value: dataToRender?.meta?.status || status }
          ]}
        />
      </div>

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

      {/* 5. ACTIONS: Previous and Save buttons in the same row */}
      <div className="mt-8 border-t border-border pt-6 flex justify-between items-center">
        {/* Previous button */}
        <Button
          onClick={onPrevious}
          disabled={saving || savingOriginal}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Save Original as primary action button */}
        <Button
          onClick={saveOriginalData}
          disabled={savingOriginal || saving}
          variant="default"
          size="lg"
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {savingOriginal ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
              <span>Saving & Publishing...</span>
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              <span>Save & View Property</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};