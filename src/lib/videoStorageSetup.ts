// src/lib/videoStorageSetup.ts
// Version: 1.0.0
// Last Modified: 26-05-2025 16:00 IST
// Purpose: Video storage setup and validation utilities

import { supabase, propertyVideoStorage } from './supabase';

export interface VideoStorageSetupResult {
  success: boolean;
  bucketExists: boolean;
  bucketCreated: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Initialize video storage bucket and validate configuration
 * This function should be called during app initialization or admin setup
 */
export async function initializeVideoStorage(): Promise<VideoStorageSetupResult> {
  const result: VideoStorageSetupResult = {
    success: false,
    bucketExists: false,
    bucketCreated: false,
    errors: [],
    warnings: []
  };

  try {
    console.log('Initializing video storage...');

    // Check if bucket exists
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket(propertyVideoStorage.BUCKET_NAME);

    if (bucketError) {
      if (bucketError.message.includes('not found')) {
        console.log(`Video bucket '${propertyVideoStorage.BUCKET_NAME}' not found. Creating...`);
        
        // Create the bucket
        const { error: createError } = await supabase
          .storage
          .createBucket(propertyVideoStorage.BUCKET_NAME, {
            public: true, // Make bucket publicly accessible
            fileSizeLimit: propertyVideoStorage.MAX_FILE_SIZE, // 2GB
            allowedMimeTypes: propertyVideoStorage.ALLOWED_FORMATS
          });

        if (createError) {
          result.errors.push(`Failed to create video bucket: ${createError.message}`);
          return result;
        }

        result.bucketCreated = true;
        console.log(`Video bucket '${propertyVideoStorage.BUCKET_NAME}' created successfully`);
      } else {
        result.errors.push(`Error checking video bucket: ${bucketError.message}`);
        return result;
      }
    } else {
      result.bucketExists = true;
      console.log(`Video bucket '${propertyVideoStorage.BUCKET_NAME}' already exists`);
    }

    // Validate bucket configuration
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      result.warnings.push(`Could not verify bucket configuration: ${listError.message}`);
    } else {
      const videoBucket = buckets.find(b => b.name === propertyVideoStorage.BUCKET_NAME);
      if (videoBucket) {
        console.log('Video bucket configuration:', {
          name: videoBucket.name,
          public: videoBucket.public,
          file_size_limit: videoBucket.file_size_limit,
          allowed_mime_types: videoBucket.allowed_mime_types
        });

        // Check if configuration matches our requirements
        if (!videoBucket.public) {
          result.warnings.push('Video bucket is not public - videos may not be accessible');
        }

        if (videoBucket.file_size_limit && videoBucket.file_size_limit < propertyVideoStorage.MAX_FILE_SIZE) {
          result.warnings.push(`Video bucket file size limit (${videoBucket.file_size_limit}) is less than required (${propertyVideoStorage.MAX_FILE_SIZE})`);
        }
      }
    }

    result.success = true;
    console.log('Video storage initialization completed successfully');

  } catch (error) {
    console.error('Video storage initialization failed:', error);
    result.errors.push(error instanceof Error ? error.message : 'Unknown error during video storage setup');
  }

  return result;
}

/**
 * Validate that a property can accept video uploads
 */
