// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 6.3.0
// Last Modified: 10-05-2025 15:00 IST
// Purpose: Fixed image loading from Supabase storage

import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PropertyImage } from '../../hooks/usePropertyDetails';
import { supabase } from '@/lib/supabase';

// Constants
const STORAGE_BUCKET = 'property-images-v2';

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyId?: string;
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, propertyId }) => {
  // Debug info
  console.log(`[PropertyGallery] Initializing with propertyId: ${propertyId}`);
  console.log(`[PropertyGallery] Images received: ${images?.length || 0}`);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [displayImages, setDisplayImages] = useState<PropertyImage[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  
  // Generate a signed URL to avoid CORS issues
  const getSignedUrl = async (fileName: string): Promise<string> => {
    if (!propertyId || !fileName) return '/noimage.png';
    
    // Skip signed URL generation for legacy formats
    if (fileName.startsWith('legacy-') || fileName.startsWith('img-')) {
      return '/noimage.png';
    }
    
    try {
      // Generate a signed URL that expires in 1 hour (3600 seconds)
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(`${propertyId}/${fileName}`, 3600);
        
      if (error) {
        console.error(`[PropertyGallery] Error generating signed URL: ${error.message}`);
        return '/noimage.png';
      }
      
      console.log(`[PropertyGallery] Generated signed URL: ${data.signedUrl}`);
      return data.signedUrl;
    } catch (err) {
      console.error(`[PropertyGallery] Error:`, err);
      return '/noimage.png';
    }
  };
  
  // Load all image URLs
  const loadImageUrls = async () => {
    if (!propertyId || !displayImages || displayImages.length === 0) return;
    
    const urlsMap: Record<string, string> = {};
    for (const img of displayImages) {
      if (img.id && img.fileName && !img.fileName.startsWith('legacy-') && !img.fileName.startsWith('img-')) {
        try {
          const url = await getSignedUrl(img.fileName);
          urlsMap[img.id] = url;
        } catch (err) {
          console.error(`Error loading image URL for ${img.fileName}:`, err);
        }
      } else if (img.dataUrl) {
        urlsMap[img.id] = img.dataUrl;
      } else if (img.url) {
        urlsMap[img.id] = img.url;
      }
    }
    
    setImageUrls(urlsMap);
  };
  
  // Get image source - handles multiple image formats
  const getImageSource = (image: PropertyImage): string => {
    // First check if we already have a cached URL
    if (image.id && imageUrls[image.id]) {
      return imageUrls[image.id];
    }
    
    // Case 2: Legacy dataUrl format
    if (image.dataUrl && typeof image.dataUrl === 'string') {
      return image.dataUrl;
    }
    
    // Case 3: Standard URL format
    if (image.url && typeof image.url === 'string') {
      return image.url;
    }
    
    // Fallback to placeholder
    return '/noimage.png';
  };
  
  // Process images when they change
  useEffect(() => {
    console.log('[PropertyGallery] Received images:', images?.length || 0);
    console.log('[PropertyGallery] Property ID:', propertyId);
    
    if (!images || images.length === 0) {
      console.log('[PropertyGallery] No images received, using placeholder');
      setDisplayImages([{
        id: 'placeholder',
        url: '/noimage.png',
        is_primary: true,
        display_order: 0
      }]);
      return;
    }

    // Log the first image to debug format
    if (images.length > 0) {
      const firstImg = images[0];
      console.log('[PropertyGallery] First image details:', {
        id: firstImg.id,
        url: firstImg.url ? (typeof firstImg.url === 'string' ? firstImg.url.substring(0, 30) + '...' : 'invalid') : 'none',
        dataUrl: firstImg.dataUrl ? (typeof firstImg.dataUrl === 'string' ? firstImg.dataUrl.substring(0, 30) + '...' : 'invalid') : 'none',
        fileName: firstImg.fileName || 'none',
        is_primary: !!firstImg.is_primary,
        isPrimary: !!firstImg.isPrimary,
      });
    }

    // Ensure all images have valid sources
    const validImages = images
      .filter(img => img && (img.url || img.dataUrl || (propertyId && img.fileName)))
      .map((img, index) => ({
        id: img.id || `img-${index}`,
        url: img.url,
        dataUrl: img.dataUrl,
        fileName: img.fileName,
        is_primary: !!(img.is_primary || img.isPrimary),
        isPrimary: !!(img.isPrimary || img.is_primary),
        display_order: img.display_order || index
      }));
    
    console.log('[PropertyGallery] Valid images count:', validImages.length);
    
    if (validImages.length === 0) {
      console.log('[PropertyGallery] No valid images found, using placeholder');
      setDisplayImages([{
        id: 'placeholder',
        url: '/noimage.png',
        is_primary: true,
        display_order: 0
      }]);
      return;
    }
    
    // Reset image errors when images change
    setImageErrors({});
    
    // Sort images: primary first, then by display order
    const sortedImages = [...validImages].sort((a, b) => {
      if ((a.is_primary || a.isPrimary) && !(b.is_primary || b.isPrimary)) return -1;
      if (!(a.is_primary || a.isPrimary) && (b.is_primary || b.isPrimary)) return 1;
      return (a.display_order || 0) - (b.display_order || 0);
    });

    setDisplayImages(sortedImages);
    setCurrentIndex(0); // Reset to first image when images change
  }, [images, propertyId]);
  
  // Load all image URLs when displayImages changes
  useEffect(() => {
    loadImageUrls();
  }, [displayImages, propertyId]);
  
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
  const handleImageError = (imageId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log(`[PropertyGallery] Image load error for ID: ${imageId}`);
    e.currentTarget.src = '/noimage.png';
    
    // Track which images failed to load
    setImageErrors(prev => ({ ...prev, [imageId]: true }));
    
    // If current image failed, try next one
    if (imageId === displayImages[currentIndex].id && !imageErrors[imageId]) {
      setTimeout(() => {
        goToNextSlide();
      }, 500);
    }
  };
  
  // Get the URL for current image
  const currentImageUrl = displayImages[currentIndex].id
    ? imageUrls[displayImages[currentIndex].id] || getImageSource(displayImages[currentIndex])
    : getImageSource(displayImages[currentIndex]);
    
  // Debug info for current image
  console.log(`[PropertyGallery] Current image: index=${currentIndex}, url=${currentImageUrl}`);
  
  return (
    <div className="space-y-2">
      {/* Debug info */}
      <div className="bg-yellow-100 text-yellow-800 p-2 text-xs">
        <p>PropertyId: {propertyId || 'None'}</p>
        <p>Images: {displayImages.length}</p>
        <p>Current Image: {currentIndex + 1}/{displayImages.length}</p>
        <p>First image filename: {displayImages[0]?.fileName || 'None'}</p>
      </div>
      
      {/* Main featured image */}
      <div className="relative rounded-xl overflow-hidden bg-muted group">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <img
            src={currentImageUrl}
            alt={`Property view ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => handleImageError(displayImages[currentIndex].id, e)}
            onLoad={() => console.log(`[PropertyGallery] Successfully loaded image index ${currentIndex}`)}
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
          {displayImages.map((image, index) => {
            const thumbUrl = image.id 
              ? imageUrls[image.id] || getImageSource(image) 
              : getImageSource(image);
              
            return (
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
                  src={thumbUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(image.id, e)}
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
                src={displayImages[fullscreenIndex].id 
                  ? imageUrls[displayImages[fullscreenIndex].id] || getImageSource(displayImages[fullscreenIndex]) 
                  : getImageSource(displayImages[fullscreenIndex])}
                alt={`Property view ${fullscreenIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onError={(e) => handleImageError(displayImages[fullscreenIndex].id, e)}
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
                    {displayImages.map((image, index) => {
                      const thumbUrl = image.id 
                        ? imageUrls[image.id] || getImageSource(image) 
                        : getImageSource(image);
                        
                      return (
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
                            src={thumbUrl}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => handleImageError(image.id, e)}
                          />
                        </button>
                      );
                    })}
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