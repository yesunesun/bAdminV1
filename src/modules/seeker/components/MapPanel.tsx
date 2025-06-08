// src/modules/seeker/components/MapPanel.tsx
// Version: 4.3.0
// Last Modified: 08-01-2025 10:30 IST
// Purpose: Fixed initial zoom level for better marker spread and dev-only property count indicator

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

  // Enhanced coordinate extraction with multiple fallback strategies
  const extractCoordinates = useCallback((property: Property) => {
    try {
      console.log(`🔍 Extracting coordinates for property ${property.id}`);
      
      // Strategy 1: Check direct coordinates field (from property_coordinates table)
      if (property.coordinates) {
        const lat = parseFloat(String(property.coordinates.latitude));
        const lng = parseFloat(String(property.coordinates.longitude));
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.log(`✅ Found coordinates from coordinates table: ${lat}, ${lng}`);
          return { lat, lng, source: 'coordinates_table' };
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
              console.log(`✅ Found coordinates from property_details.coordinates: ${lat}, ${lng}`);
              return { lat, lng, source: 'property_details_coords' };
            }
          }
          if ('latitude' in coords && 'longitude' in coords) {
            const lat = parseFloat(String(coords.latitude));
            const lng = parseFloat(String(coords.longitude));
            
            if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
                lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              console.log(`✅ Found coordinates from property_details.coordinates (lat/lng): ${lat}, ${lng}`);
              return { lat, lng, source: 'property_details_coords_alt' };
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
              console.log(`✅ Found coordinates from property_details.mapCoordinates: ${lat}, ${lng}`);
              return { lat, lng, source: 'map_coordinates' };
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
                console.log(`✅ Found coordinates from steps.${stepKey}: ${lat}, ${lng}`);
                return { lat, lng, source: `steps_${stepKey}` };
              }
            }
          }
        }
      }
      
      // Strategy 5: Generate predictable coordinates for Hyderabad area (ALWAYS CREATE MARKER)
      console.log(`⚠️ No valid coordinates found for property ${property.id}, generating fallback coordinates`);
      
      const hash = property.id.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      const latOffset = (hash % 200) / 10000;
      const lngOffset = ((hash * 3) % 200) / 10000;
      
      const fallbackLat = DEFAULT_MAP_CENTER.lat + latOffset - 0.01;
      const fallbackLng = DEFAULT_MAP_CENTER.lng + lngOffset - 0.01;
      
      console.log(`🔧 Generated fallback coordinates for ${property.id}: ${fallbackLat}, ${fallbackLng}`);
      
      return {
        lat: fallbackLat,
        lng: fallbackLng,
        source: 'fallback'
      };
      
    } catch (error) {
      console.error(`❌ Error extracting coordinates for property ${property.id}:`, error);
      
      // Even in error case, generate fallback coordinates
      const hash = property.id.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      const latOffset = (hash % 200) / 10000;
      const lngOffset = ((hash * 3) % 200) / 10000;
      
      return {
        lat: DEFAULT_MAP_CENTER.lat + latOffset - 0.01,
        lng: DEFAULT_MAP_CENTER.lng + lngOffset - 0.01,
        source: 'error_fallback'
      };
    }
  }, []);

  // Navigate to property detail page
  const handlePropertyClick = useCallback((property: Property) => {
    navigate(`/properties/${property.id}`);
  }, [navigate]);

  // Update visible properties count - SHOW ALL PROPERTIES, not just visible ones
  const updateVisiblePropertiesCount = useCallback(() => {
    if (!map || !isLoaded) return;

    try {
      const bounds = map.getBounds();
      if (!bounds) {
        // If no bounds available, count all properties
        setVisiblePropertiesCount(properties.length);
        return;
      }

      let visibleCount = 0;
      const typeCounts = { residential: 0, commercial: 0, land: 0 };
      
      properties.forEach(property => {
        const coords = extractCoordinates(property);
        const position = new google.maps.LatLng(coords.lat, coords.lng);
        
        if (bounds.contains(position)) {
          visibleCount++;
          const propertyInfo = detectPropertyType(property);
          typeCounts[propertyInfo.type]++;
        }
      });

      setVisiblePropertiesCount(visibleCount);
      setPropertyTypeCounts(typeCounts);
      console.log(`📊 Visible properties in viewport: ${visibleCount} of ${properties.length}`, typeCounts);
    } catch (error) {
      console.error('Error updating visible properties count:', error);
      setVisiblePropertiesCount(properties.length);
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
  }, [map, isLoaded, properties, extractCoordinates]);

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
    
    // Add bounds if we have properties
    if (properties.length > 0) {
      try {
        const bounds = new google.maps.LatLngBounds();
        let validPoints = 0;
        
        properties.forEach(property => {
          const coords = extractCoordinates(property);
          bounds.extend({ lat: coords.lat, lng: coords.lng });
          validPoints++;
        });
        
        console.log(`🎯 Setting map bounds for ${validPoints} properties`);
        
        if (validPoints > 0) {
          setTimeout(() => {
            if (validPoints === 1) {
              const coords = extractCoordinates(properties[0]);
              map.setCenter({ lat: coords.lat, lng: coords.lng });
              map.setZoom(16);
            } else if (validPoints <= 3) {
              map.fitBounds(bounds);
              // FIXED: Set minimum zoom to 14 for better spread
              map.setZoom(Math.min(map.getZoom() || 14, 15));
            } else if (validPoints <= 10) {
              map.fitBounds(bounds);
              // FIXED: Set minimum zoom to 14 for better spread
              map.setZoom(Math.min(map.getZoom() || 14, 14));
            } else {
              map.fitBounds(bounds);
              const currentZoom = map.getZoom() || 14;
              // FIXED: Set minimum zoom to 13 instead of 10 for better marker visibility
              map.setZoom(Math.max(Math.min(currentZoom, 14), 13));
            }
            
            // Update visible count after setting bounds
            setTimeout(updateVisiblePropertiesCount, 500);
          }, 100);
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
        map.setCenter(DEFAULT_MAP_CENTER);
        // FIXED: Set default zoom to 14 instead of 11 for better initial view
        map.setZoom(14);
      }
    } else {
      map.setCenter(DEFAULT_MAP_CENTER);
      // FIXED: Set default zoom to 14 instead of 11 for better initial view
      map.setZoom(14);
    }
  }, [properties, updateVisiblePropertiesCount, extractCoordinates]);

  // Update visible count when properties change and create markers - ENSURE ALL PROPERTIES GET MARKERS
  useEffect(() => {
    if (isLoaded && mapReady && map) {
      console.log(`🚀 Creating markers for ${properties.length} properties`);
      
      // Clean up existing markers
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
      
      // Create new markers - FORCE CREATE FOR ALL PROPERTIES
      const newMarkers: google.maps.Marker[] = [];
      const coordinateStats = { real: 0, fallback: 0, error: 0 };
      
      properties.forEach((property, index) => {
        try {
          const coords = extractCoordinates(property);
          const isHovered = hoveredPropertyId === property.id;
          const isActive = activeProperty?.id === property.id;
          
          // Track coordinate sources
          if (coords.source?.includes('fallback') || coords.source?.includes('error')) {
            coordinateStats.fallback++;
          } else {
            coordinateStats.real++;
          }
          
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
          console.log(`✅ Created marker ${index + 1}/${properties.length} for property ${property.id} at ${coords.lat}, ${coords.lng} (${coords.source})`);
          
        } catch (error) {
          console.error(`❌ Failed to create marker for property ${property.id}:`, error);
          coordinateStats.error++;
        }
      });
      
      markersRef.current = newMarkers;
      setTotalMarkersCreated(newMarkers.length);
      
      // Update visible count after a short delay to ensure map is ready
      setTimeout(updateVisiblePropertiesCount, 300);
      
      console.log(`📊 Marker creation complete:`);
      console.log(`   - Total properties: ${properties.length}`);
      console.log(`   - Markers created: ${newMarkers.length}`);
      console.log(`   - Real coordinates: ${coordinateStats.real}`);
      console.log(`   - Fallback coordinates: ${coordinateStats.fallback}`);
      console.log(`   - Errors: ${coordinateStats.error}`);
    }
    
    // Cleanup function
    return () => {
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];
    };
  }, [properties, isLoaded, mapReady, map, hoveredPropertyId, activeProperty, updateVisiblePropertiesCount, extractCoordinates]);

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
      {/* FIXED: Enhanced Property Count Indicator - Only visible in development mode */}
      {isDevelopment && (
        <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-border/20">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {visiblePropertiesCount} of {properties.length} properties
            </span>
          </div>
          
          {/* Debug info */}
          <div className="text-xs text-muted-foreground mb-2">
            Markers: {totalMarkersCreated}/{properties.length}
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
        zoom={14} // FIXED: Changed from 11 to 14 for better initial marker spread
        options={mapOptions}
        onLoad={onMapLoad}
      >
        {/* Info Window for Active Property */}
        {activeProperty && (
          <InfoWindow
            position={(() => {
              const coords = extractCoordinates(activeProperty);
              return { lat: coords.lat, lng: coords.lng };
            })()}
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
        )}
      </GoogleMap>
    </div>
  );
};

export default MapPanel;