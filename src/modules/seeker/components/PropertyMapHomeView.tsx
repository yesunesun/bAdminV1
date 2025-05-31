// src/modules/seeker/components/PropertyMapHomeView.tsx
// Version: 4.3.0
// Last Modified: 01-06-2025 15:05 IST
// Purpose: Added logic to revert to default results when all filters are cleared

import React, { useState, useEffect, useCallback } from 'react';
import { useGoogleMaps } from '../hooks/useGoogleMaps';
import { SearchContainer, SearchFilters, SearchResult } from '@/components/Search';
import PropertyListingPanel from './PropertyListingPanel';
import MapPanel from './MapPanel';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getUserFavorites, togglePropertyLike } from '../services/seekerService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface PropertyMapHomeViewProps {
  onFavoriteAction?: (propertyId: string) => boolean;
}

// Union type for handling both legacy and search results
type PropertyData = SearchResult;

const PropertyMapHomeView: React.FC<PropertyMapHomeViewProps> = ({ onFavoriteAction }) => {
  // Favorites state management
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());
  const [isLoadingFavorites, setIsLoadingFavorites] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Search-specific state (replacing usePropertyMapData for search results)
  const [searchProperties, setSearchProperties] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(true); // Start with loading true
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);
  const [activeProperty, setActiveProperty] = useState<PropertyData | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Use the centralized Google Maps loading hook
  const { isLoaded: mapsLoaded, loadError } = useGoogleMaps(searchProperties);

  // Load latest properties on component mount (DEFAULT BEHAVIOR)
  useEffect(() => {
    const loadLatestProperties = async () => {
      console.log('🏠 Loading latest properties on homepage mount...');
      setSearchLoading(true);
      
      try {
        // Import searchService dynamically to avoid circular imports
        console.log('📦 Importing searchService...');
        const { searchService } = await import('@/components/Search/services/searchService');
        console.log('✅ SearchService imported successfully');
        
        // Get latest properties using the SQL function
        console.log('🔍 Calling getLatestProperties...');
        const response = await searchService.getLatestProperties(50);
        
        console.log('🏠 Latest properties loaded:', response);
        
        // Update search state with latest properties
        setSearchProperties(response.results || []);
        setSearchTotalCount(response.totalCount || 0);
        setActiveProperty(null);
        setHoveredProperty(null);
        
        console.log(`✅ Homepage initialized with ${response.results?.length || 0} latest properties`);
        
      } catch (error) {
        console.error('❌ Failed to load latest properties:', error);
        console.error('❌ Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
        
        // Set empty state on error but don't show error toast immediately
        setSearchProperties([]);
        setSearchTotalCount(0);
        
        // Only show error toast if it's not a network/loading issue
        if (!error.message?.includes('fetch')) {
          toast({
            title: "Loading Error",
            description: "Unable to load latest properties. Please refresh the page.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } finally {
        setSearchLoading(false);
      }
    };
    
    // Add a small delay to ensure component is fully mounted
    const timeoutId = setTimeout(loadLatestProperties, 100);
    
    return () => clearTimeout(timeoutId);
  }, []); // Empty dependency array - only run on mount
  
  // Handle property hover
  const handlePropertyHover = useCallback((propertyId: string, isHovering: boolean) => {
    setHoveredProperty(isHovering ? propertyId : null);
  }, []);
  
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

  // Handle search from SearchContainer (OVERRIDE default latest properties OR revert to defaults)
  const handleSearchFromContainer = useCallback(async (searchFilters: SearchFilters) => {
    console.log('PropertyMapHomeView: Search initiated from SearchContainer with filters:', searchFilters);
    
    setSearchLoading(true);
    
    try {
      // Import searchService dynamically to avoid circular imports
      const { searchService } = await import('@/components/Search/services/searchService');
      
      // Check if all filters are empty/default - if so, load latest properties instead of searching
      const areFiltersEmpty = !searchFilters.searchQuery && 
                             (!searchFilters.selectedLocation || searchFilters.selectedLocation === 'any') &&
                             !searchFilters.transactionType && 
                             !searchFilters.selectedPropertyType && 
                             !searchFilters.selectedSubType && 
                             !searchFilters.selectedBHK && 
                             !searchFilters.selectedPriceRange;
      
      let response;
      
      if (areFiltersEmpty) {
        console.log('🏠 Empty filters detected - loading default latest properties...');
        // Load default latest properties when filters are empty (including when cleared)
        response = await searchService.getLatestProperties(50);
      } else {
        console.log('🔍 Performing filtered search...');
        // Perform the search using searchService
        response = await searchService.search(searchFilters, {
          page: 1,
          limit: 50
        });
      }
      
      console.log('PropertyMapHomeView: Search response:', response);
      
      // Update search state
      setSearchProperties(response.results || []);
      setSearchTotalCount(response.totalCount || 0);
      setActiveProperty(null);
      setHoveredProperty(null);
      
      if (response.results?.length === 0) {
        toast({
          title: "No properties found",
          description: areFiltersEmpty ? "No properties available" : "Try adjusting your search filters",
          duration: 3000,
        });
      } else {
        const resultType = areFiltersEmpty ? 'latest properties' : 'search results';
        console.log(`✅ ${resultType} loaded: ${response.results?.length || 0} properties found`);
      }
      
    } catch (error) {
      console.error('PropertyMapHomeView: Search failed:', error);
      setSearchProperties([]);
      setSearchTotalCount(0);
      
      toast({
        title: "Search Failed",
        description: "Unable to search properties. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setSearchLoading(false);
    }
  }, [toast]);
  
  // Preload fallback image with visual performance indicator
  useEffect(() => {
    const img = new Image();
    img.src = '/apartment.jpg';
  }, []);

  // Comprehensive error handling with user feedback
  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-background p-6" style={{ height: 'calc(100vh - 200px)' }}>
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
    <div className="flex flex-col bg-background text-foreground" style={{ height: 'calc(100vh - 200px)' }}>
      {/* SearchContainer - Replacing CompactSearchBar */}
      <div className="bg-background border-b border-border">
        <SearchContainer 
          onSearch={handleSearchFromContainer}
          showResults={false}
          className="min-h-0 shadow-none" // Override default styling
        />
      </div>
      
      {/* Main Content - Responsive layout (full width on mobile, split on desktop) */}
      <div className="flex-grow flex w-full overflow-hidden">
        {/* Property Listings Panel - Full width on mobile, 1/3 width on desktop */}
        <div className="w-full md:w-1/3 h-full">
          <PropertyListingPanel
            properties={searchProperties}
            loading={searchLoading}
            loadingMore={false} // No load more for search results yet
            hasMore={false} // No load more for search results yet
            totalCount={searchTotalCount}
            onLoadMore={() => {}} // No load more for search results yet
            onFavoriteAction={handleFavoriteToggle}
            handlePropertyHover={handlePropertyHover}
            hoveredProperty={hoveredProperty}
            setActiveProperty={setActiveProperty}
            favoriteProperties={favoriteProperties}
            isLoadingFavorites={isLoadingFavorites}
          />
        </div>
        
        {/* Map Panel - Hidden on mobile, 2/3 width on desktop */}
        <div className="hidden md:block md:w-2/3 h-full">
          {mapsLoaded ? (
            <MapPanel
              properties={searchProperties}
              isLoaded={mapsLoaded}
              loadError={loadError}
              activeProperty={activeProperty}
              setActiveProperty={setActiveProperty}
              hoveredPropertyId={hoveredProperty}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center p-6">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading maps...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyMapHomeView;