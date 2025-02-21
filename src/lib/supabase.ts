// src/lib/supabase.ts
// Version: 1.3.5
// Last Modified: 21-02-2025 20:00 IST

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Filter out Supabase HTTP errors from console
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out specific Supabase-related errors
  if (
    args[0]?.includes?.('supabase') ||
    args[0]?.includes?.('404') ||
    args[0]?.includes?.('session') ||
    (typeof args[0] === 'string' && args[0].includes('https://lkzbwrrauvdinwypmhyb.supabase.co'))
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Required Supabase configuration is missing. Check your environment variables.');
}

// Regular client for normal operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false,
    storage: window.localStorage,
    storageKey: 'bhoomitalli-auth-token',
    redirectTo: `${window.location.origin}/auth/callback`
  },
  global: {
    headers: {
      'x-client-info': 'bhoomitalli-web'
    }
  },
  logger: {
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {}
  }
});

// Admin client with service role key for admin operations
export const adminSupabase = supabaseServiceKey ? createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storage: window.localStorage,
      storageKey: 'bhoomitalli-admin-token'
    },
    global: {
      headers: {
        'x-client-info': 'bhoomitalli-admin'
      }
    },
    logger: {
      debug: () => {},
      info: () => {},
      warn: () => {},
      error: () => {}
    }
  }
) : supabase;

// Simplified auth state monitoring
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('bhoomitalli-user-data');
    localStorage.removeItem('bhoomitalli-admin-token');
  }
});

// Initialize auth state
supabase.auth.getSession().catch(() => {
  // Silently handle session initialization errors
});

export type SupabaseClient = typeof supabase;