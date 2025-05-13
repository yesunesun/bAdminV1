// src/modules/seeker/components/PropertyDetails/PropertyLocationMapDiagnostic.tsx
// Version: 1.0.0
// Last Modified: 15-05-2025 11:30 IST
// Purpose: Diagnostic version to identify Google Maps loading issues

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MapIcon, ExternalLinkIcon, AlertTriangleIcon } from 'lucide-react';

// This is the component we'll temporarily use to replace the normal map component

interface PropertyLocationMapDiagnosticProps {
  coordinates?: {
    lat?: number | string;
    lng?: number | string;
    latitude?: number | string;
    longitude?: number | string;
  };
  address?: string;
  locality?: string;
  city?: string;
}

const PropertyLocationMapDiagnostic: React.FC<PropertyLocationMapDiagnosticProps> = ({
  coordinates,
  address,
  locality,
  city
}) => {
  const [diagnosticLog, setDiagnosticLog] = useState<string[]>([]);
  const [mapStatus, setMapStatus] = useState<'loading' | 'success' | 'error' | 'nodata'>('loading');
  const [googleApiStatus, setGoogleApiStatus] = useState<'loading' | 'loaded' | 'error' | 'not_attempted'>('not_attempted');
  const mapContainer = useRef<HTMLDivElement>(null);
  const iframeContainer = useRef<HTMLDivElement>(null);

  // Add to diagnostic log
  const logDiagnostic = (message: string) => {
    console.log(`[MAP DIAGNOSTIC] ${message}`);
    setDiagnosticLog(prev => [...prev, message]);
  };

  // Check if Google Maps API is available
  const checkGoogleMapsApi = () => {
    if (window.google && window.google.maps) {
      logDiagnostic("Google Maps API is available globally");
      setGoogleApiStatus('loaded');
      return true;
    }
    logDiagnostic("Google Maps API is NOT available globally");
    return false;
  };

  // Check coordinates
  const validateCoordinates = () => {
    logDiagnostic(`Coordinates received: ${JSON.stringify(coordinates)}`);
    
    if (!coordinates) {
      logDiagnostic("No coordinates provided");
      return null;
    }
    
    try {
      const lat = parseFloat(String(coordinates.lat || coordinates.latitude || ''));
      const lng = parseFloat(String(coordinates.lng || coordinates.longitude || ''));
      
      if (isNaN(lat) || isNaN(lng)) {
        logDiagnostic(`Invalid coordinates (NaN): lat=${lat}, lng=${lng}`);
        return null;
      }
      
      if (lat === 0 && lng === 0) {
        logDiagnostic("Zero coordinates detected (0,0)");
        return null;
      }
      
      logDiagnostic(`Valid coordinates: lat=${lat}, lng=${lng}`);
      return { lat, lng };
    } catch (error) {
      logDiagnostic(`Error parsing coordinates: ${error}`);
      return null;
    }
  };

  // Try to load Google Maps API
  const loadGoogleMapsApi = () => {
    logDiagnostic("Attempting to load Google Maps API");
    setGoogleApiStatus('loading');
    
    // Check if already loaded
    if (checkGoogleMapsApi()) {
      return;
    }
    
    // Check if script is already being loaded
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      logDiagnostic("Google Maps script tag already exists");
      existingScript.addEventListener('load', () => {
        logDiagnostic("Existing Google Maps script loaded");
        setGoogleApiStatus('loaded');
      });
      existingScript.addEventListener('error', () => {
        logDiagnostic("Error loading existing Google Maps script");
        setGoogleApiStatus('error');
      });
      return;
    }
    
    // Load the script
    try {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      
      // Try different API keys and configurations
      const apiKeys = [
        // Default key (should be replaced with the project's actual key)
        'AIzaSyC5vAgb-nawregVpZAVRmbjupJ7LqkyU-c',
        // Fallback to a universal key-free URL as last resort
        ''
      ];
      
      const apiKey = apiKeys[0]; // Use first key
      
      if (apiKey) {
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        logDiagnostic(`Loading Google Maps with API key (starts with): ${apiKey.substring(0, 8)}...`);
      } else {
        script.src = `https://maps.googleapis.com/maps/api/js`;
        logDiagnostic("Loading Google Maps WITHOUT API key (not recommended for production)");
      }
      
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        logDiagnostic("Google Maps script loaded successfully");
        setGoogleApiStatus('loaded');
      };
      
      script.onerror = (error) => {
        logDiagnostic(`Google Maps script loading error: ${error}`);
        setGoogleApiStatus('error');
      };
      
      document.head.appendChild(script);
      logDiagnostic("Google Maps script tag added to document head");
    } catch (error) {
      logDiagnostic(`Error setting up Google Maps script: ${error}`);
      setGoogleApiStatus('error');
    }
  };

  // Try initializing the map
  const tryInitializeMap = () => {
    if (!mapContainer.current || !window.google || !window.google.maps) {
      logDiagnostic("Cannot initialize map: Missing container or Google Maps API");
      return false;
    }
    
    const validCoords = validateCoordinates();
    const fallbackCoords = { lat: 17.4381, lng: 78.3924 }; // Prem Sagar Enclave
    
    try {
      logDiagnostic("Initializing Google Map...");
      
      // Use validated coordinates or fallback
      const mapCenter = validCoords || fallbackCoords;
      
      // Create the map
      const map = new google.maps.Map(mapContainer.current, {
        center: mapCenter,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true
      });
      
      // Add a marker
      new google.maps.Marker({
        position: mapCenter,
        map: map,
        title: address || 'Property Location'
      });
      
      logDiagnostic(`Map initialized successfully with center: ${JSON.stringify(mapCenter)}`);
      setMapStatus('success');
      return true;
    } catch (error) {
      logDiagnostic(`Error initializing map: ${error}`);
      setMapStatus('error');
      return false;
    }
  };

  // Try embedding a map iframe as fallback
  const tryEmbedIframe = () => {
    if (!iframeContainer.current) {
      logDiagnostic("Cannot embed iframe: Missing container");
      return false;
    }
    
    try {
      logDiagnostic("Attempting to embed Google Maps iframe...");
      
      const validCoords = validateCoordinates();
      const fallbackCoords = { lat: 17.4381, lng: 78.3924 }; // Prem Sagar Enclave
      const mapCenter = validCoords || fallbackCoords;
      
      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.title = "Property Location";
      
      // Set the iframe source
      iframe.src = `https://www.google.com/maps?q=${mapCenter.lat},${mapCenter.lng}&z=15&output=embed`;
      
      // Clear the container
      iframeContainer.current.innerHTML = '';
      
      // Add the iframe
      iframeContainer.current.appendChild(iframe);
      
      logDiagnostic(`Iframe embedded successfully with coordinates: ${JSON.stringify(mapCenter)}`);
      return true;
    } catch (error) {
      logDiagnostic(`Error embedding iframe: ${error}`);
      return false;
    }
  };

  // Initialize on mount
  useEffect(() => {
    logDiagnostic("Component mounted");
    
    // Log props
    logDiagnostic(`Address: ${address || 'not provided'}`);
    logDiagnostic(`Locality: ${locality || 'not provided'}`);
    logDiagnostic(`City: ${city || 'not provided'}`);
    
    // Check if we have data
    const hasValidCoords = !!validateCoordinates();
    const hasAddressData = !!(address || locality || city);
    
    if (!hasValidCoords && !hasAddressData) {
      logDiagnostic("No location data available");
      setMapStatus('nodata');
      return;
    }
    
    // Attempt to load Google Maps API
    loadGoogleMapsApi();
    
    // Cleanup
    return () => {
      logDiagnostic("Component unmounting");
    };
  }, []);

  // React when Google API status changes
  useEffect(() => {
    if (googleApiStatus === 'loaded') {
      logDiagnostic("Google Maps API loaded, attempting to initialize map");
      
      // Try to initialize the map
      const mapInitialized = tryInitializeMap();
      
      // If map initialization fails, try iframe as fallback
      if (!mapInitialized) {
        logDiagnostic("Map initialization failed, falling back to iframe");
        tryEmbedIframe();
      }
    } else if (googleApiStatus === 'error') {
      logDiagnostic("Google Maps API failed to load, falling back to iframe");
      
      // Try iframe as fallback when API fails
      tryEmbedIframe();
    }
  }, [googleApiStatus]);

  // Formatted address for links
  const getFormattedAddress = () => {
    const parts = [];
    if (address) parts.push(address);
    if (locality) parts.push(locality);
    if (city) parts.push(city);
    
    if (parts.length === 0) {
      return "Prem Sagar Enclave, Hyderabad";
    }
    
    return parts.join(', ');
  };

  // External maps URL
  const getExternalMapsUrl = () => {
    const validCoords = validateCoordinates();
    
    if (validCoords) {
      return `https://www.google.com/maps/search/?api=1&query=${validCoords.lat},${validCoords.lng}`;
    } else {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getFormattedAddress())}`;
    }
  };

  // Diagnostic display for no data
  if (mapStatus === 'nodata') {
    return (
      <div className="w-full aspect-[16/9] bg-muted/50 rounded-lg flex flex-col items-center justify-center">
        <MapIcon className="h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm mb-1">No location data available</p>
        <p className="text-xs text-muted-foreground/70 max-w-xs text-center mb-3">
          This property doesn't have coordinates or address information.
        </p>
        
        <details className="text-xs text-muted-foreground/70 mt-2">
          <summary>Diagnostic Info</summary>
          <div className="mt-2 max-h-32 overflow-y-auto text-left">
            {diagnosticLog.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </details>
      </div>
    );
  }

  // Loading state
  if (mapStatus === 'loading' || googleApiStatus === 'loading') {
    return (
      <div className="w-full aspect-[16/9] bg-muted/50 rounded-lg flex flex-col items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-muted-foreground text-sm">Loading map...</p>
        
        <details className="text-xs text-muted-foreground/70 mt-4">
          <summary>Diagnostic Info</summary>
          <div className="mt-2 max-h-32 overflow-y-auto text-left">
            {diagnosticLog.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </details>
      </div>
    );
  }

  // Error state
  if (mapStatus === 'error') {
    return (
      <div className="w-full aspect-[16/9] bg-muted/50 rounded-lg flex flex-col items-center justify-center">
        <AlertTriangleIcon className="h-10 w-10 text-amber-500 mb-3" />
        <p className="text-muted-foreground text-sm mb-1">Unable to load map</p>
        <p className="text-xs text-muted-foreground/70 max-w-xs text-center mb-3">
          There was an error loading the map. This could be due to API key issues or network problems.
        </p>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(getExternalMapsUrl(), '_blank')}
          className="flex items-center gap-1 mb-2"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          <span>View on Google Maps</span>
        </Button>
        
        <details className="text-xs text-muted-foreground/70 mt-2">
          <summary>Diagnostic Info</summary>
          <div className="mt-2 max-h-32 overflow-y-auto text-left">
            {diagnosticLog.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </details>
      </div>
    );
  }

  // Normal display - we got here if either the map or iframe initialized successfully
  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full aspect-[16/9] rounded-lg overflow-hidden"
      />
      
      {/* Iframe fallback container */}
      <div 
        ref={iframeContainer}
        className="w-full aspect-[16/9] rounded-lg overflow-hidden"
      />
      
      {/* External link button */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.open(getExternalMapsUrl(), '_blank')}
          className="flex items-center gap-1 rounded-full px-3 shadow-md bg-background/90 backdrop-blur-sm"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
          <span className="text-xs">Open in Google Maps</span>
        </Button>
      </div>
      
      {/* Diagnostic toggle */}
      <div className="absolute bottom-4 left-4">
        <details className="text-xs bg-background/90 backdrop-blur-sm p-2 rounded-md">
          <summary className="cursor-pointer">Show Diagnostic Log</summary>
          <div className="mt-2 max-h-32 overflow-y-auto">
            {diagnosticLog.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
};

export default PropertyLocationMapDiagnostic;