// src/modules/seeker/components/PropertyDetails/NearbyAmenities.tsx
// Version: 2.0.0
// Last Modified: 27-01-2025 16:15 IST
// Purpose: Enhanced nearby amenities with Phase 1 design system, Indian formatting, and improved UX

import React, { useState, useEffect } from 'react';
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
  Clock,
  Phone
} from 'lucide-react';

// Interface for nearby amenity data
interface Amenity {
  name: string;
  address?: string;
  distance?: string;
  rating?: number;
  type: string;
}

// Interface for component props
interface NearbyAmenitiesProps {
  address: string;
  city: string;
  state: string;
  coordinates?: { lat: number; lng: number };
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
  radius = 1000,
  className
}) => {
  const [selectedType, setSelectedType] = useState<string>('hospital');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [isGeometryLibraryLoaded, setIsGeometryLibraryLoaded] = useState(false);
  
  // Check if Google Maps API and geometry library are loaded
  useEffect(() => {
    const checkGoogleMapsGeometry = () => {
      if (typeof google !== 'undefined' && 
          google.maps && 
          google.maps.places && 
          google.maps.geometry && 
          google.maps.geometry.spherical) {
        setIsGoogleMapsLoaded(true);
        setIsGeometryLibraryLoaded(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogleMapsGeometry()) return;
    
    console.log("[NearbyAmenities] Waiting for Google Maps and geometry library to load");
    
    // Add a listener to check when Google Maps becomes available
    const checkInterval = setInterval(() => {
      if (checkGoogleMapsGeometry()) {
        clearInterval(checkInterval);
      }
    }, 500);
    
    return () => clearInterval(checkInterval);
  }, []);
  
  // Safe distance calculation function with Indian format
  const calculateSafeDistance = (
    location1: google.maps.LatLng, 
    location2: google.maps.LatLng | undefined
  ): number => {
    if (!location2) return 0;
    
    try {
      // Check if geometry library is available
      if (google.maps.geometry && google.maps.geometry.spherical) {
        return google.maps.geometry.spherical.computeDistanceBetween(location1, location2);
      }
      
      // Fallback: Calculate Haversine distance manually
      const toRad = (value: number) => (value * Math.PI) / 180;
      const R = 6371000; // Earth radius in meters
      
      const lat1 = location1.lat();
      const lon1 = location1.lng();
      const lat2 = location2.lat();
      const lon2 = location2.lng();
      
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance;
    } catch (error) {
      console.error("[NearbyAmenities] Error calculating distance:", error);
      return 0;
    }
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
  
  // Fetch nearby amenities when coordinates change or when type is selected
  useEffect(() => {
    if (!isGoogleMapsLoaded || !coordinates || !selectedType) return;
    
    const fetchNearbyAmenities = async () => {
      setLoading(true);
      
      try {
        const location = new google.maps.LatLng(coordinates.lat, coordinates.lng);
        const placesService = new google.maps.places.PlacesService(document.createElement('div'));
        
        const request: google.maps.places.PlaceSearchRequest = {
          location,
          radius,
          type: selectedType as google.maps.places.PlaceType
        };
        
        placesService.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            // Process results
            const amenitiesList: Amenity[] = results
              .slice(0, 6) // Limit to 6 results
              .map(place => {
                // Only calculate distance if we have a valid location
                let distanceText = "Nearby";
                if (place.geometry?.location) {
                  const distanceInMeters = calculateSafeDistance(
                    location,
                    place.geometry.location
                  );
                  
                  distanceText = formatDistance(distanceInMeters);
                }
                
                return {
                  name: place.name || 'Unnamed place',
                  address: place.vicinity || '',
                  distance: distanceText,
                  rating: place.rating,
                  type: selectedType
                };
              });
            
            setAmenities(amenitiesList);
          } else {
            console.error('[NearbyAmenities] Error fetching places:', status);
            setAmenities([]);
          }
          setLoading(false);
        });
      } catch (err) {
        console.error('[NearbyAmenities] Error:', err);
        setAmenities([]);
        setLoading(false);
      }
    };
    
    fetchNearbyAmenities();
  }, [coordinates, selectedType, radius, isGoogleMapsLoaded]);
  
  // Static data for when Google Maps isn't available
  const staticAmenitiesData: Amenity[] = [
    { 
      name: "Shri Adithya Hospitals", 
      address: "near ECIL, 8-50/11, Dammaiguda Road, Sainikpuri",
      distance: "1.5 km", 
      rating: 3.9,
      type: "hospital"
    },
    { 
      name: "SK Reddy", 
      address: "FHJG+RH5, VN Reddy Nagar Colony, Kapra",
      distance: "2.9 km", 
      rating: 3.4,
      type: "hospital"
    },
    { 
      name: "Chaitanya Hospitals & Diagnostic Center", 
      address: "1-10-1/66, ECIL, Nagaram Road, SV Nagar",
      distance: "2.1 km", 
      rating: 3.2,
      type: "hospital"
    },
    { 
      name: "H.No # 6-120/2, M V R Arcade", 
      address: "H.NO # 6-120/2, M V R Arcade, Venkateshwara Colony",
      distance: "297 m", 
      rating: 3.7,
      type: "hospital"
    },
    { 
      name: "Sri Rajeshwari Hospital", 
      address: "FJR2+FV3, Nagaram Main Road, Hyderabad",
      distance: "186 m", 
      rating: 4.1,
      type: "hospital"
    },
    { 
      name: "Venkateshwara Ortho Physiotherapy Center", 
      address: "near rampally chaurastha, Stella Nagaram",
      distance: "160 m", 
      rating: 4.7,
      type: "hospital"
    }
  ];
  
  // If Google Maps isn't available, use static data
  const displayAmenities = isGoogleMapsLoaded && coordinates && amenities.length > 0 
    ? amenities 
    : staticAmenitiesData.filter(amenity => amenity.type === selectedType);
    
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
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg border transition-all text-sm font-medium",
                  isSelected 
                    ? colorClasses[type.color as keyof typeof colorClasses]
                    : `border-border text-muted-foreground ${colorClasses[type.color as keyof typeof colorClasses]}`
                )}
              >
                <TypeIcon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{type.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border border-muted rounded-lg bg-muted/10 animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3" data-testid="nearby-amenities">
            {displayAmenities.map((amenity, index) => {
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
                  key={index} 
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
              );
            })}
            
            {displayAmenities.length === 0 && !loading && (
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
        <div className="text-center mt-6 pt-4 border-t border-border">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm font-medium transition-colors"
            onClick={() => window.open(`https://www.google.com/maps/search/${selectedType}/@${coordinates?.lat},${coordinates?.lng},15z`, '_blank')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            View more on Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyAmenities;