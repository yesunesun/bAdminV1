// src/modules/seeker/components/MapPanel.tsx
// Version: 3.1.0
// Last Modified: 07-01-2025 16:45 IST
// Purpose: Enhanced map interactions with hover effects, property counter, and improved marker behavior

import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Property } from '@/modules/owner/components/property/types';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

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

  // Enhanced coordinate extraction with multiple fallback strategies
  const extractCoordinates = useCallback((property: Property) => {
    try {
      console.log(`Extracting coordinates for property ${property.id}`);
      
      // Strategy 1: Check direct coordinates field (from property_coordinates table)
      if (property.coordinates) {
        const lat = parseFloat(String(property.coordinates.latitude));
        const lng = parseFloat(String(property.coordinates.longitude));
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log(`✓ Found coordinates from coordinates table: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }
      
      // Strategy 2: Check property_details.coordinates
      if (property.property_details?.coordinates) {
        const coords = property.property_details.coordinates;
        if (typeof coords === 'object' && coords !== null) {
          if ('lat' in coords && 'lng' in coords) {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
                lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              console.log(`✓ Found coordinates from property_details.coordinates: ${lat}, ${lng}`);
              return { lat, lng };
            }
          }
        }
      }
      
      // Strategy 3: Check property_details.mapCoordinates
      if (property.property_details?.mapCoordinates) {
        const coords = property.property_details.mapCoordinates;
        if (typeof coords === 'object' && coords !== null) {
          if ('lat' in coords && 'lng' in coords) {
            const lat = parseFloat(String(coords.lat));
            const lng = parseFloat(String(coords.lng));
            
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
                lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              console.log(`✓ Found coordinates from property_details.mapCoordinates: ${lat}, ${lng}`);
              return { lat, lng };
            }
          }
        }
      }
      
      // Strategy 4: Check nested steps data for location information
      if (property.property_details?.steps) {
        const steps = property.property_details.steps;
        
        for (const [stepKey, stepData] of Object.entries(steps)) {
          if (typeof stepData === 'object' && stepData !== null && 
              (stepKey.includes('location') || stepKey.includes('Location'))) {
            
            if ('latitude' in stepData && 'longitude' in stepData) {
              const lat = parseFloat(String(stepData.latitude));
              const lng = parseFloat(String(stepData.longitude));
              
              if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
                  lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                console.log(`✓ Found coordinates from steps.${stepKey}: ${lat}, ${lng}`);
                return { lat, lng };
              }
            }
          }
        }
      }
      
      // Strategy 5: Generate predictable coordinates for Hyderabad area
      console.log(`⚠ No valid coordinates found for property ${property.id}, generating fallback coordinates`);
      
      const hash = property.id.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      const latOffset = (hash % 200) / 10000;
      const lngOffset = ((hash * 3) % 200) / 10000;
      
      const fallbackLat = DEFAULT_MAP_CENTER.lat + latOffset - 0.01;
      const fallbackLng = DEFAULT_MAP_CENTER.lng + lngOffset - 0.01;
      
      console.log(`Generated fallback coordinates for ${property.id}: ${fallbackLat}, ${fallbackLng}`);
      
      return {
        lat: fallbackLat,
        lng: fallbackLng
      };
      
    } catch (error) {
      console.error(`Error extracting coordinates for property ${property.id}:`, error);
      return DEFAULT_MAP_CENTER;
    }
  }, []);

  // Create custom marker icons for different states
  const createMarkerIcon = useCallback((isHovered: boolean, isActive: boolean) => {
    const scale = isHovered || isActive ? 1.6 : 1.3; // Increased base size and hover size
    const fillColor = isHovered || isActive ? '#3B82F6' : '#DC2626'; // Blue when hovered/active, dark red otherwise
    
    return {
      path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      fillColor: fillColor,
      fillOpacity: 0.9,
      strokeColor: '#FFFFFF',
      strokeWeight: 2,
      scale: scale,
      anchor: new google.maps.Point(12, 24), // Anchor at the bottom point of the pin
    };
  }, []);

  // Navigate to property detail page
  const handlePropertyClick = useCallback((property: Property) => {
    navigate(`/properties/${property.id}`);
  }, [navigate]);

  // Update visible properties count when map bounds change
  const updateVisiblePropertiesCount = useCallback(() => {
    if (!map || !isLoaded) return;

    try {
      const bounds = map.getBounds();
      if (!bounds) return;

      let visibleCount = 0;
      properties.forEach(property => {
        const coords = extractCoordinates(property);
        const position = new google.maps.LatLng(coords.lat, coords.lng);
        if (bounds.contains(position)) {
          visibleCount++;
        }
      });

      setVisiblePropertiesCount(visibleCount);
      console.log(`📊 Visible properties: ${visibleCount} of ${properties.length}`);
    } catch (error) {
      console.error('Error updating visible properties count:', error);
      setVisiblePropertiesCount(properties.length); // Fallback to total count
    }
  }, [map, isLoaded, properties, extractCoordinates]);

  // Auto-pan map to show hovered property marker
  const panToPropertyIfNeeded = useCallback((propertyId: string) => {
    if (!map || !isLoaded) return;

    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;

      const coords = extractCoordinates(property);
      const position = new google.maps.LatLng(coords.lat, coords.lng);
      const bounds = map.getBounds();

      // Check if marker is visible in current viewport
      if (!bounds || !bounds.contains(position)) {
        console.log(`📍 Panning to property ${propertyId} at ${coords.lat}, ${coords.lng}`);
        
        // Smoothly pan to the marker position
        map.panTo(position);
        
        // Optional: Adjust zoom if too far out
        const currentZoom = map.getZoom() || 11;
        if (currentZoom < 12) {
          setTimeout(() => {
            map.setZoom(13);
          }, 300); // Wait for pan to complete
        }
      }
    } catch (error) {
      console.error('Error panning to property:', error);
    }
  }, [map, isLoaded, properties, extractCoordinates]);

  // Watch for hoveredPropertyId changes and pan to marker if needed
  useEffect(() => {
    if (hoveredPropertyId) {
      panToPropertyIfNeeded(hoveredPropertyId);
    }
  }, [hoveredPropertyId, panToPropertyIfNeeded]);

  // Handle map load with enhanced styling and better zoom management
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded successfully');
    setMap(map);
    setMapReady(true);
    
    // Add bounds event listener to update visible count
    map.addListener('bounds_changed', updateVisiblePropertiesCount);
    map.addListener('zoom_changed', updateVisiblePropertiesCount);
    
    // Add bounds if we have properties
    if (properties.length > 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        let validPoints = 0;
        
        properties.forEach(property => {
          const coords = extractCoordinates(property);
          bounds.extend(coords);
          validPoints++;
        });
        
        if (validPoints > 0) {
          setTimeout(() => {
            if (validPoints === 1) {
              map.setCenter(extractCoordinates(properties[0]));
              map.setZoom(16);
            } else if (validPoints <= 3) {
              map.fitBounds(bounds);
              map.setZoom(Math.min(map.getZoom() || 14, 14));
            } else if (validPoints <= 10) {
              map.fitBounds(bounds);
              map.setZoom(Math.min(map.getZoom() || 13, 13));
            } else {
              map.fitBounds(bounds);
              const currentZoom = map.getZoom() || 11;
              map.setZoom(Math.max(Math.min(currentZoom, 12), 10));
            }
            
            // Update visible count after setting bounds
            setTimeout(updateVisiblePropertiesCount, 500);
          }, 100);
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
        map.setCenter(DEFAULT_MAP_CENTER);
        map.setZoom(11);
      }
    } else {
      map.setCenter(DEFAULT_MAP_CENTER);
      map.setZoom(11);
    }
  }, [properties, updateVisiblePropertiesCount, extractCoordinates]);

  // Update visible count when properties change
  useEffect(() => {
    if (isLoaded && mapReady) {
      console.log(`📍 Displaying ${properties.length} markers on map`);
      
      // Update visible count after a short delay to ensure map is ready
      setTimeout(updateVisiblePropertiesCount, 300);
      
      const coordinateStats = properties.reduce((stats, property) => {
        const coords = extractCoordinates(property);
        const isRealCoord = property.coordinates || 
                           property.property_details?.coordinates || 
                           property.property_details?.mapCoordinates;
        
        if (isRealCoord) {
          stats.real++;
        } else {
          stats.fallback++;
        }
        
        return stats;
      }, { real: 0, fallback: 0 });
      
      console.log(`📊 Coordinate statistics: ${coordinateStats.real} real, ${coordinateStats.fallback} fallback`);
    }
  }, [properties, isLoaded, mapReady, updateVisiblePropertiesCount, extractCoordinates]);

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
      {/* Property Count Indicator - Top Right Corner */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-border/20">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>
            {visiblePropertiesCount} of {properties.length} properties
          </span>
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={DEFAULT_MAP_CENTER}
        zoom={11}
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {properties.map((property) => {
          const isHovered = hoveredPropertyId === property.id;
          const isActive = activeProperty?.id === property.id;
          const position = extractCoordinates(property);
          
          return (
            <Marker
              key={property.id}
              position={position}
              onClick={() => setActiveProperty(property)}
              animation={isHovered || isActive ? google.maps.Animation.BOUNCE : undefined}
              title={property.title || `Property ${property.id}`}
              icon={createMarkerIcon(isHovered, isActive)}
            />
          );
        })}

        {activeProperty && (
          <InfoWindow
            position={extractCoordinates(activeProperty)}
            onCloseClick={() => setActiveProperty(null)}
          >
            <div className="p-3 max-w-xs">
              <h3 className="font-semibold text-sm mb-2 text-foreground line-clamp-2">
                {activeProperty.title || 'Property'}
              </h3>
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
        )}
      </GoogleMap>
    </div>
  );
};

export default MapPanel;