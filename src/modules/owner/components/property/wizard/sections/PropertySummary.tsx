// src/modules/owner/components/property/wizard/sections/PropertySummary.tsx
// Version: 9.0.0
// Last Modified: 14-05-2025 16:30 IST
// Purpose: Fixed to handle actual land sale data structure with proper field mapping

import React, { useMemo, useState, useEffect } from 'react';
import { FormSection } from '@/components/FormSection';
import { FormData } from '../types';
import { 
  MapPin, Home, SquareStack, Sparkles, IndianRupee, Building, Info, Edit, 
  Check, Users, Briefcase, Map, BedDouble, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FLOW_TYPES, FLOW_STEPS } from '../constants/flows';

interface PropertySummaryProps {
  formData: FormData;
  onPrevious: () => void;
  onSaveAsDraft: () => Promise<string>;
  onSaveAndPublish: () => Promise<string>;
  onUpdate: () => Promise<void>;
  saving: boolean;
  status?: 'draft' | 'published';
  propertyId?: string;
}

interface SummarySectionProps {
  title: string;
  icon: React.ReactNode;
  items: Array<{
    label: string;
    value?: string | number | boolean | string[];
  }>;
}

const SummarySection: React.FC<SummarySectionProps> = ({ title, icon, items }) => (
  <Card className="overflow-hidden border-border hover:shadow-md transition-all duration-200">
    <CardHeader className="bg-secondary/20 py-3 px-4">
      <CardTitle className="text-base font-medium flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4">
      <dl className="grid gap-2">
        {items.filter(item => item.value !== undefined && item.value !== null && item.value !== '').map(({ label, value }) => (
          <div key={label} className="grid grid-cols-2 gap-2 py-1 border-b border-border/30 last:border-0">
            <dt className="text-sm font-medium text-muted-foreground">{label}:</dt>
            <dd className="text-sm text-foreground font-medium">
              {typeof value === 'boolean' ? (
                value ? 'Yes' : 'No'
              ) : Array.isArray(value) ? (
                value.length > 0 ? value.join(', ') : '-'
              ) : typeof value === 'string' || typeof value === 'number' ? (
                String(value) || '-'
              ) : '-'}
            </dd>
          </div>
        ))}
      </dl>
    </CardContent>
  </Card>
);

// Helper functions
const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const formatCurrency = (value?: string | number) => {
  if (!value || value === 0) return '-';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '-' : `₹${numValue.toLocaleString('en-IN')}`;
};

const formatArea = (area?: string | number, unit?: string) => {
  if (!area) return '-';
  const displayUnit = unit === 'sqyd' ? 'sq. yard' : 'sq. ft.';
  return `${area} ${displayUnit}`;
};

const formatBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowercaseValue = value.toLowerCase();
    return lowercaseValue === 'yes' || lowercaseValue === 'true' || lowercaseValue === 'on';
  }
  if (typeof value === 'number') return value !== 0;
  return undefined;
};

/**
 * Comprehensive flow type detection with land sale focus
 */
const determineFlowType = (formData: FormData): string => {
  // Check for land sale specific data structure
  if (formData.steps && (
    formData.steps['land_sale_basic_details'] || 
    formData.steps['land_sale_location'] || 
    formData.steps['land_sale_land_features']
  )) {
    return FLOW_TYPES.LAND_SALE;
  }
  
  // Other flow detection logic remains the same
  if (formData.flow?.category && formData.flow?.listingType) {
    const flowKey = `${formData.flow.category}_${formData.flow.listingType}`;
    const standardFlowType = FLOW_TYPES[flowKey.toUpperCase() as keyof typeof FLOW_TYPES];
    if (standardFlowType) return standardFlowType;
  }
  
  // URL detection
  const path = window.location.pathname.toLowerCase();
  if (path.includes('land') && path.includes('sale')) return FLOW_TYPES.LAND_SALE;
  
  // Default fallback
  return FLOW_TYPES.RESIDENTIAL_RENT;
};

/**
 * Get step IDs for land sale flow specifically
 */
