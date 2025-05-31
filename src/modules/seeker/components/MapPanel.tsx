// src/modules/seeker/components/MapPanel.tsx
// Version: 2.7.0
// Last Modified: 20-05-2025 01:15 IST
// Purpose: Simplified marker implementation to ensure reliable display

import React, { useCallback, useState, useEffect } from 'react';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
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
  hoveredPropertyId: string | null;
}

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  isLoaded,
  loadError,
  activeProperty,
  setActiveProperty,
  hoveredPropertyId,
}) => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [displayedMarkers, setDisplayedMarkers] = useState<string[]>([]);
  
  // Extract coordinates from property
  const extractCoordinates = (property: Property) => {
    try {
      // Check property_details.coordinates
      if (property.property_details?.coordinates) {
        const coords = property.property_details.coordinates;
        if (typeof coords === 'object' && coords !== null) {
          if ('lat' in coords && 'lng' in coords) {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              return { lat, lng };
            }
          }
        }
      }
      
      // Check property_details.mapCoordinates
      if (property.property_details?.mapCoordinates) {
        const coords = property.property_details.mapCoordinates;
        if (typeof coords === 'object' && coords !== null) {
          if ('lat' in coords && 'lng' in coords) {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
              return { lat, lng };
            }
          }
        }
      }
      
      // Generate random coordinates (for testing only)
      if (process.env.NODE_ENV === 'development') {
        // Generate a consistent random coordinate based on property ID
        // This makes the coordinates consistent across renders
        const hash = property.id.split('').reduce((acc, char) => {
          return acc + char.charCodeAt(0);
        }, 0);
        
        const latOffset = (hash % 100) / 1000;
        const lngOffset = ((hash * 2) % 100) / 1000;
        
        return {
          lat: DEFAULT_MAP_CENTER.lat + latOffset,
          lng: DEFAULT_MAP_CENTER.lng + lngOffset
        };
      }
    } catch (error) {
      console.error(`Error extracting coordinates for property ${property.id}:`, error);
    }
    
    // Fallback to default center
    return DEFAULT_MAP_CENTER;
  };

  // Navigate to property detail page
  const handlePropertyClick = useCallback((property: Property) => {
    navigate(`/properties/${property.id}`);
  }, [navigate]);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMap(map);
    setMapReady(true);
    
    // Add bounds if we have properties
    if (properties.length > 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        let validPoints = 0;
        
        properties.forEach(property => {
          const coords = extractCoordinates(property);
          bounds.extend(coords);
          validPoints++;
        });
        
        if (validPoints > 0) {
          setTimeout(() => {
            map.fitBounds(bounds);
            if (validPoints === 1) {
              map.setZoom(15); // Closer zoom for single property
            }
          }, 100);
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [properties]);

  // Log markers for debugging
  useEffect(() => {
    if (isLoaded && mapReady) {
      console.log(`Displaying ${properties.length} markers, hovered: ${hoveredPropertyId}`);
      setDisplayedMarkers(properties.map(p => p.id));
    }
  }, [properties, isLoaded, mapReady, hoveredPropertyId]);

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
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
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
        center={DEFAULT_MAP_CENTER}
        zoom={12}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {properties.map((property) => {
          const isActive = hoveredPropertyId === property.id || activeProperty?.id === property.id;
          const position = extractCoordinates(property);
          
          return (
            <Marker
              key={property.id}
              position={position}
              onClick={() => setActiveProperty(property)}
              animation={isActive ? google.maps.Animation.BOUNCE : undefined}
              // No icon property - let Google Maps use its default marker
              title={property.title || `Property ${property.id}`}
            />
          );
        })}

        {activeProperty && (
          <InfoWindow
            position={extractCoordinates(activeProperty)}
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
      
      {/* Debug information - remove in production */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-white/80 text-xs p-2 rounded border shadow max-w-xs">
          <div>Properties: {properties.length}</div>
          <div>Displayed markers: {displayedMarkers.length}</div>
          <div>Hover ID: {hoveredPropertyId || 'none'}</div>
        </div>
      )} */}
    </div>
  );
};

export default MapPanel;