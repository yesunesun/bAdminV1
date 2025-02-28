// src/modules/admin/pages/PropertyMapView/components/MapContainer.tsx
// Version: 2.1.0
// Last Modified: 01-03-2025 22:00 IST
// Purpose: Fixed inconsistent info window behavior on mouseover

import React, { useEffect, useRef } from 'react';
import { GoogleMap } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { PropertyWithImages, getPropertyPosition } from '../services/propertyMapService';
import { createInfoWindowContent } from './InfoWindowContent';
import { defaultCenter } from '../hooks/useGoogleMaps';

// Map container style
const containerStyle = {
  width: '100%',
  height: 'calc(100vh - 172px)'
};

// Simple colored marker URLs from Google Maps
const markerPins = {
  residential: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  apartment: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  commercial: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  land: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  office: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  shop: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  default: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
};

// Get marker pin URL based on property type
const getMarkerPin = (property: PropertyWithImages) => {
  const propertyType = property.property_details?.propertyType?.toLowerCase() || '';
  
  if (propertyType.includes('apartment')) {
    return markerPins.apartment;
  } else if (propertyType.includes('residential') || propertyType.includes('house')) {
    return markerPins.residential;
  } else if (propertyType.includes('office')) {
    return markerPins.office;
  } else if (propertyType.includes('shop') || propertyType.includes('retail')) {
    return markerPins.shop;
  } else if (propertyType.includes('commercial')) {
    return markerPins.commercial;
  } else if (propertyType.includes('land') || propertyType.includes('plot')) {
    return markerPins.land;
  }
  
  return markerPins.default;
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
    
    // Create new markers
    const newMarkers = properties.map(property => {
      const position = getPropertyPosition(property, defaultCenter);
      const markerUrl = getMarkerPin(property);
      
      // Create marker with colored pin
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: property.title,
        icon: {
          url: markerUrl,
          scaledSize: new google.maps.Size(32, 32)
        },
        animation: google.maps.Animation.DROP
      });
      
      // Create info window content with property image and details
      const content = createInfoWindowContent(property);
      
      // Add mouseover event listener to show info window
      marker.addListener('mouseover', () => {
        if (infoWindowTimeoutRef.current) {
          clearTimeout(infoWindowTimeoutRef.current);
          infoWindowTimeoutRef.current = null;
        }
        
        // Close any open info window first
        infoWindow.close();
        
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
      
      // Add mouseout event listener to close info window
      marker.addListener('mouseout', () => {
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

  return (
    <Card className="overflow-hidden">
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