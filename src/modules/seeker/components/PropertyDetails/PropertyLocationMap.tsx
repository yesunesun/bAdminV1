// src/modules/seeker/components/PropertyDetails/PropertyLocationMap.tsx
// Version: 20.0.0
// Last Modified: 27-05-2025 20:30 IST
// Purpose: Fixed marker styling and consistent map display with proper red/blue markers

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLinkIcon, Navigation, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatIndianCurrency } from '@/lib/utils';

interface NearbyProperty {
  id: string;
  title?: string;
  distance?: number;
  property_details?: {
    primaryImage?: string;
    flow?: {
      title?: string;
      price?: number;
    };
  };
  price?: number;
  city?: string;
}

interface CurrentProperty {
  id: string;
  title: string;
  coordinates: { lat: number; lng: number } | null;
}

interface PropertyLocationMapProps {
  coordinates?: {
    lat?: number | string;
    lng?: number | string;
    latitude?: number | string;
    longitude?: number | string;
  } | null;
  address?: string;
  locality?: string;
  city?: string;
  nearbyProperties?: NearbyProperty[];
  currentProperty?: CurrentProperty;
}

const PropertyLocationMap: React.FC<PropertyLocationMapProps> = ({
  coordinates,
  address,
  locality,
  city,
  nearbyProperties = [],
  currentProperty
}) => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // Get location string for display and URLs
  const getLocationString = () => {
    let locationString = "";
    if (address) locationString = address;
    if (!locationString && locality) locationString = locality;
    if (!locationString && city) locationString = city;
    if (!locationString) locationString = "Hyderabad, Telangana";
    
    return locationString;
  };
  
  // Extract coordinates for map URLs
  const getCoordinatesString = () => {
    if (coordinates) {
      const lat = coordinates.lat || coordinates.latitude;
      const lng = coordinates.lng || coordinates.longitude;
      
      if (lat && lng) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        
        if (!isNaN(numLat) && !isNaN(numLng)) {
          return `${numLat},${numLng}`;
        }
      }
    }
    
    return null;
  };

  // Get coordinates as numbers
  const getNumericCoordinates = () => {
    if (coordinates) {
      const lat = coordinates.lat || coordinates.latitude;
      const lng = coordinates.lng || coordinates.longitude;
      
      if (lat && lng) {
        const numLat = Number(lat);
        const numLng = Number(lng);
        
        if (!isNaN(numLat) && !isNaN(numLng)) {
          return { lat: numLat, lng: numLng };
        }
      }
    }
    
    return null;
  };
  
  // Check if Google Maps API is loaded
  const checkGoogleMapsAPI = () => {
    return !!(
      typeof google !== 'undefined' && 
      google.maps && 
      google.maps.Map &&
      google.maps.Marker &&
      google.maps.InfoWindow
    );
  };

  // Load Google Maps API if not already loaded
  const loadGoogleMapsAPI = async (): Promise<boolean> => {
    if (checkGoogleMapsAPI()) {
      return true;
    }

    const googleMapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!googleMapsKey) {
      console.error('[PropertyLocationMap] Google Maps API key not configured');
      return false;
    }

    return new Promise((resolve) => {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for existing script to load
        const checkInterval = setInterval(() => {
          if (checkGoogleMapsAPI()) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 10000);
        
        return;
      }

      // Create and load the script
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsKey}&libraries=places&callback=initGoogleMapsForPropertyMap`;

      // Global callback function
      (window as any).initGoogleMapsForPropertyMap = () => {
        console.log('[PropertyLocationMap] Google Maps API loaded successfully');
        resolve(true);
        delete (window as any).initGoogleMapsForPropertyMap;
      };

      script.onerror = () => {
        console.error('[PropertyLocationMap] Failed to load Google Maps API');
        resolve(false);
      };

      document.head.appendChild(script);

      // Timeout fallback
      setTimeout(() => {
        if (!checkGoogleMapsAPI()) {
          console.error('[PropertyLocationMap] Timeout loading Google Maps API');
          resolve(false);
        }
      }, 10000);
    });
  };

  // Clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current = [];
  };

  // Create standard Google Maps style markers
  const createMarkerIcon = (color: 'red' | 'blue', isLarge: boolean = false) => {
    const size = isLarge ? 40 : 32;
    const anchorPoint = size / 2;
    
    return {
      url: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
      scaledSize: new google.maps.Size(size, size),
      anchor: new google.maps.Point(anchorPoint / 2, size),
      origin: new google.maps.Point(0, 0)
    };
  };

  // Create info window content for a property
  const createInfoWindowContent = (property: NearbyProperty | CurrentProperty, isCurrent = false) => {
    const title = property.title || 'Property';
    const price = isCurrent ? 0 : (property as NearbyProperty).property_details?.flow?.price || (property as NearbyProperty).price || 0;
    const distance = isCurrent ? '' : (property as NearbyProperty).distance ? `${(property as NearbyProperty).distance}km away` : '';
    const image = isCurrent ? '/noimage.png' : (property as NearbyProperty).property_details?.primaryImage || '/noimage.png';
    
    return `
      <div class="p-3 max-w-xs" style="font-family: Arial, sans-serif;">
        <div class="mb-2">
          <img src="${image}" alt="${title}" style="width: 100%; height: 96px; object-fit: cover; border-radius: 4px;" onerror="this.src='/noimage.png';" />
        </div>
        <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${title}</h3>
        ${price > 0 ? `<p style="color: #2563eb; font-weight: bold; font-size: 14px; margin: 4px 0;">${formatIndianCurrency(price)}</p>` : ''}
        ${distance ? `<p style="color: #6b7280; font-size: 12px; margin: 2px 0;">${distance}</p>` : ''}
        ${isCurrent ? '<p style="color: #dc2626; font-size: 12px; font-weight: 500; margin: 4px 0;">Current Property</p>' : ''}
        ${!isCurrent ? `<button onclick="window.navigateToProperty('${property.id}')" style="margin-top: 8px; background-color: #2563eb; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; border: none; cursor: pointer; transition: background-color 0.2s;" onmouseover="this.style.backgroundColor='#1d4ed8'" onmouseout="this.style.backgroundColor='#2563eb'">View Details</button>` : ''}
      </div>
    `;
  };

  // Initialize the interactive Google Map
  const initializeInteractiveMap = (coords: { lat: number; lng: number }) => {
    if (!mapRef.current || !checkGoogleMapsAPI()) return;

    // Create the map with similar styling to the original iframe
    const map = new google.maps.Map(mapRef.current, {
      center: coords,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: true,
      styles: [
        // Optional: Add subtle styling to match the original look
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    googleMapRef.current = map;

    // Create info window
    infoWindowRef.current = new google.maps.InfoWindow();

    // Add current property marker (red - larger)
    if (currentProperty?.coordinates) {
      const currentMarker = new google.maps.Marker({
        position: currentProperty.coordinates,
        map: map,
        title: currentProperty.title,
        icon: createMarkerIcon('red', true), // Larger red marker for current property
        zIndex: 1000 // Ensure current property marker is on top
      });

      currentMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent(currentProperty, true));
          infoWindowRef.current.open(map, currentMarker);
        }
      });

      markersRef.current.push(currentMarker);
    }

    // Add nearby property markers (blue - smaller)
    nearbyProperties.forEach((property) => {
      // Extract coordinates from the property
      let propCoords = null;
      
      if (property.property_details) {
        const details = property.property_details as any;
        if (details.steps) {
          // Find location step with coordinates
          for (const [stepId, stepData] of Object.entries(details.steps)) {
            if (stepId.includes('location') && stepData && typeof stepData === 'object') {
              const locationData = stepData as any;
              if (locationData.latitude && locationData.longitude) {
                propCoords = {
                  lat: parseFloat(locationData.latitude),
                  lng: parseFloat(locationData.longitude)
                };
                break;
              }
            }
          }
        }
      }

      if (!propCoords) return; // Skip if no coordinates

      const marker = new google.maps.Marker({
        position: propCoords,
        map: map,
        title: property.title || 'Nearby Property',
        icon: createMarkerIcon('blue', false), // Smaller blue marker for nearby properties
        zIndex: 100
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent(property));
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Adjust map bounds to fit all markers
    if (markersRef.current.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds);
      
      // Ensure minimum zoom level
      google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom()! > 16) {
          map.setZoom(16);
        }
      });
    }
  };

  // Setup global navigation function
  useEffect(() => {
    (window as any).navigateToProperty = (propertyId: string) => {
      navigate(`/property/${propertyId}`);
    };

    return () => {
      delete (window as any).navigateToProperty;
    };
  }, [navigate]);

  // Handle nearby properties - only load interactive map when needed
  useEffect(() => {
    const shouldShowInteractiveMap = nearbyProperties.length > 0;
    
    if (shouldShowInteractiveMap && !showInteractiveMap) {
      // Need to switch to interactive map
      const initMap = async () => {
        const coords = getNumericCoordinates();
        if (!coords) return;

        // Load Google Maps API if needed
        const loaded = await loadGoogleMapsAPI();
        if (!loaded) {
          console.error('[PropertyLocationMap] Failed to load Google Maps API');
          return;
        }

        setIsGoogleMapsLoaded(true);
        setShowInteractiveMap(true);
        
        // Wait a bit for the DOM to update
        setTimeout(() => {
          clearMarkers();
          initializeInteractiveMap(coords);
        }, 100);
      };

      initMap();
    } else if (!shouldShowInteractiveMap && showInteractiveMap) {
      // Switch back to iframe
      setShowInteractiveMap(false);
      clearMarkers();
    } else if (shouldShowInteractiveMap && showInteractiveMap && isGoogleMapsLoaded) {
      // Update existing interactive map
      const coords = getNumericCoordinates();
      if (coords) {
        clearMarkers();
        initializeInteractiveMap(coords);
      }
    }
  }, [nearbyProperties, currentProperty]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, []);
  
  // Get embed iframe URL
  const getMapSrc = () => {
    const coordsString = getCoordinatesString();
    
    // If we have valid coordinates, use them (most accurate)
    if (coordsString) {
      return `https://maps.google.com/maps?q=${coordsString}&z=15&output=embed`;
    }
    
    // Otherwise use the address or location
    return `https://maps.google.com/maps?q=${encodeURIComponent(getLocationString())}&output=embed`;
  };
  
  // Get URL for "Open in Google Maps" button
  const getViewMapUrl = () => {
    const coordsString = getCoordinatesString();
    
    // If we have valid coordinates, use them
    if (coordsString) {
      return `https://maps.google.com/maps?q=${coordsString}`;
    }
    
    // Otherwise use the address or location
    return `https://maps.google.com/maps?q=${encodeURIComponent(getLocationString())}`;
  };
  
  // Get URL for "Get Directions" button
  const getDirectionsUrl = () => {
    const coordsString = getCoordinatesString();
    
    // If we have valid coordinates, use them as destination
    if (coordsString) {
      return `https://maps.google.com/maps?daddr=${coordsString}&dirflg=d`;
    }
    
    // Otherwise use the address or location
    return `https://maps.google.com/maps?daddr=${encodeURIComponent(getLocationString())}&dirflg=d`;
  };
  
  // Display coordinates if available
  const coordsString = getCoordinatesString();
  const hasCoordinates = !!coordsString;
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Map container */}
      <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 mb-3 relative">
        {showInteractiveMap && nearbyProperties.length > 0 ? (
          // Show interactive Google Map when nearby properties are displayed
          <>
            <div ref={mapRef} className="w-full h-full" />
            {!isGoogleMapsLoaded && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <div className="bg-white px-3 py-2 rounded-lg shadow-md text-sm">
                  Loading interactive map...
                </div>
              </div>
            )}
          </>
        ) : (
          // Show simple iframe embed (original behavior)
          <iframe
            src={getMapSrc()}
            title="Property Location"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        )}
      </div>
      
      {/* Map legend when showing nearby properties */}
      {nearbyProperties.length > 0 && showInteractiveMap && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2 px-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded-full border border-white shadow-sm"></div>
            <span>Current Property</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded-full border border-white shadow-sm"></div>
            <span>Nearby Properties ({nearbyProperties.length})</span>
          </div>
        </div>
      )}
      
      {/* Display coordinates if available */}
      {hasCoordinates && (
        <div className="text-xs text-slate-500 mb-2">
          {coordsString?.split(',')[0]}°N, {coordsString?.split(',')[1]}°E
        </div>
      )}
      
      {/* Action buttons - positioned below the map */}
      <div className="flex flex-wrap gap-2 justify-start mt-1">
        {/* View larger map button */}
        <Button
          variant="link"
          size="sm"
          onClick={() => window.open(getViewMapUrl(), '_blank')}
          className="h-8 px-0 text-primary flex items-center gap-1 hover:underline"
        >
          <span className="text-sm">View larger map</span>
        </Button>
        
        {/* Get Directions button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getDirectionsUrl(), '_blank')}
          className="h-8 bg-white border-primary text-primary hover:bg-primary/5 flex items-center gap-1"
        >
          <Navigation className="h-3.5 w-3.5" />
          <span className="text-sm">Get Directions</span>
        </Button>
        
        {/* Open in Maps button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getViewMapUrl(), '_blank')}
          className="h-8 bg-white border-primary text-primary hover:bg-primary/5 flex items-center gap-1"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          <span className="text-sm">Open in Maps</span>
        </Button>
      </div>
    </div>
  );
};

export default PropertyLocationMap;