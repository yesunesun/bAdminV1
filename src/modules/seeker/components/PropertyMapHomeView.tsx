// src/modules/seeker/components/PropertyMapHomeView.tsx
// Version: 2.9.0
// Last Modified: 04-04-2025 12:30 IST
// Purpose: Removed recent searches functionality

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { usePropertyMapData } from '../hooks/usePropertyMapData';
import CompactSearchBar from './CompactSearchBar';
import PropertyListingPanel from './PropertyListingPanel';
import MapPanel from './MapPanel';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserFavorites, togglePropertyLike } from '../services/seekerService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Libraries to load
const libraries = ['places'];

interface PropertyMapHomeViewProps {
  onFavoriteAction?: (propertyId: string) => boolean;
}

const PropertyMapHomeView: React.FC<PropertyMapHomeViewProps> = ({ onFavoriteAction }) => {
  // Reference for search input
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Favorites state management
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Memoize API key to prevent unnecessary re-renders
  const apiKey = useMemo(() => import.meta.env.VITE_GOOGLE_MAPS_KEY || '', []);
  
  // Property data and state management - keeping hook calls in consistent order
  const {
    properties,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    loadMoreProperties,
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
  
  // Google Maps script loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries,
    preventGoogleFontsLoading: true
  });
  
  // Load user favorites when component mounts or user changes
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setFavoriteProperties(new Set());
        return;
      }
      
      setIsLoadingFavorites(true);
      try {
        const favorites = await getUserFavorites();
        console.log('Loaded favorites:', favorites);
        
        // Extract IDs into a Set for efficient lookup
        const favoriteIds = new Set(favorites.map(property => property.id));
        setFavoriteProperties(favoriteIds);
        
        console.log('Favorite IDs:', Array.from(favoriteIds));
      } catch (error) {
        console.error('Error fetching user favorites:', error);
        toast({
          title: "Couldn't load favorites",
          description: "There was a problem loading your favorites",
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsLoadingFavorites(false);
      }
    };
    
    fetchFavorites();
  }, [user, toast]);
  
  // Handle favorite toggling with proper feedback
  const handleFavoriteToggle = useCallback(async (propertyId: string, isLiked: boolean) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites",
        duration: 3000,
      });
      return false;
    }
    
    try {
      console.log(`Toggling property ${propertyId} to ${isLiked ? 'liked' : 'not liked'}`);
      
      // Toggle the favorite in the database
      const result = await togglePropertyLike(propertyId, isLiked);
      
      if (result.success) {
        // Update local state on success
        setFavoriteProperties(prev => {
          const updated = new Set(prev);
          if (isLiked) {
            updated.add(propertyId);
          } else {
            updated.delete(propertyId);
          }
          return updated;
        });
        
        // Show success toast
        toast({
          title: isLiked ? "Added to favorites" : "Removed from favorites",
          description: isLiked 
            ? "Property added to your favorites" 
            : "Property removed from your favorites",
          duration: 2000,
        });
        
        return true;
      } else {
        // Show error toast
        toast({
          title: "Action failed",
          description: "There was a problem updating your favorites",
          variant: "destructive",
          duration: 3000,
        });
        return false;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
      return false;
    }
  }, [user, toast]);
  
  // Preload fallback image with visual performance indicator
  useEffect(() => {
    const img = new Image();
    img.src = '/apartment.jpg';
  }, []);

  // Comprehensive error handling with user feedback
  if (loadError) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-background p-6">
        <div className="text-center max-w-md bg-card p-8 rounded-lg shadow-lg border border-border">
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
      {/* Optimized search section with proper spacing */}
      <div className="px-4 sm:px-6 pt-4 pb-2">
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
        />
      </div>
      
      {/* Main Content - Optimized Split View with improved responsiveness */}
      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
        {/* Property Listings Panel with optimized rendering */}
        <PropertyListingPanel
          properties={properties}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          totalCount={totalCount}
          onLoadMore={loadMoreProperties}
          onFavoriteAction={handleFavoriteToggle}
          handlePropertyHover={handlePropertyHover}
          hoveredProperty={hoveredProperty}
          setActiveProperty={setActiveProperty}
          favoriteProperties={favoriteProperties}
          isLoadingFavorites={isLoadingFavorites}
        />
        
        {/* Map Panel with lazy loading optimization */}
        {isLoaded ? (
          <MapPanel
            properties={properties}
            isLoaded={isLoaded}
            loadError={loadError}
            activeProperty={activeProperty}
            setActiveProperty={setActiveProperty}
            hoveredProperty={hoveredProperty}
          />
        ) : (
          <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-muted">
            <div className="text-center p-6">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading maps...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyMapHomeView;