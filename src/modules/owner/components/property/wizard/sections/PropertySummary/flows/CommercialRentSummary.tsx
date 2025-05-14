// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/CommercialRentSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:50 IST
// Purpose: Flow component for Commercial Rent properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class CommercialRentSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'com_rent_basic_details',
      'com_rent_location',
      'com_rent_rental',
      'com_rent_features'
    ];
  }
}