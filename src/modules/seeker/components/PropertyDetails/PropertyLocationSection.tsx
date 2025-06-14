// src/modules/seeker/components/PropertyDetails/PropertyLocationSection.tsx
// Version: 11.0.0
// Last Modified: 27-05-2025 17:45 IST
// Purpose: Added nearby properties toggle functionality directly on existing map

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPinIcon, LandmarkIcon, MapIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import PropertyLocationMap from './PropertyLocationMap';
import { fetchNearbyProperties } from '../../services/propertyService';

interface PropertyLocationSectionProps {
  property: any;
  isLoading?: boolean;
}

/**
 * Helper function to find the location step dynamically based on the property's flow
 */
const findLocationStep = (steps: any): { stepKey: string | null; locationData: any } => {
  if (!steps || typeof steps !== 'object') {
    return { stepKey: null, locationData: null };
  }

  // Find the step that contains location data by looking for steps that end with '_location'
  const locationStepKey = Object.keys(steps).find(key => 
    key.includes('_location') && steps[key] && typeof steps[key] === 'object'
  );

  if (locationStepKey && steps[locationStepKey]) {
    console.log(`[PropertyLocationSection] Found location step: ${locationStepKey}`, steps[locationStepKey]);
    return { 
      stepKey: locationStepKey, 
      locationData: steps[locationStepKey] 
    };
  }

  // Fallback: look for any step that has location-like properties
  const fallbackStepKey = Object.keys(steps).find(key => {
    const stepData = steps[key];
    return stepData && typeof stepData === 'object' && (
      stepData.address || 
      stepData.city || 
      stepData.latitude || 
      stepData.coordinates ||
      stepData.locality ||
      stepData.pinCode
    );
  });

  if (fallbackStepKey) {
    console.log(`[PropertyLocationSection] Found location data in fallback step: ${fallbackStepKey}`, steps[fallbackStepKey]);
    return { 
      stepKey: fallbackStepKey, 
      locationData: steps[fallbackStepKey] 
    };
  }

  console.log('[PropertyLocationSection] No location step found in steps');
  return { stepKey: null, locationData: null };
};

