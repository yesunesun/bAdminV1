// src/lib/supabase.ts
// Version: 1.2.6
// Last Modified: 12-02-2025 17:00 IST

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced debug logging
console.log('Environment Check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseKey: !!supabaseKey,
  isDevelopment: import.meta.env.DEV,
  baseUrl: window.location.origin,
});

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseKey ? 'Set' : 'Missing'
  });
  throw new Error('Required Supabase configuration is missing. Check your environment variables.');
}

// Create client with enhanced config
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: import.meta.env.DEV,
    storage: window.localStorage,
    storageKey: 'bhoomitalli-auth-token',
    redirectTo: `${window.location.origin}/auth/callback`
  },
  global: {
    headers: {
      'x-client-info': 'bhoomitalli-web'
    }
  }
});

// Enhanced auth state monitoring
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', {
    event,
    userId: session?.user?.id,
    email: session?.user?.email,
    lastSignIn: session?.user?.last_sign_in_at,
    provider: session?.user?.app_metadata?.provider,
    timestamp: new Date().toISOString()
  });

  if (event === 'SIGNED_OUT') {
    // Clear any local storage items if needed
    localStorage.removeItem('bhoomitalli-user-data');
  }
});

// Initialize auth state immediately
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log('Initial auth state:', {
    hasSession: !!session,
    error: error?.message,
    userId: session?.user?.id,
    timestamp: new Date().toISOString()
  });
});

export type SupabaseClient = typeof supabase;