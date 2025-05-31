// src/pages/FindPage.tsx
// Version: 3.0.0
// Last Modified: 01-06-2025 19:00 IST
// Purpose: Find page with real search integration using searchService

import React, { useState, useCallback } from 'react';
import { SearchContainer, SearchFilters, searchService } from '@/components/Search';
import PropertyListingPanel from '@/modules/seeker/components/PropertyListingPanel';
import { PropertyType } from '@/modules/owner/components/property/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const FindPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Search and property state
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  
  // Property interaction state
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<PropertyType | null>(null);
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set());
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Handle search from SearchContainer
  const handleSearch = useCallback(async (filters: SearchFilters) => {
    console.log('FindPage: Search initiated with filters:', filters);
    
    setCurrentFilters(filters);
    setCurrentPage(1);
    setLoading(true);
    setProperties([]);
    
    try {
      // Use the actual search service
      const response = await searchService.search(filters, {
        page: 1,
        limit: 20
      });
      
      console.log('FindPage: Search response:', response);
      console.log('FindPage: First property structure:', response.results?.[0]);
      console.log('FindPage: First property images:', response.results?.[0]?.property_details);
      
      setProperties(response.results || []);
      setTotalCount(response.totalCount || 0);
      setHasMore((response.results?.length || 0) < (response.totalCount || 0));
      
      if (response.results?.length === 0) {
        toast({
          title: "No properties found",
          description: "Try adjusting your search filters",
          duration: 3000,
        });
      }
      
    } catch (error) {
      console.error('FindPage: Search failed:', error);
      setProperties([]);
      setTotalCount(0);
      setHasMore(false);
      
      toast({
        title: "Search Failed",
        description: "Unable to search properties. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle load more properties
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !currentFilters) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      const response = await searchService.search(currentFilters, {
        page: nextPage,
        limit: 20
      });
      
      console.log('FindPage: Load more response:', response);
      
      setProperties(prev => [...prev, ...(response.results || [])]);
      setHasMore((properties.length + (response.results?.length || 0)) < (response.totalCount || 0));
      setCurrentPage(nextPage);
      
    } catch (error) {
      console.error('FindPage: Load more failed:', error);
      toast({
        title: "Load More Failed",
        description: "Unable to load more properties. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, currentFilters, currentPage, properties.length, toast]);

  // Handle property hover
  const handlePropertyHover = useCallback((propertyId: string, isHovering: boolean) => {
    setHoveredProperty(isHovering ? propertyId : null);
  }, []);

  // Handle favorite action
  const handleFavoriteAction = useCallback(async (propertyId: string, isLiked: boolean): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites",
        duration: 3000,
      });
      return false;
    }

    try {
      // TODO: Replace with actual favorite API call
      console.log(`FindPage: ${isLiked ? 'Adding' : 'Removing'} property ${propertyId} ${isLiked ? 'to' : 'from'} favorites`);
      
      // Update favorites state
      setFavoriteProperties(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(propertyId);
        } else {
          newSet.delete(propertyId);
        }
        return newSet;
      });
      
      toast({
        title: isLiked ? "Added to favorites" : "Removed from favorites",
        description: `Property ${isLiked ? 'added to' : 'removed from'} your favorites`,
        duration: 2000,
      });
      
      return true;
    } catch (error) {
      console.error('FindPage: Favorite action failed:', error);
      return false;
    }
  }, [user, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Container - Override its default styling */}
      <div className="bg-background">
        <SearchContainer 
          onSearch={handleSearch}
          showResults={false}
          className="min-h-0" // Override the min-h-screen
        />
      </div>
      
      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search prompt when no search performed */}
        {!currentFilters && !loading && properties.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Find Your Perfect Property</h2>
            <p className="text-muted-foreground">
              Use the search filters above to find properties that match your requirements
            </p>
          </div>
        )}
        
        {/* Results grid */}
        {(currentFilters || properties.length > 0 || loading) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property List */}
            <div className="h-[600px]">
              <PropertyListingPanel
                properties={properties}
                loading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                totalCount={totalCount}
                onLoadMore={handleLoadMore}
                onFavoriteAction={handleFavoriteAction}
                handlePropertyHover={handlePropertyHover}
                hoveredProperty={hoveredProperty}
                setActiveProperty={setActiveProperty}
                favoriteProperties={favoriteProperties}
                isLoadingFavorites={isLoadingFavorites}
              />
            </div>
            
            {/* Map/Details */}
            <div className="h-[600px] bg-card rounded-xl border flex items-center justify-center">
              <div className="text-center">
                {activeProperty ? (
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{activeProperty.title}</h3>
                    <p className="text-muted-foreground mb-4">Property details will be displayed here</p>
                    <p className="text-sm text-muted-foreground">
                      Integration with property details and map view
                    </p>
                  </div>
                ) : (
                  <div className="p-6">
                    <h3 className="text-lg font-medium mb-2">Property Map & Details</h3>
                    <p className="text-muted-foreground">
                      {properties.length === 0 
                        ? "Search for properties to view results" 
                        : "Select a property to view details and location"}
                    </p>
                    {totalCount > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Found {totalCount} properties
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPage;