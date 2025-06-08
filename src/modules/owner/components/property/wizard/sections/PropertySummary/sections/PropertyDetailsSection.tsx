// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/PropertyDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 17:30 IST
// Purpose: Section component for property details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldArea } from '../components/fields/FieldArea';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const PropertyDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Property Type */}
      <FieldText label="Property Type" value={data.propertyType} />
      
      {/* BHK Type (for apartments) */}
      {data.propertyType === 'Apartment' && (
        <FieldText label="BHK Type" value={data.bhkType} />
      )}
      
      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-2 gap-4">
        <FieldText label="Bedrooms" value={data.bedrooms} />
        <FieldText label="Bathrooms" value={data.bathrooms} />
      </div>
      
      {/* Floor Information */}
      {data.floor !== undefined && data.totalFloors !== undefined && (
        <FieldText
          label="Floor"
          value={`${data.floor} out of ${data.totalFloors}`}
        />
      )}
      
      {/* Area Information */}
      {data.builtUpArea && (
        <FieldArea
          label="Built-up Area"
          value={data.builtUpArea}
          unit={data.builtUpAreaUnit || 'sqft'}
        />
      )}
      
      {/* Furnishing Status */}
      <FieldText label="Furnishing Status" value={data.furnishingStatus} />
      
      {/* Property Age */}
      <FieldText label="Property Age" value={data.propertyAge} />
      
      {/* Balconies */}
      <FieldText label="Balconies" value={data.balconies} />
      
      {/* Facing */}
      <FieldText label="Facing" value={data.facing} />
      
      {/* Property Condition */}
      <FieldText label="Property Condition" value={data.propertyCondition} />
      
      {/* Boolean features */}
      <div className="grid grid-cols-2 gap-4">
        <FieldBoolean label="Has Balcony" value={data.hasBalcony} />
        <FieldBoolean label="Has AC" value={data.hasAC} />
      </div>
    </div>
  );
};