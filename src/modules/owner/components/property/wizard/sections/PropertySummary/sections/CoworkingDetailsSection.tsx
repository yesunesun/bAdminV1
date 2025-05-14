// src/modules/owner/components/property/wizard/sections/PropertySummary/sections/CoworkingDetailsSection.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:35 IST
// Purpose: Section component for coworking details

import React from 'react';
import { FieldText } from '../components/fields/FieldText';
import { FieldCurrency } from '../components/fields/FieldCurrency';
import { FieldList } from '../components/fields/FieldList';
import { FieldBoolean } from '../components/fields/FieldBoolean';
import { SectionComponentProps } from '../types';

export const CoworkingDetailsSection: React.FC<SectionComponentProps> = ({
  data,
  flowType,
  listingType
}) => {
  if (!data) return null;
  
  return (
    <div className="space-y-2">
      {/* Plans */}
      <FieldList label="Plans" value={data.plans} />
      
      {/* Hot Desk Price */}
      <FieldCurrency label="Hot Desk Price" value={data.hotDeskPrice} />
      
      {/* Dedicated Desk Price */}
      <FieldCurrency label="Dedicated Desk Price" value={data.dedicatedDeskPrice} />
      
      {/* Private Cabin Price */}
      <FieldCurrency label="Private Cabin Price" value={data.privateCabinPrice} />
      
      {/* Meeting Room Price */}
      <FieldCurrency label="Meeting Room Price" value={data.meetingRoomPrice} />
      
      {/* Security Deposit */}
      <FieldCurrency label="Security Deposit" value={data.securityDeposit} />
      
      {/* Minimum Commitment */}
      <FieldText label="Minimum Commitment" value={data.minimumCommitment} />
      
      {/* Notice Period */}
      <FieldText label="Notice Period" value={data.noticePeriod} />
      
      {/* Discounts */}
      <FieldList label="Discounts" value={data.discounts} />
      
      {/* Available From */}
      <FieldText label="Available From" value={data.availableFrom} />
      
      {/* 24/7 Access */}
      <FieldBoolean label="24/7 Access" value={data.has24x7Access} />
      
      {/* Event Space */}
      <FieldBoolean label="Event Space" value={data.hasEventSpace} />
      
      {/* Pet Friendly */}
      <FieldBoolean label="Pet Friendly" value={data.isPetFriendly} />
      
      {/* Wheelchair Accessible */}
      <FieldBoolean label="Wheelchair Accessible" value={data.isWheelchairAccessible} />
    </div>
  );
};