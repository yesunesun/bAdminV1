// src/modules/seeker/components/PropertyDetails/SimilarProperties.tsx
// Version: 4.0.0
// Last Modified: 02-06-2025 14:00 IST
// Purpose: Updated to use PropertyItem component with real similar properties data

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  MapPin, 
  ArrowRight,
  Home,
  TrendingUp,
  Star,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  spacing, 
  typography, 
  animations,
  cn 
} from '@/lib/utils';
import { SearchResult } from '@/components/Search/types/search.types';
import PropertyItem from '../PropertyItem';

interface SimilarPropertiesProps {
  properties: SearchResult[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  className?: string;
}

const SimilarProperties: React.FC<SimilarPropertiesProps> = ({ 
  properties,
  isLoading = false,
  error = null,
  onRefresh,
  className
}) => {
  const { toast } = useToast();
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(null);
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});

  // Handle property hover
  const handlePropertyHover = (propertyId: string, isHovering: boolean) => {
    setHoveredPropertyId(isHovering ? propertyId : null);
  };

  // Handle property selection (navigation)
  const handlePropertySelect = (property: SearchResult) => {
    // Navigation is handled by PropertyItem's Link component
    console.log('[SimilarProperties] Property selected:', property.id);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (propertyId: string, isLiked: boolean): Promise<boolean> => {
    try {
      // This would typically call a favorites service
      // For now, just update local state
      setFavoriteStates(prev => ({
        ...prev,
        [propertyId]: !isLiked
      }));

      toast({
        title: isLiked ? "Removed from Favorites" : "Added to Favorites",
        description: isLiked ? "Property removed from your favorites" : "Property saved to your favorites",
        variant: "default"
      });

      return true;
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Unable to update favorites. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Handle share functionality
  const handleShare = async (e: React.MouseEvent, property: SearchResult) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const shareUrl = `${window.location.origin}/seeker/property/${property.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Property link copied to clipboard",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className={cn("border-border/50 shadow-sm", className)}>
        <CardContent className={spacing.cardPadding}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted/50">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className={typography.h3}>Similar Properties</h3>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4 p-4 border border-border/30 rounded-xl">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className={cn("border-border/50 shadow-sm", className)}>
        <CardContent className={spacing.cardPadding}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted/50">
              <AlertCircle className="h-5 w-5 text-destructive" />
            </div>
            <h3 className={typography.h3}>Similar Properties</h3>
          </div>
          
          <div className="text-center py-6">
            <AlertCircle className="h-8 w-8 text-destructive/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!properties || properties.length === 0) {
    return (
      <Card className={cn("border-border/50 shadow-sm", className)}>
        <CardContent className={spacing.cardPadding}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-muted/50">
              <Home className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className={typography.h3}>Similar Properties</h3>
          </div>
          <div className="text-center py-6">
            <Home className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">No similar properties found</p>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("border-border/50 shadow-lg", className)}>
      <CardContent className={spacing.cardPadding}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className={typography.h3}>Similar Properties</h3>
              <p className="text-xs text-muted-foreground mt-1">
                AI-powered recommendations based on property features
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {properties.length} found
            </div>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
                title="Refresh similar properties"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Properties List using PropertyItem */}
        <div className="space-y-1">
          {properties.map((property) => (
            <PropertyItem
              key={property.id}
              property={property}
              isLiked={favoriteStates[property.id] || false}
              isHovered={hoveredPropertyId === property.id}
              onHover={handlePropertyHover}
              onSelect={handlePropertySelect}
              onFavoriteToggle={handleFavoriteToggle}
              onShare={handleShare}
            />
          ))}
        </div>
        
        {/* View More Button */}
        <div className="text-center mt-6 pt-4 border-t border-border/50">
          <Link to="/browse">
            <Button 
              variant="outline" 
              size="sm"
              className={cn(
                "font-medium group border-primary/30 hover:bg-primary hover:text-primary-foreground",
                animations.hoverScale
              )}
            >
              <Home className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Explore All Properties
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
        
        {/* AI-powered disclaimer */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-xs font-medium text-blue-800">
                AI-Powered Recommendations
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Properties selected based on location, price, features, and similarity analysis
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimilarProperties;