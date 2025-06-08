// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/LandFeaturesDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 22:30 IST
// Purpose: Section component for Land Features

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { FieldList } from '../components/fields/FieldList';

interface LandFeaturesDetailsSectionProps {
  data: any;
  flowType?: string;
  listingType?: string;
}

export const LandFeaturesDetailsSection: React.FC<LandFeaturesDetailsSectionProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Approvals */}
      {data.approvals && data.approvals.length > 0 && (
        <FieldList 
          label="Approvals" 
          value={data.approvals} 
          className="col-span-2" 
        />
      )}
      
      {/* Plot Features */}
      {data.plotFeatures && data.plotFeatures.length > 0 && (
        <FieldList 
          label="Plot Features" 
          value={data.plotFeatures} 
          className="col-span-2" 
        />
      )}
      
      {/* Land Type */}
      {data.landType && (
        <FieldText label="Land Type" value={data.landType} />
      )}
      
      {/* Land Zoning */}
      {data.landZoning && (
        <FieldText label="Land Zoning" value={data.landZoning} />
      )}
      
      {/* Open Sides */}
      {data.openSides && (
        <FieldText label="Open Sides" value={data.openSides} />
      )}
      
      {/* Road Width */}
      {data.roadWidth !== undefined && (
        <FieldText 
          label="Road Width" 
          value={`${data.roadWidth} ${data.roadWidthUnit || 'feet'}`} 
        />
      )}
      
      {/* Boolean fields with proper formatting */}
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <FieldBoolean label="Corner Plot" value={data.isCornerPlot} />
        <FieldBoolean label="Gated Community" value={data.isGatedCommunity} />
        <FieldBoolean label="Near Highway" value={data.isNearHighway} />
        <FieldBoolean label="Has Water Supply" value={data.hasWaterSupply} />
        <FieldBoolean label="Has Electricity" value={data.hasElectricity} />
        <FieldBoolean label="Has Sewage System" value={data.hasSewageSystem} />
      </div>
      
      {/* Distance from main locations */}
      {data.distanceFromMainRoad !== undefined && (
        <FieldText 
          label="Distance from Main Road" 
          value={`${data.distanceFromMainRoad} km`} 
        />
      )}
      
      {data.distanceFromHighway !== undefined && (
        <FieldText 
          label="Distance from Highway" 
          value={`${data.distanceFromHighway} km`} 
        />
      )}
      
      {/* Additional Notes */}
      {data.additionalNotes && (
        <FieldText 
          label="Additional Notes" 
          value={data.additionalNotes} 
          className="col-span-2" 
        />
      )}
    </div>
  );
};