const getStepIdsForFlow = (flowType: string) => {
  if (flowType === FLOW_TYPES.LAND_SALE) {
    return {
      basicDetails: 'land_sale_basic_details',
      location: 'land_sale_location',
      saleDetails: 'land_sale_basic_details', // Land sale price is in basic details
      landFeatures: 'land_sale_land_features'
    };
  }
  
  // Fallback for other flows
  const flowSteps = FLOW_STEPS[flowType] || FLOW_STEPS.default;
  const stepMap: Record<string, string> = {};
  
  flowSteps.forEach(stepId => {
    if (stepId.includes('basic_details')) stepMap.basicDetails = stepId;
    if (stepId.includes('location')) stepMap.location = stepId;
    if (stepId.includes('rental')) stepMap.rental = stepId;
    if (stepId.includes('sale_details')) stepMap.saleDetails = stepId;
    if (stepId.includes('features')) stepMap.features = stepId;
    if (stepId.includes('flatmate_details')) stepMap.flatmateDetails = stepId;
    if (stepId.includes('pg_details')) stepMap.pgDetails = stepId;
    if (stepId.includes('coworking_details')) stepMap.coworkingDetails = stepId;
    if (stepId.includes('land_features')) stepMap.landFeatures = stepId;
  });
  
  return stepMap;
};

/**
 * Enhanced field value retrieval for land sale
 */
