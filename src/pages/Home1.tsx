// src/pages/Home1.tsx
// Version: 3.3.0
// Last Modified: 27-05-2025 20:15 IST
// Purpose: FIXED - Property images now display correctly using proper image service

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Home, Building, TreePine, Star, CheckCircle, Users, ArrowRight, Zap, Clock } from 'lucide-react';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePropertyMapData } from '@/modules/seeker/hooks/usePropertyMapData';
import { useGoogleMaps, DEFAULT_MAP_CENTER } from '@/modules/seeker/hooks/useGoogleMaps';
import { PropertyType } from '@/modules/owner/components/property/types';
import { fastImageService } from '@/modules/seeker/components/PropertyItem/services/fastImageService';

const Home1 = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchType, setSearchType] = useState('buy');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyType | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  // Get real property data from your existing hook
  const {
    properties,
    loading,
    searchQuery,
    setSearchQuery,
    selectedPropertyType,
    handlePropertyTypeChange,
    handlePropertyHover
  } = usePropertyMapData();

  // Use your existing Google Maps hook
  const { isLoaded, loadError } = useGoogleMaps();

  const testimonials = [
    {
      name: "Arjun Reddy",
      location: "Hyderabad", 
      text: "The map feature helped me find properties near my office. Saved weeks of searching!",
      rating: 5,
      image: "/api/placeholder/60/60",
      property: "3BHK Villa in Gachibowli"
    },
    {
      name: "Sneha Patel",
      location: "Mumbai",
      text: "Loved the verified listings and transparent pricing. Found my dream home in 10 days!",
      rating: 5,
      image: "/api/placeholder/60/60", 
      property: "2BHK Apartment in Andheri"
    },
    {
      name: "Rajesh Kumar",
      location: "Bangalore",
      text: "Excellent service! The virtual tours and detailed maps made decision-making easy.",
      rating: 5,
      image: "/api/placeholder/60/60",
      property: "4BHK House in Koramangala"
    }
  ];

  // Auto-slide testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate(`/browse?search=${encodeURIComponent(query)}`);
  };

  // FIXED: Extract coordinates using the same logic as the working hook
  const extractCoordinates = (property: PropertyType) => {
    try {
      // Debug the property structure
      console.debug(`Checking coordinates for property ${property.id}`);
      
      // 1. Check direct latitude/longitude properties
      if (property.latitude !== undefined && property.longitude !== undefined) {
        const lat = parseFloat(String(property.latitude));
        const lng = parseFloat(String(property.longitude));
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.debug(`Valid coordinates found in direct latitude/longitude: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }
      
      // 2. Check property_details.location.coordinates (v2 format)
      const locationCoords = property.property_details?.location?.coordinates;
      if (locationCoords) {
        const lat = parseFloat(String(locationCoords.lat || locationCoords.latitude || 0));
        const lng = parseFloat(String(locationCoords.lng || locationCoords.longitude || 0));
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.debug(`Valid coordinates found in property_details.location.coordinates: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }
      
      // 3. Check property_details.coordinates
      const directCoords = property.property_details?.coordinates;
      if (directCoords) {
        const lat = parseFloat(String(directCoords.lat || directCoords.latitude || 0));
        const lng = parseFloat(String(directCoords.lng || directCoords.longitude || 0));
        
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0 && 
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          console.debug(`Valid coordinates found in property_details.coordinates: ${lat}, ${lng}`);
          return { lat, lng };
        }
      }
      
      // 4. Fallback: Generate unique coordinates around Hyderabad
      console.debug(`No valid coordinates found for property ${property.id}, generating fallback`);
      const hash = property.id.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      // Create spread around Hyderabad metropolitan area
      const latOffset = ((hash % 200) - 100) / 2000; // ±0.05 degree spread
      const lngOffset = (((hash * 3) % 200) - 100) / 2000; // ±0.05 degree spread
      
      const fallbackCoords = {
        lat: 17.385044 + latOffset, // Hyderabad center
        lng: 78.486671 + lngOffset
      };
      
      console.debug(`Generated fallback coordinates: ${fallbackCoords.lat}, ${fallbackCoords.lng}`);
      return fallbackCoords;
      
    } catch (error) {
      console.error(`Error extracting coordinates for property ${property.id}:`, error);
      // Return a unique fallback position
      const fallbackOffset = (property.id.length % 10) / 1000;
      return {
        lat: 17.385044 + fallbackOffset,
        lng: 78.486671 + fallbackOffset
      };
    }
  };

  // FIXED: Get property image using the same logic as PropertyItem component
  const getPropertyImage = (property: PropertyType): string => {
    try {
      const details = property.property_details || {};
      
      // Try to find image in imageFiles array (most common structure)
      if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
        // Find primary image or use first
        const primaryImage = details.imageFiles.find((img: any) => img.isPrimary || img.is_primary);
        const imageToUse = primaryImage || details.imageFiles[0];
        
        if (imageToUse?.fileName) {
          return fastImageService.getPublicImageUrl(property.id, imageToUse.fileName);
        }
        
        // Fallback to direct URL if available
        if (imageToUse?.url) return imageToUse.url;
        if (imageToUse?.publicUrl) return imageToUse.publicUrl;
        if (imageToUse?.dataUrl) return imageToUse.dataUrl;
      }
      
      // Try other image paths in the property details
      const imagePaths = [
        details.images,
        details.photos?.images,
        details.media?.images,
        details.media?.photos?.images
      ];
      
      for (const path of imagePaths) {
        if (Array.isArray(path) && path.length > 0) {
          const primaryImage = path.find((img: any) => img.isPrimary || img.is_primary);
          const imageToUse = primaryImage || path[0];
          
          if (imageToUse?.fileName) {
            return fastImageService.getPublicImageUrl(property.id, imageToUse.fileName);
          }
          
          // Fallback to direct URL if available
          if (imageToUse?.url) return imageToUse.url;
          if (imageToUse?.publicUrl) return imageToUse.publicUrl;
          if (imageToUse?.dataUrl) return imageToUse.dataUrl;
        }
      }
      
      // Check for direct image properties
      if (details.primaryImage) return details.primaryImage;
      if (details.image) return details.image;
      
      // Last resort - use fastImageService to try to find first available image
      return fastImageService.getPublicImageUrl(property.id, 'default');
      
    } catch (error) {
      console.error(`Error getting image for property ${property.id}:`, error);
      return '/noimage.png';
    }
  };

  // Simple price formatting
  const formatPropertyPrice = (property: PropertyType): string => {
    try {
      const price = property.property_details?.price || property.price || 0;
      
      if (price === 0) return 'Price on Request';
      if (price === 1) return 'Contact for Price';
      
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      
      if (numPrice >= 10000000) {
        return `₹${(numPrice / 10000000).toFixed(1)} Cr`;
      } else if (numPrice >= 100000) {
        return `₹${(numPrice / 100000).toFixed(0)} L`;
      } else {
        return `₹${numPrice.toLocaleString('en-IN')}`;
      }
    } catch (error) {
      return 'Price on Request';
    }
  };

  // FIXED: Handle map load to match working implementation
  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log('Map loaded, properties count:', properties.length);
    setMap(map);
    
    // Set initial view to Hyderabad (same as working implementation)
    map.setCenter({ lat: 17.4065, lng: 78.4772 }); // Use same center as useGoogleMaps hook
    map.setZoom(11);
    
    if (properties.length > 0) {
      console.log('Setting up bounds for', properties.length, 'properties');
      
      // Add a delay to ensure markers are rendered
      setTimeout(() => {
        const bounds = new google.maps.LatLngBounds();
        let validCoordinateCount = 0;
        
        properties.forEach((property, index) => {
          const coords = extractCoordinates(property);
          console.log(`Property ${index + 1} (${property.id}):`, coords);
          bounds.extend(coords);
          validCoordinateCount++;
        });
        
        console.log(`Added ${validCoordinateCount} properties to bounds`);
        
        // Fit bounds with padding
        if (validCoordinateCount > 0) {
          map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
          
          // Ensure reasonable zoom level
          const listener = map.addListener('bounds_changed', () => {
            const zoom = map.getZoom();
            console.log('Zoom level after bounds:', zoom);
            if (zoom && zoom > 16) {
              map.setZoom(16);
            }
            google.maps.event.removeListener(listener);
          });
        }
      }, 1000); // Increased delay to ensure proper rendering
    }
  }, [properties]);

  // UPDATED: Enhanced PropertyCard with better image handling and error fallback
  const FeaturedPropertyCard = ({ property }: { property: PropertyType }) => {
    const [imageUrl, setImageUrl] = useState<string>('/noimage.png');
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    
    // Use memoized image URL generation
    useEffect(() => {
      const loadImage = async () => {
        try {
          setImageLoading(true);
          setImageError(false);
          
          const url = getPropertyImage(property);
          
          // If it's a fastImageService URL, test if the image exists
          if (url.includes('property-images-v2')) {
            // Create a test image to check if it loads
            const testImg = new Image();
            testImg.onload = () => {
              setImageUrl(url);
              setImageLoading(false);
            };
            testImg.onerror = () => {
              // Try to find first available image
              fastImageService.findFirstImageUrl(property.id).then(fallbackUrl => {
                setImageUrl(fallbackUrl);
                setImageLoading(false);
              }).catch(() => {
                setImageUrl('/apartment.jpg');
                setImageError(true);
                setImageLoading(false);
              });
            };
            testImg.src = url;
          } else {
            setImageUrl(url);
            setImageLoading(false);
          }
        } catch (error) {
          console.error(`Error loading image for property ${property.id}:`, error);
          setImageUrl('/apartment.jpg');
          setImageError(true);
          setImageLoading(false);
        }
      };
      
      loadImage();
    }, [property.id]);
    
    return (
      <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg">
        <div className="relative">
          {imageLoading ? (
            <div className="w-full h-48 bg-muted animate-pulse flex items-center justify-center">
              <div className="text-muted-foreground">Loading image...</div>
            </div>
          ) : (
            <img 
              src={imageUrl}
              alt={property.title || 'Property'}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!imageError) {
                  target.onerror = null;
                  target.src = '/apartment.jpg';
                  setImageError(true);
                }
              }}
            />
          )}
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            Verified
          </div>
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            Featured
          </div>
          {imageError && (
            <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
              No Image
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
            {property.property_details?.flow?.title || property.title || `Property ID: ${property.id}`}
          </h3>
          <div className="flex items-center text-muted-foreground mb-3">
            <MapPin size={16} className="mr-1" />
            <span className="text-sm">
              {property.property_details?.location?.city || 
               property.property_details?.location?.address || 
               property.city || 
               property.address || 
               'Hyderabad'}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-bold text-primary">{formatPropertyPrice(property)}</span>
              {property.property_details?.price_per_sqft && (
                <div className="text-sm text-muted-foreground">
                  ₹{property.property_details.price_per_sqft}/sq ft
                </div>
              )}
            </div>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
              {property.property_details?.property_type || 
               property.property_details?.basicDetails?.propertyType || 
               property.property_type || 
               'Property'}
            </span>
          </div>
          {/* Show bedroom/bathroom info if available */}
          {(property.property_details?.beds || property.property_details?.basicDetails?.bhkType || property.bedrooms) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>
                {property.property_details?.beds || 
                 property.property_details?.basicDetails?.bhkType?.charAt(0) || 
                 property.bedrooms || '0'} Beds
              </span>
              {(property.property_details?.baths || property.property_details?.basicDetails?.bathrooms || property.bathrooms) && (
                <span>
                  {property.property_details?.baths || 
                   property.property_details?.basicDetails?.bathrooms || 
                   property.bathrooms} Baths
                </span>
              )}
              {(property.property_details?.square_feet || property.property_details?.basicDetails?.builtUpArea || property.square_feet) && (
                <span>
                  {property.property_details?.square_feet || 
                   property.property_details?.basicDetails?.builtUpArea || 
                   property.square_feet} sq ft
                </span>
              )}
            </div>
          )}
          {/* Show property status and created date */}
          <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
            <span>Status: {property.status || 'Active'}</span>
            <span>ID: {property.id.slice(-8)}</span>
          </div>
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" 
            onClick={() => navigate(`/properties/${property.id}`)}
          >
            View Real Property Details
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Properties on <br />
              <span className="text-yellow-400">Interactive Maps</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
              Search, explore, and find your perfect property with our advanced map-based discovery platform
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="bg-white rounded-xl p-6 shadow-2xl mb-8">
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                onClick={() => setSearchType('buy')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  searchType === 'buy' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Buy
              </button>
              <button 
                onClick={() => setSearchType('rent')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  searchType === 'rent' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Rent
              </button>
              <button 
                onClick={() => setSearchType('commercial')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  searchType === 'commercial' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                Commercial
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by location, landmark, or project"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                  />
                </div>
              </div>
              <select 
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                value={selectedPropertyType}
                onChange={(e) => handlePropertyTypeChange(e.target.value)}
              >
                <option value="all">All Property Types</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa/House</option>
                <option value="plot">Plot/Land</option>
                <option value="office">Office Space</option>
              </select>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                onClick={() => handleSearch(searchQuery)}
              >
                <Search size={20} className="mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Map/List Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 flex">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'list' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                List View
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === 'map' 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'text-white hover:bg-white/20'
                }`}
              >
                Map View
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-8 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {activeTab === 'map' ? 'Properties on Map' : 'Featured Properties'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {loading ? 'Loading properties...' : `${properties.length} properties available`}
              </p>
            </div>
          </div>

          {activeTab === 'map' ? (
            <div className="h-96 lg:h-[600px] rounded-lg overflow-hidden shadow-lg border border-border relative">
              {!loading && properties.length > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-blue-600 text-white px-3 py-2 text-sm font-medium rounded shadow-md">
                  📍 {properties.length} properties loaded
                </div>
              )}
              {/* Debug information */}
              {!loading && properties.length === 0 && (
                <div className="absolute top-4 left-4 z-10 bg-orange-600 text-white px-3 py-2 text-sm font-medium rounded shadow-md">
                  ⚠️ No properties loaded
                </div>
              )}
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={DEFAULT_MAP_CENTER}
                  zoom={12}
                  onLoad={onMapLoad}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: true,
                    fullscreenControl: true,
                    mapTypeControlOptions: {
                      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                      position: google.maps.ControlPosition.TOP_CENTER,
                    },
                    zoomControlOptions: {
                      position: google.maps.ControlPosition.RIGHT_BOTTOM,
                    },
                  }}
                >
                  {/* Test with simple default markers first */}
                  {properties.length > 0 && properties.slice(0, 5).map((property, index) => {
                    const isActive = hoveredPropertyId === property.id || activeProperty?.id === property.id;
                    const position = extractCoordinates(property);
                    
                    // Log each marker being rendered
                    console.log(`Rendering marker ${index + 1}: Property ${property.id} at position:`, position);
                    
                    // Use absolutely basic marker with no custom styling first
                    return (
                      <Marker
                        key={`simple-marker-${property.id}`}
                        position={position}
                        onClick={() => {
                          console.log('Simple marker clicked:', property.id, position);
                          setActiveProperty(property);
                        }}
                        title={`Property ${index + 1}: ${property.property_details?.flow?.title || property.title || property.id.slice(-8)}`}
                        // Use default red marker icon - no custom styling
                      />
                    );
                  })}
                  
                  {/* Also add a test marker at Hyderabad center for reference */}
                  <Marker
                    key="test-center-marker"
                    position={{ lat: 17.4065, lng: 78.4772 }}
                    title="Test Center Marker - Hyderabad"
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      scale: 20,
                      fillColor: '#00ff00',
                      fillOpacity: 1,
                      strokeColor: '#000000',
                      strokeWeight: 2,
                    }}
                  />

                  {activeProperty && (
                    <InfoWindow
                      position={extractCoordinates(activeProperty)}
                      onCloseClick={() => setActiveProperty(null)}
                    >
                      <div className="p-3 max-w-xs">
                        <h3 className="font-medium text-sm mb-2">
                          {activeProperty.property_details?.flow?.title || activeProperty.title || 'Property'}
                        </h3>
                        <p className="text-xs mb-2 text-gray-600">
                          {activeProperty.property_details?.location?.city || 
                           activeProperty.property_details?.location?.address || 
                           activeProperty.city || 
                           activeProperty.address || 
                           'Hyderabad'}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mb-3">
                          {formatPropertyPrice(activeProperty)}
                        </p>
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => navigate(`/properties/${activeProperty.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center p-6">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading maps...</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="w-full h-48 bg-muted animate-pulse"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                      <div className="h-6 bg-muted rounded animate-pulse w-1/3"></div>
                    </div>
                  </Card>
                ))
              ) : properties.length > 0 ? (
                properties.slice(0, 6).map((property, index) => (
                  <div key={property.id} className="relative">
                    <FeaturedPropertyCard property={property} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No properties found. Try adjusting your search criteria.</p>
                </div>
              )}
            </div>
          )}

          {!loading && properties.length > 6 && activeTab === 'list' && (
            <div className="text-center mt-8">
              <Button 
                onClick={() => navigate('/browse')}
                size="lg"
                className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                View All {properties.length} Properties
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <Card className="p-6">
              <div className="bg-blue-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Home size={32} />
              </div>
              <h3 className="text-3xl font-bold text-foreground">{properties.length}+</h3>
              <p className="text-muted-foreground">Properties Available</p>
            </Card>
            <Card className="p-6">
              <div className="bg-green-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users size={32} />
              </div>
              <h3 className="text-3xl font-bold text-foreground">25K+</h3>
              <p className="text-muted-foreground">Happy Customers</p>
            </Card>
            <Card className="p-6">
              <div className="bg-orange-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Building size={32} />
              </div>
              <h3 className="text-3xl font-bold text-foreground">15+</h3>
              <p className="text-muted-foreground">Cities Covered</p>
            </Card>
            <Card className="p-6">
              <div className="bg-purple-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-3xl font-bold text-foreground">100%</h3>
              <p className="text-muted-foreground">Verified Listings</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Map Features Highlight */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Map-Based Search?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get a complete neighborhood view and make informed decisions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8 group hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-blue-600 transition-colors">
                <MapPin className="text-blue-600 group-hover:text-white w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Location Intelligence</h3>
              <p className="text-muted-foreground">See nearby schools, hospitals, metro stations, and amenities at a glance</p>
            </Card>
            
            <Card className="text-center p-8 group hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-green-600 transition-colors">
                <Zap className="text-green-600 group-hover:text-white w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Instant Comparison</h3>
              <p className="text-muted-foreground">Compare properties, prices, and neighborhoods side by side instantly</p>
            </Card>
            
            <Card className="text-center p-8 group hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 p-6 rounded-full w-20 h-20 mx-auto mb-6 group-hover:bg-orange-600 transition-colors">
                <Clock className="text-orange-600 group-hover:text-white w-full h-full" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Time Saving</h3>
              <p className="text-muted-foreground">Find properties faster with visual search and smart filters</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Real experiences from customers who found their dream properties</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <Card className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <img 
                  src={testimonials[currentTestimonial].image} 
                  alt={testimonials[currentTestimonial].name}
                  className="w-20 h-20 rounded-full"
                />
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start mb-3">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="text-yellow-400 fill-current" size={20} />
                    ))}
                  </div>
                  <p className="text-lg text-foreground mb-4 italic">"{testimonials[currentTestimonial].text}"</p>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].location}</p>
                    <p className="text-sm text-primary font-medium mt-1">Purchased: {testimonials[currentTestimonial].property}</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore Properties?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start your property search journey with our interactive map and find your perfect home today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/browse')}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              <Search size={20} className="mr-2" />
              Start Map Search
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/properties/list')}
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
            >
              List Your Property
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home1;