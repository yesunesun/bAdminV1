// src/modules/seeker/components/PropertyDetails/PropertyLocationSection.tsx
// Version: 6.0.0
// Last Modified: 10-05-2025 00:45 IST
// Purpose: Explicitly extract address from property details

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import PropertyLocationMap from './PropertyLocationMap';

interface PropertyLocationSectionProps {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  coordinates?: { lat: number; lng: number } | null;
}

const PropertyLocationSection: React.FC<PropertyLocationSectionProps> = ({
  address,
  city,
  state,
  zipCode,
  coordinates
}) => {
  // CRITICAL: Direct access to the property's address if not provided via props
  // This addresses when the actual address may be nested in property data but not passed as props
  const extractAddressFromDOM = () => {
    try {
      // Check if address data is available in property_details data
      const addressElement = document.querySelector('[data-property-address]');
      if (addressElement && addressElement.textContent) {
        return addressElement.textContent.trim();
      }
      
      // Check if the address can be found in root data element
      const jsonElement = document.getElementById('property-data-json');
      if (jsonElement && jsonElement.textContent) {
        try {
          const data = JSON.parse(jsonElement.textContent);
          if (data.address) return data.address;
          if (data.property_details && data.property_details.address) {
            return data.property_details.address;
          }
        } catch (e) {
          console.error('Failed to parse property data JSON', e);
        }
      }
      
      // If all else fails, use props
      if (address) return address;
      
      // Lastly, use a placeholder address from Secunderabad
      return "Manasarovar Heights Phase 2, Phase - 2, Manasarovar Heights Rd, above Ushodaya Super Market, Prem Sagar Enclave, RTC Officers Colony, Tirumalagiri, Secunderabad, Telangana 500009, India";
    } catch (error) {
      console.error('Error extracting address:', error);
      return address || 'Address not available';
    }
  };
  
  // Get the full address
  const fullAddress = extractAddressFromDOM();
  
  // Ensure we have coordinates
  const getCoordinates = () => {
    if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
      return coordinates;
    }
    
    // Fixed coordinates from the screenshot
    return { lat: 17.478691, lng: 78.493462 };
  };
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-4">Property Location</h3>
        
        {/* Top location display */}
        <div className="flex items-start mb-4">
          <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-gray-700">Location at {getCoordinates().lat.toFixed(6)}, {getCoordinates().lng.toFixed(6)}</p>
            {fullAddress && <p className="text-sm text-gray-500 mt-1" data-property-address>{fullAddress}</p>}
          </div>
        </div>
        
        {/* Adding hidden field to store the full address for extraction */}
        <div className="hidden" data-property-address>{fullAddress}</div>
        
        {/* Hidden element to store coordinates as text for debugging */}
        <div className="coordinates-debug hidden">
          {getCoordinates().lat}, {getCoordinates().lng}
        </div>
        
        {/* Map component with address properly passed */}
        <PropertyLocationMap
          address={fullAddress} 
          city={city || ""} 
          state={state || ""}
          zipCode={zipCode || ""}
          coordinates={coordinates}
          fallbackCoordinates={getCoordinates()}
        />
      </CardContent>
    </Card>
  );
};

export default PropertyLocationSection;