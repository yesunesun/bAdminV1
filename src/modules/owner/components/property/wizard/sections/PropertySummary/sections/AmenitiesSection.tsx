// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/AmenitiesSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 17:50 IST
// Purpose: Section component for amenities and features

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { FieldList } from '../components/fields/FieldList';
import { SectionComponentProps } from '../types';

export const AmenitiesSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Amenities List */}
      <FieldList label="Amenities" value={data.amenities} />
      
      {/* Parking */}
      <FieldText label="Parking" value={data.parking} />
      
      {/* Pet Friendly */}
      <FieldBoolean label="Pet Friendly" value={data.petFriendly} />
      
      {/* Non-Veg Allowed */}
      <FieldBoolean label="Non-Veg Allowed" value={data.nonVegAllowed} />
      
      {/* Water Supply */}
      <FieldText label="Water Supply" value={data.waterSupply} />
      
      {/* Power Backup */}
      <FieldText label="Power Backup" value={data.powerBackup} />
      
      {/* Gated Security */}
      <FieldBoolean label="Gated Security" value={data.gatedSecurity} />
      
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