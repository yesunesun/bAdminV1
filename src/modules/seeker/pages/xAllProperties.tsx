// src/modules/seeker/pages/AllProperties.tsx
// Version: 1.8.0
// Last Modified: 05-04-2025 20:45 IST
// Purpose: Add editable debug address field

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProperties } from '../services/seekerService';
import { PropertyType } from '@/modules/owner/components/property/types';
import { formatPrice } from '../services/seekerService';
import { supabase } from '@/lib/supabase';

// UI Components
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

// For debug purposes - declare global google variable
declare global {
  interface Window {
    google: any;
  }
}

// Load Google Maps API script
const loadGoogleMapsScript = (callback: () => void) => {
  const existingScript = document.getElementById('googleMapsScript');
  if (!existingScript) {
    const script = document.createElement('script');
    // Use the environment variable for the API key
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    console.log("Using Google Maps API Key:", apiKey ? "Available (hidden)" : "Not available");
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.id = 'googleMapsScript';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("Google Maps script loaded successfully");
      callback();
    };
    script.onerror = (error) => {
      console.error("Error loading Google Maps script:", error);
    };
    document.body.appendChild(script);
  } else {
    callback();
  }
};

const AllProperties: React.FC = () => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  
  // Filters
  const [coordinatesFilter, setCoordinatesFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('');
  const [uniqueOwners, setUniqueOwners] = useState<{id: string, email: string}[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<PropertyType[]>([]);
  
  // Google Maps API state
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [geocodingInProgress, setGeocodingInProgress] = useState<string | null>(null);
  const [debugTesting, setDebugTesting] = useState<boolean>(false);
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const [debugAddress, setDebugAddress] = useState<string>("Lake View, 1-4-200/83/c, Eshwaripuri Colony, Lake View Residency, Sainikpuri, Hyderabad, Secunderabad, Telangana");
  
  // Toast notifications
  const { toast } = useToast();

  useEffect(() => {
    // Check if the API key is available
    if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
      console.warn("Google Maps API key not found in environment variables");
      toast({
        title: "API Key Missing",
        description: "Google Maps functionality is limited due to missing API key.",
        variant: "destructive"
      });
    } else {
      // Load Google Maps API
      loadGoogleMapsScript(() => {
        setGoogleMapsLoaded(true);
        console.log("Google Maps API loaded successfully and ready to use");
      });
    }
    
    const loadProperties = async () => {
      try {
        setLoading(true);
        const result = await fetchProperties({
          page: currentPage,
          pageSize: pageSize,
        });
        
        // Check if component is still mounted before setting state
        setProperties(result.properties);
        
        // Extract unique owners for the owner filter dropdown
        const owners = new Map();
        result.properties.forEach(property => {
          if (property.profiles && property.profiles.id && property.profiles.email) {
            owners.set(property.profiles.id, {
              id: property.profiles.id,
              email: property.profiles.email
            });
          }
        });
        setUniqueOwners(Array.from(owners.values()));
        
        setTotalCount(result.totalCount);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error('Failed to load properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
    
    // Cleanup function to prevent memory leaks
    return () => {
      // Cleanup code here if needed
    };
  }, [currentPage, pageSize]);

  // Debug function to test geocoding with a specific address
  const testGeocoding = () => {
    if (!debugAddress.trim()) {
      toast({
        title: "Empty Address",
        description: "Please enter an address to test geocoding.",
        variant: "destructive"
      });
      return;
    }
    
    setDebugTesting(true);
    setDebugResult(null);
    
    console.log("Testing geocoding for address:", debugAddress);
    console.log("Google Maps loaded status:", googleMapsLoaded);
    console.log("Google object available:", typeof window.google !== 'undefined');
    
    if (!googleMapsLoaded || typeof window.google === 'undefined') {
      setDebugResult("Error: Google Maps API not loaded properly. Check console for details.");
      setDebugTesting(false);
      return;
    }
    
    try {
      // Create a new Geocoder instance
      const geocoder = new window.google.maps.Geocoder();
      
      // Use the geocoder to get coordinates
      geocoder.geocode({ address: debugAddress }, (results, status) => {
        console.log("Geocoding results:", results);
        console.log("Geocoding status:", status);
        
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          const resultText = `SUCCESS: Address geocoded to coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setDebugResult(resultText);
          console.log(resultText);
          
          toast({
            title: "Geocoding Test Successful",
            description: `Found coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        } else {
          const errorText = `ERROR: Geocoding failed with status: ${status}`;
          setDebugResult(errorText);
          console.error(errorText);
          
          toast({
            title: "Geocoding Test Failed",
            description: `Status: ${status}`,
            variant: "destructive"
          });
        }
        
        setDebugTesting(false);
      });
    } catch (error) {
      const errorMsg = `ERROR: Exception during geocoding: ${error}`;
      console.error(errorMsg);
      setDebugResult(errorMsg);
      setDebugTesting(false);
      
      toast({
        title: "Geocoding Test Exception",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  // Helper to safely format coordinate numbers
  const formatCoordinate = (value: any): string => {
    // Check if the value is a valid number
    if (value === null || value === undefined) {
      return "N/A";
    }
    
    const num = parseFloat(value);
    if (isNaN(num)) {
      return "N/A";
    }
    
    return num.toFixed(6);
  };

  // Enhanced function to check if a property has coordinates
  const hasCoordinates = (property: PropertyType) => {
    // Check all possible locations where coordinates might be stored
    
    // Check in property_details.coordinates
    if (property.property_details?.coordinates) {
      const lat = property.property_details.coordinates.lat;
      const lng = property.property_details.coordinates.lng;
      if (lat !== undefined && lng !== undefined) {
        // Ensure lat and lng are numbers
        const parsedLat = parseFloat(lat as any);
        const parsedLng = parseFloat(lng as any);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          return true;
        }
      }
    }
    
    // Check in property_details.location.coordinates
    if (property.property_details?.location?.coordinates) {
      const lat = property.property_details.location.coordinates.lat;
      const lng = property.property_details.location.coordinates.lng;
      if (lat !== undefined && lng !== undefined) {
        const parsedLat = parseFloat(lat as any);
        const parsedLng = parseFloat(lng as any);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          return true;
        }
      }
    }
    
    // Check in property_details.mapCoordinates
    if (property.property_details?.mapCoordinates) {
      const lat = property.property_details.mapCoordinates.lat;
      const lng = property.property_details.mapCoordinates.lng;
      if (lat !== undefined && lng !== undefined) {
        const parsedLat = parseFloat(lat as any);
        const parsedLng = parseFloat(lng as any);
        if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
          return true;
        }
      }
    }
    
    // Check for latitude and longitude directly in property_details
    if (property.property_details?.latitude !== undefined && 
        property.property_details?.longitude !== undefined) {
      const lat = property.property_details.latitude;
      const lng = property.property_details.longitude;
      const parsedLat = parseFloat(lat as any);
      const parsedLng = parseFloat(lng as any);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return true;
      }
    }
    
    // Check for lat and lng directly in property_details
    if (property.property_details?.lat !== undefined && 
        property.property_details?.lng !== undefined) {
      const lat = property.property_details.lat;
      const lng = property.property_details.lng;
      const parsedLat = parseFloat(lat as any);
      const parsedLng = parseFloat(lng as any);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return true;
      }
    }
    
    return false;
  };

  // Enhanced function to get coordinates display text
  const getCoordinatesDisplay = (property: PropertyType) => {
    // Check all possible locations where coordinates might be stored
    
    // Check in property_details.coordinates
    if (property.property_details?.coordinates) {
      const lat = property.property_details.coordinates.lat;
      const lng = property.property_details.coordinates.lng;
      if (lat !== undefined && lng !== undefined) {
        return `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
      }
    }
    
    // Check in property_details.location.coordinates
    if (property.property_details?.location?.coordinates) {
      const lat = property.property_details.location.coordinates.lat;
      const lng = property.property_details.location.coordinates.lng;
      if (lat !== undefined && lng !== undefined) {
        return `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
      }
    }
    
    // Check in property_details.mapCoordinates
    if (property.property_details?.mapCoordinates) {
      const lat = property.property_details.mapCoordinates.lat;
      const lng = property.property_details.mapCoordinates.lng;
      if (lat !== undefined && lng !== undefined) {
        return `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
      }
    }
    
    // Check for latitude and longitude directly in property_details
    if (property.property_details?.latitude !== undefined && 
        property.property_details?.longitude !== undefined) {
      return `${formatCoordinate(property.property_details.latitude)}, ${formatCoordinate(property.property_details.longitude)}`;
    }
    
    // Check for lat and lng directly in property_details
    if (property.property_details?.lat !== undefined && 
        property.property_details?.lng !== undefined) {
      return `${formatCoordinate(property.property_details.lat)}, ${formatCoordinate(property.property_details.lng)}`;
    }
    
    return "No coordinates available";
  };

  // Function to get coordinates from address using Google Maps Geocoding API
  const getCoordinatesFromAddress = async (property: PropertyType) => {
    if (!googleMapsLoaded || typeof window.google === 'undefined') {
      toast({
        title: "Google Maps not loaded",
        description: "Please wait for Google Maps to load and try again.",
        variant: "destructive"
      });
      return;
    }

    if (!property.address) {
      toast({
        title: "Missing address",
        description: "This property doesn't have an address to geocode.",
        variant: "destructive"
      });
      return;
    }

    try {
      setGeocodingInProgress(property.id);

      // Construct a complete address string
      const fullAddress = [
        property.address,
        property.city,
        property.state,
        property.zip_code
      ].filter(Boolean).join(', ');

      // Create a new Geocoder instance
      const geocoder = new window.google.maps.Geocoder();
      
      // Use the geocoder to get coordinates
      geocoder.geocode({ address: fullAddress }, async (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          console.log(`Geocoded ${fullAddress} to:`, { lat, lng });
          
          // Update the property in the database with the new coordinates
          try {
            // Clone the property_details object or create a new one if it doesn't exist
            const updatedDetails = { 
              ...(property.property_details || {}),
              coordinates: { lat, lng }
            };
            
            const { error } = await supabase
              .from('properties')
              .update({ 
                property_details: updatedDetails
              })
              .eq('id', property.id);
              
            if (error) {
              throw error;
            }
            
            // Update the local state
            setProperties(prevProperties => 
              prevProperties.map(p => 
                p.id === property.id 
                  ? { ...p, property_details: updatedDetails } 
                  : p
              )
            );
            
            toast({
              title: "Coordinates updated",
              description: `Successfully updated coordinates for "${property.title}"`,
            });
          } catch (error) {
            console.error('Error updating property coordinates:', error);
            toast({
              title: "Update failed",
              description: "Failed to save the coordinates to the database.",
              variant: "destructive"
            });
          }
        } else {
          console.error('Geocoding failed:', status);
          toast({
            title: "Geocoding failed",
            description: `Could not find coordinates for this address: ${status}`,
            variant: "destructive"
          });
        }
        
        setGeocodingInProgress(null);
      });
    } catch (error) {
      console.error('Error during geocoding:', error);
      toast({
        title: "Error",
        description: "An error occurred while trying to get coordinates.",
        variant: "destructive"
      });
      setGeocodingInProgress(null);
    }
  };

  // Apply filters whenever properties or filter values change
  useEffect(() => {
    let result = [...properties];
    
    // Apply coordinates filter
    if (coordinatesFilter !== 'all') {
      result = result.filter(property => {
        const hasCoords = hasCoordinates(property);
        return coordinatesFilter === 'available' ? hasCoords : !hasCoords;
      });
    }
    
    // Apply owner filter
    if (ownerFilter) {
      result = result.filter(property => 
        property.profiles && property.profiles.id === ownerFilter
      );
    }
    
    setFilteredProperties(result);
  }, [properties, coordinatesFilter, ownerFilter]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading && properties.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">All Properties</h1>
        <div className="grid gap-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      {/* Debug section */}
      <Card className="mb-6 border-2 border-blue-500 dark:border-blue-400">
        <CardContent className="p-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-2">Debug Tools</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              API Status: {googleMapsLoaded ? 
                <span className="text-green-500 font-medium">Loaded ✓</span> : 
                <span className="text-red-500 font-medium">Not Loaded ✗</span>
              }
            </p>
            
            <div className="mb-4">
              <Label htmlFor="debugAddress" className="block mb-2 font-medium">Test Address</Label>
              <div className="flex gap-4">
                <Input
                  id="debugAddress"
                  value={debugAddress}
                  onChange={(e) => setDebugAddress(e.target.value)}
                  placeholder="Enter address to test"
                  className="flex-1"
                />
                <Button
                  onClick={testGeocoding}
                  disabled={debugTesting || !googleMapsLoaded || !debugAddress.trim()}
                  className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap"
                >
                  {debugTesting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Testing...
                    </>
                  ) : (
                    "Test Geocoding"
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter any address to test Google Maps Geocoding</p>
            </div>
          </div>
          
          {debugResult && (
            <div className={`mt-4 p-3 rounded ${debugResult.startsWith('SUCCESS') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
              {debugResult}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">All Properties</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredProperties.length} of {totalCount} properties
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coordinates Filter */}
            <div>
              <Label htmlFor="coordinatesFilter" className="block mb-2 font-medium">Coordinates</Label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="coordinates-all"
                    name="coordinates"
                    checked={coordinatesFilter === 'all'}
                    onChange={() => setCoordinatesFilter('all')}
                    className="mr-2"
                  />
                  <label htmlFor="coordinates-all">All Properties</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="coordinates-available"
                    name="coordinates"
                    checked={coordinatesFilter === 'available'}
                    onChange={() => setCoordinatesFilter('available')}
                    className="mr-2"
                  />
                  <label htmlFor="coordinates-available">Coordinates Available</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="coordinates-none"
                    name="coordinates"
                    checked={coordinatesFilter === 'notAvailable'}
                    onChange={() => setCoordinatesFilter('notAvailable')}
                    className="mr-2"
                  />
                  <label htmlFor="coordinates-none">No Coordinates</label>
                </div>
              </div>
            </div>

            {/* Owner Filter */}
            <div>
              <Label htmlFor="ownerFilter" className="block mb-2 font-medium">Property Owner</Label>
              <select
                id="ownerFilter"
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="">All Owners</option>
                {uniqueOwners.map(owner => (
                  <option key={owner.id} value={owner.id}>
                    {owner.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Page Size Selector */}
            <div>
              <Label htmlFor="pageSizeFilter" className="block mb-2 font-medium">Properties per page</Label>
              <div className="space-y-2">
                {[10, 20, 50, 100].map(size => (
                  <div key={size} className="flex items-center">
                    <input
                      type="radio"
                      id={`size-${size}`}
                      name="pageSize"
                      checked={pageSize === size}
                      onChange={() => handlePageSizeChange(size)}
                      className="mr-2"
                    />
                    <label htmlFor={`size-${size}`}>{size}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <div className="mt-6 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setCoordinatesFilter('all');
                setOwnerFilter('');
                setPageSize(20);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Property List */}
      <div className="grid gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/4 h-48 sm:h-auto bg-gray-200 dark:bg-gray-700 relative">
                  <img
                    src={property.property_images && property.property_images.length > 0 
                      ? property.property_images[0].url 
                      : '/noimage.png'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Coordinates Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge className={hasCoordinates(property) ? 
                      "bg-green-500 hover:bg-green-600" : 
                      "bg-red-500 hover:bg-red-600"
                    }>
                      {hasCoordinates(property) ? "Has Coordinates" : "No Coordinates"}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  <CardHeader className="p-0 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-xl font-semibold line-clamp-1">{property.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-1">
                          {property.address}, {property.city}, {property.state}
                        </p>
                        {property.profiles && (
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            Owner: {property.profiles.email}
                          </p>
                        )}
                      </div>
                      <Badge className="ml-2">
                        {property.property_details?.propertyType || 'Property'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0 pb-2">
                    <div className="grid grid-cols-3 gap-2 my-2 text-sm">
                      <div>
                        <span className="font-medium">Price:</span> {formatPrice(property.price)}
                      </div>
                      {property.bedrooms && (
                        <div>
                          <span className="font-medium">Bedrooms:</span> {property.bedrooms}
                        </div>
                      )}
                      {property.bathrooms && (
                        <div>
                          <span className="font-medium">Bathrooms:</span> {property.bathrooms}
                        </div>
                      )}
                      {property.square_feet && (
                        <div>
                          <span className="font-medium">Area:</span> {property.square_feet} sq.ft
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Coordinates:</p>
                          <p className="text-gray-600 dark:text-gray-400">{getCoordinatesDisplay(property)}</p>
                        </div>
                        
                        {!hasCoordinates(property) && property.address && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => getCoordinatesFromAddress(property)}
                            disabled={geocodingInProgress === property.id || !googleMapsLoaded}
                          >
                            {geocodingInProgress === property.id ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              "Fix Coordinates"
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-0 pt-3 flex justify-end">
                    <Link to={`/seeker/property/${property.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </CardFooter>
                </div>
              </div>
</Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-lg text-gray-500 dark:text-gray-400">No properties match your filter criteria.</p>
            <Button 
              className="mt-4" 
              variant="outline"
              onClick={() => {
                setCoordinatesFilter('all');
                setOwnerFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && filteredProperties.length > 0 && (
        <div className="flex justify-between items-center mt-8">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Only show a range of pages around the current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
                ) {
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                } else if (
                  (pageNumber === currentPage - 3 && currentPage > 4) ||
                  (pageNumber === currentPage + 3 && currentPage < totalPages - 3)
                ) {
                  return <span key={pageNumber}>...</span>;
                }
                return null;
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProperties;