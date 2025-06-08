// src/lib/supabase.ts
// Version: 1.4.0
// Last Modified: 27-05-2025 11:00 IST
// Purpose: Complete Supabase configuration with admin client and video storage

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular client for general use
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Admin client with service role key for admin operations
export const adminSupabase = createClient<Database>(
  supabaseUrl, 
  supabaseServiceRoleKey || supabaseAnonKey, // Fallback to anon key if service role not available
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Storage bucket constants
export const STORAGE_BUCKETS = {
  PROPERTY_IMAGES: 'property-images-v2',
  PROPERTY_VIDEOS: 'property-videos-v2'
};

// Video storage utilities
export const propertyVideoStorage = {
  ALLOWED_FORMATS: ['video/mp4', 'video/mov', 'video/avi', 'video/webm'],
  MAX_FILE_SIZE: 2 * 1024 * 1024 * 1024, // 2GB
  
  validateVideoFile: (file: File) => {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (!propertyVideoStorage.ALLOWED_FORMATS.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Invalid file format. Please use MP4, MOV, AVI, or WebM' 
      };
    }

    if (file.size > propertyVideoStorage.MAX_FILE_SIZE) {
      const sizeMB = Math.round(file.size / (1024 * 1024));
      const maxSizeMB = Math.round(propertyVideoStorage.MAX_FILE_SIZE / (1024 * 1024));
      return { 
        isValid: false, 
        error: `File size (${sizeMB}MB) exceeds the ${maxSizeMB}MB limit` 
      };
    }

    return { isValid: true, error: null };
  },

  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  generateThumbnail: async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Seek to 1 second or 10% of video duration
        video.currentTime = Math.min(1, video.duration * 0.1);
      });

      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
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
  },

  // Check if video storage bucket exists
  initializeVideoStorage: async () => {
    try {
      console.log('[VideoStorage] Checking if property-videos-v2 bucket exists...');
      
      // Try to list files in the bucket (this will fail if bucket doesn't exist)
      const { error: listError } = await supabase.storage
        .from('property-videos-v2')
        .list('', { limit: 1 });

      if (listError) {
        console.log('[VideoStorage] Bucket does not exist or is not accessible:', listError.message);
        console.log('[VideoStorage] Video upload will use fallback storage method');
        return false;
      }

      console.log('[VideoStorage] Property-videos-v2 bucket is accessible');
      return true;
    } catch (error) {
      console.error('[VideoStorage] Error checking video bucket:', error);
      return false;
    }
  }
};