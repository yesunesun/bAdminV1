// src/components/property/wizard/sections/image-upload/hooks/useImageUpload.ts
// Version: 1.0.0
// Last Modified: 2025-01-31T16:45:00+05:30 (IST)

import { useState } from 'react';
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE;
      if (!isValid) {
        setError('Please select images under 5MB');
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      setError(null);
      setImages(prev => [...prev, ...validFiles]);
      
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(0);
    } else if (primaryImageIndex > index) {
      setPrimaryImageIndex(prev => prev - 1);
    }
  };

  const uploadImages = async () => {
    if (images.length === 0) {
      setError('Please select at least one image');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      for (const [index, file] of images.entries()) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/${Date.now()}-${index}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error(`Storage upload error for image ${index + 1}:`, uploadError);
          setError('Failed to upload some images');
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('property_images')
          .insert([{
            property_id: propertyId,
            url: publicUrl,
            is_primary: index === primaryImageIndex,
            display_order: index
          }]);

        if (dbError) {
          console.error(`Database error for image ${index + 1}:`, dbError);
          setError('Failed to save image information');
          continue;
        }

        setUploadProgress(((index + 1) / images.length) * 100);
      }

      onUploadComplete();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return {
    images,
    previews,
    error,
    uploading,
    uploadProgress,
    primaryImageIndex,
    handleFileSelect,
    removeImage,
    setPrimaryImageIndex,
    uploadImages,
    setError
  };
}