// src/modules/seeker/components/PropertyGrid.tsx
// Version: 1.3.0
// Last Modified: 01-03-2025 15:30 IST
// Purpose: Improved property grid with better responsive layout, loading states and theme support

import React from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import PropertyCard from './PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { togglePropertyLike } from '../services/seekerService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { SearchIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyGridProps {
  properties: PropertyType[];
  likedProperties?: Record<string, boolean>;
  onLikeToggle?: (propertyId: string, liked: boolean) => void;
  isLoading?: boolean;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  likedProperties = {}, 
  onLikeToggle,
  isLoading = false 
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { toast } = useToast();

  const handleLike = async (property: PropertyType) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like properties",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, update the UI immediately (optimistic update)
      const currentLikeStatus = likedProperties[property.id] || false;
      const newLikeStatus = !currentLikeStatus;
      
      // Call the parent component's handler to update state immediately
      if (onLikeToggle) {
        onLikeToggle(property.id, newLikeStatus);
      }
      
      // Then persist to backend
      await togglePropertyLike(property.id, user.id);
      
      toast({
        title: newLikeStatus ? "Property Liked" : "Property Unliked",
        description: newLikeStatus 
          ? "This property has been added to your favorites" 
          : "This property has been removed from your favorites",
        variant: "default"
      });
    } catch (error) {
      console.error("Error toggling property like:", error);
      
      // If there was an error, revert the UI change
      if (onLikeToggle && property.id in likedProperties) {
        onLikeToggle(property.id, !likedProperties[property.id]);
      }
      
      toast({
        title: "Action Failed",
        description: "Unable to update like status. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className={cn(
            "overflow-hidden h-full",
            theme === 'ocean' ? "border-border" : "border-border"
          )}>
            <div className="animate-pulse">
              <div className={cn(
                "h-56 rounded-t-lg",
                theme === 'ocean' ? "bg-muted" : "bg-muted"
              )}></div>
              <div className="p-5 space-y-4">
                <div className={cn(
                  "h-3 rounded w-1/3",
                  theme === 'ocean' ? "bg-muted" : "bg-muted"
                )}></div>
                <div className={cn(
                  "h-5 rounded w-3/4",
                  theme === 'ocean' ? "bg-muted" : "bg-muted"
                )}></div>
                <div className={cn(
                  "h-7 rounded w-1/2",
                  theme === 'ocean' ? "bg-muted" : "bg-muted"
                )}></div>
                <div className={cn(
                  "h-4 rounded w-full",
                  theme === 'ocean' ? "bg-muted" : "bg-muted"
                )}></div>
                <div className="flex justify-between gap-2 pt-2">
                  <div className={cn(
                    "h-8 rounded w-1/4",
                    theme === 'ocean' ? "bg-muted" : "bg-muted"
                  )}></div>
                  <div className={cn(
                    "h-8 rounded w-1/4",
                    theme === 'ocean' ? "bg-muted" : "bg-muted"
                  )}></div>
                  <div className={cn(
                    "h-8 rounded w-1/4",
                    theme === 'ocean' ? "bg-muted" : "bg-muted"
                  )}></div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <Card className={cn(
        "w-full",
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
          <p className="text-muted-foreground text-center max-w-md">
            Try adjusting your search filters to find more properties
          </p>
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
          isLiked={likedProperties[property.id] || false}
          onLike={handleLike}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;