// src/modules/seeker/components/PropertyDetails/NearbyAmenities.tsx
// Version: 1.1.0
// Last Modified: 05-04-2025 16:30 IST
// Purpose: Component to display nearby amenities around a property

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, 
  Building, 
  ShoppingBag, 
  Utensils, 
  Bus, 
  Stethoscope, 
  Trees, 
  MapPin, 
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NearbyAmenitiesProps {
  coordinates?: { lat: number; lng: number };
  address: string;
}

type AmenityType = 'hospital' | 'school' | 'restaurant' | 'shopping_mall' | 'bus_station' | 'park';

interface Amenity {
  id: string;
  name: string;
  type: AmenityType;
  distance: string;
  vicinity: string;
  rating?: number;
}

const amenityTypes = [
  { value: 'hospital', label: 'Hospitals', icon: Stethoscope },
  { value: 'school', label: 'Schools', icon: GraduationCap },
  { value: 'restaurant', label: 'Restaurants', icon: Utensils },
  { value: 'shopping_mall', label: 'Shopping', icon: ShoppingBag },
  { value: 'bus_station', label: 'Transport', icon: Bus },
  { value: 'park', label: 'Parks', icon: Trees }
];

const NearbyAmenities: React.FC<NearbyAmenitiesProps> = ({ coordinates, address }) => {
  const [selectedType, setSelectedType] = useState<AmenityType>('hospital');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  // Load Google Maps API if not already loaded
  useEffect(() => {
    if (typeof google !== 'undefined' && google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!apiKey) {
      setError("Google Maps API key is missing");
      return;
    }
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.onload = () => setIsGoogleMapsLoaded(true);
    script.onerror = () => setError("Failed to load Google Maps");
    
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  // Function to fetch nearby places
  const fetchNearbyPlaces = useCallback(async (type: AmenityType) => {
    if (!isGoogleMapsLoaded) return;
    if (!coordinates && !address) {
      setError("Location information is missing");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use either provided coordinates or geocode the address
      let location;
      
      if (coordinates && coordinates.lat !== 0 && coordinates.lng !== 0) {
        location = new google.maps.LatLng(coordinates.lat, coordinates.lng);
      } else if (address) {
        const geocoder = new google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
          geocoder.geocode({ address }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              resolve(results);
            } else {
              reject(new Error(`Geocoding failed: ${status}`));
            }
          });
        });
        
        location = result[0].geometry.location;
      } else {
        throw new Error("Unable to determine property location");
      }
      
      // Search for nearby places
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        service.nearbySearch(
          {
            location,
            radius: 3000, // 3km radius
            type: type as google.maps.places.PlaceType
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              reject(new Error(`Nearby search failed: ${status}`));
            }
          }
        );
      });
      
      // Process results
      const processedAmenities = results.slice(0, 6).map(place => {
        // Calculate distance (simplified for now)
        const placeLocation = place.geometry?.location;
        let distance = "N/A";
        
        if (placeLocation && location) {
          const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
            location,
            placeLocation
          );
          
          // Format distance
          distance = distanceInMeters < 1000 
            ? `${Math.round(distanceInMeters)} m` 
            : `${(distanceInMeters / 1000).toFixed(1)} km`;
        }
        
        return {
          id: place.place_id || `place-${Math.random()}`,
          name: place.name || "Unnamed Place",
          type: type,
          distance,
          vicinity: place.vicinity || "",
          rating: place.rating
        };
      });
      
      setAmenities(processedAmenities);
    } catch (err) {
      console.error("Error fetching nearby places:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch nearby places");
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  }, [coordinates, address, isGoogleMapsLoaded]);
  
  // Fetch amenities when type changes or when coordinates/address change
  useEffect(() => {
    if (isGoogleMapsLoaded && (coordinates || address)) {
      fetchNearbyPlaces(selectedType);
    }
  }, [selectedType, coordinates, address, fetchNearbyPlaces, isGoogleMapsLoaded]);
  
  // Get the appropriate icon for an amenity type
  const getAmenityIcon = (type: AmenityType) => {
    const amenityType = amenityTypes.find(t => t.value === type);
    const Icon = amenityType?.icon || MapPin;
    return <Icon className="h-4 w-4" />;
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Nearby Amenities
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Type selector buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {amenityTypes.map(type => (
            <Button
              key={type.value}
              variant={selectedType === type.value ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => setSelectedType(type.value as AmenityType)}
            >
              <type.icon className="h-4 w-4" />
              {type.label}
            </Button>
          ))}
        </div>
        
        {/* Error state */}
        {error && (
          <div className="p-4 bg-destructive/10 rounded-md text-destructive mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center py-12">
            <RotateCw className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Searching for nearby {amenityTypes.find(t => t.value === selectedType)?.label.toLowerCase()}...</p>
          </div>
        )}
        
        {/* Results grid */}
        {!loading && !error && (
          <>
            {amenities.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">No {amenityTypes.find(t => t.value === selectedType)?.label.toLowerCase()} found nearby</p>
                <p className="text-sm text-muted-foreground/60 mt-2">Try searching for a different category</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {amenities.map((amenity) => (
                  <div key={amenity.id} className="border border-border/40 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        {getAmenityIcon(amenity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{amenity.name}</h4>
                        <p className="text-sm text-muted-foreground truncate">{amenity.vicinity}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                            {amenity.distance}
                          </span>
                          {amenity.rating && (
                            <span className="ml-2 text-xs flex items-center text-amber-500">
                              ★ {amenity.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* No "View more" link as requested */}
      </CardContent>
    </Card>
  );
};

export default NearbyAmenities;