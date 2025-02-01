// src/components/property/wizard/sections/image-upload/hooks/useImageUpload.ts
// Version: 1.1.0
// Last Modified: 2025-02-01T14:00:00+05:30 (IST)

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PropertyImage {
  id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export function useImageUpload(propertyId: string, onUploadComplete: () => void) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
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

    const validFiles = newFiles.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE;
      if (!isValid) {
        setError('Please select images under 5MB');
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    setError(null);
    setUploading(true);
    
    try {
      for (const [idx, file] of validFiles.entries()) {
        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);

        const startIndex = existingImages.length + images.length;
        
        // Upload immediately
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        const { error: dbError, data: newImage } = await supabase
          .from('property_images')
          .insert([{
            property_id: propertyId,
            url: publicUrl,
            is_primary: startIndex + idx === primaryImageIndex,
            display_order: startIndex + idx
          }])
          .select()
          .single();

        if (dbError) throw dbError;

        setExistingImages(prev => [...prev, newImage]);
        setImages(prev => [...prev, file]);
        setUploadProgress(((idx + 1) / validFiles.length) * 100);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload some images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
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
    uploadProgress,
    primaryImageIndex,
    isLoading,
    handleFileSelect,
    removeImage,
    handleSetPrimaryImage,
    setError
  };
}