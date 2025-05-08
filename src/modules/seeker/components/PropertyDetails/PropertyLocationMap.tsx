// src/modules/seeker/components/PropertyDetails/PropertyLocationMap.tsx
// Version: 3.0.0
// Last Modified: 08-05-2025 22:30 IST
// Purpose: Ultra simplified map display with no extra features

import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon } from 'lucide-react';

interface PropertyLocationMapProps {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number } | null;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  address,
  city,
  state,
  zipCode,
  coordinates
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Format the full address for display below the map
  const addressDisplay = address || 'Address not available';
  const locationDisplay = [city, state, zipCode].filter(Boolean).join(', ') || '';

  // Initialize the map after the component mounts
  useEffect(() => {
    // Only proceed if we have a valid container and the Google Maps API is loaded
    if (!mapContainerRef.current || !window.google || !window.google.maps) {
      return;
    }

    // Use provided coordinates or default to Hyderabad
    const position = coordinates && 
      typeof coordinates.lat === 'number' && 
      typeof coordinates.lng === 'number'
        ? { lat: coordinates.lat, lng: coordinates.lng }
        : { lat: 17.4065, lng: 78.4772 };

    console.log('Using coordinates for map:', position);

    try {
      // Set container dimensions
      const container = mapContainerRef.current;
      container.style.height = '400px';
      container.style.width = '100%';

      // Create the map
      const map = new window.google.maps.Map(container, {
        center: position,
        zoom: 15,
        mapTypeControl: true,
      });

      // Add a marker at the property location
      new window.google.maps.Marker({
        position: position,
        map: map,
        animation: window.google.maps.Animation.DROP
      });
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [coordinates]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Property Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Map container */}
        <div 
          ref={mapContainerRef} 
          className="w-full h-96 rounded-md border border-border overflow-hidden"
        ></div>
        
        {/* Display address below map */}
        <div className="mt-4 p-3 bg-muted/10 border border-border rounded">
          <p className="font-medium">{addressDisplay}</p>
          {locationDisplay && <p className="text-muted-foreground">{locationDisplay}</p>}
        </div>
        
        {/* Debug info for development only */}
        {import.meta.env.DEV && coordinates && (
          <div className="mt-2 p-2 bg-muted/20 text-xs rounded">
            <p>Coordinates: {coordinates.lat}, {coordinates.lng}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyLocationMap;