// src/modules/seeker/components/PropertyDetails/hooks/usePropertyData.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 17:05 IST
// Purpose: Custom hook for processing and extracting property data

import { useMemo } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../../hooks/usePropertyDetails';
import { detectFlowType, getFlowTypeDisplayName, isSaleProperty, isFlowType } from '../services/flowDetectionService';

/**
 * Interface for processed property data
 */
export interface ProcessedPropertyData {
  // Flow information
  detectedFlowType: string;
  flowDisplayName: string;
  isCurrentSaleProperty: boolean;
  
  // Property type flags
  isLandSaleProperty: boolean;
  isPGHostelProperty: boolean;
  isFlatmatesProperty: boolean;
  isCoworkingProperty: boolean;
  
  // Core data
  propertyDetails: any;
  steps: any;
  meta: any;
  flow: any;
  
  // Extracted step data
  basicDetails: any;
  location: any;
  priceDetails: any;
  featuresDetails: any;
  
  // Processed values
  propertyId: string;
  ownerId: string;
  price: number;
  locationString: string;
  coordinates: { lat: number; lng: number } | null;
  
  // Step organization
  basicDetailsStepKey: string | undefined;
  locationStepKey: string | undefined;
  priceStepKey: string | undefined;
  featuresStepKey: string | undefined;
  landDetailsStepKey: string | undefined;
  remainingStepKeys: string[];
}

/**
 * Custom hook for processing property data
 * @param property - Raw property data from API
 * @returns Processed and structured property data
 */
export const usePropertyData = (property: PropertyDetailsType | null): ProcessedPropertyData | null => {
  return useMemo(() => {
    if (!property) return null;

    // Extract structured data from property_details
    const propertyDetails = property.property_details || {};

    // Detect the flow type dynamically using the service
    const detectedFlowType = detectFlowType(property);
    const flowDisplayName = getFlowTypeDisplayName(detectedFlowType);

    // Check property type flags using the service
    const isLandSaleProperty = isFlowType(detectedFlowType, 'land_sale');
    const isPGHostelProperty = isFlowType(detectedFlowType, 'residential_pghostel');
    const isFlatmatesProperty = isFlowType(detectedFlowType, 'residential_flatmates');
    const isCoworkingProperty = isFlowType(detectedFlowType, 'commercial_coworking');
    const isCurrentSaleProperty = isSaleProperty(detectedFlowType);

    // Get flow information (category and listing type)
    const flow = propertyDetails.flow || {
      category: detectedFlowType.split('_')[0] || 'residential',
      listingType: isCurrentSaleProperty ? 'sale' : 'rent',
      title: 'Property Listing'
    };

    // Get steps from property_details if available
    const steps = propertyDetails.steps || {};

    // Get meta information
    const meta = propertyDetails.meta || {
      id: property.id,
      owner_id: property.owner_id
    };

    // Extract key details for title and overview
    const propertyId = property.id || meta.id;
    const ownerId = property.owner_id || meta.owner_id;

    // Find step keys
    const basicDetailsStepKey = Object.keys(steps).find(key =>
      key.includes('basic_details')
    );

    const locationStepKey = Object.keys(steps).find(key =>
      key.includes('location')
    );

    const priceStepKey = Object.keys(steps).find(key =>
      isCurrentSaleProperty
        ? key.includes('sale_details')
        : key.includes('rental') || key.includes('rent') || key.includes('coworking_details')
    );

    const featuresStepKey = Object.keys(steps).find(key =>
      key.includes('features') || key.includes('amenities')
    );

    const landDetailsStepKey = Object.keys(steps).find(key =>
      key.includes('land_details') || key.includes('land_features')
    );

    // Extract step data
    const basicDetails = basicDetailsStepKey ? steps[basicDetailsStepKey] : null;
    const location = locationStepKey ? steps[locationStepKey] : null;
    const priceDetails = priceStepKey ? steps[priceStepKey] : null;
    const featuresDetails = featuresStepKey ? steps[featuresStepKey] : null;

    // Get price value
    const price = isCurrentSaleProperty
      ? priceDetails?.expectedPrice || property.price || 0
      : priceDetails?.rentAmount || priceDetails?.monthlyRent || property.price || 0;

    // Format location string for breadcrumb display
    const locationParts = location ? [
      location.area,
      location.city,
      location.state
    ].filter(Boolean) : [];

    const locationString = locationParts.length > 0
      ? locationParts.join(', ')
      : property.city
        ? [property.city, property.state].filter(Boolean).join(', ')
        : "Location not specified";

    // Get coordinates
    const coordinates = location
      ? { lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }
      : null;

    // Organize remaining steps by categories
    const remainingStepKeys = Object.keys(steps).filter(key =>
      key !== basicDetailsStepKey &&
      key !== locationStepKey &&
      key !== priceStepKey &&
      key !== featuresStepKey &&
      key !== landDetailsStepKey
    );

    return {
      // Flow information
      detectedFlowType,
      flowDisplayName,
      isCurrentSaleProperty,
      
      // Property type flags
      isLandSaleProperty,
      isPGHostelProperty,
      isFlatmatesProperty,
      isCoworkingProperty,
      
      // Core data
      propertyDetails,
      steps,
      meta,
      flow,
      
      // Extracted step data
      basicDetails,
      location,
      priceDetails,
      featuresDetails,
      
      // Processed values
      propertyId,
      ownerId,
      price,
      locationString,
      coordinates,
      
      // Step organization
      basicDetailsStepKey,
      locationStepKey,
      priceStepKey,
      featuresStepKey,
      landDetailsStepKey,
      remainingStepKeys
    };
  }, [property]);
};