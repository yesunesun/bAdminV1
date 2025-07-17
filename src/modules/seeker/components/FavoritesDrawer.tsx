// src/modules/seeker/components/FavoritesDrawer.tsx
// Version: 3.0.0
// Last Modified: 11-05-2025 10:30 IST
// Purpose: Updated to use PropertyItem component for consistent property rendering

import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { getUserFavorites, togglePropertyLike } from '../services/seekerService';
import { Loader2, Heart, X, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PropertyItem from './PropertyItem'; // Import the new PropertyItem component
import { simpleImageService } from '@/services/simpleImageService';

interface FavoritesDrawerProps {
  open: boolean;
  onClose: () => void;
}

const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { refreshFavorites } = useFavorites();
  
  // State for favorite properties
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);

  // Load favorite properties when the drawer opens
  useEffect(() => {
    if (open && user) {
      loadFavoriteProperties();
    }
  }, [open, user]);

  // Load user favorite properties
  const loadFavoriteProperties = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const favorites = await getUserFavorites();
      console.log(`🔍 [FavoritesDrawer] Loaded ${favorites.length} favorite properties:`, favorites);
      setFavoriteProperties(favorites);
    } catch (err) {
      console.error('❌ [FavoritesDrawer] Error loading favorites:', err);
      setError('Unable to load your favorite properties. Please try again later.');
    } finally {
      setLoading(false);
    }
  };


  // Get property image using the same logic as PropertyItem component
  const getPropertyImage = (property: any): string => {
    // TEMPORARILY DISABLED: Return default image to prevent 406 errors
    console.warn(`[FavoritesDrawer] Image loading temporarily disabled for property ${property.id}`);
    return '/noimage.png';
    
    /*
    console.log(`🔍 [FavoritesDrawer] Getting image for property ${property.id}:`, {
      property_id: property.id,
      primary_image: property.primary_image,
      property_images: property.property_images,
      property_details: property.property_details
    });
    
    try {
      // Method 1: Use primary_image field if available
      if (property.primary_image && property.primary_image.trim()) {
        const imageUrl = await simpleImageService.getImageUrl(property.id, property.primary_image);
        console.log(`✅ [FavoritesDrawer] Method 1 - Using primary_image: ${property.primary_image} -> ${imageUrl}`);
        return imageUrl;
      }
      
      // Method 2: Check if it has property_images array
      if (property.property_images && Array.isArray(property.property_images) && property.property_images.length > 0) {
        const primaryImage = property.property_images.find(img => img.is_primary);
        const imageToUse = primaryImage || property.property_images[0];
        
        console.log(`🔍 [FavoritesDrawer] Method 2 - Found property_images:`, property.property_images);
        console.log(`🔍 [FavoritesDrawer] Method 2 - Using image:`, imageToUse);
        
        if (imageToUse.url && imageToUse.url.startsWith('http')) {
          console.log(`✅ [FavoritesDrawer] Method 2 - Using direct URL: ${imageToUse.url}`);
          return imageToUse.url;
        }
        
        if (imageToUse.fileName) {
          const imageUrl = await simpleImageService.getImageUrl(property.id, imageToUse.fileName);
          console.log(`✅ [FavoritesDrawer] Method 2 - Using fileName: ${imageToUse.fileName} -> ${imageUrl}`);
          return imageUrl;
        }
      }
      
      // Method 3: Legacy property_details support
      const details = property.property_details || {};
      if (details.primaryImage) {
        console.log(`🔍 [FavoritesDrawer] Method 3 - Found primaryImage: ${details.primaryImage}`);
        if (details.primaryImage.startsWith('http') || details.primaryImage.startsWith('/')) {
          console.log(`✅ [FavoritesDrawer] Method 3 - Using direct primaryImage: ${details.primaryImage}`);
          return details.primaryImage;
        }
        const imageUrl = await simpleImageService.getImageUrl(property.id, details.primaryImage);
        console.log(`✅ [FavoritesDrawer] Method 3 - Using primaryImage with simpleImageService: ${details.primaryImage} -> ${imageUrl}`);
        return imageUrl;
      }
      
      // Method 4: Check for imageFiles in property_details
      if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
        const primaryImage = details.imageFiles.find((img: any) => img.isPrimary || img.is_primary);
        const imageToUse = primaryImage || details.imageFiles[0];
        
        console.log(`🔍 [FavoritesDrawer] Method 4 - Found imageFiles:`, details.imageFiles);
        console.log(`🔍 [FavoritesDrawer] Method 4 - Using image:`, imageToUse);
        
        if (imageToUse && imageToUse.fileName) {
          const imageUrl = await simpleImageService.getImageUrl(property.id, imageToUse.fileName);
          console.log(`✅ [FavoritesDrawer] Method 4 - Using fileName: ${imageToUse.fileName} -> ${imageUrl}`);
          return imageUrl;
        }
      }
      
      console.log(`❌ [FavoritesDrawer] No image found for property ${property.id}, using default`);
      return '/noimage.png';
    } catch (error) {
      console.error(`❌ [FavoritesDrawer] Error getting image for property ${property.id}:`, error);
      return '/noimage.png';
    }
    */
  };

  // Handle removing a property from favorites
  const handleRemoveFromFavorites = async (propertyId: string) => {
    if (!user) return false;
    
    try {
      // Call the service to toggle (remove) the favorite
      const result = await togglePropertyLike(propertyId, false);
      
      if (result.success) {
        // Update local state - remove the property from the list
        setFavoriteProperties(prev => prev.filter(p => p.id !== propertyId));
        
        // Refresh global favorites
        await refreshFavorites();
        
        // Show success toast
        toast({
          title: "Removed from favorites",
          description: "Property has been removed from your favorites",
          duration: 2000,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error removing favorite:', error);
      
      toast({
        title: "Action failed",
        description: "There was a problem removing the property from favorites",
        variant: "destructive",
        duration: 3000,
      });
      
      return false;
    }
  };

  // Handle property hover for potential map integration
  const handlePropertyHover = (propertyId: string, isHovering: boolean) => {
    setHoveredProperty(isHovering ? propertyId : null);
  };

  // Handle property selection - navigate to property detail
  const handlePropertySelect = (property: any) => {
    onClose();
    navigate(`/seeker/property/${property.id}`);
  };

  // Handle share action
  const handleShare = (e: React.MouseEvent, property: any) => {
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
        copyToClipboard(propertyLink);
      });
    } else {
      // Fallback to clipboard
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

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="sm:max-w-md w-full p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <Heart className="h-5 w-5 text-primary mr-2" />
              Favorite Properties
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetDescription>
            Properties you've saved to view later
          </SheetDescription>
        </SheetHeader>
        
        {/* Favorites content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your favorites...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-4" />
              <p className="font-medium mb-2">Error loading favorites</p>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadFavoriteProperties}>
                Try Again
              </Button>
            </div>
          ) : favoriteProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Heart className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-1">No favorites yet</h3>
              <p className="text-muted-foreground max-w-xs mb-4">
                Save properties you like to view them later by clicking the heart icon
              </p>
              <Button variant="outline" onClick={onClose}>
                Browse Properties
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {/* Use our new PropertyItem component for each favorite property */}
              {favoriteProperties.map(property => (
                <PropertyItem
                  key={property.id}
                  property={property}
                  isLiked={true} // Always true in favorites drawer
                  isHovered={hoveredProperty === property.id}
                  propertyImage={getPropertyImage(property)}
                  onHover={handlePropertyHover}
                  onSelect={handlePropertySelect}
                  onFavoriteToggle={(_, isLiked) => handleRemoveFromFavorites(property.id)}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </div>
        
        {favoriteProperties.length > 0 && (
          <SheetFooter className="p-4 border-t">
            <div className="w-full flex justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onClose}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/seeker');
                }}
              >
                Browse More
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default FavoritesDrawer;