// src/modules/seeker/components/PropertyCard.tsx
// Version: 5.0.0
// Last Modified: 11-05-2025 11:00 IST
// Purpose: Refactored to be a wrapper around PropertyItem for backward compatibility

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyType } from '@/modules/owner/components/property/types';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { checkPropertyLike } from '../services/seekerService';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useToast } from '@/components/ui/use-toast';

// Import the PropertyItem component
import PropertyItem from './PropertyItem';
import PropertyCardLoginDialog from './PropertyCardLoginDialog';

interface PropertyCardProps {
  property: PropertyType;
  initialIsLiked?: boolean;
  onLikeToggle?: (propertyId: string, liked: boolean) => void;
  className?: string;
  onHover?: (propertyId: string, isHovering: boolean) => void;
  isHovered?: boolean;
}

/**
 * @deprecated Use PropertyItem component instead
 * This component is maintained for backward compatibility and will be removed in a future version
 */
const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  initialIsLiked = false,
  onLikeToggle,
  className = "",
  onHover,
  isHovered = false
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use global favorites context
  const { 
    addFavorite, 
    removeFavorite, 
    refreshFavorites, 
    isFavorite 
  } = useFavorites();
  
  // Local state
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [propertyImage, setPropertyImage] = useState('/noimage.png');

  // Check like status on mount if user is logged in
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user) {
        try {
          // Check from favorites context first (more reliable)
          const isLikedInContext = isFavorite(property.id);
          if (isLikedInContext) {
            setIsLiked(true);
            return;
          }

          // Fallback to API check
          const { liked } = await checkPropertyLike(property.id, user.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };
    
    checkLikeStatus();
    
    // Try to get an image for the property
    if (property.property_details?.imageFiles?.length > 0) {
      const mainImage = property.property_details.imageFiles.find(
        (img: any) => img.isPrimary || img.is_primary
      ) || property.property_details.imageFiles[0];
      
      if (mainImage?.url) {
        setPropertyImage(mainImage.url);
      }
    }
  }, [property.id, user, isFavorite]);

  // Handle like toggle
  const handleLikeToggle = async (propertyId: string, newLikedState: boolean) => {
    if (!user) {
      // Show login dialog for non-authenticated users
      setShowLoginDialog(true);
      return false;
    }

    setIsLikeLoading(true);
    
    try {
      // Update local state first for immediate UI feedback
      setIsLiked(newLikedState);
      
      // Use the global context functions
      const success = newLikedState 
        ? await addFavorite(property.id)
        : await removeFavorite(property.id);
      
      if (success) {
        // Notify parent component if callback provided
        onLikeToggle?.(property.id, newLikedState);
        
        // Refresh favorites in global context to update header count
        await refreshFavorites();
        
        // Show success toast
        toast({
          title: newLikedState ? "Added to favorites" : "Removed from favorites",
          description: newLikedState 
            ? "This property has been added to your favorites." 
            : "This property has been removed from your favorites.",
          duration: 3000,
        });
        
        return true;
      } else {
        throw new Error('Unable to update favorites. Please try again later.');
      }
    } catch (error) {
      console.error('Like toggle failed:', error);
      
      // Revert local state back to original
      setIsLiked(!newLikedState);
      
      // Provide feedback to the user
      toast({
        title: "Action failed",
        description: "There was a problem updating your favorites. Please try again later.",
        variant: "destructive",
        duration: 5000,
      });
      
      return false;
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Handle hover events for map sync
  const handleMouseEnter = () => {
    onHover?.(property.id, true);
  };

  const handleMouseLeave = () => {
    onHover?.(property.id, false);
  };

  // Handle property selection
  const handleSelect = (p: PropertyType) => {
    navigate(`/seeker/property/${p.id}`);
  };

  // Handle login dialog actions
  const handleLoginClick = () => {
    setShowLoginDialog(false);
    // Navigate to login page with a return URL
    navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleCancelLogin = () => {
    setShowLoginDialog(false);
  };

  // Handle share action
  const handleShare = (e: React.MouseEvent, p: PropertyType) => {
    e.preventDefault();
    e.stopPropagation();
    
    const propertyLink = `${window.location.origin}/seeker/property/${p.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: p.title || 'Check out this property',
        text: `Check out this property: ${p.title || 'Property'}`,
        url: propertyLink,
      }).catch(err => {
        navigator.clipboard.writeText(propertyLink);
        toast({
          title: "Link copied!",
          description: "Property link copied to clipboard.",
          duration: 2000,
        });
      });
    } else {
      navigator.clipboard.writeText(propertyLink);
      toast({
        title: "Link copied!",
        description: "Property link copied to clipboard.",
        duration: 2000,
      });
    }
  };

  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden group hover-lift transition-all duration-300",
          "rounded-xl border border-border/40 h-full flex flex-col",
          isHovered ? "ring-2 ring-primary ring-offset-2" : "",
          theme === 'ocean' ? "bg-card" : "bg-card",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Use PropertyItem inside Card for backward compatibility */}
        <PropertyItem 
          property={property}
          isLiked={isLiked}
          isHovered={isHovered}
          propertyImage={propertyImage}
          onHover={(id, hovering) => onHover?.(id, hovering)}
          onSelect={handleSelect}
          onFavoriteToggle={handleLikeToggle}
          onShare={handleShare}
        />
      </Card>

      <PropertyCardLoginDialog 
        isOpen={showLoginDialog} 
        onClose={setShowLoginDialog}
        onLogin={handleLoginClick}
        onCancel={handleCancelLogin}
      />
    </>
  );
};

export default PropertyCard;