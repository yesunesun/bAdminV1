// src/modules/seeker/components/PropertyGrid.tsx
// Version: 3.0.0
// Last Modified: 11-05-2025 11:30 IST
// Purpose: Updated to use PropertyItem directly instead of PropertyCard

import React, { useState, useEffect } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { togglePropertyLike } from '../services/seekerService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { SearchIcon, FilterIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

// Import PropertyItem instead of PropertyCard
import PropertyItem from './PropertyItem';

interface PropertyGridProps {
  properties: PropertyType[];
  likedProperties?: Record<string, boolean>;
  onLikeToggle?: (propertyId: string, liked: boolean) => void;
  isLoading?: boolean;
  searchQuery?: string;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  likedProperties = {}, 
  onLikeToggle,
  isLoading = false,
  searchQuery = '' 
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [propertyImageCache, setPropertyImageCache] = useState<Record<string, string>>({});
  
  // Constants
  const STORAGE_BUCKET = 'property-images-v2';
  
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

  // Get property image using cache
  const getPropertyImage = (property: PropertyType): string => {
    // First check if we have a cached image
    if (propertyImageCache[property.id]) {
      return propertyImageCache[property.id];
    }
    
    // Return placeholder while loading
    return '/noimage.png';
  };

  const handleLikeToggle = async (propertyId: string, liked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add properties to your favorites",
        variant: "destructive"
      });
      return false;
    }

    try {
      // First, update the UI immediately (optimistic update)
      if (onLikeToggle) {
        onLikeToggle(propertyId, liked);
      }
      
      // Then persist to backend
      const result = await togglePropertyLike(propertyId, liked);
      
      if (!result.success) {
        throw new Error(result.message || "Failed to update favorite status");
      }
      
      return true;
    } catch (error) {
      console.error("Error toggling property like:", error);
      
      // If there was an error, revert the UI change
      if (onLikeToggle) {
        onLikeToggle(propertyId, !liked);
      }
      
      toast({
        title: "Action Failed",
        description: "Unable to update favorite status. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const handlePropertyHover = (propertyId: string, isHovering: boolean) => {
    setHoveredPropertyId(isHovering ? propertyId : null);
  };
  
  // Handle property selection
  const handlePropertySelect = (property: PropertyType) => {
    navigate(`/seeker/property/${property.id}`);
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
        navigator.clipboard.writeText(propertyLink);
        toast({
          title: "Link copied!",
          description: "Property link has been copied to clipboard.",
          duration: 3000,
        });
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(propertyLink);
      toast({
        title: "Link copied!",
        description: "Property link has been copied to clipboard.",
        duration: 3000,
      });
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className={cn(
            "overflow-hidden h-full rounded-xl shadow-sm",
            theme === 'ocean' ? "border-border/30" : "border-border/30"
          )}>
            <div className="animate-pulse">
              <div className={cn(
                "h-60 rounded-t-xl",
                theme === 'ocean' ? "bg-muted/60" : "bg-muted/60"
              )}></div>
              <div className="p-6 space-y-4">
                <div className={cn(
                  "h-4 rounded-full w-2/3",
                  theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                )}></div>
                <div className={cn(
                  "h-6 rounded-full w-5/6",
                  theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                )}></div>
                <div className={cn(
                  "h-4 rounded-full w-full",
                  theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                )}></div>
                <div className="flex gap-4 pt-2">
                  <div className={cn(
                    "h-8 rounded-full w-1/3",
                    theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                  )}></div>
                  <div className={cn(
                    "h-8 rounded-full w-1/3",
                    theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                  )}></div>
                  <div className={cn(
                    "h-8 rounded-full w-1/3",
                    theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                  )}></div>
                </div>
                <div className="pt-4 mt-2 border-t border-border/30 flex justify-between">
                  <div className={cn(
                    "h-8 rounded-full w-1/3",
                    theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                  )}></div>
                  <div className={cn(
                    "h-8 rounded-full w-1/4",
                    theme === 'ocean' ? "bg-muted/70" : "bg-muted/70"
                  )}></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state with enhanced styling
  if (properties.length === 0) {
    return (
      <Card className={cn(
        "w-full rounded-xl border-border/40 overflow-hidden shadow-md",
        theme === 'ocean' ? "bg-card" : "bg-card"
      )}>
        <CardContent className="flex flex-col items-center justify-center py-20 px-4">
          <div className={cn(
            "rounded-full p-8 mb-6",
            theme === 'ocean' ? "bg-primary/10" : "bg-primary/10"
          )}>
            <SearchIcon className="h-12 w-12 text-primary opacity-80" />
          </div>
          <h3 className="text-2xl font-semibold mb-3">No properties found</h3>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            {searchQuery 
              ? `No properties match "${searchQuery}". Try adjusting your search filters.` 
              : "We couldn't find any properties matching your criteria. Try adjusting your filters."}
          </p>
          <div className={cn(
            "rounded-lg p-4 w-full max-w-md bg-muted/40 border border-border/50",
            "flex items-center justify-center gap-2 text-muted-foreground"
          )}>
            <FilterIcon className="h-5 w-5" />
            <span>Try using fewer filters or expanding your search area</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card 
          key={property.id}
          className={cn(
            "overflow-hidden group transition-all duration-300",
            "rounded-xl border border-border/40 h-full",
            hoveredPropertyId === property.id ? "ring-2 ring-primary ring-offset-2" : "",
            "hover:shadow-md",
            theme === 'ocean' ? "bg-card" : "bg-card"
          )}
        >
          {/* Use PropertyItem directly instead of PropertyCard */}
          <PropertyItem 
            property={property} 
            isLiked={likedProperties[property.id] || false}
            isHovered={hoveredPropertyId === property.id}
            propertyImage={getPropertyImage(property)}
            onHover={handlePropertyHover}
            onSelect={handlePropertySelect}
            onFavoriteToggle={handleLikeToggle}
            onShare={handleShare}
          />
        </Card>
      ))}
    </div>
  );
};

export default PropertyGrid;