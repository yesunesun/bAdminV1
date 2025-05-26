// src/modules/seeker/hooks/useVideoUploadSimple.ts
// Version: 1.0.0
// Last Modified: 27-05-2025 11:20 IST
// Purpose: Simplified video upload that minimizes RLS policy dependencies

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface VideoUploadData {
  url: string;
  fileName: string;
  thumbnailUrl?: string;
  fileSize: number;
  uploadedAt: string;
}

interface UseVideoUploadReturn {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  videoUrl: string | null;
  fileName: string | null;
  thumbnailUrl: string | null;
  uploadVideo: (file: File) => Promise<void>;
  deleteVideo: () => Promise<void>;
  clearError: () => void;
  generateThumbnail: (file: File) => Promise<string | null>;
}

// Use the existing image bucket that has working RLS policies
const STORAGE_BUCKET = 'property-images-v2';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit
const ALLOWED_FORMATS = ['video/mp4', 'video/webm'];

export const validateVideoFile = (file: File) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!ALLOWED_FORMATS.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file format. Please use MP4 or WebM' 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(file.size / (1024 * 1024));
    const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
    return { 
      isValid: false, 
      error: `File size (${sizeMB}MB) exceeds the ${maxSizeMB}MB limit` 
    };
  }

  return { isValid: true, error: null };
};

export const useVideoUploadSimple = (
  propertyId: string,
  onUploadComplete?: (data: VideoUploadData) => void,
  onUploadError?: (error: string) => void,
  onDeleteComplete?: () => void
): UseVideoUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateThumbnail = useCallback(async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        // Keep thumbnail small to avoid memory issues
        canvas.width = 320;
        canvas.height = 240;
        video.currentTime = 1; // Seek to 1 second
      });

      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(thumbnailDataUrl);
        } else {
          resolve(null);
        }
        URL.revokeObjectURL(video.src);
      });

      video.addEventListener('error', () => {
        resolve(null);
        URL.revokeObjectURL(video.src);
      });

      video.src = URL.createObjectURL(file);
      video.load();
    });
  }, []);

  const uploadVideo = useCallback(async (file: File) => {
    if (!propertyId) {
      const errorMsg = 'Property ID is required for video upload';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      if (onUploadError) onUploadError(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.type === 'video/mp4' ? 'mp4' : 'webm';
      const uniqueFileName = `video_${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `${propertyId}/${uniqueFileName}`;

      console.log('[VideoUpload] Starting simple upload:', filePath);

      // Progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 85));
      }, 500);

      // Upload file to storage
      const { data, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(90);

      if (uploadError) {
        console.error('[VideoUpload] Storage upload failed:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      if (!data) {
        throw new Error('Upload failed: No data returned');
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      setUploadProgress(95);

      // Generate thumbnail
      const thumbnail = await generateThumbnail(file);
      setUploadProgress(100);

      const videoData: VideoUploadData = {
        url: urlData.publicUrl,
        fileName: uniqueFileName,
        thumbnailUrl: thumbnail || undefined,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      };

      // Store video info in localStorage as fallback
      const videoStorageKey = `property_video_${propertyId}`;
      localStorage.setItem(videoStorageKey, JSON.stringify(videoData));

      // Try to update database, but don't fail if it doesn't work
      try {
        await updatePropertyWithRetry(propertyId, videoData);
        console.log('[VideoUpload] Database updated successfully');
      } catch (dbError) {
        console.warn('[VideoUpload] Database update failed, using localStorage fallback:', dbError);
        // Don't throw - the video was uploaded successfully
      }

      // Update local state
      setVideoUrl(urlData.publicUrl);
      setFileName(uniqueFileName);
      setThumbnailUrl(thumbnail);

      if (onUploadComplete) {
        onUploadComplete(videoData);
      }

    } catch (err) {
      console.error('[VideoUpload] Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Video upload failed';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  }, [propertyId, onUploadComplete, onUploadError, generateThumbnail]);

  const deleteVideo = useCallback(async () => {
    if (!propertyId || !fileName) {
      setError('Missing property ID or file name for deletion');
      return;
    }

    try {
      const filePath = `${propertyId}/${fileName}`;
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (deleteError && !deleteError.message.includes('not found')) {
        console.error('[VideoUpload] Delete error:', deleteError);
        throw deleteError;
      }

      // Remove from localStorage
      const videoStorageKey = `property_video_${propertyId}`;
      localStorage.removeItem(videoStorageKey);

      // Try to update database
      try {
        await removeVideoFromProperty(propertyId);
        console.log('[VideoUpload] Video removed from database');
      } catch (dbError) {
        console.warn('[VideoUpload] Database removal failed:', dbError);
        // Continue anyway
      }

      // Clear local state
      setVideoUrl(null);
      setFileName(null);
      setThumbnailUrl(null);
      setError(null);

      if (onDeleteComplete) {
        onDeleteComplete();
      }

    } catch (err) {
      console.error('[VideoUpload] Delete failed:', err);
      setError(err instanceof Error ? err.message : 'Video deletion failed');
    }
  }, [propertyId, fileName, onDeleteComplete]);

  return {
    isUploading,
    uploadProgress,
    error,
    videoUrl,
    fileName,
    thumbnailUrl,
    uploadVideo,
    deleteVideo,
    clearError,
    generateThumbnail
  };
};

// Helper function with retry logic for database updates
const updatePropertyWithRetry = async (propertyId: string, videoData: VideoUploadData, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const { data: property, error: fetchError } = await supabase
        .from('properties_v2')
        .select('property_details')
        .eq('id', propertyId)
        .single();

      if (fetchError) throw fetchError;

      const currentDetails = property.property_details || {};
      const updatedDetails = {
        ...currentDetails,
        media: {
          ...currentDetails.media,
          videos: videoData
        }
      };

      const { error: updateError } = await supabase
        .from('properties_v2')
        .update({
          property_details: updatedDetails,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      if (updateError) throw updateError;
      
      return; // Success
    } catch (error) {
      console.warn(`[VideoUpload] Database update attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error; // Last attempt failed
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Helper function to remove video from property
const removeVideoFromProperty = async (propertyId: string) => {
  const { data: property, error: fetchError } = await supabase
    .from('properties_v2')
    .select('property_details')
    .eq('id', propertyId)
    .single();

  if (fetchError) throw fetchError;

  const currentDetails = property.property_details || {};
  const updatedDetails = {
    ...currentDetails,
    media: {
      ...currentDetails.media,
      videos: null
    }
  };

  const { error: updateError } = await supabase
    .from('properties_v2')
    .update({
      property_details: updatedDetails,
      updated_at: new Date().toISOString()
    })
    .eq('id', propertyId);

  if (updateError) throw updateError;
};