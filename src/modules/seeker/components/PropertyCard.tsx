// src/modules/seeker/components/PropertyCard.tsx
// Version: 4.0.0
// Last Modified: 10-05-2025 12:00 IST
// Purpose: Optimized PropertyCard with balanced modularity

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
import FavoriteButton from './FavoriteButton';

// Import simplified sub-components
import PropertyCardImage from './PropertyCardImage';
import PropertyCardContent from './PropertyCardContent';
import PropertyCardLoginDialog from './PropertyCardLoginDialog';

interface PropertyCardProps {
  property: PropertyType;
  initialIsLiked?: boolean;
  onLikeToggle?: (propertyId: string, liked: boolean) => void;
  className?: string;
  onHover?: (propertyId: string, isHovering: boolean) => void;
  isHovered?: boolean;
}

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
  }, [property.id, user, isFavorite]);

  // Handle like toggle
  const handleLikeToggle = async (newLikedState: boolean) => {
    if (!user) {
      // Show login dialog for non-authenticated users
      setShowLoginDialog(true);
      return;
    }

    setIsLikeLoading(true);
    
    try {
      // Use the global context functions
      const success = newLikedState 
        ? await addFavorite(property.id)
        : await removeFavorite(property.id);
      
      if (success) {
        // Update local state
        setIsLiked(newLikedState);
        
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
        description: "There was a problem updating your favorites. This property may not be compatible with the favorites system.",
        variant: "destructive",
        duration: 5000,
      });
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

  // Handle login dialog actions
  const handleLoginClick = () => {
    setShowLoginDialog(false);
    // Navigate to login page with a return URL
    navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`);
  };

  const handleCancelLogin = () => {
    setShowLoginDialog(false);
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
        <PropertyCardImage 
          property={property} 
          isLiked={isLiked}
          isLikeLoading={isLikeLoading}
          onLikeToggle={handleLikeToggle}
        />

        <PropertyCardContent 
          property={property} 
          theme={theme} 
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