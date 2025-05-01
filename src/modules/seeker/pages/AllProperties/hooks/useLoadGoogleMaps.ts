// src/modules/seeker/pages/AllProperties/hooks/useLoadGoogleMaps.ts
// Version: 1.1.0
// Last Modified: 01-05-2025 14:10 IST
// Purpose: Updated to use the centralized Google Maps loader

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useGoogleMaps } from '../../../hooks/useGoogleMaps';

// For type safety - declare global google variable
declare global {
  interface Window {
    google: any;
  }
}

export const useLoadGoogleMaps = () => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Use the centralized Google Maps loading hook
  const { isLoaded } = useGoogleMaps();
  
  useEffect(() => {
    // Update local state when maps are loaded
    if (isLoaded) {
      setGoogleMapsLoaded(true);
    }
    
    // Check if the API key is available for toast message
    if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
      console.warn("Google Maps API key not found in environment variables");
      toast({
        title: "API Key Missing",
        description: "Google Maps functionality is limited due to missing API key.",
        variant: "destructive"
      });
    }
  }, [isLoaded, toast]);

  return { googleMapsLoaded: isLoaded };
};