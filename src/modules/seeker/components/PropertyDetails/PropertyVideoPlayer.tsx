// src/modules/seeker/components/PropertyDetails/PropertyVideoPlayer.tsx
// Version: 1.0.0
// Last Modified: 27-05-2025 10:35 IST
// Purpose: Video player component for property videos

import React, { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PropertyVideo } from '../../hooks/usePropertyDetails';

interface PropertyVideoPlayerProps {
  video: PropertyVideo;
  autoPlay?: boolean;
  showControls?: boolean;
  className?: string;
}

const PropertyVideoPlayer: React.FC<PropertyVideoPlayerProps> = ({
  video,
  autoPlay = false,
  showControls = true,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCustomControls, setShowCustomControls] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;

    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoaded(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!video || !video.url) {
    return (
      <div className={cn(
        "aspect-video bg-gray-100 flex items-center justify-center rounded-lg",
        className
      )}>
        <p className="text-gray-500">Video not available</p>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative group rounded-lg overflow-hidden bg-black",
        className
      )}
      onMouseEnter={() => setShowCustomControls(true)}
      onMouseLeave={() => setShowCustomControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full aspect-video object-contain"
        src={video.url}
        poster={video.thumbnailUrl}
        autoPlay={autoPlay}
        muted={autoPlay} // Auto-play requires muted
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={(e) => {
          console.error('Video playback error:', e);
        }}
        controls={!showControls} // Use native controls if custom controls are disabled
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom Controls Overlay */}
      {showControls && (
        <div 
          className={cn(
            "absolute inset-0 flex flex-col justify-between p-4 transition-opacity",
            showCustomControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Top overlay with title */}
          <div className="flex justify-between items-start">
            <div className="bg-black/60 backdrop-blur-sm rounded px-3 py-1">
              <p className="text-white text-sm font-medium">Property Video</p>
              {video.fileName && (
                <p className="text-white/70 text-xs">{video.fileName}</p>
              )}
            </div>
          </div>

          {/* Center play button */}
          <div className="flex items-center justify-center">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20 w-16 h-16"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="space-y-2">
            {/* Progress bar */}
            {isLoaded && (
              <div className="flex items-center space-x-2">
                <span className="text-white text-xs font-mono min-w-[40px]">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercentage}%, #ffffff50 ${progressPercentage}%, #ffffff50 100%)`
                    }}
                  />
                </div>
                <span className="text-white text-xs font-mono min-w-[40px]">
                  {formatTime(duration)}
                </span>
              </div>
            )}

            {/* Control buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20 w-8 h-8"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20 w-8 h-8"
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full bg-black/40 text-white hover:bg-black/60 border-white/20 w-8 h-8"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-8 w-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default PropertyVideoPlayer;