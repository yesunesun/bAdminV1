// src/modules/seeker/components/PropertyMapHomeView.tsx
// Version: 5.4.0
// Last Modified: 02-06-2025 16:00 IST
// Purpose: Implemented functional Load More button with proper pagination logic

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
  
  // Search-specific state with pagination support
  const [searchProperties, setSearchProperties] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [searchTotalCount, setSearchTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
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
        const response = await searchService.getLatestProperties(20); // Start with 20 items
        
        console.log('🏠 Latest properties loaded:', response);
        
        // Update search state with latest properties
        setSearchProperties(response.results || []);
        setSearchTotalCount(response.totalCount || 0);
        setActiveProperty(null);
        setHoveredProperty(null);
        setCurrentPage(1);
        setCurrentFilters(null); // No filters for latest properties
        
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

  // Helper function to check if all filters are empty/default
  const areFiltersEmpty = (searchFilters: SearchFilters): boolean => {
    return !searchFilters.searchQuery && 
           (!searchFilters.selectedLocation || searchFilters.selectedLocation === 'any') &&
           (!searchFilters.actionType || searchFilters.actionType === 'any') && 
           (!searchFilters.selectedPropertyType || searchFilters.selectedPropertyType === 'any') && 
           (!searchFilters.selectedSubType || searchFilters.selectedSubType === 'any') && 
           (!searchFilters.selectedBHK || searchFilters.selectedBHK === 'any') && 
           (!searchFilters.selectedPriceRange || searchFilters.selectedPriceRange === 'any');
  };

  // ENHANCED: Handle search from SearchContainer with 6-character property code detection
  const handleSearchFromContainer = useCallback(async (searchFilters: SearchFilters) => {
    console.log('PropertyMapHomeView: Search initiated from SearchContainer with filters:', searchFilters);
    
    setSearchLoading(true);
    setCurrentPage(1); // Reset to first page for new search
    
    try {
      // Import searchService dynamically to avoid circular imports
      const { searchService } = await import('@/components/Search/services/searchService');
      
      // Check if all filters are empty/default - if so, load latest properties instead of searching
      const filtersEmpty = areFiltersEmpty(searchFilters);
      
      let response;
      
      if (filtersEmpty) {
        console.log('🏠 Empty filters detected - loading default latest properties...');
        // Load default latest properties when filters are empty (including when cleared)
        response = await searchService.getLatestProperties(20);
        setCurrentFilters(null); // No filters for latest properties
      } else {
        console.log('🔍 Performing filtered search...');
        
        // Store current filters for pagination
        setCurrentFilters(searchFilters);
        
        // ADDED: Check if search query looks like a 6-character property code
        const query = searchFilters.searchQuery?.trim();
        if (query && searchService.isPropertyCode(query)) {
          console.log('🎯 Detected 6-character property code, using smart search');
          // Use smart search which tries code search first, then falls back to regular search
          
          // Transform actionType to transactionType for backend compatibility
          const backendFilters = {
            ...searchFilters,
            transactionType: searchFilters.actionType === 'sell' ? 'buy' : 
                            searchFilters.actionType === 'buy' ? 'buy' : 'rent'
          };
          
          response = await searchService.smartSearch(backendFilters, {
            page: 1,
            limit: 20
          });
        } else {
          console.log('🔍 Using regular search (not a 6-character property code)');
          
          // Transform actionType to transactionType for backend compatibility
          const backendFilters = {
            ...searchFilters,
            transactionType: searchFilters.actionType === 'sell' ? 'buy' : 
                            searchFilters.actionType === 'buy' ? 'buy' : 'rent'
          };
          
          // Perform regular search using searchService
          response = await searchService.search(backendFilters, {
            page: 1,
            limit: 20
          });
        }
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
          description: filtersEmpty ? "No properties available" : "Try adjusting your search filters",
          duration: 3000,
        });
      } else {
        const resultType = filtersEmpty ? 'latest properties' : 'search results';
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

  // NEW: Handle Load More functionality
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || searchProperties.length >= searchTotalCount) {
      return; // Already loading or no more items
    }

    console.log('🔄 Loading more properties...');
    setLoadingMore(true);
    
    try {
      const { searchService } = await import('@/components/Search/services/searchService');
      const nextPage = currentPage + 1;
      
      let response;
      
      if (!currentFilters) {
        // Loading more latest properties
        console.log('🏠 Loading more latest properties...');
        response = await searchService.getLatestProperties(20, (nextPage - 1) * 20); // offset calculation
      } else {
        console.log('🔍 Loading more search results...');
        
        // Check if search query looks like a 6-character property code
        const query = currentFilters.searchQuery?.trim();
        if (query && searchService.isPropertyCode(query)) {
          // Transform actionType to transactionType for backend compatibility
          const backendFilters = {
            ...currentFilters,
            transactionType: currentFilters.actionType === 'sell' ? 'buy' : 
                            currentFilters.actionType === 'buy' ? 'buy' : 'rent'
          };
          
          response = await searchService.smartSearch(backendFilters, {
            page: nextPage,
            limit: 20
          });
        } else {
          // Transform actionType to transactionType for backend compatibility
          const backendFilters = {
            ...currentFilters,
            transactionType: currentFilters.actionType === 'sell' ? 'buy' : 
                            currentFilters.actionType === 'buy' ? 'buy' : 'rent'
          };
          
          response = await searchService.search(backendFilters, {
            page: nextPage,
            limit: 20
          });
        }
      }
      
      console.log('🏠 Load more response:', response);
      
      if (response.results && response.results.length > 0) {
        // Append new properties to existing list
        setSearchProperties(prev => [...prev, ...response.results]);
        setCurrentPage(nextPage);
        
        toast({
          title: "Loaded more properties",
          description: `${response.results.length} more properties loaded`,
          duration: 2000,
        });
        
        console.log(`✅ Loaded ${response.results.length} more properties. Total: ${searchProperties.length + response.results.length}`);
      } else {
        toast({
          title: "No more properties",
          description: "All available properties have been loaded",
          duration: 2000,
        });
      }
      
    } catch (error) {
      console.error('❌ Failed to load more properties:', error);
      toast({
        title: "Load More Failed",
        description: "Unable to load more properties. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, searchProperties.length, searchTotalCount, currentPage, currentFilters, toast, searchProperties]);
  
  // Preload fallback image with visual performance indicator
  useEffect(() => {
    const img = new Image();
    img.src = '/apartment.jpg';
  }, []);

  // Comprehensive error handling with user feedback
  if (loadError) {
    return (
      <div className="flex items-center justify-center bg-background p-6 h-[calc(100vh-160px)]">
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
    <div className="flex flex-col bg-background text-foreground h-screen overflow-hidden">
      {/* SearchContainer - Fixed height section */}
      <div className="flex-shrink-0 w-full">
        <SearchContainer 
          onSearch={handleSearchFromContainer}
          showResults={false}
          className="w-full"
        />
      </div>
      
      {/* Main Content Container - Takes remaining height with proper constraints */}
      <div className="flex-1 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-4 h-full">
          {/* Main Content - Fixed height layout with more precise constraints */}
          <div className="flex flex-col md:flex-row gap-4 h-full">
            {/* Property Listings Panel - Fixed height with careful calculation */}
            <div className="w-full md:w-1/3 h-[600px] md:h-full">
              <PropertyListingPanel
                properties={searchProperties}
                loading={searchLoading}
                loadingMore={loadingMore}
                hasMore={searchProperties.length < searchTotalCount}
                totalCount={searchTotalCount}
                onLoadMore={handleLoadMore}
                onFavoriteAction={handleFavoriteToggle}
                handlePropertyHover={handlePropertyHover}
                hoveredProperty={hoveredProperty}
                setActiveProperty={setActiveProperty}
                favoriteProperties={favoriteProperties}
                isLoadingFavorites={isLoadingFavorites}
              />
            </div>
            
            {/* Map Panel - Fixed height with proper constraints */}
            <div className="hidden md:block md:w-2/3 h-full">
              <div className="h-full rounded-2xl overflow-hidden shadow-lg border border-border/50 bg-card">
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
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <div className="text-center p-6">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4"></div>
                      <p className="text-muted-foreground">Loading maps...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMapHomeView;