// src/modules/seeker/components/PropertyCardImage.tsx
// Version: 2.0.0
// Last Modified: 09-05-2025 14:15 IST
// Purpose: Enhanced image selection logic to display the correct property image

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyType } from '@/modules/owner/components/property/types';
import FavoriteButton from './FavoriteButton';

interface PropertyCardImageProps {
  property: PropertyType;
  isLiked: boolean;
  isLikeLoading: boolean;
  onLikeToggle: (newLikedState: boolean) => void;
}

const PropertyCardImage: React.FC<PropertyCardImageProps> = ({
  property,
  isLiked,
  isLikeLoading,
  onLikeToggle
}) => {
  // Enhanced image selection logic based on PropertyGallery component
  const getImageSource = useMemo(() => {
    // Extract property_images from the property
    const propertyImages = property.property_images || [];
    
    // Check for images in property_details (newer format)
    let detailsImages: any[] = [];
    try {
      const details = typeof property.property_details === 'string' 
        ? JSON.parse(property.property_details) 
        : property.property_details;
        
      if (details?.images && Array.isArray(details.images)) {
        detailsImages = details.images;
      } else if (details?.photos?.images && Array.isArray(details.photos.images)) {
        detailsImages = details.photos.images;
      }
    } catch (error) {
      console.error('Error parsing property_details:', error);
    }
    
    // 1. First, try to find the primary image from property_images
    const primaryImageFromProps = propertyImages.find(img => img.is_primary || img.isPrimary);
    if (primaryImageFromProps?.url) {
      return primaryImageFromProps.url;
    }
    
    // 2. Then check for primary image in details (newer format)
    const primaryImageFromDetails = detailsImages.find(img => img.isPrimary || img.is_primary);
    if (primaryImageFromDetails?.dataUrl) {
      return primaryImageFromDetails.dataUrl;
    } else if (primaryImageFromDetails?.url) {
      return primaryImageFromDetails.url;
    }
    
    // 3. If no primary image, take the first available image from property_images
    if (propertyImages.length > 0 && propertyImages[0].url) {
      return propertyImages[0].url;
    }
    
    // 4. Or the first image from details
    if (detailsImages.length > 0) {
      return detailsImages[0].dataUrl || detailsImages[0].url;
    }
    
    // 5. Fall back to the legacy image property if available
    if (property.image) {
      return property.image;
    }
    
    // 6. Last resort - use placeholder
    return '/noimage.png';
  }, [property]);

  return (
    <div className="relative">
      <Link 
        to={`/seeker/property/${property.id}`} 
        className="block relative h-60 overflow-hidden"
      >
        {/* Enhanced background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/0 to-black/40 z-10" />
        
        {/* Property Image with Error Handling */}
        <img 
          src={getImageSource} 
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
        <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium shadow-sm text-primary">
          {property.property_details?.propertyType || 'Property'}
        </div>
      </Link>
      
      {/* Favorite Button - shown to all users */}
      <div className="absolute top-3 right-3 z-20">
        <FavoriteButton
          initialIsLiked={isLiked}
          onToggle={onLikeToggle}
          className={isLikeLoading ? "opacity-70" : ""}
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
  );
};

export default PropertyCardImage;