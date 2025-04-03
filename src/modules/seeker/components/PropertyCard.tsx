// src/modules/seeker/components/PropertyCard.tsx
// Version: 3.0.0
// Last Modified: 03-04-2025 15:30 IST
// Purpose: Enhanced property card with improved styling, animations, and consistent visual elements

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPinIcon, 
  BedIcon, 
  BathIcon, 
  SquareIcon,
  ShieldCheck,
  Heart,
  HeartOff
} from 'lucide-react';

import { PropertyType } from '@/modules/owner/components/property/types';
import { formatCurrency, cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { checkPropertyLike, togglePropertyLike } from '../services/seekerService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

// Optimized image selection hook
const usePropertyImage = (property: PropertyType) => {
  return useMemo(() => {
    const primaryImage = property.property_images?.find(img => img.is_primary);
    const fallbackImage = property.property_images?.[0];
    
    return primaryImage?.url || 
           fallbackImage?.url || 
           property.image || 
           '/noimage.png';
  }, [property]);
};

// Favorite Button Component
const FavoriteButton: React.FC<{
  initialIsLiked: boolean;
  onToggle: (newState: boolean) => void;
  className?: string;
}> = ({ initialIsLiked, onToggle, className = "" }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  
  // Handle click with animation
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    onToggle(!isLiked);
  };
  
  return (
    <button
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
      onClick={handleClick}
      className={cn(
        "rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm",
        "transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-sm",
        isLiked 
          ? "bg-primary/20 text-primary hover:bg-primary/30" 
          : "bg-white/80 text-foreground/70 hover:text-primary",
        className
      )}
    >
      {isLiked ? (
        <Heart className="h-5 w-5 fill-primary" />
      ) : (
        <Heart className="h-5 w-5" />
      )}
    </button>
  );
};

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
  
  // Like state management
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Optimized image selection
  const imageSrc = usePropertyImage(property);

  // Check like status on mount if user is logged in
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (user) {
        try {
          const { liked } = await checkPropertyLike(property.id, user.id);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
        }
      }
    };
    
    checkLikeStatus();
  }, [property.id, user]);

  // Like toggle handler with login prompt for non-authenticated users
  const handleLikeToggle = async (newLikedState: boolean) => {
    if (!user) {
      // Show login dialog for non-authenticated users
      setShowLoginDialog(true);
      return;
    }

    setIsLikeLoading(true);
    try {
      const result = await togglePropertyLike(property.id, newLikedState);
      if (result.success) {
        setIsLiked(newLikedState);
        onLikeToggle?.(property.id, newLikedState);
        
        // Show success toast
        toast({
          title: newLikedState ? "Added to favorites" : "Removed from favorites",
          description: newLikedState 
            ? "This property has been added to your favorites." 
            : "This property has been removed from your favorites.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Like toggle failed:', error);
      // Revert back to the original state on error
      setIsLiked(!newLikedState);
      
      // Show error toast
      toast({
        title: "Action failed",
        description: "There was a problem updating your favorites. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Location formatting with fallback
  const formattedLocation = useMemo(() => {
    const locationParts = [
      property.address, 
      property.city, 
      property.state
    ].filter(Boolean);
    
    return locationParts.join(', ');
  }, [property.address, property.city, property.state]);

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
        <div className="relative">
          <Link 
            to={`/seeker/property/${property.id}`} 
            className="block relative h-60 overflow-hidden"
          >
            {/* Enhanced background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/0 to-black/40 z-10" />
            
            {/* Property Image with Error Handling */}
            <img 
              src={imageSrc} 
              alt={property.title || 'Property'}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = '/noimage.png';
              }}
            />
            
            {/* Property Type Badge - Enhanced styling */}
            <div className={cn(
              "absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm",
              "rounded-full px-3 py-1.5 text-xs font-medium shadow-sm",
              theme === 'ocean' ? "text-primary" : "text-primary"
            )}>
              {property.property_details?.propertyType || 'Property'}
            </div>
          </Link>
          
          {/* Favorite Button - shown to all users */}
          <div className="absolute top-3 right-3 z-20">
            <FavoriteButton
              initialIsLiked={isLiked}
              onToggle={handleLikeToggle}
              className={isLikeLoading ? "opacity-70 pointer-events-none" : ""}
            />
          </div>

          {/* Verified Badge - show for selected properties */}
          {property.property_details?.isVerified && (
            <div className="absolute top-3 left-3 z-20 bg-white/80 backdrop-blur-sm text-primary rounded-full px-3 py-1.5 text-xs font-medium flex items-center shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Verified
            </div>
          )}
        </div>

        {/* Property Details - Enhanced with better spacing and typography */}
        <div className="flex-grow p-6 flex flex-col">
          <div className="mb-auto">
            {/* Property Title - Enhanced styling */}
            <Link to={`/seeker/property/${property.id}`} className="block">
              <h3 className={cn(
                "text-lg font-semibold line-clamp-2 mb-2",
                "group-hover:text-primary transition-colors"
              )}>
                {property.title}
              </h3>
            </Link>
          
            {/* Property Location - Enhanced icon alignment */}
            <div className="flex items-center mt-1 text-muted-foreground">
              <div className="w-5 h-5 flex items-center justify-center mr-1.5">
                <MapPinIcon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm line-clamp-1">
                {formattedLocation || 'Location Not Specified'}
              </p>
            </div>
          </div>
          
          {/* Property Features - Enhanced with consistent spacing and icon styling */}
          <div className="mt-5 flex justify-between items-center">
            <div className="grid grid-cols-3 gap-2 w-full">
              {property.bedrooms && (
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <BedIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{property.bedrooms} {property.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
                </div>
              )}
              
              {property.bathrooms && (
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <BathIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
                </div>
              )}
              
              {property.square_feet && (
                <div className="flex items-center">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <SquareIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{property.square_feet} sqft</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Price and View Details - Enhanced styling */}
          <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between">
            <div>
              <p className={cn(
                "text-xl font-bold flex items-center",
                theme === 'ocean' ? "text-primary" : "text-primary"
              )}>
                ₹{formatCurrency(property.price)}
              </p>
              {property.property_details?.rentalFrequency && (
                <span className="text-xs text-muted-foreground">
                  per {property.property_details.rentalFrequency}
                </span>
              )}
            </div>
            
            <Link 
              to={`/seeker/property/${property.id}`} 
              className={cn(
                "text-sm font-medium px-4 py-2 rounded-full transition-all duration-300",
                "hover:shadow-md hover:-translate-y-0.5",
                theme === 'ocean' 
                  ? "bg-primary/10 text-primary hover:bg-primary/20" 
                  : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              View Details
            </Link>
          </div>
        </div>
      </Card>

      {/* Login Dialog - Enhanced styling */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Sign in to add favorites</DialogTitle>
            <DialogDescription className="mt-2">
              Create an account or sign in to save properties to your favorites list.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-sm text-muted-foreground">
              Sign in to keep track of your favorite properties and get updates on price changes.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelLogin}
              className="sm:w-auto w-full rounded-full"
            >
              Not now
            </Button>
            <Button 
              type="button" 
              onClick={handleLoginClick}
              className="sm:w-auto w-full rounded-full"
            >
              Sign in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyCard;