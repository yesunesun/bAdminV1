// src/modules/admin/pages/PropertyMapView/components/MapContainer.tsx
// Version: 3.0.0
// Last Modified: 07-12-2024 17:45 IST
// Purpose: Enhanced admin map with custom SVG markers for property types and improved behavior

import React, { useEffect, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { PropertyWithImages, getPropertyPosition } from '../services/propertyMapService';
import { createInfoWindowContent } from './InfoWindowContent';
import { defaultCenter } from '../hooks/useGoogleMaps';
import { 
  detectPropertyType, 
  getPropertyMarker, 
  markerIconCache 
} from '@/utils/mapMarkers';

// Map container style
const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 172px)'
};

interface MapContainerProps {
  properties: PropertyWithImages[];
  mapInstance: google.maps.Map | null;
  infoWindow: google.maps.InfoWindow | null;
  onMapLoad: (map: google.maps.Map) => void;
  isLoaded: boolean;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  properties,
  mapInstance,
  infoWindow,
  onMapLoad,
  isLoaded
}) => {
  const navigate = useNavigate();
  const markersRef = useRef<google.maps.Marker[]>([]);
  const activeMarkerRef = useRef<google.maps.Marker | null>(null);
  const mouseIsOverInfoWindowRef = useRef<boolean>(false);
  const infoWindowTimeoutRef = useRef<number | null>(null);
  
  // Create markers when properties and map are ready
  useEffect(() => {
    if (!isLoaded || !mapInstance || !infoWindow || properties.length === 0) return;
    
    console.log('Creating markers for', properties.length, 'properties');
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Create new markers with custom SVG icons
    const newMarkers = properties.map(property => {
      const position = getPropertyPosition(property, defaultCenter);
      
      // Get custom marker icon based on property type (not highlighted by default)
      const markerIcon = getPropertyMarker(property, false, 32);
      
      // Create marker with custom SVG icon
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: property.title,
        icon: markerIcon,
        animation: google.maps.Animation.DROP
      });
      
      // Create info window content with property image and details
      const content = createInfoWindowContent(property);
      
      // Add mouseover event listener to show info window and highlight marker
      marker.addListener('mouseover', () => {
        if (infoWindowTimeoutRef.current) {
          clearTimeout(infoWindowTimeoutRef.current);
          infoWindowTimeoutRef.current = null;
        }
        
        // Close any open info window first
        infoWindow.close();
        
        // Update marker to highlighted state
        const highlightedIcon = getPropertyMarker(property, true, 32);
        marker.setIcon(highlightedIcon);
        
        // Set this as the active marker
        activeMarkerRef.current = marker;
        
        // Set the content and open the info window
        infoWindow.setContent(content);
        infoWindow.open(mapInstance, marker);
        
        // Add event listener to the button after the info window is opened
        setTimeout(() => {
          const button = document.getElementById('viewDetailsBtn');
          if (button) {
            button.addEventListener('click', (e) => {
              e.preventDefault();
              navigate(`/admin/properties/${property.id}`);
            });
          }
          
          // Setup info window event listeners
          setupInfoWindowListeners();
        }, 50);
      });
      
      // Add mouseout event listener to remove highlight and close info window
      marker.addListener('mouseout', () => {
        // Revert marker to normal state
        const normalIcon = getPropertyMarker(property, false, 32);
        marker.setIcon(normalIcon);
        
        // Add a delay before closing to allow moving mouse to info window
        infoWindowTimeoutRef.current = window.setTimeout(() => {
          if (!mouseIsOverInfoWindowRef.current) {
            infoWindow.close();
            activeMarkerRef.current = null;
          }
        }, 300);
      });
      
      // Add click listener to navigate to property details
      marker.addListener('click', () => {
        navigate(`/admin/properties/${property.id}`);
      });
      
      return marker;
    });
    
    // Store markers in ref
    markersRef.current = newMarkers;
    
    // Setup event listeners for info window to prevent closing when mouse is over it
    const setupInfoWindowListeners = () => {
      const infoWindowElement = document.querySelector('.gm-style-iw-a');
      if (!infoWindowElement) return;
      
      // Mouse enters info window
      infoWindowElement.addEventListener('mouseenter', () => {
        mouseIsOverInfoWindowRef.current = true;
        if (infoWindowTimeoutRef.current) {
          clearTimeout(infoWindowTimeoutRef.current);
          infoWindowTimeoutRef.current = null;
        }
      });
      
      // Mouse leaves info window
      infoWindowElement.addEventListener('mouseleave', () => {
        mouseIsOverInfoWindowRef.current = false;
        
        // Revert active marker to normal state if exists
        if (activeMarkerRef.current) {
          const property = properties.find(p => {
            const markerPos = activeMarkerRef.current?.getPosition();
            const propPos = getPropertyPosition(p, defaultCenter);
            return markerPos?.lat() === propPos.lat && markerPos?.lng() === propPos.lng;
          });
          
          if (property) {
            const normalIcon = getPropertyMarker(property, false, 32);
            activeMarkerRef.current.setIcon(normalIcon);
          }
        }
        
        // Close the info window after a short delay
        infoWindowTimeoutRef.current = window.setTimeout(() => {
          if (activeMarkerRef.current) {
            infoWindow.close();
            activeMarkerRef.current = null;
          }
        }, 100);
      });
    };
    
    // Fit map to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      mapInstance.fitBounds(bounds);
      
      // Don't zoom in too far
      const listener = google.maps.event.addListener(mapInstance, 'idle', () => {
        if (mapInstance.getZoom()! > 16) {
          mapInstance.setZoom(16);
        }
        google.maps.event.removeListener(listener);
      });
    }
    
    // Log property type statistics
    const typeStats = properties.reduce((stats, property) => {
      const propertyInfo = detectPropertyType(property);
      stats[propertyInfo.type] = (stats[propertyInfo.type] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    console.log('Property type distribution:', typeStats);
    
    // Cleanup function
    return () => {
      // Cleanup markers when component unmounts or properties change
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
      
      // Clear any pending timeouts
      if (infoWindowTimeoutRef.current) {
        clearTimeout(infoWindowTimeoutRef.current);
      }
    };
  }, [isLoaded, mapInstance, infoWindow, properties, navigate]);

  // Cleanup marker cache on unmount
  useEffect(() => {
    return () => {
      markerIconCache.clear();
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      {/* Property Type Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border/20">
        <h3 className="text-sm font-semibold mb-2 text-foreground">Property Types</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-muted-foreground">Residential</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">Commercial</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-muted-foreground">Land</span>
          </div>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={13}
        onLoad={onMapLoad}
        options={{
          fullscreenControl: true,
          mapTypeControl: true,
          streetViewControl: false,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        }}
      />
    </Card>
  );
};