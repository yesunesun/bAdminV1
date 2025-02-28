// src/modules/seeker/components/FavoriteButton.tsx
// Version: 2.0.0
// Last Modified: 01-03-2025 12:20 IST
// Purpose: Modernized favorite button with animated heart icon and improved interaction

import React, { useState } from 'react';
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
    >
      <Heart 
        className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'fill-transparent text-gray-500 hover:text-primary'} transition-all duration-300 ${isLiked ? 'scale-110' : 'scale-100'}`}
      />
    </button>
  );
};

export default FavoriteButton;