export async function validatePropertyForVideoUpload(propertyId: string): Promise<{
  canUpload: boolean;
  hasExistingVideo: boolean;
  error?: string;
}> {
  try {
    // Check if property exists
    const { data: property, error: fetchError } = await supabase
      .from('properties_v2')
      .select('property_details, owner_id')
      .eq('id', propertyId)
      .single();

    if (fetchError) {
      return {
        canUpload: false,
        hasExistingVideo: false,
        error: 'Property not found'
      };
    }

    // Check if property already has a video
    const propertyDetails = property?.property_details || {};
    const existingVideo = propertyDetails.media?.videos;
    const hasExistingVideo = !!(existingVideo?.url);

    return {
      canUpload: true,
      hasExistingVideo,
      error: undefined
    };

  } catch (error) {
    return {
      canUpload: false,
      hasExistingVideo: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

/**
 * Get video data for a property
 */
export async function getPropertyVideoData(propertyId: string): Promise<{
  videoData: {
    url: string;
    fileName: string;
    thumbnailUrl?: string;
    uploadedAt: string;
    fileSize: number;
  } | null;
  error?: string;
}> {
  try {
    const { data: property, error: fetchError } = await supabase
      .from('properties_v2')
      .select('property_details')
      .eq('id', propertyId)
      .single();

    if (fetchError) {
      return {
        videoData: null,
        error: 'Property not found'
      };
    }

    const propertyDetails = property?.property_details || {};
    const videoData = propertyDetails.media?.videos || null;

    return {
      videoData,
      error: undefined
    };

  } catch (error) {
    return {
      videoData: null,
      error: error instanceof Error ? error.message : 'Unknown error fetching video data'
    };
  }
}

/**
 * Clean up orphaned video files (videos in storage but not in database)
 * This is an admin utility function
 */
export async function cleanupOrphanedVideos(): Promise<{
  cleaned: number;
  errors: string[];
}> {
  const result = {
    cleaned: 0,
    errors: []
  };

  try {
    // List all files in video bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from(propertyVideoStorage.BUCKET_NAME)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      result.errors.push(`Failed to list video files: ${listError.message}`);
      return result;
    }

    if (!files || files.length === 0) {
      console.log('No video files found in storage');
      return result;
    }

    // Get all properties with videos
    const { data: properties, error: propertiesError } = await supabase
      .from('properties_v2')
      .select('id, property_details')
      .not('property_details->media->videos', 'is', null);

    if (propertiesError) {
      result.errors.push(`Failed to fetch properties with videos: ${propertiesError.message}`);
      return result;
    }

    // Create a set of all video file names that should exist
    const validVideoFiles = new Set<string>();
    properties?.forEach(property => {
      const videoFileName = property.property_details?.media?.videos?.fileName;
      if (videoFileName) {
        validVideoFiles.add(videoFileName);
      }
    });

    // Check each file in storage
    for (const file of files) {
      if (file.name && !validVideoFiles.has(file.name)) {
        // This file is orphaned, delete it
        const { error: deleteError } = await supabase
          .storage
          .from(propertyVideoStorage.BUCKET_NAME)
          .remove([file.name]);

        if (deleteError) {
          result.errors.push(`Failed to delete orphaned file ${file.name}: ${deleteError.message}`);
        } else {
          result.cleaned++;
          console.log(`Cleaned up orphaned video file: ${file.name}`);
        }
      }
    }

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error during cleanup');
  }

  return result;
}

/**
 * Get video storage statistics
 */
export async function getVideoStorageStats(): Promise<{
  totalVideos: number;
  totalStorageUsed: number; // in bytes
  averageFileSize: number;
  bucketExists: boolean;
  error?: string;
}> {
  try {
    // Check if bucket exists
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .getBucket(propertyVideoStorage.BUCKET_NAME);

    if (bucketError) {
      return {
        totalVideos: 0,
        totalStorageUsed: 0,
        averageFileSize: 0,
        bucketExists: false,
        error: bucketError.message
      };
    }

    // List all files in bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from(propertyVideoStorage.BUCKET_NAME)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (listError) {
      return {
        totalVideos: 0,
        totalStorageUsed: 0,
        averageFileSize: 0,
        bucketExists: true,
        error: listError.message
      };
    }

    const totalVideos = files?.length || 0;
    const totalStorageUsed = files?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;
    const averageFileSize = totalVideos > 0 ? Math.round(totalStorageUsed / totalVideos) : 0;

    return {
      totalVideos,
      totalStorageUsed,
      averageFileSize,
      bucketExists: true
    };

  } catch (error) {
    return {
      totalVideos: 0,
      totalStorageUsed: 0,
      averageFileSize: 0,
      bucketExists: false,
      error: error instanceof Error ? error.message : 'Unknown error getting storage stats'
    };
  }
}