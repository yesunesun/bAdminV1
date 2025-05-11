// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/useFlowDetection.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:40 IST
// Purpose: Flow type detection hook

import { useMemo } from 'react';
import { FormData } from '../../../types';
import { determineFlowType } from '../services/flowDetector';
import { getStepIdsForFlow } from '../services/dataExtractor';

export const useFlowDetection = (formData: FormData) => {
  const flowType = useMemo(() => determineFlowType(formData), [formData]);
  
  const stepIds = useMemo(() => getStepIdsForFlow(flowType), [flowType]);
  
  return {
    flowType,
    stepIds
  };
};