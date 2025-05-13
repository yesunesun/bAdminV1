// src/modules/seeker/components/MapPanel.tsx
// Version: 3.2.0
// Last Modified: 14-05-2025 19:20 IST
// Purpose: Updated imports to fix missing DEFAULT_MAP_CENTER reference

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, ListIcon, HomeIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { PropertyData } from '@/modules/owner/components/property/types';
import { fetchLocations } from '../services/seekerService';

interface MapPanelProps {
  properties: PropertyData[];
  selectedProperty?: PropertyData | null;
  onSelectProperty?: (property: PropertyData | null) => void;
  onListViewToggle?: () => void;
  showListToggle?: boolean;
  mapHeight?: string;
  standalone?: boolean;
  zoom?: number;
  center?: google.maps.LatLngLiteral;
}

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onListViewToggle,
  showListToggle = true,
  mapHeight = 'calc(100vh - 4rem)',
  standalone = false,
  zoom = 13,
  center
}) => {
  const { isLoaded, loadError } = useGoogleMaps();
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindowData, setInfoWindowData] = useState<{
    position: google.maps.LatLngLiteral;
    property: PropertyData;
  } | null>(null);
  const [mapBounds, setMapBounds] = useState<google.maps.LatLngBounds | null>(null);
  const markerRefs = useRef<Map<string, google.maps.Marker>>(new Map());
  const navigate = useNavigate();
  
  // Use DEFAULT_MAP_CENTER as a fallback if center is not provided
  const initialCenter = center || DEFAULT_MAP_CENTER;

  // Extract coordinates from property data
  const getPropertyCoordinates = useCallback((property: PropertyData): google.maps.LatLngLiteral | null => {
    if (!property) return null;
    
    // Try to extract coordinates from various property formats
    try {
      // V2 format
      if (property.location?.coordinates) {
        const lat = property.location.coordinates.latitude || property.location.coordinates.lat;
        const lng = property.location.coordinates.longitude || property.location.coordinates.lng;
        
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // V1 format or property_details
      const details = property.property_details || {};
      
      // Try different possible paths for coordinates
      if (details.coordinates) {
        const lat = details.coordinates.lat || details.coordinates.latitude;
        const lng = details.coordinates.lng || details.coordinates.longitude;
        
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      if (details.mapCoordinates) {
        const lat = details.mapCoordinates.lat || details.mapCoordinates.latitude;
        const lng = details.mapCoordinates.lng || details.mapCoordinates.longitude;
        
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // Try direct lat/lng values
      if (details.lat && details.lng) {
        const lat = parseFloat(details.lat);
        const lng = parseFloat(details.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // Try latitude/longitude values
      if (details.latitude && details.longitude) {
        const lat = parseFloat(details.latitude);
        const lng = parseFloat(details.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch (error) {
      console.error("Error extracting coordinates:", error);
    }
    
    return null;
  }, []);

  // Process properties to get markers with valid coordinates
  const processProperties = useCallback(() => {
    if (!properties || properties.length === 0) return [];
    
    return properties
      .map(property => {
        const coordinates = getPropertyCoordinates(property);
        if (!coordinates) return null;
        
        return {
          position: coordinates,
          property
        };
      })
      .filter(marker => marker !== null);
  }, [properties, getPropertyCoordinates]);

  // Update markers when properties change
  useEffect(() => {
    const newMarkers = processProperties();
    setMarkers(newMarkers);
    
    // Fit bounds if we have markers and map is available
    if (newMarkers.length > 0 && mapRef) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => bounds.extend(marker.position));
      setMapBounds(bounds);
      mapRef.fitBounds(bounds);
      
      // If there's only one marker, zoom in more
      if (newMarkers.length === 1) {
        mapRef.setZoom(15);
      }
    }
  }, [properties, processProperties, mapRef]);

  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Handle marker load
  const onMarkerLoad = useCallback((marker: google.maps.Marker, propertyId: string) => {
    markerRefs.current.set(propertyId, marker);
  }, []);

  // Handle marker click to show info window
  const handleMarkerClick = useCallback((marker: any) => {
    setInfoWindowData(marker);
    
    if (onSelectProperty) {
      onSelectProperty(marker.property);
    }
  }, [onSelectProperty]);

  // Handle info window close
  const handleInfoWindowClose = useCallback(() => {
    setInfoWindowData(null);
    
    if (onSelectProperty) {
      onSelectProperty(null);
    }
  }, [onSelectProperty]);

  // Center on selected property
  useEffect(() => {
    if (selectedProperty && mapRef) {
      const coords = getPropertyCoordinates(selectedProperty);
      if (coords) {
        mapRef.panTo(coords);
        mapRef.setZoom(16);
        
        // Find the marker for the selected property
        const marker = markerRefs.current.get(selectedProperty.id);
        if (marker) {
          // Show info window for the selected property
          setInfoWindowData({
            position: coords,
            property: selectedProperty
          });
        }
      }
    }
  }, [selectedProperty, mapRef, getPropertyCoordinates]);

  // Apply bounds if available
  useEffect(() => {
    if (mapBounds && mapRef && !selectedProperty) {
      mapRef.fitBounds(mapBounds);
    }
  }, [mapBounds, mapRef, selectedProperty]);

  // Render a loading indicator while Google Maps is loading
  if (!isLoaded) {
    return (
      <div 
        className="bg-muted/30 flex items-center justify-center rounded-lg"
        style={{ height: mapHeight }}
      >
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-primary/60 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  // Render error state if Google Maps failed to load
  if (loadError) {
    return (
      <div 
        className="bg-muted/30 flex items-center justify-center rounded-lg"
        style={{ height: mapHeight }}
      >
        <div className="flex flex-col items-center p-6 max-w-md text-center">
          <MapIcon className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to load map</h3>
          <p className="text-muted-foreground text-sm mb-4">
            There was an issue loading the map. Please try again later.
          </p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: mapHeight
        }}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        center={initialCenter}
        zoom={zoom}
        onLoad={onMapLoad}
      >
        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          {showListToggle && (
            <Button
              variant="secondary"
              size="icon"
              className="shadow-md bg-background"
              onClick={onListViewToggle}
              title="Toggle list view"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          )}
          
          {!standalone && (
            <Button
              variant="secondary"
              size="icon"
              className="shadow-md bg-background"
              onClick={() => navigate('/')}
              title="Return to home"
            >
              <HomeIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Markers for properties */}
        {markers.map((marker, index) => (
          <Marker
            key={marker.property.id || index}
            position={marker.position}
            icon={{
              url: selectedProperty && selectedProperty.id === marker.property.id
                ? '/map-marker-active.svg'
                : '/map-marker.svg',
              scaledSize: new google.maps.Size(32, 40)
            }}
            animation={google.maps.Animation.DROP}
            onLoad={(markerInstance) => onMarkerLoad(markerInstance, marker.property.id)}
            onClick={() => handleMarkerClick(marker)}
          />
        ))}
        
        {/* Info Window */}
        {infoWindowData && (
          <InfoWindow
            position={infoWindowData.position}
            onCloseClick={handleInfoWindowClose}
            options={{ maxWidth: 300 }}
          >
            <div className="p-1">
              <h3 className="font-medium text-sm mb-1 truncate">
                {infoWindowData.property.title || infoWindowData.property.basicDetails?.title || 'Property'}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {infoWindowData.property.address || 
                  infoWindowData.property.location?.address || 
                  (infoWindowData.property.location?.locality && infoWindowData.property.location?.city ? 
                    `${infoWindowData.property.location.locality}, ${infoWindowData.property.location.city}` :
                    'Location details not available'
                  )
                }
              </p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs font-medium">
                  ₹{typeof infoWindowData.property.price === 'number' 
                    ? infoWindowData.property.price.toLocaleString('en-IN') 
                    : infoWindowData.property.price}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs"
                  onClick={() => navigate(`/property/${infoWindowData.property.id}`)}
                >
                  View Details
                </Button>
              </div>
            </div>
          </InfoWindow>
        )}
        
        {/* Property Navigation Controls (when a property is selected) */}
        {selectedProperty && markers.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full px-3 shadow-md"
              onClick={() => {
                const currentIndex = markers.findIndex(m => m.property.id === selectedProperty.id);
                const prevIndex = currentIndex <= 0 ? markers.length - 1 : currentIndex - 1;
                
                if (onSelectProperty) {
                  onSelectProperty(markers[prevIndex].property);
                }
              }}
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              <span>Previous</span>
            </Button>
            
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full px-3 shadow-md"
              onClick={() => {
                const currentIndex = markers.findIndex(m => m.property.id === selectedProperty.id);
                const nextIndex = currentIndex >= markers.length - 1 ? 0 : currentIndex + 1;
                
                if (onSelectProperty) {
                  onSelectProperty(markers[nextIndex].property);
                }
              }}
            >
              <span>Next</span>
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </GoogleMap>
    </div>
  );
};

export default MapPanel;