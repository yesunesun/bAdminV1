// src/modules/seeker/components/PropertyDetails/NearbyAmenities.tsx
// Version: 4.0.0
// Last Modified: 27-05-2025 18:15 IST
// Purpose: Fixed Google Maps timeout by using centralized useGoogleMaps hook

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  MapPin, 
  Building, 
  GraduationCap, 
  Utensils, 
  ShoppingBag, 
  Bus, 
  Trees,
  Star,
  Navigation,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Loader2
} from 'lucide-react';

// Import the centralized Google Maps hook
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

// Interface for nearby amenity data
interface Amenity {
  place_id: string;
  name: string;
  address?: string;
  distance?: string;
  rating?: number;
  type: string;
  price_level?: number;
}

// Interface for component props
interface NearbyAmenitiesProps {
  address?: string;
  city?: string;
  state?: string;
  coordinates?: { lat: number; lng: number } | { latitude: number; longitude: number };
  radius?: number; // search radius in meters
  className?: string;
}

const amenityTypes = [
  { label: 'Hospitals', value: 'hospital', icon: Building, color: 'red' },
  { label: 'Schools', value: 'school', icon: GraduationCap, color: 'blue' },
  { label: 'Restaurants', value: 'restaurant', icon: Utensils, color: 'orange' },
  { label: 'Shopping', value: 'shopping_mall', icon: ShoppingBag, color: 'purple' },
  { label: 'Transport', value: 'transit_station', icon: Bus, color: 'green' },
  { label: 'Parks', value: 'park', icon: Trees, color: 'emerald' }
];

