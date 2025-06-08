// src/modules/owner/components/property/wizard/sections/PropertySummary/hooks/usePropertyData.ts
// Version: 1.1.0
// Last Modified: 14-05-2025 10:40 IST
// Purpose: Enhanced property data extraction and formatting hook with support for transformed JSON

import { useMemo } from 'react';
import { FormData } from '../../../types';
import { StepIds } from '../types';
import { getFieldValue } from '../services/dataExtractor';
import { capitalize } from '../services/dataFormatter';

export const usePropertyData = (formData: FormData, stepIds: StepIds) => {
  // Calculate derived values
  const derivedValues = useMemo(() => {
    // Try to get flow info from the transformed data first
    const flow = formData.flow || {};
    const category = flow.category || 'land';
    const listingType = flow.listingType || 'sale';
    const flowInfo = `${capitalize(category)} ${capitalize(listingType)}`;
    
    // Get coordinates - try from transformed data first, then from steps
    let lat, lng;
    
    // Check if coordinates are in the top-level property_details in transformed data
    if (formData.property_details?.coordinates?.lat && formData.property_details?.coordinates?.lng) {
      lat = formData.property_details.coordinates.lat;
      lng = formData.property_details.coordinates.lng;
    } 
    // Check if coordinates are in mapCoordinates (another common format)
    else if (formData.property_details?.mapCoordinates?.lat && formData.property_details?.mapCoordinates?.lng) {
      lat = formData.property_details.mapCoordinates.lat;
      lng = formData.property_details.mapCoordinates.lng;
    }
    // Fallback to step-based location data
    else {
      lat = getFieldValue(formData, stepIds.location || '', 'latitude');
      lng = getFieldValue(formData, stepIds.location || '', 'longitude');
    }
    
    const coordinates = lat && lng ? `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}` : '-';
    
    // Get full address - try from transformed data first, then from steps
    let fullAddress;
    
    // Check if address is in the top-level property_details in transformed data
    if (formData.property_details?.address) {
      fullAddress = formData.property_details.address;
    } 
    // Check if coordinates are in location (another common format)
    else if (formData.property_details?.location?.address) {
      fullAddress = formData.property_details.location.address;
    }
    // Fallback to step-based location data
    else {
      fullAddress = getFieldValue(formData, stepIds.location || '', 'address') || '-';
    }
    
    return { flowInfo, coordinates, fullAddress };
  }, [formData, stepIds]);

  // Get description - try from transformed data first, then from steps
  const description = useMemo(() => {
    let desc = '';
    
    // Check for description in transformed data first
    if (formData.property_details?.description) {
      desc = formData.property_details.description;
    }
    // Check for other possible description keys in transformed data
    else if (formData.property_details?.additionalDetails) {
      desc = formData.property_details.additionalDetails;
    }
    // Fallback to steps-based description
    else {
      desc = getFieldValue(formData, stepIds.basicDetails || '', 'additionalDetails') ||
             getFieldValue(formData, stepIds.landFeatures || '', 'nearbyLandmarks') ||
             '';
    }
    
    return desc;
  }, [formData, stepIds]);

  return {
    ...derivedValues,
    description
  };
};