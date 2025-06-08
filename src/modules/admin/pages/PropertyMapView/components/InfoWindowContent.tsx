// src/modules/admin/pages/PropertyMapView/components/InfoWindowContent.tsx
// Version: 1.1.0
// Last Modified: 01-03-2025 18:15 IST
// Purpose: Enhanced info window with property details and styling

import { PropertyWithImages } from '../services/propertyMapService';

// Format price to Indian Rupees (₹)
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

// Get primary image URL or placeholder
const getPrimaryImageUrl = (property: PropertyWithImages): string => {
  const primaryImage = property.images?.find(img => img.type === 'primary');
  return primaryImage?.url || '/api/placeholder/400/320';
};

// Get property type label
const getPropertyTypeLabel = (property: PropertyWithImages): string => {
  const propertyType = property.property_details?.propertyType?.toLowerCase() || '';
  
  if (propertyType.includes('apartment')) {
    return 'Apartment';
  } else if (propertyType.includes('residential') || propertyType.includes('house')) {
    return 'Residential';
  } else if (propertyType.includes('office')) {
    return 'Office';
  } else if (propertyType.includes('shop') || propertyType.includes('retail')) {
    return 'Retail/Shop';
  } else if (propertyType.includes('commercial')) {
    return 'Commercial';
  } else if (propertyType.includes('land') || propertyType.includes('plot')) {
    return 'Land/Plot';
  }
  
  return 'Property';
};

// Create info window content with property details
export const createInfoWindowContent = (property: PropertyWithImages): string => {
  const propertyType = getPropertyTypeLabel(property);
  const imageUrl = getPrimaryImageUrl(property);
  const price = formatPrice(property.price);
  
  // Get property details
  const bedrooms = property.property_details?.bedrooms || 'N/A';
  const bathrooms = property.property_details?.bathrooms || 'N/A';
  const area = property.property_details?.builtUpArea 
    ? `${property.property_details.builtUpArea} sq.ft.`
    : 'N/A';
  
  const address = [
    property.address,
    property.city,
    property.state,
    property.zip_code
  ].filter(Boolean).join(', ');
  
  return `
    <div style="width: 300px; font-family: Arial, sans-serif;">
      <div style="position: relative; width: 100%; height: 150px; background-color: #f3f4f6; overflow: hidden; border-radius: 4px 4px 0 0;">
        <img src="${imageUrl}" alt="${property.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; top: 8px; right: 8px; background-color: rgba(0, 0, 0, 0.6); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
          ${propertyType}
        </div>
      </div>
      
      <div style="padding: 12px;">
        <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
          ${property.title}
        </h3>
        
        <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
          ${address}
        </p>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
          <div style="font-size: 18px; font-weight: 600; color: #1f2937;">
            ${price}
          </div>
          
          <div style="display: flex; gap: 8px; font-size: 12px; color: #6b7280;">
            <div>${bedrooms} Beds</div>
            <div>•</div>
            <div>${bathrooms} Baths</div>
            <div>•</div>
            <div>${area}</div>
          </div>
        </div>
        
        <button id="viewDetailsBtn" style="width: 100%; padding: 8px 0; background-color: #3b82f6; color: white; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background-color 0.2s;">
          View Details
        </button>
      </div>
    </div>
  `;
};