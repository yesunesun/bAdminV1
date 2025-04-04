// src/modules/seeker/components/FavoriteButton.tsx
// Version: 2.1.0
// Last Modified: 05-04-2025 12:15 IST
// Purpose: Fixed favorite button state management

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  initialIsLiked: boolean;
  onToggle: (isLiked: boolean) => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  initialIsLiked, 
  onToggle,
  className = "" 
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  
  // Update local state when props change (crucial for persistence)
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle state and notify parent
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    onToggle(newLikedState);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 ${
        isLiked ? 'hover:bg-pink-50' : 'hover:bg-primary/5'
      } ${className}`}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
      data-liked={isLiked ? "true" : "false"} // For debugging
    >
      <Heart 
        className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'fill-transparent text-gray-500 hover:text-primary'} transition-all duration-300 ${isLiked ? 'scale-110' : 'scale-100'}`}
      />
    </button>
  );
};

export default FavoriteButton;