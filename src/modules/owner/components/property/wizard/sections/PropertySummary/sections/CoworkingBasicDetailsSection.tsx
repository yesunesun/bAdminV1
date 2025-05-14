// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/CoworkingBasicDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:30 IST
// Purpose: Section component for coworking basic details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldArea } from '../components/fields/FieldArea';
import { SectionComponentProps } from '../types';

export const CoworkingBasicDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Coworking Space Type */}
      <FieldText label="Space Type" value={data.spaceType} />
      
      {/* Space Name */}
      <FieldText label="Space Name" value={data.spaceName} />
      
      {/* Total Area */}
      {data.totalArea && (
        <FieldArea
          label="Total Area"
          value={data.totalArea}
          unit={data.areaUnit || 'sqft'}
        />
      )}
      
      {/* Seating Capacity */}
      <FieldText label="Seating Capacity" value={data.seatingCapacity} />
      
      {/* Operating Hours */}
      <FieldText label="Operating Hours" value={data.operatingHours} />
      
      {/* Founded Year */}
      <FieldText label="Founded Year" value={data.foundedYear} />
      
      {/* Number of Locations */}
      <FieldText label="Number of Locations" value={data.numberOfLocations} />
      
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