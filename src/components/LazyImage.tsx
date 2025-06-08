// src/components/LazyImage.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 19:15 IST
// Purpose: Lazy loading image component with progressive enhancement

import React, { useState, useRef, useEffect } from 'react';
import { useLazyLoad } from '@/hooks/useLazyLoad';
import { imageService } from '@/services/imageService';

interface LazyImageProps {
  propertyId: string;
  image: {
    id: string;
    fileName?: string;
    dataUrl?: string;
    url?: string;
  };
  className?: string;
  alt?: string;
  priority?: boolean; // For above-the-fold images
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  propertyId,
  image,
  className = '',
  alt = 'Property image',
  priority = false,
  placeholder = '/noimage.png',
  onLoad,
  onError
}) => {
  const [src, setSrc] = useState<string>(priority ? '' : placeholder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Only use lazy loading for non-priority images
  const { isVisible } = useLazyLoad(imgRef, {
    threshold: 0.1,
    rootMargin: '100px', // Start loading 100px before visible
    triggerOnce: true
  });

  // Determine when to load the image
  const shouldLoad = priority || isVisible;

  useEffect(() => {
    if (!shouldLoad || src !== placeholder || loading || error) return;

    const loadImage = async () => {
      setLoading(true);
      
      try {
        let imageUrl = '';

        // Priority 1: Use dataUrl if available (immediate)
        if (image.dataUrl) {
          imageUrl = image.dataUrl;
        }
        // Priority 2: Use existing URL
        else if (image.url) {
          imageUrl = image.url;
        }
        // Priority 3: Get URL from image service (if it exists)
        else if (image.fileName && propertyId && typeof imageService !== 'undefined') {
          imageUrl = await imageService.getImageUrl(propertyId, image.fileName);
        }
        
        if (imageUrl && imageUrl !== placeholder) {
          setSrc(imageUrl);
          onLoad?.();
        } else {
          throw new Error('No valid image source found');
        }
      } catch (err) {
        console.error(`Failed to load image ${image.id}:`, err);
        setError(true);
        onError?.();
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [shouldLoad, image, propertyId, src, loading, error, placeholder, onLoad, onError]);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* The actual image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: loading ? 0.7 : 1 }}
        onError={(e) => {
          setError(true);
          e.currentTarget.src = placeholder;
          onError?.();
        }}
        onLoad={() => {
          if (src !== placeholder) {
            onLoad?.();
          }
        }}
        loading={priority ? 'eager' : 'lazy'} // Native lazy loading as backup
      />
    </div>
  );
};

export default LazyImage;