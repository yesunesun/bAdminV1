// src/pages/Home1Enhanced.tsx
// Version: 4.2.0
// Last Modified: 27-05-2025 22:45 IST
// Purpose: Debug version with aggressive marker troubleshooting

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
import PropertyHoverCard from '@/components/PropertyHoverCard';

const Home1Enhanced = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('map'); // Start with map view
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [searchType, setSearchType] = useState('buy');
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyType | null>(null);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [showHoverCard, setShowHoverCard] = useState<string | null>(null);
  const [hoverCardProperty, setHoverCardProperty] = useState<PropertyType | null>(null);
  const [markersRendered, setMarkersRendered] = useState<number>(0);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  // Hover timeout for smooth interactions
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

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

  // Enhanced debug logging
  const addDebugInfo = useCallback((message: string) => {
    console.log(`🐛 DEBUG: ${message}`);
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Debug logging for properties and markers
  useEffect(() => {
    addDebugInfo(`Properties: ${properties.length}, Loading: ${loading}, Maps Loaded: ${isLoaded}`);
    
    if (properties.length > 0) {
      addDebugInfo(`Sample property: ${properties[0].id} - ${properties[0].title || 'No title'}`);
    }
  }, [properties, loading, isLoaded, addDebugInfo]);

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

  // FIXED: Simplified coordinate extraction for debugging
  const extractCoordinates = useCallback((property: PropertyType, index: number) => {
    addDebugInfo(`Extracting coords for property ${index}: ${property.id}`);
    
    try {
      // Generate predictable coordinates spread around Hyderabad
      const baseCoords = [
        { lat: 17.4065, lng: 78.4772 }, // Center
        { lat: 17.4165, lng: 78.4872 }, // NE
        { lat: 17.3965, lng: 78.4672 }, // SW
        { lat: 17.4265, lng: 78.4572 }, // NW
        { lat: 17.3865, lng: 78.4972 }, // SE
      ];
      
      const coordIndex = index % baseCoords.length;
      const baseCoord = baseCoords[coordIndex];
      
      // Add small random offset
      const coords = {
        lat: baseCoord.lat + (Math.random() - 0.5) * 0.02,
        lng: baseCoord.lng + (Math.random() - 0.5) * 0.02
      };
      
      addDebugInfo(`Generated coords for ${property.id}: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      return coords;
    } catch (error) {
      addDebugInfo(`Error extracting coordinates: ${error}`);
      return DEFAULT_MAP_CENTER;
    }
  }, [addDebugInfo]);

  // Get property image using the same logic as PropertyItem component
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

  // Enhanced map load handler with better bounds
  const onMapLoad = useCallback((map: google.maps.Map) => {
    addDebugInfo(`Map loaded! Properties to plot: ${properties.length}`);
    setMap(map);
    
    if (properties.length > 0) {
      try {
        // Set a fixed view for Hyderabad area
        const hyderabadBounds = {
          north: 17.5,
          south: 17.3,
          east: 78.6,
          west: 78.3
        };
        
        map.fitBounds(hyderabadBounds);
        map.setZoom(11); // Good zoom level for city view
        
        addDebugInfo(`Map bounds set for Hyderabad region`);
      } catch (error) {
        addDebugInfo(`Error setting map bounds: ${error}`);
      }
    }
  }, [properties, addDebugInfo]);

  // Enhanced marker hover handlers with smooth interactions
  const handleMarkerMouseOver = useCallback((property: PropertyType) => {
    addDebugInfo(`Marker hover: ${property.id}`);
    
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Show hover card immediately
    setHoverCardProperty(property);
    setShowHoverCard(property.id);
    setHoveredPropertyId(property.id);
  }, [hoverTimeout, addDebugInfo]);

  const handleMarkerMouseOut = useCallback(() => {
    addDebugInfo('Marker hover out');
    
    // Set a timeout to hide the card, allowing users to hover over the card itself
    const timeout = setTimeout(() => {
      setShowHoverCard(null);
      setHoverCardProperty(null);
      setHoveredPropertyId(null);
    }, 150); // Small delay to allow moving to hover card

    setHoverTimeout(timeout);
  }, [addDebugInfo]);

  // Handle hover card close
  const handleHoverCardClose = useCallback(() => {
    addDebugInfo('Hover card close');
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setShowHoverCard(null);
    setHoverCardProperty(null);
    setHoveredPropertyId(null);
  }, [hoverTimeout, addDebugInfo]);

  // Handle navigation from hover card
  const handleHoverCardNavigate = useCallback((property: PropertyType) => {
    navigate(`/properties/${property.id}`);
  }, [navigate]);

  // Create test markers if no properties are available
  const getMarkersToRender = useMemo(() => {
    if (properties.length > 0) {
      return properties.slice(0, 10).map((property, index) => ({
        id: property.id,
        property,
        position: extractCoordinates(property, index),
        isActive: hoveredPropertyId === property.id || activeProperty?.id === property.id,
        title: property.title || `Property ${index + 1}`,
        index
      }));
    }
    
    // If no properties, create test markers
    addDebugInfo('No properties found, creating test markers');
    return Array.from({ length: 5 }, (_, index) => {
      const testProperty: PropertyType = {
        id: `test-${index}`,
        owner_id: 'test',
        title: `Test Property ${index + 1}`,
        price: 5000000 + (index * 1000000),
        address: `Test Address ${index + 1}`,
        city: 'Hyderabad',
        state: 'Telangana',
        zip_code: '500001',
        status: 'published',
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        property_details: {
          flow: {
            title: `Test Property ${index + 1}`
          },
          location: {
            city: 'Hyderabad'
          }
        }
      };
      
      return {
        id: `test-${index}`,
        property: testProperty,
        position: extractCoordinates(testProperty, index),
        isActive: false,
        title: `Test Property ${index + 1}`,
        index
      };
    });
  }, [properties, hoveredPropertyId, activeProperty, extractCoordinates, addDebugInfo]);

  // Update markers rendered count
  useEffect(() => {
    setMarkersRendered(getMarkersToRender.length);
    addDebugInfo(`Prepared ${getMarkersToRender.length} markers for rendering`);
  }, [getMarkersToRender, addDebugInfo]);

  // Enhanced PropertyCard component (same as original but with better image handling)
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
                Map View (Debug)
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
                {activeTab === 'map' ? 'Properties on Map (Debug Mode)' : 'Featured Properties'}
              </h2>
              <p className="text-muted-foreground mt-1">
                {loading ? 'Loading properties...' : `${properties.length} properties available`}
              </p>
              {activeTab === 'map' && (
                <p className="text-sm text-blue-600 mt-1">
                  🔧 Debug Mode: Markers should be visible • Check console for details
                </p>
              )}
            </div>
          </div>

          {activeTab === 'map' ? (
            <div className="h-96 lg:h-[600px] rounded-lg overflow-hidden shadow-lg border border-border relative">
              {/* Enhanced Debug Info */}
              <div className="absolute top-4 left-4 z-20 space-y-2 max-w-xs">
                <div className="bg-blue-600 text-white px-3 py-2 text-sm font-medium rounded shadow-md">
                  📊 Debug Info
                </div>
                <div className="bg-white/90 backdrop-blur-sm p-2 rounded shadow text-xs space-y-1">
                  <div>Properties: {properties.length}</div>
                  <div>Markers: {markersRendered}</div>
                  <div>Loading: {loading ? 'Yes' : 'No'}</div>
                  <div>Maps: {isLoaded ? 'Loaded' : 'Loading'}</div>
                  <div>Active: {hoveredPropertyId || 'None'}</div>
                </div>
                {debugInfo.length > 0 && (
                  <div className="bg-gray-800 text-green-400 p-2 rounded shadow text-xs font-mono max-h-32 overflow-y-auto">
                    {debugInfo.map((info, index) => (
                      <div key={index}>{info}</div>
                    ))}
                  </div>
                )}
              </div>

              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={DEFAULT_MAP_CENTER}
                  zoom={11}
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
                  {/* Simplified marker rendering with maximum debugging */}
                  {getMarkersToRender.map(({ id, property, position, isActive, title, index }) => {
                    addDebugInfo(`Rendering marker ${index}: ${id} at ${position.lat}, ${position.lng}`);
                    
                    return (
                      <Marker
                        key={`marker-${id}-${index}`}
                        position={position}
                        onClick={() => {
                          addDebugInfo(`Marker clicked: ${id}`);
                          setActiveProperty(property);
                        }}
                        onMouseOver={() => handleMarkerMouseOver(property)}
                        onMouseOut={handleMarkerMouseOut}
                        title={title}
                        // Use visible and obvious icon for debugging
                        icon={{
                          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                            <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="20" cy="20" r="15" fill="${isActive ? '#ff0000' : '#0066cc'}" stroke="#ffffff" stroke-width="3"/>
                              <text x="20" y="25" font-family="Arial" font-size="12" fill="white" text-anchor="middle">${index + 1}</text>
                            </svg>
                          `)}`,
                          scaledSize: new google.maps.Size(40, 40),
                          anchor: new google.maps.Point(20, 20)
                        }}
                        // Force visibility
                        visible={true}
                        optimized={false}
                      />
                    );
                  })}

                  {/* Hover Cards */}
                  {showHoverCard && hoverCardProperty && (
                    <PropertyHoverCard
                      property={hoverCardProperty}
                      position={extractCoordinates(hoverCardProperty, 0)}
                      onClose={handleHoverCardClose}
                      onNavigate={handleHoverCardNavigate}
                      isVisible={true}
                    />
                  )}

                  {/* Traditional InfoWindow for click interactions */}
                  {activeProperty && (
                    <InfoWindow
                      position={extractCoordinates(activeProperty, 0)}
                      onCloseClick={() => setActiveProperty(null)}
                    >
                      <div className="p-3 max-w-xs">
                        <div className="mb-3">
                          <img
                            src={getPropertyImage(activeProperty)}
                            alt={activeProperty.property_details?.flow?.title || activeProperty.title || 'Property'}
                            className="w-full h-24 object-cover rounded"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/apartment.jpg';
                            }}
                          />
                        </div>
                        <h3 className="font-medium text-sm mb-2">
                          {activeProperty.property_details?.flow?.title || 
                           activeProperty.title || 
                           'Property'}
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
                    {loadError && (
                      <p className="mt-2 text-red-500 text-sm">
                        Error: {loadError.message}
                      </p>
                    )}
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

export default Home1Enhanced;