// src/pages/FindPage.tsx
// Version: 3.6.0
// Last Modified: 02-06-2025 00:20 IST
// Purpose: Added default loading of latest properties on page load and filter reset

import React, { useState, useCallback, useEffect } from 'react';
import { SearchContainer, SearchFilters, searchService } from '@/components/Search';
import PropertyGridPanel from '@/modules/seeker/components/PropertyGridPanel';
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

  // Load latest properties function
  const loadLatestProperties = useCallback(async () => {
    console.log('FindPage: Loading latest properties...');
    
    setLoading(true);
    setProperties([]);
    setCurrentPage(1);
    setTotalCount(0);
    setHasMore(false);
    setActiveProperty(null);
    
    try {
      // Use searchService to get latest properties with empty/default filters
      const defaultFilters: SearchFilters = {
        searchQuery: '',
        selectedLocation: 'any',
        actionType: 'any',
        selectedPropertyType: 'any',
        selectedSubType: 'any',
        selectedBHK: 'any',
        selectedPriceRange: 'any'
      };
      
      const response = await searchService.search(defaultFilters, {
        page: 1,
        limit: 24
      });
      
      console.log('FindPage: Latest properties response:', response);
      console.log('FindPage: Loaded', response.results?.length, 'latest properties out of', response.totalCount, 'total');
      
      const newProperties = response.results || [];
      setProperties(newProperties);
      setTotalCount(response.totalCount || 0);
      setHasMore(newProperties.length < (response.totalCount || 0));
      setCurrentFilters(defaultFilters); // Set default filters as current
      
      if (newProperties.length === 0) {
        toast({
          title: "No properties available",
          description: "No properties are currently listed",
          duration: 3000,
        });
      } else {
        console.log('FindPage: Successfully loaded', newProperties.length, 'latest properties');
      }
      
    } catch (error) {
      console.error('FindPage: Failed to load latest properties:', error);
      setProperties([]);
      setTotalCount(0);
      setHasMore(false);
      
      toast({
        title: "Failed to Load Properties",
        description: "Unable to load properties. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load latest properties on component mount
  useEffect(() => {
    loadLatestProperties();
  }, [loadLatestProperties]);

  // Handle search from SearchContainer
  const handleSearch = useCallback(async (filters: SearchFilters) => {
    console.log('FindPage: Search initiated with filters:', filters);
    
    // Check if filters are essentially empty (reset to defaults)
    const isEmptySearch = (
      (!filters.searchQuery || filters.searchQuery.trim() === '') &&
      (!filters.selectedLocation || filters.selectedLocation === 'any') &&
      (!filters.actionType || filters.actionType === 'any') &&
      (!filters.selectedPropertyType || filters.selectedPropertyType === 'any') &&
      (!filters.selectedSubType || filters.selectedSubType === 'any') &&
      (!filters.selectedBHK || filters.selectedBHK === 'any') &&
      (!filters.selectedPriceRange || filters.selectedPriceRange === 'any')
    );
    
    // If filters are empty, load latest properties instead
    if (isEmptySearch) {
      console.log('FindPage: Empty search detected, loading latest properties...');
      await loadLatestProperties();
      return;
    }
    
    // Clear current state immediately before starting search
    setProperties([]);
    setCurrentFilters(filters);
    setCurrentPage(1);
    setTotalCount(0);
    setHasMore(false);
    setActiveProperty(null);
    setLoading(true);
    
    try {
      // Use the actual search service with page size 24
      const response = await searchService.search(filters, {
        page: 1,
        limit: 24
      });
      
      console.log('FindPage: Search response:', response);
      console.log('FindPage: Search returned', response.results?.length, 'properties out of', response.totalCount, 'total');
      
      // Set the new search results
      const newProperties = response.results || [];
      setProperties(newProperties);
      setTotalCount(response.totalCount || 0);
      setHasMore(newProperties.length < (response.totalCount || 0));
      
      if (newProperties.length === 0) {
        toast({
          title: "No properties found",
          description: "Try adjusting your search filters",
          duration: 3000,
        });
      } else {
        console.log('FindPage: Successfully loaded', newProperties.length, 'properties');
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
  }, [toast, loadLatestProperties]);

  // Handle load more properties
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !currentFilters) {
      console.log('FindPage: Load more skipped -', { loadingMore, hasMore, hasFilters: !!currentFilters });
      return;
    }
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    
    console.log('FindPage: Loading more properties - page', nextPage);
    
    try {
      const response = await searchService.search(currentFilters, {
        page: nextPage,
        limit: 24
      });
      
      console.log('FindPage: Load more response:', response);
      console.log('FindPage: Loaded', response.results?.length, 'additional properties');
      
      const newProperties = response.results || [];
      setProperties(prev => {
        const updated = [...prev, ...newProperties];
        console.log('FindPage: Total properties after load more:', updated.length);
        return updated;
      });
      setHasMore((properties.length + newProperties.length) < (response.totalCount || 0));
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
      {/* Sticky Search Container */}
      <div className="sticky top-0 z-50 bg-background shadow-sm">
        <SearchContainer 
          onSearch={handleSearch}
          showResults={false}
          className="min-h-0" // Override the min-h-screen
        />
      </div>
      
      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Always show PropertyGridPanel when there are properties, loading, or filters are set */}
        <div className="w-full">
          <PropertyGridPanel
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
      </div>
    </div>
  );
};

export default FindPage;