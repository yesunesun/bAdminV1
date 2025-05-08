// src/modules/seeker/components/PropertyDetails/PropertyLocationMap.tsx
// Version: 8.3.0
// Last Modified: 09-05-2025 16:30 IST
// Purpose: Fixed React DOM error with proper cleanup of Google Maps instance

import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

interface Coordinates {
  lat: number;
  lng: number;
}

interface PropertyLocationMapProps {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  coordinates?: Coordinates | null;
  fallbackCoordinates?: Coordinates;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  address,
  city,
  state,
  zipCode,
  coordinates,
  fallbackCoordinates
}) => {
  // Use coordinates, fallback, or default in that order
  const defaultCoordinates = { lat: 17.385044, lng: 78.486671 };
  const mapCoordinates = coordinates || fallbackCoordinates || defaultCoordinates;
  
  // Use refs instead of state to avoid DOM manipulation issues
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Get Google Maps loading state
  const { isLoaded, loadError } = useGoogleMaps();
  
  // Format the full address
  const formattedAddress = [address, city, state, zipCode].filter(Boolean).join(', ');
  
  // Initialize Google Maps when the API is loaded
  useEffect(() => {
    // Return early if Google Maps hasn't loaded yet or we don't have a container
    if (!isLoaded || !mapContainerRef.current) return;
    
    console.log('Google Maps API loaded, initializing map with coordinates:', mapCoordinates);
    
    try {
      // Create the map
      const googleMap = new google.maps.Map(mapContainerRef.current, {
        center: mapCoordinates,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        scrollwheel: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });
      
      // Create a marker
      const mapMarker = new google.maps.Marker({
        position: mapCoordinates,
        map: googleMap,
        title: 'Property Location',
        animation: google.maps.Animation.DROP
      });
      
      // Create a simpler info window with just "Property Location" label
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <p class="font-medium text-base">Property Location</p>
            <p class="text-sm text-gray-500 mt-1">
              ${mapCoordinates.lat.toFixed(6)}, ${mapCoordinates.lng.toFixed(6)}
            </p>
          </div>
        `
      });
      
      // Open info window when marker is clicked
      mapMarker.addListener('click', () => {
        infoWindow.open(googleMap, mapMarker);
      });
      
      // Store references
      mapInstanceRef.current = googleMap;
      markerRef.current = mapMarker;
      infoWindowRef.current = infoWindow;
      
      console.log('Map and marker successfully initialized');
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
    
    // Cleanup function - properly dispose of Google Maps objects
    return () => {
      console.log('Cleaning up Google Maps resources');
      
      try {
        // Close info window if it exists
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        
        // Remove marker from map
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        
        // Clear all listeners and references
        google.maps.event.clearInstanceListeners(markerRef.current);
        google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        
        infoWindowRef.current = null;
        markerRef.current = null;
        mapInstanceRef.current = null;
      } catch (cleanupError) {
        console.error('Error during Google Maps cleanup:', cleanupError);
      }
    };
  }, [isLoaded, mapCoordinates]);
  
  // Open in Google Maps
  const openInGoogleMaps = () => {
    window.open(`https://www.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}`, '_blank');
  };
  
  // Get directions
  const getDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${mapCoordinates.lat},${mapCoordinates.lng}`, '_blank');
  };
  
  return (
    <div>
      {/* Google Maps Container */}
      <div 
        className="w-full h-[300px] bg-slate-100 relative rounded overflow-hidden border border-slate-200"
        ref={mapContainerRef}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-sm text-slate-600">Loading Google Maps...</p>
          </div>
        )}
        
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
            <div className="bg-white p-4 rounded-lg shadow-sm max-w-xs text-center">
              <MapPin className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="font-medium text-destructive">Failed to load Google Maps</p>
              <p className="text-sm text-slate-600 mt-1">We're unable to display the map at this time.</p>
              <div className="mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInGoogleMaps}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Google Maps
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Static Fallback - Used when Google Maps fails to load */}
        {loadError && (
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.5,
            zIndex: 0
          }}></div>
        )}
        
        {/* Location Pin - Fallback when Maps fails to load */}
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1, pointerEvents: 'none' }}>
            <div className="text-center">
              <div className="inline-block p-3 rounded-full bg-blue-100 mb-2">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div className="bg-white py-2 px-3 rounded shadow-sm">
                <p className="font-medium text-sm">Property Location</p>
                <p className="text-xs text-slate-600 mt-1">{mapCoordinates.lat.toFixed(6)}, {mapCoordinates.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons - Bottom right of the map */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
          <Button
            size="sm"
            className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm"
            onClick={getDirections}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
        </div>
      </div>
      
      {/* Coordinates Footer with both buttons */}
      <div className="flex items-center justify-between py-3 text-sm">
        <div>
          <span className="text-slate-600">Coordinates:</span>{" "}
          <span className="font-mono text-xs ml-1">
            {mapCoordinates.lat.toFixed(6)}, {mapCoordinates.lng.toFixed(6)}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getDirections}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Directions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={openInGoogleMaps}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in Maps
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocationMap;