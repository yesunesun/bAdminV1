// src/modules/seeker/components/PropertyCardImage.tsx
// Version: 4.0.0
// Last Modified: 17-07-2025 22:30 IST
// Purpose: Updated to use direct image URLs from property_details.imageFiles (bypasses optimization)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PropertyType } from '@/modules/owner/components/property/types';
import FavoriteButton from './FavoriteButton';
import { simpleImageService } from '@/services/simpleImageService';

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
  const [imageUrl, setImageUrl] = useState<string>('/noimage.png');
  const [imageLoading, setImageLoading] = useState(true);

  // Get property image from new direct structure
  useEffect(() => {
    const loadPropertyImage = async () => {
      if (!property?.id) {
        setImageUrl('/noimage.png');
        setImageLoading(false);
        return;
      }

      try {
        setImageLoading(true);
        
        // Try to get image from new imageFiles structure first
        const details = property.property_details || {};
        
        if (details.imageFiles && Array.isArray(details.imageFiles) && details.imageFiles.length > 0) {
          // Use new direct imageFiles structure
          const primaryImage = details.imageFiles.find(img => img.isPrimary);
          const firstImage = details.imageFiles[0];
          const selectedImage = primaryImage || firstImage;
          
          if (selectedImage && selectedImage.url) {
            console.log(`[PropertyCardImage] Using direct URL: ${selectedImage.url}`);
            setImageUrl(selectedImage.url);
            setImageLoading(false);
            return;
          }
        }

        // Fallback: Try to get from service
        const url = await simpleImageService.getPropertyImageUrlAsync(property.id, undefined, true);
        console.log(`[PropertyCardImage] Service returned URL: ${url}`);
        setImageUrl(url);
        
      } catch (error) {
        console.error('[PropertyCardImage] Error loading image:', error);
        setImageUrl('/noimage.png');
      } finally {
        setImageLoading(false);
      }
    };

    loadPropertyImage();
  }, [property?.id, property?.property_details]);

  const detailUrl = `/property/${property.id}`;

  return (
    <div className="relative h-44 overflow-hidden rounded-t-lg">
      <Link to={detailUrl} className="block h-full w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10"></div>
        
        {/* Image with loading state */}
        {imageLoading ? (
          <div className="h-full w-full bg-slate-200 animate-pulse flex items-center justify-center">
            <div className="text-slate-400 text-sm">Loading...</div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={property.title || 'Property'}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 group-hover:scale-110",
              "brightness-100 group-hover:brightness-105"
            )}
            onError={(e) => {
              console.log(`[PropertyCardImage] Image failed to load: ${imageUrl}`);
              (e.target as HTMLImageElement).src = '/noimage.png';
            }}
            onLoad={() => {
              console.log(`[PropertyCardImage] Image loaded successfully: ${imageUrl}`);
            }}
          />
        )}
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
      {property.property_details?.flow?.listingType && (
        <div className="absolute bottom-2 left-2 z-20">
          <div className="px-2 py-1 text-xs font-medium rounded-md bg-primary/80 text-white backdrop-blur-sm">
            {property.property_details.flow.listingType === 'rent' ? 'For Rent' : 
             property.property_details.flow.listingType === 'sale' ? 'For Sale' : 
             property.property_details.flow.listingType}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyCardImage;

// End of file