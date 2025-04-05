// src/modules/seeker/components/PropertyListingPanel.tsx
// Version: 2.1.0
// Last Modified: 06-04-2025 00:15 IST
// Purpose: Fixed column widths to maintain the same dimensions during and after loading

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '../services/seekerService';
import { Loader2, ChevronRight, MapPin, Bed, Bath, Square, Info, Share2 } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface PropertyListingPanelProps {
  properties: PropertyType[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  totalCount: number;
  onLoadMore: () => void;
  onFavoriteAction: (propertyId: string, isLiked: boolean) => Promise<boolean>;
  handlePropertyHover: (propertyId: string, isHovering: boolean) => void;
  hoveredProperty: string | null;
  setActiveProperty: (property: PropertyType | null) => void;
  favoriteProperties?: Set<string>;
  isLoadingFavorites?: boolean;
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
  setActiveProperty,
  favoriteProperties = new Set(),
  isLoadingFavorites = false
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [propertyLikeState, setPropertyLikeState] = useState<Record<string, boolean>>({});

  // Setup initial like states when favorites or properties change
  useEffect(() => {
    const newLikeState: Record<string, boolean> = {};
    
    properties.forEach(property => {
      // Check if the property is in the favorites set
      newLikeState[property.id] = favoriteProperties.has(property.id);
    });
    
    setPropertyLikeState(newLikeState);
    
    console.log('Updated property like states:', { 
      propertiesCount: properties.length,
      favoritesCount: favoriteProperties.size,
      newStates: newLikeState
    });
  }, [properties, favoriteProperties]);

  // Handle favorite toggle with persistence
  const handleFavoriteToggle = async (propertyId: string, newLikedState: boolean) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to save favorites",
        duration: 3000,
      });
      return false;
    }
    
    // Optimistically update UI
    setPropertyLikeState(prev => ({
      ...prev,
      [propertyId]: newLikedState
    }));
    
    console.log(`Toggling property ${propertyId} to ${newLikedState ? 'liked' : 'not liked'}`);
    
    // Perform the actual toggle operation
    const success = await onFavoriteAction(propertyId, newLikedState);
    
    console.log(`Toggle operation ${success ? 'succeeded' : 'failed'}`);
    
    // If failed, revert UI change
    if (!success) {
      setPropertyLikeState(prev => ({
        ...prev,
        [propertyId]: !newLikedState
      }));
      
      toast({
        title: "Action failed",
        description: "There was a problem updating your favorites",
        variant: "destructive",
        duration: 3000,
      });
    }
    
    return success;
  };

  // Handle share action
  const handleShare = (e: React.MouseEvent, property: PropertyType) => {
    e.preventDefault();
    e.stopPropagation();
    
    const propertyLink = `${window.location.origin}/seeker/property/${property.id}`;
    const propertyTitle = property.title;
    
    if (navigator.share) {
      // Use Web Share API if available
      navigator.share({
        title: propertyTitle,
        text: `Check out this property: ${propertyTitle}`,
        url: propertyLink,
      }).catch(err => {
        console.error('Error sharing property:', err);
        // Fallback to clipboard
        copyToClipboard(propertyLink);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(propertyLink);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Link copied!",
          description: "Property link has been copied to clipboard.",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast({
          title: "Failed to copy",
          description: "Please try again or copy manually.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  // Render content - either loading placeholders or actual property cards
  const renderContent = () => {
    if (loading && properties.length === 0) {
      // Loading placeholders
      return (
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={`loading-skeleton-${i}`} className="p-3 border-b animate-pulse">
              {/* Header placeholder with actions */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-muted rounded-full"></div>
                  <div className="h-4 w-4 bg-muted rounded-full"></div>
                </div>
              </div>
              
              {/* Main content with fixed layout matching real cards */}
              <div className="flex gap-2">
                {/* Image placeholder with fixed dimensions */}
                <div className="h-20 w-24 flex-shrink-0 bg-muted rounded-lg"></div>
                
                {/* Content placeholders with matching layout */}
                <div className="flex-1 min-w-0">
                  {/* Location placeholder */}
                  <div className="flex items-center mb-1">
                    <div className="h-3 w-3 bg-muted rounded-full mr-1"></div>
                    <div className="h-3 bg-muted rounded w-3/4"></div>
                  </div>
                  
                  {/* Price placeholder */}
                  <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                  
                  {/* Property specs placeholder */}
                  <div className="flex gap-2 mb-2">
                    <div className="h-3 bg-muted rounded w-8"></div>
                    <div className="h-3 bg-muted rounded w-8"></div>
                    <div className="h-3 bg-muted rounded w-14"></div>
                  </div>
                  
                  {/* Badge placeholder */}
                  <div className="h-5 w-16 bg-muted rounded"></div>
                </div>
                
                {/* Chevron placeholder */}
                <div className="self-center flex-shrink-0">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (properties.length === 0) {
      // No properties found state
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Info className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium mb-1">No properties found</h3>
          <p className="text-muted-foreground max-w-xs mb-4">
            Try adjusting your filters or search for a different location
          </p>
        </div>
      );
    } else {
      // Actual property cards
      return (
        <div className="divide-y">
          {properties.map((property) => {
            // Get primary image with fallback
            const primaryImage = property.property_images?.find(img => img.is_primary)?.url || 
                                (property.property_images && property.property_images.length > 0 ? property.property_images[0].url : '/apartment.jpg');
            
            const isHovered = hoveredProperty === property.id;
            
            // Extract proper property type
            const propertyType = property.property_details?.propertyType || 'Apartment';
            
            // Extract property name/title to display
            const propertyName = property.bedrooms 
              ? `${property.bedrooms} BHK Apartment`
              : property.title || 'Apartment';
            
            // Extract locality from property details or fallback to city
            const locality = property.property_details?.locality || property.city || '';
            
            // Check if property is liked using our state object
            const isLiked = propertyLikeState[property.id] || false;
            
            return (
              <div 
                key={`property-${property.id}`}
                className={`relative transition hover:bg-muted/40 ${isHovered ? 'bg-muted/40' : ''}`}
              >
                <div className="p-3"
                  onMouseEnter={() => handlePropertyHover(property.id, true)}
                  onMouseLeave={() => handlePropertyHover(property.id, false)}
                  onClick={() => setActiveProperty(property)}
                >
                  {/* Property Name at the top with blue text */}
                  <div className="flex items-center justify-between mb-2">
                    <Link
                      to={`/seeker/property/${property.id}`}
                      className="text-sm font-medium text-blue-500 hover:underline truncate max-w-[70%]"
                    >
                      {propertyName}
                    </Link>
                    
                    {/* Share and Favorite buttons - horizontal layout */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => handleShare(e, property)}
                        className="text-gray-400 hover:text-blue-500"
                        aria-label="Share property"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                      
                      <FavoriteButton
                        initialIsLiked={isLiked}
                        onToggle={(newLikedState) => handleFavoriteToggle(property.id, newLikedState)}
                        className="text-gray-400 hover:text-primary" 
                      />
                    </div>
                  </div>
                  
                  <Link 
                    to={`/seeker/property/${property.id}`} 
                    className="flex gap-2"
                  >
                    {/* Property image */}
                    <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={primaryImage}
                        alt={property.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.src = '/noimage.png';
                        }}
                      />
                    </div>
                    
                    {/* Property details */}
                    <div className="flex-1 min-w-0">
                      {/* Location with icon */}
                      <div className="flex items-center text-xs text-gray-500 mb-1">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {locality || property.address || 'Location unavailable'}
                        </span>
                      </div>
                      
                      {/* Price */}
                      <p className="text-sm font-semibold mb-2">
                        {formatPrice(property.price)}
                      </p>
                      
                      {/* Property specs */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {property.bedrooms && (
                          <span className="flex items-center">
                            <span className="mr-1">{property.bedrooms}</span>
                          </span>
                        )}
                        
                        {property.bathrooms && (
                          <span className="flex items-center">
                            <Bath className="h-3 w-3 mr-1" />
                            <span>{property.bathrooms}</span>
                          </span>
                        )}
                        
                        {property.square_feet && (
                          <span className="flex items-center">
                            <Square className="h-3 w-3 mr-1" />
                            <span className="whitespace-nowrap">{property.square_feet} sq.ft</span>
                          </span>
                        )}
                      </div>
                      
                      {/* Property Type Badge */}
                      <div className="mt-2 inline-block bg-gray-100 text-xs text-gray-600 px-2 py-0.5 rounded">
                        {propertyType}
                      </div>
                    </div>
                    
                    {/* Chevron icon */}
                    <div className="self-center flex-shrink-0">
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="w-1/3 h-full flex-shrink-0 p-3">
      <div className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col">
        {/* Header with count */}
        <div className="sticky top-0 z-10 bg-card p-3 border-b flex justify-between items-center">
          <div className="text-sm font-medium">
            {loading || isLoadingFavorites ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isLoadingFavorites ? 'Loading favorites...' : 'Loading properties...'}
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
        
        {/* Property listing - using renderContent to ensure consistent layout */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
        
        {/* Load more button */}
        {properties.length > 0 && hasMore && (
          <div className="p-3 border-t mt-auto bg-card">
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