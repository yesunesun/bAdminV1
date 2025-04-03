// src/modules/seeker/components/MapPanel.tsx
// Version: 1.1.0
// Last Modified: 03-04-2025 14:45 IST
// Purpose: Added margins to Google Map component while preserving hover functionality

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getMarkerPin, formatPrice } from '../services/seekerService';
import { DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';

interface MapPanelProps {
  properties: PropertyType[];
  isLoaded: boolean;
  loadError: Error | null;
  activeProperty: PropertyType | null;
  setActiveProperty: (property: PropertyType | null) => void;
  hoveredProperty: string | null;
}

// Updated map container style with height adjustment to accommodate margins
const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultOptions = {
  fullscreenControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  zoomControl: true,
  scrollwheel: true,
  clickableIcons: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  isLoaded,
  loadError,
  activeProperty,
  setActiveProperty,
  hoveredProperty
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [bounds, setBounds] = useState<google.maps.LatLngBounds | null>(null);
  
  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMap(map);
    
    // Create bounds for all properties
    const bounds = new google.maps.LatLngBounds();
    
    // Add all property locations to bounds
    properties.forEach(property => {
      const lat = parseFloat(property.property_details?.latitude || '0');
      const lng = parseFloat(property.property_details?.longitude || '0');
      
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        bounds.extend({ lat, lng });
      }
    });
    
    // Only fit bounds if there are properties
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      setBounds(bounds);
    } else {
      // Default center if no properties
      map.setCenter(DEFAULT_MAP_CENTER);
      map.setZoom(12);
    }
  }, [properties]);
  
  // Update bounds when properties change
  useEffect(() => {
    if (map && properties.length > 0) {
      const newBounds = new google.maps.LatLngBounds();
      let hasValidCoordinates = false;
      
      properties.forEach(property => {
        const lat = parseFloat(property.property_details?.latitude || '0');
        const lng = parseFloat(property.property_details?.longitude || '0');
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          newBounds.extend({ lat, lng });
          hasValidCoordinates = true;
        }
      });
      
      if (hasValidCoordinates && !newBounds.equals(bounds || new google.maps.LatLngBounds())) {
        map.fitBounds(newBounds);
        setBounds(newBounds);
      }
    }
  }, [map, properties, bounds]);
  
  // Handle marker click
  const handleMarkerClick = useCallback((property: PropertyType) => {
    setActiveProperty(property);
    
    // Center map on marker with slight offset for info window
    if (map) {
      const lat = parseFloat(property.property_details?.latitude || '0');
      const lng = parseFloat(property.property_details?.longitude || '0');
      
      if (!isNaN(lat) && !isNaN(lng)) {
        map.panTo({ lat, lng });
      }
    }
  }, [map, setActiveProperty]);
  
  // Center map on property when hovered in list
  useEffect(() => {
    if (map && hoveredProperty) {
      const property = properties.find(p => p.id === hoveredProperty);
      if (property) {
        const lat = parseFloat(property.property_details?.latitude || '0');
        const lng = parseFloat(property.property_details?.longitude || '0');
        
        if (!isNaN(lat) && !isNaN(lng)) {
          map.panTo({ lat, lng });
        }
      }
    }
  }, [map, hoveredProperty, properties]);
  
  // Error handling
  if (loadError) {
    return (
      <div className="flex-1 hidden lg:flex items-center justify-center p-8 bg-muted/10">
        <div className="text-center p-6 max-w-md bg-card rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">Map could not be loaded</h3>
          <p className="text-muted-foreground mb-4">
            There was an error loading the map. Please try again later.
          </p>
          <div className="text-xs text-destructive bg-destructive/10 p-2 rounded mb-4 text-left overflow-auto">
            {loadError.message}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative flex-1 hidden lg:flex p-4">
      <div className="w-full h-full rounded-xl overflow-hidden shadow-md border border-border">
        {isLoaded ? (
          <GoogleMap
            id="property-map"
            mapContainerStyle={mapContainerStyle}
            options={defaultOptions}
            onLoad={onMapLoad}
          >
            {/* Property markers */}
            {properties.map(property => {
              const lat = parseFloat(property.property_details?.latitude || '0');
              const lng = parseFloat(property.property_details?.longitude || '0');
              
              // Skip invalid coordinates
              if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                return null;
              }
              
              const isActive = activeProperty?.id === property.id;
              const isHovered = hoveredProperty === property.id;
              
              return (
                <Marker
                  key={property.id}
                  position={{ lat, lng }}
                  icon={{
                    url: getMarkerPin(property),
                    scaledSize: new google.maps.Size(isActive || isHovered ? 40 : 30, isActive || isHovered ? 40 : 30),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(15, 30),
                  }}
                  animation={isHovered && !isActive ? google.maps.Animation.BOUNCE : undefined}
                  onClick={() => handleMarkerClick(property)}
                  zIndex={isActive || isHovered ? 1000 : 1}
                />
              );
            })}
            
            {/* Info window for active property */}
            {activeProperty && (() => {
              const lat = parseFloat(activeProperty.property_details?.latitude || '0');
              const lng = parseFloat(activeProperty.property_details?.longitude || '0');
              
              if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
                return null;
              }
              
              return (
                <InfoWindow
                  position={{ lat, lng }}
                  onCloseClick={() => setActiveProperty(null)}
                >
                  <div className="max-w-xs">
                    <Link 
                      to={`/seeker/property/${activeProperty.id}`}
                      className="block hover:opacity-90"
                    >
                      <div className="w-full h-24 bg-muted rounded-md overflow-hidden mb-2">
                        <img
                          src={activeProperty.property_images?.[0]?.url || '/apartment.jpg'}
                          alt={activeProperty.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h3 className="font-medium text-sm mb-1 line-clamp-1">{activeProperty.title}</h3>
                      
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold">{formatPrice(activeProperty.price)}</span>
                        
                        <div className="flex text-xs text-muted-foreground">
                          {activeProperty.bedrooms && <span className="mr-2">{activeProperty.bedrooms} bed</span>}
                          {activeProperty.bathrooms && <span>{activeProperty.bathrooms} bath</span>}
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground truncate">
                        {activeProperty.address || activeProperty.city || 'Location unavailable'}
                      </p>
                    </Link>
                  </div>
                </InfoWindow>
              );
            })()}
          </GoogleMap>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted/10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-muted rounded-full mb-3"></div>
              <div className="h-4 w-32 bg-muted rounded mb-3"></div>
              <div className="h-3 w-48 bg-muted rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPanel;