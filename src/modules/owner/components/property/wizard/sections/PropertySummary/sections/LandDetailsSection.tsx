// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/LandDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 22:15 IST
// Purpose: Section component for Land/Plot Details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldArea } from '../components/fields/FieldArea';
import { FieldBoolean } from '../components/fields/FieldBoolean';

interface LandDetailsSectionProps {
  data: any;
  flowType?: string;
  listingType?: string;
}

export const LandDetailsSection: React.FC<LandDetailsSectionProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.title && (
        <FieldText label="Title" value={data.title} className="col-span-2" />
      )}
      
      {data.plotType && (
        <FieldText label="Plot Type" value={data.plotType} />
      )}
      
      {data.plotArea && (
        <FieldArea
          label="Plot Area"
          value={data.plotArea}
          unit={data.plotAreaUnit || 'sqft'}
        />
      )}
      
      {data.dimensions && (
        <FieldText label="Dimensions" value={data.dimensions} />
      )}
      
      {data.lengthWidth && (
        <FieldText 
          label="Length × Width" 
          value={`${data.length || '-'} × ${data.width || '-'} ${data.dimensionUnit || 'feet'}`} 
        />
      )}
      
      {data.facing && (
        <FieldText label="Facing" value={data.facing} />
      )}
      
      {data.boundaryWall !== undefined && (
        <FieldBoolean label="Boundary Wall" value={data.boundaryWall} />
      )}
      
      {data.plotNumber && (
        <FieldText label="Plot Number" value={data.plotNumber} />
      )}
      
      {data.ownership && (
        <FieldText label="Ownership" value={data.ownership} />
      )}
      
      {data.plotCondition && (
        <FieldText label="Plot Condition" value={data.plotCondition} />
      )}
      
      {data.description && (
        <FieldText 
          label="Description" 
          value={data.description} 
          className="col-span-2" 
        />
      )}
    </div>
  );
};