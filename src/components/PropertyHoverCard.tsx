// src/components/PropertyHoverCard.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 21:45 IST
// Purpose: Hover card component that matches List View design for map markers

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle, Heart } from 'lucide-react';
import { OverlayView } from '@react-google-maps/api';
import { fastImageService } from '@/modules/seeker/components/PropertyItem/services/fastImageService';
import { cn } from '@/lib/utils';

interface PropertyType {
  id: string;
  title?: string;
  price?: number;
  city?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  status?: string;
  property_details?: any;
}

interface PropertyHoverCardProps {
  property: PropertyType;
  position: { lat: number; lng: number };
  onClose: () => void;
  onNavigate: (property: PropertyType) => void;
  onFavoriteToggle?: (propertyId: string, isLiked: boolean) => void;
  isFavorite?: boolean;
  isVisible: boolean;
}

const PropertyHoverCard: React.FC<PropertyHoverCardProps> = ({
  property,
  position,
  onClose,
  onNavigate,
  onFavoriteToggle,
  isFavorite = false,
  isVisible
}) => {
  const [imageUrl, setImageUrl] = useState<string>('/noimage.png');
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get property image using the same logic as Home1.tsx
  const getPropertyImage = (property: PropertyType): string => {
    try {
      const details = property.property_details || {};
      
      // Try to find image in imageFiles array (most common structure)
      if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
        // Find primary image or use first
        const primaryImage = details.imageFiles.find((img: any) => img.isPrimary || img.is_primary);
        const imageToUse = primaryImage || details.imageFiles[0];
        
        if (imageToUse?.fileName) {
          return fastImageService.getPublicImageUrl(property.id, imageToUse.fileName);
        }
        
        // Fallback to direct URL if available
        if (imageToUse?.url) return imageToUse.url;
        if (imageToUse?.publicUrl) return imageToUse.publicUrl;
        if (imageToUse?.dataUrl) return imageToUse.dataUrl;
      }
      
      // Try other image paths in the property details
      const imagePaths = [
        details.images,
        details.photos?.images,
        details.media?.images,
        details.media?.photos?.images
      ];
      
      for (const path of imagePaths) {
        if (Array.isArray(path) && path.length > 0) {
          const primaryImage = path.find((img: any) => img.isPrimary || img.is_primary);
          const imageToUse = primaryImage || path[0];
          
          if (imageToUse?.fileName) {
            return fastImageService.getPublicImageUrl(property.id, imageToUse.fileName);
          }
          
          // Fallback to direct URL if available
          if (imageToUse?.url) return imageToUse.url;
          if (imageToUse?.publicUrl) return imageToUse.publicUrl;
          if (imageToUse?.dataUrl) return imageToUse.dataUrl;
        }
      }
      
      // Check for direct image properties
      if (details.primaryImage) return details.primaryImage;
      if (details.image) return details.image;
      
      // Last resort - use fastImageService to try to find first available image
      return fastImageService.getPublicImageUrl(property.id, 'default');
      
    } catch (error) {
      console.error(`Error getting image for property ${property.id}:`, error);
      return '/noimage.png';
    }
  };

  // Format price using the same logic as Home1.tsx
  const formatPropertyPrice = (property: PropertyType): string => {
    try {
      const price = property.property_details?.price || property.price || 0;
      
      if (price === 0) return 'Price on Request';
      if (price === 1) return 'Contact for Price';
      
      const numPrice = typeof price === 'string' ? parseFloat(price) : price;
      
      if (numPrice >= 10000000) {
        return `₹${(numPrice / 10000000).toFixed(1)} Cr`;
      } else if (numPrice >= 100000) {
        return `₹${(numPrice / 100000).toFixed(0)} L`;
      } else {
        return `₹${numPrice.toLocaleString('en-IN')}`;
      }
    } catch (error) {
      return 'Price on Request';
    }
  };

  // Load image on mount
  useEffect(() => {
    if (!isVisible) return;
    
    const loadImage = async () => {
      try {
        setImageLoading(true);
        setImageError(false);
        
        const url = getPropertyImage(property);
        
        // If it's a fastImageService URL, test if the image exists
        if (url.includes('property-images-v2')) {
          // Create a test image to check if it loads
          const testImg = new Image();
          testImg.onload = () => {
            setImageUrl(url);
            setImageLoading(false);
          };
          testImg.onerror = () => {
            // Try to find first available image
            fastImageService.findFirstImageUrl(property.id).then(fallbackUrl => {
              setImageUrl(fallbackUrl);
              setImageLoading(false);
            }).catch(() => {
              setImageUrl('/apartment.jpg');
              setImageError(true);
              setImageLoading(false);
            });
          };
          testImg.src = url;
        } else {
          setImageUrl(url);
          setImageLoading(false);
        }
      } catch (error) {
        console.error(`Error loading image for property ${property.id}:`, error);
        setImageUrl('/apartment.jpg');
        setImageError(true);
        setImageLoading(false);
      }
    };
    
    loadImage();
  }, [property.id, isVisible]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(property.id, !isFavorite);
  };

  const handleCardClick = () => {
    onNavigate(property);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -height - 60, // Position above the marker with some spacing
      })}
    >
      <div
        className="relative z-10 pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ 
          filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))',
          animation: isVisible ? 'fadeInScale 0.2s ease-out' : 'none'
        }}
      >
        {/* Triangle pointer */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-background"></div>
        </div>

        <Card className={cn(
          "w-80 max-w-sm overflow-hidden transition-all duration-300 cursor-pointer border-0",
          "bg-background/98 backdrop-blur-md shadow-2xl",
          isHovered ? "shadow-3xl scale-105" : ""
        )}>
          <div className="relative" onClick={handleCardClick}>
            {imageLoading ? (
              <div className="w-full h-40 bg-muted animate-pulse flex items-center justify-center">
                <div className="text-muted-foreground text-sm">Loading...</div>
              </div>
            ) : (
              <img 
                src={imageUrl}
                alt={property.property_details?.flow?.title || property.title || 'Property'}
                className="w-full h-40 object-cover transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!imageError) {
                    target.onerror = null;
                    target.src = '/apartment.jpg';
                    setImageError(true);
                  }
                }}
              />
            )}
            
            {/* Verified Badge */}
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <CheckCircle size={10} />
              Verified
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-md text-gray-600 hover:text-gray-800 transition-colors text-xs font-bold leading-none"
              style={{ width: '24px', height: '24px', fontSize: '14px' }}
            >
              ×
            </button>
            
            {/* Favorite Button */}
            {onFavoriteToggle && (
              <button
                onClick={handleFavoriteClick}
                className={cn(
                  "absolute top-2 right-8 p-1.5 rounded-full transition-all duration-200",
                  "bg-white/90 backdrop-blur-sm hover:bg-white shadow-md",
                  isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"
                )}
              >
                <Heart 
                  size={14} 
                  className={isFavorite ? "fill-current" : ""} 
                />
              </button>
            )}
            
            {imageError && (
              <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                No Image
              </div>
            )}
          </div>
          
          <div className="p-3" onClick={handleCardClick}>
            <h3 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
              {property.property_details?.flow?.title || 
               property.title || 
               `Property ID: ${property.id.slice(-8)}`}
            </h3>
            
            <div className="flex items-center text-muted-foreground mb-2">
              <MapPin size={12} className="mr-1" />
              <span className="text-xs">
                {property.property_details?.location?.city || 
                 property.property_details?.location?.address || 
                 property.city || 
                 property.address || 
                 'Hyderabad'}
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-lg font-bold text-primary">{formatPropertyPrice(property)}</span>
                {property.property_details?.price_per_sqft && (
                  <div className="text-xs text-muted-foreground">
                    ₹{property.property_details.price_per_sqft}/sq ft
                  </div>
                )}
              </div>
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                {property.property_details?.property_type || 
                 property.property_details?.basicDetails?.propertyType || 
                 'Property'}
              </span>
            </div>

            {/* Show bedroom/bathroom info if available */}
            {(property.property_details?.beds || property.property_details?.basicDetails?.bhkType || property.bedrooms) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span>
                  {property.property_details?.beds || 
                   property.property_details?.basicDetails?.bhkType?.charAt(0) || 
                   property.bedrooms || '0'} Beds
                </span>
                {(property.property_details?.baths || property.property_details?.basicDetails?.bathrooms || property.bathrooms) && (
                  <span>
                    {property.property_details?.baths || 
                     property.property_details?.basicDetails?.bathrooms || 
                     property.bathrooms} Baths
                  </span>
                )}
                {(property.property_details?.square_feet || property.property_details?.basicDetails?.builtUpArea || property.square_feet) && (
                  <span>
                    {property.property_details?.square_feet || 
                     property.property_details?.basicDetails?.builtUpArea || 
                     property.square_feet} sq ft
                  </span>
                )}
              </div>
            )}

            <Button 
              size="sm"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1.5"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate(property);
              }}
            >
              View Details
            </Button>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </OverlayView>
  );
};

export default PropertyHoverCard;