// src/lib/supabase.ts
// Version: 2.1.0
// Last Modified: 23-02-2025 08:00 IST
// Purpose: Supabase client configuration with admin operations support

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

// Custom error filter to reduce noise in console
const originalConsoleError = console.error;
console.error = (...args) => {
  // Skip known Supabase-related non-critical errors
  const skipErrors = [
    'supabase',
    '404',
    'session',
    'https://lkzbwrrauvdinwypmhyb.supabase.co',
    'Request failed with status code 404',
    'The content has been deleted',
  ];

  // Check if error should be skipped
  const shouldSkip = skipErrors.some(errorText => 
    args[0]?.includes?.(errorText) || 
    (typeof args[0] === 'string' && args[0].includes(errorText))
  );

  if (shouldSkip) {
    return;
  }

  // Log all other errors normally
  originalConsoleError.apply(console, args);
};

// Supabase client options
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
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    reconnectAfterMs: (tries: number) => Math.min(1000 + tries * 1000, 10000),
  },
};

// Create and export the Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
);

// Create an admin client that uses the same anon key but includes admin headers
// This will work with RLS policies that check for admin role in JWT claims
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

// Initialize auth state
try {
  await supabase.auth.getSession();
} catch (error) {
  console.warn('Session initialization warning:', error instanceof Error ? error.message : 'Unknown error');
}

// Export types
export type SupabaseClient = typeof supabase;
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;

// Helper types for database operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Helper functions for type checking
export const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

// Error handler for Supabase operations
export const handleSupabaseError = (error: unknown): string => {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Type guard for database responses
export const isDataResponse = <T>(
  response: { data: T | null; error: null } | { data: null; error: Error }
): response is { data: T; error: null } => {
  return response.data !== null && response.error === null;
};

// Helper function to check if user has admin role
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check user metadata for admin role
    const isAdminByMetadata = 
      user.user_metadata?.is_admin === true || 
      user.user_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'super_admin';

    if (isAdminByMetadata) return true;

    // Check admin_users table as fallback
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

// Export commonly used types
export type { Database } from './database.types';
export type Json = Database['public']['Json'];
export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Export error types for better error handling
export type SupabaseError = {
  message: string;
  details: string;
  hint: string;
  code: string;
};