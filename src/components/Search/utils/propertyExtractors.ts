// src/components/Search/utils/propertyExtractors.ts
// Purpose: Extract property details from property_details JSON for search results

/**
 * Extract furnishing status from property details
 */
export const extractFurnishingStatus = (propertyDetails: Record<string, unknown>): string | undefined => {
  if (!propertyDetails) return undefined;
  
  // Check various possible locations for furnishing status
  const paths = [
    // v3 structure (current)
    (propertyDetails as any)?.details?.rentalInfo?.furnishingStatus,
    (propertyDetails as any)?.details?.saleInfo?.furnishingStatus,
    (propertyDetails as any)?.details?.basicDetails?.furnishingStatus,
    // Legacy structures
    (propertyDetails as any)?.steps?.res_rent_basic_details?.furnishingStatus,
    (propertyDetails as any)?.steps?.res_sale_basic_details?.furnishingStatus,
    (propertyDetails as any)?.steps?.res_flat_basic_details?.furnishingStatus,
    (propertyDetails as any)?.basicDetails?.furnishingStatus,
    (propertyDetails as any)?.details?.res_rent_basic_details?.furnishingStatus,
    (propertyDetails as any)?.details?.res_sale_basic_details?.furnishingStatus,
    (propertyDetails as any)?.details?.res_flat_basic_details?.furnishingStatus,
    // Flow-specific rental details
    (propertyDetails as any)?.rentalInfo?.furnishingStatus,
    (propertyDetails as any)?.saleInfo?.furnishingStatus
  ];
  
  return paths.find(value => value !== undefined && value !== null && value !== '');
};

/**
 * Extract preferred tenants from property details
 */
export const extractPreferredTenants = (propertyDetails: Record<string, unknown>): string | undefined => {
  if (!propertyDetails) return undefined;
  
  // Check various possible locations for preferred tenants
  const paths = [
    // v3 structure (current) - preferredTenants is an array in v3
    (propertyDetails as any)?.details?.rentalInfo?.preferredTenants,
    (propertyDetails as any)?.details?.saleInfo?.preferredTenants,
    // Legacy structures
    (propertyDetails as any)?.steps?.res_rent_rental?.preferredTenants,
    (propertyDetails as any)?.steps?.res_rent_preferences?.preferredTenants,
    (propertyDetails as any)?.rentalInfo?.preferredTenants,
    (propertyDetails as any)?.details?.res_rent_rental?.preferredTenants,
    (propertyDetails as any)?.details?.res_rent_preferences?.preferredTenants,
    // For PG/Hostels, check gender preference
    (propertyDetails as any)?.steps?.res_pg_basic_details?.genderPreference,
    (propertyDetails as any)?.pgInfo?.genderPreference,
    (propertyDetails as any)?.details?.res_pg_basic_details?.genderPreference,
    // For flatmates, check preferred gender
    (propertyDetails as any)?.steps?.res_flat_preferences?.preferredGender,
    (propertyDetails as any)?.flatmateInfo?.preferredGender,
    (propertyDetails as any)?.details?.res_flat_preferences?.preferredGender
  ];
  
  const rawValue = paths.find(value => value !== undefined && value !== null);
  
  // Handle array format (v3 structure)
  if (Array.isArray(rawValue) && rawValue.length > 0) {
    return rawValue[0]; // Return the first preferred tenant type
  }
  
  // Handle string format (legacy)
  if (typeof rawValue === 'string' && rawValue.trim() !== '') {
    return rawValue;
  }
  
  return undefined;
};

/**
 * Extract parking availability from property details
 */
