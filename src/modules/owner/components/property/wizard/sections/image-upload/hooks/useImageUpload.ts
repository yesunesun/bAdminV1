// src/components/property/wizard/sections/image-upload/hooks/useImageUpload.ts
// Version: 1.2.0 - Image Optimization Integration
// Last Modified: 2025-07-13T14:00:00+05:30 (IST)

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { imageOptimizationService } from '@/services/imageOptimizationService';
import { validateImageFile, formatFileSize, calculateCompressionPercentage } from '@/utils/imageOptimization';

interface PropertyImage {
  id: string;
  url: string;
  thumbnail_url?: string;
  medium_url?: string;
  full_url?: string;
  is_primary: boolean;
  display_order: number;
  is_optimized?: boolean;
  original_size?: number;
  optimized_size?: number;
  compression_ratio?: number;
}

export function useImageUpload(propertyId: string, onUploadComplete: () => void) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [optimizationStats, setOptimizationStats] = useState<{
    totalSaved: number;
    averageCompression: number;
    optimizationTime: number;
  } | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (increased for optimization)
  const MAX_IMAGES = 10;

  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        const { data: images, error } = await supabase
          .from('property_images')
          .select('*')
          .eq('property_id', propertyId)
          .order('display_order', { ascending: true });

        if (error) throw error;

        setExistingImages(images || []);
        
        // Set primary image index based on existing images
        const primaryIndex = images?.findIndex(img => img.is_primary) ?? 0;
        setPrimaryImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('Failed to load existing images');
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchExistingImages();
    }
  }, [propertyId]);

  const handleFileSelect = async (newFiles: File[]) => {
    const totalImages = images.length + existingImages.length + newFiles.length;
    if (totalImages > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate files using the new validation utility
    const validFiles: File[] = [];
    const validationErrors: string[] = [];

    for (const file of newFiles) {
      const validation = validateImageFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (validationErrors.length > 0) {
      setError(`File validation errors: ${validationErrors.join(', ')}`);
      if (validFiles.length === 0) return;
    }

    setError(null);
    setOptimizing(true);
    setUploading(true);
    
    const optimizationResults: Array<{
      originalSize: number;
      optimizedSize: number;
      compressionRatio: number;
      optimizationTime: number;
    }> = [];

    try {
      for (const [idx, file] of validFiles.entries()) {
        // Create preview for immediate feedback
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);

        // Update optimization progress
        setOptimizationProgress((idx / validFiles.length) * 50); // 50% for optimization phase

        // Optimize image using the new service
        const optimizationResult = await imageOptimizationService.uploadAndOptimizeImage(
          file,
          propertyId,
          existingImages.length + idx,
          'gallery'
        );

        if (!optimizationResult.success) {
          throw new Error(optimizationResult.error || 'Image optimization failed');
        }

        // Update upload progress
        setUploadProgress(((idx + 1) / validFiles.length) * 50 + 50); // 50% for upload phase

        // Create property image record with optimization data
        const startIndex = existingImages.length + idx;
        const { error: dbError, data: newImage } = await supabase
          .from('property_images')
          .insert([{
            property_id: propertyId,
            url: optimizationResult.urls.medium || optimizationResult.urls.full, // Default to medium for display
            thumbnail_url: optimizationResult.urls.thumbnail,
            medium_url: optimizationResult.urls.medium,
            full_url: optimizationResult.urls.full,
            is_primary: startIndex === primaryImageIndex,
            display_order: startIndex,
            is_optimized: true
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        // Calculate compression stats
        const originalSize = optimizationResult.optimizationRecord.original_size_bytes;
        const optimizedSize = (optimizationResult.optimizationRecord.thumbnail_size_bytes || 0) +
                             (optimizationResult.optimizationRecord.medium_size_bytes || 0) +
                             (optimizationResult.optimizationRecord.full_size_bytes || 0);
        
        const compressionRatio = calculateCompressionPercentage(originalSize, optimizedSize);

        // Add compression info to the image data
        const imageWithStats = {
          ...newImage,
          original_size: originalSize,
          optimized_size: optimizedSize,
          compression_ratio: compressionRatio
        };

        optimizationResults.push({
          originalSize,
          optimizedSize,
          compressionRatio,
          optimizationTime: optimizationResult.optimizationRecord.optimization_time_ms
        });

        setExistingImages(prev => [...prev, imageWithStats]);
        setImages(prev => [...prev, file]);
      }

      // Calculate and display optimization stats
      const totalOriginalSize = optimizationResults.reduce((sum, result) => sum + result.originalSize, 0);
      const totalOptimizedSize = optimizationResults.reduce((sum, result) => sum + result.optimizedSize, 0);
      const averageCompression = optimizationResults.reduce((sum, result) => sum + result.compressionRatio, 0) / optimizationResults.length;
      const totalOptimizationTime = optimizationResults.reduce((sum, result) => sum + result.optimizationTime, 0);

      setOptimizationStats({
        totalSaved: totalOriginalSize - totalOptimizedSize,
        averageCompression,
        optimizationTime: totalOptimizationTime
      });

    } catch (error) {
      console.error('Upload and optimization error:', error);
      setError(`Failed to process images: ${error.message}`);
    } finally {
      setOptimizing(false);
      setUploading(false);
      setUploadProgress(0);
      setOptimizationProgress(0);
    }
  };

  const removeImage = async (index: number) => {
    const image = existingImages[index];
    if (!image) return;

    try {
      const { error } = await supabase
        .from('property_images')
        .delete()
        .eq('id', image.id);

      if (error) throw error;

      // Remove from storage if needed
      // Note: You might want to implement storage cleanup here

      setExistingImages(prev => prev.filter((_, i) => i !== index));
      if (primaryImageIndex === index) {
        setPrimaryImageIndex(0);
        // Update primary image in database
        await updatePrimaryImage(existingImages[0]?.id);
      } else if (primaryImageIndex > index) {
        setPrimaryImageIndex(prev => prev - 1);
      }
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    }
  };

  const updatePrimaryImage = async (imageId: string) => {
    try {
      // First, set all images as non-primary
      await supabase
        .from('property_images')
        .update({ is_primary: false })
        .eq('property_id', propertyId);

      // Then set the selected image as primary
      const { error } = await supabase
        .from('property_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating primary image:', err);
      setError('Failed to update primary image');
    }
  };

  const handleSetPrimaryImage = async (index: number) => {
    const image = existingImages[index];
    if (!image) return;

    try {
      await updatePrimaryImage(image.id);
      setPrimaryImageIndex(index);
    } catch (err) {
      console.error('Error setting primary image:', err);
      setError('Failed to set primary image');
    }
  };

  return {
    images,
    previews,
    existingImages,
    error,
    uploading,
    optimizing,
    uploadProgress,
    optimizationProgress,
    primaryImageIndex,
    isLoading,
    optimizationStats,
    handleFileSelect,
    removeImage,
    handleSetPrimaryImage,
    setError
  };
}