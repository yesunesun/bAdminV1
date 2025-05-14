// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/CommercialFeaturesSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:25 IST
// Purpose: Section component for commercial features

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { FieldList } from '../components/fields/FieldList';
import { SectionComponentProps } from '../types';

export const CommercialFeaturesSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Amenities List */}
      <FieldList label="Amenities" value={data.amenities} />
      
      {/* Facilities */}
      <FieldList label="Facilities" value={data.facilities} />
      
      {/* Fire Safety */}
      <FieldList label="Fire Safety" value={data.fireSafety} />
      
      {/* Power Backup */}
      <FieldText label="Power Backup" value={data.powerBackup} />
      
      {/* Water Supply */}
      <FieldText label="Water Supply" value={data.waterSupply} />
      
      {/* Access Type */}
      <FieldText label="Access Type" value={data.accessType} />
      
      {/* Floor Type */}
      <FieldText label="Floor Type" value={data.floorType} />
      
      {/* Nearby Establishments */}
      <FieldList label="Nearby Establishments" value={data.nearbyEstablishments} />
      
      {/* Description */}
      {data.description && (
        <div className="col-span-full mt-2">
          <h4 className="text-sm font-medium text-gray-500 mb-1">Description:</h4>
          <p className="text-sm text-gray-900 whitespace-pre-wrap border p-2 rounded-md bg-gray-50">
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
};