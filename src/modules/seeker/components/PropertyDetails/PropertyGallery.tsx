// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 1.0.0
// Last Modified: 26-02-2025 15:30 IST
// Purpose: Image gallery for property details page

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-muted flex items-center justify-center rounded-lg">
        <p className="text-muted-foreground">No images available</p>
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

  return (
    <div className="relative w-full">
      <div className="aspect-[16/9] relative overflow-hidden rounded-lg bg-muted">
        <img
          src={sortedImages[currentIndex].url}
          alt="Property"
          className="w-full h-full object-cover"
        />
        
        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/70 shadow-sm hover:bg-white/90"
            onClick={goToPrevSlide}
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full bg-white/70 shadow-sm hover:bg-white/90"
            onClick={goToNextSlide}
          >
            <ChevronRightIcon className="h-6 w-6" />
          </Button>
        </div>
        
        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded-md text-sm">
          {currentIndex + 1} / {sortedImages.length}
        </div>
      </div>
      
      {/* Thumbnail navigation */}
      {sortedImages.length > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToSlide(index)}
              className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden transition-all ${
                index === currentIndex 
                  ? 'ring-2 ring-primary' 
                  : 'opacity-70 hover:opacity-100'
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
      )}
    </div>
  );
};

export default PropertyGallery;