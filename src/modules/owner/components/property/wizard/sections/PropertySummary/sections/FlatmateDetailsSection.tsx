// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/FlatmateDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:05 IST
// Purpose: Section component for flatmate details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const FlatmateDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Preferred Gender */}
      <FieldText label="Preferred Gender" value={data.preferredGender} />
      
      {/* Occupancy */}
      <FieldText label="Occupancy" value={data.occupancy} />
      
      {/* Food Preference */}
      <FieldText label="Food Preference" value={data.foodPreference} />
      
      {/* Tenant Type */}
      <FieldText label="Tenant Type" value={data.tenantType} />
      
      {/* Room Sharing */}
      <FieldBoolean label="Room Sharing" value={data.roomSharing} />
      
      {/* Max Flatmates */}
      <FieldText label="Max Flatmates" value={data.maxFlatmates} />
      
      {/* Current Flatmates */}
      <FieldText label="Current Flatmates" value={data.currentFlatmates} />
      
      {/* About */}
      {data.about && (
        <div className="col-span-full mt-2">
          <h4 className="text-sm font-medium text-gray-500 mb-1">About:</h4>
          <p className="text-sm text-gray-900 whitespace-pre-wrap border p-2 rounded-md bg-gray-50">
            {data.about}
          </p>
        </div>
      )}
    </div>
  );
};