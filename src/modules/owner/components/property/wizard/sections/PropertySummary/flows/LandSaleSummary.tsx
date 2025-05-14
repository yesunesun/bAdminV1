// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/LandSaleSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 22:45 IST
// Purpose: Flow component for Land Sale properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class LandSaleSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'land_sale_basic_details',  // Land/Plot Details
      'land_sale_location',       // Location
      'land_sale_land_features'   // Land Features
    ];
  }
}