// src/modules/seeker/components/PropertyDetails/hooks/usePropertyMedia.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 17:10 IST
// Purpose: Custom hook for managing property media (images and videos)

import { useState, useEffect, useCallback } from 'react';
import { PropertyDetails as PropertyDetailsType } from '../../../hooks/usePropertyDetails';
import { extractImagesFromJson } from '../utils/propertyDataUtils';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

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
 * Generate URL for optimization-based images
 */
const generateOptimizationImageUrl = async (fileName: string): Promise<string> => {
  if (!fileName.startsWith('optimization_')) {
    return '';
  }
  
  try {
    const optimizationId = fileName.replace('optimization_', '');
    const { data: optRecord, error } = await supabase
      .from('image_optimizations')
      .select('medium_path, full_path, thumbnail_path')
      .eq('id', optimizationId)
      .single();
      
    if (error || !optRecord) {
      console.warn('[usePropertyMedia] Optimization record not found:', optimizationId);
      return '';
    }
    
    // Use public URL for medium variant (best balance of quality and loading speed)
    const STORAGE_BUCKET = 'property-images-v2';
    if (optRecord.medium_path) {
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(optRecord.medium_path);
      
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
    
    // Fallback to full or thumbnail
    if (optRecord.full_path) {
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(optRecord.full_path);
      if (data?.publicUrl) return data.publicUrl;
    }
    
    if (optRecord.thumbnail_path) {
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(optRecord.thumbnail_path);
      if (data?.publicUrl) return data.publicUrl;
    }
    
  } catch (err) {
    console.error('[usePropertyMedia] Error loading optimization image:', err);
  }
  
  return '';
};

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
    const processPropertyImages = async () => {
      if (!property) {
        setPropertyImages([]);
        return;
      }

      setIsProcessingImages(true);

      try {
        console.log('[usePropertyMedia] Processing property for images:', property.id);
        console.log('[usePropertyMedia] Full property object:', property);
        console.log('[usePropertyMedia] Property details:', property.property_details);
        console.log('[usePropertyMedia] Property details imageFiles:', property.property_details?.imageFiles);

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
            console.log('[usePropertyMedia] imageFiles content:', propertyDetails.imageFiles);
            
            // Process images and generate URLs for optimization-based images
            const processedImages: ProcessedImage[] = [];
            
            for (const [idx, img] of propertyDetails.imageFiles.entries()) {
              console.log(`[usePropertyMedia] Processing image ${idx}:`, img);
              let imageUrl = img.url || '';
              
              // Generate URL for optimization-based images
              if (img.fileName && img.fileName.startsWith('optimization_')) {
                console.log('[usePropertyMedia] Processing optimization image:', img.fileName);
                try {
                  imageUrl = await generateOptimizationImageUrl(img.fileName);
                  console.log('[usePropertyMedia] Generated optimization URL:', imageUrl);
                } catch (err) {
                  console.error('[usePropertyMedia] Failed to generate optimization URL for:', img.fileName, err);
                }
              } else {
                console.log('[usePropertyMedia] Non-optimization image, using existing URL:', imageUrl);
              }
              
              const processedImage = {
                id: img.id || `img-${idx}`,
                url: imageUrl,
                dataUrl: img.dataUrl || '',
                fileName: img.fileName || '',
                is_primary: !!img.isPrimary,
                isPrimary: !!img.isPrimary,
                display_order: idx
              };
              
              console.log(`[usePropertyMedia] Processed image ${idx}:`, processedImage);
              processedImages.push(processedImage);
            }
            
            console.log('[usePropertyMedia] Final processed images array:', processedImages);
            setPropertyImages(processedImages);
            console.log('[usePropertyMedia] Set processed images with URLs - count:', processedImages.length);
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
    };

    processPropertyImages();
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