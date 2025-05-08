// src/modules/seeker/components/PropertyCardImage.tsx
// Version: 3.0.0
// Last Modified: 10-05-2025 14:30 IST
// Purpose: Updated to handle loading state for favorites

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PropertyType } from '@/modules/owner/components/property/types';
import FavoriteButton from './FavoriteButton';

interface PropertyCardImageProps {
  property: PropertyType;
  isLiked: boolean;
  isLikeLoading?: boolean;
  onLikeToggle: (isLiked: boolean) => void;
}

const PropertyCardImage: React.FC<PropertyCardImageProps> = ({
  property,
  isLiked,
  isLikeLoading = false,
  onLikeToggle
}) => {
  // Get property image
  const getPropertyImage = (): string => {
    if (!property) return '/noimage.png';
    
    // Try to find image in different locations
    const details = property.property_details || {};
    
    // Check if primaryImage is already set
    if (details.primaryImage) {
      return details.primaryImage;
    }
    
    // Look for primary image in media or photos
    if (details.media?.images && Array.isArray(details.media.images) && details.media.images.length > 0) {
      const primary = details.media.images.find((img: any) => img.isPrimary || img.is_primary);
      return primary?.url || primary?.dataUrl || details.media.images[0]?.url || details.media.images[0]?.dataUrl || '/noimage.png';
    }
    
    if (details.photos?.images && Array.isArray(details.photos.images) && details.photos.images.length > 0) {
      const primary = details.photos.images.find((img: any) => img.isPrimary || img.is_primary);
      return primary?.url || primary?.dataUrl || details.photos.images[0]?.url || details.photos.images[0]?.dataUrl || '/noimage.png';
    }
    
    // Look directly in images array
    if (details.images && Array.isArray(details.images) && details.images.length > 0) {
      const primary = details.images.find((img: any) => img.isPrimary || img.is_primary);
      return primary?.url || primary?.dataUrl || details.images[0]?.url || details.images[0]?.dataUrl || '/noimage.png';
    }
    
    // Default to placeholder
    return '/noimage.png';
  };

  const imageUrl = getPropertyImage();
  const detailUrl = `/property/${property.id}`;

  return (
    <div className="relative h-44 overflow-hidden rounded-t-lg">
      <Link to={detailUrl} className="block h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10"></div>
        <img
          src={imageUrl}
          alt={property.title || 'Property'}
          className={cn(
            "h-full w-full object-cover transition-all duration-500 group-hover:scale-110",
            "brightness-100 group-hover:brightness-105"
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/noimage.png';
          }}
        />
      </Link>
      
      {/* Property favorite button - positioned in top right */}
      <div className="absolute top-2 right-2 z-20">
        <FavoriteButton 
          initialIsLiked={isLiked} 
          onToggle={onLikeToggle}
          isLoading={isLikeLoading}
        />
      </div>
      
      {/* Property badge - e.g. "For Sale", "For Rent" */}
      {property.property_details?.listingType && (
        <div className="absolute bottom-2 left-2 z-20">
          <div className="px-2 py-1 text-xs font-medium rounded-md bg-primary/80 text-white backdrop-blur-sm">
            {property.property_details.listingType === 'rent' ? 'For Rent' : 
             property.property_details.listingType === 'sale' ? 'For Sale' : 
             property.property_details.listingType}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyCardImage;