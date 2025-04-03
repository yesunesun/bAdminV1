// src/modules/properties/components/MapPanel.tsx
// Version: 3.3.0
// Last Modified: 03-04-2025 15:00 IST
// Purpose: Fixed hover synchronization and improved marker rendering

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { PropertyType } from '@/modules/owner/components/property/types';
import { DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { formatPrice } from '../services/propertyMapService';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Colored marker URLs from Google Maps
const markerPins = {
  residential: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  apartment: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  commercial: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  land: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  office: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  shop: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  default: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
};

interface MapPanelProps {
  properties: PropertyType[];
  isLoaded: boolean;
  loadError: Error | null;
  activeProperty: PropertyType | null;
  setActiveProperty: (property: PropertyType | null) => void;
  hoveredProperty: string | null;
}

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  isLoaded,
  loadError,
  activeProperty,
  setActiveProperty,
  hoveredProperty
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const [mapClickListener, setMapClickListener] = useState<google.maps.MapsEventListener | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyType | null>(null);
  
  // Helper function to get marker pin based on property type
  const getMarkerPin = (property: PropertyType) => {
    const propertyType = property.property_details?.propertyType?.toLowerCase() || '';
    
    if (propertyType.includes('apartment')) return markerPins.apartment;
    if (propertyType.includes('residential') || propertyType.includes('house')) return markerPins.residential;
    if (propertyType.includes('office')) return markerPins.office;
    if (propertyType.includes('shop') || propertyType.includes('retail')) return markerPins.shop;
    if (propertyType.includes('commercial')) return markerPins.commercial;
    if (propertyType.includes('land') || propertyType.includes('plot')) return markerPins.land;
    
    return markerPins.default;
  };

  // Validate and parse coordinates with detailed logging
  const getValidCoordinates = (property: PropertyType) => {
    try {
      if (!property.property_details) return null;
      
      const lat = parseFloat(property.property_details.latitude || '0');
      const lng = parseFloat(property.property_details.longitude || '0');
      
      // Detailed coordinate validation
      if (
        !isNaN(lat) && 
        !isNaN(lng) && 
        lat !== 0 && 
        lng !== 0 && 
        lat >= -90 && 
        lat <= 90 && 
        lng >= -180 && 
        lng <= 180
      ) {
        return { lat, lng };
      }
      
      return null;
    } catch (error) {
      console.error(`Coordinate parsing error for property ${property.id}:`, error);
      return null;
    }
  };
  
  // Map options
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    clickableIcons: false,
    scrollwheel: true,
    zoomControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    gestureHandling: "greedy",
    maxZoom: 18,
    minZoom: 4,
    styles: [
      {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
      }
    ]
  };
  
  // Update marker animations when hoveredProperty changes
  useEffect(() => {
    console.log(`Hover state changed to: ${hoveredProperty}`);
    
    // Stop all animations first
    markersRef.current.forEach((marker, id) => {
      marker.setAnimation(null);
      
      // Reset size for non-hovered markers
      if (id !== hoveredProperty && id !== (activeProperty?.id || '')) {
        marker.setIcon({
          url: marker.getIcon()?.toString() || '',
          scaledSize: new google.maps.Size(36, 36),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 32),
        });
        marker.setZIndex(undefined);
        marker.setOpacity(0.7);
      }
    });
    
    // Apply animation and enhanced style to hovered marker
    if (hoveredProperty && markersRef.current.has(hoveredProperty)) {
      const marker = markersRef.current.get(hoveredProperty);
      if (marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        marker.setIcon({
          url: marker.getIcon()?.toString() || '',
          scaledSize: new google.maps.Size(48, 48),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(16, 32),
        });
        marker.setZIndex(1000);
        marker.setOpacity(1);
        
        // Center map on hovered marker
        if (mapRef.current) {
          mapRef.current.panTo(marker.getPosition() as google.maps.LatLng);
        }
      }
    }
  }, [hoveredProperty, activeProperty]);
  
  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded');
    mapRef.current = map;
   
    // Add click listener to close info window
    const listener = map.addListener('click', () => {
      setSelectedProperty(null);
      setActiveProperty(null);
    });
    setMapClickListener(listener);
   
    // Fit map to bounds of valid properties
    if (properties.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      let validPropertiesCount = 0;
      
      properties.forEach(property => {
        const coords = getValidCoordinates(property);
        if (coords) {
          bounds.extend(coords);
          validPropertiesCount++;
        }
      });
      
      console.log('Map Bounds Calculation:', {
        totalProperties: properties.length,
        validProperties: validPropertiesCount,
        boundsEmpty: bounds.isEmpty()
      });
      
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
        // Prevent excessive zooming
        const zoomListener = google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 16) map.setZoom(16);
          google.maps.event.removeListener(zoomListener);
        });
      } else {
        // Fallback to default center if no valid coordinates
        map.setCenter(DEFAULT_MAP_CENTER);
        map.setZoom(12);
      }
    }
  }, [properties, setActiveProperty]);
  
  // Store markers in ref after creation
  const onMarkerLoad = useCallback((marker: google.maps.Marker, propertyId: string) => {
    markersRef.current.set(propertyId, marker);
    console.log(`Marker stored for property ${propertyId}`);
  }, []);
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 10;
      mapRef.current.setZoom(currentZoom + 1);
    }
  };
  
  const handleZoomOut = () => {
    if (mapRef.current) {
      const currentZoom = mapRef.current.getZoom() || 10;
      mapRef.current.setZoom(currentZoom - 1);
    }
  };
  
  // Clean up event listeners
  useEffect(() => {
    return () => {
      if (mapClickListener) {
        google.maps.event.removeListener(mapClickListener);
      }
      markersRef.current.clear();
    };
  }, [mapClickListener]);

  return (
    <div className={`h-full relative transition-all duration-300 ${
      isFullscreen ? 'w-full' : 'w-full lg:w-2/3'
    }`}>
      {isLoaded ? (
        <GoogleMap
          mapContainerClassName="w-full h-full p-2"
          mapContainerStyle={{ 
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            margin: '8px'
          }}
          center={DEFAULT_MAP_CENTER}
          zoom={12}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          {/* Property Markers with Comprehensive Validation */}
          {properties.map((property) => {
            const coords = getValidCoordinates(property);
            
            // Skip properties with invalid coordinates
            if (!coords) return null;
            
            const isHovered = hoveredProperty === property.id;
            const isActive = activeProperty?.id === property.id;
            
            return (
              <Marker
                key={property.id}
                position={coords}
                icon={{
                  url: getMarkerPin(property),
                  scaledSize: new google.maps.Size(
                    isHovered || isActive ? 48 : 36, 
                    isHovered || isActive ? 48 : 36
                  ),
                  origin: new google.maps.Point(0, 0),
                  anchor: new google.maps.Point(16, 32),
                }}
                opacity={isHovered || isActive ? 1 : 0.7}
                animation={
                  isHovered ? google.maps.Animation.BOUNCE : 
                  isActive ? google.maps.Animation.DROP : 
                  undefined
                }
                zIndex={isHovered || isActive ? 1000 : undefined}
                onClick={() => {
                  setSelectedProperty(property);
                  setActiveProperty(property);
                }}
                onLoad={(marker) => onMarkerLoad(marker, property.id)}
              />
            );
          })}
          
          {/* Info Window for selected property */}
          {selectedProperty && (
            <InfoWindow
              position={getValidCoordinates(selectedProperty) as google.maps.LatLng}
              onCloseClick={() => setSelectedProperty(null)}
            >
              <div className="w-64 p-1">
                <h3 className="font-semibold text-sm truncate">{selectedProperty.title}</h3>
                <p className="text-xs font-bold">{formatPrice(selectedProperty.price || 0)}</p>
                <div className="text-xs text-gray-500 truncate mt-1">
                  {selectedProperty.address || selectedProperty.city || 'Location not specified'}
                </div>
                
                <div className="flex text-xs mt-2 gap-2">
                  {selectedProperty.bedrooms && (
                    <span>{selectedProperty.bedrooms} Beds</span>
                  )}
                  {selectedProperty.bathrooms && (
                    <span>{selectedProperty.bathrooms} Baths</span>
                  )}
                  {selectedProperty.square_feet && (
                    <span>{selectedProperty.square_feet} sq.ft</span>
                  )}
                </div>
                
                <Link
                  to={`/seeker/property/${selectedProperty.id}`}
                  className="flex items-center justify-center w-full text-xs text-blue-600 font-medium mt-2 hover:underline"
                >
                  View Details
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </InfoWindow>
          )}
          
          {/* Map Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2">
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-white shadow-md"
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-white shadow-md"
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon"
              className="rounded-full bg-white shadow-md"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? 
                <Minimize className="h-4 w-4" /> : 
                <Maximize className="h-4 w-4" />
              }
            </Button>
          </div>
        </GoogleMap>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted m-2 rounded-lg">
          <div className="text-center p-4">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Map Loading</h3>
            <p className="text-muted-foreground">
              Please wait while we load the map...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPanel;