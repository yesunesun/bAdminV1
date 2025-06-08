// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/CommercialRentalDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:20 IST
// Purpose: Section component for commercial rental details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldCurrency } from '../components/fields/FieldCurrency';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const CommercialRentalDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Monthly Rent */}
      <FieldCurrency label="Monthly Rent" value={data.rentAmount} />
      
      {/* Security Deposit */}
      <FieldCurrency label="Security Deposit" value={data.securityDeposit} />
      
      {/* Rent Negotiable */}
      <FieldBoolean label="Rent Negotiable" value={data.rentNegotiable} />
      
      {/* Maintenance Charges */}
      <FieldCurrency label="Maintenance Charges" value={data.maintenanceCharges} />
      
      {/* Lock-in Period */}
      <FieldText label="Lock-in Period" value={data.lockInPeriod} />
      
      {/* Lease Period */}
      <FieldText label="Lease Period" value={data.leaseDuration || data.leasePeriod} />
      
      {/* Lease Type */}
      <FieldText label="Lease Type" value={data.leaseType} />
      
      {/* Available From */}
      <FieldText label="Available From" value={data.availableFrom} />
      
      {/* Pre-leased / Pre-rented */}
      <FieldBoolean label="Pre-leased / Pre-rented" value={data.isPreLeased || data.isPreRented} />
      
      {/* Current Tenant Details (if pre-leased) */}
      {(data.isPreLeased || data.isPreRented) && (
        <>
          <FieldText label="Current Tenant" value={data.currentTenantName} />
          <FieldCurrency label="Current Rent" value={data.currentRent} />
          <FieldText label="Lease Expiry" value={data.leaseExpiryDate} />
        </>
      )}
      
      {/* Secondary Contact */}
      <FieldText label="Secondary Contact" value={data.secondaryContactNumber || data.secondaryNumber} />
    </div>
  );
};