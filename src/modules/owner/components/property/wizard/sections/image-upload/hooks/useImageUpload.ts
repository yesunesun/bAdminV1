// src/modules/owner/components/property/wizard/sections/image-upload/hooks/useImageUpload.ts
// Version: 2.1.0 - Fixed Database Updates (CRITICAL)
// Last Modified: 17-07-2025 23:00 IST
// Purpose: Fixed property_details updates to preserve existing data

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ImageFile {
  id: string;
  fileName: string;
  url: string;
  isPrimary: boolean;
  uploadedAt: string;
  fileSize: number;
  displayOrder: number;
}

interface PropertyData {
  property_details: {
    imageFiles?: ImageFile[];
    [key: string]: any;
  };
}

export function useImageUpload(propertyId: string, onUploadComplete: () => void) {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPropertyDetails, setCurrentPropertyDetails] = useState<any>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_IMAGES = 10;
  const STORAGE_BUCKET = 'property-images-v2';

  // Fetch existing images from properties_v2.property_details.imageFiles
  useEffect(() => {
    const fetchExistingImages = async () => {
      try {
        console.log('Fetching existing images for property:', propertyId);
        
        const { data: property, error } = await supabase
          .from('properties_v2')
          .select('property_details')
          .eq('id', propertyId)
          .single();

        if (error) {
          console.error('Error fetching property:', error);
          throw error;
        }

        // Store the complete property_details for updates
        const propertyDetails = property?.property_details || {};
        setCurrentPropertyDetails(propertyDetails);

        const imageFiles = propertyDetails.imageFiles || [];
        console.log('Found existing images:', imageFiles.length);

        setExistingImages(imageFiles);
        
        // Set primary image index
        const primaryIndex = imageFiles.findIndex((img: ImageFile) => img.isPrimary);
        setPrimaryImageIndex(primaryIndex >= 0 ? primaryIndex : 0);
        
      } catch (err) {
        console.error('Error fetching existing images:', err);
        setError('Failed to load existing images');
      } finally {
        setIsLoading(false);
      }
    };

    if (propertyId) {
      fetchExistingImages();
    }
  }, [propertyId]);

  // Helper function to update property with preserved data
  const updatePropertyWithImages = async (updatedImageFiles: ImageFile[]) => {
    const updatedPropertyDetails = {
      ...currentPropertyDetails,
      imageFiles: updatedImageFiles
    };

    const { error: updateError } = await supabase
      .from('properties_v2')
      .update({
        property_details: updatedPropertyDetails, // ✅ Preserves all existing data
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      throw new Error('Failed to update property with image information');
    }

    // Update local state
    setCurrentPropertyDetails(updatedPropertyDetails);
  };

  // Validate image file
  const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }

    // Check supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: 'Supported formats: JPG, PNG, WebP' };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB` };
    }

    return { valid: true };
  };

  // Generate unique filename
  const generateFileName = (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}_${randomString}.${extension}`;
  };

  // Handle file selection and upload
  const handleFileSelect = async (newFiles: File[]) => {
    const totalImages = existingImages.length + newFiles.length;
    if (totalImages > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    // Validate files
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
      setError(`Validation errors: ${validationErrors.join(', ')}`);
      if (validFiles.length === 0) return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      console.log('Starting direct upload for', validFiles.length, 'files');
      
      const newImageFiles: ImageFile[] = [];

      for (const [idx, file] of validFiles.entries()) {
        // Generate unique filename
        const fileName = generateFileName(file.name);
        const storagePath = `${propertyId}/${fileName}`;

        console.log(`Uploading file ${idx + 1}/${validFiles.length}: ${fileName}`);

        // Upload directly to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        if (!urlData.publicUrl) {
          throw new Error(`Failed to get public URL for ${fileName}`);
        }

        // Create image file object
        const imageFile: ImageFile = {
          id: `img_${Date.now()}_${idx}`,
          fileName: fileName,
          url: urlData.publicUrl,
          isPrimary: existingImages.length === 0 && idx === 0, // First image of first upload is primary
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          displayOrder: existingImages.length + idx
        };

        newImageFiles.push(imageFile);

        // Update progress
        setUploadProgress(((idx + 1) / validFiles.length) * 100);

        console.log(`Successfully uploaded: ${fileName} -> ${urlData.publicUrl}`);
      }

      // Update property_details.imageFiles in database (FIXED)
      const updatedImageFiles = [...existingImages, ...newImageFiles];
      await updatePropertyWithImages(updatedImageFiles);

      // Update local state
      setExistingImages(updatedImageFiles);
      console.log('Successfully updated property with', newImageFiles.length, 'new images');

      // Call completion callback
      onUploadComplete();

    } catch (error) {
      console.error('Upload process error:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Remove image
  const removeImage = async (index: number) => {
    const imageToRemove = existingImages[index];
    if (!imageToRemove) return;

    try {
      console.log('Removing image:', imageToRemove.fileName);

      // Remove from storage
      const storagePath = `${propertyId}/${imageToRemove.fileName}`;
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (storageError) {
        console.warn('Storage removal warning:', storageError);
        // Continue even if storage removal fails
      }

      // Update imageFiles array
      const updatedImages = existingImages.filter((_, i) => i !== index);

      // Re-assign display orders
      const reorderedImages = updatedImages.map((img, idx) => ({
        ...img,
        displayOrder: idx
      }));

      // If removed image was primary, make first image primary
      if (imageToRemove.isPrimary && reorderedImages.length > 0) {
        reorderedImages[0].isPrimary = true;
        setPrimaryImageIndex(0);
      } else if (primaryImageIndex > index) {
        setPrimaryImageIndex(prev => prev - 1);
      }

      // Update database (FIXED)
      await updatePropertyWithImages(reorderedImages);

      setExistingImages(reorderedImages);
      console.log('Successfully removed image');

    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image');
    }
  };

  // Set primary image
  const handleSetPrimaryImage = async (index: number) => {
    const imageToSetPrimary = existingImages[index];
    if (!imageToSetPrimary) return;

    try {
      console.log('Setting primary image:', imageToSetPrimary.fileName);

      // Update all images to set new primary
      const updatedImages = existingImages.map((img, idx) => ({
        ...img,
        isPrimary: idx === index
      }));

      // Update database (FIXED)
      await updatePropertyWithImages(updatedImages);

      setExistingImages(updatedImages);
      setPrimaryImageIndex(index);
      console.log('Successfully set primary image');

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
    optimizing: false, // No optimization in direct upload
    uploadProgress,
    optimizationProgress: 0, // No optimization progress
    primaryImageIndex,
    isLoading,
    optimizationStats: null, // No optimization stats
    handleFileSelect,
    removeImage,
    handleSetPrimaryImage,
    setError
  };
}

// End of file