// src/modules/seeker/components/MapPanel.tsx
// Version: 2.8.0
// Last Modified: 02-06-2025 13:30 IST
// Purpose: Enhanced UI with rounded corners and improved visual consistency

import React, { useCallback, useState, useEffect } from 'react';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Property } from '@/modules/owner/components/property/types';
import { useNavigate } from 'react-router-dom';

// Enhanced map container style for rounded corners
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px', // Adding rounded corners
};

// Enhanced map options with better styling
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  styles: [
    {
      featureType: 'all',
      stylers: [
        { saturation: -10 },
        { lightness: 5 }
      ]
    },
    {
      featureType: 'poi',
      stylers: [{ visibility: 'simplified' }]
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'simplified' }]
    }
  ]
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

  // Handle map load with enhanced styling
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

  // Enhanced error state with better styling
  if (loadError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl border border-border">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-lg border border-border text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-destructive text-2xl font-bold">!</div>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-foreground">Map Loading Failed</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {loadError.message || "We couldn't load the Google Maps component."}
          </p>
          <div className="bg-muted p-4 rounded-xl text-left mb-6 text-xs">
            <strong className="text-foreground">Possible solutions:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
              <li>Check that VITE_GOOGLE_MAPS_API_KEY is set in your .env file</li>
              <li>Verify that your API key is valid and has Maps JavaScript API enabled</li>
              <li>Make sure the domain restrictions for your API key include this website</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 py-2"
          >
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  // Enhanced loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl border border-border">
        <div className="text-center p-8">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="w-full h-full rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading maps...</p>
          <p className="text-xs text-muted-foreground/70 mt-2">Preparing your property locations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden">
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
              title={property.title || `Property ${property.id}`}
              // Enhanced marker with custom icon for active state
              icon={isActive ? {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
              } : undefined}
            />
          );
        })}

        {activeProperty && (
          <InfoWindow
            position={extractCoordinates(activeProperty)}
            onCloseClick={() => setActiveProperty(null)}
          >
            <div className="p-3 max-w-xs">
              <h3 className="font-semibold text-sm mb-2 text-foreground line-clamp-2">
                {activeProperty.title || 'Property'}
              </h3>
              <div className="mb-3 text-xs text-muted-foreground">
                {activeProperty.property_details?.price && (
                  <span className="font-bold text-primary text-sm">
                    ₹{activeProperty.property_details.price}
                  </span>
                )}
                {activeProperty.property_details?.location && (
                  <div className="mt-1 flex items-center">
                    <span className="truncate">{activeProperty.property_details.location}</span>
                  </div>
                )}
              </div>
              <Button 
                size="sm" 
                className="text-xs h-8 w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
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