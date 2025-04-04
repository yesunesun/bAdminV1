// src/modules/seeker/pages/AllProperties/components/PropertyCard.tsx
// Version: 1.4.0
// Last Modified: 08-04-2025 12:45 IST
// Purpose: Enhanced direct update function and coordinate verification

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/PropertyFormTypes';
import { formatPrice } from '@/modules/seeker/services/seekerService';
import { useCoordinatesUtils } from '../hooks/useCoordinatesUtils';
import { usePropertyCoordinates } from '../hooks/usePropertyCoordinates';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

interface PropertyCardProps {
  property: PropertyType;
  googleMapsLoaded: boolean;
  geocodingInProgress: string | null;
  setGeocodingInProgress: (id: string | null) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  googleMapsLoaded,
  geocodingInProgress,
  setGeocodingInProgress
}) => {
  const { hasCoordinates, getCoordinatesDisplay } = useCoordinatesUtils();
  const { geocodeAddress, verifyCoordinates } = usePropertyCoordinates();
  const [localCoordinates, setLocalCoordinates] = useState<string | null>(null);
  const [isUpdated, setIsUpdated] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [hasVerifiedCoordinates, setHasVerifiedCoordinates] = useState<boolean | null>(null);
  const { toast } = useToast();
  
  // Check coordinates on mount
  useEffect(() => {
    const checkCoords = async () => {
      const has = await verifyCoordinates(property.id);
      setHasVerifiedCoordinates(has);
    };
    checkCoords();
  }, [property.id]);
  
  // Direct database update function for emergency testing
  const directUpdateCoordinates = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      setGeocodingInProgress(property.id);
      
      // For testing - use hard-coded coordinates
      const coordinates = { lat: 37.7749, lng: -122.4194 };
      
      console.log("[EMERGENCY] Starting direct update with:", coordinates);
      
      // First, get the current property
      const { data: propertyData, error: fetchError } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', property.id)
        .single();
        
      if (fetchError) {
        console.error("[EMERGENCY] Fetch error:", fetchError);
        toast({
          title: "Error fetching property",
          description: fetchError.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log("[EMERGENCY] Current property data:", propertyData);
      
      // Prepare the update data - create a completely new object
      const updatedDetails = {
        ...(propertyData.property_details || {}),  // Handle undefined case
        coordinates: coordinates,
        emergency_test: true,
        lastUpdated: new Date().toISOString()  // Add timestamp to ensure change is detected
      };
      
      console.log("[EMERGENCY] New property details:", updatedDetails);
      
      // Update the database
      const { data: updateResult, error: updateError } = await supabase
        .from('properties')
        .update({ property_details: updatedDetails })
        .eq('id', property.id)
        .select();
      
      if (updateError) {
        console.error("[EMERGENCY] Update error:", updateError);
        toast({
          title: "Error updating property",
          description: updateError.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log("[EMERGENCY] Update result:", updateResult);
      
      // Verify the update
      const verified = await verifyCoordinates(property.id);
      setHasVerifiedCoordinates(verified);
      
      if (verified) {
        const { data: verifyData, error: verifyError } = await supabase
          .from('properties')
          .select('property_details')
          .eq('id', property.id)
          .single();
        
        if (verifyError) {
          console.error("[EMERGENCY] Verify error:", verifyError);
        } else {
          console.log("[EMERGENCY] Verification data:", verifyData);
          setDebugInfo(verifyData.property_details);
          
          if (verifyData.property_details?.coordinates) {
            setLocalCoordinates(`${verifyData.property_details.coordinates.lat.toFixed(6)}, ${verifyData.property_details.coordinates.lng.toFixed(6)}`);
          }
        }
      }
      
      // Update local state
      setLocalCoordinates(`${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`);
      setIsUpdated(true);
      
      toast({
        title: "Emergency update complete",
        description: "Check console for details",
      });
    } catch (error) {
      console.error("[EMERGENCY] Error:", error);
      toast({
        title: "Emergency update failed",
        description: "See console for details",
        variant: "destructive"
      });
    } finally {
      setGeocodingInProgress(null);
    }
  };
  
  // Verify coordinates function for debugging
  const checkCoordinates = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    console.log("[CHECK] Verifying coordinates for property:", property.id);
    
    const verified = await verifyCoordinates(property.id);
    setHasVerifiedCoordinates(verified);
    
    if (verified) {
      const { data, error } = await supabase
        .from('properties')
        .select('property_details')
        .eq('id', property.id)
        .single();
        
      if (!error && data.property_details) {
        console.log("[CHECK] Verification data:", data.property_details);
        setDebugInfo(data.property_details);
        
        // Update local coordinates display
        if (data.property_details.coordinates) {
          setLocalCoordinates(`${data.property_details.coordinates.lat.toFixed(6)}, ${data.property_details.coordinates.lng.toFixed(6)}`);
          setIsUpdated(true);
        }
      }
    }
    
    toast({
      title: "Verification result",
      description: verified ? "Coordinates found in database" : "No coordinates found",
      variant: verified ? "default" : "destructive"
    });
  };
  
  // Function to get coordinates from address using Google Maps Geocoding API
  const getCoordinatesFromAddress = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default action to avoid page refresh
    
    if (!property.address || !googleMapsLoaded) return;
    
    try {
      setGeocodingInProgress(property.id);
      
      // Construct a complete address string
      const fullAddress = [
        property.address,
        property.city,
        property.state,
        property.zip_code
      ].filter(Boolean).join(', ');
      
      console.log(`[CARD] Geocoding address: ${fullAddress}`);
      
      // Use the geocodeAddress function from our hook
      const result = await geocodeAddress(property.id, fullAddress, (coords) => {
        console.log(`[CARD] Coordinates callback received:`, coords);
        setLocalCoordinates(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
        setIsUpdated(true);
        setHasVerifiedCoordinates(true);
      });
      
      console.log(`[CARD] Geocode result:`, result);
      
      if (!result.success) {
        console.error(`[CARD] Geocoding was not successful`);
      }
    } catch (error) {
      console.error(`[CARD] Error during geocoding:`, error);
    } finally {
      setGeocodingInProgress(null);
    }
  };

  // Determine what coordinates to display
  const coordinatesToDisplay = localCoordinates || getCoordinatesDisplay(property);
  const showCoordinatesUpdated = isUpdated && localCoordinates;
  
  // Determine if property has coordinates (either from database or local update)
  const propertyHasCoordinates = hasVerifiedCoordinates === true || hasCoordinates(property) || isUpdated;
  
  return (
    <Card className={`overflow-hidden transition-shadow ${isUpdated ? 'border-green-500' : 'hover:shadow-lg'}`}>
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
            <Badge className={propertyHasCoordinates ? 
              "bg-green-500 hover:bg-green-600" : 
              "bg-red-500 hover:bg-red-600"
            }>
              {propertyHasCoordinates ? "Has Coordinates" : "No Coordinates"}
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
            
            <div className={`mt-3 p-2 rounded text-sm ${showCoordinatesUpdated ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Coordinates:</p>
                  <p className={`text-gray-600 dark:text-gray-400 ${showCoordinatesUpdated ? 'font-medium text-green-600 dark:text-green-400' : ''}`}>
                    {coordinatesToDisplay}
                    {showCoordinatesUpdated && <span className="ml-2 text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-1 py-0.5 rounded">Updated</span>}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {(!propertyHasCoordinates && property.address) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={getCoordinatesFromAddress}
                      disabled={geocodingInProgress === property.id || !googleMapsLoaded}
                      type="button"
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
                  
                  {/* Debug buttons */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={directUpdateCoordinates}
                    disabled={geocodingInProgress === property.id}
                    className="text-xs bg-blue-500 text-white hover:bg-blue-600"
                    type="button"
                  >
                    Direct Update
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={checkCoordinates}
                    className="text-xs bg-purple-500 text-white hover:bg-purple-600"
                    type="button"
                  >
                    Verify
                  </Button>
                </div>
              </div>
              
              {debugInfo && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  <p className="font-bold">Debug Info:</p>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
                </div>
              )}
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
  );
};

export default PropertyCard;