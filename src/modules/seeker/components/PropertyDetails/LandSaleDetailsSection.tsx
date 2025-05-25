// src/modules/seeker/components/PropertyDetails/LandSaleDetailsSection.tsx
// Version: 1.4.0
// Last Modified: 25-05-2025 18:15 IST
// Purpose: Removed unused Soil Type field and refined the component

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
    
    // Combine data from all potential locations, prioritizing the most specific
    return {
      expectedPrice: expectedPrice,
      isNegotiable: basicDetails.isNegotiable || landDetails.isNegotiable || false,
      landType: landDetails.landType || basicDetails.landType || '',
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

  // Format dimensions
  const formatDimensions = (length: any, width: any): string => {
    if (!length && !width) return '-';
    if (length && width) return `${length} × ${width}`;
    return formatPropertyValue(length || width);
  };

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
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Land Type</p>
            <p className="font-medium">{formatPropertyValue(data.landType)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Plot Area</p>
            <p className="font-medium">
              {formatArea(data.plotArea, data.plotAreaUnit)}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Plot Dimensions</p>
            <p className="font-medium">
              {formatDimensions(data.plotLength, data.plotWidth)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Plot Facing</p>
            <p className="font-medium">{formatPropertyValue(data.plotFacing)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Approval Status</p>
            <p className="font-medium">{formatPropertyValue(data.approvalStatus)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Boundary Type</p>
            <p className="font-medium">{formatPropertyValue(data.boundaryType)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Topography</p>
            <p className="font-medium">{formatPropertyValue(data.topography)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Water Availability</p>
            <p className="font-medium">{formatPropertyValue(data.waterAvailability)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Electricity Status</p>
            <p className="font-medium">{formatPropertyValue(data.electricityStatus)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Road Connectivity</p>
            <p className="font-medium">{formatPropertyValue(data.roadConnectivity)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Development Status</p>
            <p className="font-medium">{formatPropertyValue(data.developmentStatus)}</p>
          </div>

          {data.floorSpaceIndex && (
            <div>
              <p className="text-sm text-muted-foreground">Floor Space Index</p>
              <p className="font-medium">{formatPropertyValue(data.floorSpaceIndex)}</p>
            </div>
          )}

          {data.surveyNumber && (
            <div>
              <p className="text-sm text-muted-foreground">Survey Number</p>
              <p className="font-medium">{formatPropertyValue(data.surveyNumber)}</p>
            </div>
          )}

          {data.khataNumber && (
            <div>
              <p className="text-sm text-muted-foreground">Khata Number</p>
              <p className="font-medium">{formatPropertyValue(data.khataNumber)}</p>
            </div>
          )}

          {data.rera && (
            <div>
              <p className="text-sm text-muted-foreground">RERA ID</p>
              <p className="font-medium">{formatPropertyValue(data.rera)}</p>
            </div>
          )}
        </div>

        {data.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">Description</p>
            <p className="whitespace-pre-line">{data.description}</p>
          </div>
        )}
        
        {data.nearbyLandmarks && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-muted-foreground mb-1">Nearby Landmarks</p>
            <p>{data.nearbyLandmarks}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LandSaleDetailsSection;