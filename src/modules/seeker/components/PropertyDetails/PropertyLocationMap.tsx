// src/modules/seeker/components/PropertyDetails/PropertyLocationMap.tsx
// Version: 15.0.0
// Last Modified: 14-05-2025 14:45 IST
// Purpose: Emergency fix with visual indicator to confirm component loading

import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon } from 'lucide-react';

interface PropertyLocationMapProps {
  coordinates?: {
    lat?: number | string;
    lng?: number | string;
    latitude?: number | string;
    longitude?: number | string;
  } | null;
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
  // DEBUGGING: Log all incoming props
  console.log('PropertyLocationMap v15.0 Props:', { 
    coordinates, 
    address, 
    locality, 
    city 
  });
  
  // Use a simple, direct approach guaranteed to display a map
  const getMapSrc = () => {
    // If there are coordinates, try to use them
    if (coordinates) {
      const lat = coordinates.lat || coordinates.latitude;
      const lng = coordinates.lng || coordinates.longitude;
      
      if (lat && lng) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        
        if (!isNaN(numLat) && !isNaN(numLng)) {
          return `https://maps.google.com/maps?q=${numLat},${numLng}&z=15&output=embed`;
        }
      }
    }
    
    // If there's an address or locality, use that
    let locationString = "";
    if (address) locationString = address;
    if (!locationString && locality) locationString = locality;
    if (!locationString && city) locationString = city;
    
    // Always default to Hyderabad if nothing else is available
    if (!locationString) locationString = "Hyderabad, Telangana";
    
    return `https://maps.google.com/maps?q=${encodeURIComponent(locationString)}&output=embed`;
  };
  
  // Get external URL for "Open in Google Maps" button
  const getExternalUrl = () => {
    if (coordinates) {
      const lat = coordinates.lat || coordinates.latitude;
      const lng = coordinates.lng || coordinates.longitude;
      
      if (lat && lng) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        
        if (!isNaN(numLat) && !isNaN(numLng)) {
          return `https://maps.google.com/maps?q=${numLat},${numLng}`;
        }
      }
    }
    
    let locationString = "";
    if (address) locationString = address;
    if (!locationString && locality) locationString = locality;
    if (!locationString && city) locationString = city;
    if (!locationString) locationString = "Hyderabad, Telangana";
    
    return `https://maps.google.com/maps?q=${encodeURIComponent(locationString)}`;
  };
  
  return (
    <div className="w-full h-full relative">
      {/* Visual indicator that this is the updated component */}
      <div className="absolute top-0 left-0 z-10 bg-green-500 text-white text-xs px-2 py-1 rounded-br-md">
        Map v15.0
      </div>
      
      <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-200">
        <iframe
          src={getMapSrc()}
          title="Property Location"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full"
        ></iframe>
      </div>
      
      <div className="absolute bottom-4 right-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(getExternalUrl(), '_blank')}
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