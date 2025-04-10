// src/modules/owner/components/property/wizard/constants/flows.ts
// Version: 1.0.0
// Last Modified: 10-04-2025 14:30 IST
// Purpose: Flow-specific constants for property listing wizard

import { STEP_DEFINITIONS } from './common';

// Flow-specific step sequences
export const FLOW_STEPS = {
  // Residential Rent flow
  RESIDENTIAL_RENT: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.rental,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review,
    STEP_DEFINITIONS.photos
  ],
  
  // Residential Sale flow
  RESIDENTIAL_SALE: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.sale,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review,
    STEP_DEFINITIONS.photos
  ],
  
  // Residential PG/Hostel flow
  RESIDENTIAL_PGHOSTEL: [
    STEP_DEFINITIONS.details,
    STEP_DEFINITIONS.location,
    STEP_DEFINITIONS.room_details,
    STEP_DEFINITIONS.pg_details,
    STEP_DEFINITIONS.features,
    STEP_DEFINITIONS.review,
    STEP_DEFINITIONS.photos
  ]
};