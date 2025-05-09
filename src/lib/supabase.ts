// src/lib/supabase.ts
// Version: 2.8.0
// Last Modified: 09-05-2025 21:00 IST
// Purpose: Added storage bucket helpers for property images

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not defined in environment variables');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is not defined in environment variables');
}

// Simplified fetch handler that properly handles FormData
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}): Promise<Response> => {
  // For FormData, we need to REMOVE Content-Type header completely
  if (options.body instanceof FormData) {
    const newOptions = { ...options };
    // Create new headers without Content-Type
    const headers = new Headers(newOptions.headers || {});
    headers.delete('Content-Type');
    
    // Log for debugging
    console.log('FormData detected - removed Content-Type header');
    
    // Apply modified headers
    newOptions.headers = headers;
    return fetch(url, newOptions);
  }
  
  // For regular requests, proceed normally
  return fetch(url, options);
};

// Supabase client options with simplified configuration
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
  },
  global: {
    fetch: customFetch
  },
  storage: {
    // Important for file uploads
    multipart: true
  }
};

// Create and export the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
);

// Create an admin client
export const adminSupabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
);

// Initialize auth state
(function initializeAuth() {
  supabase.auth.getSession().catch(error => {
    console.warn('Session initialization warning:', error instanceof Error ? error.message : 'Unknown error');
  });
})();

// Direct file upload helper
export const directFileUpload = async (
  bucket: string,
  path: string,
  file: File,
  options?: { cacheControl?: string }
): Promise<{ publicUrl: string | null; error: Error | null }> => {
  try {
    // Get auth session
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token || supabaseAnonKey;
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Add cache control if specified
    if (options?.cacheControl) {
      formData.append('cacheControl', options.cacheControl);
    }
    
    // Direct API call - explicitly NOT setting Content-Type
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${path}`, 
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
          // Critically, NO Content-Type header
        },
        body: formData
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Upload failed: ${response.status} - ${errorData.error}`);
    }
    
    // Get public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
    return { publicUrl, error: null };
  } catch (error) {
    console.error('Direct file upload failed:', error);
    return { publicUrl: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
};

// Specialized helper for property images
export const propertyImageStorage = {
  // Constants
  BUCKET_NAME: 'property-images-v2',
  
  // Upload property image to storage
  uploadImage: async (propertyId: string, file: File): Promise<{ fileName: string; url: string | null; error: Error | null }> => {
    try {
      // Generate a unique filename with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `${timestamp}_${randomString}.${fileExtension}`;
      
      // Full path where the file will be stored
      const filePath = `${propertyId}/${fileName}`;
      
      // Check if bucket exists, create if it doesn't
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket(propertyImageStorage.BUCKET_NAME);
        
      if (bucketError && bucketError.message.includes('not found')) {
        console.log(`Creating bucket: ${propertyImageStorage.BUCKET_NAME}`);
        const { error: createError } = await supabase
          .storage
          .createBucket(propertyImageStorage.BUCKET_NAME, {
            public: true, // Make bucket publicly accessible
            fileSizeLimit: 5242880, // 5MB
          });
          
        if (createError) {
          throw new Error(`Failed to create storage bucket: ${createError.message}`);
        }
      }
      
      // Upload file
      const { data, error } = await supabase
        .storage
        .from(propertyImageStorage.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600', // 1 hour cache
          upsert: true
        });
        
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from(propertyImageStorage.BUCKET_NAME)
        .getPublicUrl(filePath);
        
      return {
        fileName,
        url: urlData.publicUrl,
        error: null
      };
    } catch (error) {
      console.error('Property image upload failed:', error);
      return {
        fileName: '',
        url: null,
        error: error instanceof Error ? error : new Error('Unknown error during upload')
      };
    }
  },
  
  // Get URL for a property image
  getImageUrl: (propertyId: string, fileName: string): string => {
    const filePath = `${propertyId}/${fileName}`;
    const { data } = supabase
      .storage
      .from(propertyImageStorage.BUCKET_NAME)
      .getPublicUrl(filePath);
      
    return data.publicUrl;
  },
  
  // Generate full URLs for all property images
  getPropertyImageUrls: (propertyId: string, fileNames: string[]): string[] => {
    return fileNames.map(fileName => 
      propertyImageStorage.getImageUrl(propertyId, fileName)
    );
  }
};

// Export required types and utilities
export type { Database } from './database.types';
export type Json = Database['public']['Json'];
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Error handling utility
export const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

export const handleSupabaseError = (error: unknown): string => {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// User admin status check utility
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check metadata for admin role
    const isAdminByMetadata = 
      user.user_metadata?.is_admin === true || 
      user.user_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'super_admin';

    if (isAdminByMetadata) return true;

    // Check admin_users table
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role_id')
      .eq('user_id', user.id)
      .single();

    return !!adminData;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Export error type for handling
export type SupabaseError = {
  message: string;
  details: string;
  hint: string;
  code: string;
};