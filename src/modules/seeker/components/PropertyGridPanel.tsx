// src/modules/seeker/components/PropertyGridPanel.tsx
// Version: 1.2.0
// Last Modified: 02-06-2025 00:10 IST
// Purpose: Increased card width by limiting to 3 cards per row maximum

import React, { useState, useEffect } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import PropertyItem from './PropertyItem';

interface PropertyGridPanelProps {
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

const PropertyGridPanel: React.FC<PropertyGridPanelProps> = ({
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
      newLikeState[property.id] = favoriteProperties.has(property.id);
    });
    
    setPropertyLikeState(newLikeState);
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
    
    // Perform the actual toggle operation
    const success = await onFavoriteAction(propertyId, newLikedState);
    
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
      navigator.share({
        title: propertyTitle,
        text: `Check out this property: ${propertyTitle}`,
        url: propertyLink,
      }).catch(err => {
        console.error('Error sharing property:', err);
        copyToClipboard(propertyLink);
      });
    } else {
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

  // Render loading skeleton for grid view with wider cards
  const renderLoadingSkeleton = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={`loading-skeleton-${i}`} className="overflow-hidden animate-pulse">
            <div className="h-56 bg-muted"></div>
            <div className="p-5 space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-5 bg-muted rounded w-1/3"></div>
              <div className="flex gap-3">
                <div className="h-3 bg-muted rounded w-14"></div>
                <div className="h-3 bg-muted rounded w-14"></div>
                <div className="h-3 bg-muted rounded w-18"></div>
              </div>
              <div className="flex gap-3 pt-2">
                <div className="h-6 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-20"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Info className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <h3 className="text-lg font-medium mb-1">No properties found</h3>
      <p className="text-muted-foreground max-w-xs mb-4">
        Try adjusting your filters or search for a different location
      </p>
    </div>
  );

  // Render property grid with wider cards (max 3 per row)
  const renderPropertyGrid = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card
            key={property.id}
            className={`overflow-hidden group transition-all duration-300 cursor-pointer
              ${hoveredProperty === property.id ? 'ring-2 ring-primary ring-offset-2' : ''}
              hover:shadow-lg
            `}
            onClick={() => setActiveProperty(property)}
          >
            <PropertyItem
              property={property}
              isLiked={propertyLikeState[property.id] || false}
              isHovered={hoveredProperty === property.id}
              propertyImage=""
              onHover={handlePropertyHover}
              onSelect={setActiveProperty}
              onFavoriteToggle={handleFavoriteToggle}
              onShare={handleShare}
            />
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex-shrink-0 p-3">
      <div className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm flex flex-col">
        {/* Header with count only */}
        <div className="sticky top-0 z-10 bg-card p-4 border-b flex justify-between items-center">
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
        
        {/* Property listing with increased padding */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && properties.length === 0 ? (
            renderLoadingSkeleton()
          ) : properties.length === 0 ? (
            renderEmptyState()
          ) : (
            renderPropertyGrid()
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

export default PropertyGridPanel;