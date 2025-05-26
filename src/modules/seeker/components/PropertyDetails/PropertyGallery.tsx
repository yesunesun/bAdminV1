// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 10.0.0
// Last Modified: 27-05-2025 16:30 IST
// Purpose: Enhanced control visibility with better contrast and background styling

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon, XIcon, Play, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { PropertyImage, PropertyVideo } from '../../hooks/usePropertyDetails';

const FALLBACK_IMAGE = '/noimage.png';

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url?: string;
  dataUrl?: string;
  fileName?: string;
  is_primary?: boolean;
  isPrimary?: boolean;
  display_order?: number;
  thumbnailUrl?: string; // For videos
  fileSize?: number; // For videos
}

interface PropertyGalleryProps {
  images: PropertyImage[];
  video?: PropertyVideo | null;
  propertyId?: string;
  directUrls?: string[];
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ 
  images, 
  video,
  propertyId,
  directUrls 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('[PropertyGallery] Props received:', {
      imagesCount: images?.length || 0,
      hasVideo: !!video,
      videoUrl: video?.url,
      propertyId,
      images: images
    });
    
    // Log first few images for debugging
    if (images && images.length > 0) {
      console.log('[PropertyGallery] First image details:', {
        id: images[0].id,
        url: images[0].url,
        dataUrl: images[0].dataUrl ? images[0].dataUrl.substring(0, 50) + '...' : 'none',
        fileName: images[0].fileName,
        isPrimary: images[0].isPrimary
      });
    }
  }, [images, video, propertyId]);

  // Combine images and video into a single media array
  const mediaItems = useMemo((): MediaItem[] => {
    const allItems: MediaItem[] = [];

    console.log('[PropertyGallery] Building media items...');

    // Add images first
    if (images && images.length > 0) {
      console.log('[PropertyGallery] Processing', images.length, 'images');
      
      const processedImages = [...images]
        .filter(img => img && (img.url || img.dataUrl || img.fileName))
        .sort((a, b) => {
          if ((a.is_primary || a.isPrimary) && !(b.is_primary || b.isPrimary)) return -1;
          if (!(a.is_primary || a.isPrimary) && (b.is_primary || b.isPrimary)) return 1;
          return (a.display_order || 0) - (b.display_order || 0);
        })
        .map((img, index): MediaItem => ({
          id: img.id || `img-${index}`,
          type: 'image',
          url: img.url,
          dataUrl: img.dataUrl,
          fileName: img.fileName,
          is_primary: img.is_primary,
          isPrimary: img.isPrimary,
          display_order: img.display_order || index
        }));

      allItems.push(...processedImages);
      console.log('[PropertyGallery] Added', processedImages.length, 'processed images');
    }

    // Add video at the end
    if (video && video.url) {
      console.log('[PropertyGallery] Adding video:', video.fileName);
      allItems.push({
        id: 'property-video',
        type: 'video',
        url: video.url,
        fileName: video.fileName,
        thumbnailUrl: video.thumbnailUrl,
        fileSize: video.fileSize,
        display_order: 999 // Place video after images
      });
    }

    // If no media at all, show placeholder
    if (allItems.length === 0) {
      console.log('[PropertyGallery] No media found, showing placeholder');
      allItems.push({
        id: 'placeholder',
        type: 'image',
        url: FALLBACK_IMAGE,
        is_primary: true,
        display_order: 0
      });
    }

    console.log('[PropertyGallery] Final media items:', allItems.length, 'items');
    return allItems;
  }, [images, video]);

  // Simple media URL resolver
  const getMediaSource = useCallback((item: MediaItem): string => {
    if (item.type === 'video') {
      // For video thumbnails, prefer thumbnailUrl, fallback to a video placeholder
      return item.thumbnailUrl || item.url || FALLBACK_IMAGE;
    }

    // For images, use the same logic as before
    const imageIndex = mediaItems.findIndex(media => media.id === item.id && media.type === 'image');
    if (directUrls && directUrls.length > imageIndex && imageIndex >= 0) {
      return directUrls[imageIndex];
    }

    if (item.dataUrl) {
      return item.dataUrl;
    }

    if (item.url) {
      return item.url;
    }

    return FALLBACK_IMAGE;
  }, [mediaItems, directUrls]);

  // Handle media load events
  const handleMediaLoad = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({ ...prev, [mediaId]: false }));
  }, []);

  // Handle media error events
  const handleMediaError = useCallback((mediaId: string, e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    console.warn(`Media load failed for ${mediaId}`);
    if ('src' in e.currentTarget) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
    setLoadingStates(prev => ({ ...prev, [mediaId]: false }));
  }, []);

  // Video play/pause handler
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const currentItem = mediaItems[currentIndex];
    
    if (currentItem.type === 'video' && videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
        setVideoPlaying(false);
      } else {
        videoRef.current.play();
        setVideoPlaying(true);
      }
    }
  }, [currentIndex, mediaItems, videoPlaying]);

  // Navigation functions
  const goToNextSlide = useCallback(() => {
    setCurrentIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1);
    setVideoPlaying(false); // Pause video when navigating
  }, [mediaItems.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1);
    setVideoPlaying(false); // Pause video when navigating
  }, [mediaItems.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
    setVideoPlaying(false); // Pause video when navigating
  }, []);

  // Show placeholder if no valid media
  if (!mediaItems || mediaItems.length === 0) {
    return (
      <div className="w-full aspect-[16/9] bg-muted/60 flex flex-col items-center justify-center rounded-xl border border-border">
        <ImageIcon className="h-16 w-16 text-muted-foreground mb-3 opacity-50" />
        <p className="text-muted-foreground font-medium">No media available</p>
      </div>
    );
  }

  const currentItem = mediaItems[currentIndex];
  const currentMediaUrl = getMediaSource(currentItem);
  const isCurrentMediaLoading = loadingStates[currentItem.id] ?? false;

  return (
    <div className="space-y-2">
      {/* Main featured media */}
      <div className="relative rounded-xl overflow-hidden bg-muted group">
        <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          {/* Loading indicator */}
          {isCurrentMediaLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Render media based on type */}
          {currentItem.type === 'video' ? (
            <div className="relative w-full h-full cursor-pointer" onClick={handleVideoClick}>
              {/* Video element for actual playback */}
              <video
                ref={videoRef}
                src={currentItem.url}
                className="w-full h-full object-cover"
                onLoadedData={() => handleMediaLoad(currentItem.id)}
                onError={(e) => handleMediaError(currentItem.id, e)}
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={() => setVideoPlaying(false)}
                playsInline
                poster={currentItem.thumbnailUrl}
              />
              
              {/* Video overlay with play button */}
              {!videoPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-black/70 backdrop-blur-md rounded-full p-4 hover:bg-black/80 transition-all duration-200 shadow-2xl border border-white/20">
                    <Play className="h-8 w-8 text-white fill-white drop-shadow-lg" />
                  </div>
                </div>
              )}
              
              {/* Video controls overlay */}
              {videoPlaying && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/20 flex items-center justify-center">
                  <div className="bg-black/70 backdrop-blur-md rounded-full p-3 shadow-xl border border-white/20">
                    <svg className="h-6 w-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  </div>
                </div>
              )}
              
              {/* Video indicator badge */}
              <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-md flex items-center shadow-lg border border-white/10">
                <Video className="h-3 w-3 mr-1.5" />
                <span className="font-medium">Video</span>
              </div>
            </div>
          ) : (
            <img
              src={currentMediaUrl}
              alt={`Property view ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={(e) => handleMediaError(currentItem.id, e)}
              onLoad={() => handleMediaLoad(currentItem.id)}
              loading="eager"
            />
          )}
        </div>
        
        {/* Navigation and controls - only show if multiple items */}
        {mediaItems.length > 1 && (
          <>
            {/* Navigation arrows with enhanced visibility - always visible */}
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-black/80 text-white hover:bg-black/90 border-2 border-white/30 pointer-events-auto shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevSlide();
                }}
              >
                <ChevronLeftIcon className="h-6 w-6 drop-shadow-lg" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-black/80 text-white hover:bg-black/90 border-2 border-white/30 pointer-events-auto shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextSlide();
                }}
              >
                <ChevronRightIcon className="h-6 w-6 drop-shadow-lg" />
              </Button>
            </div>
            
            {/* Media counter with enhanced visibility - always visible */}
            <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-md shadow-lg border border-white/20 opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="font-medium">{currentIndex + 1} / {mediaItems.length}</span>
            </div>
          </>
        )}
        
        {/* Fullscreen button with enhanced visibility - always visible */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-4 right-4 rounded-full bg-black/80 text-white hover:bg-black/90 border-2 border-white/30 opacity-70 group-hover:opacity-100 transition-all duration-200 shadow-2xl backdrop-blur-md hover:scale-110"
          onClick={() => {
            setFullscreenIndex(currentIndex);
            setFullscreenOpen(true);
          }}
        >
          <ExpandIcon className="h-5 w-5 drop-shadow-lg" />
        </Button>
      </div>
      
      {/* Thumbnail navigation - always show if multiple items */}
      {mediaItems.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-1 px-1">
          {mediaItems.map((item, index) => {
            const thumbUrl = getMediaSource(item);
            
            return (
              <button
                key={item.id}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 rounded-md overflow-hidden transition-all relative ${
                  index === currentIndex 
                    ? 'ring-3 ring-primary w-20 h-20 opacity-100' 
                    : 'opacity-70 hover:opacity-100 w-16 h-16 hover:w-20 hover:h-20'
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => handleMediaError(item.id, e)}
                  loading="lazy"
                />
                {/* Video indicator on thumbnail with enhanced visibility */}
                {item.type === 'video' && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-black/70 backdrop-blur-sm rounded-full p-1.5 border border-white/30">
                      <Play className="h-3 w-3 text-white fill-white" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
      
      {/* Fullscreen gallery dialog */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 bg-black border-none overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Property Gallery - Image {fullscreenIndex + 1} of {mediaItems.length}</DialogTitle>
          </VisuallyHidden>
          <div className="relative w-full h-full flex flex-col">
            {/* Close button with enhanced visibility */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 z-20 rounded-full bg-black/80 text-white hover:bg-black/90 border-2 border-white/30 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110"
              onClick={() => setFullscreenOpen(false)}
            >
              <XIcon className="h-5 w-5 drop-shadow-lg" />
            </Button>
            
            {/* Main media container - 80% of dialog size with proper containment */}
            <div className="flex-1 flex items-center justify-center p-8">
              {mediaItems[fullscreenIndex]?.type === 'video' ? (
                <div 
                  className="flex items-center justify-center"
                  style={{ 
                    width: '80%', 
                    height: '80%',
                    maxWidth: '80%',
                    maxHeight: '80%'
                  }}
                >
                  <video
                    src={mediaItems[fullscreenIndex].url}
                    className="w-full h-full object-contain bg-black"
                    controls
                    autoPlay={false}
                    poster={mediaItems[fullscreenIndex].thumbnailUrl}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : (
                <img
                  src={getMediaSource(mediaItems[fullscreenIndex])}
                  alt={`Property view ${fullscreenIndex + 1}`}
                  className="object-contain"
                  onError={(e) => handleMediaError(mediaItems[fullscreenIndex].id, e)}
                  style={{ 
                    width: '80%',
                    height: '80%',
                    maxWidth: '80%',
                    maxHeight: '80%',
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>
            
            {/* Navigation controls for fullscreen with enhanced visibility */}
            {mediaItems.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between p-8 pointer-events-none">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/80 text-white hover:bg-black/90 border-2 border-white/30 pointer-events-auto shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110"
                    onClick={() => setFullscreenIndex(prev => prev === 0 ? mediaItems.length - 1 : prev - 1)}
                  >
                    <ChevronLeftIcon className="h-6 w-6 drop-shadow-lg" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full bg-black/80 text-white hover:bg-black/90 border-2 border-white/30 pointer-events-auto shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-110"
                    onClick={() => setFullscreenIndex(prev => prev === mediaItems.length - 1 ? 0 : prev + 1)}
                  >
                    <ChevronRightIcon className="h-6 w-6 drop-shadow-lg" />
                  </Button>
                </div>
                
                {/* Media counter with enhanced visibility */}
                <div className="absolute bottom-6 left-6 bg-black/80 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-md shadow-lg border border-white/20">
                  <span className="font-medium">{fullscreenIndex + 1} / {mediaItems.length}</span>
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