// src/modules/seeker/components/MapPanel.tsx
// Version: 5.0.0
// Last Modified: 08-01-2025 22:15 IST
// Purpose: Simplified coordinate handling - relies only on get_latest_properties output

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { GoogleMap } from '@react-google-maps/api';
import { SearchResult } from '@/components/Search/types/search.types';
import { Button } from '@/components/ui/button';
import { 
  getPropertyMarker, 
  markerIconCache
} from '@/utils/mapMarkers';

// Enhanced map container style for rounded corners
const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '16px',
};

// Enhanced map options with better zoom controls and enabled scroll wheel
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  scrollwheel: true,
  gestureHandling: 'greedy',
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
  properties: SearchResult[];
  isLoaded: boolean;
  loadError: Error | null;
  activeProperty: SearchResult | null;
  setActiveProperty: (property: SearchResult | null) => void;
  hoveredPropertyId: string | null;
  onMarkerHover?: (propertyId: string, isHovering: boolean) => void;
  onMarkerClick?: (propertyId: string) => void;
}

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  isLoaded,
  loadError,
  activeProperty,
  setActiveProperty,
  hoveredPropertyId,
  onMarkerHover,
  onMarkerClick,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Ref to store marker instances for cleanup
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Simplified coordinate extraction - uses only database output
  const getPropertyCoordinates = useCallback((property: SearchResult) => {
    try {
      // Use latitude and longitude directly from get_latest_properties output
      const lat = property.latitude;
      const lng = property.longitude;
      
      if (lat !== null && lng !== null && lat !== undefined && lng !== undefined) {
        const latitude = parseFloat(String(lat));
        const longitude = parseFloat(String(lng));
        
        if (!isNaN(latitude) && !isNaN(longitude) && 
            latitude >= -90 && latitude <= 90 && 
            longitude >= -180 && longitude <= 180 &&
            latitude !== 0 && longitude !== 0) {
          
          return { lat: latitude, lng: longitude };
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  // Filter properties that have valid coordinates
  const propertiesWithCoordinates = useCallback(() => {
    return properties.filter(property => {
      const coords = getPropertyCoordinates(property);
      return coords !== null;
    });
  }, [properties, getPropertyCoordinates]);


  // Auto-pan map to show hovered property marker
  const panToPropertyIfNeeded = useCallback((propertyId: string) => {
    if (!map || !isLoaded) return;

    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;

      const coords = getPropertyCoordinates(property);
      if (!coords) return;

      const position = new google.maps.LatLng(coords.lat, coords.lng);
      const bounds = map.getBounds();

      // Check if marker is visible in current viewport
      if (!bounds || !bounds.contains(position)) {
        // Smoothly pan to the marker position
        map.panTo(position);
        
        // Optional: Adjust zoom if too far out
        const currentZoom = map.getZoom() || 14;
        if (currentZoom < 13) {
          setTimeout(() => {
            map.setZoom(14);
          }, 300);
        }
      }
    } catch (error) {
      // Skip panning on error
    }
  }, [map, isLoaded, properties, getPropertyCoordinates]);

  // Watch for hoveredPropertyId changes and pan to marker if needed
  useEffect(() => {
    if (hoveredPropertyId) {
      panToPropertyIfNeeded(hoveredPropertyId);
    }
  }, [hoveredPropertyId, panToPropertyIfNeeded]);

  // Handle map load with enhanced styling and better zoom management
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    setMapReady(true);
    
    // Add bounds if we have properties with coordinates
    const validProperties = propertiesWithCoordinates();
    
    if (validProperties.length > 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        let validPoints = 0;
        
        validProperties.forEach(property => {
          const coords = getPropertyCoordinates(property);
          if (coords) {
            bounds.extend({ lat: coords.lat, lng: coords.lng });
            validPoints++;
          }
        });
        
        if (validPoints > 0) {
          setTimeout(() => {
            if (validPoints === 1) {
              const coords = getPropertyCoordinates(validProperties[0]);
              if (coords) {
                map.setCenter({ lat: coords.lat, lng: coords.lng });
                map.setZoom(16);
              }
            } else if (validPoints <= 3) {
              map.fitBounds(bounds);
              map.setZoom(Math.min(map.getZoom() || 14, 15));
            } else if (validPoints <= 10) {
              map.fitBounds(bounds);
              map.setZoom(Math.min(map.getZoom() || 14, 14));
            } else {
              map.fitBounds(bounds);
              const currentZoom = map.getZoom() || 14;
              map.setZoom(Math.max(Math.min(currentZoom, 14), 13));
            }
          }, 100);
        }
      } catch (e) {
        map.setCenter(DEFAULT_MAP_CENTER);
        map.setZoom(14);
      }
    } else {
      map.setCenter(DEFAULT_MAP_CENTER);
      map.setZoom(14);
    }
  }, [propertiesWithCoordinates, getPropertyCoordinates]);

  // Create markers only for properties with valid coordinates
  useEffect(() => {
    if (isLoaded && mapReady && map) {
      const validProperties = propertiesWithCoordinates();
      
      // Clean up existing markers
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
      
      // Create new markers only for properties with coordinates
      const newMarkers: google.maps.Marker[] = [];
      
      validProperties.forEach((property, index) => {
        try {
          const coords = getPropertyCoordinates(property);
          if (!coords) return; // Skip if no valid coordinates
          
          const isHovered = hoveredPropertyId === property.id;
          const isActive = activeProperty?.id === property.id;
          
          // Get custom marker icon based on property type
          const markerIcon = getPropertyMarker(property, isHovered || isActive, 20);
          
          const marker = new google.maps.Marker({
            position: { lat: coords.lat, lng: coords.lng },
            map: map,
            title: '', // Remove hover title
            icon: markerIcon,
            animation: isHovered || isActive ? google.maps.Animation.BOUNCE : undefined,
            zIndex: isHovered || isActive ? 1000 : 1
          });
          
          // Add click listener to scroll to property in list
          marker.addListener('click', () => {
            if (onMarkerClick) {
              onMarkerClick(property.id);
            }
          });
          
          // Add hover listeners for auto-scroll functionality
          if (onMarkerHover) {
            marker.addListener('mouseover', () => {
              onMarkerHover(property.id, true);
            });
            
            marker.addListener('mouseout', () => {
              onMarkerHover(property.id, false);
            });
          }
          
          newMarkers.push(marker);
          
        } catch (error) {
          // Skip marker creation on error
        }
      });
      
      markersRef.current = newMarkers;
    }
    
    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, [properties, isLoaded, mapReady, map, hoveredPropertyId, activeProperty, propertiesWithCoordinates, getPropertyCoordinates]);

  // Cleanup marker cache on unmount
  useEffect(() => {
    return () => {
      markerIconCache.clear();
    };
  }, []);

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
              <li>Check that VITE_GOOGLE_MAPS_KEY is set in your .env file</li>
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
    <div className="w-full h-full rounded-2xl overflow-hidden relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_MAP_CENTER}
        zoom={14}
        options={mapOptions}
        onLoad={onMapLoad}
      >
      </GoogleMap>
    </div>
  );
};

export default MapPanel;
// End of file