// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/ResidentialPGHostelSummary.tsx
// Version: 1.0.0
// Last Modified: 14-05-2025 18:40 IST
// Purpose: Flow component for Residential PG/Hostel properties

import { BaseSummaryFlow } from './base/BaseSummaryFlow';

export class ResidentialPGHostelSummary extends BaseSummaryFlow {
  getSectionIds(): string[] {
    return [
      'res_pg_basic_details',
      'res_pg_location',
      'res_pg_pg_details',
      'res_pg_features'
    ];
  }
}