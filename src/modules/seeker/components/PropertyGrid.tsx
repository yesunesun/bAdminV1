// src/modules/seeker/components/PropertyGrid.tsx
// Version: 1.2.0
// Last Modified: 27-02-2025 12:35 IST
// Purpose: Improved property grid with better responsive layout and loading states

import React from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import PropertyCard from './PropertyCard';
import { useAuth } from '@/contexts/AuthContext';
import { togglePropertyLike } from '../services/seekerService';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { SearchIcon } from 'lucide-react';

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
      const { liked } = await togglePropertyLike(property.id, user.id);
      
      // Call the parent component's handler to update state
      if (onLikeToggle) {
        onLikeToggle(property.id, liked);
      }
      
      toast({
        title: liked ? "Property Liked" : "Property Unliked",
        description: liked 
          ? "This property has been added to your favorites" 
          : "This property has been removed from your favorites",
        variant: "default"
      });
    } catch (error) {
      console.error("Error toggling property like:", error);
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
          <Card key={index} className="overflow-hidden h-full">
            <div className="animate-pulse">
              <div className="bg-muted h-56 rounded-t-lg"></div>
              <div className="p-5 space-y-4">
                <div className="h-3 bg-muted rounded w-1/3"></div>
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-7 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="flex justify-between gap-2 pt-2">
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded w-1/4"></div>
                  <div className="h-8 bg-muted rounded w-1/4"></div>
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
      <Card className="w-full">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
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