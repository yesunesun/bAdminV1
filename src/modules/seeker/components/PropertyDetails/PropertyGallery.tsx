// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 2.0.0
// Last Modified: 01-03-2025 14:30 IST
// Purpose: Enhanced image gallery with immersive viewing experience

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface PropertyImage {
  id: string;
  url: string;
  is_primary?: boolean;
  display_order?: number;
}

interface PropertyGalleryProps {
  images: PropertyImage[];
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-muted/60 flex flex-col items-center justify-center rounded-xl border border-border">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">No images available</p>
      </div>
    );
  }

  // Sort images by display_order or is_primary
  const sortedImages = [...images].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (a.display_order || 999) - (b.display_order || 999);
  });

  const goToNextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
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
      prevIndex === sortedImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevFullscreen = () => {
    setFullscreenIndex((prevIndex) => 
      prevIndex === 0 ? sortedImages.length - 1 : prevIndex - 1
    );
  };

  // For grid view with multiple images
  const renderImageGrid = () => {
    // Show grid only if we have more than 1 image
    if (sortedImages.length <= 1) {
      return null;
    }
    
    // Main image is larger, with up to 4 thumbnails to the right
    return (
      <div className="grid grid-cols-4 gap-2 mt-2">
        {sortedImages.slice(0, 5).map((image, index) => (
          <button
            key={image.id}
            onClick={() => openFullscreen(index)}
            className={`relative rounded-lg overflow-hidden ${
              index === 0 ? "col-span-4 md:col-span-2 aspect-video" : "aspect-square"
            } transition-opacity hover:opacity-95 group`}
          >
            <img
              src={image.url}
              alt={`Property view ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ExpandIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        ))}
        
        {/* Show "See All Photos" button if more than 5 images */}
        {sortedImages.length > 5 && (
          <button
            onClick={() => openFullscreen(5)}
            className="col-span-4 md:col-span-2 aspect-square relative rounded-lg overflow-hidden bg-black/50 flex items-center justify-center group hover:bg-black/60 transition-colors"
          >
            <span className="text-white font-medium">+{sortedImages.length - 5} More Photos</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Main featured image */}
      <div className="relative rounded-xl overflow-hidden bg-muted group">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <img
            src={sortedImages[currentIndex].url}
            alt="Property Featured View"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        
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
          {currentIndex + 1} / {sortedImages.length}
        </div>
        
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
      
      {/* Thumbnail navigation for desktop */}
      <div className="hidden md:flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
        {sortedImages.map((image, index) => (
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
              src={image.url}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
      
      {/* Mobile image grid view */}
      <div className="md:hidden">
        {renderImageGrid()}
      </div>
      
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
                src={sortedImages[fullscreenIndex].url}
                alt={`Property view ${fullscreenIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            
            {/* Navigation controls */}
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
            <div className="absolute bottom-4 left-4 bg-white/10 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
              {fullscreenIndex + 1} / {sortedImages.length}
            </div>
            
            {/* Thumbnail strip */}
            <div className="h-24 bg-black/60 p-3 flex items-center">
              <div className="flex space-x-2 overflow-x-auto">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
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
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PropertyGallery;