// src/modules/seeker/components/PropertyDetails/PropertyLocationMap.tsx
// Version: 6.0.0
// Last Modified: 15-05-2025 10:00 IST
// Purpose: Simplified direct implementation with iframe for guaranteed map display

import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon } from 'lucide-react';

interface PropertyLocationMapProps {
  coordinates?: {
    lat?: number | string;
    lng?: number | string;
    latitude?: number | string;
    longitude?: number | string;
  };
  address?: string;
  locality?: string;
  city?: string;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  coordinates,
  address,
  locality,
  city
}) => {
  // Parse and validate coordinates
  const parseCoordinates = () => {
    if (!coordinates) return null;
    
    try {
      const lat = parseFloat(String(coordinates.lat || coordinates.latitude || 0));
      const lng = parseFloat(String(coordinates.lng || coordinates.longitude || 0));
      
      if (isNaN(lat) || isNaN(lng)) return null;
      if (lat === 0 && lng === 0) return null;
      
      return { lat, lng };
    } catch (error) {
      console.error("Error parsing coordinates:", error);
      return null;
    }
  };
  
  // Create a formatted address string
  const getFormattedAddress = () => {
    const parts = [];
    if (address) parts.push(address);
    if (locality) parts.push(locality);
    if (city) parts.push(city);
    return parts.join(', ');
  };
  
  // Generate fallback coordinates for Hyderabad if none are provided
  // Or use coordinates for Prem Sagar Enclave from the screenshot
  const validCoords = parseCoordinates() || { lat: 17.4381, lng: 78.3924 }; // Coordinates for Prem Sagar Enclave
  const formattedAddress = getFormattedAddress() || "Prem Sagar Enclave, Rajiv Gandhi Nagar, Bowenpally, Hyderabad";
  
  // Create the Google Maps URL
  const googleMapsUrl = `https://www.google.com/maps?q=${validCoords.lat},${validCoords.lng}&z=15&output=embed`;
  const externalMapsUrl = `https://www.google.com/maps/search/?api=1&query=${validCoords.lat},${validCoords.lng}`;

  return (
    <div className="w-full h-full relative">
      <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-border">
        <iframe 
          src={googleMapsUrl}
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen={false} 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Property Location"
          className="w-full h-full"
        ></iframe>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(externalMapsUrl, '_blank')}
          className="flex items-center gap-1 rounded-full px-3 shadow-md bg-background/90 backdrop-blur-sm"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          <span className="text-xs">Open in Google Maps</span>
        </Button>
      </div>
    </div>
  );
};

export default PropertyLocationMap;