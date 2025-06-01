// src/modules/seeker/components/PropertyListingPanel.tsx
// Version: 5.3.0
// Last Modified: 02-06-2025 15:30 IST
// Purpose: Fixed bottom content visibility and scroll behavior for proper display of all properties and load more button

import React, { useState, useEffect } from 'react';
import { PropertyType } from '@/modules/owner/components/property/types';
import { Button } from '@/components/ui/button';
import { Loader2, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import PropertyItem from './PropertyItem';

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

  // Render content
  const renderContent = () => {
    if (loading && properties.length === 0) {
      // Enhanced loading placeholders with better visual hierarchy
      return (
        <div className="divide-y divide-border/50">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={`loading-skeleton-${i}`} className="p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-muted rounded-lg w-1/2"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 bg-muted rounded-full"></div>
                  <div className="h-4 w-4 bg-muted rounded-full"></div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="h-20 w-24 flex-shrink-0 bg-muted rounded-xl"></div>
                
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center mb-1">
                    <div className="h-3 w-3 bg-muted rounded-full mr-2"></div>
                    <div className="h-3 bg-muted rounded-lg w-3/4"></div>
                  </div>
                  
                  <div className="h-4 bg-muted rounded-lg w-1/3"></div>
                  
                  <div className="flex gap-2">
                    <div className="h-3 bg-muted rounded-lg w-12"></div>
                    <div className="h-3 bg-muted rounded-lg w-12"></div>
                    <div className="h-3 bg-muted rounded-lg w-16"></div>
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-muted rounded-lg"></div>
                    <div className="h-5 w-16 bg-muted rounded-lg"></div>
                  </div>
                </div>
                
                <div className="self-center flex-shrink-0">
                  <div className="h-4 w-4 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (properties.length === 0) {
      // Enhanced empty state with better visual appeal
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
            <Info className="h-10 w-10 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No properties found</h3>
          <p className="text-muted-foreground max-w-xs mb-6 leading-relaxed">
            Try adjusting your filters or search for a different location to discover more properties
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-30"></div>
        </div>
      );
    } else {
      // Enhanced property cards with improved spacing
      return (
        <div className="divide-y divide-border/30">
          {properties.map((property, index) => (
            <div 
              key={property.id}
              className={`
                transition-all duration-200 
                ${hoveredProperty === property.id ? 'bg-muted/40 scale-[1.02]' : 'hover:bg-muted/20'}
                ${index === 0 ? 'rounded-t-xl' : ''}
                ${index === properties.length - 1 ? 'rounded-b-xl' : ''}
              `}
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
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="h-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
        {/* Enhanced Header with better typography and spacing */}
        <div className="flex-shrink-0 bg-card/95 backdrop-blur-sm p-4 border-b border-border/50 flex justify-between items-center">
          <div className="text-sm font-semibold text-foreground">
            {loading || isLoadingFavorites ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-muted-foreground">
                  {isLoadingFavorites ? 'Loading favorites...' : 'Loading properties...'}
                </span>
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-foreground">
                  {properties.length === 0 ? 'No properties found' : `${properties.length} of ${totalCount} properties`}
                </span>
                {properties.length > 0 && totalCount > properties.length && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    +{totalCount - properties.length} more
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground hidden sm:block">
            {!loading && properties.length > 0 && (
              <span className="bg-muted/50 px-3 py-1 rounded-full">
                Click to view details
              </span>
            )}
          </div>
        </div>
        
        {/* Property listing with proper scrolling and bottom spacing */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-0">
            {renderContent()}
          </div>
          
          {/* Load more button section - moved inside scrollable area with proper spacing */}
          {properties.length > 0 && hasMore && (
            <div className="p-4 bg-card/95 backdrop-blur-sm">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={loadingMore || !hasMore}
                className="w-full h-11 rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span>Loading more properties...</span>
                  </>
                ) : hasMore ? (
                  <>
                    <span>Load more properties</span>
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {totalCount - properties.length} remaining
                    </span>
                  </>
                ) : (
                  <span>All properties loaded</span>
                )}
              </Button>
            </div>
          )}
          
          {/* Bottom spacing to ensure last item is fully visible */}
          <div className="h-4"></div>
        </div>
      </div>
    </div>
  );
};

export default PropertyListingPanel;