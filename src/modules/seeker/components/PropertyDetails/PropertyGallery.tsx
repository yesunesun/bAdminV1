// src/modules/seeker/components/PropertyDetails/PropertyGallery.tsx
// Version: 13.0.0
// Last Modified: 30-05-2025 15:45 IST
// Purpose: FIXED video audio controls and autoplay policy compliance

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ImageIcon, ExpandIcon, XIcon, Play, Video, Volume2, VolumeX, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { supabase } from '@/lib/supabase';
import { PropertyImage, PropertyVideo } from '../../hooks/usePropertyDetails';

const FALLBACK_IMAGE = '/noimage.png';

// Smart Media Cache Service - FIXED video bucket naming
class MediaCacheService {
  private static instance: MediaCacheService;
  private urlCache = new Map<string, string>();
  private readonly IMAGE_BUCKET = 'property-images-v2';
  private readonly VIDEO_BUCKET = 'property-videos-v2'; // FIXED: Match upload hook bucket name
  private readonly FALLBACK_VIDEO_BUCKET = 'property-images-v2'; // Fallback for videos stored in image bucket
  
  static getInstance(): MediaCacheService {
    if (!MediaCacheService.instance) {
      MediaCacheService.instance = new MediaCacheService();
    }
    return MediaCacheService.instance;
  }
  
  // ENHANCED: Get direct public URL with fallback support
  getPublicMediaUrl(propertyId: string, fileName: string, mediaType: 'image' | 'video' = 'image'): string {
    if (!propertyId || !fileName) return FALLBACK_IMAGE;
    
    // Handle legacy formats
    if (fileName.startsWith('data:image/') || fileName.startsWith('blob:') || fileName.startsWith('http')) {
      return fileName;
    }
    if (fileName.startsWith('legacy-') || fileName.startsWith('img-')) {
      return FALLBACK_IMAGE;
    }
    
    const cacheKey = `${mediaType}-${propertyId}/${fileName}`;
    
    // Check cache first
    if (this.urlCache.has(cacheKey)) {
      return this.urlCache.get(cacheKey)!;
    }
    
    // Build direct public URL with fallback for videos
    let publicUrl: string;
    
    if (mediaType === 'video') {
      // Try primary video bucket first
      const primaryBucket = this.VIDEO_BUCKET;
      const { data: primaryData } = supabase.storage.from(primaryBucket).getPublicUrl(`${propertyId}/${fileName}`);
      publicUrl = primaryData.publicUrl;
      
      // Cache the URL for both primary and fallback
      this.urlCache.set(cacheKey, publicUrl);
      this.urlCache.set(`${mediaType}-fallback-${propertyId}/${fileName}`, 
        supabase.storage.from(this.FALLBACK_VIDEO_BUCKET).getPublicUrl(`${propertyId}/${fileName}`).data.publicUrl
      );
    } else {
      const { data } = supabase.storage.from(this.IMAGE_BUCKET).getPublicUrl(`${propertyId}/${fileName}`);
      publicUrl = data.publicUrl;
      this.urlCache.set(cacheKey, publicUrl);
    }
    
    return publicUrl;
  }
  
  // NEW: Get video URL with automatic fallback
  getVideoUrl(propertyId: string, fileName: string): string {
    if (!propertyId || !fileName) return '';
    
    // Check if it's already a full URL
    if (fileName.startsWith('http') || fileName.startsWith('blob:')) {
      return fileName;
    }
    
    const primaryKey = `video-${propertyId}/${fileName}`;
    const fallbackKey = `video-fallback-${propertyId}/${fileName}`;
    
    // Return primary URL first, fallback will be tried if primary fails
    if (this.urlCache.has(primaryKey)) {
      return this.urlCache.get(primaryKey)!;
    }
    
    // Generate both URLs
    const primaryUrl = this.getPublicMediaUrl(propertyId, fileName, 'video');
    return primaryUrl;
  }
  
  // NEW: Get fallback video URL
  getFallbackVideoUrl(propertyId: string, fileName: string): string {
    const fallbackKey = `video-fallback-${propertyId}/${fileName}`;
    
    if (this.urlCache.has(fallbackKey)) {
      return this.urlCache.get(fallbackKey)!;
    }
    
    const { data } = supabase.storage.from(this.FALLBACK_VIDEO_BUCKET).getPublicUrl(`${propertyId}/${fileName}`);
    const fallbackUrl = data.publicUrl;
    this.urlCache.set(fallbackKey, fallbackUrl);
    
    return fallbackUrl;
  }
  
  // Preload media URLs in batch
  preloadMediaUrls(items: Array<{ propertyId: string; fileName: string; type: 'image' | 'video' }>): void {
    items.forEach(item => {
      this.getPublicMediaUrl(item.propertyId, item.fileName, item.type);
    });
  }
  
  // Clear cache if needed
  clearCache(): void {
    this.urlCache.clear();
  }
  
  // Get cache stats for debugging
  getCacheStats() {
    return {
      size: this.urlCache.size,
      keys: Array.from(this.urlCache.keys())
    };
  }
}

// Get singleton instance
const mediaCache = MediaCacheService.getInstance();

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
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoError, setVideoError] = useState<Record<string, boolean>>({});
  
  // FIXED: Audio control states
  const [videoMuted, setVideoMuted] = useState(true); // Start muted to comply with autoplay policies
  const [videoVolume, setVideoVolume] = useState(1);
  const [userInteracted, setUserInteracted] = useState(false); // Track if user has interacted
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('[PropertyGallery] Props received:', {
      imagesCount: images?.length || 0,
      hasVideo: !!video,
      videoUrl: video?.url,
      videoFileName: video?.fileName,
      propertyId,
      cacheStats: mediaCache.getCacheStats()
    });
  }, [images, video, propertyId]);

  // Combine images and video into a single media array with optimized URLs
  const mediaItems = useMemo((): MediaItem[] => {
    const allItems: MediaItem[] = [];

    console.log('[PropertyGallery] Building optimized media items...');

    // Add images first
    if (images && images.length > 0) {
      console.log('[PropertyGallery] Processing', images.length, 'images with optimization');
      
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
      
      // Preload image URLs in cache
      if (propertyId) {
        const preloadItems = processedImages
          .filter(img => img.fileName && !img.fileName.startsWith('data:') && !img.fileName.startsWith('blob:'))
          .map(img => ({
            propertyId,
            fileName: img.fileName!,
            type: 'image' as const
          }));
        
        if (preloadItems.length > 0) {
          mediaCache.preloadMediaUrls(preloadItems);
          console.log('[PropertyGallery] Preloaded', preloadItems.length, 'image URLs in cache');
        }
      }
    }

    // Add video at the end - ENHANCED with better validation
    if (video && (video.url || video.fileName)) {
      console.log('[PropertyGallery] Adding video:', {
        fileName: video.fileName,
        url: video.url ? video.url.substring(0, 50) + '...' : 'No URL',
        thumbnailUrl: video.thumbnailUrl ? 'Has thumbnail' : 'No thumbnail'
      });
      
      allItems.push({
        id: 'property-video',
        type: 'video',
        url: video.url,
        fileName: video.fileName,
        thumbnailUrl: video.thumbnailUrl,
        fileSize: video.fileSize,
        display_order: 999 // Place video after images
      });
      
      // Preload video URL in cache if it has fileName
      if (propertyId && video.fileName && !video.url?.startsWith('data:') && !video.url?.startsWith('blob:')) {
        mediaCache.preloadMediaUrls([{
          propertyId,
          fileName: video.fileName,
          type: 'video'
        }]);
        console.log('[PropertyGallery] Preloaded video URL in cache');
      }
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

    console.log('[PropertyGallery] Final optimized media items:', allItems.length, 'items');
    return allItems;
  }, [images, video, propertyId]);

  // Optimized media URL resolver using cached public URLs
  const getOptimizedMediaSource = useCallback((item: MediaItem): string => {
    // Handle video thumbnails
    if (item.type === 'video') {
      // For video thumbnails, prefer thumbnailUrl first
      if (item.thumbnailUrl) {
        return item.thumbnailUrl;
      }
      
      // If we have fileName and propertyId, use cached public URL for thumbnail
      if (propertyId && item.fileName && !item.url?.startsWith('data:') && !item.url?.startsWith('blob:')) {
        return mediaCache.getPublicMediaUrl(propertyId, item.fileName, 'video');
      }
      
      // Fallback to original URL or placeholder
      return item.url || FALLBACK_IMAGE;
    }

    // For images, use directUrls if available (legacy support)
    const imageIndex = mediaItems.findIndex(media => media.id === item.id && media.type === 'image');
    if (directUrls && directUrls.length > imageIndex && imageIndex >= 0) {
      return directUrls[imageIndex];
    }

    // Handle dataUrl format (legacy)
    if (item.dataUrl && (item.dataUrl.startsWith('data:image/') || item.dataUrl.startsWith('blob:'))) {
      return item.dataUrl;
    }

    // Use cached public URL if we have fileName and propertyId
    if (propertyId && item.fileName && !item.fileName.startsWith('legacy-') && !item.fileName.startsWith('img-')) {
      return mediaCache.getPublicMediaUrl(propertyId, item.fileName, 'image');
    }

    // Fallback to original URL
    if (item.url) {
      return item.url;
    }

    return FALLBACK_IMAGE;
  }, [mediaItems, directUrls, propertyId]);

  // ENHANCED: Get video source URL with fallback handling
  const getVideoSource = useCallback((item: MediaItem): string => {
    if (item.type !== 'video') return '';
    
    // If we already have a complete video URL, use it
    if (item.url && (item.url.startsWith('http') || item.url.startsWith('blob:'))) {
      console.log('[PropertyGallery] Using direct video URL:', item.url.substring(0, 50) + '...');
      return item.url;
    }
    
    // If we have fileName and propertyId, build the URL
    if (propertyId && item.fileName && !item.url?.startsWith('data:')) {
      const videoUrl = mediaCache.getVideoUrl(propertyId, item.fileName);
      console.log('[PropertyGallery] Generated video URL:', videoUrl.substring(0, 50) + '...');
      return videoUrl;
    }
    
    // Last resort: return whatever URL we have
    console.log('[PropertyGallery] Using fallback video URL:', item.url || 'No URL');
    return item.url || '';
  }, [propertyId]);

  // NEW: Get fallback video source for error recovery
  const getFallbackVideoSource = useCallback((item: MediaItem): string => {
    if (item.type !== 'video' || !propertyId || !item.fileName) return '';
    
    return mediaCache.getFallbackVideoUrl(propertyId, item.fileName);
  }, [propertyId]);

  // Handle media load events
  const handleMediaLoad = useCallback((mediaId: string) => {
    setLoadingStates(prev => ({ ...prev, [mediaId]: false }));
  }, []);

  // ENHANCED: Handle media error events with video fallback
  const handleMediaError = useCallback((mediaId: string, e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    console.warn(`Media load failed for ${mediaId}`);
    
    // For video elements, try fallback bucket
    if (e.currentTarget.tagName === 'VIDEO') {
      const currentItem = mediaItems.find(item => item.id === mediaId);
      if (currentItem && !videoError[mediaId] && propertyId && currentItem.fileName) {
        console.log('[PropertyGallery] Trying video fallback bucket...');
        const fallbackUrl = getFallbackVideoSource(currentItem);
        if (fallbackUrl && fallbackUrl !== e.currentTarget.src) {
          setVideoError(prev => ({ ...prev, [mediaId]: true }));
          (e.currentTarget as HTMLVideoElement).src = fallbackUrl;
          return;
        }
      }
    }
    
    // For images or if video fallback also fails
    if ('src' in e.currentTarget) {
      e.currentTarget.src = FALLBACK_IMAGE;
    }
    setLoadingStates(prev => ({ ...prev, [mediaId]: false }));
  }, [mediaItems, videoError, propertyId, getFallbackVideoSource]);

  // FIXED: Video play/pause handler with proper audio controls
  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const currentItem = mediaItems[currentIndex];
    
    if (currentItem.type === 'video' && videoRef.current) {
      setUserInteracted(true); // Track user interaction
      
      try {
        if (videoPlaying) {
          videoRef.current.pause();
          setVideoPlaying(false);
        } else {
          // Unmute on first user interaction if user wants audio
          if (!userInteracted && videoMuted) {
            setVideoMuted(false);
            videoRef.current.muted = false;
          }
          
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setVideoPlaying(true);
              })
              .catch((error) => {
                console.error('[PropertyGallery] Video play failed:', error);
                setVideoPlaying(false);
                // If autoplay fails, try with muted
                if (!videoMuted) {
                  console.log('[PropertyGallery] Retrying with muted audio...');
                  setVideoMuted(true);
                  videoRef.current!.muted = true;
                  videoRef.current!.play().catch(console.error);
                }
              });
          } else {
            setVideoPlaying(true);
          }
        }
      } catch (error) {
        console.error('[PropertyGallery] Video control error:', error);
      }
    }
  }, [currentIndex, mediaItems, videoPlaying, videoMuted, userInteracted]);

  // FIXED: Video mute/unmute handler
  const handleVideoMuteToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (videoRef.current) {
      const newMutedState = !videoMuted;
      setVideoMuted(newMutedState);
      videoRef.current.muted = newMutedState;
      setUserInteracted(true);
      
      console.log('[PropertyGallery] Video mute toggled:', newMutedState ? 'muted' : 'unmuted');
    }
  }, [videoMuted]);

  // FIXED: Video volume handler
  const handleVideoVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    
    const newVolume = parseFloat(e.target.value);
    setVideoVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      
      // Automatically unmute if volume is increased from 0
      if (newVolume > 0 && videoMuted) {
        setVideoMuted(false);
        videoRef.current.muted = false;
      }
      
      setUserInteracted(true);
    }
  }, [videoMuted]);

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

  // ENHANCED: Handle video events
  const handleVideoPlay = useCallback(() => {
    setVideoPlaying(true);
  }, []);

  const handleVideoPause = useCallback(() => {
    setVideoPlaying(false);
  }, []);

  const handleVideoEnded = useCallback(() => {
    setVideoPlaying(false);
  }, []);

  // FIXED: Sync video mute state when video loads
  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = videoMuted;
      videoRef.current.volume = videoVolume;
    }
  }, [videoMuted, videoVolume]);

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
  const currentMediaUrl = getOptimizedMediaSource(currentItem);
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
              {/* FIXED: Video element with proper audio controls */}
              <video
                ref={videoRef}
                src={getVideoSource(currentItem)}
                className="w-full h-full object-cover"
                onLoadedData={() => handleMediaLoad(currentItem.id)}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onError={(e) => handleMediaError(currentItem.id, e)}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoEnded}
                playsInline
                poster={currentMediaUrl}
                preload="metadata"
                muted={videoMuted} // Use state-controlled mute
                controls={false} // We handle controls manually
              />
              
              {/* Video overlay with play button */}
              {!videoPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="bg-black/70 backdrop-blur-md rounded-full p-4 hover:bg-black/80 transition-all duration-200 shadow-2xl border border-white/20">
                    <Play className="h-8 w-8 text-white fill-white drop-shadow-lg" />
                  </div>
                </div>
              )}
              
              {/* FIXED: Video controls overlay with audio controls */}
              {videoPlaying && (
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity bg-black/20 flex flex-col justify-between p-4">
                  {/* Top controls */}
                  <div className="flex justify-end">
                    {/* Audio controls */}
                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-lg px-3 py-2 border border-white/20">
                      <button
                        onClick={handleVideoMuteToggle}
                        className="text-white hover:text-white/80 transition-colors p-1"
                        title={videoMuted ? "Unmute" : "Mute"}
                      >
                        {videoMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </button>
                      
                      {!videoMuted && (
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={videoVolume}
                          onChange={handleVideoVolumeChange}
                          className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #ffffff ${videoVolume * 100}%, #ffffff50 ${videoVolume * 100}%)`
                          }}
                          title="Volume"
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Center pause button */}
                  <div className="flex items-center justify-center">
                    <div className="bg-black/70 backdrop-blur-md rounded-full p-3 shadow-xl border border-white/20">
                      <Pause className="h-6 w-6 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  
                  {/* Bottom spacer */}
                  <div></div>
                </div>
              )}
              
              {/* Video indicator badge */}
              <div className="absolute top-4 left-4 bg-black/80 text-white px-3 py-1.5 rounded-lg text-sm backdrop-blur-md flex items-center shadow-lg border border-white/10">
                <Video className="h-3 w-3 mr-1.5" />
                <span className="font-medium">Video</span>
                {!videoMuted && (
                  <Volume2 className="h-3 w-3 ml-1.5 text-green-400" />
                )}
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
            const thumbUrl = getOptimizedMediaSource(item);
            
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
      
      {/* Fullscreen gallery dialog - ENHANCED with better video support */}
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[95vh] p-0 bg-black border-none overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Property Gallery - Media {fullscreenIndex + 1} of {mediaItems.length}</DialogTitle>
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
                  {/* ENHANCED: Fullscreen video with proper controls and error handling */}
                  <video
                    ref={fullscreenVideoRef}
                    src={getVideoSource(mediaItems[fullscreenIndex])}
                    className="w-full h-full object-contain bg-black"
                    controls={true} // Enable native controls in fullscreen for better audio control
                    autoPlay={false}
                    poster={getOptimizedMediaSource(mediaItems[fullscreenIndex])}
                    preload="metadata"
                    onError={(e) => handleMediaError(mediaItems[fullscreenIndex].id, e)}
                    muted={false} // Allow unmuted playback in fullscreen
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : (
                <img
                  src={getOptimizedMediaSource(mediaItems[fullscreenIndex])}
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