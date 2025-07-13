import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

export type ImageSize = 'thumbnail' | 'medium' | 'full';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  thumbnailSrc?: string;
  mediumSrc?: string;
  fullSrc?: string;
  preferredSize?: ImageSize;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  showLoader?: boolean;
  alt: string;
}

/**
 * OptimizedImage component that automatically selects the best image size
 * based on the display context and available optimized variants
 */
export function OptimizedImage({
  src,
  thumbnailSrc,
  mediumSrc,
  fullSrc,
  preferredSize = 'medium',
  fallbackSrc,
  loading = 'lazy',
  aspectRatio = 'auto',
  showLoader = true,
  className,
  alt,
  ...props
}: OptimizedImageProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Determine the best image source based on preferred size and available variants
  const getOptimalImageSrc = (): string => {
    switch (preferredSize) {
      case 'thumbnail':
        return thumbnailSrc || mediumSrc || fullSrc || src;
      case 'medium':
        return mediumSrc || fullSrc || thumbnailSrc || src;
      case 'full':
        return fullSrc || mediumSrc || thumbnailSrc || src;
      default:
        return src;
    }
  };

  const imageSrc = getOptimalImageSrc();

  // Handle image load
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  // Handle image error
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
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
          <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground">
          <ImageIcon className="h-8 w-8 mb-2" />
          <span className="text-xs">Image not available</span>
        </div>
      )}

      {/* Main Image */}
      {!imageError && (
        <img
          src={imageSrc}
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

      {/* Fallback Image (if main image fails and fallback is provided) */}
      {imageError && fallbackSrc && (
        <img
          src={fallbackSrc}
          alt={alt}
          loading={loading}
          onLoad={handleImageLoad}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

/**
 * Hook to automatically select the optimal image size based on container width
 */
export function useOptimalImageSize(containerWidth?: number): ImageSize {
  if (!containerWidth) return 'medium';
  
  if (containerWidth <= 300) return 'thumbnail';
  if (containerWidth <= 800) return 'medium';
  return 'full';
}

/**
 * PropertyImage component specifically for property listings
 * with context-aware size selection
 */
interface PropertyImageProps extends Omit<OptimizedImageProps, 'preferredSize'> {
  context: 'homepage' | 'listing' | 'detail' | 'gallery' | 'card';
  propertyId?: string;
}

export function PropertyImage({
  context,
  propertyId,
  ...props
}: PropertyImageProps) {
  // Context-based size mapping
  const getPreferredSize = (): ImageSize => {
    switch (context) {
      case 'homepage':
      case 'card':
        return 'thumbnail';
      case 'listing':
        return 'medium';
      case 'detail':
      case 'gallery':
        return 'full';
      default:
        return 'medium';
    }
  };

  // Context-based aspect ratio
  const getAspectRatio = () => {
    switch (context) {
      case 'homepage':
      case 'card':
        return '4/3' as const;
      case 'listing':
        return '16/9' as const;
      case 'detail':
      case 'gallery':
        return 'auto' as const;
      default:
        return '4/3' as const;
    }
  };

  return (
    <OptimizedImage
      preferredSize={getPreferredSize()}
      aspectRatio={getAspectRatio()}
      loading={context === 'homepage' ? 'eager' : 'lazy'}
      {...props}
    />
  );
}

/**
 * Utility function to build image URLs from optimization record
 */
export function buildImageUrls(baseUrl: string, optimizationRecord?: any) {
  if (!optimizationRecord) {
    return {
      thumbnail: baseUrl,
      medium: baseUrl,
      full: baseUrl
    };
  }

  return {
    thumbnail: optimizationRecord.thumbnail_path 
      ? `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/property-images/${optimizationRecord.thumbnail_path}`
      : baseUrl,
    medium: optimizationRecord.medium_path
      ? `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/property-images/${optimizationRecord.medium_path}`
      : baseUrl,
    full: optimizationRecord.full_path
      ? `${process.env.VITE_SUPABASE_URL}/storage/v1/object/public/property-images/${optimizationRecord.full_path}`
      : baseUrl
  };
}