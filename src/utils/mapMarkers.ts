// src/utils/mapMarkers.ts
// Version: 3.0.0
// Last Modified: 08-01-2025 11:00 IST
// Purpose: Enhanced map markers with distinct colors for each property type and highlight state

import { FLOW_TYPES } from '@/modules/owner/components/property/wizard/constants/flows';

// Cache for marker icons to improve performance
export const markerIconCache = new Map<string, google.maps.Icon>();

/**
 * Property type color configuration
 */
export const PROPERTY_COLORS = {
  residential: {
    default: '#3B82F6', // Blue for residential
    highlight: '#EF4444' // Red for highlight
  },
  commercial: {
    default: '#10B981', // Green for commercial
    highlight: '#EF4444' // Red for highlight
  },
  land: {
    default: '#F59E0B', // Orange for land
    highlight: '#EF4444' // Red for highlight
  },
  // Fallback for unknown types
  unknown: {
    default: '#6B7280', // Gray for unknown
    highlight: '#EF4444' // Red for highlight
  }
} as const;

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
 * Detects property type from property data with enhanced color mapping
 */
export function detectPropertyType(property: any): PropertyTypeInfo {
  const details = property.property_details || {};
  const flowType = details.flow?.flowType || property.flow_type || FLOW_TYPES.RESIDENTIAL_RENT;
  
  // Determine property type based on flow type
  if (flowType.includes('land')) {
    return {
      type: 'land',
      subtype: 'sale',
      color: PROPERTY_COLORS.land.default,
      icon: 'land'
    };
  }
  
  if (flowType.includes('commercial')) {
    const subtype = flowType.includes('rent') ? 'rent' : 
                   flowType.includes('coworking') ? 'coworking' : 'sale';
    return {
      type: 'commercial',
      subtype,
      color: PROPERTY_COLORS.commercial.default,
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
    color: PROPERTY_COLORS.residential.default,
    icon: 'residential'
  };
}

/**
 * Gets the appropriate color for a property type and state
 */
export function getPropertyColor(propertyType: 'residential' | 'commercial' | 'land', isHighlighted: boolean = false): string {
  const colors = PROPERTY_COLORS[propertyType] || PROPERTY_COLORS.unknown;
  return isHighlighted ? colors.highlight : colors.default;
}

/**
 * Creates an SVG marker icon with specified color and optional inner icon
 */
function createMarkerSVG(color: string, size: number = 18, innerIcon?: string): string {
  const innerIconSVG = innerIcon ? getInnerIconSVG(innerIcon) : '';
  
  return `
    <svg width="${size}" height="${Math.round(size * 1.67)}" viewBox="0 0 24 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer marker shape with shadow -->
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 28 12 28s12-19 12-28c0-6.6-5.4-12-12-12z" 
            fill="${color}" 
            stroke="#ffffff" 
            stroke-width="2" 
            filter="url(#shadow)"/>
      <!-- Inner white circle -->
      <circle cx="12" cy="12" r="6" fill="#ffffff"/>
      <!-- Inner icon (optional) -->
      ${innerIconSVG}
    </svg>
  `;
}

/**
 * Gets inner icon SVG based on property type
 */
function getInnerIconSVG(iconType: string): string {
  const iconSize = 8;
  const iconX = 12 - iconSize / 2;
  const iconY = 12 - iconSize / 2;
  
  switch (iconType) {
    case 'residential':
      return `
        <g transform="translate(${iconX}, ${iconY})">
          <path d="M${iconSize/2} 1L1 ${iconSize/2}v${iconSize/2-1}h${iconSize-2}v-${iconSize/2-1}L${iconSize/2} 1z" 
                fill="#3B82F6" stroke="none"/>
          <rect x="${iconSize/2-1}" y="${iconSize/2+1}" width="2" height="2" fill="#3B82F6"/>
        </g>
      `;
    case 'commercial':
      return `
        <g transform="translate(${iconX}, ${iconY})">
          <rect x="1" y="2" width="${iconSize-2}" height="${iconSize-3}" fill="#10B981" stroke="none"/>
          <rect x="2" y="3" width="1" height="1" fill="#ffffff"/>
          <rect x="4" y="3" width="1" height="1" fill="#ffffff"/>
          <rect x="2" y="5" width="1" height="1" fill="#ffffff"/>
          <rect x="4" y="5" width="1" height="1" fill="#ffffff"/>
        </g>
      `;
    case 'land':
      return `
        <g transform="translate(${iconX}, ${iconY})">
          <path d="M1 ${iconSize-1}h${iconSize-2}L${iconSize-1} ${iconSize/2}L${iconSize/2+1} ${iconSize/2-2}L${iconSize/2-1} ${iconSize/2}L1 ${iconSize-1}z" 
                fill="#F59E0B" stroke="none"/>
        </g>
      `;
    default:
      return '';
  }
}

/**
 * Gets or creates cached marker icon for property with proper color coding
 */
export function getPropertyMarker(
  property: any, 
  isActive: boolean = false, 
  size: number = 20
): google.maps.Icon {
  const propertyInfo = detectPropertyType(property);
  const color = getPropertyColor(propertyInfo.type, isActive);
  const cacheKey = `${propertyInfo.type}-${isActive ? 'highlight' : 'default'}-${size}`;
  
  let cachedIcon = markerIconCache.get(cacheKey);
  
  if (!cachedIcon) {
    // Create SVG marker with property type color and optional inner icon
    const markerSVG = createMarkerSVG(color, size, propertyInfo.icon);
    
    cachedIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSVG)}`,
      size: new google.maps.Size(size, Math.round(size * 1.67)),
      anchor: new google.maps.Point(size / 2, Math.round(size * 1.67)),
      scaledSize: new google.maps.Size(size, Math.round(size * 1.67))
    };
    
    markerIconCache.set(cacheKey, cachedIcon);
  }
  
  return cachedIcon;
}

/**
 * Gets a simple colored marker without inner icons (for better performance)
 */
export function getSimplePropertyMarker(
  propertyType: 'residential' | 'commercial' | 'land',
  isActive: boolean = false,
  size: number = 18
): google.maps.Icon {
  const color = getPropertyColor(propertyType, isActive);
  const cacheKey = `simple-${propertyType}-${isActive ? 'highlight' : 'default'}-${size}`;
  
  let cachedIcon = markerIconCache.get(cacheKey);
  
  if (!cachedIcon) {
    // Create simple SVG marker without inner icons
    const markerSVG = createMarkerSVG(color, size);
    
    cachedIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markerSVG)}`,
      size: new google.maps.Size(size, Math.round(size * 1.67)),
      anchor: new google.maps.Point(size / 2, Math.round(size * 1.67)),
      scaledSize: new google.maps.Size(size, Math.round(size * 1.67))
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

/**
 * Preloads all marker variations for better performance
 */
export function preloadMarkers(): void {
  const propertyTypes: Array<'residential' | 'commercial' | 'land'> = ['residential', 'commercial', 'land'];
  const states = [false, true]; // default and highlighted
  const sizes = [18, 20];
  
  propertyTypes.forEach(type => {
    states.forEach(isActive => {
      sizes.forEach(size => {
        // Preload both detailed and simple markers
        getSimplePropertyMarker(type, isActive, size);
      });
    });
  });
  
  console.log(`🎨 Preloaded ${markerIconCache.size} marker variations`);
}

/**
 * Gets marker legend data for UI display
 */
export function getMarkerLegend() {
  return [
    {
      type: 'residential',
      label: 'Residential',
      color: PROPERTY_COLORS.residential.default,
      description: 'Houses, apartments, PG, flatmates'
    },
    {
      type: 'commercial',
      label: 'Commercial', 
      color: PROPERTY_COLORS.commercial.default,
      description: 'Offices, shops, coworking spaces'
    },
    {
      type: 'land',
      label: 'Land',
      color: PROPERTY_COLORS.land.default,
      description: 'Plots, agricultural land'
    }
  ];
}

export default {
  detectPropertyType,
  getPropertyMarker,
  getSimplePropertyMarker,
  getPropertyColor,
  clearMarkerCache,
  preloadMarkers,
  getMarkerLegend,
  markerIconCache,
  PROPERTY_COLORS
};