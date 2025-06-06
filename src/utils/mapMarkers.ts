// src/utils/mapMarkers.ts
// Version: 2.0.0
// Last Modified: 07-06-2025 15:45 IST
// Purpose: Standard map markers with two-color system (default dark and highlight)

import { FLOW_TYPES } from '@/modules/owner/components/property/wizard/constants/flows';

// Cache for marker icons to improve performance
export const markerIconCache = new Map<string, google.maps.Icon>();

/**
 * Property type information interface
 */
interface PropertyTypeInfo {
  type: 'residential' | 'commercial' | 'land';
  subtype: string;
  color: string;
  icon: string;
}

/**
 * Detects property type from property data
 */
export function detectPropertyType(property: any): PropertyTypeInfo {
  const details = property.property_details || {};
  const flowType = details.flow?.flowType || property.flow_type || FLOW_TYPES.RESIDENTIAL_RENT;
  
  // Determine property type based on flow type
  if (flowType.includes('land')) {
    return {
      type: 'land',
      subtype: 'sale',
      color: '#dc2626', // Default dark red
      icon: 'land'
    };
  }
  
  if (flowType.includes('commercial')) {
    const subtype = flowType.includes('rent') ? 'rent' : 
                   flowType.includes('coworking') ? 'coworking' : 'sale';
    return {
      type: 'commercial',
      subtype,
      color: '#dc2626', // Default dark red
      icon: 'commercial'
    };
  }
  
  // Default to residential
  const subtype = flowType.includes('rent') ? 'rent' :
                 flowType.includes('flatmates') ? 'flatmates' :
                 flowType.includes('pghostel') ? 'pghostel' : 'sale';
  
  return {
    type: 'residential',
    subtype,
    color: '#dc2626', // Default dark red
    icon: 'residential'
  };
}

/**
 * Gets or creates cached marker icon for property
 */
export function getPropertyMarker(
  property: any, 
  isActive: boolean = false, 
  size: number = 32
): google.maps.Icon {
  const cacheKey = `standard-${isActive ? 'highlight' : 'default'}`;
  
  let cachedIcon = markerIconCache.get(cacheKey);
  
  if (!cachedIcon) {
    // Use standard Google Maps marker with color customization
    const markerColor = isActive ? '#ff6b35' : '#dc2626'; // Highlight orange vs Default dark red
    
    // Create standard marker icon
    cachedIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
        <svg width="24" height="40" viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 28 12 28s12-19 12-28c0-6.6-5.4-12-12-12z" fill="${markerColor}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="12" cy="12" r="6" fill="#ffffff"/>
        </svg>
      `)}`,
      size: new google.maps.Size(24, 40),
      anchor: new google.maps.Point(12, 40),
      scaledSize: new google.maps.Size(24, 40)
    };
    
    markerIconCache.set(cacheKey, cachedIcon);
  }
  
  return cachedIcon;
}

/**
 * Clears the marker icon cache
 */
export function clearMarkerCache(): void {
  markerIconCache.clear();
}

export default {
  detectPropertyType,
  getPropertyMarker,
  clearMarkerCache,
  markerIconCache
};