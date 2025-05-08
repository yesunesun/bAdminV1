// src/modules/seeker/components/FavoriteButton.tsx
// Version: 2.2.0
// Last Modified: 10-05-2025 14:30 IST
// Purpose: Enhanced favorite button with improved state management and feedback

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  initialIsLiked: boolean;
  onToggle: (isLiked: boolean) => void;
  className?: string;
  isLoading?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  initialIsLiked, 
  onToggle,
  className = "",
  isLoading = false
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  
  // Update local state when props change (crucial for persistence)
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) return; // Prevent action if loading
    
    // Toggle state and notify parent
    const newLikedState = !isLiked;
    setIsLiked(newLikedState); // Optimistic update
    onToggle(newLikedState);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 ${
        isLiked ? 'hover:bg-pink-50' : 'hover:bg-primary/5'
      } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
      data-liked={isLiked ? "true" : "false"} // For debugging
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
      ) : (
        <Heart 
          className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'fill-transparent text-gray-500 hover:text-primary'} transition-all duration-300 ${isLiked ? 'scale-110' : 'scale-100'}`}
        />
      )}
    </button>
  );
};

export default FavoriteButton;