const getFieldValue = (formData: FormData, stepId: string, fieldName: string, fallbackPaths?: string[]): any => {
  // Primary: Check in steps structure
  if (formData.steps?.[stepId]?.[fieldName] !== undefined) {
    return formData.steps[stepId][fieldName];
  }
  
  // Secondary: Check direct property
  if (formData[fieldName] !== undefined) {
    return formData[fieldName];
  }
  
  // Land sale specific mappings
  if (stepId === 'land_sale_basic_details') {
    const stepData = formData.steps?.[stepId];
    if (stepData) {
      // Map specific field names
      if (fieldName === 'totalArea') return stepData.builtUpArea;
      if (fieldName === 'areaUnit') return stepData.builtUpAreaUnit;
      if (fieldName === 'price' || fieldName === 'expectedPrice') return stepData.expectedPrice;
    }
  }
  
  if (stepId === 'land_sale_land_features') {
    const stepData = formData.steps?.[stepId];
    if (stepData) {
      // Check for boolean features
      if (fieldName === 'nearbyFacilities') {
        // Collect all nearby features
        const facilities = [];
        if (stepData.nearbySchool) facilities.push('School');
        if (stepData.nearbyStation) facilities.push('Station');
        if (stepData.nearbyAirport) facilities.push('Airport');
        if (stepData.nearbyHospital) facilities.push('Hospital');
        if (stepData.nearbyMarket) facilities.push('Market');
        if (stepData.nearbyHighway) facilities.push('Highway');
        return facilities.length > 0 ? facilities : undefined;
      }
      
      if (fieldName === 'landDocuments') {
        // Collect all document types
        const documents = [];
        if (stepData.titleDeed) documents.push('Title Deed');
        if (stepData.taxReceipts) documents.push('Tax Receipts');
        if (stepData.encumbranceCertificate) documents.push('Encumbrance Certificate');
        if (stepData.landSurveyReport) documents.push('Land Survey Report');
        if (stepData.conversionOrder) documents.push('Conversion Order');
        return documents.length > 0 ? documents : undefined;
      }
    }
  }
  
  // Tertiary: Check fallback paths
  if (fallbackPaths) {
    for (const path of fallbackPaths) {
      const parts = path.split('.');
      let value = formData;
      
      for (const part of parts) {
        if (value && typeof value === 'object' && value[part] !== undefined) {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      
      if (value !== undefined) return value;
    }
  }
  
  return undefined;
};

export function PropertySummary(props: PropertySummaryProps) {
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
  
  // State for editing title
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  
  // Determine flow type and get step IDs
  const flowType = useMemo(() => determineFlowType(formData), [formData]);
  const stepIds = useMemo(() => getStepIdsForFlow(flowType), [flowType]);
  
  // Get property title and update state
  useEffect(() => {
    let title = getFieldValue(formData, stepIds.basicDetails || '', 'title', ['title', 'details.title']);
    
    if (!title || title === "New Property") {
      // Generate title if not present
      const flow = formData.flow || {};
      const category = flow.category || 'land';
      const listingType = flow.listingType || 'sale';
      
      title = generatePropertyTitle(formData, stepIds, flowType, category, listingType);
      
      // Save generated title
      if (formData.steps?.[stepIds.basicDetails || '']) {
        formData.steps[stepIds.basicDetails].title = title;
      } else {
        formData.title = title;
      }
    }
    
    setEditedTitle(title || '');
  }, [formData, stepIds, flowType]);
  
  // Handle title edit
  const handleTitleEditComplete = () => {
    if (editedTitle.trim()) {
      if (formData.steps?.[stepIds.basicDetails]) {
        formData.steps[stepIds.basicDetails].title = editedTitle.trim();
      } else {
        formData.title = editedTitle.trim();
      }
    }
    setIsEditingTitle(false);
  };
  
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleEditComplete();
    } else if (e.key === 'Escape') {
      setEditedTitle(getFieldValue(formData, stepIds.basicDetails || '', 'title', ['title']) || '');
      setIsEditingTitle(false);
    }
  };
  
  // Calculate derived values
  const { flowInfo, coordinates, fullAddress } = useMemo(() => {
    const flow = formData.flow || {};
    const category = flow.category || 'land';
    const listingType = flow.listingType || 'sale';
    const flowInfo = `${capitalize(category)} ${capitalize(listingType)}`;
    
    // Get coordinates for land sale
    const lat = getFieldValue(formData, stepIds.location || '', 'latitude');
    const lng = getFieldValue(formData, stepIds.location || '', 'longitude');
    
    const coordinates = lat && lng ? `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}` : '-';
    
    // Get full address
    const address = getFieldValue(formData, stepIds.location || '', 'address');
    const fullAddress = address || '-';
    
    return { flowInfo, coordinates, fullAddress };
  }, [formData, stepIds]);
  
  // Basic details for land sale
  const basicDetailItems = useMemo(() => {
    const items = [];
    const stepId = stepIds.basicDetails || '';
    
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const landType = getFieldValue(formData, stepId, 'landType');
      const length = getFieldValue(formData, stepId, 'plotLength');
      const width = getFieldValue(formData, stepId, 'plotWidth');
      const area = getFieldValue(formData, stepId, 'builtUpArea');
      const areaUnit = getFieldValue(formData, stepId, 'builtUpAreaUnit') || 'sq.ft.';
      const facing = getFieldValue(formData, stepId, 'plotFacing');
      
      items.push(
        { label: 'Land Type', value: landType },
        { label: 'Total Area', value: formatArea(area, areaUnit) },
        { label: 'Plot Facing', value: facing }
      );
      
      if (length && width) {
        items.push({ label: 'Plot Dimensions', value: `${length} x ${width}` });
      }
    }
    
    return items;
  }, [formData, stepIds, flowType]);
  
  // Location details
  const locationItems = useMemo(() => {
    const stepId = stepIds.location || '';
    return [
      { label: 'Plot No.', value: getFieldValue(formData, stepId, 'flatPlotNo') },
      { label: 'Address', value: getFieldValue(formData, stepId, 'address') },
      { label: 'Landmark', value: getFieldValue(formData, stepId, 'landmark') },
      { label: 'Locality', value: getFieldValue(formData, stepId, 'locality') },
      { label: 'Area', value: getFieldValue(formData, stepId, 'area') },
      { label: 'City', value: getFieldValue(formData, stepId, 'city') },
      { label: 'PIN Code', value: getFieldValue(formData, stepId, 'pinCode') },
      { label: 'Coordinates', value: coordinates }
    ];
  }, [formData, stepIds, coordinates]);
  
  // Sale details for land
  const saleItems = useMemo(() => {
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const stepId = stepIds.basicDetails || ''; // Price is in basic details for land
      return [
        { 
          label: 'Expected Price', 
          value: formatCurrency(getFieldValue(formData, stepId, 'expectedPrice')) 
        },
        { 
          label: 'Development Status', 
          value: getFieldValue(formData, stepId, 'developmentStatus')
        },
        { 
          label: 'Approval Status', 
          value: getFieldValue(formData, stepId, 'approvalStatus')
        }
      ];
    }
    return [];
  }, [formData, stepIds, flowType]);
  
  // Land features
  const landFeatureItems = useMemo(() => {
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const stepId = stepIds.landFeatures || '';
      return [
        { label: 'Corner Plot', value: formatBoolean(getFieldValue(formData, stepId, 'cornerPlot')) },
        { label: 'Park Facing', value: formatBoolean(getFieldValue(formData, stepId, 'parkFacing')) },
        { label: 'East Facing', value: formatBoolean(getFieldValue(formData, stepId, 'eastFacing')) },
        { label: 'Water Connection', value: formatBoolean(getFieldValue(formData, stepId, 'waterConnection')) },
        { label: 'Gated Community', value: formatBoolean(getFieldValue(formData, stepId, 'gatedCommunity')) },
        { label: 'Boundary Type', value: getFieldValue(formData, stepIds.basicDetails || '', 'boundaryType') },
        { label: 'Topography', value: getFieldValue(formData, stepIds.basicDetails || '', 'topographyType') },
        { label: 'Water Availability', value: getFieldValue(formData, stepIds.basicDetails || '', 'waterAvailability') },
        { label: 'Electricity Status', value: getFieldValue(formData, stepIds.basicDetails || '', 'electricityStatus') },
        { label: 'Road Connectivity', value: getFieldValue(formData, stepIds.basicDetails || '', 'roadConnectivity') },
        { label: 'Distance from City', value: `${getFieldValue(formData, stepId, 'distanceFromCity')} km` },
        { label: 'Distance from Highway', value: `${getFieldValue(formData, stepId, 'distanceFromHighway')} km` },
        { label: 'Nearby Facilities', value: getFieldValue(formData, stepId, 'nearbyFacilities') },
        { label: 'Land Documents', value: getFieldValue(formData, stepId, 'landDocuments') }
      ];
    }
    return [];
  }, [formData, stepIds, flowType]);
  
  // Get description
  const description = useMemo(() => {
    let desc = '';
    
    if (flowType === FLOW_TYPES.LAND_SALE) {
      // Check for description in basic details first
      desc = getFieldValue(formData, stepIds.basicDetails || '', 'additionalDetails') ||
             getFieldValue(formData, stepIds.landFeatures || '', 'nearbyLandmarks') ||
             '';
    }
    
    return desc;
  }, [formData, flowType, stepIds]);

  return (
    <FormSection
      title="Review Property Details"
      description="Review all details before saving or publishing"
    >
      <div className="space-y-6">
        {/* Property title with edit functionality */}
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
                {editedTitle || "Unnamed Property"}
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
          <SummarySection
            title="Basic Details"
            icon={<Home className="h-4 w-4" />}
            items={basicDetailItems}
          />

          {/* Location Details */}
          <SummarySection
            title="Location Details"
            icon={<MapPin className="h-4 w-4" />}
            items={locationItems}
          />
          
          {/* Sale Details */}
          {saleItems.length > 0 && (
            <SummarySection
              title="Sale Details"
              icon={<IndianRupee className="h-4 w-4" />}
              items={saleItems}
            />
          )}
          
          {/* Land Features */}
          {landFeatureItems.length > 0 && (
            <SummarySection
              title="Land Features"
              icon={<Map className="h-4 w-4" />}
              items={landFeatureItems}
            />
          )}
        </div>

        {/* Description Section */}
        {description && (
          <Card className="overflow-hidden">
            <CardHeader className="bg-secondary/20 py-3 px-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </FormSection>
  );
}

/**
 * Property title generation for land sale
 */
function generatePropertyTitle(
  formData: FormData,
  stepIds: Record<string, string>,
  flowType: string,
  category: string,
  listingType: string
): string {
  if (flowType === FLOW_TYPES.LAND_SALE) {
    const landType = getFieldValue(formData, stepIds.basicDetails || '', 'landType') || 'Land';
    const city = getFieldValue(formData, stepIds.location || '', 'city') || 
                 getFieldValue(formData, stepIds.location || '', 'locality') || 
                 'Hyderabad';
    
    return `${landType} for Sale in ${city}`;
  }
  
  // Fallback for other flows
  return `Property for ${capitalize(listingType)} in Hyderabad`;
}

// Export as default for compatibility
export default PropertySummary;