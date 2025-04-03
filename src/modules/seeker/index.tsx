// src/modules/seeker/index.tsx
// Version: 1.0.0
// Last Modified: 03-04-2025 12:40 IST
// Purpose: New entry point for property homepage in seeker module

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PropertyMapHomeView from './components/PropertyMapHomeView';
import PropertyHeader from './components/PropertyHeader';
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with auth options */}
      <PropertyHeader 
        onFavoritesClick={toggleFavorites}
      />
      
      {/* Main content */}
      <div className="flex-grow flex flex-col">
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