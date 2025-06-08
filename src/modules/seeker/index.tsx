// src/modules/seeker/index.tsx
// Version: 3.2.0
// Last Modified: 06-04-2025 02:00 IST
// Purpose: Removed width constraints and allowed full-width content

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PropertyMapHomeView from './components/PropertyMapHomeView';
import FavoritesDrawer from './components/FavoritesDrawer';
import LoginPrompt from './components/LoginPrompt';
import { useToast } from '@/components/ui/use-toast';

const PropertyMapHome: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFavorites, setShowFavorites] = useState<boolean>(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState<boolean>(false);
  
  // Handle favorite action
  const handleFavoriteAction = (propertyId: string) => {
    if (!user) {
      setShowLoginPrompt(true);
      return false;
    }
    
    // If user is logged in, allow favorite action
    return true;
  };
  
  // Toggle favorites drawer
  const toggleFavorites = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setShowFavorites(!showFavorites);
  };
  
  return (
    <div className="flex flex-col bg-background w-full">
      {/* Main content - allowed to take full width */}
      <div className="flex-grow flex flex-col w-full">
        <PropertyMapHomeView 
          onFavoriteAction={handleFavoriteAction}
        />
      </div>
      
      {/* Favorites drawer - only visible when toggled */}
      <FavoritesDrawer 
        open={showFavorites} 
        onClose={() => setShowFavorites(false)} 
      />
      
      {/* Login prompt modal */}
      <LoginPrompt 
        open={showLoginPrompt} 
        onClose={() => setShowLoginPrompt(false)}
      />
    </div>
  );
};

export default PropertyMapHome;