const PropertyLocationSection: React.FC<PropertyLocationSectionProps> = ({ 
  property,
  isLoading 
}) => {
  const { toast } = useToast();
  
  // State to hold processed location data
  const [locationData, setLocationData] = useState({
    address: '',
    locality: '',
    city: '',
    state: '',
    pinCode: '',
    landmark: '',
    flatPlotNo: '',
    coordinates: null as { lat: number; lng: number } | null
  });

  // State for nearby properties functionality
  const [showNearbyProperties, setShowNearbyProperties] = useState(false);
  const [nearbyProperties, setNearbyProperties] = useState<any[]>([]);
  const [loadingNearbyProperties, setLoadingNearbyProperties] = useState(false);

  // Process property data once when component mounts or property changes
  useEffect(() => {
    if (!property) return;
    
    console.log("Property data for location extraction:", property);

    // Extract coordinates from property data
    const extractCoordinates = () => {
      // Handle property_details parsing
      let details = property.property_details;
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
        } catch (e) {
          details = {};
        }
      } else if (!details) {
        details = {};
      }

      // NEW: Use dynamic location step detection
      if (details.steps) {
        const { stepKey, locationData: stepLocationData } = findLocationStep(details.steps);
        
        if (stepLocationData && stepLocationData.latitude && stepLocationData.longitude) {
          console.log(`[PropertyLocationSection] Found coordinates in step ${stepKey}:`, 
            stepLocationData.latitude, stepLocationData.longitude);
          return {
            lat: parseFloat(stepLocationData.latitude),
            lng: parseFloat(stepLocationData.longitude)
          };
        }
      }

      // Try all possible coordinate locations (fallback for legacy data)
      // 1. Check property.location structure (v2 format)
      if (property.location?.coordinates) {
        const lat = Number(property.location.coordinates.latitude || property.location.coordinates.lat);
        const lng = Number(property.location.coordinates.longitude || property.location.coordinates.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // 2. Check property_details.coordinates (wizard stores it here)
      if (details.coordinates) {
        const lat = Number(details.coordinates.lat || details.coordinates.latitude);
        const lng = Number(details.coordinates.lng || details.coordinates.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // 3. Check for lat/lng at top level
      if (property.latitude && property.longitude) {
        const lat = Number(property.latitude);
        const lng = Number(property.longitude);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // 4. Check for direct lat/lng in property_details
      if (details.lat && details.lng) {
        const lat = Number(details.lat);
        const lng = Number(details.lng);
        
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
      
      // No valid coordinates found
      return null;
    };

    // Extract location data from property
    const extractLocationData = () => {
      // Initialize with empty values
      const data = {
        address: '',
        locality: '',
        city: '',
        state: '',
        pinCode: '',
        landmark: '',
        flatPlotNo: '',
        coordinates: extractCoordinates()
      };
      
      // Parse property_details if needed
      let details = property.property_details || {};
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
        } catch (e) {
          console.error("Failed to parse property_details string:", e);
          details = {};
        }
      }
      
      // NEW: Use dynamic location step detection
      if (details.steps) {
        const { stepKey, locationData: stepLocationData } = findLocationStep(details.steps);
        
        if (stepLocationData) {
          console.log(`[PropertyLocationSection] Found location data in step ${stepKey}:`, stepLocationData);
          
          data.address = stepLocationData.address || '';
          data.locality = stepLocationData.locality || '';
          data.city = stepLocationData.city || '';
          data.state = stepLocationData.state || '';
          data.pinCode = stepLocationData.pinCode || '';
          data.landmark = stepLocationData.landmark || '';
          data.flatPlotNo = stepLocationData.flatPlotNo || '';
          
          // Return early since we found good data
          return data;
        }
      }
      
      // Check for location in property (v2 format) - fallback
      if (property.location) {
        console.log("Found location in property.location:", property.location);
        
        data.address = property.location.address || '';
        data.locality = property.location.locality || '';
        data.city = property.location.city || '';
        data.state = property.location.state || '';
        data.pinCode = property.location.pinCode || '';
        data.landmark = property.location.landmark || '';
        data.flatPlotNo = property.location.flatPlotNo || '';
      } 
      // Fallback to property fields and details
      else {
        console.log("Using fallback location extraction");
        
        data.address = property.address || details.address || '';
        data.locality = property.locality || details.locality || '';
        data.city = property.city || details.city || '';
        data.state = property.state || details.state || '';
        data.pinCode = property.pinCode || property.zip_code || details.pinCode || '';
        data.landmark = property.landmark || details.landmark || '';
        data.flatPlotNo = property.flatPlotNo || details.flatPlotNo || '';
      }
      
      console.log("Extracted location data:", data);
      return data;
    };

    // Update state with extracted data
    setLocationData(extractLocationData());
  }, [property]);

  // Function to toggle nearby properties
  const handleToggleNearbyProperties = async () => {
    if (!locationData.coordinates) {
      toast({
        title: "Location not available",
        description: "Property coordinates are required to find nearby properties.",
        variant: "destructive"
      });
      return;
    }

    if (showNearbyProperties) {
      // Hide nearby properties
      setShowNearbyProperties(false);
      setNearbyProperties([]);
      toast({
        title: "Nearby properties hidden",
        description: "Map now shows only the current property.",
        variant: "default"
      });
    } else {
      // Show nearby properties
      setLoadingNearbyProperties(true);
      
      try {
        console.log('[PropertyLocationSection] Fetching nearby properties...');
        const nearby = await fetchNearbyProperties(
          property.id,
          locationData.coordinates.lat,
          locationData.coordinates.lng,
          5, // 5km radius
          10 // limit to 10 properties
        );
        
        console.log(`[PropertyLocationSection] Found ${nearby.length} nearby properties`);
        setNearbyProperties(nearby);
        setShowNearbyProperties(true);
        
        toast({
          title: "Nearby properties loaded",
          description: `Found ${nearby.length} properties within 5km radius.`,
          variant: "default"
        });
      } catch (error) {
        console.error('[PropertyLocationSection] Error fetching nearby properties:', error);
        toast({
          title: "Error loading nearby properties",
          description: "Something went wrong. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoadingNearbyProperties(false);
      }
    }
  };

  // Handle loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPinIcon className="h-5 w-5 text-primary" />
            <span>Location</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-[16/9] bg-muted animate-pulse rounded-lg"></div>
          <div className="mt-4 space-y-2">
            <div className="h-5 bg-muted animate-pulse rounded w-3/4"></div>
            <div className="h-5 bg-muted animate-pulse rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle null property
  if (!property) return null;

  // Generate formatted full address
  const getFormattedAddress = () => {
    const parts = [];
    
    if (locationData.flatPlotNo) parts.push(locationData.flatPlotNo);
    if (locationData.address) parts.push(locationData.address);
    if (locationData.locality) parts.push(locationData.locality);
    if (locationData.city) parts.push(locationData.city);
    if (locationData.state) parts.push(locationData.state);
    if (locationData.pinCode) parts.push(locationData.pinCode);
    
    if (parts.length === 0) {
      return property.address || "Address not available";
    }
    
    return parts.join(', ');
  };

  // Get formatted address and check if we have coordinates
  const formattedAddress = getFormattedAddress();
  const hasCoordinates = locationData.coordinates !== null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-primary" />
          <span>Location</span>
        </CardTitle>
        
        {/* Nearby Properties toggle button */}
        {hasCoordinates && (
          <Button 
            variant={showNearbyProperties ? "default" : "outline"}
            size="sm"
            onClick={handleToggleNearbyProperties}
            disabled={loadingNearbyProperties}
            className="font-medium flex items-center gap-2"
          >
            {loadingNearbyProperties ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPinIcon className="h-4 w-4" />
            )}
            <span>
              {loadingNearbyProperties 
                ? 'Loading...' 
                : showNearbyProperties 
                  ? 'Hide Nearby Properties' 
                  : 'Nearby Properties'
              }
            </span>
            {showNearbyProperties && nearbyProperties.length > 0 && (
              <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                {nearbyProperties.length}
              </span>
            )}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        {/* Map Component with nearby properties */}
        <div className="rounded-lg overflow-hidden border">
          <PropertyLocationMap 
            coordinates={locationData.coordinates}
            address={locationData.address}
            locality={locationData.locality}
            city={locationData.city}
            nearbyProperties={showNearbyProperties ? nearbyProperties : []}
            currentProperty={{
              id: property.id,
              title: property.title || property.property_details?.flow?.title || 'Current Property',
              coordinates: locationData.coordinates
            }}
          />
        </div>
        
        {/* Show nearby properties summary */}
        {showNearbyProperties && nearbyProperties.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <MapPinIcon className="h-4 w-4 text-primary" />
              <span className="font-medium">
                Showing {nearbyProperties.length} nearby properties within 5km radius
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Click markers on the map to view property details
            </div>
          </div>
        )}
        
        {/* Address Display - Show prominently with icon */}
        {formattedAddress !== "Address not available" ? (
          <div className="flex items-start gap-2 mt-4">
            <MapPinIcon className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">
              {formattedAddress}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">Address not available</p>
        )}
        
        {/* Additional Location Details - Icons and values in a grid */}
        {(locationData.landmark || locationData.locality || locationData.flatPlotNo) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 mt-2 border-t border-gray-200">
            {locationData.landmark && (
              <div className="flex items-start gap-2">
                <LandmarkIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Landmark</p>
                  <p className="text-sm">{locationData.landmark}</p>
                </div>
              </div>
            )}
            
            {locationData.locality && (
              <div className="flex items-start gap-2">
                <MapIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Locality</p>
                  <p className="text-sm">{locationData.locality}</p>
                </div>
              </div>
            )}
            
            {locationData.flatPlotNo && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Flat Plot No</p>
                  <p className="text-sm">{locationData.flatPlotNo}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyLocationSection;