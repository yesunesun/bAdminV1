// src/modules/properties/components/MapPanel.tsx
// Version: 3.0.0
// Last Modified: 02-04-2025 18:20 IST
// Purpose: Fixed map to display property markers with proper synchronization

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { PropertyType } from '@/modules/owner/components/property/types';
import { DEFAULT_MAP_CENTER } from '../hooks/useGoogleMaps';
import { formatPrice } from '../services/propertyMapService';
import { Link } from 'react-router-dom';
import { MapPin, ArrowUpRight, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Colored marker URLs from Google Maps
const markerPins = {
  residential: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
  apartment: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
  commercial: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
  land: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
  office: 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
  shop: 'https://maps.google.com/mapfiles/ms/icons/pink-dot.png',
  default: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
};

interface MapPanelProps {
  properties: PropertyType[];
  isLoaded: boolean;
  loadError: Error | null;
  activeProperty: PropertyType | null;
  setActiveProperty: (property: PropertyType | null) => void;
  hoveredProperty: string | null;
}

const MapPanel: React.FC<MapPanelProps> = ({
  properties,
  isLoaded,
  loadError,
  activeProperty,
  setActiveProperty,
  hoveredProperty
}) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapClickListener, setMapClickListener] = useState<google.maps.MapsEventListener | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Map options
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    clickableIcons: false,
    scrollwheel: true,
    zoomControl: false, // We'll add our own zoom controls
    mapTypeControl: false,
    fullscreenControl: false,
    streetViewControl: false,
    gestureHandling: "greedy",
    maxZoom: 18,
    minZoom: 4,
    styles: [
      {
        featureType: "poi",
        stylers: [
          { visibility: "off" }
        ]
      }
    ]
  };
  
  // Helper function to get marker pin based on property type
  const getMarkerPin = (property: PropertyType) => {
    const propertyType = property.property_details?.propertyType?.toLowerCase() || '';
    
    if (propertyType.includes('apartment')) {
      return markerPins.apartment;
    } else if (propertyType.includes('residential') || propertyType.includes('house')) {
      return markerPins.residential;
    } else if (propertyType.includes('office')) {
      return markerPins.office;
    } else if (propertyType.includes('shop') || propertyType.includes('retail')) {
      return markerPins.shop;
    } else if (propertyType.includes('commercial')) {
      return markerPins.commercial;
    } else if (propertyType.includes('land') || propertyType.includes('plot')) {
      return markerPins.land;
    }
    
    return markerPins.default;
  };
  
  // Handle map load
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;

// src/modules/properties/components/MapPanel.tsx (continued)
   
   // Add click listener to close info window when clicking elsewhere on map
   const listener = map.addListener('click', () => {
     setActiveProperty(null);
   });
   setMapClickListener(listener);
   
   // Fit map to bounds of all properties
   if (properties.length > 0) {
     const bounds = new google.maps.LatLngBounds();
     
     properties.forEach(property => {
       const lat = parseFloat(property.property_details?.latitude || '0');
       const lng = parseFloat(property.property_details?.longitude || '0');
       
       if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
         bounds.extend({ lat, lng });
       }
     });
     
     if (!bounds.isEmpty()) {
       map.fitBounds(bounds);
       // Don't zoom in too far on small data sets
       const listener = google.maps.event.addListener(map, 'idle', () => {
         if (map.getZoom() > 16) map.setZoom(16);
         google.maps.event.removeListener(listener);
       });
     }
   }
 }, [properties, setActiveProperty]);
 
 // When hoveredProperty changes, adjust the map center if needed
 useEffect(() => {
   if (hoveredProperty && mapRef.current) {
     const hoveredProp = properties.find(p => p.id === hoveredProperty);
     if (hoveredProp) {
       const lat = parseFloat(hoveredProp.property_details?.latitude || '0');
       const lng = parseFloat(hoveredProp.property_details?.longitude || '0');
       
       if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
         // Only adjust center if the property is outside the visible area
         const bounds = mapRef.current.getBounds();
         const latLng = new google.maps.LatLng(lat, lng);
         
         if (bounds && !bounds.contains(latLng)) {
           mapRef.current.panTo(latLng);
         }
       }
     }
   }
 }, [hoveredProperty, properties]);
 
 // Zoom in
 const handleZoomIn = () => {
   if (mapRef.current) {
     mapRef.current.setZoom((mapRef.current.getZoom() || 12) + 1);
   }
 };
 
 // Zoom out
 const handleZoomOut = () => {
   if (mapRef.current) {
     mapRef.current.setZoom((mapRef.current.getZoom() || 12) - 1);
   }
 };
 
 // Toggle fullscreen
 const toggleFullscreen = () => {
   setIsFullscreen(!isFullscreen);
 };
 
 // Cleanup map listener on unmount
 React.useEffect(() => {
   return () => {
     if (mapClickListener) {
       google.maps.event.removeListener(mapClickListener);
     }
   };
 }, [mapClickListener]);
 
 return (
   <div className={`h-full relative transition-all duration-300 ${
     isFullscreen ? 'w-full' : 'w-full lg:w-2/3'
   }`}>
     {isLoaded ? (
       <>
         <GoogleMap
           mapContainerClassName="w-full h-full p-2"
           mapContainerStyle={{ 
             width: '100%',
             height: '100%',
             borderRadius: '8px',
             margin: '8px'
           }}
           center={DEFAULT_MAP_CENTER}
           zoom={12}
           options={mapOptions}
           onLoad={onMapLoad}
         >
           {/* Property Markers */}
           {properties.map((property) => {
             const lat = parseFloat(property.property_details?.latitude || '0');
             const lng = parseFloat(property.property_details?.longitude || '0');
             
             if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
               return null;
             }
             
             const isHovered = hoveredProperty === property.id;
             const isActive = activeProperty?.id === property.id;
             
             return (
               <Marker
                 key={property.id}
                 position={{ lat, lng }}
                 icon={{
                   url: getMarkerPin(property),
                   scaledSize: new google.maps.Size(
                     isHovered || isActive ? 40 : 32, 
                     isHovered || isActive ? 40 : 32
                   ),
                   origin: new google.maps.Point(0, 0),
                   anchor: new google.maps.Point(16, 32),
                 }}
                 animation={isHovered ? google.maps.Animation.BOUNCE : undefined}
                 onClick={() => setActiveProperty(property)}
                 zIndex={isHovered || isActive ? 1000 : undefined}
               />
             );
           })}
           
           {/* Info Window for active property */}
           {activeProperty && (
             <InfoWindow
               position={{
                 lat: parseFloat(activeProperty.property_details?.latitude || '0'),
                 lng: parseFloat(activeProperty.property_details?.longitude || '0')
               }}
               onCloseClick={() => setActiveProperty(null)}
               options={{
                 pixelOffset: new google.maps.Size(0, -32),
                 maxWidth: 300
               }}
             >
               <div className="max-w-xs">
                 <div className="flex items-center gap-2 border-b pb-2 mb-2">
                   <MapPin className="h-4 w-4 text-primary" />
                   <h3 className="font-medium text-sm truncate">
                     {activeProperty.title}
                   </h3>
                 </div>
                 
                 <div className="mb-2">
                   <p className="text-sm text-muted-foreground mb-1">
                     {activeProperty.address || 'Location not specified'}
                   </p>
                   <p className="text-base font-bold">
                     {formatPrice(activeProperty.price || 0)}
                   </p>
                 </div>
                 
                 <div className="text-xs text-muted-foreground mb-3">
                   <div className="flex gap-2">
                     {activeProperty.bedrooms && (
                       <span>{activeProperty.bedrooms} Beds</span>
                     )}
                     {activeProperty.bathrooms && (
                       <span>• {activeProperty.bathrooms} Baths</span>
                     )}
                     {activeProperty.square_feet && (
                       <span>• {activeProperty.square_feet} sq.ft</span>
                     )}
                   </div>
                 </div>
                 
                 <Link 
                   to={`/seeker/property/${activeProperty.id}`}
                   className="flex items-center justify-center gap-1 text-xs bg-primary text-primary-foreground p-2 rounded-md w-full hover:bg-primary/90 transition-colors"
                 >
                   <span>View Details</span>
                   <ArrowUpRight className="h-3.5 w-3.5" />
                 </Link>
               </div>
             </InfoWindow>
           )}
         </GoogleMap>
         
         {/* Map Controls */}
         <div className="absolute top-6 right-6 flex flex-col gap-2">
           <Button 
             variant="secondary" 
             size="icon" 
             className="h-8 w-8 rounded-full shadow-md"
             onClick={handleZoomIn}
           >
             <ZoomIn className="h-4 w-4" />
           </Button>
           <Button 
             variant="secondary" 
             size="icon" 
             className="h-8 w-8 rounded-full shadow-md"
             onClick={handleZoomOut}
           >
             <ZoomOut className="h-4 w-4" />
           </Button>
           <Button 
             variant="secondary" 
             size="icon" 
             className="h-8 w-8 rounded-full shadow-md"
             onClick={toggleFullscreen}
           >
             {isFullscreen ? 
               <Minimize className="h-4 w-4" /> : 
               <Maximize className="h-4 w-4" />
             }
           </Button>
         </div>
       </>
     ) : (
       <div className="w-full h-full flex items-center justify-center bg-muted m-2 rounded-lg">
         <div className="text-center p-4">
           <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
           <h3 className="text-lg font-medium mb-2">Map Loading</h3>
           <p className="text-muted-foreground">
             Please wait while we load the map...
           </p>
         </div>
       </div>
     )}
   </div>
 );
};

export default MapPanel;