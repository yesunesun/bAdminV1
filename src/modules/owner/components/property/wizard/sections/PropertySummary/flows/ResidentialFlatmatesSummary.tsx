// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/ResidentialFlatmatesSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:45 IST
// Purpose: Flow component for Residential Flatmates properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class ResidentialFlatmatesSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'res_flat_basic_details',
      'res_flat_location',
      'res_flat_flatmate_details',
      'res_flat_features'
    ];
  }
}