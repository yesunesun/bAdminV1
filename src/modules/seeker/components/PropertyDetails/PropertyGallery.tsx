// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 8.0.0 - With Lazy Loading
// Last Modified: 27-05-2025 16:30 IST
// Purpose: Optimized gallery with lazy loading and performance improvements

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LazyImage from '@/components/LazyImage';

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyId?: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, propertyId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Memoize processed images
  const displayImages = useMemo(() => {
    if (!images || images.length === 0) return [];
    
    return [...images]
      .filter(img => img && (img.url || img.dataUrl || img.fileName))
      .sort((a, b) => {
        // Primary first, then by display order
        if ((a.is_primary || a.isPrimary) && !(b.is_primary || b.isPrimary)) return -1;
        if (!(a.is_primary || a.isPrimary) && (b.is_primary || b.isPrimary)) return 1;
        return (a.display_order || 0) - (b.display_order || 0);
      });
  }, [images]);

  // Track loaded images
  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  }, []);

  if (!displayImages.length) {
    return (
      <div className="w-full aspect-[16/9] bg-muted/60 flex flex-col items-center justify-center rounded-xl border">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">No images available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Main featured image - PRIORITY loading */}
      <div className="relative rounded-xl overflow-hidden bg-muted group">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <LazyImage
            propertyId={propertyId || ''}
            image={displayImages[currentIndex]}
            className="w-full h-full"
            priority={true} // ✅ Load main image immediately
            onLoad={() => handleImageLoad(displayImages[currentIndex].id)}
            alt={`Property view ${currentIndex + 1}`}
          />
        </div>
        
        {/* Navigation controls */}
        {displayImages.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-black/40 text-white hover:bg-black/60"
              onClick={() => setCurrentIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1)}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-black/40 text-white hover:bg-black/60"
              onClick={() => setCurrentIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1)}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Thumbnail navigation - LAZY loading */}
      {displayImages.length > 1 && (
        <div className="hidden md:flex space-x-2 overflow-x-auto pb-2">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setCurrentIndex(index)}
              className={`flex-shrink-0 rounded-md overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-primary w-20 h-20 opacity-100' 
                  : 'opacity-70 hover:opacity-100 w-16 h-16'
              }`}
            >
              <LazyImage
                propertyId={propertyId || ''}
                image={image}
                className="w-full h-full"
                priority={index <= 2} // ✅ Load first 3 thumbnails immediately
                onLoad={() => handleImageLoad(image.id)}
                alt={`Thumbnail ${index + 1}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyGallery;