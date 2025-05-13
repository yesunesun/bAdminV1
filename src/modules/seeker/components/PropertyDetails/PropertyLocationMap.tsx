// src/modules/seeker/components/PropertyDetails/PropertyLocationMap.tsx
// Version: 17.0.0
// Last Modified: 14-05-2025 17:15 IST
// Purpose: Relocated map buttons below the map for better visibility

import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon, Navigation, MapPin } from 'lucide-react';

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
  // Get location string for display and URLs
  const getLocationString = () => {
    let locationString = "";
    if (address) locationString = address;
    if (!locationString && locality) locationString = locality;
    if (!locationString && city) locationString = city;
    if (!locationString) locationString = "Hyderabad, Telangana";
    
    return locationString;
  };
  
  // Extract coordinates for map URLs
  const getCoordinatesString = () => {
    if (coordinates) {
      const lat = coordinates.lat || coordinates.latitude;
      const lng = coordinates.lng || coordinates.longitude;
      
      if (lat && lng) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        
        if (!isNaN(numLat) && !isNaN(numLng)) {
          return `${numLat},${numLng}`;
        }
      }
    }
    
    return null;
  };
  
  // Get embed iframe URL
  const getMapSrc = () => {
    const coordsString = getCoordinatesString();
    
    // If we have valid coordinates, use them (most accurate)
    if (coordsString) {
      return `https://maps.google.com/maps?q=${coordsString}&z=15&output=embed`;
    }
    
    // Otherwise use the address or location
    return `https://maps.google.com/maps?q=${encodeURIComponent(getLocationString())}&output=embed`;
  };
  
  // Get URL for "Open in Google Maps" button
  const getViewMapUrl = () => {
    const coordsString = getCoordinatesString();
    
    // If we have valid coordinates, use them
    if (coordsString) {
      return `https://maps.google.com/maps?q=${coordsString}`;
    }
    
    // Otherwise use the address or location
    return `https://maps.google.com/maps?q=${encodeURIComponent(getLocationString())}`;
  };
  
  // Get URL for "Get Directions" button
  const getDirectionsUrl = () => {
    const coordsString = getCoordinatesString();
    
    // If we have valid coordinates, use them as destination
    if (coordsString) {
      return `https://maps.google.com/maps?daddr=${coordsString}&dirflg=d`;
    }
    
    // Otherwise use the address or location
    return `https://maps.google.com/maps?daddr=${encodeURIComponent(getLocationString())}&dirflg=d`;
  };
  
  // Display coordinates if available
  const coordsString = getCoordinatesString();
  const hasCoordinates = !!coordsString;
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Visual indicator that this is the updated component - remove in production */}
      <div className="self-start bg-green-500 text-white text-xs px-2 py-1 rounded-md mb-2">
        Map v17.0
      </div>
      
      {/* Map iframe container */}
      <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 mb-3">
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
      
      {/* Display coordinates if available */}
      {hasCoordinates && (
        <div className="text-xs text-slate-500 mb-2">
          {coordsString?.split(',')[0]} N {coordsString?.split(',')[1]} E
        </div>
      )}
      
      {/* Action buttons - now positioned below the map */}
      <div className="flex flex-wrap gap-2 justify-start mt-1">
        {/* View larger map button */}
        <Button
          variant="link"
          size="sm"
          onClick={() => window.open(getViewMapUrl(), '_blank')}
          className="h-8 px-0 text-primary flex items-center gap-1 hover:underline"
        >
          <span className="text-sm">View larger map</span>
        </Button>
        
        {/* Get Directions button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getDirectionsUrl(), '_blank')}
          className="h-8 bg-white border-primary text-primary hover:bg-primary/5 flex items-center gap-1"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span className="text-sm">Get Directions</span>
        </Button>
        
        {/* Open in Maps button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getViewMapUrl(), '_blank')}
          className="h-8 bg-white border-primary text-primary hover:bg-primary/5 flex items-center gap-1"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          <span className="text-sm">Open in Maps</span>
        </Button>
      </div>
    </div>
  );
};

export default PropertyLocationMap;