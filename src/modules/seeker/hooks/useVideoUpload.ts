// src/modules/seeker/hooks/useVideoUpload.ts
// Version: 1.1.0
// Last Modified: 27-05-2025 10:50 IST
// Purpose: Video upload hook with fallback for missing storage bucket

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

// Constants - Use correct bucket name to match your configuration
const PRIMARY_STORAGE_BUCKET = 'property-videos-v2'; // Fixed bucket name
const FALLBACK_STORAGE_BUCKET = 'property-images-v2'; // Use existing bucket as fallback
const MAX_FILE_SIZE = 100 * 1024 * 1024; // Reduce to 100MB for compatibility
const ALLOWED_FORMATS = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];

// Video validation utility
export const validateVideoFile = (file: File) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!ALLOWED_FORMATS.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file format. Please use MP4, MOV, AVI, or WebM' 
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

export const useVideoUpload = (
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
        canvas.width = Math.min(video.videoWidth, 640); // Limit canvas size
        canvas.height = Math.min(video.videoHeight, 480);
        
        // Seek to 1 second or 10% of video duration
        video.currentTime = Math.min(1, video.duration * 0.1);
      });

      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(thumbnailDataUrl);
        } else {
          resolve(null);
        }
        
        // Clean up
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

  // Check which storage bucket is available
  const getAvailableStorageBucket = useCallback(async (): Promise<string> => {
    try {
      // Try primary video bucket first
      const { error: primaryError } = await supabase.storage
        .from(PRIMARY_STORAGE_BUCKET)
        .list('', { limit: 1 });

      if (!primaryError) {
        console.log('[useVideoUpload] Using primary video bucket');
        return PRIMARY_STORAGE_BUCKET;
      }

      // Fall back to image bucket
      console.log('[useVideoUpload] Primary bucket not available, using fallback bucket');
      return FALLBACK_STORAGE_BUCKET;
      
    } catch (error) {
      console.log('[useVideoUpload] Error checking buckets, using fallback');
      return FALLBACK_STORAGE_BUCKET;
    }
  }, []);

  const uploadVideo = useCallback(async (file: File) => {
    if (!propertyId) {
      const errorMsg = 'Property ID is required for video upload';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    // Validate file
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
      // Determine which bucket to use
      const storageBucket = await getAvailableStorageBucket();
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = file.name.split('.').pop() || 'mp4';
      const uniqueFileName = `video_${timestamp}_${randomString}.${fileExtension}`;
      const filePath = `${propertyId}/${uniqueFileName}`;

      console.log('[useVideoUpload] Starting upload to bucket:', storageBucket, 'path:', filePath);

      // Simulate progress for better UX
      let progressInterval: NodeJS.Timeout;
      progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(95);

      if (uploadError) {
        console.error('[useVideoUpload] Upload error:', uploadError);
        throw uploadError;
      }

      if (!data) {
        throw new Error('Upload failed: No data returned');
      }

      console.log('[useVideoUpload] Upload successful:', data.path);

      // Generate public URL
      const { data: urlData } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      setUploadProgress(98);

      // Generate thumbnail
      const thumbnail = await generateThumbnail(file);
      setUploadProgress(100);

      // Save video information to property details
      const videoData: VideoUploadData = {
        url: publicUrl,
        fileName: uniqueFileName,
        thumbnailUrl: thumbnail || undefined,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      };

      // Update property_details in database
      await updatePropertyVideoData(propertyId, videoData);

      // Update local state
      setVideoUrl(publicUrl);
      setFileName(uniqueFileName);
      setThumbnailUrl(thumbnail);

      if (onUploadComplete) {
        onUploadComplete(videoData);
      }

    } catch (err) {
      console.error('[useVideoUpload] Upload failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Video upload failed';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  }, [propertyId, onUploadComplete, onUploadError, generateThumbnail, getAvailableStorageBucket]);

  const deleteVideo = useCallback(async () => {
    if (!propertyId || !fileName) {
      const errorMsg = 'Missing property ID or file name for deletion';
      setError(errorMsg);
      return;
    }

    try {
      const storageBucket = await getAvailableStorageBucket();
      const filePath = `${propertyId}/${fileName}`;
      
      console.log('[useVideoUpload] Deleting video from bucket:', storageBucket, 'path:', filePath);

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from(storageBucket)
        .remove([filePath]);

      if (deleteError) {
        console.error('[useVideoUpload] Delete error:', deleteError);
        // Don't throw error if file doesn't exist
        if (!deleteError.message.includes('not found')) {
          throw deleteError;
        }
      }

      // Remove video data from property details
      await removePropertyVideoData(propertyId);

      // Clear local state
      setVideoUrl(null);
      setFileName(null);
      setThumbnailUrl(null);
      setError(null);

      if (onDeleteComplete) {
        onDeleteComplete();
      }

    } catch (err) {
      console.error('[useVideoUpload] Delete failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Video deletion failed';
      setError(errorMessage);
    }
  }, [propertyId, fileName, onDeleteComplete, getAvailableStorageBucket]);

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

// Helper function to update property video data
const updatePropertyVideoData = async (propertyId: string, videoData: VideoUploadData) => {
  try {
    // Get current property details
    const { data: property, error: fetchError } = await supabase
      .from('properties_v2')
      .select('property_details')
      .eq('id', propertyId)
      .single();

    if (fetchError) {
      console.error('[updatePropertyVideoData] Fetch error:', fetchError);
      throw fetchError;
    }

    // Update property details with video data
    const currentDetails = property.property_details || {};
    const updatedDetails = {
      ...currentDetails,
      media: {
        ...currentDetails.media,
        videos: videoData
      }
    };

    // Save back to database
    const { error: updateError } = await supabase
      .from('properties_v2')
      .update({
        property_details: updatedDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('[updatePropertyVideoData] Update error:', updateError);
      throw updateError;
    }

    console.log('[updatePropertyVideoData] Video data saved successfully');
  } catch (error) {
    console.error('[updatePropertyVideoData] Error:', error);
    throw error;
  }
};

// Helper function to remove property video data
const removePropertyVideoData = async (propertyId: string) => {
  try {
    // Get current property details
    const { data: property, error: fetchError } = await supabase
      .from('properties_v2')
      .select('property_details')
      .eq('id', propertyId)
      .single();

    if (fetchError) {
      console.error('[removePropertyVideoData] Fetch error:', fetchError);
      throw fetchError;
    }

    // Remove video data from property details
    const currentDetails = property.property_details || {};
    const updatedDetails = {
      ...currentDetails,
      media: {
        ...currentDetails.media,
        videos: null
      }
    };

    // Save back to database
    const { error: updateError } = await supabase
      .from('properties_v2')
      .update({
        property_details: updatedDetails,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('[removePropertyVideoData] Update error:', updateError);
      throw updateError;
    }

    console.log('[removePropertyVideoData] Video data removed successfully');
  } catch (error) {
    console.error('[removePropertyVideoData] Error:', error);
    throw error;
  }
};