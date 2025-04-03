// src/modules/seeker/components/PropertyListingPanel.tsx
// Version: 1.3.0
// Last Modified: 04-04-2025 18:15 IST
// Purpose: Added favorite button to mobile property list items

import React from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '../services/seekerService';
import { Loader2, ChevronRight, MapPin, Bed, Bath, Square, Info } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyListingPanelProps {
  properties: PropertyType[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  onLoadMore: () => void;
  onFavoriteAction: (propertyId: string) => boolean;
  handlePropertyHover: (propertyId: string, isHovering: boolean) => void;
  hoveredProperty: string | null;
  setActiveProperty: (property: PropertyType | null) => void;
}

const PropertyListingPanel: React.FC<PropertyListingPanelProps> = ({
  properties,
  loading,
  loadingMore,
  hasMore,
  totalCount,
  onLoadMore,
  onFavoriteAction,
  handlePropertyHover,
  hoveredProperty,
  setActiveProperty
}) => {
  const { user } = useAuth();

  // Handle favorite toggle
  const handleFavoriteToggle = (propertyId: string, isLiked: boolean) => {
    onFavoriteAction(propertyId);
    return true;
  };

  return (
    <div className="w-full lg:w-1/3 flex-shrink-0 p-4 pb-0">
      <div className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col">
        {/* Header with count */}
        <div className="sticky top-0 z-10 bg-card p-4 border-b flex justify-between items-center">
          <div className="text-sm font-medium">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading properties...
              </span>
            ) : (
              <span>
                {properties.length === 0 ? 'No properties found' : `${properties.length} of ${totalCount} properties`}
              </span>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground hidden sm:block">
            {!loading && properties.length > 0 && (
              <>Click on a property to view details</>
            )}
          </div>
        </div>
        
        {/* Property listing */}
        <div className="flex-1 overflow-y-auto">
          {loading && properties.length === 0 ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={`loading-skeleton-${i}`} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-32 bg-muted rounded-md mb-3"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Info className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No properties found</h3>
              <p className="text-muted-foreground max-w-xs mb-4">
                Try adjusting your filters or search for a different location
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {properties.map((property) => {
                // Get primary image with fallback
                const primaryImage = property.property_images?.find(img => img.is_primary)?.url || 
                                    (property.property_images && property.property_images.length > 0 ? property.property_images[0].url : '/apartment.jpg');
                
                const isHovered = hoveredProperty === property.id;
                
                return (
                  <div 
                    key={`property-${property.id}`}
                    className={`relative p-4 transition hover:bg-muted/40 ${isHovered ? 'bg-muted/40' : ''}`}
                    onMouseEnter={() => handlePropertyHover(property.id, true)}
                    onMouseLeave={() => handlePropertyHover(property.id, false)}
                    onClick={() => setActiveProperty(property)}
                  >
                    {/* Favorite Button - absolute positioned for both mobile and desktop */}
                    <div className="absolute top-3 right-3 z-10">
                      <FavoriteButton
                        initialIsLiked={false} // Default to not liked - this would need to be dynamic in a real implementation
                        onToggle={(isLiked) => handleFavoriteToggle(property.id, isLiked)}
                        className="scale-90 lg:scale-75" // Slightly smaller on mobile
                      />
                    </div>
                    
                    <Link 
                      to={`/seeker/property/${property.id}`} 
                      className="flex gap-4 group"
                    >
                      {/* Property image */}
                      <div className="relative h-24 w-32 flex-shrink-0 overflow-hidden rounded-md">
                        <img
                          src={primaryImage}
                          alt={property.title}
                          className="h-full w-full object-cover transition group-hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; // Prevent infinite loop
                            target.src = '/noimage.png';
                          }}
                        />
                      </div>
                      
                      {/* Property details */}
                      <div className="flex-1 min-w-0 pr-8"> {/* Added right padding for favorite button */}
                        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary">
                          {property.title}
                        </h3>
                        
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {property.address || property.city || 'Location unavailable'}
                          </span>
                        </div>
                        
                        <p className="mt-2 text-sm font-bold">
                          {formatPrice(property.price)}
                        </p>
                        
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                          {property.bedrooms && (
                            <span className="flex items-center">
                              <Bed className="h-3 w-3 mr-1" />
                              {property.bedrooms}
                            </span>
                          )}
                          
                          {property.bathrooms && (
                            <span className="flex items-center">
                              <Bath className="h-3 w-3 mr-1" />
                              {property.bathrooms}
                            </span>
                          )}
                          
                          {property.square_feet && (
                            <span className="flex items-center">
                              <Square className="h-3 w-3 mr-1" />
                              {property.square_feet} sq.ft
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-muted-foreground self-center" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Load more button */}
        {properties.length > 0 && hasMore && (
          <div className="p-4 border-t mt-auto bg-card">
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              disabled={loadingMore || !hasMore}
              className="w-full"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading more...
                </>
              ) : hasMore ? (
                <>Load more properties</>
              ) : (
                <>All properties loaded</>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListingPanel;