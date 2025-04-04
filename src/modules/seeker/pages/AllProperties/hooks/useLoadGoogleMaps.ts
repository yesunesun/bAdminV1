// src/modules/seeker/pages/AllProperties/hooks/useLoadGoogleMaps.ts
// Version: 1.0.0
// Last Modified: 05-04-2025 22:35 IST
// Purpose: Hook to handle Google Maps API loading

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

// For type safety - declare global google variable
declare global {
  interface Window {
    google: any;
  }
}

export const useLoadGoogleMaps = () => {
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if the API key is available
    if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
      console.warn("Google Maps API key not found in environment variables");
      toast({
        title: "API Key Missing",
        description: "Google Maps functionality is limited due to missing API key.",
        variant: "destructive"
      });
    } else {
      // Load Google Maps API
      loadGoogleMapsScript(() => {
        setGoogleMapsLoaded(true);
        console.log("Google Maps API loaded successfully and ready to use");
      });
    }
  }, [toast]);

  // Load Google Maps API script
  const loadGoogleMapsScript = (callback: () => void) => {
    const existingScript = document.getElementById('googleMapsScript');
    if (!existingScript) {
      const script = document.createElement('script');
      // Use the environment variable for the API key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
      console.log("Using Google Maps API Key:", apiKey ? "Available (hidden)" : "Not available");
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.id = 'googleMapsScript';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps script loaded successfully");
        callback();
      };
      script.onerror = (error) => {
        console.error("Error loading Google Maps script:", error);
      };
      document.body.appendChild(script);
    } else {
      callback();
    }
  };

  return { googleMapsLoaded };
};