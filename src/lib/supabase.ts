// src/lib/supabase.ts
// Version: 1.3.0
// Last Modified: 21-02-2025 15:30 IST

import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Required Supabase configuration is missing. Check your environment variables.');
}

// Regular client for normal operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
    }
  }
) : supabase; // Fallback to regular client if service key is not available

// Enhanced auth state monitoring
supabase.auth.onAuthStateChange((event, session) => {
  if (import.meta.env.DEV) {
    console.log('Auth state changed:', {
      event,
      userId: session?.user?.id,
      email: session?.user?.email,
      lastSignIn: session?.user?.last_sign_in_at,
      provider: session?.user?.app_metadata?.provider,
      timestamp: new Date().toISOString()
    });
  }

  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('bhoomitalli-user-data');
    localStorage.removeItem('bhoomitalli-admin-token');
  }
});

// Initialize auth state
supabase.auth.getSession().then(({ data: { session }, error }) => {
  if (import.meta.env.DEV) {
    console.log('Initial auth state:', {
      hasSession: !!session,
      error: error?.message,
      userId: session?.user?.id,
      timestamp: new Date().toISOString()
    });
  }
});

export type SupabaseClient = typeof supabase;