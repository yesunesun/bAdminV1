// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/PGDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:00 IST
// Purpose: Section component for PG/Hostel details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldList } from '../components/fields/FieldList';
import { FieldCurrency } from '../components/fields/FieldCurrency';
import { FieldTime } from '../components/fields/FieldTime';
import { SectionComponentProps } from '../types';

export const PGDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Gender Preference */}
      <FieldText label="Place is available for" value={data.genderPreference} />
      
      {/* Occupant Type */}
      <FieldText label="Preferred guests" value={data.occupantType} />
      
      {/* Available From */}
      <FieldText label="Available from" value={data.availableFrom} />
      
      {/* Gate Closing Time - Display in 12-hour format */}
      <FieldTime label="Gate closing time" value={data.gateClosingTime} />
      
      {/* Rules */}
      <FieldList label="PG/Hostel Rules" value={data.rules} />
      
      {/* Description */}
      <FieldText label="Description" value={data.description} />
    </div>
  );
};