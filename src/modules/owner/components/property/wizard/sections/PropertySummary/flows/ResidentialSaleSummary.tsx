// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/ResidentialSaleSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 17:05 IST
// Purpose: Flow component for Residential Sale properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class ResidentialSaleSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'res_sale_basic_details',
      'res_sale_location',
      'res_sale_sale_details',
      'res_sale_features'
    ];
  }
}