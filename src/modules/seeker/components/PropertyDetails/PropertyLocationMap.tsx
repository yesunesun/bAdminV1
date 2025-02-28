// src/modules/seeker/components/PropertyDetails/PropertyLocationMap.tsx
// Version: 1.2.0
// Last Modified: 01-03-2025 20:30 IST
// Purpose: Google Maps component with environment variable fix

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapIcon, NavigationIcon, RefreshCcwIcon, AlertCircleIcon } from 'lucide-react';

interface PropertyLocationMapProps {
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  coordinates?: { lat: number; lng: number };
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  address,
  city,
  state,
  zipCode,
  coordinates
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingUserLocation, setIsLoadingUserLocation] = useState(false);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [mapInitAttempts, setMapInitAttempts] = useState(0);

  // Format the full address string
  const fullAddress = [address, city, state, zipCode].filter(Boolean).join(', ');
  
  // Initialize Google Maps
  useEffect(() => {
    // Check if the API key is available
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      console.error("Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_KEY to your environment variables.");
      setError("Google Maps API key is missing. Please contact the administrator.");
      return;
    }
    
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
      console.log("Loading Google Maps API...");
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API loaded successfully");
        setIsGoogleMapsLoaded(true);
      };
      script.onerror = (e) => {
        console.error("Error loading Google Maps API:", e);
        setError("Failed to load Google Maps. Please refresh the page or try again later.");
      };
      document.head.appendChild(script);
      return;
    } else {
      console.log("Google Maps API already loaded");
      setIsGoogleMapsLoaded(true);
    }
  }, []);

  // Initialize map after Google Maps is loaded
  useEffect(() => {
    if (!isGoogleMapsLoaded || isMapInitialized) return;
    
    const initMap = async () => {
      // Check if the map container is available
      if (!mapContainerRef.current) {
        console.error("Map container not found");
        if (mapInitAttempts < 3) {
          // Retry initialization after a delay
          setTimeout(() => {
            setMapInitAttempts(prev => prev + 1);
          }, 500);
        } else {
          setError("Map container not found. Please refresh the page.");
        }
        return;
      }
      
      try {
        setError(null);
        console.log("Initializing map with address:", fullAddress);
        
        // Use default coordinates for development/testing if needed
        let propertyCoordinates = coordinates;
        
        if (!propertyCoordinates) {
          try {
            propertyCoordinates = await geocodeAddress(fullAddress);
          } catch (geocodeError) {
            console.error("Geocoding error:", geocodeError);
            // Use a default location (Hyderabad, India) if geocoding fails
            propertyCoordinates = { lat: 17.4065, lng: 78.4772 };
            setError("Could not find the exact property location. Showing approximate area.");
          }
        }
        
        if (!propertyCoordinates) {
          setError("Could not determine the property location on the map");
          return;
        }

        console.log("Creating map with coordinates:", propertyCoordinates);
        
        // Create map instance with explicit dimensions
        const mapContainer = mapContainerRef.current;
        mapContainer.style.width = '100%';
        mapContainer.style.height = '400px';
        
        const mapInstance = new google.maps.Map(mapContainer, {
          center: propertyCoordinates,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });

        // Force a resize event to ensure the map renders correctly
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 100);

        // Create marker
        const markerInstance = new google.maps.Marker({
          position: propertyCoordinates,
          map: mapInstance,
          title: fullAddress,
          animation: google.maps.Animation.DROP
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `<div style="padding: 8px"><strong>${fullAddress}</strong></div>`
        });

        // Add click listener to marker
        markerInstance.addListener('click', () => {
          infoWindow.open(mapInstance, markerInstance);
        });

        // Initialize directions service and renderer
        const directionsServiceInstance = new google.maps.DirectionsService();
        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#4A90E2',
            strokeWeight: 6,
            strokeOpacity: 0.8
          }
        });

        setMap(mapInstance);
        setMarker(markerInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);
        setIsMapInitialized(true);

        // Open info window by default
        infoWindow.open(mapInstance, markerInstance);
        
        console.log("Map initialized successfully");
      } catch (error) {
        console.error('Error initializing map:', error);
        setError('Could not load the map. Please try again later.');
      }
    };

    initMap();
  }, [isGoogleMapsLoaded, fullAddress, coordinates, mapInitAttempts, isMapInitialized]);

  // Geocode address to get coordinates
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    if (!address || !isGoogleMapsLoaded) return null;

    try {
      const geocoder = new google.maps.Geocoder();
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
            const location = results[0].geometry.location;
            resolve({ lat: location.lat(), lng: location.lng() });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!isGoogleMapsLoaded) return;
    
    setIsLoadingUserLocation(true);
    setError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);
          setIsLoadingUserLocation(false);
          
          // If we have property coordinates, calculate directions
          if (map && marker && directionsService && directionsRenderer) {
            calculateDirections(userCoords);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Could not access your location. Please check your browser permissions.');
          setIsLoadingUserLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLoadingUserLocation(false);
    }
  }, [map, marker, directionsService, directionsRenderer, isGoogleMapsLoaded]);

  // Calculate directions between two points
  const calculateDirections = useCallback((startLocation: { lat: number; lng: number }) => {
    if (!map || !marker || !directionsService || !directionsRenderer || !isGoogleMapsLoaded) return;

    const destination = marker.getPosition();
    if (!destination) return;

    const request: google.maps.DirectionsRequest = {
      origin: startLocation,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRenderer.setDirections(result);
        
        // Center the map to show both points
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(startLocation);
        bounds.extend(destination);
        map.fitBounds(bounds);
      } else {
        setError('Could not calculate directions. Please try again.');
        console.error('Directions request failed with status:', status);
      }
    });
  }, [map, marker, directionsService, directionsRenderer, isGoogleMapsLoaded]);

  // Reset the map to original state
  const resetMap = useCallback(() => {
    if (!map || !marker || !isGoogleMapsLoaded) return;
    
    // Clear directions
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      directionsRenderer.setMap(map);
    }
    
    // Center on property
    const position = marker.getPosition();
    if (position) {
      map.setCenter(position);
      map.setZoom(15);
    }
  }, [map, marker, directionsRenderer, isGoogleMapsLoaded]);

  // Open Google Maps directions in a new tab
  const openGoogleMapsDirections = useCallback(() => {
    if (!marker || !isGoogleMapsLoaded) return;
    
    const position = marker.getPosition();
    if (!position) return;
    
    const destinationStr = `${position.lat()},${position.lng()}`;
    const originStr = userLocation ? `${userLocation.lat},${userLocation.lng}` : 'current+location';
    
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}&travelmode=driving`,
      '_blank'
    );
  }, [marker, userLocation, isGoogleMapsLoaded]);

  // Helper function to check map loading status
  const getMapStatus = () => {
    if (!isGoogleMapsLoaded) return "Google Maps API is loading...";
    if (!isMapInitialized) return "Map is initializing...";
    if (!map) return "Map instance not created";
    return "Map is ready";
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapIcon className="h-5 w-5" />
          Property Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm flex items-start gap-2">
            <AlertCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {!isGoogleMapsLoaded && (
          <div className="w-full h-80 md:h-96 flex items-center justify-center bg-muted/20 rounded-md border border-border">
            <div className="text-center p-4">
              <RefreshCcwIcon className="h-10 w-10 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading Google Maps...</p>
            </div>
          </div>
        )}
        
        <div 
          ref={mapContainerRef}
          id="property-map" 
          className="w-full h-80 md:h-96 rounded-md overflow-hidden border border-border"
          aria-label="Map showing property location"
          style={{ display: isGoogleMapsLoaded ? 'block' : 'none' }}
        ></div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={getUserLocation} 
            variant="outline" 
            className="flex-1"
            disabled={isLoadingUserLocation || !isMapInitialized}
          >
            {isLoadingUserLocation ? (
              <>
                <RefreshCcwIcon className="h-4 w-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <NavigationIcon className="h-4 w-4 mr-2" />
                Directions from My Location
              </>
            )}
          </Button>
          
          {userLocation && (
            <>
              <Button 
                onClick={resetMap} 
                variant="secondary" 
                size="icon" 
                title="Reset Map"
                disabled={!isMapInitialized}
              >
                <RefreshCcwIcon className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={openGoogleMapsDirections} 
                variant="secondary" 
                title="Open in Google Maps"
                disabled={!isMapInitialized}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Open in Google Maps
              </Button>
            </>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mt-4">
          {fullAddress}
        </p>
        
        {import.meta.env.DEV && !isMapInitialized && (
          <div className="mt-4 p-3 bg-muted text-muted-foreground text-xs rounded">
            <p>Debug Info:</p>
            <p>Map Status: {getMapStatus()}</p>
            <p>Container Ref: {mapContainerRef.current ? 'Available' : 'Not available'}</p>
            <p>Init Attempts: {mapInitAttempts}</p>
            <p>API Key: {import.meta.env.VITE_GOOGLE_MAPS_KEY ? 'Available' : 'Missing'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyLocationMap;