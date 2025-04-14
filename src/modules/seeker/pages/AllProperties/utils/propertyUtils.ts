// src/modules/seeker/pages/AllProperties/utils/propertyUtils.ts
// Version: 1.1.0
// Last Modified: 14-04-2025 16:00 IST
// Purpose: Improved property flow detection to fix UNKNOWN_UNKNOWN issue

import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';

/**
 * Determines the property flow type from property data
 * @param property The property object containing property_details
 * @returns The flow identifier string (e.g., "RESIDENTIAL_RENT")
 */
export function getPropertyFlow(property: PropertyType): string {
  if (!property || !property.property_details) return "UNKNOWN";
  
  const details = property.property_details;
  
  // Improved category detection
  let category = details.propertyCategory?.toUpperCase();
  if (!category) {
    // Try to derive category from propertyType
    const propType = details.propertyType?.toLowerCase();
    if (propType) {
      if (
        propType.includes('apartment') || 
        propType.includes('house') || 
        propType.includes('villa') || 
        propType.includes('flat') || 
        propType.includes('pg') || 
        propType.includes('hostel')
      ) {
        category = "RESIDENTIAL";
      } else if (
        propType.includes('office') || 
        propType.includes('shop') || 
        propType.includes('showroom') || 
        propType.includes('warehouse') || 
        propType.includes('coworking')
      ) {
        category = "COMMERCIAL";
      } else if (
        propType.includes('land') || 
        propType.includes('plot')
      ) {
        category = "LAND";
      }
    }
  }
  
  if (!category) {
    category = "RESIDENTIAL"; // Default to residential if we can't determine
  }
  
  // Improved listing type detection
  let listingType = details.listingType?.toUpperCase();
  if (!listingType) {
    // Check for properties that indicate sale vs. rent
    if (details.expectedPrice || details.isSaleProperty) {
      listingType = "SALE";
    } else if (details.rentAmount || details.rentalType) {
      listingType = "RENT";
    }
  }
  
  // Handle special cases
  if (listingType === "LEASE") listingType = "RENT";
  if (listingType === "SELL") listingType = "SALE";
  
  if (!listingType) {
    listingType = "RENT"; // Default to rent if we can't determine
  }
  
  // Handle PG/Hostel case
  if (details.propertyType?.toLowerCase()?.includes('pg') || 
      details.propertyType?.toLowerCase()?.includes('hostel')) {
    return "RESIDENTIAL_PGHOSTEL";
  }
  
  // Handle flatmates case
  if (listingType === "FLATMATES" || details.propertyType?.toLowerCase()?.includes('flatmate')) {
    return "RESIDENTIAL_FLATMATES";
  }
  
  // Handle coworking case
  if (listingType === "COWORKING" || details.propertyType?.toLowerCase()?.includes('coworking')) {
    return "COMMERCIAL_COWORKING";
  }
  
  // For debugging
  console.log(`Flow detection for property ${property.id}: Category=${category}, ListingType=${listingType}`);
  
  return `${category}_${listingType}`;
}

/**
 * Returns a more user-friendly label for the property flow
 * @param flowType The flow identifier string
 * @returns A formatted label for display
 */
export function getFlowLabel(flowType: string): string {
  // Handle unknown flow
  if (flowType.includes("UNKNOWN")) {
    return "Unknown Type";
  }
  
  const parts = flowType.split('_');
  if (parts.length !== 2) return flowType;
  
  return `${parts[0].charAt(0) + parts[0].slice(1).toLowerCase()} - ${parts[1].charAt(0) + parts[1].slice(1).toLowerCase()}`;
}