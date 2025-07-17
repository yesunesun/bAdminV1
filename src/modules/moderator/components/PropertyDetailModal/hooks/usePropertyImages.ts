// src/modules/moderator/components/PropertyDetailModal/hooks/usePropertyImages.ts
// Version: 3.0.0
// Last Modified: 17-07-2025 12:00 IST
// Purpose: Hook for managing property images with server-side deletion from properties_v2

import { useState, useEffect, useCallback } from 'react';
import { PropertyImage, propertyImageService } from '../services/propertyImageService';

export function usePropertyImages(propertyId: string) {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [successfulImageId, setSuccessfulImageId] = useState<string | null>(null);

  // Fetch fresh images from server
  const fetchImages = useCallback(async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    try {
      const freshImages = await propertyImageService.getPropertyImages(propertyId);
      console.log(`[usePropertyImages] Fetched ${freshImages.length} images for property ${propertyId}`);
      setImages(freshImages);
    } catch (err) {
      console.error('[usePropertyImages] Failed to load property images:', err);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Fetch images when property ID changes
  useEffect(() => {
    if (propertyId) {
      fetchImages();
    }
  }, [propertyId, fetchImages]);

  // Delete an image with server-side handling
  const deleteImage = async (imageId: string) => {
    console.log(`[usePropertyImages] Starting deletion for image: ${imageId}`);
    setDeletingImageId(imageId);
    setSuccessfulImageId(null);
    
    try {
      // Attempt server-side deletion
      const success = await propertyImageService.deleteImage(imageId);
      
      if (success) {
        // Remove image from local state immediately
        setImages(prev => prev.filter(img => img.id !== imageId));
        
        // Set success state
        setSuccessfulImageId(imageId);
        
        // Auto clear success state after 3 seconds
        setTimeout(() => {
          setSuccessfulImageId(null);
        }, 3000);
        
        console.log(`[usePropertyImages] Image ${imageId} successfully deleted`);
        return true;
      } else {
        console.error(`[usePropertyImages] Failed to delete image ${imageId}`);
        return false;
      }
    } catch (err) {
      console.error('[usePropertyImages] Error in deletion:', err);
      return false;
    } finally {
      setDeletingImageId(null);
    }
  };

  return {
    images,
    isLoading,
    deletingImageId,
    successfulImageId,
    deleteImage,
    refreshImages: fetchImages
  };
}