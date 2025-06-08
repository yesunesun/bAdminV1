// src/modules/admin/pages/PropertyMapView/index.tsx
// Version: 2.1.0
// Last Modified: 01-03-2025 17:00 IST
// Purpose: Added MapLegend component and fixed map container positioning for legend display

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

// Import hooks
import { usePropertyMapData } from './hooks/usePropertyMapData';
import { useGoogleMaps } from './hooks/useGoogleMaps';

// Import components
import { MapContainer } from './components/MapContainer';
import { MapControls } from './components/MapControls';
import {
  LoadingState,
  MapLoadingState,
  ErrorState,
  GoogleMapsErrorState,
  ApiKeyMissingState
} from './components/MapLoadingStates';

export default function PropertyMapView() {
  const {
    properties,
    loading,
    error,
    refresh
  } = usePropertyMapData();
  
  const {
    googleMapsApiKey,
    isLoaded,
    loadError,
    mapInstance,
    infoWindow,
    onMapLoad
  } = useGoogleMaps();

  // Render loading state
  if (loading) {
    return <LoadingState />;
  }

  // Render error state
  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  // Render Google Maps error state
  if (loadError) {
    return <GoogleMapsErrorState error={loadError} />;
  }

  // Check if Google Maps API key is available
  if (!googleMapsApiKey) {
    return <ApiKeyMissingState />;
  }

  // Render map loading state
  if (!isLoaded) {
    return <MapLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <MapControls onRefresh={refresh} />
        </div>

        <div className="px-4 sm:px-0 relative">
          <MapContainer
            properties={properties}
            mapInstance={mapInstance}
            infoWindow={infoWindow}
            onMapLoad={onMapLoad}
            isLoaded={isLoaded}
          />
        </div>

        <div className="mt-4 px-4 sm:px-0">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">
                Displaying {properties.length} published properties on the map
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}