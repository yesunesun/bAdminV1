// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/usePropertyData.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:45 IST
// Purpose: Property data extraction and formatting hook

import { useMemo } from 'react';
import { FormData } from '../../../types';
import { StepIds } from '../types';
import { getFieldValue } from '../services/dataExtractor';
import { capitalize } from '../services/dataFormatter';

export const usePropertyData = (formData: FormData, stepIds: StepIds) => {
  // Calculate derived values
  const derivedValues = useMemo(() => {
    const flow = formData.flow || {};
    const category = flow.category || 'land';
    const listingType = flow.listingType || 'sale';
    const flowInfo = `${capitalize(category)} ${capitalize(listingType)}`;
    
    // Get coordinates
    const lat = getFieldValue(formData, stepIds.location || '', 'latitude');
    const lng = getFieldValue(formData, stepIds.location || '', 'longitude');
    
    const coordinates = lat && lng ? `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}` : '-';
    
    // Get full address
    const address = getFieldValue(formData, stepIds.location || '', 'address');
    const fullAddress = address || '-';
    
    return { flowInfo, coordinates, fullAddress };
  }, [formData, stepIds]);

  // Get description
  const description = useMemo(() => {
    let desc = '';
    
    // Check for description in basic details first
    desc = getFieldValue(formData, stepIds.basicDetails || '', 'additionalDetails') ||
           getFieldValue(formData, stepIds.landFeatures || '', 'nearbyLandmarks') ||
           '';
    
    return desc;
  }, [formData, stepIds]);

  return {
    ...derivedValues,
    description
  };
};