// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 7.1.0 - Bug Fix Version
// Last Modified: 27-05-2025 19:45 IST
// Purpose: Fixed version without LazyImage dependency

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PropertyImage } from '../../hooks/usePropertyDetails';

const FALLBACK_IMAGE = '/noimage.png';

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyId?: string;
  directUrls?: string[];
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ 
  images, 
  propertyId,
  directUrls 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Memoize processed images to prevent unnecessary recalculations
  const displayImages = useMemo(() => {
    if (!images || images.length === 0) {
      return [{
        id: 'placeholder',
        url: FALLBACK_IMAGE,
        is_primary: true,
        display_order: 0
      }];
    }

    return [...images]
      .filter(img => img && (img.url || img.dataUrl || img.fileName))
      .sort((a, b) => {
        if ((a.is_primary || a.isPrimary) && !(b.is_primary || b.isPrimary)) return -1;
        if (!(a.is_primary || a.isPrimary) && (b.is_primary || b.isPrimary)) return 1;
        return (a.display_order || 0) - (b.display_order || 0);
      })
      .map((img, index) => ({
        ...img,
        id: img.id || `img-${index}`
      }));
  }, [images]);

  // Simple image URL resolver
  const getImageSource = useCallback((image: PropertyImage): string => {
    // Priority 1: Use direct URLs if available
    const imageIndex = displayImages.findIndex(img => img.id === image.id);
    if (directUrls && directUrls.length > imageIndex && imageIndex >= 0) {
      return directUrls[imageIndex];
    }

    // Priority 2: Use dataUrl if available
    if (image.dataUrl) {
      return image.dataUrl;
    }

    // Priority 3: Use existing URL
    if (image.url) {
      return image.url;
    }

    // Fallback
    return FALLBACK_IMAGE;
  }, [displayImages, directUrls]);

  // Handle image load events
  const handleImageLoad = useCallback((imageId: string) => {
    setLoadingStates(prev => ({ ...prev, [imageId]: false }));
  }, []);

  // Handle image error events
  const handleImageError = useCallback((imageId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Image load failed for ${imageId}`);
    e.currentTarget.src = FALLBACK_IMAGE;
    setLoadingStates(prev => ({ ...prev, [imageId]: false }));
  }, []);

  // Navigation functions
  const goToNextSlide = useCallback(() => {
    setCurrentIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1);
  }, [displayImages.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
  }, [displayImages.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Show placeholder if no valid images
  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-muted/60 flex flex-col items-center justify-center rounded-xl border border-border">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">No images available</p>
      </div>
    );
  }

  const currentImage = displayImages[currentIndex];
  const currentImageUrl = getImageSource(currentImage);
  const isCurrentImageLoading = loadingStates[currentImage.id] ?? false;

  return (
    <div className="space-y-2">
      {/* Main featured image */}
      <div className="relative rounded-xl overflow-hidden bg-muted group">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          {/* Loading indicator */}
          {isCurrentImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          <img
            src={currentImageUrl}
            alt={`Property view ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => handleImageError(currentImage.id, e)}
            onLoad={() => handleImageLoad(currentImage.id)}
            loading="eager" // Load main image immediately
          />
        </div>
        
        {/* Navigation and controls - only show if multiple images */}
        {displayImages.length > 1 && (
          <>
            {/* Navigation arrows */}
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevSlide();
                }}
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextSlide();
                }}
              >
                <ChevronRightIcon className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Image counter */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
        
        {/* Fullscreen button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            setFullscreenIndex(currentIndex);
            setFullscreenOpen(true);
          }}
        >
          <ExpandIcon className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Thumbnail navigation - only show if multiple images */}
      {displayImages.length > 1 && (
        <div className="hidden md:flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
          {displayImages.map((image, index) => {
            const thumbUrl = getImageSource(image);
            
            return (
              <button
                key={image.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 rounded-md overflow-hidden transition-all ${
                  index === currentIndex 
                    ? 'ring-2 ring-primary w-20 h-20 opacity-100' 
                    : 'opacity-70 hover:opacity-100 w-16 h-16 hover:w-20 hover:h-20'
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(image.id, e)}
                  loading="lazy" // Lazy load thumbnails
                />
              </button>
            );
          })}
        </div>
      )}
      
      {/* Fullscreen gallery dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-screen-lg w-11/12 h-[90vh] p-0 bg-black border-none">
          <div className="relative w-full h-full flex flex-col">
            {/* Close button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 z-20 rounded-full bg-black/60 text-white hover:bg-black/80 border-white/20"
              onClick={() => setFullscreenOpen(false)}
            >
              <XIcon className="h-5 w-5" />
            </Button>
            
            {/* Main image container */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img
                src={getImageSource(displayImages[fullscreenIndex])}
                alt={`Property view ${fullscreenIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => handleImageError(displayImages[fullscreenIndex].id, e)}
              />
            </div>
            
            {/* Navigation controls for fullscreen */}
            {displayImages.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20"
                    onClick={() => setFullscreenIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1)}
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20"
                    onClick={() => setFullscreenIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1)}
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </Button>
                </div>
                
                {/* Image counter */}
                <div className="absolute bottom-24 left-4 bg-white/10 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                  {fullscreenIndex + 1} / {displayImages.length}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyGallery;