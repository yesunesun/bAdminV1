// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/useSummarySections.ts
// Version: 1.0.0
// Last Modified: 19-02-2025 10:45 IST
// Purpose: Summary sections data preparation hook

import { useMemo } from 'react';
import { FormData } from '../../../types';
import { StepIds, SummaryItem } from '../types';
import { getFieldValue } from '../services/dataExtractor';
import { formatArea, formatCurrency, formatBoolean, formatDistance, formatDimensions } from '../services/dataFormatter';
import { FLOW_TYPES } from '../../../constants/flows';

export const useSummarySections = (
  formData: FormData,
  stepIds: StepIds,
  flowType: string,
  coordinates: string
) => {
  // Basic details items
  const basicDetailItems = useMemo<SummaryItem[]>(() => {
    const items: SummaryItem[] = [];
    const stepId = stepIds.basicDetails || '';
    
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const landType = getFieldValue(formData, stepId, 'landType');
      const length = getFieldValue(formData, stepId, 'plotLength');
      const width = getFieldValue(formData, stepId, 'plotWidth');
      const area = getFieldValue(formData, stepId, 'builtUpArea');
      const areaUnit = getFieldValue(formData, stepId, 'builtUpAreaUnit') || 'sq.ft.';
      const facing = getFieldValue(formData, stepId, 'plotFacing');
      
      items.push(
        { label: 'Land Type', value: landType },
        { label: 'Total Area', value: formatArea(area, areaUnit) },
        { label: 'Plot Facing', value: facing }
      );
      
      if (length && width) {
        items.push({ label: 'Plot Dimensions', value: formatDimensions(length, width) });
      }
    }
    
    return items;
  }, [formData, stepIds, flowType]);

  // Location items
  const locationItems = useMemo<SummaryItem[]>(() => {
    const stepId = stepIds.location || '';
    return [
      { label: 'Plot No.', value: getFieldValue(formData, stepId, 'flatPlotNo') },
      { label: 'Address', value: getFieldValue(formData, stepId, 'address') },
      { label: 'Landmark', value: getFieldValue(formData, stepId, 'landmark') },
      { label: 'Locality', value: getFieldValue(formData, stepId, 'locality') },
      { label: 'Area', value: getFieldValue(formData, stepId, 'area') },
      { label: 'City', value: getFieldValue(formData, stepId, 'city') },
      { label: 'PIN Code', value: getFieldValue(formData, stepId, 'pinCode') },
      { label: 'Coordinates', value: coordinates }
    ];
  }, [formData, stepIds, coordinates]);

  // Sale items
  const saleItems = useMemo<SummaryItem[]>(() => {
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const stepId = stepIds.basicDetails || ''; // Price is in basic details for land
      return [
        { 
          label: 'Expected Price', 
          value: formatCurrency(getFieldValue(formData, stepId, 'expectedPrice')) 
        },
        { 
          label: 'Development Status', 
          value: getFieldValue(formData, stepId, 'developmentStatus')
        },
        { 
          label: 'Approval Status', 
          value: getFieldValue(formData, stepId, 'approvalStatus')
        }
      ];
    }
    return [];
  }, [formData, stepIds, flowType]);

  // Land feature items
  const landFeatureItems = useMemo<SummaryItem[]>(() => {
    if (flowType === FLOW_TYPES.LAND_SALE) {
      const stepId = stepIds.landFeatures || '';
      return [
        { label: 'Corner Plot', value: formatBoolean(getFieldValue(formData, stepId, 'cornerPlot')) },
        { label: 'Park Facing', value: formatBoolean(getFieldValue(formData, stepId, 'parkFacing')) },
        { label: 'East Facing', value: formatBoolean(getFieldValue(formData, stepId, 'eastFacing')) },
        { label: 'Water Connection', value: formatBoolean(getFieldValue(formData, stepId, 'waterConnection')) },
        { label: 'Gated Community', value: formatBoolean(getFieldValue(formData, stepId, 'gatedCommunity')) },
        { label: 'Boundary Type', value: getFieldValue(formData, stepIds.basicDetails || '', 'boundaryType') },
        { label: 'Topography', value: getFieldValue(formData, stepIds.basicDetails || '', 'topographyType') },
        { label: 'Water Availability', value: getFieldValue(formData, stepIds.basicDetails || '', 'waterAvailability') },
        { label: 'Electricity Status', value: getFieldValue(formData, stepIds.basicDetails || '', 'electricityStatus') },
        { label: 'Road Connectivity', value: getFieldValue(formData, stepIds.basicDetails || '', 'roadConnectivity') },
        { label: 'Distance from City', value: formatDistance(getFieldValue(formData, stepId, 'distanceFromCity')) },
        { label: 'Distance from Highway', value: formatDistance(getFieldValue(formData, stepId, 'distanceFromHighway')) },
        { label: 'Nearby Facilities', value: getFieldValue(formData, stepId, 'nearbyFacilities') },
        { label: 'Land Documents', value: getFieldValue(formData, stepId, 'landDocuments') }
      ];
    }
    return [];
  }, [formData, stepIds, flowType]);

  return {
    basicDetailItems,
    locationItems,
    saleItems,
    landFeatureItems
  };
};