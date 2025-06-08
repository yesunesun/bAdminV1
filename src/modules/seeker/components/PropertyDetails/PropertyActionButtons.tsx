// src/modules/seeker/components/PropertyDetails/PropertyActionButtons.tsx
// Version: 2.1.0
// Last Modified: 27-01-2025 12:15 IST
// Purpose: Fixed JSX style tag warning and improved animations

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Calendar, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyActionButtonsProps {
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean; message?: string }>;
  onShare: () => void;
  onScheduleVisit: () => void;
  className?: string;
}

const PropertyActionButtons: React.FC<PropertyActionButtonsProps> = ({
  isLiked,
  onToggleLike,
  onShare,
  onScheduleVisit,
  className
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [likeSuccess, setLikeSuccess] = useState(false);

  const handleLikeClick = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const result = await onToggleLike();
      if (result.success) {
        setLikeSuccess(true);
        setTimeout(() => setLikeSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className={cn(
      "flex flex-col sm:flex-row gap-3 w-full",
      className
    )}>
      {/* Save/Like Button */}
      <Button 
        variant={isLiked ? "default" : "outline"} 
        size="lg"
        className={cn(
          "flex-1 h-12 font-semibold text-base relative overflow-hidden group transition-transform hover:scale-105",
          isLiked 
            ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 border-0 shadow-lg" 
            : "border-2 hover:border-primary/50 hover:bg-primary/5",
          isLiking && "opacity-80 cursor-not-allowed"
        )}
        onClick={handleLikeClick}
        disabled={isLiking}
      >
        {/* Animated background for liked state */}
        {isLiked && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 animate-pulse" />
        )}
        
        <div className="flex items-center gap-2 relative z-10">
          {likeSuccess ? (
            <>
              <Check className="h-5 w-5 animate-bounce" />
              <span>Saved!</span>
            </>
          ) : isLiking ? (
            <>
              <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Heart className={cn(
                "h-5 w-5 transition-all duration-200",
                isLiked ? "fill-white scale-110" : "fill-none group-hover:scale-110"
              )} />
              <span>{isLiked ? "Saved" : "Save Property"}</span>
            </>
          )}
        </div>
        
        {/* Animated heart particles for liked state */}
        {isLiked && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Heart className="h-3 w-3 fill-white/30 animate-ping" />
            </div>
          </div>
        )}
      </Button>
      
      {/* Share Button */}
      <Button 
        variant="outline" 
        size="lg"
        className={cn(
          "flex-1 h-12 font-semibold text-base border-2 group transition-transform hover:scale-105",
          "hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
        )}
        onClick={onShare}
      >
        <Share2 className={cn(
          "h-5 w-5 mr-2 transition-transform duration-200",
          "group-hover:scale-110 group-hover:rotate-12"
        )} />
        <span className="hidden sm:inline">Share Property</span>
        <span className="sm:hidden">Share</span>
      </Button>
      
      {/* Schedule Visit Button */}
      <Button 
        variant="outline" 
        size="lg"
        className={cn(
          "flex-1 h-12 font-semibold text-base border-2 group transition-transform hover:scale-105",
          "hover:border-green-400 hover:bg-green-50 hover:text-green-700"
        )}
        onClick={onScheduleVisit}
      >
        <Calendar className={cn(
          "h-5 w-5 mr-2 transition-transform duration-200",
          "group-hover:scale-110"
        )} />
        <span className="hidden sm:inline">Schedule Visit</span>
        <span className="sm:hidden">Visit</span>
      </Button>
    </div>
  );
};

export default PropertyActionButtons;