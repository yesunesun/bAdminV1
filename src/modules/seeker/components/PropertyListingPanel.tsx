// src/modules/seeker/components/PropertyListingPanel.tsx
// Version: 4.0.0
// Last Modified: 10-05-2025 16:45 IST
// Purpose: Refactored to use a separate PropertyItem component for better organization

import React, { useState, useEffect } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Button } from '@/components/ui/button';
import { formatPrice } from '../services/seekerService';
import { Loader2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import PropertyItem from './PropertyItem'; // Import the new PropertyItem component

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
  const [propertyImageCache, setPropertyImageCache] = useState<Record<string, string>>({});

  // Constants
  const STORAGE_BUCKET = 'property-images-v2';

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

  // Batch load property images when properties change
  useEffect(() => {
    const loadPropertyImages = async () => {
      // Only process properties that aren't already in the cache
      const propertiesToLoad = properties.filter(p => !propertyImageCache[p.id]);
      
      if (propertiesToLoad.length === 0) return;
      
      const newImageCache = { ...propertyImageCache };
      
      // Process each property
      for (const property of propertiesToLoad) {
        try {
          // First check if property has imageFiles in property_details
          const details = property.property_details || {};
          
          if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
            // Look for primary image first
            const primaryImage = details.imageFiles.find((img: any) => img.isPrimary || img.is_primary);
            const imageToUse = primaryImage || details.imageFiles[0];
            
            if (imageToUse && imageToUse.fileName) {
              // Get image from Supabase storage
              const { data, error } = await supabase
                .storage
                .from(STORAGE_BUCKET)
                .createSignedUrl(`${property.id}/${imageToUse.fileName}`, 3600);
                
              if (!error && data.signedUrl) {
                newImageCache[property.id] = data.signedUrl;
                continue; // Skip to next property if we found an image
              }
            }
          }
          
          // If imageFiles didn't work, try listing files in storage
          const { data: files, error: listError } = await supabase
            .storage
            .from(STORAGE_BUCKET)
            .list(`${property.id}/`, {
              limit: 1,
              sortBy: { column: 'name', order: 'asc' }
            });
            
          if (!listError && files && files.length > 0) {
            // Filter out folders
            const imageFiles = files.filter(file => !file.metadata?.contentType?.includes('folder'));
            
            if (imageFiles.length > 0) {
              // Get signed URL for first image
              const { data: urlData, error: urlError } = await supabase
                .storage
                .from(STORAGE_BUCKET)
                .createSignedUrl(`${property.id}/${imageFiles[0].name}`, 3600);
                
              if (!urlError && urlData?.signedUrl) {
                newImageCache[property.id] = urlData.signedUrl;
                continue;
              }
            }
          }
          
          // If no image found in storage, set default image
          newImageCache[property.id] = '/noimage.png';
          
        } catch (error) {
          console.error(`Error loading image for property ${property.id}:`, error);
          newImageCache[property.id] = '/noimage.png';
        }
      }
      
      // Update cache with all new images
      setPropertyImageCache(newImageCache);
    };
    
    loadPropertyImages();
  }, [properties, propertyImageCache]);

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

  // Get property image using cache
  const getPropertyImage = (property: PropertyType): string => {
    // First check if we have a cached image
    if (propertyImageCache[property.id]) {
      return propertyImageCache[property.id];
    }
    
    // Return placeholder while loading
    return '/noimage.png';
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
      // Actual property cards - now using the PropertyItem component
      return (
        <div className="divide-y">
          {properties.map((property) => (
            <PropertyItem
              key={property.id}
              property={property}
              isLiked={propertyLikeState[property.id] || false}
              isHovered={hoveredProperty === property.id}
              propertyImage={getPropertyImage(property)}
              onHover={handlePropertyHover}
              onSelect={setActiveProperty}
              onFavoriteToggle={handleFavoriteToggle}
              onShare={handleShare}
            />
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full flex-shrink-0 p-3">
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