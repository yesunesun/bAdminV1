// src/modules/seeker/components/PropertyDetails/hooks/usePropertyMedia.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 17:10 IST
// Purpose: Custom hook for managing property media (images and videos)

import { useState, useEffect, useCallback } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../../hooks/usePropertyDetails';
import { extractImagesFromJson } from '../utils/propertyDataUtils';
import { useToast } from '@/components/ui/use-toast';

/**
 * Interface for processed image data
 */
export interface ProcessedImage {
  id: string;
  url: string;
  dataUrl?: string;
  fileName?: string;
  is_primary: boolean;
  isPrimary: boolean;
  display_order: number;
}

/**
 * Interface for media management state and actions
 */
export interface PropertyMediaState {
  propertyImages: ProcessedImage[];
  isProcessingImages: boolean;
  handleMediaUploaded: (mediaType: 'image' | 'video') => void;
}

/**
 * Custom hook for managing property media
 * @param property - Property data containing media information
 * @param onRefresh - Callback to refresh property data
 * @returns Media state and management functions
 */
export const usePropertyMedia = (
  property: PropertyDetailsType | null,
  onRefresh?: () => void
): PropertyMediaState => {
  const { toast } = useToast();
  const [propertyImages, setPropertyImages] = useState<ProcessedImage[]>([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Process and extract images from property data
  useEffect(() => {
    if (!property) {
      setPropertyImages([]);
      return;
    }

    setIsProcessingImages(true);

    try {
      console.log('[usePropertyMedia] Processing property for images:', property.id);
      console.log('[usePropertyMedia] Property details:', property.property_details);

      // Extract images from the property JSON structure
      const extractedImages = extractImagesFromJson(property);
      console.log('[usePropertyMedia] Extracted images from JSON:', extractedImages);

      if (extractedImages.length > 0) {
        const processedImages: ProcessedImage[] = extractedImages.map((img: any, idx: number) => ({
          id: img.id || `extracted-img-${idx}`,
          url: img.url || '',
          dataUrl: img.dataUrl || '',
          fileName: img.fileName || '',
          is_primary: !!img.isPrimary || !!img.is_primary,
          isPrimary: !!img.isPrimary || !!img.is_primary,
          display_order: idx
        }));

        setPropertyImages(processedImages);
        console.log('[usePropertyMedia] Set extracted images:', processedImages);
      } else {
        // Fallback: Try to extract from property_details directly
        const propertyDetails = property.property_details || {};
        
        // Check for imageFiles in new format
        if (propertyDetails.imageFiles && Array.isArray(propertyDetails.imageFiles)) {
          console.log('[usePropertyMedia] Found imageFiles in property_details:', propertyDetails.imageFiles.length);
          
          const processedImages: ProcessedImage[] = propertyDetails.imageFiles.map((img: any, idx: number) => ({
            id: img.id || `img-${idx}`,
            url: img.url || '',
            dataUrl: img.dataUrl || '',
            fileName: img.fileName || '',
            is_primary: !!img.isPrimary,
            isPrimary: !!img.isPrimary,
            display_order: idx
          }));
          
          setPropertyImages(processedImages);
          console.log('[usePropertyMedia] Set processed images:', processedImages);
        } else if (propertyDetails.images && Array.isArray(propertyDetails.images)) {
          console.log('[usePropertyMedia] Found legacy images in property_details:', propertyDetails.images.length);
          
          const legacyImages: ProcessedImage[] = propertyDetails.images.map((img: any, idx: number) => ({
            id: img.id || `legacy-img-${idx}`,
            url: img.dataUrl || img.url || '',
            dataUrl: img.dataUrl || '',
            fileName: '',
            is_primary: !!img.isPrimary,
            isPrimary: !!img.isPrimary,
            display_order: idx
          }));
          
          setPropertyImages(legacyImages);
          console.log('[usePropertyMedia] Set legacy images:', legacyImages);
        } else {
          console.log('[usePropertyMedia] No images found in any format');
          setPropertyImages([]);
        }
      }
    } catch (error) {
      console.error('[usePropertyMedia] Error processing images:', error);
      setPropertyImages([]);
    } finally {
      setIsProcessingImages(false);
    }
  }, [property]);

  // Secondary effect for direct image data compatibility
  useEffect(() => {
    if (property && property.property_details && property.property_details.images) {
      // Update propertyImages state with correct data from property_details.images
      if (Array.isArray(property.property_details.images) && property.property_details.images.length > 0) {
        // Use the data directly from property_details.images
        const directImages: ProcessedImage[] = property.property_details.images.map((img: any, idx: number) => ({
          id: img.id || `direct-img-${idx}`,
          url: img.dataUrl || img.url || '',
          dataUrl: img.dataUrl || '',
          fileName: img.fileName || '',
          is_primary: !!img.isPrimary || !!img.is_primary,
          isPrimary: !!img.isPrimary || !!img.is_primary,
          display_order: idx
        }));

        setPropertyImages(directImages);
        console.log('[usePropertyMedia] Set direct images from property_details:', directImages);
      }
    }
  }, [property]);

  // Handle media upload completion
  const handleMediaUploaded = useCallback((mediaType: 'image' | 'video') => {
    console.log(`[usePropertyMedia] ${mediaType === 'video' ? 'Video' : 'Images'} uploaded - triggering refresh`);
    
    if (onRefresh) {
      onRefresh();

      // After refresh, show toast notification
      setTimeout(() => {
        toast({
          title: `${mediaType === 'video' ? 'Video' : 'Images'} Updated`,
          description: `Your property ${mediaType === 'video' ? 'video has' : 'images have'} been updated`,
          variant: "default"
        });
      }, 500);
    }
  }, [onRefresh, toast]);

  return {
    propertyImages,
    isProcessingImages,
    handleMediaUploaded
  };
};