// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 6.4.0
// Last Modified: 14-05-2025 11:00 IST
// Purpose: Implemented direct blob URL support and fixed image loading issues

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PropertyImage } from '../../hooks/usePropertyDetails';
import { supabase } from '@/lib/supabase';

// Constants
const STORAGE_BUCKET = 'property-images-v2';
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
  const [displayImages, setDisplayImages] = useState<PropertyImage[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingImage, setLoadingImage] = useState(true);
  const loadAttempts = useRef<Record<string, number>>({});
  
  // Create alternative URL formats when original URLs fail
  const createAlternativeUrl = (url: string): string => {
    if (!url) return FALLBACK_IMAGE;
    
    try {
      // Special handling for blob URLs
      if (url.startsWith('blob:')) return url;
      if (url.startsWith('data:')) return url;
      
      // Use a direct HTTPS link to the object store
      if (url.includes('supabase.co/storage/v1/object')) {
        // Add cache busting to prevent stale images
        const cacheBuster = `?t=${Date.now()}`;
        return `${url}${cacheBuster}`;
      }
      
      // Return placeholder for any other URL
      return FALLBACK_IMAGE;
    } catch (error) {
      return FALLBACK_IMAGE;
    }
  };
  
  // Generate a signed URL to avoid CORS issues (fallback method)
  const getSignedUrl = async (fileName: string): Promise<string> => {
    if (!propertyId || !fileName) return FALLBACK_IMAGE;
    
    // Skip signed URL generation for legacy formats
    if (fileName.startsWith('legacy-') || fileName.startsWith('img-')) {
      return FALLBACK_IMAGE;
    }
    
    try {
      // Generate a signed URL that expires in 1 hour (3600 seconds)
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(`${propertyId}/${fileName}`, 3600);
        
      if (error) {
        console.error(`Error generating signed URL: ${error.message}`);
        return FALLBACK_IMAGE;
      }
      
      return data.signedUrl;
    } catch (err) {
      console.error(`Error:`, err);
      return FALLBACK_IMAGE;
    }
  };
  
  // Load all image URLs with priority for blob URLs
  const loadImageUrls = async () => {
    if (!displayImages || displayImages.length === 0) return;
    
    const newUrls: Record<string, string> = {};
    
    // Process each image and select the best URL
    displayImages.forEach((image, index) => {
      if (!image.id) return;
      
      // Priority 1: Use direct URLs if available (blob URLs)
      if (directUrls && directUrls.length > index) {
        newUrls[image.id] = directUrls[index];
        return;
      }
      
      // Priority 2: Use dataUrl if available
      if (image.dataUrl) {
        newUrls[image.id] = image.dataUrl;
        return;
      }
      
      // Priority 3: Use URL if available
      if (image.url) {
        newUrls[image.id] = createAlternativeUrl(image.url);
        return;
      }
      
      // Fallback
      newUrls[image.id] = FALLBACK_IMAGE;
    });
    
    setImageUrls(newUrls);
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
      return createAlternativeUrl(image.url);
    }
    
    // Fallback to placeholder
    return FALLBACK_IMAGE;
  };
  
  // Process images when they change
  useEffect(() => {
    if (!images || images.length === 0) {
      setDisplayImages([{
        id: 'placeholder',
        url: FALLBACK_IMAGE,
        is_primary: true,
        display_order: 0
      }]);
      return;
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
    
    if (validImages.length === 0) {
      setDisplayImages([{
        id: 'placeholder',
        url: FALLBACK_IMAGE,
        is_primary: true,
        display_order: 0
      }]);
      return;
    }
    
    // Reset image errors when images change
    setImageErrors({});
    loadAttempts.current = {};
    
    // Sort images: primary first, then by display order
    const sortedImages = [...validImages].sort((a, b) => {
      if ((a.is_primary || a.isPrimary) && !(b.is_primary || b.isPrimary)) return -1;
      if (!(a.is_primary || a.isPrimary) && (b.is_primary || b.isPrimary)) return 1;
      return (a.display_order || 0) - (b.display_order || 0);
    });

    setDisplayImages(sortedImages);
    setCurrentIndex(0); // Reset to first image when images change
    setLoadingImage(true);
  }, [images, propertyId]);
  
  // Load all image URLs when displayImages changes
  useEffect(() => {
    loadImageUrls();
  }, [displayImages, propertyId, directUrls]);
  
  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // We don't need to revoke the blob URLs here
      // since they're managed in PropertyDetailPage
    };
  }, []);
  
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
    setLoadingImage(true);
  };

  const goToPrevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? displayImages.length - 1 : prevIndex - 1
    );
    setLoadingImage(true);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setLoadingImage(true);
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
  
  // Handle image load errors with fallbacks
  const handleImageError = (imageId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    // Get current attempts for this image
    const attempts = loadAttempts.current[imageId] || 0;
    loadAttempts.current[imageId] = attempts + 1;
    
    // Stop after 2 attempts to prevent infinite loops
    if (attempts >= 2) {
      e.currentTarget.src = FALLBACK_IMAGE;
      setLoadingImage(false);
      
      // Mark this image as permanently failed
      setImageErrors(prev => ({ ...prev, [imageId]: true }));
      return;
    }
    
    // Try alternative approaches before giving up
    if (directUrls && directUrls.length > 0) {
      // Try direct blob URL
      const imageIndex = displayImages.findIndex(img => img.id === imageId);
      if (imageIndex >= 0 && imageIndex < directUrls.length) {
        e.currentTarget.src = directUrls[imageIndex];
        return;
      }
    }
    
    // Fall back to placeholder if all else fails
    e.currentTarget.src = FALLBACK_IMAGE;
    setLoadingImage(false);
  };
  
  // Get the URL for current image
  const currentImageUrl = displayImages[currentIndex].id
    ? imageUrls[displayImages[currentIndex].id] || getImageSource(displayImages[currentIndex])
    : getImageSource(displayImages[currentIndex]);
  
  return (
    <div className="space-y-2">
      {/* Main featured image */}
      <div className="relative rounded-xl overflow-hidden bg-muted group">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          {loadingImage && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={currentImageUrl}
            alt={`Property view ${currentIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => handleImageError(displayImages[currentIndex].id, e)}
            onLoad={() => setLoadingImage(false)}
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