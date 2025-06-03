// src/modules/seeker/components/PropertyDetails/LandSaleDetailsSection.tsx
// Version: 1.5.0
// Last Modified: 03-06-2025 16:15 IST
// Purpose: Fixed land type extraction from propertyType and implemented conditional rendering for empty fields

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LandSaleDetailsSectionProps {
  landDetails?: any; // Accept any structure since the data can be nested in different ways
}

const LandSaleDetailsSection: React.FC<LandSaleDetailsSectionProps> = ({ landDetails }) => {
  // Format a property value safely with fallback
  const formatPropertyValue = (value: any, defaultValue: string = '-'): string => {
    if (value === null || value === undefined) return defaultValue;
    if (value === '') return defaultValue;
    if (value === 0 && defaultValue !== '0') return defaultValue;
    return String(value);
  };

  // Check if a value should be displayed (not empty/null/undefined)
  const shouldDisplayField = (value: any): boolean => {
    if (value === null || value === undefined || value === '') return false;
    if (value === 0) return false; // Don't show zero values for land details
    if (Array.isArray(value) && value.length === 0) return false;
    if (typeof value === 'object' && Object.keys(value).length === 0) return false;
    return true;
  };

  // Format currency in Indian Rupees
  const formatIndianRupees = (amount: number | string): string => {
    const numValue = typeof amount === 'number' ? amount : Number(parseFloat(amount));
    
    if (isNaN(numValue)) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numValue);
  };

  // Extract data from potentially different locations in the property data
  const extractData = () => {
    if (!landDetails) return null;

    // Check for data in both the top level and in specific step objects
    const basicDetails = landDetails.land_sale_basic_details || {};
    const landFeatures = landDetails.land_sale_land_features || {};
    
    // Get expected price with fallbacks
    const expectedPrice = 
      basicDetails.expectedPrice || 
      landDetails.expectedPrice || 
      (landDetails.price ? landDetails.price.toString() : '0');
    
    // FIXED: Extract land type from propertyType field (this was the main issue)
    const landType = 
      landDetails.propertyType ||           // This is where "Residential Plot" is stored
      basicDetails.propertyType ||
      landDetails.landType || 
      basicDetails.landType || 
      '';
    
    // Combine data from all potential locations, prioritizing the most specific
    return {
      expectedPrice: expectedPrice,
      isNegotiable: basicDetails.isNegotiable || landDetails.isNegotiable || false,
      landType: landType, // Using the fixed extraction
      plotArea: landDetails.builtUpArea || basicDetails.builtUpArea || '',
      plotAreaUnit: landDetails.builtUpAreaUnit || basicDetails.builtUpAreaUnit || 'sqft',
      plotLength: landDetails.plotLength || basicDetails.plotLength || '',
      plotWidth: landDetails.plotWidth || basicDetails.plotWidth || '',
      plotFacing: landDetails.plotFacing || basicDetails.plotFacing || '',
      approvalStatus: landDetails.approvalStatus || basicDetails.approvalStatus || '',
      boundaryType: landDetails.boundaryType || basicDetails.boundaryType || '',
      topography: landDetails.topographyType || basicDetails.topographyType || '',
      waterAvailability: landDetails.waterAvailability || basicDetails.waterAvailability || '',
      electricityStatus: landDetails.electricityStatus || basicDetails.electricityStatus || '',
      roadConnectivity: landDetails.roadConnectivity || basicDetails.roadConnectivity || '',
      developmentStatus: landDetails.developmentStatus || basicDetails.developmentStatus || '',
      floorSpaceIndex: landDetails.floorSpaceIndex || basicDetails.floorSpaceIndex || '',
      description: landDetails.description || basicDetails.description || '',
      nearbyLandmarks: landDetails.nearbyLandmarks || '',
      rera: landDetails.rera || '',
      khataNumber: landDetails.khataNumber || '',
      surveyNumber: landDetails.surveyNumber || ''
    };
  };

  const data = extractData();

  // If no land details are provided or extraction failed, show a message
  if (!data) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Land Details</h3>
          <p className="text-muted-foreground">No land details available for this property.</p>
        </CardContent>
      </Card>
    );
  }

  // Format area with unit
  const formatArea = (area: any, unit: string = 'sqft'): string => {
    if (!area) return '-';
    return `${area} ${unit || 'sqft'}`;
  };

  // Format dimensions - only return if both values exist
  const formatDimensions = (length: any, width: any): string => {
    if (!length || !width) return '';
    return `${length} × ${width}`;
  };

  // Create an array of field configurations with conditional rendering
  const fieldConfigurations = [
    {
      key: 'landType',
      label: 'Land Type',
      value: data.landType,
      show: shouldDisplayField(data.landType)
    },
    {
      key: 'plotArea',
      label: 'Plot Area',
      value: formatArea(data.plotArea, data.plotAreaUnit),
      show: shouldDisplayField(data.plotArea)
    },
    {
      key: 'plotDimensions',
      label: 'Plot Dimensions',
      value: formatDimensions(data.plotLength, data.plotWidth),
      show: shouldDisplayField(data.plotLength) && shouldDisplayField(data.plotWidth)
    },
    {
      key: 'plotFacing',
      label: 'Plot Facing',
      value: data.plotFacing,
      show: shouldDisplayField(data.plotFacing)
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      value: data.approvalStatus,
      show: shouldDisplayField(data.approvalStatus)
    },
    {
      key: 'boundaryType',
      label: 'Boundary Type',
      value: data.boundaryType,
      show: shouldDisplayField(data.boundaryType)
    },
    {
      key: 'topography',
      label: 'Topography',
      value: data.topography,
      show: shouldDisplayField(data.topography)
    },
    {
      key: 'waterAvailability',
      label: 'Water Availability',
      value: data.waterAvailability,
      show: shouldDisplayField(data.waterAvailability)
    },
    {
      key: 'electricityStatus',
      label: 'Electricity Status',
      value: data.electricityStatus,
      show: shouldDisplayField(data.electricityStatus)
    },
    {
      key: 'roadConnectivity',
      label: 'Road Connectivity',
      value: data.roadConnectivity,
      show: shouldDisplayField(data.roadConnectivity)
    },
    {
      key: 'developmentStatus',
      label: 'Development Status',
      value: data.developmentStatus,
      show: shouldDisplayField(data.developmentStatus)
    },
    {
      key: 'floorSpaceIndex',
      label: 'Floor Space Index',
      value: data.floorSpaceIndex,
      show: shouldDisplayField(data.floorSpaceIndex)
    },
    {
      key: 'surveyNumber',
      label: 'Survey Number',
      value: data.surveyNumber,
      show: shouldDisplayField(data.surveyNumber)
    },
    {
      key: 'khataNumber',
      label: 'Khata Number',
      value: data.khataNumber,
      show: shouldDisplayField(data.khataNumber)
    },
    {
      key: 'rera',
      label: 'RERA ID',
      value: data.rera,
      show: shouldDisplayField(data.rera)
    }
  ];

  // Filter out fields that shouldn't be displayed
  const visibleFields = fieldConfigurations.filter(field => field.show);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header with title and price */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h3 className="text-lg font-semibold">Land Details</h3>
          <div className="mt-2 md:mt-0">
            <span className="text-2xl font-bold text-primary">
              {formatIndianRupees(data.expectedPrice)}
            </span>
            {data.isNegotiable && (
              <span className="text-sm text-muted-foreground ml-2">(Negotiable)</span>
            )}
          </div>
        </div>
        
        {/* Conditionally render fields in a responsive grid */}
        {visibleFields.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleFields.map((field) => (
              <div key={field.key}>
                <p className="text-sm text-muted-foreground">{field.label}</p>
                <p className="font-medium">{field.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No additional land details available.</p>
          </div>
        )}

        {/* Description section - only show if description exists */}
        {shouldDisplayField(data.description) && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="whitespace-pre-line">{data.description}</p>
          </div>
        )}
        
        {/* Nearby landmarks section - only show if landmarks exist */}
        {shouldDisplayField(data.nearbyLandmarks) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-2">Nearby Landmarks</p>
            <p>{data.nearbyLandmarks}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LandSaleDetailsSection;