const NearbyAmenities: React.FC<NearbyAmenitiesProps> = ({
  address,
  city,
  state,
  coordinates,
  radius = 2000,
  className
}) => {
  const [selectedType, setSelectedType] = useState<string>('hospital');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Use the centralized Google Maps hook with error handling
  const { isLoaded: isGoogleMapsLoaded, loadError: googleMapsError, isConfigError } = useGoogleMaps();
  
  // Additional state to track if we've attempted to fetch
  const [hasFetchAttempted, setHasFetchAttempted] = useState(false);
  
  // Check if Google Maps API is ready for use
  const isGoogleMapsReady = useCallback((): boolean => {
    return !!(
      isGoogleMapsLoaded &&
      typeof google !== 'undefined' && 
      google.maps && 
      google.maps.places && 
      google.maps.places.PlacesService
    );
  }, [isGoogleMapsLoaded]);

  const getCoordinates = (): { lat: number; lng: number } | null => {
    if (!coordinates) return null;
    
    // Handle different coordinate formats
    if ('lat' in coordinates && 'lng' in coordinates) {
      return { lat: coordinates.lat, lng: coordinates.lng };
    }
    
    if ('latitude' in coordinates && 'longitude' in coordinates) {
      return { lat: coordinates.latitude, lng: coordinates.longitude };
    }
    
    return null;
  };
  
  // Format distance in Indian style
  const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters < 1000) {
      return `${Math.round(distanceInMeters)} m`;
    } else {
      const km = distanceInMeters / 1000;
      return `${km.toFixed(1)} km`;
    }
  };
  
  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371000; // Earth radius in meters
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  };
  
  // Fetch nearby amenities using Google Places API
  const fetchNearbyAmenities = useCallback(async (placeType: string) => {
    const coords = getCoordinates();
    
    if (!coords) {
      setError('Property coordinates not available');
      return;
    }
    
    if (!isGoogleMapsReady()) {
      if (googleMapsError) {
        if (isConfigError) {
          setError('Google Maps API configuration error. Please check the API key and domain settings.');
        } else {
          setError('Google Maps failed to load. Please check your internet connection and try again.');
        }
      } else {
        setError('Google Maps is still loading. Please wait and try again.');
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[NearbyAmenities] Fetching ${placeType} near coordinates:`, coords);
      
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      const location = new google.maps.LatLng(coords.lat, coords.lng);
      
      const request: google.maps.places.PlaceSearchRequest = {
        location,
        radius,
        type: placeType as google.maps.places.PlaceType
      };
      
      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          console.log(`[NearbyAmenities] Found ${results.length} ${placeType} results`);
          
          // Process results and calculate distances
          const processedAmenities: Amenity[] = results
            .slice(0, 6) // Limit to 6 results
            .map(place => {
              let distanceText = 'Nearby';
              
              if (place.geometry?.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                const distanceInMeters = calculateDistance(coords.lat, coords.lng, lat, lng);
                distanceText = formatDistance(distanceInMeters);
              }
              
              return {
                place_id: place.place_id || '',
                name: place.name || 'Unnamed place',
                address: place.vicinity || place.formatted_address || '',
                distance: distanceText,
                rating: place.rating,
                type: placeType,
                price_level: place.price_level
              };
            });
          
          setAmenities(processedAmenities);
          setError(null);
          setRetryCount(0);
        } else {
          console.error(`[NearbyAmenities] Places API error:`, status);
          
          let errorMessage = 'Failed to fetch nearby amenities';
          switch (status) {
            case google.maps.places.PlacesServiceStatus.ZERO_RESULTS:
              errorMessage = `No ${placeType}s found in this area`;
              break;
            case google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT:
              errorMessage = 'API quota exceeded. Please try again later.';
              break;
            case google.maps.places.PlacesServiceStatus.REQUEST_DENIED:
              errorMessage = 'API access denied. Please check configuration.';
              break;
            case google.maps.places.PlacesServiceStatus.INVALID_REQUEST:
              errorMessage = 'Invalid request. Please check coordinates.';
              break;
            default:
              errorMessage = `Service error: ${status}`;
          }
          
          setError(errorMessage);
          setAmenities([]);
        }
        
        setLoading(false);
      });
      
    } catch (err) {
      console.error('[NearbyAmenities] Error fetching amenities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby amenities');
      setAmenities([]);
      setLoading(false);
    }
  }, [coordinates, radius, isGoogleMapsReady, googleMapsError, isConfigError]);
  
  // Retry function
  const handleRetry = useCallback(async () => {
    setRetryCount(prev => prev + 1);
    setHasFetchAttempted(false); // Reset fetch attempt flag
    
    // Wait a moment for Google Maps to be ready if it's still loading
    if (!isGoogleMapsReady() && !googleMapsError) {
      setTimeout(() => {
        if (isGoogleMapsReady()) {
          fetchNearbyAmenities(selectedType);
          setHasFetchAttempted(true);
        }
      }, 1000);
    } else if (isGoogleMapsReady()) {
      fetchNearbyAmenities(selectedType);
      setHasFetchAttempted(true);
    }
  }, [fetchNearbyAmenities, selectedType, isGoogleMapsReady, googleMapsError]);
  
  // Load amenities when dependencies change
  useEffect(() => {
    const coords = getCoordinates();
    
    if (!coords) {
      setError('Property coordinates not available');
      setAmenities([]);
      setHasFetchAttempted(true);
      return;
    }
    
    // Handle Google Maps loading states
    if (googleMapsError) {
      if (isConfigError) {
        setError('Google Maps API not configured properly. Please check the API key and settings.');
      } else {
        setError('Failed to load Google Maps. Please refresh the page and try again.');
      }
      setAmenities([]);
      setHasFetchAttempted(true);
      return;
    }
    
    if (!isGoogleMapsLoaded) {
      setError('Loading Google Maps...');
      setAmenities([]);
      setHasFetchAttempted(false);
      return;
    }
    
    // Only fetch if Google Maps is ready and we haven't attempted yet
    if (isGoogleMapsReady()) {
      // Add a small delay to ensure everything is ready
      const timer = setTimeout(() => {
        fetchNearbyAmenities(selectedType);
        setHasFetchAttempted(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setError('Waiting for Google Maps to initialize...');
      setAmenities([]);
      
      // Retry after a delay if Maps should be loaded but isn't ready
      if (!hasFetchAttempted) {
        const retryTimer = setTimeout(() => {
          if (isGoogleMapsLoaded && isGoogleMapsReady()) {
            fetchNearbyAmenities(selectedType);
            setHasFetchAttempted(true);
          } else {
            setError('Google Maps initialization failed. Please refresh the page.');
            setHasFetchAttempted(true);
          }
        }, 3000); // Increased timeout to 3 seconds
        
        return () => clearTimeout(retryTimer);
      }
    }
  }, [coordinates, selectedType, radius, isGoogleMapsLoaded, googleMapsError, isConfigError, isGoogleMapsReady, fetchNearbyAmenities, hasFetchAttempted]);
  
  // Get the configuration for the selected type
  const getTypeConfig = (type: string) => {
    return amenityTypes.find(t => t.value === type) || amenityTypes[0];
  };

  const selectedTypeConfig = getTypeConfig(selectedType);
  
  return (
    <Card className={cn("overflow-hidden shadow-sm border-border/50 transition-colors duration-200", className)}>
      <CardContent className="p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Navigation className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg md:text-xl font-semibold">Nearby Amenities</h2>
        </div>
        
        {/* Search radius info */}
        <div className="mb-4 text-center">
          <span className="text-xs text-muted-foreground">
            Showing amenities within {(radius / 1000).toFixed(1)} km radius
          </span>
        </div>

        {/* Google Maps Loading State */}
        {!isGoogleMapsLoaded && !googleMapsError && (
          <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 mb-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              <div>
                <h4 className="font-medium text-blue-800 mb-1">Loading Google Maps...</h4>
                <p className="text-sm text-blue-700">Please wait while we initialize the mapping service.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Amenity type selector */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
          {amenityTypes.map((type) => {
            const TypeIcon = type.icon;
            const isSelected = selectedType === type.value;
            
            const colorClasses = {
              red: isSelected ? 'bg-red-100 text-red-800 border-red-300' : 'hover:bg-red-50 hover:text-red-700',
              blue: isSelected ? 'bg-blue-100 text-blue-800 border-blue-300' : 'hover:bg-blue-50 hover:text-blue-700',
              orange: isSelected ? 'bg-orange-100 text-orange-800 border-orange-300' : 'hover:bg-orange-50 hover:text-orange-700',
              purple: isSelected ? 'bg-purple-100 text-purple-800 border-purple-300' : 'hover:bg-purple-50 hover:text-purple-700',
              green: isSelected ? 'bg-green-100 text-green-800 border-green-300' : 'hover:bg-green-50 hover:text-green-700',
              emerald: isSelected ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'hover:bg-emerald-50 hover:text-emerald-700'
            };
            
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                disabled={loading || !isGoogleMapsLoaded}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-all text-sm font-medium",
                  isSelected 
                    ? colorClasses[type.color as keyof typeof colorClasses]
                    : `border-border text-muted-foreground ${colorClasses[type.color as keyof typeof colorClasses]}`,
                  (loading || !isGoogleMapsLoaded) && "opacity-50 cursor-not-allowed"
                )}
              >
                <TypeIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{type.label}</span>
                {loading && selectedType === type.value && (
                  <Loader2 className="h-3 w-3 animate-spin ml-1" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Error state */}
        {error && (
          <div className="p-4 border border-red-200 rounded-lg bg-red-50 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-800 mb-1">Unable to load amenities</h4>
                <p className="text-sm text-red-700 mb-3">{error}</p>
                {/* Only show retry button if it's not a configuration error */}
                {!isConfigError && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={loading}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-muted rounded-lg bg-muted/10 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Amenities list */}
        {!loading && !error && (
          <div className="space-y-3" data-testid="nearby-amenities">
            {amenities.map((amenity, index) => {
              const TypeIcon = selectedTypeConfig.icon;
              const typeColor = selectedTypeConfig.color;
              
              const iconColorClasses = {
                red: 'text-red-600 bg-red-500/10',
                blue: 'text-blue-600 bg-blue-500/10',
                orange: 'text-orange-600 bg-orange-500/10',
                purple: 'text-purple-600 bg-purple-500/10',
                green: 'text-green-600 bg-green-500/10',
                emerald: 'text-emerald-600 bg-emerald-500/10'
              };
              
              return (
                <div 
                  key={amenity.place_id || index} 
                  className="p-4 border border-muted rounded-lg bg-card hover:bg-accent/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-full flex-shrink-0", iconColorClasses[typeColor as keyof typeof iconColorClasses])}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm md:text-base mb-1">{amenity.name}</h4>
                      <div className="flex items-start text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{amenity.address}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          typeColor === 'red' && "bg-red-100 text-red-700",
                          typeColor === 'blue' && "bg-blue-100 text-blue-700",
                          typeColor === 'orange' && "bg-orange-100 text-orange-700",
                          typeColor === 'purple' && "bg-purple-100 text-purple-700",
                          typeColor === 'green' && "bg-green-100 text-green-700",
                          typeColor === 'emerald' && "bg-emerald-100 text-emerald-700"
                        )}>
                          {amenity.distance}
                        </span>
                        <div className="flex items-center gap-2">
                          {amenity.rating && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Star className="h-3 w-3 mr-1 text-amber-400 fill-amber-400" />
                              <span className="font-medium">{amenity.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {amenities.length === 0 && !loading && !error && (
              <div className="text-center p-6 border border-muted rounded-lg bg-muted/10">
                <selectedTypeConfig.icon className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground font-medium">
                  No {selectedTypeConfig.label.toLowerCase()} found nearby
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Try searching in a different area or category
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Footer with Google Maps link */}
        {!error && isGoogleMapsLoaded && (
          <div className="text-center mt-6 pt-4 border-t border-border">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-sm font-medium transition-colors"
              onClick={() => {
                const coords = getCoordinates();
                if (coords) {
                  window.open(`https://www.google.com/maps/search/${selectedType}/@${coords.lat},${coords.lng},15z`, '_blank');
                }
              }}
              disabled={!getCoordinates()}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View more on Google Maps
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NearbyAmenities;