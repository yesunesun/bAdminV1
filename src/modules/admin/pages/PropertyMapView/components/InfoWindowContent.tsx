// src/modules/admin/pages/PropertyMapView/components/InfoWindowContent.tsx
// Version: 1.0.0
// Last Modified: 01-03-2025 11:45 IST
// Purpose: Component for rendering property info window content

import { PropertyWithImages } from '../services/propertyMapService';

interface InfoWindowContentProps {
  property: PropertyWithImages;
}

export const createInfoWindowContent = (property: PropertyWithImages): string => {
  return `
    <div style="width: 250px; padding: 10px;">
      <h3 style="margin: 0 0 8px 0; font-size: 16px;">${property.title}</h3>
      <p style="margin: 0 0 5px 0; color: #16a34a; font-weight: 500;">₹ ${property.price}</p>
      <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">${property.address || ''}</p>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
        <span style="font-size: 12px; color: #666;">${property.property_details?.bhkType || ''} • ${property.property_details?.builtUpArea || ''} sq.ft</span>
        <button 
          id="viewDetailsBtn" 
          style="background: #4f46e5; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 12px; cursor: pointer;"
          data-property-id="${property.id}"
        >
          View Details
        </button>
      </div>
    </div>
  `;
};