export const extractParking = (propertyDetails: Record<string, unknown>): boolean | undefined => {
  if (!propertyDetails) return undefined;
  
  // Check various possible locations for parking
  const paths = [
    // v3 structure (current) - parking is under features
    (propertyDetails as any)?.details?.features?.parking,
    (propertyDetails as any)?.details?.basicDetails?.parking,
    // Legacy structures
    (propertyDetails as any)?.steps?.res_rent_basic_details?.parking,
    (propertyDetails as any)?.steps?.res_sale_basic_details?.parking,
    (propertyDetails as any)?.steps?.res_flat_basic_details?.parking,
    (propertyDetails as any)?.basicDetails?.parking,
    (propertyDetails as any)?.basicDetails?.parkingAvailable,
    (propertyDetails as any)?.details?.res_rent_basic_details?.parking,
    (propertyDetails as any)?.details?.res_sale_basic_details?.parking,
    (propertyDetails as any)?.details?.res_flat_basic_details?.parking,
    (propertyDetails as any)?.steps?.res_rent_basic_details?.parkingAvailable,
    (propertyDetails as any)?.steps?.res_sale_basic_details?.parkingAvailable,
    // Features object
    (propertyDetails as any)?.features?.parking
  ];
  
  const parkingValue = paths.find(value => value !== undefined && value !== null);
  
  // Convert various formats to boolean
  if (typeof parkingValue === 'boolean') return parkingValue;
  if (typeof parkingValue === 'string') {
    const lower = parkingValue.toLowerCase();
    return lower === 'true' || lower === 'yes' || lower === 'available' || lower === 'covered' || lower === 'open';
  }
  if (typeof parkingValue === 'number') return parkingValue > 0;
  
  return undefined;
};

/**
 * Extract internet/wifi availability from property details
 */
export const extractInternet = (propertyDetails: Record<string, unknown>): boolean | undefined => {
  if (!propertyDetails) return undefined;
  
  // Check amenities first (v3 structure)
  const amenities = (propertyDetails as any)?.details?.features?.amenities;
  if (Array.isArray(amenities)) {
    const hasWifi = amenities.some((amenity: string) => 
      amenity && typeof amenity === 'string' && 
      (amenity.toLowerCase().includes('wifi') || 
       amenity.toLowerCase().includes('internet') ||
       amenity.toLowerCase().includes('broadband'))
    );
    if (hasWifi) return true;
  }
  
  // Check various possible locations for internet/wifi
  const paths = [
    // v3 structure
    (propertyDetails as any)?.details?.features?.internet,
    (propertyDetails as any)?.details?.features?.wifi,
    (propertyDetails as any)?.details?.basicDetails?.internet,
    (propertyDetails as any)?.details?.basicDetails?.wifi,
    // Legacy structures
    (propertyDetails as any)?.steps?.res_rent_basic_details?.internet,
    (propertyDetails as any)?.steps?.res_sale_basic_details?.internet,
    (propertyDetails as any)?.steps?.res_flat_basic_details?.internet,
    (propertyDetails as any)?.basicDetails?.internet,
    (propertyDetails as any)?.basicDetails?.wifi,
    (propertyDetails as any)?.details?.res_rent_basic_details?.internet,
    (propertyDetails as any)?.details?.res_sale_basic_details?.internet,
    (propertyDetails as any)?.details?.res_flat_basic_details?.internet,
    (propertyDetails as any)?.steps?.res_rent_basic_details?.wifi,
    (propertyDetails as any)?.steps?.res_sale_basic_details?.wifi,
    // Legacy amenities arrays
    (propertyDetails as any)?.amenities?.includes?.('wifi'),
    (propertyDetails as any)?.amenities?.includes?.('internet'),
    (propertyDetails as any)?.steps?.res_rent_amenities?.amenities?.includes?.('wifi'),
    (propertyDetails as any)?.steps?.res_rent_amenities?.amenities?.includes?.('internet')
  ];
  
  const internetValue = paths.find(value => value !== undefined && value !== null);
  
  // Convert various formats to boolean
  if (typeof internetValue === 'boolean') return internetValue;
  if (typeof internetValue === 'string') {
    const lower = internetValue.toLowerCase();
    return lower === 'true' || lower === 'yes' || lower === 'available';
  }
  if (typeof internetValue === 'number') return internetValue > 0;
  
  return undefined;
};