// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/CommercialSaleSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 19:45 IST
// Purpose: Flow component for Commercial Sale properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class CommercialSaleSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'com_sale_basic_details',
      'com_sale_location',
      'com_sale_sale_details',
      'com_sale_features'
    ];
  }
}