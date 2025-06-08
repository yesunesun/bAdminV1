// src/modules/owner/components/property/wizard/sections/PropertySummary/flows/FlowFactory.tsx
// Version: 3.0.0
// Last Modified: 14-05-2025 23:00 IST
// Purpose: Factory to create the right flow component with land flow added

import { FLOW_TYPES } from '../../../constants/flows';
import { BaseSummaryFlow } from './base/BaseSummaryFlow';
import { ResidentialSaleSummary } from './ResidentialSaleSummary';
import { ResidentialRentSummary } from './ResidentialRentSummary';
import { ResidentialPGHostelSummary } from './ResidentialPGHostelSummary';
import { ResidentialFlatmatesSummary } from './ResidentialFlatmatesSummary';
import { CommercialSaleSummary } from './CommercialSaleSummary';
import { CommercialRentSummary } from './CommercialRentSummary';
import { CommercialCoworkingSummary } from './CommercialCoworkingSummary';
import { LandSaleSummary } from './LandSaleSummary';

export class FlowFactory {
  static getFlowComponent(flowType: string): typeof BaseSummaryFlow {
    switch (flowType) {
      case FLOW_TYPES.RESIDENTIAL_SALE:
        return ResidentialSaleSummary;
      case FLOW_TYPES.RESIDENTIAL_RENT:
        return ResidentialRentSummary;
      case FLOW_TYPES.RESIDENTIAL_PGHOSTEL:
        return ResidentialPGHostelSummary;
      case FLOW_TYPES.RESIDENTIAL_FLATMATES:
        return ResidentialFlatmatesSummary;
      case FLOW_TYPES.COMMERCIAL_SALE:
        return CommercialSaleSummary;
      case FLOW_TYPES.COMMERCIAL_RENT:
        return CommercialRentSummary;
      case FLOW_TYPES.COMMERCIAL_COWORKING:
        return CommercialCoworkingSummary;
      case FLOW_TYPES.LAND_SALE:
        return LandSaleSummary;
      default:
        // If no specific flow type is found, try to use a sensible fallback
        if (flowType.includes('residential') && flowType.includes('sale')) {
          return ResidentialSaleSummary;
        } else if (flowType.includes('residential') && flowType.includes('rent')) {
          return ResidentialRentSummary;
        } else if (flowType.includes('pg') || flowType.includes('hostel')) {
          return ResidentialPGHostelSummary;
        } else if (flowType.includes('flatmate')) {
          return ResidentialFlatmatesSummary;
        } else if (flowType.includes('commercial') && flowType.includes('sale')) {
          return CommercialSaleSummary;
        } else if (flowType.includes('commercial') && flowType.includes('rent')) {
          return CommercialRentSummary;
        } else if (flowType.includes('coworking')) {
          return CommercialCoworkingSummary;
        } else if (flowType.includes('land')) {
          return LandSaleSummary;
        }
        
        console.warn(`Unknown flow type: ${flowType}, using ResidentialRentSummary as default`);
        return ResidentialRentSummary;
    }
  }
}