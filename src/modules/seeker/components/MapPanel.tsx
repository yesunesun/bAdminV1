// src/modules/seeker/components/MapPanel.tsx
// Version: 5.0.0
// Last Modified: 08-01-2025 22:15 IST
// Purpose: Simplified coordinate handling - relies only on get_latest_properties output

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { GoogleMap, InfoWindow } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Property } from '@/modules/owner/components/property/types';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Building2, Trees } from 'lucide-react';
import { 
  detectPropertyType, 
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
  properties: Property[];
  isLoaded: boolean;
  loadError: Error | null;
  activeProperty: Property | null;
  setActiveProperty: (property: Property | null) => void;
  hoveredPropertyId: string | null;
}

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  isLoaded,
  loadError,
  activeProperty,
  setActiveProperty,
  hoveredPropertyId,
}) => {
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [visiblePropertiesCount, setVisiblePropertiesCount] = useState<number>(0);
  const [totalMarkersCreated, setTotalMarkersCreated] = useState<number>(0);
  const [propertyTypeCounts, setPropertyTypeCounts] = useState({
    residential: 0,
    commercial: 0,
    land: 0
  });
  
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || process.env.NODE_ENV === 'development';
  
  // Ref to store marker instances for cleanup
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Simplified coordinate extraction - uses only database output
  const getPropertyCoordinates = useCallback((property: Property) => {
    try {
      console.log(`🔍 Getting coordinates for property ${property.id}`);
      
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
          
          console.log(`✅ Valid coordinates from database: ${latitude}, ${longitude}`);
          return { lat: latitude, lng: longitude };
        }
      }
      
      console.log(`❌ No valid coordinates for property ${property.id} - skipping marker creation`);
      return null;
    } catch (error) {
      console.error(`❌ Error getting coordinates for property ${property.id}:`, error);
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

  // Navigate to property detail page
  const handlePropertyClick = useCallback((property: Property) => {
    navigate(`/properties/${property.id}`);
  }, [navigate]);

  // Update visible properties count
  const updateVisiblePropertiesCount = useCallback(() => {
    if (!map || !isLoaded) return;

    try {
      const bounds = map.getBounds();
      if (!bounds) {
        setVisiblePropertiesCount(propertiesWithCoordinates().length);
        return;
      }

      let visibleCount = 0;
      const typeCounts = { residential: 0, commercial: 0, land: 0 };
      
      propertiesWithCoordinates().forEach(property => {
        const coords = getPropertyCoordinates(property);
        if (coords) {
          const position = new google.maps.LatLng(coords.lat, coords.lng);
          
          if (bounds.contains(position)) {
            visibleCount++;
            const propertyInfo = detectPropertyType(property);
            typeCounts[propertyInfo.type]++;
          }
        }
      });

      setVisiblePropertiesCount(visibleCount);
      setPropertyTypeCounts(typeCounts);
      console.log(`📊 Visible properties in viewport: ${visibleCount} of ${propertiesWithCoordinates().length}`, typeCounts);
    } catch (error) {
      console.error('Error updating visible properties count:', error);
      setVisiblePropertiesCount(propertiesWithCoordinates().length);
    }
  }, [map, isLoaded, propertiesWithCoordinates, getPropertyCoordinates]);

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
        console.log(`📍 Panning to property ${propertyId} at ${coords.lat}, ${coords.lng}`);
        
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
      console.error('Error panning to property:', error);
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
    console.log('🗺️ Map loaded successfully');
    setMap(map);
    setMapReady(true);
    
    // Add bounds event listener to update visible count
    map.addListener('bounds_changed', updateVisiblePropertiesCount);
    map.addListener('zoom_changed', updateVisiblePropertiesCount);
    
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
        
        console.log(`🎯 Setting map bounds for ${validPoints} properties with valid coordinates`);
        
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
            
            // Update visible count after setting bounds
            setTimeout(updateVisiblePropertiesCount, 500);
          }, 100);
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
        map.setCenter(DEFAULT_MAP_CENTER);
        map.setZoom(14);
      }
    } else {
      console.log('No properties with valid coordinates found, using default center');
      map.setCenter(DEFAULT_MAP_CENTER);
      map.setZoom(14);
    }
  }, [propertiesWithCoordinates, updateVisiblePropertiesCount, getPropertyCoordinates]);

  // Create markers only for properties with valid coordinates
  useEffect(() => {
    if (isLoaded && mapReady && map) {
      const validProperties = propertiesWithCoordinates();
      console.log(`🚀 Creating markers for ${validProperties.length} properties with valid coordinates out of ${properties.length} total`);
      
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
            title: property.title || `Property ${property.id}`,
            icon: markerIcon,
            animation: isHovered || isActive ? google.maps.Animation.BOUNCE : undefined,
            zIndex: isHovered || isActive ? 1000 : 1
          });
          
          // Add click listener
          marker.addListener('click', () => {
            setActiveProperty(property);
          });
          
          newMarkers.push(marker);
          console.log(`✅ Created marker ${index + 1}/${validProperties.length} for property ${property.id} at ${coords.lat}, ${coords.lng}`);
          
        } catch (error) {
          console.error(`❌ Failed to create marker for property ${property.id}:`, error);
        }
      });
      
      markersRef.current = newMarkers;
      setTotalMarkersCreated(newMarkers.length);
      
      // Update visible count after a short delay to ensure map is ready
      setTimeout(updateVisiblePropertiesCount, 300);
      
      console.log(`📊 Marker creation complete:`);
      console.log(`   - Total properties: ${properties.length}`);
      console.log(`   - Properties with valid coordinates: ${validProperties.length}`);
      console.log(`   - Markers created: ${newMarkers.length}`);
    }
    
    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, [properties, isLoaded, mapReady, map, hoveredPropertyId, activeProperty, updateVisiblePropertiesCount, propertiesWithCoordinates, getPropertyCoordinates]);

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
      {/* Enhanced Property Count Indicator - Only visible in development mode */}
      {isDevelopment && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/20">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {visiblePropertiesCount} of {propertiesWithCoordinates().length} properties
            </span>
          </div>
          
          {/* Debug info */}
          <div className="text-xs text-muted-foreground mb-2">
            Markers: {totalMarkersCreated}/{propertiesWithCoordinates().length}
          </div>
          
          <div className="text-xs text-muted-foreground mb-2">
            Total properties: {properties.length}
          </div>
          
          <div className="text-xs text-muted-foreground mb-2">
            With coordinates: {propertiesWithCoordinates().length}
          </div>
          
          {/* Property Type Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <Home className="h-3 w-3 text-blue-600" />
              <span className="text-muted-foreground">Residential: {propertyTypeCounts.residential}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <Building2 className="h-3 w-3 text-green-600" />
              <span className="text-muted-foreground">Commercial: {propertyTypeCounts.commercial}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <Trees className="h-3 w-3 text-orange-600" />
              <span className="text-muted-foreground">Land: {propertyTypeCounts.land}</span>
            </div>
          </div>
          
          {/* Development mode indicator */}
          <div className="mt-2 pt-2 border-t border-border/20">
            <div className="text-xs text-orange-600 font-medium">
              🔧 DEV MODE
            </div>
          </div>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_MAP_CENTER}
        zoom={14}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* Info Window for Active Property */}
        {activeProperty && (() => {
          const coords = getPropertyCoordinates(activeProperty);
          if (!coords) return null;
          
          return (
            <InfoWindow
              position={{ lat: coords.lat, lng: coords.lng }}
              onCloseClick={() => setActiveProperty(null)}
            >
              <div className="p-3 max-w-xs">
                <div className="flex items-start gap-3 mb-3">
                  {/* Property Type Icon */}
                  <div className="flex-shrink-0">
                    {(() => {
                      const propertyInfo = detectPropertyType(activeProperty);
                      switch (propertyInfo.type) {
                        case 'residential':
                          return <Home className="h-5 w-5 text-blue-600" />;
                        case 'commercial':
                          return <Building2 className="h-5 w-5 text-green-600" />;
                        case 'land':
                          return <Trees className="h-5 w-5 text-orange-600" />;
                        default:
                          return <Home className="h-5 w-5 text-blue-600" />;
                      }
                    })()}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1 text-foreground line-clamp-2">
                      {activeProperty.title || 'Property'}
                    </h3>
                    <div className="text-xs text-muted-foreground capitalize">
                      {(() => {
                        const propertyInfo = detectPropertyType(activeProperty);
                        return `${propertyInfo.type} • ${propertyInfo.subtype}`;
                      })()}
                    </div>
                  </div>
                </div>
                
                <div className="mb-3 text-xs text-muted-foreground">
                  {activeProperty.property_details?.price && (
                    <span className="font-bold text-primary text-sm">
                      ₹{activeProperty.property_details.price}
                    </span>
                  )}
                  {activeProperty.property_details?.location && (
                    <div className="mt-1 flex items-center">
                      <span className="truncate">{activeProperty.property_details.location}</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  className="text-xs h-8 w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handlePropertyClick(activeProperty)}
                >
                  View Details
                </Button>
              </div>
            </InfoWindow>
          );
        })()}
      </GoogleMap>
    </div>
  );
};

export default MapPanel;
// End of file