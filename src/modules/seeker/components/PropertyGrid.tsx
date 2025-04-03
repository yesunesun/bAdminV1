// src/modules/seeker/components/PropertyGrid.tsx
// Version: 2.0.0
// Last Modified: 03-04-2025 16:15 IST
// Purpose: Enhanced property grid with improved styling, loading states, and empty state UI

import React, { useState } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import PropertyCard from './PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { togglePropertyLike } from '../services/seekerService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { SearchIcon, FilterIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);

  const handleLikeToggle = async (propertyId: string, liked: boolean) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add properties to your favorites",
        variant: "destructive"
      });
      return;
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
    }
  };

  const handlePropertyHover = (propertyId: string, isHovering: boolean) => {
    setHoveredPropertyId(isHovering ? propertyId : null);
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
        <PropertyCard 
          key={property.id} 
          property={property} 
          initialIsLiked={likedProperties[property.id] || false}
          onLikeToggle={(newState) => handleLikeToggle(property.id, newState)}
          onHover={handlePropertyHover}
          isHovered={hoveredPropertyId === property.id}
          className="transition-all duration-300"
        />
      ))}
    </div>
  );
};

export default PropertyGrid;