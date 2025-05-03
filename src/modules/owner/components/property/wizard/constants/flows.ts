// src/modules/owner/components/property/wizard/constants/flows.ts
// Version: 2.7.0
// Last Modified: 03-05-2025 16:15 IST
// Purpose: Fixed missing first step in Commercial Rent flow

import { STEP_DEFINITIONS } from './common';

// Flow-specific step sequences
export const FLOW_STEPS = {
  // Residential Rent flow (default)
  RESIDENTIAL_RENT: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.rental,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // Residential Sale flow
  RESIDENTIAL_SALE: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.sale,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // Residential PG/Hostel flow
  RESIDENTIAL_PGHOSTEL: [
    STEP_DEFINITIONS.room_details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.pg_details,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // Commercial Rent flow - FIXED: Added property selection step before commercial_basics
  COMMERCIAL_RENT: [
    STEP_DEFINITIONS.details, // Keep the standard details step for initial property selection
    STEP_DEFINITIONS.commercial_basics, // Then use our specialized commercial details step
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.rental,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // Commercial Sale flow
  COMMERCIAL_SALE: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.commercial_sale,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // Commercial Co-working flow
  COMMERCIAL_COWORKING: [
    STEP_DEFINITIONS.details, // Just use the standard details ID for simplicity
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.coworking,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // Land/Plot Sale flow
  LAND_SALE: [
    STEP_DEFINITIONS.land_details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.land_features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // Residential Flatmates flow
  RESIDENTIAL_FLATMATES: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.flatmate_details,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ]
};