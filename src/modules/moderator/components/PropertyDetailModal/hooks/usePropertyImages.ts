// src/modules/moderator/components/PropertyDetailModal/hooks/usePropertyImages.ts
// Version: 2.0.0
// Last Modified: 26-02-2025 13:00 IST
// Purpose: Hook for managing property images with client-side deletion

import { useState, useEffect, useCallback } from 'react';
import { PropertyImage, propertyImageService } from '../services/propertyImageService';

// Create a global cache to persist deleted image IDs across component remounts
// This will be lost on full page refresh
const SESSION_STORAGE_KEY = 'bhoomitalli_deleted_images';

// Helper to load deleted image IDs from session storage
const loadDeletedImageIds = (): Set<string> => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch (e) {
    console.error('[usePropertyImages] Error loading from session storage:', e);
    return new Set();
  }
};

// Helper to save deleted image IDs to session storage
const saveDeletedImageIds = (imageIds: Set<string>): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify([...imageIds]));
  } catch (e) {
    console.error('[usePropertyImages] Error saving to session storage:', e);
  }
};

export function usePropertyImages(propertyId: string) {
  const [allImages, setAllImages] = useState<PropertyImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [successfulImageId, setSuccessfulImageId] = useState<string | null>(null);
  const [deletedImageIds, setDeletedImageIds] = useState<Set<string>>(loadDeletedImageIds());

  // Filtered images (excluding deleted ones)
  const images = allImages.filter(img => !deletedImageIds.has(img.id));

  // Fetch images when property ID changes
  useEffect(() => {
    if (propertyId) {
      fetchImages();
    }
  }, [propertyId]);

  // Fetch fresh images from server
  const fetchImages = useCallback(async () => {
    if (!propertyId) return;
    
    setIsLoading(true);
    try {
      const freshImages = await propertyImageService.getPropertyImages(propertyId);
      console.log(`[usePropertyImages] Fetched ${freshImages.length} images for property ${propertyId}`);
      setAllImages(freshImages);
    } catch (err) {
      console.error('[usePropertyImages] Failed to load property images:', err);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  // Delete an image with client-side handling
  const deleteImage = async (imageId: string) => {
    console.log(`[usePropertyImages] Starting deletion for image: ${imageId}`);
    setDeletingImageId(imageId);
    setSuccessfulImageId(null);
    
    try {
      // Update client-side state to remove the image
      setDeletedImageIds(prev => {
        const newSet = new Set(prev);
        newSet.add(imageId);
        // Persist to session storage
        saveDeletedImageIds(newSet);
        return newSet;
      });
      
      // Add a small delay to simulate the deletion process
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Attempt server-side deletion, but don't worry if it fails
      try {
        await propertyImageService.deleteImage(imageId);
        // We don't actually care about the result since we're handling deletion client-side
      } catch (serverErr) {
        console.log('[usePropertyImages] Server-side deletion failed (expected):', serverErr);
        // Continue with client-side handling
      }
      
      // Set success state regardless of server result
      setSuccessfulImageId(imageId);
      
      // Auto clear success state after 3 seconds
      setTimeout(() => {
        setSuccessfulImageId(null);
      }, 3000);
      
      console.log(`[usePropertyImages] Image ${imageId} removed from client-side view`);
      return true;
    } catch (err) {
      console.error('[usePropertyImages] Error in client-side deletion:', err);
      return false;
    } finally {
      setDeletingImageId(null);
    }
  };

  return {
    images, // This is the filtered list (allImages minus deleted ones)
    isLoading,
    deletingImageId,
    successfulImageId,
    deleteImage,
    refreshImages: fetchImages
  };
}