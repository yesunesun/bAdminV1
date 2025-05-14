// src/modules/seeker/components/MapPanel.tsx
// Version: 2.1.0
// Last Modified: 14-05-2025 12:50 IST
// Purpose: Improved error handling for Google Maps API configuration issues

import React, { useCallback, useState, useEffect } from 'react';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { GoogleMap, useLoadScript, InfoWindow, Marker } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Property } from '@/modules/owner/components/property/types';
import { useNavigate } from 'react-router-dom';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Map options
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

interface MapPanelProps {
  properties: Property[];
  isLoaded: boolean;
  loadError: Error | null;
  activeProperty: Property | null;
  setActiveProperty: (property: Property | null) => void;
  hoveredProperty: Property | null;
}

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  isLoaded,
  loadError,
  activeProperty,
  setActiveProperty,
  hoveredProperty,
}) => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<Record<string, google.maps.Marker>>({});
  
  // Get coordinates for a property
  const getPropertyCoordinates = useCallback((property: Property) => {
    // Check for coordinates in various places
    const coordinates = 
      property.property_details?.coordinates ||
      property.property_details?.mapCoordinates;
      
    if (coordinates && typeof coordinates === 'object' && 'lat' in coordinates && 'lng' in coordinates) {
      return {
        lat: Number(coordinates.lat),
        lng: Number(coordinates.lng)
      };
    }
    
    // Fallback to default center if no coordinates
    return DEFAULT_MAP_CENTER;
  }, []);

  // Navigate to property detail page
  const handlePropertyClick = useCallback((property: Property) => {
    navigate(`/properties/${property.id}`);
  }, [navigate]);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  // If there's a configuration error, show a more helpful message
  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card p-6 rounded-lg shadow border border-border text-center">
          <div className="text-destructive text-5xl mb-4">!</div>
          <h2 className="text-xl font-semibold mb-3">Map Loading Failed</h2>
          <p className="text-muted-foreground mb-4">
            {loadError.message || "We couldn't load the Google Maps component."}
          </p>
          <div className="bg-muted p-3 rounded text-left mb-4 text-xs">
            <strong>Possible solutions:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Check that VITE_GOOGLE_MAPS_API_KEY is set in your .env file</li>
              <li>Verify that your API key is valid and has Maps JavaScript API enabled</li>
              <li>Make sure the domain restrictions for your API key include this website</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button onClick={() => navigate('/home')}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center p-6">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading maps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={activeProperty ? getPropertyCoordinates(activeProperty) : DEFAULT_MAP_CENTER}
        zoom={activeProperty ? 15 : 12}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={getPropertyCoordinates(property)}
            onClick={() => setActiveProperty(property)}
            animation={
              hoveredProperty?.id === property.id || activeProperty?.id === property.id
                ? google.maps.Animation.BOUNCE
                : undefined
            }
            icon={{
              url: hoveredProperty?.id === property.id || activeProperty?.id === property.id
                ? '/map-marker-active.png'
                : '/map-marker.png',
              scaledSize: new google.maps.Size(32, 32),
            }}
          />
        ))}

        {activeProperty && (
          <InfoWindow
            position={getPropertyCoordinates(activeProperty)}
            onCloseClick={() => setActiveProperty(null)}
          >
            <div className="p-2">
              <h3 className="font-medium text-sm mb-1">{activeProperty.title || 'Property'}</h3>
              <p className="text-xs mb-2">
                {activeProperty.property_details?.price && (
                  <span className="font-semibold">₹{activeProperty.property_details.price}</span>
                )}
                {activeProperty.property_details?.location && (
                  <span className="ml-1 text-gray-600">· {activeProperty.property_details.location}</span>
                )}
              </p>
              <Button 
                size="sm" 
                className="text-xs h-7 w-full"
                onClick={() => handlePropertyClick(activeProperty)}
              >
                View Details
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapPanel;