// src/lib/supabase.ts
// Version: 2.6.0
// Last Modified: 06-04-2025 15:30 IST
// Purpose: Advanced Supabase client configuration with robust error handling and network resilience

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

// Advanced fetch interceptor with comprehensive error handling
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  // Create a new Headers object to avoid mutation
  const headers = new Headers(options.headers);

  // Comprehensive header management
  headers.set('Accept', 'application/json');
  headers.set('Accept-Charset', 'utf-8');
  
  // Do not override content-type for auth-related endpoints to avoid 403 errors
  const urlString = String(url);
  const isAuthEndpoint = urlString.includes('/auth/') || urlString.includes('/token');
  
  // Only set Content-Type if not an auth endpoint and not FormData
  if (!isAuthEndpoint && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Add custom client identifier
  headers.set('x-client-info', 'bhoomitalli-web-client');

  // Advanced error logging and retry mechanism
  const fetchWithRetry = async (retriesLeft = 2): Promise<Response> => {
    try {
      const response = await fetch(url, { ...options, headers });
      
      // Log detailed request information for debugging (only in development)
      if (import.meta.env.DEV) {
        console.log('API Request Details:', {
          url: String(url),
          method: options.method || 'GET',
          status: response.status,
          isAuthEndpoint
        });
      }

      // Special handling for auth endpoints - don't retry authentication endpoints
      // as this can lead to account lockouts
      if (!response.ok) {
        if (response.status === 406 && retriesLeft > 0 && !isAuthEndpoint) {
          console.warn(`Not Acceptable Error (406). Retrying... (${retriesLeft} attempts left)`);
          return fetchWithRetry(retriesLeft - 1);
        }

        // Log the error but don't throw for auth endpoints - let Supabase handle these errors
        if (isAuthEndpoint) {
          console.warn(`Auth endpoint returned status: ${response.status}`);
          return response; // Return the response to let Supabase handle it
        }

        // Throw error for non-successful responses on non-auth endpoints
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      // Avoid retrying auth endpoints
      if (isAuthEndpoint) {
        console.error('Auth endpoint error:', {
          url: String(url),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error; // Don't retry auth errors
      }

      console.error('Fetch Request Failed:', {
        url: String(url),
        method: options.method || 'GET',
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Retry mechanism for network errors on non-auth endpoints
      if (retriesLeft > 0) {
        console.warn(`Network error. Retrying... (${retriesLeft} attempts left)`);
        return fetchWithRetry(retriesLeft - 1);
      }

      throw error;
    }
  };

  return fetchWithRetry();
};

// Supabase client options with enhanced configuration
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
    storage: window.localStorage,
    storageKey: 'bhoomitalli-auth-token',
  },
  global: {
    headers: {
      'x-client-info': 'bhoomitalli-web-client',
      'Accept': 'application/json',
    },
    fetch: customFetch
  },
  db: {
    schema: 'public',
  },
  realtime: {
    reconnectAfterMs: (tries: number) => Math.min(1000 + tries * 1000, 10000),
  },
  storage: {
    multipart: true
  }
};

// Create and export the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
);

// Create an admin client with enhanced headers
export const adminSupabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    ...supabaseOptions,
    global: {
      ...supabaseOptions.global,
      headers: {
        ...supabaseOptions.global.headers,
        'x-client-info': 'bhoomitalli-admin-client',
      }
    }
  }
);

// Initialize auth state with more comprehensive error handling
(function initializeAuth() {
  const initSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.warn('Session initialization warning:', error.message);
      }

      // Optional: Additional session validation logic can be added here
    } catch (error) {
      console.error('Unexpected error during session initialization:', error);
    }
  };

  initSession();
})();

// Comprehensive error handling utilities
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

// Detailed error logging with enhanced context
export const logSupabaseError = (context: string, error: any) => {
  console.error(`[${context}] Supabase Error:`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    status: error?.status
  });
};

// User admin status check with comprehensive validation
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const isAdminByMetadata = 
      user.user_metadata?.is_admin === true || 
      ['admin', 'super_admin'].includes(user.user_metadata?.role);

    if (isAdminByMetadata) return true;

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

// Export commonly used types and utilities
export type { Database } from './database.types';
export type Json = Database['public']['Json'];
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

export type SupabaseError = {
  message: string;
  details: string;
  hint: string;
  code: string;
};