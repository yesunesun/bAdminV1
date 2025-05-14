// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/PGDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:00 IST
// Purpose: Section component for PG/Hostel details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldList } from '../components/fields/FieldList';
import { FieldCurrency } from '../components/fields/FieldCurrency';
import { SectionComponentProps } from '../types';

export const PGDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* PG Type */}
      <FieldText label="PG Type" value={data.pgType} />
      
      {/* Gender Preference */}
      <FieldText label="Gender Preference" value={data.genderPreference} />
      
      {/* Meal Options */}
      <FieldList label="Meal Options" value={data.mealOptions} />
      
      {/* Room Types Available */}
      <FieldList label="Room Types" value={data.roomTypes} />
      
      {/* Occupancy Types Available */}
      <FieldList label="Occupancy Types" value={data.occupancyTypes} />
      
      {/* Rent Amount */}
      <FieldCurrency label="Rent From" value={data.rentStart || data.minRent} />
      <FieldCurrency label="Rent To" value={data.rentEnd || data.maxRent} />
      
      {/* Security Deposit */}
      <FieldCurrency label="Security Deposit" value={data.securityDeposit} />
      
      {/* Rules */}
      <FieldList label="Rules" value={data.rules} />
      
      {/* Facilities */}
      <FieldList label="Facilities" value={data.facilities} />
      
      {/* Notice Period */}
      <FieldText label="Notice Policy" value={data.noticePolicy} />
    </div>
  );
};