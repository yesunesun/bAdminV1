// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/RoomDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 17:55 IST
// Purpose: Section component for room details (PG/Hostel/Flatmates)

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldArea } from '../components/fields/FieldArea';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const RoomDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Room Type */}
      <FieldText label="Room Type" value={data.roomType} />
      
      {/* Occupancy Type */}
      <FieldText label="Occupancy Type" value={data.occupancyType} />
      
      {/* Room Size */}
      {data.roomArea && (
        <FieldArea
          label="Room Area"
          value={data.roomArea}
          unit={data.roomAreaUnit || 'sqft'}
        />
      )}
      
      {/* Floor */}
      {data.floor !== undefined && data.totalFloors !== undefined && (
        <FieldText
          label="Floor"
          value={`${data.floor} out of ${data.totalFloors}`}
        />
      )}
      
      {/* Attached Bathroom */}
      <FieldBoolean label="Attached Bathroom" value={data.hasAttachedBathroom} />
      
      {/* Balcony */}
      <FieldBoolean label="Has Balcony" value={data.hasBalcony} />
      
      {/* AC */}
      <FieldBoolean label="Has AC" value={data.hasAC} />
      
      {/* Furnishing Status */}
      <FieldText label="Furnishing Status" value={data.furnishingStatus} />
    </div>
  );
};