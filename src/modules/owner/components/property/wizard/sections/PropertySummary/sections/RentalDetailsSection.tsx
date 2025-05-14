// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/RentalDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 17:45 IST
// Purpose: Section component for rental details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldCurrency } from '../components/fields/FieldCurrency';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const RentalDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Rent Amount */}
      <FieldCurrency label="Rent Amount" value={data.rentAmount} />
      
      {/* Security Deposit */}
      <FieldCurrency label="Security Deposit" value={data.securityDeposit} />
      
      {/* Maintenance Charges */}
      <FieldCurrency label="Maintenance Charges" value={data.maintenanceCharges} />
      
      {/* Rent Negotiable */}
      <FieldBoolean label="Rent Negotiable" value={data.rentNegotiable} />
      
      {/* Available From */}
      <FieldText label="Available From" value={data.availableFrom} />
      
      {/* Preferred Tenants */}
      <FieldText 
        label="Preferred Tenants" 
        value={Array.isArray(data.preferredTenants) ? data.preferredTenants.join(', ') : data.preferredTenants} 
      />
      
      {/* Lease Duration */}
      <FieldText label="Lease Duration" value={data.leaseDuration} />
      
      {/* Furnishing Status */}
      <FieldText label="Furnishing Status" value={data.furnishingStatus} />
    </div>
  );
};