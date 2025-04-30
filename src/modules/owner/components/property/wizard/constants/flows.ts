// src/modules/owner/components/property/wizard/constants/flows.ts
// Version: 2.3.0
// Last Modified: 01-05-2025 13:15 IST
// Purpose: Removed Photos step from all property flows

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
  
  // Commercial Rent flow (updated to remove commercial tab)
  COMMERCIAL_RENT: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.rental,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // New Flow 1: Commercial Sale flow
  COMMERCIAL_SALE: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.commercial_sale,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // New Flow 2: Commercial Co-working flow
  COMMERCIAL_COWORKING: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.coworking,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // New Flow 3: Land/Plot Sale flow
  LAND_SALE: [
    STEP_DEFINITIONS.land_details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.land_features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ],
  
  // New Flow 4: Residential Flatmates flow
  RESIDENTIAL_FLATMATES: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.flatmate_details,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review
    // Photos step removed
  ]
};