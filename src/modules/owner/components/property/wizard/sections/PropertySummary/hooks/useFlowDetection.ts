// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/useFlowDetection.ts
// Version: 2.0.0
// Last Modified: 25-05-2025 16:30 IST
// Purpose: Remove residential rent fallback and show explicit errors

import { useMemo } from 'react';
import { FormData } from '../../../types';
import { determineFlowType } from '../services/flowDetector';
import { getStepIdsForFlow } from '../services/dataExtractor';

export const useFlowDetection = (formData: FormData) => {
  const flowType = useMemo(() => {
    try {
      return determineFlowType(formData);
    } catch (error) {
      console.error('Flow detection error:', error);
      // Re-throw the error instead of providing a fallback
      throw new Error(`Flow detection failed: ${error.message}`);
    }
  }, [formData]);
  
  const stepIds = useMemo(() => {
    try {
      return getStepIdsForFlow(flowType);
    } catch (error) {
      console.error('Step IDs detection error:', error);
      throw new Error(`Step IDs detection failed: ${error.message}`);
    }
  }, [flowType]);
  
  return {
    flowType,
    stepIds
  };
};