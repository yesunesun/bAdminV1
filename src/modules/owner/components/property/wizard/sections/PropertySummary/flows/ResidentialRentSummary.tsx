// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/ResidentialRentSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:35 IST
// Purpose: Flow component for Residential Rent properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class ResidentialRentSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'res_rent_basic_details',
      'res_rent_location',
      'res_rent_rental',
      'res_rent_features'
    ];
  }
}