// src/components/property/wizard/sections/image-upload/hooks/useImageUpload.ts
// Version: 1.1.0
// Last Modified: 2025-02-01T10:30:00+05:30 (IST)

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useImageUpload(propertyId: string, onUploadComplete: () => void) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_IMAGES = 10;

  const uploadSingleImage = async (file: File, index: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${propertyId}/${Date.now()}-${Math.random()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('property-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    await supabase
      .from('property_images')
      .insert([{
        property_id: propertyId,
        url: publicUrl,
        is_primary: index === primaryImageIndex,
        display_order: index
      }]);

    return publicUrl;
  };

  const handleFileSelect = useCallback(async (newFiles: File[]) => {
    if (images.length + newFiles.length > MAX_IMAGES) {
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

        // Upload immediately
        await uploadSingleImage(file, images.length + idx);
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
  }, [images.length, primaryImageIndex, propertyId]);

  const removeImage = useCallback(async (index: number) => {
    // Note: This assumes the image was already uploaded to Supabase
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }

    // You might want to add logic here to remove the image from Supabase storage
  }, [primaryImageIndex]);

  return {
    images,
    previews,
    error,
    uploading,
    uploadProgress,
    primaryImageIndex,
    handleFileSelect,
    removeImage,
    setPrimaryImageIndex
  };
}