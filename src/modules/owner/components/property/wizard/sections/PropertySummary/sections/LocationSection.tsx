// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/LocationSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 17:35 IST
// Purpose: Section component for location details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { SectionComponentProps } from '../types';

export const LocationSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  // Format coordinates if available
  const coordinates = 
    data.coordinates?.latitude && data.coordinates?.longitude 
      ? `${data.coordinates.latitude}, ${data.coordinates.longitude}`
      : data.coordinates ? JSON.stringify(data.coordinates) : null;
  
  return (
    <div className="space-y-2">
      {/* Full address */}
      <FieldText label="Address" value={data.address} />
      
      {/* Flat/Plot No. */}
      <FieldText label="Flat/Plot No." value={data.flatPlotNo} />
      
      {/* Locality */}
      <FieldText label="Locality" value={data.locality} />
      
      {/* City, State and Pin Code */}
      <div className="grid grid-cols-3 gap-4">
        <FieldText label="City" value={data.city} />
        <FieldText label="State" value={data.state} />
        <FieldText label="Pin Code" value={data.pinCode} />
      </div>
      
      {/* Landmark */}
      <FieldText label="Landmark" value={data.landmark} />
      
      {/* Coordinates */}
      <FieldText label="Coordinates" value={coordinates} />
    </div>
  );
};