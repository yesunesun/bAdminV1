// src/modules/admin/pages/PropertyMapView/components/MapContainer.tsx
// Version: 1.2.0
// Last Modified: 01-03-2025 13:45 IST
// Purpose: Fixed infinite re-render issue with markers

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Marker icons by property type
const markerIcons = {
  residential: {
    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    scaledSize: { width: 32, height: 32 }
  },
  commercial: {
    url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    scaledSize: { width: 32, height: 32 }
  },
  land: {
    url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    scaledSize: { width: 32, height: 32 }
  },
  default: {
    url: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
    scaledSize: { width: 32, height: 32 }
  }
};

// Get marker icon based on property type
const getMarkerIcon = (property: PropertyWithImages) => {
  const propertyType = property.property_details?.propertyType?.toLowerCase() || '';
  
  if (propertyType.includes('residential') || propertyType.includes('house') || propertyType.includes('apartment')) {
    return markerIcons.residential;
  } else if (propertyType.includes('commercial') || propertyType.includes('office') || propertyType.includes('shop')) {
    return markerIcons.commercial;
  } else if (propertyType.includes('land') || propertyType.includes('plot')) {
    return markerIcons.land;
  }
  
  return markerIcons.default;
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
  // Use useRef instead of useState for markers to prevent re-renders
  const markersRef = useRef<google.maps.Marker[]>([]);
  
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
      
      // Create marker with custom icon based on property type
      const marker = new google.maps.Marker({
        position,
        map: mapInstance,
        title: property.title,
        icon: {
          url: getMarkerIcon(property).url,
          scaledSize: new google.maps.Size(
            getMarkerIcon(property).scaledSize.width,
            getMarkerIcon(property).scaledSize.height
          )
        },
        animation: google.maps.Animation.DROP
      });
      
      // Create info window content
      const content = createInfoWindowContent(property);
      
      // Add mouseover event listener to show info window
      marker.addListener('mouseover', () => {
        infoWindow.setContent(content);
        infoWindow.open(mapInstance, marker);
        
        // Add event listener to the button after the info window is opened
        setTimeout(() => {
          const button = document.getElementById('viewDetailsBtn');
          if (button) {
            button.addEventListener('click', () => {
              navigate(`/admin/properties/${property.id}`);
            });
          }
        }, 10);
      });
      
      // Add mouseout event listener to close info window
      marker.addListener('mouseout', () => {
        // Add a small delay to allow clicking the button
        setTimeout(() => {
          // Only close if mouse isn't over the infowindow
          if (!isMouseOverInfoWindow()) {
            infoWindow.close();
          }
        }, 200);
      });
      
      // Add click listener to navigate to property details
      marker.addListener('click', () => {
        navigate(`/admin/properties/${property.id}`);
      });
      
      return marker;
    });
    
    // Store markers in ref instead of state
    markersRef.current = newMarkers;
    
    // Function to check if mouse is over info window
    function isMouseOverInfoWindow() {
      const infoWindowElement = document.querySelector('.gm-style-iw-a');
      if (!infoWindowElement) return false;
      
      const rect = infoWindowElement.getBoundingClientRect();
      const mouseX = event?.clientX || 0;
      const mouseY = event?.clientY || 0;
      
      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      );
    }
    
    // Add listener to info window container to prevent closing on mouseout
    setTimeout(() => {
      const infoWindowElement = document.querySelector('.gm-style-iw-a');
      if (infoWindowElement) {
        infoWindowElement.addEventListener('mouseenter', () => {
          // Keep info window open while mouse is over it
          clearTimeout(infoWindow.timeout);
        });
        
        infoWindowElement.addEventListener('mouseleave', () => {
          infoWindow.close();
        });
      }
    }, 100);
    
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
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
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
          // Only hide POI labels, not the map itself
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