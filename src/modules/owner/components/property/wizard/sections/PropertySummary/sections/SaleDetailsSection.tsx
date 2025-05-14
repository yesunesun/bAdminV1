// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/SaleDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 17:40 IST
// Purpose: Section component for sale details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldCurrency } from '../components/fields/FieldCurrency';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const SaleDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Price */}
      <FieldCurrency label="Expected Price" value={data.expectedPrice} />
      
      {/* Price Negotiable */}
      <FieldBoolean label="Price Negotiable" value={data.priceNegotiable} />
      
      {/* Possession Date */}
      <FieldText label="Possession Date" value={data.possessionDate} />
      
      {/* Similar Units */}
      <FieldBoolean label="Has Similar Units" value={data.hasSimilarUnits} />
      
      {/* Property Show Options */}
      <FieldText label="Property Show Option" value={data.propertyShowOption} />
      
      {/* Property Show Person */}
      <FieldText label="Property Show Person" value={data.propertyShowPerson} />
      
      {/* Secondary Contact Number */}
      <FieldText label="Secondary Contact" value={data.secondaryContactNumber || data.secondaryNumber} />
    </div>
  );
};