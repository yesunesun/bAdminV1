// src/modules/owner/components/property/ImageGallery.tsx
// Version: 2.3.0
// Last Modified: 26-02-2025 21:00 IST
// Purpose: Optimized image gallery with compact thumbnail strip

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface GalleryProps {
  images: { id: string; url: string }[];
  title: string;
}

const ImageGallery = ({ images, title }: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const handlePrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedImage === null) return;
    
    if (e.key === 'ArrowRight') {
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious();
    } else if (e.key === 'Escape') {
      setSelectedImage(null);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <ImageIcon className="h-12 w-12 text-gray-400" />
        <p className="ml-2 text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Main Gallery Area */}
      <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
        {images.length === 1 ? (
          // Single image layout
          <div 
            className="w-full h-full cursor-pointer"
            onClick={() => setSelectedImage(0)}
          >
            <img
              src={images[0].url}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          // Multiple images layout with grid
          <div className="grid grid-cols-4 grid-rows-1 h-full gap-2">
            {/* Main large image */}
            <div 
              className="col-span-3 row-span-1 relative cursor-pointer overflow-hidden"
              onClick={() => setSelectedImage(0)}
            >
              <img
                src={images[0].url}
                alt={`${title} - Main`}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Side column with smaller images */}
            <div className="col-span-1 row-span-1 grid grid-rows-2 gap-2">
              {images.slice(1, 3).map((image, index) => (
                <div 
                  key={image.id}
                  className="row-span-1 relative cursor-pointer overflow-hidden"
                  onClick={() => setSelectedImage(index + 1)}
                >
                  <img
                    src={image.url}
                    alt={`${title} - ${index + 2}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                </div>
              ))}
              
              {/* If we don't have enough side images, show a placeholder */}
              {images.length < 3 && (
                <div className="row-span-1 bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compact Thumbnail Strip - without title and with smaller thumbnails */}
      {images.length > 3 && (
        <div className="mt-4 pt-2 border-t border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.slice(3).map((image, index) => (
              <div
                key={image.id}
                className="flex-none w-24 h-24 rounded-md overflow-hidden cursor-pointer relative"
                onClick={() => setSelectedImage(index + 3)}
              >
                <img
                  src={image.url}
                  alt={`${title} - ${index + 4}`}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal View */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            className="absolute left-4 text-white/70 hover:text-white p-2"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 text-white/70 hover:text-white p-2"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Main Modal Image */}
          <div 
            className="relative max-w-6xl w-full h-full p-8 flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage].url}
              alt={`${title} - Image ${selectedImage + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />
            
            {/* Thumbnails */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-3 bg-black/50 rounded-lg overflow-x-auto max-w-[90vw]">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-none w-16 h-16 rounded-md overflow-hidden transition-opacity ${
                    selectedImage === index ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full">
              {selectedImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;