// src/modules/seeker/components/PropertyDetails/PropertyActionButtons.tsx
// Version: 1.0.0
// Last Modified: 08-04-2025 15:20 IST
// Purpose: Quick action buttons component

import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Share2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyActionButtonsProps {
  isLiked: boolean;
  onToggleLike: () => Promise<{ success: boolean; message?: string }>;
  onShare: () => void;
  onScheduleVisit: () => void;
}

const PropertyActionButtons: React.FC<PropertyActionButtonsProps> = ({
  isLiked,
  onToggleLike,
  onShare,
  onScheduleVisit
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <Button 
        variant={isLiked ? "default" : "outline"} 
        size="sm" 
        className="flex-1 sm:flex-none"
        onClick={() => onToggleLike()}
      >
        <Heart className={cn(
          "h-4 w-4 mr-2",
          isLiked ? "fill-white" : "fill-none"
        )} />
        {isLiked ? "Saved" : "Save"}
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="flex-1 sm:flex-none"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="flex-1 sm:flex-none"
        onClick={onScheduleVisit}
      >
        <Calendar className="h-4 w-4 mr-2" />
        Schedule Visit
      </Button>
    </div>
  );
};

export default PropertyActionButtons;