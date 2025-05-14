// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/CommercialCoworkingSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:55 IST
// Purpose: Flow component for Commercial Coworking properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class CommercialCoworkingSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'com_cow_basic_details',
      'com_cow_location',
      'com_cow_coworking_details',
      'com_cow_features'
    ];
  }
}