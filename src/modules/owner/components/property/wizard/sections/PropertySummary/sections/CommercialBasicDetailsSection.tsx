// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/CommercialBasicDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:10 IST
// Purpose: Section component for commercial property basic details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldArea } from '../components/fields/FieldArea';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const CommercialBasicDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Commercial Property Type */}
      <FieldText label="Commercial Type" value={data.commercialPropertyType} />
      
      {/* Sub Type */}
      <FieldText label="Sub Type" value={data.subType} />
      
      {/* Built-up Area */}
      {data.builtUpArea && (
        <FieldArea
          label="Built-up Area"
          value={data.builtUpArea}
          unit={data.builtUpAreaUnit || 'sqft'}
        />
      )}
      
      {/* Carpet Area */}
      {data.carpetArea && (
        <FieldArea
          label="Carpet Area"
          value={data.carpetArea}
          unit={data.carpetAreaUnit || 'sqft'}
        />
      )}
      
      {/* Floor */}
      {data.floor !== undefined && data.totalFloors !== undefined && (
        <FieldText
          label="Floor"
          value={`${data.floor} out of ${data.totalFloors}`}
        />
      )}
      
      {/* Age of Construction */}
      <FieldText label="Construction Age" value={data.constructionAge} />
      
      {/* Furnishing Status */}
      <FieldText label="Furnishing Status" value={data.furnishingStatus} />
      
      {/* Facing */}
      <FieldText label="Facing" value={data.facing} />
      
      {/* Ideal For */}
      <FieldText 
        label="Ideal For" 
        value={Array.isArray(data.idealFor) ? data.idealFor.join(', ') : data.idealFor} 
      />
      
      {/* Parking */}
      <FieldText label="Parking" value={data.parking} />
      
      {/* Washrooms */}
      <FieldText label="Washrooms" value={data.washrooms} />
      
      {/* Pantry/Cafeteria */}
      <FieldBoolean label="Pantry/Cafeteria" value={data.hasPantry || data.hasCafeteria} />
    </div>
  );
};