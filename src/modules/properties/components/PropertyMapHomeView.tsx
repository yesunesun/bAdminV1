// src/modules/properties/components/PropertyMapHomeView.tsx
// Version: 3.0.0
// Last Modified: 02-04-2025 18:10 IST
// Purpose: Updated component with filters in the top section and improved map synchronization

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { usePropertyMapData } from '../hooks/usePropertyMapData';
import CompactSearchBar from './CompactSearchBar';
import PropertyListingPanel from './PropertyListingPanel';
import MapPanel from './MapPanel';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RecentSearches from './RecentSearches';

// Libraries to load
const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ['places'];

interface PropertyMapHomeViewProps {
  onFavoriteAction: (propertyId: string) => boolean;
}

const PropertyMapHomeView: React.FC<PropertyMapHomeViewProps> = ({ onFavoriteAction }) => {
  // Property data and state management
  const {
    properties,
    loading,
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    selectedPropertyType,
    hoveredProperty,
    activeProperty,
    setActiveProperty,
    handleResetFilters,
    handlePropertyTypeChange,
    handlePropertyHover,
    recentSearches,
    searchLocations
  } = usePropertyMapData();
  
  // Memoize API key to prevent unnecessary re-renders
  const apiKey = useMemo(() => import.meta.env.VITE_GOOGLE_MAPS_KEY, []);
  
  // Google Maps script loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
    preventGoogleFontsLoading: true
  });
  
  // State for showing recent searches
  const [showRecentSearches, setShowRecentSearches] = useState<boolean>(false);
  
  // Focus search input on search click
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Preload fallback image
  useEffect(() => {
    const img = new Image();
    img.src = '/apartment.jpg';
  }, []);

  // Comprehensive error handling
  if (loadError) {
    console.error('Google Maps Load Error:', loadError);
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md bg-card p-8 rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3 text-foreground">Map Loading Failed</h2>
          <p className="text-muted-foreground mb-4">
            We couldn't load the Google Maps component. This could be due to network issues or an API configuration problem.
          </p>
          <p className="text-xs text-muted-foreground mb-6 bg-muted p-3 rounded text-left overflow-auto">
            {loadError.message}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
            <Button onClick={() => window.location.href = '/home'}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-background text-foreground">
      {/* Compact Search Bar with filters in top section */}
      <CompactSearchBar
        ref={searchInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchLocations={searchLocations}
        selectedPropertyType={selectedPropertyType}
        handlePropertyTypeChange={handlePropertyTypeChange}
        filters={filters}
        setFilters={setFilters}
        handleResetFilters={handleResetFilters}
        onFocus={() => setShowRecentSearches(true)}
        onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
      />
      
      {/* Recent Searches Dropdown */}
      {showRecentSearches && (
        <RecentSearches
          searches={recentSearches}
          onSelect={(query) => {
            setSearchQuery(query);
            setShowRecentSearches(false);
          }}
          onClear={() => {
            // Clear recent searches
            localStorage.removeItem('recentSearches');
            // Force reload to reflect the cleared searches
            window.location.reload();
          }}
        />
      )}
      
      {/* Main Content - Split View */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Property Listings Panel - Simplified without the filters section */}
        <PropertyListingPanel
          properties={properties}
          loading={loading}
          onFavoriteAction={onFavoriteAction}
          handlePropertyHover={handlePropertyHover}
          hoveredProperty={hoveredProperty}
          setActiveProperty={setActiveProperty}
        />
        
        {/* Map Panel with improved property syncing */}
        {isLoaded && (
          <MapPanel
            properties={properties}
            isLoaded={isLoaded}
            loadError={loadError}
            activeProperty={activeProperty}
            setActiveProperty={setActiveProperty}
            hoveredProperty={hoveredProperty}
          />
        )}
      </div>
    </div>
  );
};

export default PropertyMapHomeView;