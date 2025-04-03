// src/modules/seeker/pages/BrowseProperties.tsx
// Version: 3.0.0
// Last Modified: 03-04-2025 14:45 IST
// Purpose: Removed duplicate header

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProperties } from '../hooks/useProperties';
import { checkPropertyLike } from '../services/seekerService';
import PropertyGrid from '../components/PropertyGrid';
import SearchBar from '../components/Search/SearchBar';
import FilterPanel from '../components/Search/FilterPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HomeIcon, MapPinIcon, ArrowLeftIcon, ArrowRightIcon, SearchIcon, PlusIcon, FilterIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BrowseProperties: React.FC = () => {
  const { 
    properties, 
    loading, 
    error, 
    filters, 
    updateFilters, 
    resetFilters, 
    pagination 
  } = useProperties();
  
  const { user } = useAuth();
  const { theme } = useTheme();
  const [likedProperties, setLikedProperties] = useState<Record<string, boolean>>({});
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load user's liked properties
  useEffect(() => {
    const fetchLikedProperties = async () => {
      if (!user || properties.length === 0) return;
      
      setLoadingLikes(true);
      
      try {
        const likes: Record<string, boolean> = {};
        
        // Check likes for each property (in parallel)
        await Promise.all(
          properties.map(async (property) => {
            const { liked } = await checkPropertyLike(property.id, user.id);
            likes[property.id] = liked;
          })
        );
        
        setLikedProperties(likes);
      } catch (error) {
        console.error('Error fetching liked properties:', error);
      } finally {
        setLoadingLikes(false);
      }
    };

    fetchLikedProperties();
  }, [user, properties]);

  // Handle search query
  const handleSearch = (query: string) => {
    updateFilters({ searchQuery: query });
  };

  // Handle like toggle
  const handleLikeToggle = (propertyId: string, liked: boolean) => {
    console.log(`Toggling property ${propertyId} like status to: ${liked}`);
    setLikedProperties(prev => ({
      ...prev,
      [propertyId]: liked
    }));
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <div className={cn(
      "container mx-auto py-8 px-4 max-w-7xl",
      theme === 'ocean' ? "text-foreground" : "text-foreground"
    )}>
      {/* Error Message */}
      {error && (
        <div className={cn(
          "p-5 rounded-lg mb-8",
          theme === 'ocean' ? "bg-destructive/10 text-destructive" : "bg-destructive/10 text-destructive"
        )}>
          <h3 className="font-semibold">Error Loading Properties</h3>
          <p>There was a problem loading the properties. Please try again later.</p>
          <pre className="mt-2 text-xs overflow-auto">{error.message}</pre>
        </div>
      )}

      {/* Mobile filter toggle button */}
      <div className="mb-6 md:hidden">
        <Button 
          variant="outline" 
          onClick={toggleMobileFilters} 
          className="w-full flex items-center justify-center h-12"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Main content with two-column layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter panel - left column */}
        <div className={`w-full md:w-80 lg:w-96 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
          <FilterPanel 
            filters={filters}
            onApplyFilters={updateFilters}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Property listing - right column */}
        <div className="w-full md:flex-1">
          <div className={cn(
            "mb-5 flex items-center justify-between p-4 rounded-lg",
            theme === 'ocean' ? "bg-muted/20" : "bg-muted/20"
          )}>
            <div className="text-muted-foreground">
              {loading ? (
                <span>Loading properties...</span>
              ) : (
                <span className="font-medium">
                  Showing <span className="text-primary font-semibold">{properties.length}</span> of {pagination.totalProperties} properties
                </span>
              )}
            </div>
            
            {user && (
              <Link to="/properties/list">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  List Your Property
                </Button>
              </Link>
            )}
          </div>

          {properties.length > 0 ? (
            <PropertyGrid 
              properties={properties} 
              likedProperties={likedProperties} 
              onLikeToggle={handleLikeToggle} 
              isLoading={loading || loadingLikes} 
            />
          ) : loading ? (
            // Loading state is handled by PropertyGrid
            <PropertyGrid 
              properties={[]} 
              isLoading={true} 
            />
          ) : (
            // No properties found state
            <Card className={cn(
              "w-full border",
              theme === 'ocean' ? "border-border" : "border-border"
            )}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className={cn(
                  "rounded-full p-6 mb-4",
                  theme === 'ocean' ? "bg-muted" : "bg-muted"
                )}>
                  <SearchIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-8">
                  We couldn't find any properties matching your search criteria. Try adjusting your filters or check back later for new listings.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button variant="outline" onClick={resetFilters}>
                    Clear All Filters
                  </Button>
                  
                  {user && (
                    <Link to="/properties/list">
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        List Your Property
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-10 flex justify-center">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.prevPage}
                  disabled={pagination.page === 1}
                  className="h-10"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(p => (
                      p === 1 || 
                      p === pagination.totalPages || 
                      (p >= pagination.page - 1 && p <= pagination.page + 1)
                    ))
                    .map((p, i, arr) => {
                      // Add ellipsis where needed
                      if (i > 0 && arr[i - 1] !== p - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${p}`}>
                            <span className="px-2 text-muted-foreground">...</span>
                            <Button
                              variant={pagination.page === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => pagination.goToPage(p)}
                              className="w-10 h-10 p-0"
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        );
                      }
                      
                      return (
                        <Button
                          key={p}
                          variant={pagination.page === p ? "default" : "outline"}
                          size="sm"
                          onClick={() => pagination.goToPage(p)}
                          className="w-10 h-10 p-0"
                        >
                          {p}
                        </Button>
                      );
                    })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pagination.nextPage}
                  disabled={pagination.page === pagination.totalPages}
                  className="h-10"
                >
                  Next
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseProperties;