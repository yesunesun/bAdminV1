// src/components/ui/SimpleDirectImage.tsx
// Version: 1.0.0
// Last Modified: 17-07-2025 22:40 IST
// Purpose: Simple image component for direct URL display (bypasses optimization)

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2, Star } from 'lucide-react';

interface SimpleDirectImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  showLoader?: boolean;
  alt: string;
  onImageLoad?: () => void;
  onImageError?: (error: Event) => void;
}

/**
 * SimpleDirectImage component that displays images from direct URLs
 * This bypasses all optimization systems and displays images as-is
 */
export function SimpleDirectImage({
  src,
  fallbackSrc = '/noimage.png',
  loading = 'lazy',
  aspectRatio = 'auto',
  showLoader = true,
  className,
  alt,
  onImageLoad,
  onImageError,
  ...props
}: SimpleDirectImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Handle image load
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`[SimpleDirectImage] Image loaded successfully: ${currentSrc}`);
    setImageLoading(false);
    setImageError(false);
    onImageLoad?.();
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`[SimpleDirectImage] Image failed to load: ${currentSrc}`);
    setImageLoading(false);
    
    if (currentSrc !== fallbackSrc) {
      console.log(`[SimpleDirectImage] Trying fallback: ${fallbackSrc}`);
      setCurrentSrc(fallbackSrc);
      setImageLoading(true);
      setImageError(false);
    } else {
      console.log(`[SimpleDirectImage] Fallback also failed, showing error state`);
      setImageError(true);
    }
    
    onImageError?.(e.nativeEvent);
  };

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case '4/3':
        return 'aspect-[4/3]';
      case '16/9':
        return 'aspect-video';
      default:
        return '';
    }
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden',
        getAspectRatioClass(),
        className
      )}
    >
      {/* Loading State */}
      {imageLoading && showLoader && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            <span className="text-xs text-muted-foreground">Loading image...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
          <ImageIcon className="h-8 w-8 mb-2" />
          <span className="text-xs text-center px-2">Image not available</span>
        </div>
      )}

      {/* Main Image */}
      {!imageError && (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoading ? 'opacity-0' : 'opacity-100'
          )}
          {...props}
        />
      )}
    </div>
  );
}

/**
 * PropertyDirectImage component specifically for property images
 * Uses the direct URL from property_details.imageFiles
 */
interface PropertyDirectImageProps extends Omit<SimpleDirectImageProps, 'src'> {
  propertyId: string;
  imageFiles?: Array<{
    id: string;
    fileName: string;
    url: string;
    isPrimary: boolean;
    displayOrder: number;
  }>;
  preferPrimary?: boolean;
  imageIndex?: number;
}

export function PropertyDirectImage({
  propertyId,
  imageFiles = [],
  preferPrimary = true,
  imageIndex,
  alt,
  ...props
}: PropertyDirectImageProps) {
  // Select which image to display
  const getImageUrl = (): string => {
    if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
      return '/noimage.png';
    }

    // If specific index is requested
    if (typeof imageIndex === 'number' && imageFiles[imageIndex]) {
      return imageFiles[imageIndex].url || '/noimage.png';
    }

    // If prefer primary
    if (preferPrimary) {
      const primaryImage = imageFiles.find(img => img.isPrimary);
      if (primaryImage && primaryImage.url) {
        return primaryImage.url;
      }
    }

    // Fallback to first image
    const firstImage = imageFiles[0];
    return firstImage?.url || '/noimage.png';
  };

  const imageUrl = getImageUrl();
  const displayAlt = alt || `Property ${propertyId} image`;

  return (
    <SimpleDirectImage
      src={imageUrl}
      alt={displayAlt}
      {...props}
    />
  );
}

/**
 * PropertyImageGallery component for displaying multiple property images
 */
interface PropertyImageGalleryProps {
  propertyId: string;
  imageFiles?: Array<{
    id: string;
    fileName: string;
    url: string;
    isPrimary: boolean;
    displayOrder: number;
  }>;
  className?: string;
  imageClassName?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  onImageClick?: (index: number, image: any) => void;
}

export function PropertyImageGallery({
  propertyId,
  imageFiles = [],
  className,
  imageClassName,
  aspectRatio = '4/3',
  onImageClick
}: PropertyImageGalleryProps) {
  if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8 bg-muted rounded-lg", className)}>
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2" />
          <p className="text-sm">No images available</p>
        </div>
      </div>
    );
  }

  // Sort images by display order
  const sortedImages = imageFiles
    .slice()
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", className)}>
      {sortedImages.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            "relative cursor-pointer rounded-lg overflow-hidden",
            "hover:shadow-lg transition-shadow duration-200",
            image.isPrimary && "ring-2 ring-primary"
          )}
          onClick={() => onImageClick?.(index, image)}
        >
          <SimpleDirectImage
            src={image.url}
            alt={`Property ${propertyId} - Image ${index + 1}`}
            aspectRatio={aspectRatio}
            className={imageClassName}
          />
          
          {/* Primary badge */}
          {image.isPrimary && (
            <div className="absolute top-2 left-2">
              <div className="px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md flex items-center gap-1">
                <Star className="h-3 w-3" />
                Primary
              </div>
            </div>
          )}
          
          {/* Image counter */}
          <div className="absolute bottom-2 right-2">
            <div className="px-2 py-1 bg-black/50 text-white text-xs rounded-md">
              {index + 1}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// End of file