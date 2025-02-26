// src/modules/seeker/components/FavoriteButton.tsx
// Version: 1.1.0
// Last Modified: 27-02-2025 14:30 IST
// Purpose: Fixed favorite button component with properly displayed heart icon

import React, { useState } from 'react';

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
      className={`flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm hover:bg-opacity-100 transition-colors ${className}`}
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      {isLiked ? (
        // Using a custom approach for the filled heart to prevent cutoff
        <div className="text-[#ff3b81]">
          ♥
        </div>
      ) : (
        // Simple outline heart
        <div className="text-gray-500">
          ♡
        </div>
      )}
    </button>
  );
};

export default FavoriteButton;