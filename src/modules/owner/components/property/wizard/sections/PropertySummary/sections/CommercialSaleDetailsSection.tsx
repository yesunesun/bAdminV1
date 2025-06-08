// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/CommercialSaleDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:15 IST
// Purpose: Section component for commercial sale details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldCurrency } from '../components/fields/FieldCurrency';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const CommercialSaleDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Sale Price */}
      <FieldCurrency label="Expected Price" value={data.expectedPrice} />
      
      {/* Price Per Sq. Ft. */}
      <FieldCurrency label="Price Per Sq. Ft." value={data.pricePerSqFt} />
      
      {/* Price Negotiable */}
      <FieldBoolean label="Price Negotiable" value={data.priceNegotiable} />
      
      {/* Booking Amount */}
      <FieldCurrency label="Booking Amount" value={data.bookingAmount} />
      
      {/* Maintenance Charges */}
      <FieldCurrency label="Maintenance Charges" value={data.maintenanceCharges} />
      
      {/* Possession Status */}
      <FieldText label="Possession Status" value={data.possessionStatus} />
      
      {/* Possession Date (if under construction) */}
      {data.possessionStatus === 'Under Construction' && (
        <FieldText label="Possession Date" value={data.possessionDate} />
      )}
      
      {/* Sale Type */}
      <FieldText label="Sale Type" value={data.saleType} />
      
      {/* Property Tax */}
      <FieldCurrency label="Property Tax" value={data.propertyTax} />
      
      {/* Transaction Type */}
      <FieldText label="Transaction Type" value={data.transactionType} />
      
      {/* Secondary Contact */}
      <FieldText label="Secondary Contact" value={data.secondaryContactNumber || data.secondaryNumber} />
    </div>
  );
};