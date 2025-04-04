// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 3.0.0
// Last Modified: 06-04-2025 12:15 IST
// Purpose: Enhanced image gallery with better error handling and fallbacks

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PropertyImage } from '../../hooks/usePropertyDetails';

interface PropertyGalleryProps {
  images: PropertyImage[];
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<PropertyImage[]>([]);
  
  // Process images when they change
  useEffect(() => {
    // Log received images for debugging
    console.log('[PropertyGallery] Received images:', images);
    
    if (!images || images.length === 0) {
      // Use a placeholder if no images are available
      setDisplayImages([{
        id: 'placeholder',
        url: '/noimage.png'
      }]);
      return;
    }
    
    // Ensure all images have valid URLs
    const validImages = images.filter(img => img && img.url);
    
    if (validImages.length === 0) {
      setDisplayImages([{
        id: 'placeholder',
        url: '/noimage.png'
      }]);
      return;
    }
    
    // Sort images: primary first, then by display order
    const sortedImages = [...validImages].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.display_order || 999) - (b.display_order || 999);
    });
    
    setDisplayImages(sortedImages);
    setCurrentIndex(0); // Reset to first image when images change
  }, [images]);
  
  // If still no valid images after processing, show placeholder
  if (!displayImages || displayImages.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-muted/60 flex flex-col items-center justify-center rounded-xl border border-border">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">No images available</p>
      </div>
    );
  }
  
  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenOpen(true);
  };

  const goToNextFullscreen = () => {
    setFullscreenIndex((prevIndex) => 
      prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevFullscreen = () => {
    setFullscreenIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
  };
  
  // Handle image load errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/noimage.png';
  };
  
  return (
    <div className="space-y-2">
      {/* Main featured image */}
      <div className="relative rounded-xl overflow-hidden bg-muted group">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <img
            src={displayImages[currentIndex].url}
            alt={`Property view ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={handleImageError}
          />
        </div>
        
        {/* Only show navigation if more than one image */}
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
          onClick={() => openFullscreen(currentIndex)}
        >
          <ExpandIcon className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Thumbnail navigation for desktop - only show if multiple images */}
      {displayImages.length > 1 && (
        <div className="hidden md:flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
          {displayImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 rounded-md overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-primary w-20 h-20 opacity-100' 
                  : 'opacity-70 hover:opacity-100 w-16 h-16 hover:w-20 hover:h-20'
              }`}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </button>
          ))}
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
                src={displayImages[fullscreenIndex].url}
                alt={`Property view ${fullscreenIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={handleImageError}
              />
            </div>
            
            {/* Navigation controls - only if multiple images */}
            {displayImages.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between p-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20"
                    onClick={goToPrevFullscreen}
                  >
                    <ChevronLeftIcon className="h-6 w-6" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20"
                    onClick={goToNextFullscreen}
                  >
                    <ChevronRightIcon className="h-6 w-6" />
                  </Button>
                </div>
                
                {/* Image counter */}
                <div className="absolute bottom-24 left-4 bg-white/10 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                  {fullscreenIndex + 1} / {displayImages.length}
                </div>
                
                {/* Thumbnail strip */}
                <div className="h-24 bg-black/60 p-3 flex items-center">
                  <div className="flex space-x-2 overflow-x-auto">
                    {displayImages.map((image, index) => (
                      <button
                        key={image.id || index}
                        onClick={() => setFullscreenIndex(index)}
                        className={`flex-shrink-0 rounded-md overflow-hidden transition-all h-16 w-16 ${
                          index === fullscreenIndex 
                            ? 'ring-2 ring-white' 
                            : 'opacity-50 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={handleImageError}
                        />
                      </button>
                    ))}
                  </div>
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