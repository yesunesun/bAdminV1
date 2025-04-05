// src/modules/seeker/components/PropertyDetails/NearbyAmenities.tsx
// Version: 1.4.0
// Last Modified: 05-04-2025 19:30 IST
// Purpose: Fixed lucide-react icon imports and matched SimilarProperties styling

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
  Star
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
  { label: 'Hospitals', value: 'hospital', icon: Building },
  { label: 'Schools', value: 'school', icon: GraduationCap },
  { label: 'Restaurants', value: 'restaurant', icon: Utensils },
  { label: 'Shopping', value: 'shopping_mall', icon: ShoppingBag },
  { label: 'Transport', value: 'transit_station', icon: Bus },
  { label: 'Parks', value: 'park', icon: Trees }
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
  
  // Check if Google Maps API is loaded
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps) {
      setIsGoogleMapsLoaded(true);
    } else {
      // Google Maps should already be loaded by PropertyLocationMap
      console.log("[NearbyAmenities] Waiting for Google Maps to load");
      
      // Add a listener to check when Google Maps becomes available
      const checkGoogleMaps = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          setIsGoogleMapsLoaded(true);
          clearInterval(checkGoogleMaps);
        }
      }, 500);
      
      return () => clearInterval(checkGoogleMaps);
    }
  }, []);
  
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
                const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
                  location,
                  place.geometry?.location as google.maps.LatLng
                );
                
                return {
                  name: place.name || 'Unnamed place',
                  address: place.vicinity || '',
                  distance: distanceInMeters < 1000 
                    ? `${Math.round(distanceInMeters)} m` 
                    : `${(distanceInMeters / 1000).toFixed(1)} km`,
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
    : staticAmenitiesData;
    
  // Get the icon for the selected type
  const getIconForType = (type: string) => {
    const foundType = amenityTypes.find(t => t.value === type);
    return foundType ? foundType.icon : Building;
  };
  
  return (
    <Card className={cn("border-border/40 shadow-md", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center">
            Nearby Amenities
          </h3>
        </div>
        
        {/* Amenity type selector */}
        <div className="flex overflow-x-auto pb-2 gap-2 mb-4">
          {amenityTypes.map((type) => {
            const TypeIcon = type.icon;
            return (
              <Button
                key={type.value}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className={cn(
                  "px-3 h-8 whitespace-nowrap",
                  selectedType === type.value ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <TypeIcon className="h-4 w-4 mr-2" />
                {type.label}
              </Button>
            );
          })}
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border border-muted rounded-md bg-muted/10 animate-pulse h-16"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3" data-testid="nearby-amenities">
            {displayAmenities.map((amenity, index) => {
              const TypeIcon = getIconForType(amenity.type);
              return (
                <div 
                  key={index} 
                  className="p-3 border border-muted rounded-md bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start">
                    <TypeIcon className="h-4 w-4 text-primary mt-1 mr-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{amenity.name}</h4>
                      <div className="flex items-center text-xs text-muted-foreground mt-1 truncate">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{amenity.address}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {amenity.distance}
                    </span>
                    {amenity.rating && (
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Star className="h-3 w-3 mr-1 text-amber-400 fill-amber-400" />
                        {amenity.rating}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {displayAmenities.length === 0 && !loading && (
              <div className="text-center p-3 border border-muted rounded-md">
                <p className="text-xs text-muted-foreground">
                  No {amenityTypes.find(t => t.value === selectedType)?.label.toLowerCase() || 'amenities'} found nearby
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="text-center mt-4">
          <Button 
            variant="link" 
            size="sm" 
            className="text-xs text-primary hover:underline font-medium p-0 h-auto"
            onClick={() => window.open(`https://www.google.com/maps/search/${selectedType}/@${coordinates?.lat},${coordinates?.lng},15z`, '_blank')}
          >
            View more on Google Maps
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyAmenities;